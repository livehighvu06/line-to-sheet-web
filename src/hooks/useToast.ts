import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1600);
  }, []);

  return [toast, showToast] as const;
}
