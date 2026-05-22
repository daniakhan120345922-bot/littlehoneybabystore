import Link from "next/link";

type PosNavProps = {
  active?: "home" | "cashier" | "owner";
};

/** Top navigation for POS surfaces */
export function PosNav({ active }: PosNavProps) {
  const linkClass = (key: PosNavProps["active"]) =>
    key === active
      ? "rounded-lg bg-amber-100 px-3 py-1.5 font-medium text-amber-900"
      : "rounded-lg px-3 py-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900";

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-amber-100/80 bg-white/90 px-4 py-3 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-lg">
          🍯
        </span>
        <div>
          <p className="text-sm font-semibold text-stone-900">Little Honey</p>
          <p className="text-xs text-stone-500">Baby Store POS</p>
        </div>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        <Link href="/" className={linkClass("home")}>
          Home
        </Link>
        <Link href="/cashier" className={linkClass("cashier")}>
          Cashier
        </Link>
        <Link href="/owner" className={linkClass("owner")}>
          Owner
        </Link>
      </nav>
    </header>
  );
}
