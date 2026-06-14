import { useCallback, useMemo, useState } from "react";
import {
  buildReview,
  buildTsv,
  extractOrders,
  indexDays,
  type Day,
  type Order,
} from "./lib/parser";
import { downloadText } from "./lib/download";
import ChatInput from "./components/ChatInput";
import DaySelect from "./components/DaySelect";
import ResultActions from "./components/ResultActions";
import PreviewTable from "./components/PreviewTable";
import ReviewList from "./components/ReviewList";
import FieldMap from "./components/FieldMap";
import Toast from "./components/Toast";

interface Result {
  startDate: string;
  orders: Order[];
  duplicates: number;
  reviewRows: Order[];
}

export default function App() {
  const [input, setInput] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [toast, setToast] = useState("");

  const lines = useMemo(() => input.split("\n"), [input]);
  const days = useMemo<Day[]>(() => indexDays(lines), [lines]);

  // 確保選取有效；days 變動時預設選第一天
  const effectiveIdx = useMemo(() => {
    if (days.length === 0) return null;
    if (selectedIdx !== null && days.some((d) => d.idx === selectedIdx)) {
      return selectedIdx;
    }
    return days[0].idx;
  }, [days, selectedIdx]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1600);
  }, []);

  const run = useCallback(() => {
    if (effectiveIdx === null) return;
    const startDate = days.find((d) => d.idx === effectiveIdx)!.date;
    const { orders, duplicates } = extractOrders(lines, effectiveIdx);
    setResult({
      startDate,
      orders,
      duplicates,
      reviewRows: orders.filter((o) => o.review),
    });
  }, [days, effectiveIdx, lines]);

  const copyTsv = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildTsv(result.orders));
      showToast("已複製，到試算表 B 欄貼上即可");
    } catch {
      showToast("複製失敗，請改用「下載 TSV」");
    }
  }, [result, showToast]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16">
        <h1 className="text-2xl font-bold">新飛趣名單 → Google Sheet 待貼上表格</h1>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          把 LINE 群組對話紀錄貼上，抽取訂單欄位，產生可直接貼進試算表的表格。
        </p>

        <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          🔒 所有處理都在你的瀏覽器內完成，對話內容與客戶資料
          <strong>不會上傳到任何伺服器</strong>。
        </p>

        <ChatInput value={input} onChange={setInput} />

        <DaySelect
          days={days}
          value={effectiveIdx}
          onChange={setSelectedIdx}
          onRun={run}
        />

        {result && (
          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-base font-semibold">3. 結果</h2>
            <p className="mb-1">
              從 <b className="text-blue-700">{result.startDate}</b> 起，去重後共{" "}
              <b className="text-blue-700">{result.orders.length}</b> 筆訂單（已略過{" "}
              {result.duplicates} 筆重複）。
            </p>
            <ResultActions
              onCopy={copyTsv}
              onDownloadTsv={() =>
                downloadText(`新飛趣_待貼上_${result.startDate}.tsv`, buildTsv(result.orders))
              }
              onDownloadReview={() =>
                downloadText(
                  `新飛趣_需確認_${result.startDate}.txt`,
                  buildReview(result.reviewRows),
                )
              }
              reviewCount={result.reviewRows.length}
            />
            <p className="mb-3 text-sm text-slate-500">
              貼上方式：開啟試算表 → 最後一筆資料下方第一個空列的 <b>B 欄</b> →
              貼上。A 欄與金額等財務欄位再自行補上。
            </p>
            <PreviewTable orders={result.orders} />
            <ReviewList rows={result.reviewRows} />
          </section>
        )}

        <FieldMap />
      </main>
      <Toast message={toast} />
    </div>
  );
}
