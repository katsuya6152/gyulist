"use client";

import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { GetAlertsRes } from "@/services/alertsService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CattleTable } from "./components/desktop/CattleTable";
import { FilterDialog } from "./components/desktop/FilterDialog";
import { FilterSortButtons } from "./components/desktop/FilterSortButtons";
import { SortDialog } from "./components/desktop/SortDialog";
import { CattleItem } from "./components/mobile/CattleItem";
import { FilterSheet } from "./components/mobile/FilterSheet";
import { SortSheet } from "./components/mobile/SortSheet";
import { SearchBar } from "./components/shared/SearchBar";
import { SearchResultBanner } from "./components/shared/SearchResultBanner";
import type { CattleListItem, FilterFormData } from "./constants";

interface CattleListPresentationProps {
	cattleList: CattleListItem[];
	alerts: GetAlertsRes["results"];
	sortBy?: string;
	sortOrder?: string;
}

export function CattleListPresentation({
	cattleList,
	alerts,
	sortBy
}: CattleListPresentationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	// ダイアログの状態管理
	const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
	const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);

	const handleSearch = (searchTerm: string) => {
		const params = new URLSearchParams(searchParams);
		if (searchTerm?.trim()) {
			params.set("search", searchTerm.trim());
		} else {
			params.delete("search");
		}
		router.push(`${pathname}?${params.toString()}`);
	};

	const clearSearch = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("search");
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleSort = (sortBy: string, sortOrder: string) => {
		const params = new URLSearchParams(searchParams);
		params.set("sort_by", sortBy);
		params.set("sort_order", sortOrder);
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleFilterSubmit = (data: FilterFormData) => {
		const params = new URLSearchParams(searchParams);
		if (data.growth_stage.length > 0) {
			params.set("growth_stage", data.growth_stage.join(","));
		} else {
			params.delete("growth_stage");
		}
		if (data.gender.length > 0) {
			params.set("gender", data.gender.join(","));
		} else {
			params.delete("gender");
		}
		if (data.status.length > 0) {
			params.set("status", data.status.join(","));
		} else {
			params.delete("status");
		}

		if (data.has_alert && data.has_alert !== "all") {
			params.set("has_alert", data.has_alert);
		} else {
			params.delete("has_alert");
		}
		router.push(`${pathname}?${params.toString()}`);
	};

	const clearAllFilters = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("growth_stage");
		params.delete("gender");
		params.delete("status");
		params.delete("has_alert");
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleItemClick = (cattleId: number) => {
		router.push(`/cattle/${cattleId}`);
	};

	const handleAddEvent = (cattleId: number) => {
		router.push(`/events/new?cattle_id=${cattleId}`);
	};

	// アクティブフィルター数の計算
	const hasAlert = searchParams.get("has_alert");
	const activeFilterCount = [
		searchParams.get("growth_stage")?.split(",")?.length || 0,
		searchParams.get("gender")?.split(",")?.length || 0,
		searchParams.get("status")?.split(",")?.length || 0,
		hasAlert && hasAlert !== "all" ? 1 : 0
	].reduce((sum, count) => sum + count, 0);

	return (
		<div className={`flex flex-col w-full ${isDesktop ? "px-6 py-8" : ""}`}>
			{/* メインコンテンツ */}
			<div className="w-full">
				<div className="w-full pt-6">
					{/* PC版の横並びレイアウト */}
					{isDesktop ? (
						<div className="flex items-center gap-4">
							{/* 検索バー */}
							<div className="flex-1">
								<SearchBar
									initialValue={searchParams.get("search") ?? ""}
									onSearch={handleSearch}
									onClear={clearSearch}
								/>
							</div>

							{/* フィルター・ソートボタン */}
							<FilterSortButtons
								activeFilterCount={activeFilterCount}
								currentSortBy={searchParams.get("sort_by") || ""}
								currentSortOrder={searchParams.get("sort_order") || ""}
								onFilterClick={() => setIsFilterDialogOpen(true)}
								onSortClick={() => setIsSortDialogOpen(true)}
							/>
						</div>
					) : (
						/* モバイル版の縦並びレイアウト */
						<>
							<SearchBar
								initialValue={searchParams.get("search") ?? ""}
								onSearch={handleSearch}
								onClear={clearSearch}
							/>

							<Separator />

							{/* スマホ版のフィルター・ソート */}
							<div className="flex items-center justify-center h-5 my-4">
								<SortSheet
									currentSortBy={searchParams.get("sort_by") || ""}
									currentSortOrder={searchParams.get("sort_order") || ""}
									onSort={handleSort}
								/>

								<Separator orientation="vertical" className="mx-5" />

								<FilterSheet
									initialGrowthStage={
										searchParams.get("growth_stage")?.split(",") || []
									}
									initialGender={searchParams.get("gender")?.split(",") || []}
									initialStatus={searchParams.get("status")?.split(",") || []}
									initialHasAlert={searchParams.get("has_alert") || "all"}
									onSubmit={handleFilterSubmit}
									onClear={clearAllFilters}
								/>
							</div>
						</>
					)}
				</div>

				<Separator />

				{/* 検索結果の表示 */}
				{searchParams.get("search") && (
					<SearchResultBanner
						searchTerm={searchParams.get("search") ?? ""}
						onClearSearch={clearSearch}
					/>
				)}

				{/* デバイス別表示 */}
				{isDesktop ? (
					<div className="mt-4">
						<CattleTable
							cattleList={cattleList}
							alerts={alerts}
							onItemClick={handleItemClick}
							onAddEvent={handleAddEvent}
							sortBy={sortBy}
						/>
					</div>
				) : (
					<div className="grid gap-0 w-full">
						{cattleList.map((cattle, index) => (
							<CattleItem
								key={cattle.cattleId}
								cattle={cattle}
								index={index}
								alerts={alerts}
								onItemClick={handleItemClick}
								onAddEvent={handleAddEvent}
								sortBy={sortBy}
							/>
						))}
					</div>
				)}
			</div>

			{/* PC版のダイアログ */}
			{isDesktop && (
				<>
					<FilterDialog
						open={isFilterDialogOpen}
						onOpenChange={setIsFilterDialogOpen}
						initialGrowthStage={
							searchParams.get("growth_stage")?.split(",") || []
						}
						initialGender={searchParams.get("gender")?.split(",") || []}
						initialStatus={searchParams.get("status")?.split(",") || []}
						initialHasAlert={searchParams.get("has_alert") || "all"}
						onSubmit={handleFilterSubmit}
						onClear={clearAllFilters}
					/>

					<SortDialog
						open={isSortDialogOpen}
						onOpenChange={setIsSortDialogOpen}
						currentSortBy={searchParams.get("sort_by") || ""}
						currentSortOrder={searchParams.get("sort_order") || ""}
						onSort={handleSort}
					/>
				</>
			)}
		</div>
	);
}
