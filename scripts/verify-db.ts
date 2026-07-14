import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLES = ["profiles", "checkins", "goals", "chat_messages", "ai_outputs"];

let failures = 0;
const pass = (m: string) => console.log("  ✓", m);
const fail = (m: string) => {
  console.log("  ✗", m);
  failures++;
};

function adminClient() {
  return createClient(URL!, SERVICE!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function anonClient() {
  return createClient(URL!, ANON!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function checkTablesExist(a: ReturnType<typeof adminClient>) {
  console.log("\n[1] ตารางครบ 5 ตาราง (service role):");
  for (const t of TABLES) {
    const { count, error } = await a.from(t).select("*", { count: "exact", head: true });
    if (error) fail(`${t}: ${error.message}`);
    else pass(`${t} (มี ${count ?? 0} แถว)`);
  }
}

async function checkRlsDeniesAnon(an: ReturnType<typeof anonClient>) {
  console.log("\n[2] RLS ปฏิเสธ anon (ไม่ล็อกอิน → ต้องเห็น 0 แถว):");
  for (const t of TABLES) {
    const { data, error } = await an.from(t).select("*").limit(5);
    if (error) pass(`${t}: ถูกปฏิเสธ (${error.code || "error"}) — RLS ทำงาน`);
    else if ((data?.length ?? 0) === 0) pass(`${t}: 0 แถว — RLS ทำงาน`);
    else fail(`${t}: เห็น ${data!.length} แถวทั้งที่ไม่ล็อกอิน — RLS ปิด/รั่ว!`);
  }
}

async function checkCrossUserIsolation(a: ReturnType<typeof adminClient>) {
  console.log("\n[3] RLS isolation — user A ต้องเห็นข้อมูล B ไม่ได้:");
  const ts = Date.now();
  const users: { tag: string; id: string; email: string; password: string }[] = [];

  try {
    for (const tag of ["A", "B"]) {
      const email = `rls.check.${tag.toLowerCase()}.${ts}@example.com`;
      const password = `Rls-${tag}-${ts}!`;
      const { data, error } = await a.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error(`สร้าง user ${tag} ไม่ได้: ${error?.message}`);
      users.push({ tag, id: data.user.id, email, password });
    }

    const clients: Record<string, ReturnType<typeof anonClient>> = {};
    for (const u of users) {
      const c = anonClient();
      const { error: sErr } = await c.auth.signInWithPassword({
        email: u.email,
        password: u.password,
      });
      if (sErr) throw new Error(`ล็อกอิน ${u.tag} ไม่ได้: ${sErr.message}`);
      clients[u.id] = c;
      const { error: iErr } = await c.from("checkins").insert({
        user_id: u.id,
        checkin_date: "2026-07-07",
        meals_count: 2,
        sleep_hours: 6,
        bed_time_bucket: "00_01",
        sleep_quality: 3,
        energy_level: "medium",
      });
      if (iErr) throw new Error(`insert checkin ${u.tag} ไม่ได้: ${iErr.message}`);
    }

    const [A, B] = users;
    const ca = clients[A.id];

    const own = await ca.from("checkins").select("id,user_id");
    if (own.error) fail(`A ดึงข้อมูลตัวเอง: ${own.error.message}`);
    else if (own.data.length >= 1 && own.data.every((r) => r.user_id === A.id))
      pass(`A เห็นเฉพาะข้อมูลตัวเอง (${own.data.length} แถว)`);
    else fail(`A เห็นแถวที่ไม่ใช่ของตัวเอง — RLS รั่ว!`);

    const cross = await ca.from("checkins").select("*").eq("user_id", B.id);
    if (cross.error) pass(`A ขอข้อมูล B ตรง ๆ → ถูกปฏิเสธ (${cross.error.code})`);
    else if (cross.data.length === 0) pass(`A ขอข้อมูล B ตรง ๆ → 0 แถว (isolation ผ่าน)`);
    else fail(`A เห็นข้อมูล B ${cross.data.length} แถว — RLS รั่ว!`);
  } finally {
    for (const u of users) {
      const { error } = await a.auth.admin.deleteUser(u.id);
      console.log(
        error
          ? `  ! ลบ user ${u.tag} ไม่สำเร็จ (${u.id}) — ลบมือใน Supabase: ${error.message}`
          : `  (cleanup) ลบ user ${u.tag} แล้ว`
      );
    }
  }
}

async function main() {
  if (!URL?.trim() || !ANON?.trim() || !SERVICE?.trim()) {
    console.error(
      "env ไม่ครบ — ต้องมี NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY / SUPABASE_SERVICE_ROLE_KEY ใน .env.local"
    );
    process.exit(1);
  }

  console.log("=".repeat(64));
  console.log("INFRA-02 — verify Supabase schema + RLS");
  console.log("=".repeat(64));

  const a = adminClient();
  const an = anonClient();
  await checkTablesExist(a);
  await checkRlsDeniesAnon(an);
  try {
    await checkCrossUserIsolation(a);
  } catch (err) {
    fail(`isolation test: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log("\n" + "=".repeat(64));
  console.log(failures === 0 ? "✅ ผ่านทั้งหมด" : `❌ มี ${failures} จุดที่ไม่ผ่าน`);
  if (failures) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
