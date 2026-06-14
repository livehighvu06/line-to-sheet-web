import { useCallback, useState } from "react";
import {
  buildAmountColumn,
  readWorkbook,
  reconcile,
  writeBack,
  type ReconcileResult,
} from "../lib/reconcile";
import { downloadBlob } from "../lib/download";
import Toast from "./Toast";

const ghost =
  "cursor-pointer rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";
const fileInput =
  "cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 hover:file:bg-slate-200";

const STATUS_LABEL: Record<string, string> = {
  filled: "已填",
  review: "需確認",
  none: "查無",
};
const STATUS_STYLE: Record<string, string> = {
  filled: "bg-emerald-100 text-emerald-700",
  review: "bg-amber-100 text-amber-700",
  none: "bg-slate-100 text-slate-500",
};

/** 刷卡對帳功能頁：用業績表姓名查 LinkPay 交易金額並回填。 */
export default function ReconcileTab() {
  const [perfFile, setPerfFile] = useState<File | null>(null);
  const [linkFile, setLinkFile] = useState<File | null>(null);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  // 變更後重設原生 file input 的顯示（強制重新掛載）
  const [resetKey, setResetKey] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1600);
  }, []);

  const clearAll = useCallback(() => {
    setPerfFile(null);
    setLinkFile(null);
    setResult(null);
    setError("");
    setResetKey((k) => k + 1);
  }, []);

  const run = useCallback(async () => {
    if (!perfFile || !linkFile) return;
    setError("");
    try {
      const [perfWb, linkWb] = await Promise.all([
        readWorkbook(perfFile),
        readWorkbook(linkFile),
      ]);
      setResult(reconcile(perfWb, linkWb));
    } catch {
      setResult(null);
      setError("讀取或解析檔案失敗，請確認上傳的是業績表與 LinkPay 訂單查詢檔。");
    }
  }, [perfFile, linkFile]);

  const copyAmounts = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildAmountColumn(result));
      showToast("已複製，到業績表第一筆姓名列的金額欄貼上");
    } catch {
      showToast("複製失敗，請改用「下載回填後 xlsx」");
    }
  }, [result, showToast]);

  const downloadXlsx = useCallback(() => {
    if (!result) return;
    downloadBlob("業績表_已回填金額.xlsx", writeBack(result));
  }, [result]);

  const reviewRows = result?.rows.filter((r) => r.status === "review") ?? [];

  return (
    <>
      <h2 className="text-xl font-bold">刷卡對帳（LinkPay → 業績表）</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">
        用業績表的姓名，去 LinkPay 訂單查詢檔的「付款名稱」找出對應的交易金額，回填到業績表金額欄。
      </p>

      <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
        🔒 兩份檔案都只在你的瀏覽器內處理，<strong>不會上傳到任何伺服器</strong>。
      </p>

      <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold">1. 上傳兩份檔案</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="w-28 text-sm text-slate-500">業績表（.xlsx）</label>
            <input
              key={`perf-${resetKey}`}
              type="file"
              accept=".xlsx"
              onChange={(e) => setPerfFile(e.target.files?.[0] ?? null)}
              className={fileInput}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="w-28 text-sm text-slate-500">LinkPay 訂單（.xls／.xlsx）</label>
            <input
              key={`link-${resetKey}`}
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => setLinkFile(e.target.files?.[0] ?? null)}
              className={fileInput}
            />
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={run}
              disabled={!perfFile || !linkFile}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              對帳
            </button>
            {(perfFile || linkFile || result) && (
              <button type="button" onClick={clearAll} className={ghost}>
                清除
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </section>

      {result && (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold">2. 結果</h3>
          <p className="mb-1">
            共 <b className="text-blue-700">{result.rows.length}</b> 列，已回填{" "}
            <b className="text-emerald-700">{result.filledCount}</b> 筆，需確認{" "}
            <b className="text-amber-700">{result.reviewCount}</b> 筆，查無{" "}
            <b className="text-slate-500">{result.noneCount}</b> 筆。
          </p>

          <div className="my-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={copyAmounts}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              複製金額欄
            </button>
            <button type="button" onClick={downloadXlsx} className={ghost}>
              下載回填後 xlsx
            </button>
          </div>
          <p className="mb-3 text-sm text-slate-500">
            「複製金額欄」可無損貼回原試算表（對齊第一筆姓名列的金額欄）；下載 xlsx 為便利選項，
            可能不保留原始格式與公式。
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-1.5 pr-3">姓名</th>
                  <th className="py-1.5 pr-3">日期</th>
                  <th className="py-1.5 pr-3">航空</th>
                  <th className="py-1.5 pr-3 text-right">原金額</th>
                  <th className="py-1.5 pr-3 text-right">LinkPay 金額</th>
                  <th className="py-1.5">狀態</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.sheetRow} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{row.name}</td>
                    <td className="py-1.5 pr-3">{row.date}</td>
                    <td className="py-1.5 pr-3">{row.airline}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{row.originalAmount}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">
                      {row.matchedAmount ?? ""}
                    </td>
                    <td className="py-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLE[row.status]}`}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reviewRows.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="mb-1 font-semibold text-amber-800">需確認（{reviewRows.length}）</p>
              <ul className="list-disc pl-5 text-amber-800">
                {reviewRows.map((row) => (
                  <li key={row.sheetRow}>
                    {row.name}（{row.date} {row.airline}）— {row.note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.unmatchedLink.length > 0 && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="mb-1 font-semibold text-slate-600">
                LinkPay 有付款成功、但業績表查無（{result.unmatchedLink.length}）
              </p>
              <ul className="list-disc pl-5 text-slate-500">
                {result.unmatchedLink.map((raw, i) => (
                  <li key={i}>{raw}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Toast message={toast} />
    </>
  );
}
