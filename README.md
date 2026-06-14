# LINE 對話紀錄 → Google Sheet 待貼上表格（React 版）

把 LINE 群組對話紀錄，抽取訂單欄位，產生可直接貼進 Google Sheet 的表格。
**純前端**，所有處理都在瀏覽器內完成，對話內容與客戶資料不會上傳到任何伺服器。

線上版：**https://livehighvu06.github.io/line-to-sheet-web/**

## 技術棧

- Vite + React 19 + TypeScript
- Tailwind CSS v4（`@tailwindcss/vite`）
- 解析邏輯獨立於 `src/lib/parser.ts`，與本機 Python skill 行為一致

## 開發

```bash
npm install
npm run dev            # 本機開發伺服器
npm run build          # 型別檢查 + 打包到 dist/
npm run preview        # 預覽 build 產物
npm run test:parser    # 解析平價測試（需本機對話紀錄檔，路徑見 scripts/parser-parity.ts）
```

## 專案結構

```
src/
├── main.tsx              React 進入點
├── App.tsx               狀態與流程組裝
├── index.css            @import "tailwindcss"
├── lib/
│   ├── parser.ts        ★ 解析邏輯（出發日期/航空/團名/人數/姓名、去重、團替代）
│   └── download.ts      下載工具
└── components/          ChatInput、DaySelect、PreviewTable、ReviewList、ResultActions、FieldMap、Toast
```

## 使用方式

1. 貼上 LINE 匯出的對話紀錄（或上傳 `.txt`）。
2. 選擇起始日期（解析範圍 = 該日到最後）。
3. 按「整理」，檢視預覽與需確認清單。
4. 「複製待貼上表格」或「下載 TSV」，到試算表最後一筆資料下方第一個空列的 **B 欄**貼上。
   A 欄與金額等財務欄位再自行補上。

## 解析規則摘要

| 欄 | 內容 | 範例 `8/19樂桃東京5日來回機票（lin-東京）9位` |
|---|---|---|
| B | 出發日期 | `8/19` |
| C | 航空 | `樂桃`（無航空關鍵字則填「團」） |
| D | 地點／團名 | `東京5日來回機票` |
| F | 報名人數 | `9` |
| J | 姓名 | `lin-東京`（最後一組括號內標籤） |

- **去重**：日期＋航空＋團名＋姓名＋人數 完全相同者只保留第一筆。
- **括號**：以深度配對處理巢狀與全半形混用。
- **需確認**：C 欄填「團」或人數非純數字者會另列清單提醒覆核（仍會輸出）。

## 部署（GitHub Actions → Pages）

推送到 `main` 會觸發 `.github/workflows/deploy.yml`：自動 `npm ci`、`npm run build`，
再把 `dist/` 發佈到 GitHub Pages。Pages 來源需設為 **GitHub Actions**。

`vite.config.ts` 的 `base: '/line-to-sheet-web/'` 對應 repo 名稱，請與儲存庫名稱一致。

## 注意事項

- 解析規則針對特定 LINE 群組的訊息格式設計，需相同格式的名單才適用。
- 新增航空或調整規則：編輯 `src/lib/parser.ts` 的 `AIRLINES` 與 `parseOrder()`，
  並跑 `npm run test:parser` 確認未破壞既有基準。
