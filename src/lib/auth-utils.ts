import { getSession } from "./session";
import { redirect } from "next/navigation";
import { db } from "./db";

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session.user;
}

export async function requireAdmin() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  
  return session.user;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();
  
  if (session?.user) {
    redirect("/");
  }
}

export async function checkAndSetAdminRole(email: string) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  if (adminEmails.includes(email)) {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      await db.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      return true;
    }
  }
  return false;
} 