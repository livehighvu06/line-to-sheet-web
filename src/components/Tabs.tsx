import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

/** 通用分頁列 + 內容容器，純前端 state 切換。 */
export default function Tabs({ tabs, activeId, onChange }: Props) {
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={
                "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-300 focus:outline-none " +
                (isActive
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">{active.content}</div>
    </div>
  );
}
