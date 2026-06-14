/**
 * 刷卡對帳核心邏輯。
 *
 * 用業績表的「姓名」（J 欄）對到 LinkPay「付款名稱」訂單描述裡的括號標籤，
 * 取出該筆「交易金額」回填業績表的金額欄（G）。
 *
 * 比對鍵＝日期＋航空＋姓名（標籤）；LinkPay 先依訂單號去重、只取付款成功。
 * 同一鍵有多筆（分次刷卡）時，依金額排序與業績表同鍵多列逐一對應，數量不符則列入需確認。
 */
import * as XLSX from "xlsx";
import { parseOrder } from "./parser";

export type RowStatus = "filled" | "review" | "none";

export interface ReconcileRow {
  sheetRow: number; // 0-based 工作表列索引（含標題列），寫回用
  name: string;
  date: string;
  airline: string;
  trip: string;
  originalAmount: string;
  matchedAmount: number | null;
  status: RowStatus;
  note?: string;
}

export interface ReconcileResult {
  rows: ReconcileRow[];
  filledCount: number;
  reviewCount: number;
  noneCount: number;
  unmatchedLink: string[]; // LinkPay 付款成功但業績表查無
  workbook: XLSX.WorkBook; // 業績表（供寫回下載）
  sheetName: string;
  amountCol: number; // 金額欄 0-based
}

interface LinkTxn {
  amount: number;
  raw: string;
}

/** 讀檔成 SheetJS 工作簿（支援 .xls / .xlsx）。 */
export function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(XLSX.read(reader.result as ArrayBuffer, { type: "array" }));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/\s+/g, "").trim();

function keyOf(date: string, airline: string, name: string): string {
  return [norm(date), norm(airline), norm(name)].join("|");
}

/** 取金額數字（去千分位逗號、貨幣符號）。 */
function toAmount(v: unknown): number {
  return Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
}

/** Excel 日期序號或文字 → M/D。 */
function toMonthDay(v: unknown): string {
  const n = Number(v);
  if (!isNaN(n) && n > 1000) {
    const d = XLSX.SSF.parse_date_code(n);
    if (d) return `${d.m}/${d.d}`;
  }
  const m = /(\d{1,2})\/(\d{1,2})/.exec(String(v ?? ""));
  return m ? `${+m[1]}/${+m[2]}` : String(v ?? "");
}

/** 在標題列找第一個符合 predicate 的欄位 index，找不到回傳 fallback。 */
function findCol(header: unknown[], predicate: (h: string) => boolean, fallback: number): number {
  const idx = header.findIndex((h) => predicate(String(h ?? "")));
  return idx >= 0 ? idx : fallback;
}

function sheetRows(ws: XLSX.WorkSheet): { rows: unknown[][]; startRow: number } {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false });
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  return { rows, startRow: range.s.r };
}

/** 由 LinkPay 工作簿建立「比對鍵 → 交易清單」索引。 */
function indexLinkPay(wb: XLSX.WorkBook): {
  groups: Map<string, LinkTxn[]>;
  rawByKey: Map<string, string>;
} {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const { rows } = sheetRows(ws);
  const header = rows[0] ?? [];
  const descCol = findCol(header, (h) => h.includes("付款名稱"), 4);
  const amountCol = findCol(header, (h) => h.includes("交易金額") || h.includes("金額"), 6);
  const statusCol = findCol(header, (h) => h.includes("付款狀態"), 8);
  const idCol = findCol(header, (h) => h.includes("訂單號碼"), 3);

  const groups = new Map<string, LinkTxn[]>();
  const rawByKey = new Map<string, string>();
  const seenId = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const id = String(r[idCol] ?? "");
    if (id && seenId.has(id)) continue; // 依訂單號去重（避免重複列金額翻倍）
    if (id) seenId.add(id);
    if (String(r[statusCol] ?? "") !== "付款成功") continue;

    const desc = String(r[descCol] ?? "");
    const order = parseOrder(desc);
    if (!order) continue; // 無括號標籤者略過（無法以姓名比對）
    const key = keyOf(order.date, order.airline, order.name);
    const list = groups.get(key) ?? [];
    list.push({ amount: toAmount(r[amountCol]), raw: desc });
    groups.set(key, list);
    if (!rawByKey.has(key)) rawByKey.set(key, desc);
  }
  return { groups, rawByKey };
}

/** 執行對帳。 */
export function reconcile(perfWb: XLSX.WorkBook, linkWb: XLSX.WorkBook): ReconcileResult {
  const { groups: linkGroups, rawByKey } = indexLinkPay(linkWb);

  const sheetName = perfWb.SheetNames[0];
  const ws = perfWb.Sheets[sheetName];
  const { rows, startRow } = sheetRows(ws);
  const header = rows[0] ?? [];
  const dateCol = findCol(header, (h) => h.includes("出發"), 1);
  const airlineCol = findCol(header, (h) => h.includes("航空"), 2);
  const tripCol = findCol(header, (h) => h.includes("團名") || h.includes("地點"), 3);
  const amountCol = findCol(header, (h) => h.includes("金額"), 6);
  const nameCol = findCol(header, (h) => h.includes("姓名"), 9);

  // 蒐集有姓名的資料列，並依比對鍵分組
  const dataRows: ReconcileRow[] = [];
  const byKey = new Map<string, ReconcileRow[]>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[nameCol]) continue;
    const row: ReconcileRow = {
      sheetRow: startRow + i,
      name: String(r[nameCol]),
      date: toMonthDay(r[dateCol]),
      airline: String(r[airlineCol] ?? ""),
      trip: String(r[tripCol] ?? ""),
      originalAmount: String(r[amountCol] ?? ""),
      matchedAmount: null,
      status: "none",
    };
    dataRows.push(row);
    const key = keyOf(row.date, row.airline, row.name);
    const g = byKey.get(key) ?? [];
    g.push(row);
    byKey.set(key, g);
  }

  // 逐鍵比對
  const usedKeys = new Set<string>();
  for (const [key, group] of byKey) {
    const txns = linkGroups.get(key);
    if (!txns) continue; // 業績表有、LinkPay 無 → 維持 none（查無）
    usedKeys.add(key);
    if (txns.length === group.length) {
      // 數量一致：依金額排序逐一對應
      const amounts = txns.map((t) => t.amount).sort((a, b) => a - b);
      const sortedRows = [...group].sort((a, b) => toAmount(a.originalAmount) - toAmount(b.originalAmount));
      sortedRows.forEach((row, idx) => {
        row.matchedAmount = amounts[idx];
        row.status = "filled";
      });
    } else {
      // 數量不符 → 需確認，不自動回填
      for (const row of group) {
        row.status = "review";
        row.note = `LinkPay ${txns.length} 筆／業績表 ${group.length} 列，數量不符`;
      }
    }
  }

  // LinkPay 有成功、業績表查無者
  const unmatchedLink: string[] = [];
  for (const [key, raw] of rawByKey) {
    if (!usedKeys.has(key)) unmatchedLink.push(raw);
  }

  const filledCount = dataRows.filter((r) => r.status === "filled").length;
  const reviewCount = dataRows.filter((r) => r.status === "review").length;
  const noneCount = dataRows.filter((r) => r.status === "none").length;

  return {
    rows: dataRows,
    filledCount,
    reviewCount,
    noneCount,
    unmatchedLink,
    workbook: perfWb,
    sheetName,
    amountCol,
  };
}

/** 把已比對金額寫回業績表金額欄，回傳可下載的 xlsx Blob。 */
export function writeBack(result: ReconcileResult): Blob {
  const ws = result.workbook.Sheets[result.sheetName];
  for (const row of result.rows) {
    if (row.status !== "filled" || row.matchedAmount === null) continue;
    const addr = XLSX.utils.encode_cell({ r: row.sheetRow, c: result.amountCol });
    ws[addr] = { t: "n", v: row.matchedAmount };
  }
  const out = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * 產生可貼回金額欄的單欄文字：涵蓋第一筆到最後一筆姓名列之間的每一列，
 * 已比對者填新金額、其餘保留原值，貼上時對齊第一筆姓名所在列的金額欄。
 */
export function buildAmountColumn(result: ReconcileResult): string {
  if (result.rows.length === 0) return "";
  const first = result.rows[0].sheetRow;
  const last = result.rows[result.rows.length - 1].sheetRow;
  const byRow = new Map<number, ReconcileRow>();
  for (const r of result.rows) byRow.set(r.sheetRow, r);
  const lines: string[] = [];
  for (let r = first; r <= last; r++) {
    const row = byRow.get(r);
    if (row && row.status === "filled" && row.matchedAmount !== null) {
      lines.push(String(row.matchedAmount));
    } else {
      lines.push(row ? row.originalAmount : "");
    }
  }
  return lines.join("\n") + "\n";
}
