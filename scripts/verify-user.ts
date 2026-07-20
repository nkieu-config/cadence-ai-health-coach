import { USER_DATA_TABLES } from "../src/lib/account/tables";
import { createAdminClient } from "../src/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveUserId(admin: ReturnType<typeof createAdminClient>, target: string) {
  if (UUID.test(target)) {
    return { id: target, exists: null as boolean | null };
  }

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  const user = data.users.find((candidate) => candidate.email === target);
  return { id: user?.id ?? null, exists: Boolean(user) };
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("ใช้: npm run verify:user -- <email หรือ user-id>");
    console.error("  รันก่อนลบเพื่อจด user-id ไว้ แล้วรันอีกครั้งหลังลบด้วย user-id นั้น");
    process.exit(1);
  }

  const admin = createAdminClient();
  const { id, exists } = await resolveUserId(admin, target);

  console.log("=".repeat(60));
  console.log(`ตรวจข้อมูลของ: ${target}`);
  console.log("=".repeat(60));

  if (exists === false) {
    console.log("\nauth.users : ✓ ไม่มีบัญชีนี้แล้ว (ถูกลบเรียบร้อย)");
    console.log("\n⚠️  ไม่มี user-id ให้ตรวจแถวตกค้าง");
    console.log("    รันซ้ำด้วย user-id ที่จดไว้ก่อนลบ เพื่อพิสูจน์ว่าไม่มีแถวค้างในตารางไหนเลย");
    return;
  }

  if (!id) {
    console.error("\n✗ หา user-id ไม่ได้");
    process.exit(1);
  }

  console.log(`\nuser-id    : ${id}`);
  if (exists) console.log("auth.users : มีบัญชีอยู่");

  let total = 0;
  console.log("");
  for (const table of USER_DATA_TABLES) {
    const { count, error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("user_id", id);

    if (error) {
      console.error(`  ✗ ${table.padEnd(14)} อ่านไม่ได้: ${error.message}`);
      process.exit(1);
    }

    const rows = count ?? 0;
    total += rows;
    console.log(`  ${rows === 0 ? "✓" : "•"} ${table.padEnd(14)} ${rows} แถว`);
  }

  console.log("");
  console.log(
    total === 0
      ? "✅ ไม่เหลือข้อมูลตกค้างในตารางไหนเลย — แปะผลนี้ปิด AC ของ F7-02 ได้"
      : `📊 รวม ${total} แถว`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
