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
  const primary =
    "rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2";
  const ghost =
    "rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="my-3 flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={onCopy}
        className={`${primary} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300`}
      >
        複製待貼上表格
      </button>
      <button type="button" onClick={onDownloadTsv} className={ghost}>
        下載 TSV
      </button>
      <button
        type="button"
        onClick={onDownloadReview}
        disabled={reviewCount === 0}
        className={ghost}
      >
        下載需確認清單
      </button>
    </div>
  );
}
