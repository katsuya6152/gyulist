"use client";

import { Separator } from "@/components/ui/separator";
import { useRouter, useSearchParams } from "next/navigation";
import { CattleItem } from "./components/CattleItem";
import { FilterSheet } from "./components/FilterSheet";
import { SearchBar } from "./components/SearchBar";
import { SearchResultBanner } from "./components/SearchResultBanner";
import { SortSheet } from "./components/SortSheet";
import type { CattleListItem, FilterFormData } from "./constants";

interface CattleListPresentationProps {
	cattleList: CattleListItem[];
}

export function CattleListPresentation({
	cattleList
}: CattleListPresentationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleSearch = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value.trim()) {
			params.set("search", value.trim());
		} else {
			params.delete("search");
		}
		router.push(`/cattle?${params.toString()}`);
	};

	const clearSearch = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("search");
		router.push(`/cattle?${params.toString()}`);
	};

	const handleSort = (sortBy: string, sortOrder: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("sort_by", sortBy);
		params.set("sort_order", sortOrder);
		router.push(`/cattle?${params.toString()}`);
	};

	const handleFilterSubmit = (data: FilterFormData) => {
		const params = new URLSearchParams(searchParams.toString());

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

		router.push(`/cattle?${params.toString()}`);
	};

	const clearAllFilters = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("growth_stage");
		params.delete("gender");
		params.delete("status");
		router.push(`/cattle?${params.toString()}`);
	};

	const handleItemClick = (cattleId: number) => {
		router.push(`/cattle/${cattleId}`);
	};

	const handleAddEvent = (cattleId: number) => {
		router.push(`/events/new/${cattleId}`);
	};

	return (
		<div className="flex flex-col items-center">
			<div className="w-full pt-6">
				<SearchBar
					initialValue={searchParams.get("search") || ""}
					onSearch={handleSearch}
					onClear={clearSearch}
				/>

				<Separator />

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
						onSubmit={handleFilterSubmit}
						onClear={clearAllFilters}
					/>
				</div>
			</div>

			<Separator />

			{/* 検索結果の表示 */}
			{searchParams.get("search") && (
				<SearchResultBanner
					searchTerm={searchParams.get("search") || ""}
					onClearSearch={clearSearch}
				/>
			)}

			<div className="grid gap-4 w-full">
				{cattleList.map((cattle, index) => (
					<CattleItem
						key={cattle.cattleId}
						cattle={cattle}
						index={index}
						onItemClick={handleItemClick}
						onAddEvent={handleAddEvent}
					/>
				))}
			</div>
		</div>
	);
}
