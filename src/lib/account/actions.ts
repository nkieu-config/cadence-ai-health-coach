"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { USER_DATA_TABLES } from "./tables";

export type AccountActionResult = { ok: true } | { error: string };

export async function deleteAllData(): Promise<AccountActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  for (const table of USER_DATA_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) {
      console.error(`Failed to delete user data from ${table}:`, error);
      return {
        error: "ลบข้อมูลได้ไม่ครบ — ข้อมูลบางส่วนยังอยู่ กดยืนยันอีกครั้งเพื่อลบส่วนที่เหลือ",
      };
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccount(): Promise<AccountActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "เครื่องนี้ไม่มี service role key จึงลบบัญชีไม่ได้ — เป็นเรื่องปกติบน dev (key อยู่กับ A คนเดียว) ไม่ใช่โค้ดคุณผิด · ปุ่ม “ลบข้อมูลทั้งหมด” เทสต์ได้ตามปกติ ส่วนขั้นนี้ A ตรวจบน production ให้",
    };
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) {
    return { error: "ลบบัญชีไม่สำเร็จ — ลองใหม่อีกครั้ง" };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?deleted=1");
}
