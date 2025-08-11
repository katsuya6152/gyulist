import { getRequestContext } from "@cloudflare/next-on-pages";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
	matcher: "/admin/:path*",
};

export function middleware(req: NextRequest) {
	const auth = req.headers.get("authorization") || "";
	const { ADMIN_USER, ADMIN_PASS } = getRequestContext().env;
	const expected = `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASS}`)}`;
	if (auth !== expected) {
		const res = new NextResponse("Unauthorized", { status: 401 });
		res.headers.set("WWW-Authenticate", 'Basic realm="Restricted"');
		return res;
	}
	return NextResponse.next();
}
