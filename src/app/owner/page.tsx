import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OwnerPageContent } from "@/components/owner/OwnerPageContent";
import { readInventory } from "@/lib/inventory";

export default async function OwnerPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (session.user.role !== "owner") redirect("/cashier");

  const products = await readInventory();
  return <OwnerPageContent products={products} />;
}
