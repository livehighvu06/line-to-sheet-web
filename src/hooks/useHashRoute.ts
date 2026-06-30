import { useCallback, useEffect, useState } from "react";

/** 由 window.location.hash 解析出 route id（去掉開頭的 # 或 #/）。 */
function parseHash(): string {
  return window.location.hash.replace(/^#\/?/, "");
}

/**
 * 輕量 hash 路由：以 URL hash 作為唯一狀態來源，與分頁 id 對齊。
 *
 * - 切換分頁只改寫 hash，由 hashchange 事件回灌 state，維持單一來源。
 * - hash 不在 validIds 時退回 defaultId，避免未知網址顯示空白。
 */
export default function useHashRoute(
  validIds: string[],
  defaultId: string,
): [string, (id: string) => void] {
  const resolve = useCallback(
    (raw: string) => (validIds.includes(raw) ? raw : defaultId),
    [validIds, defaultId],
  );

  const [activeId, setActiveId] = useState(() => resolve(parseHash()));

  useEffect(() => {
    // 初次掛載時若 hash 為空，把網址正規化成 #/<defaultId>，讓首頁網址明確。
    if (!parseHash()) {
      window.location.replace(`#/${defaultId}`);
    }

    const onHashChange = () => setActiveId(resolve(parseHash()));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [resolve, defaultId]);

  const navigate = useCallback((id: string) => {
    window.location.hash = `#/${id}`;
  }, []);

  return [activeId, navigate];
}
