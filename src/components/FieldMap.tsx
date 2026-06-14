const ROWS: [string, string, string][] = [
  ["B", "出發日期", "8/19"],
  ["C", "航空", "樂桃（無航空則填「團」）"],
  ["D", "地點／團名", "東京5日來回機票"],
  ["F", "報名人數", "9"],
  ["J", "姓名", "lin-東京（最後一組括號內的標籤）"],
];

/** 欄位對應說明表。 */
export default function FieldMap() {
  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-base font-semibold">欄位對應</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-1 pr-4 font-medium">欄</th>
            <th className="py-1 pr-4 font-medium">標題</th>
            <th className="py-1 font-medium">
              範例（<code className="rounded bg-slate-100 px-1">8/19樂桃東京5日來回機票（lin-東京）9位</code>）
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([col, title, ex]) => (
            <tr key={col} className="border-t border-slate-100">
              <td className="py-1 pr-4 font-mono">{col}</td>
              <td className="py-1 pr-4">{title}</td>
              <td className="py-1">{ex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
