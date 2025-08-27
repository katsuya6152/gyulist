import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	MotherShipmentListResponse,
	MotherShipmentsListParams
} from "@/services/shipmentService";
import { getMotherShipmentsList } from "@/services/shipmentService";
import { Suspense } from "react";
import ShipmentsPresentation from "./presentational";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ShipmentsContainer({ searchParams }: Props) {
	const params = await searchParams;

	// URLパラメータを解析
	const apiParams: MotherShipmentsListParams = {
		page: Number.parseInt(String(params.page || "1"), 10),
		limit: Number.parseInt(String(params.limit || "50"), 10),
		sortBy:
			(params.sortBy as MotherShipmentsListParams["sortBy"]) || "motherName",
		sortOrder:
			(params.sortOrder as MotherShipmentsListParams["sortOrder"]) || "asc",
		filterBy: params.filterBy as MotherShipmentsListParams["filterBy"],
		filterValue: String(params.filterValue || "")
	};

	// サーバーサイドでデータを取得
	let data: MotherShipmentListResponse | undefined;
	let error: string | undefined;

	try {
		// 直接APIサービスを呼び出し（Server Component）
		data = await getMotherShipmentsList(apiParams);
	} catch (err) {
		console.error("Failed to fetch shipments:", err);
		error =
			err instanceof Error ? err.message : "出荷データの取得に失敗しました";
	}

	return (
		<div className="container mx-auto py-6">
			<Suspense fallback={<ShipmentsPageSkeleton />}>
				<ShipmentsPresentation
					searchParams={params}
					initialData={data}
					error={error}
					initialSearchParams={apiParams}
				/>
			</Suspense>
		</div>
	);
}

function ShipmentsPageSkeleton() {
	return (
		<div className="space-y-6">
			{/* サマリー情報のスケルトン */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				{Array.from({ length: 5 }, () => (
					<Card key={crypto.randomUUID()}>
						<CardContent className="p-4">
							<div className="h-8 w-16 mb-2 animate-pulse rounded-md bg-muted" />
							<div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
						</CardContent>
					</Card>
				))}
			</div>

			{/* テーブルのスケルトン */}
			<Card>
				<CardHeader>
					<div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
					<div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
							<div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
							<div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
						</div>
						<div className="space-y-2">
							{Array.from({ length: 5 }, () => (
								<div
									key={crypto.randomUUID()}
									className="h-12 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
