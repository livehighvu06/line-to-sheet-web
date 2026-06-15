import StepHeading from "./StepHeading";
import { fileInput } from "./buttonStyles";

interface Props {
  value: string;
  onChange: (text: string) => void;
}

/** 對話紀錄輸入：貼上 textarea 或上傳 .txt。 */
export default function ChatInput({ value, onChange }: Props) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsText(file, "utf-8");
  }

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <StepHeading step={1} title="貼上對話紀錄（或上傳 .txt）" />
      <label htmlFor="chat" className="sr-only">
        對話紀錄內容
      </label>
      <textarea
        id="chat"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="把 LINE 匯出的對話紀錄文字整段貼在這裡…"
        className="min-h-44 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-[13px] leading-relaxed focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".txt,text/plain"
          onChange={handleFile}
          className={fileInput}
        />
        <span className="text-sm text-slate-500">
          從 LINE 聊天室 →「其他設定」→「傳送聊天記錄」匯出文字檔。
        </span>
      </div>
    </section>
  );
}
