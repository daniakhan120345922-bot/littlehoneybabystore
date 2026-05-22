import { auth } from "@/auth";
import { NextResponse } from "next/server";

const OWNER_ONLY_PAGES = ["/owner", "/dashboard", "/products"];

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (path.startsWith("/api/settings")) {
    if (!isLoggedIn) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (path === "/") {
    if (isLoggedIn) {
      if (role === "owner") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/cashier", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (role === "cashier") {
    const isOwnerPage = OWNER_ONLY_PAGES.some(
      (p) => path === p || path.startsWith(`${p}/`)
    );
    if (isOwnerPage) {
      return NextResponse.redirect(new URL("/cashier", nextUrl));
    }
    if (path === "/api/products" && req.method !== "GET") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (path === "/api/products" && req.method === "GET") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
