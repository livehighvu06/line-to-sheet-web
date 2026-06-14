# 新飛趣名單 → Google Sheet 待貼上表格（網頁版）

把 LINE 群組「新飛趣名單」的對話紀錄，抽取訂單欄位，產生可直接貼進 Google Sheet 的表格。
**純前端、單一檔案**（`index.html`），所有處理都在瀏覽器內完成，對話內容與客戶資料不會上傳到任何伺服器。

此網頁版是本機 Python skill（`~/.claude/skills/line-to-sheet/`）的逐一移植，解析規則與輸出完全一致。

## 使用方式

1. 開啟網頁。
2. 貼上 LINE 匯出的對話紀錄（或上傳 `.txt`）。
3. 選擇起始日期（解析範圍 = 該日到最後）。
4. 按「整理」，檢視預覽與需確認清單。
5. 「複製待貼上表格」或「下載 TSV」，到試算表最後一筆資料下方第一個空列的 **B 欄**貼上。
   A 欄與金額等財務欄位再自行補上。

## 解析規則摘要

| 欄 | 內容 | 範例 `8/19樂桃東京5日來回機票（lin-東京）9位` |
|---|---|---|
| B | 出發日期 | `8/19` |
| C | 航空 | `樂桃`（無航空關鍵字則填「團」） |
| D | 地點／團名 | `東京5日來回機票` |
| F | 報名人數 | `9` |
| J | 姓名 | `lin-東京`（最後一組括號內標籤） |

- **訂單偵測**：行內須有「時間+發送者」前綴、日期 `M/D` 與至少一組括號。
- **去重**：日期＋航空＋團名＋姓名＋人數 完全相同者只保留第一筆。
- **括號**：以深度配對處理巢狀與全半形混用。
- **需確認**：C 欄填「團」或人數非純數字者會另列清單提醒覆核（仍會輸出）。

## 部署到 GitHub Pages

1. 建立一個新的 GitHub 儲存庫（例如 `line-to-sheet-web`），**只放程式碼**，
   ⚠️ 切勿上傳任何對話紀錄或客戶名單。
2. 把本資料夾的 `index.html`（與 `README.md`）推上去：

   ```bash
   git init
   git add index.html README.md
   git commit -m "feat: LINE 名單轉 Sheet 純前端網頁"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/line-to-sheet-web.git
   git push -u origin main
   ```

3. 在 GitHub 儲存庫 → **Settings → Pages** → Source 選 `main` 分支、根目錄 `/ (root)` → Save。
4. 稍候幾分鐘，網址會是 `https://<你的帳號>.github.io/line-to-sheet-web/`，把連結給對方即可使用。

## 注意事項

- 解析規則是針對「新飛趣名單」的訊息格式設計，對方需是相同格式的名單才適用。
- 需新增航空公司或調整規則時，編輯 `index.html` 中的 `AIRLINES` 陣列與 `parseOrder()`。
- 瀏覽器需支援 ES2018+（Unicode property escapes）；現代瀏覽器皆可。
