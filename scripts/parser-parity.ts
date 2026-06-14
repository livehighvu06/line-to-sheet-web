/**
 * 解析平價測試：對真實對話紀錄跑 parser，確認與既有基準一致。
 * 執行：npm run test:parser
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { extractOrders, indexDays } from "../src/lib/parser.ts";

interface Expect {
  date: string;
  orders: number;
  duplicates: number;
  review?: number;
}

const EXPECTED: Expect[] = [
  { date: "2026.06.11", orders: 111, duplicates: 36, review: 20 },
  { date: "2026.06.13", orders: 40, duplicates: 10 },
];

const file = join(homedir(), "Downloads", "[LINE]新飛趣名單.txt");
const lines = readFileSync(file, "utf-8").split("\n");

let ok = true;
for (const e of EXPECTED) {
  const start = indexDays(lines).find((d) => d.date === e.date);
  if (!start) {
    console.error(`✗ 找不到日期 ${e.date}`);
    ok = false;
    continue;
  }
  const { orders, duplicates } = extractOrders(lines, start.idx);
  const review = orders.filter((o) => o.review).length;
  const pass =
    orders.length === e.orders &&
    duplicates === e.duplicates &&
    (e.review === undefined || review === e.review);
  console.log(
    `${pass ? "✓" : "✗"} ${e.date}: orders=${orders.length} dup=${duplicates} review=${review}` +
      (pass ? "" : `（期望 ${JSON.stringify(e)}）`),
  );
  if (!pass) ok = false;
}

process.exit(ok ? 0 : 1);
