import { useEffect, useState } from "react";
import mascot from "../assets/back-to-top.png";

/** 捲動超過門檻才浮現的「回到頂端」按鈕（mascot 造型）。 */
const THRESHOLD = 300;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY > THRESHOLD);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // 初次掛載時校正（可能已在頁面中段）
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="回到頂端"
      tabIndex={visible ? 0 : -1}
      className={`fixed right-5 bottom-5 z-50 cursor-pointer rounded-2xl transition-[opacity,transform] duration-200 hover:-translate-y-1 focus:ring-2 focus:ring-ring focus:outline-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <img
        src={mascot}
        alt=""
        width={64}
        height={81}
        className="h-auto w-16 drop-shadow-md"
      />
    </button>
  );
}
