# CLAUDE.md

LINE 名單轉表格：純前端工具，把 LINE 群組對話紀錄轉成 Google Sheet 待貼上表格。

所有處理都在瀏覽器內完成，**對話內容與客戶資料不上傳任何伺服器**——維持這個隱私承諾。

姊妹站 [linkpay-reconcile-web](https://github.com/livehighvu06/linkpay-reconcile-web)
是刷卡對帳功能（原本同一個 repo 裡的另一個分頁，已拆成獨立網站）；兩邊共用同一套
`src/lib/parser.ts` 解析核心與視覺元件（`AppHeader`／`FloatingMascot`／`Toast`／
`PrivacyNote`／`StepHeading`／`icons.tsx`／`buttonStyles.ts`），調整這些檔案時留意
另一邊是否也要同步。

## 技術棧

- Vite + React 19 + TypeScript
- Tailwind CSS v4（`@tailwindcss/vite`，於 `src/index.css` 以 `@import "tailwindcss"` 引入）
- 無 router 套件、無分頁；單一功能頁，`App.tsx` 直接掛載

## 常用指令

```bash
npm run dev          # 本機開發伺服器（base path：/line-to-sheet-web/）
npm run build        # tsc -b 型別檢查 + Vite 打包到 dist/
npm run preview      # 預覽 build 產物
npm run test:parser  # 解析平價測試（需本機對話紀錄檔，路徑見 scripts/parser-parity.ts）
```

## 架構

```
src/
├── main.tsx                  進入點
├── App.tsx                   外殼：頁首 + LineToSheetTab + 浮動吉祥物
├── components/
│   ├── LineToSheetTab.tsx    功能頁：LINE→Sheet（持有該功能全部狀態）
│   └── ChatInput / DaySelect / PreviewTable / ReviewList / ResultActions / FieldMap / Toast
└── lib/
    ├── parser.ts             ★ 解析核心（出發日期/航空/團名/人數/姓名標籤）
    └── download.ts           下載工具（downloadText / downloadBlob）
```

## 重要約束

- **`src/lib/parser.ts` 是核心，行為需與本機 Python skill 對齊**。檔頭記錄了基準
  （如 `2026.06.11 → 111/36/20`）。變更 `AIRLINES` 或 `parseOrder()` 等規則後，
  **務必跑 `npm run test:parser` 確認未破壞基準**。
- `AIRLINES` 關鍵字採最長優先比對，順序有意義（例：泰亞航／泰越捷必須排在亞航前面），
  調整時勿任意重排。
- 解析規則針對特定 LINE 群組訊息格式設計，改動前先確認格式假設。
- `parseOrder()` 也被 `linkpay-reconcile-web` 重用，改動規則需確認不會破壞刷卡對帳的比對邏輯。

## 部署

推送到 `main` 觸發 `.github/workflows/deploy.yml`，自動 build 並發佈到 GitHub Pages。
`vite.config.ts` 的 `base: '/line-to-sheet-web/'` 須與 repo 名稱一致。
