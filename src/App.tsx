import AppHeader from "./components/AppHeader";
import FloatingMascot from "./components/FloatingMascot";
import LineToSheetTab from "./components/LineToSheetTab";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-slate-800">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16">
        <LineToSheetTab />
        <FloatingMascot />
      </main>
    </div>
  );
}
