import { useState } from "react";
import Tabs, { type TabItem } from "./components/Tabs";
import LineToSheetTab from "./components/LineToSheetTab";

/** 佔位分頁：未來新功能替換此處即可。 */
function ComingSoon() {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      更多工具規劃中，敬請期待。
    </section>
  );
}

const tabs: TabItem[] = [
  { id: "line-to-sheet", label: "LINE 名單轉表格", content: <LineToSheetTab /> },
  { id: "coming-soon", label: "更多功能（規劃中）", content: <ComingSoon /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16">
        <h1 className="mb-5 text-2xl font-bold">新飛趣工具箱</h1>
        <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
      </main>
    </div>
  );
}
