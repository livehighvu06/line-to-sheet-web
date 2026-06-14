# CLAUDE.md

新飛趣工具箱：純前端工具集合網頁，目前主功能是「LINE 對話紀錄 → Google Sheet 待貼上表格」。
所有處理都在瀏覽器內完成，**對話內容與客戶資料不上傳任何伺服器**——維持這個隱私承諾。

## 技術棧

- Vite + React 19 + TypeScript
- Tailwind CSS v4（`@tailwindcss/vite`，於 `src/index.css` 以 `@import "tailwindcss"` 引入）
- 無 router 套件；分頁切換為純前端 React state

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
├── App.tsx                   外殼：頁首 + Tabs；僅持有 activeTab state
├── components/
│   ├── Tabs.tsx              ★ 通用分頁元件（TabItem 介面）
│   ├── LineToSheetTab.tsx    LINE→Sheet 功能頁（持有該功能全部狀態）
│   └── ChatInput / DaySelect / PreviewTable / ReviewList / ResultActions / FieldMap / Toast
└── lib/
    ├── parser.ts             ★ 解析核心邏輯
    └── download.ts           下載工具
```

### 新增功能頁的方式

每個功能是一個自包含元件（自己持有狀態），透過 `App.tsx` 的 `tabs` 設定陣列掛載：

1. 新增 `src/components/XxxTab.tsx`。
2. 在 `App.tsx` 的 `tabs` 陣列加一筆 `{ id, label, content: <XxxTab /> }`。

不要把功能專屬狀態提升到 `App.tsx`——它只負責切換分頁。

## 重要約束

- **`src/lib/parser.ts` 是核心，行為需與本機 Python skill 對齊**。檔頭記錄了基準
  （如 `2026.06.11 → 111/36/20`）。變更 `AIRLINES` 或 `parseOrder()` 等規則後，
  **務必跑 `npm run test:parser` 確認未破壞基準**。
- `AIRLINES` 關鍵字採最長優先比對，順序有意義（例：泰亞航／泰越捷必須排在亞航前面），
  調整時勿任意重排。
- 解析規則針對特定 LINE 群組訊息格式設計，改動前先確認格式假設。

## 部署

推送到 `main` 觸發 `.github/workflows/deploy.yml`，自動 build 並發佈到 GitHub Pages。
`vite.config.ts` 的 `base: '/line-to-sheet-web/'` 須與 repo 名稱一致。
