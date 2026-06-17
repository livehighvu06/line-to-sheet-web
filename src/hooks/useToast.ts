import { useCallback, useState } from "react";

export function useToast(duration = 1600) {
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), duration);
  }, [duration]);

  return [toast, showToast] as const;
}
