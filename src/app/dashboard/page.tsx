import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HomePageContent } from "@/components/home/HomePageContent";
import { readInventory } from "@/lib/inventory";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role !== "owner") redirect("/cashier");

  const products = await readInventory();
  return <HomePageContent products={products} />;
}
