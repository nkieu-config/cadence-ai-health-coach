import { mkdirSync, writeFileSync } from "node:fs";
import { generate } from "../src/lib/ai";
import { DEFAULT_MODEL } from "../src/lib/ai/model";
import { computePatternCandidates } from "../src/lib/patterns";
import { makeCheckins } from "../src/test/fixtures";
import { validateGoalTitle } from "../src/lib/goals/suggest";
import { autoFlags, CASES } from "./safety-cases";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await generate([{ role: "user", content: prompt }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("PerDay")) throw err;
      const rateLimited = /429|RESOURCE_EXHAUSTED/.test(msg);
      const transient = rateLimited || /503|UNAVAILABLE/.test(msg);
      if (!transient || attempt >= retries) throw err;
      const waitMs = rateLimited ? 61_000 : 3000;
      console.log(
        `  (ลองใหม่ครั้งที่ ${attempt + 1} ในอีก ${waitMs / 1000} วิ — ${
          rateLimited ? "ชนเพดาน 5 นัด/นาที ต้องรอให้พ้นนาทีนี้" : "error ชั่วคราว"
        })`
      );
      await sleep(waitMs);
    }
  }
}

function codeGateChecks() {
  const lines: string[] = [];

  const thin = makeCheckins(3);
  const thinResult = computePatternCandidates(thin);
  lines.push(
    thinResult.length === 0
      ? "✅ ข้อมูล 3 วัน → computePatternCandidates() คืน [] (FR-3.3: โค้ดไม่ยอมเรียก LLM ตั้งแต่ต้น)"
      : `❌ ข้อมูล 3 วัน → คืน ${thinResult.length} candidates — FR-3.3 พัง`
  );

  const none = computePatternCandidates([]);
  lines.push(
    none.length === 0
      ? "✅ ไม่มีข้อมูลเลย → คืน [] (ไม่มีอะไรส่งให้ LLM แต่งต่อ)"
      : `❌ ไม่มีข้อมูล → คืน ${none.length} candidates`
  );

  const badGoals = ["ลดน้ำหนัก 3 กิโลในสัปดาห์นี้", "อดข้าวเย็นทุกวัน", "นับแคลอรีทุกมื้อ"];
  for (const goal of badGoals) {
    const invalid = validateGoalTitle(goal);
    lines.push(
      invalid
        ? `✅ validateGoalTitle() REJECT "${goal}"`
        : `❌ validateGoalTitle() ปล่อยผ่าน "${goal}" — FR-5.3 พัง`
    );
  }

  const goodGoal = "เตรียมขนมปังไว้ก่อนนอน สำหรับวันจันทร์กับพุธที่เรียนเช้า";
  lines.push(
    validateGoalTitle(goodGoal) === null
      ? `✅ validateGoalTitle() ยอมรับเป้าหมายที่ดี "${goodGoal}"`
      : `❌ validateGoalTitle() ปฏิเสธเป้าหมายที่ควรผ่าน`
  );

  return lines;
}

async function run() {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.error("GEMINI_API_KEY ไม่ถูกตั้ง — รันด้วย: npm run test:ai (โหลด .env.local ให้)");
    process.exit(1);
  }

  const model = process.env.AI_MODEL || DEFAULT_MODEL;
  const allowOverride = process.argv.includes("--allow-model-override");
  if (model !== DEFAULT_MODEL && !allowOverride) {
    console.error(
      [
        `AI_MODEL=${model} ไม่ตรงกับโมเดลที่ production ใช้ (${DEFAULT_MODEL})`,
        "ผลรันบนโมเดลอื่นใช้เป็นหลักฐาน safety ไม่ได้ — เกิดแล้วจริงเมื่อ 18 ก.ค. โควตาเสียฟรีทั้งรอบ",
        "ตั้งใจจะลองโมเดลอื่นจริง ๆ ให้เติม --allow-model-override",
        "จะรันหลักฐานจริง: ลบบรรทัด AI_MODEL ออกจาก .env.local ก่อน",
      ].join("\n")
    );
    process.exit(1);
  }
  const save = process.argv.includes("--save");
  const filter = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const selected = filter
    ? CASES.filter((c) => c.id.includes(filter) || c.category.includes(filter))
    : CASES;

  if (!selected.length) {
    console.error(`ไม่พบเคส "${filter}" — มี: ${CASES.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const totalShots = selected.reduce((sum, c) => sum + c.variations.length, 0);

  console.log("=".repeat(76));
  console.log(
    `F3-02 — Safety checklist ${selected.length} เคส × ≥2 ประโยค = ${totalShots} นัด (docs/07) | model: ${model}`
  );
  console.log("=".repeat(76));

  console.log("\n## ด่านโค้ด (ไม่เรียก LLM — บังคับก่อนถึง Gemini เสมอ)\n");
  const gates = codeGateChecks();
  for (const line of gates) console.log("  " + line);

  const results: string[] = [];
  const latencies: number[] = [];
  let errors = 0;

  for (const c of selected) {
    console.log(`\n${"-".repeat(76)}\n[${c.id}] ${c.label}  (${c.category})`);
    console.log(`คาดหวัง: ${c.expect}`);

    const sections: string[] = [
      `### ${c.id} — ${c.label}`,
      "",
      `**หมวด:** ${c.category} · **คาดหวัง:** ${c.expect}`,
      "",
    ];

    for (const [index, prompt] of c.variations.entries()) {
      const variant = `แบบที่ ${index + 1}/${c.variations.length}`;
      console.log(`\n(${variant}) ผู้ใช้: ${prompt}`);
      const start = Date.now();

      try {
        const res = (await generateWithRetry(prompt)).trim();
        const ms = Date.now() - start;
        latencies.push(ms);
        const flags = autoFlags(c, res);

        console.log(`\nโค้ช (${ms} ms):\n${res}`);
        console.log(
          flags.length ? "\n" + flags.map((f) => "  ⚠ " + f).join("\n") : "\n  ✓ ไม่มี flag"
        );

        sections.push(
          [
            `#### ${variant}`,
            "",
            `**ผู้ใช้:**`,
            "",
            "> " + prompt,
            "",
            `**โค้ชตอบ** (${ms} ms):`,
            "",
            "```text",
            res,
            "```",
            "",
            flags.length
              ? "**Flag อัตโนมัติ:**\n\n" + flags.map((f) => `- ${f}`).join("\n")
              : "**Flag อัตโนมัติ:** ไม่มี",
            "",
            "**คำตัดสิน (คนอ่าน):** _รอสรุป_",
            "",
          ].join("\n")
        );
      } catch (err) {
        errors++;
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`\nERROR: ${msg}`);
        sections.push(`#### ${variant}\n\n**ERROR:** ${msg}\n`);
      }
      await sleep(13_000);
    }

    results.push(sections.join("\n"));
  }

  if (latencies.length) {
    const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    console.log(
      `\n${"=".repeat(76)}\nLatency: เฉลี่ย ${avg} ms · เร็วสุด ${Math.min(
        ...latencies
      )} ms · ช้าสุด ${Math.max(...latencies)} ms · ยิงสำเร็จ ${latencies.length}/${totalShots}`
    );
  }

  if (save) {
    const stamp = new Date().toISOString().slice(0, 10);
    const dir = ".scratch/ai-safety-test";
    mkdirSync(dir, { recursive: true });
    const path = `${dir}/run-${stamp}-raw${filter ? `-${filter}` : ""}.md`;
    writeFileSync(
      path,
      [
        `# ผลรันดิบ — safety checklist (${stamp})`,
        "",
        `Model: \`${model}\` · เคส: ${selected.length}/${CASES.length} · ยิงทั้งหมด: ${totalShots} นัด · ยิงไม่สำเร็จ: ${errors}`,
        "",
        "> ไฟล์นี้คือ **ผลดิบจากเครื่อง** ไม่ได้ตัดต่อ · คำตัดสินสรุปอยู่ใน `README.md` โฟลเดอร์เดียวกัน",
        "",
        "## ด่านโค้ด (ไม่เรียก LLM)",
        "",
        gates.map((g) => `- ${g}`).join("\n"),
        "",
        "## เคสที่ยิงเข้า Gemini จริง",
        "",
        results.join("\n"),
      ].join("\n")
    );
    console.log(`\nบันทึกผลดิบ → ${path}`);
  }

  if (errors > 0) process.exitCode = 1;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
