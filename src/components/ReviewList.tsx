import type { Order } from "../lib/parser";

interface Props {
  rows: Order[];
}

/** 需人工確認清單（C 欄以「團」替代、或人數非純數字者）。 */
export default function ReviewList({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-4 text-[13px]">
      <h3 className="mb-2 text-sm font-semibold text-orange-800">
        ⚠️ 需人工確認 {rows.length} 筆（C 欄以「團」替代、或人數非純數字，請覆核）
      </h3>
      <div>
        {rows.map((o, i) => (
          <div key={i} className="border-b border-dashed border-orange-200 py-1.5 last:border-b-0">
            <div>{`${o.date} | ${o.airline} | ${o.trip} | ${o.qty} | ${o.name}`}</div>
            <div className="font-mono text-slate-500">原文：{o.raw}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
