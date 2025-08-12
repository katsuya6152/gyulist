import { PreRegisterAdmin } from "@/features/pre-registers/admin/presentational";
import type { QueryParams } from "@/features/pre-registers/admin/utils";
import type { Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
		},
	},
};

export default function Page({
	searchParams,
}: {
	searchParams?: QueryParams;
}) {
	const params: QueryParams = searchParams ?? {};
	return <PreRegisterAdmin initialParams={params} />;
}
