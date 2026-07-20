import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "PalmDemo2026!";

type Attack = {
  label: string;
  table: string;
  row: Record<string, unknown>;
};

const GARBAGE: Attack[] = [
  {
    label: "disruptor ที่ไม่มีอยู่จริง → ทำให้ pattern analysis ของตัวเองเพี้ยน",
    table: "checkins",
    row: { checkin_date: "2020-01-01", disruptors: ["ขยะ"] },
  },
  {
    label: "bed_time_bucket มั่ว → ทำให้สเกลเวลานอนพัง",
    table: "checkins",
    row: { checkin_date: "2020-01-02", bed_time_bucket: "ตอนไหนก็ได้" },
  },
  {
    label: "meals_count = 99",
    table: "checkins",
    row: { checkin_date: "2020-01-03", meals_count: 99 },
  },
  {
    label: "note ยาวเกิน 200 ตัวอักษร",
    table: "checkins",
    row: { checkin_date: "2020-01-04", note: "ก".repeat(500) },
  },
  {
    label: "goal ที่ situation ไม่มีในระบบ",
    table: "goals",
    row: { week_start: "2020-01-06", title: "ทดสอบ", situation_tag: "อะไรก็ไม่รู้" },
  },
];

const BASE_CHECKIN = {
  meals_count: 3,
  sleep_hours: 7,
  bed_time_bucket: "23_00",
  sleep_quality: 4,
  energy_level: "high",
  movement_types: ["walk"],
};

async function run() {
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: session, error: authError } = await anon.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (authError || !session.user) {
    throw new Error(`ล็อกอิน demo ไม่สำเร็จ: ${authError?.message}`);
  }

  const me = session.user.id;
  console.log(`ยิงในนามผู้ใช้จริง (ไม่ใช่ service role): ${EMAIL}\n`);

  let leaked = 0;

  console.log("── 1. RLS: แตะข้อมูลคนอื่นได้ไหม ──");
  const admin = createAdminClient();
  const { data: others } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const someoneElse = others.users.find((user) => user.id !== me);

  const { data: stolen } = await anon.from("checkins").select("user_id");
  const foreign = (stolen ?? []).filter((row) => row.user_id !== me);
  if (foreign.length > 0) {
    console.log(`  ❌ อ่านข้อมูลคนอื่นได้ ${foreign.length} แถว`);
    leaked++;
  } else {
    console.log(`  ✅ อ่านได้เฉพาะของตัวเอง (${stolen?.length ?? 0} แถว)`);
  }

  if (someoneElse) {
    const { error } = await anon
      .from("checkins")
      .insert({ ...BASE_CHECKIN, user_id: someoneElse.id, checkin_date: "2020-02-02" });
    if (error) {
      console.log(`  ✅ เขียนแถวให้คนอื่นถูกปฏิเสธ`);
    } else {
      console.log(`  ❌ เขียนแถวสวมรอยคนอื่นสำเร็จ — RLS พัง`);
      leaked++;
    }
  }

  console.log("\n── 2. CHECK ต้องไม่บล็อกของที่ถูกต้อง (positive control) ──");
  const validRow = {
    user_id: me,
    checkin_date: "2020-06-06",
    meals_count: 2,
    skipped_meals: ["breakfast", "lunch"],
    first_meal_time: "after_12",
    food_types: ["snack", "veg_fruit"],
    sweet_drinks: 4,
    meal_feeling: "hungry_fast",
    sleep_hours: 4.5,
    bed_time_bucket: "after_02",
    sleep_quality: 1,
    late_reason: "phone",
    movement_types: ["stairs", "bike", "sport"],
    movement_minutes: 90,
    movement_blocker: "rain",
    movement_feeling: "no_change",
    energy_level: "medium",
    disruptors: ["long_meeting", "online_class", "exam"],
    note: "ก".repeat(200),
  };
  const { error: validError } = await anon.from("checkins").insert(validRow);
  if (validError) {
    console.log(`  ❌ CHECK บล็อกข้อมูลที่ถูกต้อง! — ${validError.message}`);
    leaked++;
  } else {
    console.log("  ✅ แถวที่ใช้ค่าสุดขอบของทุก enum + note 200 ตัวอักษร → ผ่าน");
  }

  console.log("\n── 3. CHECK: เขียนค่าขยะลงแถวตัวเองได้ไหม (ข้าม validateCheckin) ──");
  for (const attack of GARBAGE) {
    const row =
      attack.table === "checkins"
        ? { ...BASE_CHECKIN, ...attack.row, user_id: me }
        : { ...attack.row, user_id: me };

    const { error } = await anon.from(attack.table).insert(row);
    if (error) {
      console.log(`  ✅ ปฏิเสธ — ${attack.label}`);
    } else {
      console.log(`  ❌ ผ่านเข้าไปได้! — ${attack.label}`);
      await admin
        .from(attack.table)
        .delete()
        .eq("user_id", me)
        .match(
          attack.table === "checkins"
            ? { checkin_date: attack.row.checkin_date as string }
            : { week_start: attack.row.week_start as string }
        );
      leaked++;
    }
  }

  await admin
    .from("checkins")
    .delete()
    .eq("user_id", me)
    .gte("checkin_date", "2020-01-01")
    .lte("checkin_date", "2020-12-31");
  await admin
    .from("goals")
    .delete()
    .eq("user_id", me)
    .gte("week_start", "2020-01-01")
    .lte("week_start", "2020-12-31");
  await anon.auth.signOut();

  console.log(
    leaked === 0
      ? "\n✅ ผ่านทั้งหมด — RLS กันคนอื่น · CHECK กันค่าขยะของตัวเอง"
      : `\n❌ มี ${leaked} จุดที่หลุด`
  );
  process.exit(leaked === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
