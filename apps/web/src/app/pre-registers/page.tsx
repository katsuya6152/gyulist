import { PreRegisterAdmin } from "@/features/pre-registers/admin/presentational";
import type { QueryParams } from "@/features/pre-registers/admin/utils";
import { headers } from "next/headers";

export const runtime = "edge";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<QueryParams>;
}) {
	const h = headers();
	h.set("X-Robots-Tag", "noindex");
	const params = await searchParams;
	return <PreRegisterAdmin initialParams={params} />;
}
