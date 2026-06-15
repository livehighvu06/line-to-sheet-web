import type { Day } from "../lib/parser";
import StepHeading from "./StepHeading";
import { btnAccent } from "./buttonStyles";

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
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <StepHeading step={2} title="選擇起始日期" />
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="day" className="text-sm text-slate-500">
          從這天開始（到最後）：
        </label>
        <select
          id="day"
          value={value ?? ""}
          disabled={!hasDays}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm transition-colors focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
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
        <button type="button" onClick={onRun} disabled={!hasDays} className={btnAccent}>
          整理
        </button>
      </div>
    </section>
  );
}
