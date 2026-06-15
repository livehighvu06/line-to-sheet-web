import { btnAccent, btnGhost } from "./buttonStyles";

interface Props {
  onCopy: () => void;
  onDownloadTsv: () => void;
  onDownloadReview: () => void;
  reviewCount: number;
}

/** 結果操作按鈕：複製 TSV、下載 TSV、下載需確認清單。 */
export default function ResultActions({
  onCopy,
  onDownloadTsv,
  onDownloadReview,
  reviewCount,
}: Props) {
  return (
    <div className="my-3 flex flex-wrap gap-2.5">
      <button type="button" onClick={onCopy} className={btnAccent}>
        複製待貼上表格
      </button>
      <button type="button" onClick={onDownloadTsv} className={btnGhost}>
        下載 TSV
      </button>
      <button
        type="button"
        onClick={onDownloadReview}
        disabled={reviewCount === 0}
        className={btnGhost}
      >
        下載需確認清單
      </button>
    </div>
  );
}
