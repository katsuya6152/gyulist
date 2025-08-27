"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";

import type {
	MotherShipmentDetail,
	MotherShipmentListResponse,
	MotherShipmentsListParams
} from "@/services/shipmentService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SearchAndFilters } from "./SearchAndFilters";
import { ShipmentManagementTable } from "./ShipmentManagementTable";
import { ShipmentsPagination } from "./ShipmentsPagination";
import { SummaryCards } from "./SummaryCards";

type Props = {
	initialData?: MotherShipmentListResponse;
	error?: string;
	initialSearchParams?: MotherShipmentsListParams;
	onEdit?: (shipment: MotherShipmentDetail) => void;
	onDelete?: (shipment: MotherShipmentDetail) => void;
};

export function ShipmentsList({
	initialData,
	error: initialError,
	initialSearchParams,
	onEdit,
	onDelete
}: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [data, setData] = useState<MotherShipmentListResponse | null>(
		initialData || null
	);
	const [error, setError] = useState<string | null>(initialError || null);
	const [searchTerm, setSearchTerm] = useState("");

	// URLパラメータから初期値を取得
	const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);
	const currentLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
	const currentSortBy =
		(searchParams.get("sortBy") as MotherShipmentsListParams["sortBy"]) ||
		"motherName";
	const currentSortOrder =
		(searchParams.get("sortOrder") as MotherShipmentsListParams["sortOrder"]) ||
		"asc";
	const currentFilterBy = searchParams.get(
		"filterBy"
	) as MotherShipmentsListParams["filterBy"];
	const currentFilterValue = searchParams.get("filterValue") || "";

	// URLパラメータを更新する関数
	const updateSearchParams = useCallback(
		(updates: Record<string, string | null>) => {
			const params = new URLSearchParams(searchParams.toString());

			for (const [key, value] of Object.entries(updates)) {
				if (value === null || value === "") {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}

			router.push(`${pathname}?${params.toString()}`);
		},
		[searchParams, router, pathname]
	);

	// 検索実行
	const handleSearch = useCallback(() => {
		updateSearchParams({
			filterBy: searchTerm ? "motherName" : null,
			filterValue: searchTerm,
			page: "1" // 検索時は1ページ目に戻る
		});
	}, [searchTerm, updateSearchParams]);

	// ソート変更
	const handleSort = useCallback(
		(sortBy: string) => {
			const newSortOrder =
				currentSortBy === sortBy && currentSortOrder === "asc" ? "desc" : "asc";

			updateSearchParams({
				sortBy,
				sortOrder: newSortOrder,
				page: "1"
			});
		},
		[currentSortBy, currentSortOrder, updateSearchParams]
	);

	// ページ変更
	const handlePageChange = useCallback(
		(page: number) => {
			updateSearchParams({ page: page.toString() });
		},
		[updateSearchParams]
	);

	// 表示件数変更
	const handleLimitChange = useCallback(
		(limit: number) => {
			updateSearchParams({ limit: limit.toString(), page: "1" });
		},
		[updateSearchParams]
	);

	// CSVエクスポート
	const handleExport = useCallback(() => {
		if (!data?.data) return;

		const headers = [
			"母牛名",
			"母牛耳標",
			"子牛名",
			"性別",
			"父",
			"母の父",
			"母の祖父",
			"母の母の祖父",
			"種付年月日",
			"分娩予定日",
			"分娩日",
			"出荷日",
			"出荷体重",
			"出荷日齢",
			"価格",
			"購買者",
			"備考"
		];

		const csvData = [
			headers.join(","),
			...data.data.map((row) =>
				[
					row.motherName,
					row.motherEarTag || "",
					row.calfName || "",
					row.sex || "",
					row.pedigree.father || "",
					row.pedigree.motherFather || "",
					row.pedigree.motherGrandfather || "",
					row.pedigree.motherMotherGrandfather || "",
					row.breedingDate || "",
					row.expectedBirthDate || "",
					row.birthDate || "",
					row.shipmentDate || "",
					row.shipmentWeight || "",
					row.ageAtShipment || "",
					row.price || "",
					row.buyer || "",
					row.notes || ""
				]
					.map((cell) => `"${cell}"`)
					.join(",")
			)
		].join("\n");

		const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `出荷実績_${new Date().toISOString().split("T")[0]}.csv`;
		link.click();
	}, [data]);

	// 初期検索値をセット
	useEffect(() => {
		setSearchTerm(currentFilterValue);
	}, [currentFilterValue]);

	// 初期データが変更されたら状態を更新
	useEffect(() => {
		if (initialData) {
			setData(initialData);
		}
		if (initialError) {
			setError(initialError);
		}
	}, [initialData, initialError]);

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>エラーが発生しました</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive mb-4">{error}</p>
					<Button onClick={() => window.location.reload()} variant="outline">
						再試行
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!data) {
		return <ShipmentsListSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* サマリー情報 */}
			{data.summary && <SummaryCards summary={data.summary} />}

			{/* 検索・フィルター・テーブル */}
			<Card>
				<CardHeader>
					<CardTitle>出荷実績一覧</CardTitle>
					<CardDescription>出荷実績と血統情報を表示します</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-6">
						<SearchAndFilters
							searchTerm={searchTerm}
							onSearchTermChange={setSearchTerm}
							onSearch={handleSearch}
							currentSortBy={currentSortBy}
							currentSortOrder={currentSortOrder}
							onSortChange={handleSort}
							currentLimit={currentLimit}
							onLimitChange={handleLimitChange}
							onExportCsv={handleExport}
						/>
					</div>

					{/* テーブル */}
					<div className="mb-6">
						<ShipmentManagementTable
							data={data.data}
							onEdit={onEdit}
							onDelete={onDelete}
							showActions={true}
						/>
					</div>

					{/* ページネーション */}
					{data.pagination && (
						<ShipmentsPagination
							pagination={data.pagination}
							onPageChange={handlePageChange}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function ShipmentsListSkeleton() {
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
