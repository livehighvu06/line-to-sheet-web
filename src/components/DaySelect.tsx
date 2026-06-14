import type { Day } from "../lib/parser";

interface Props {
  days: Day[];
  value: number | null;
  onChange: (idx: number) => void;
  onRun: () => void;
}

/** 起始日期下拉選單 + 「整理」按鈕。 */
export default function DaySelect({ days, value, onChange, onRun }: Props) {
  const hasDays = days.length > 0;

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-base font-semibold">2. 選擇起始日期</h2>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="day" className="text-sm text-slate-500">
          從這天開始（到最後）：
        </label>
        <select
          id="day"
          value={value ?? ""}
          disabled={!hasDays}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:opacity-50"
        >
          {hasDays ? (
            days.map((d) => (
              <option key={d.idx} value={d.idx}>
                {d.date}
              </option>
            ))
          ) : (
            <option value="">— 請先貼上內容 —</option>
          )}
        </select>
        <button
          type="button"
          onClick={onRun}
          disabled={!hasDays}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          整理
        </button>
      </div>
    </section>
  );
}
