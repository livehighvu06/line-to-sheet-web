import { lazy, Suspense } from "react";
import Tabs, { type TabItem } from "./components/Tabs";
import AppHeader from "./components/AppHeader";
import FloatingMascot from "./components/FloatingMascot";
import LineToSheetTab from "./components/LineToSheetTab";
import useHashRoute from "./hooks/useHashRoute";

// 刷卡對帳頁相依較重的 xlsx，延遲載入：開啟此分頁時才下載對應 chunk。
const ReconcileTab = lazy(() => import("./components/ReconcileTab"));

const Loading = () => <p className="text-sm text-slate-500">載入中…</p>;

const tabs: TabItem[] = [
  { id: "line-to-sheet", label: "LINE 名單轉表格", content: <LineToSheetTab /> },
  {
    id: "reconcile",
    label: "刷卡對帳",
    content: (
      <Suspense fallback={<Loading />}>
        <ReconcileTab />
      </Suspense>
    ),
  },
];

const tabIds = tabs.map((t) => t.id);

export default function App() {
  const [activeTab, setActiveTab] = useHashRoute(tabIds, tabs[0].id);

  return (
    <div className="min-h-screen bg-background text-slate-800">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16">
        <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
        <FloatingMascot />
      </main>
    </div>
  );
}
