import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <Suspense fallback={<p className="p-8 text-stone-500">Loading settings…</p>}>
      <SettingsContent />
    </Suspense>
  );
}
