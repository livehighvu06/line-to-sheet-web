import type { Order } from "../lib/parser";

interface Props {
  orders: Order[];
}

const HEADERS = ["#", "B 出發日期", "C 航空", "D 地點／團名", "F 人數", "J 姓名"];

/** 訂單預覽表；需確認列以橘底標示。 */
export default function PreviewTable({ orders }: Props) {
  return (
    <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-left font-semibold whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o, n) => (
            <tr key={n} className={o.review ? "bg-orange-50" : undefined}>
              <td className="border-b border-slate-100 px-3 py-1.5 whitespace-nowrap text-slate-400 tabular-nums">
                {n + 1}
              </td>
              <td className="border-b border-slate-100 px-3 py-1.5 whitespace-nowrap tabular-nums">{o.date}</td>
              <td className="border-b border-slate-100 px-3 py-1.5 whitespace-nowrap">{o.airline}</td>
              <td className="border-b border-slate-100 px-3 py-1.5 whitespace-nowrap">{o.trip}</td>
              <td className="border-b border-slate-100 px-3 py-1.5 whitespace-nowrap tabular-nums">{o.qty}</td>
              <td className="border-b border-slate-100 px-3 py-1.5 whitespace-nowrap">{o.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
