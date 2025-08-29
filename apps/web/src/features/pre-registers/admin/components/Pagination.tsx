import { Button } from "@/components/ui/button";
import { DEFAULT_PAGE_SIZE } from "../constants";
import type { QueryParams } from "../types";

interface PaginationProps {
	params: QueryParams;
	onParamsChange: (params: QueryParams) => void;
	hasNext: boolean;
	hasPrev: boolean;
}

export function Pagination({
	params,
	onParamsChange,
	hasNext,
	hasPrev
}: PaginationProps) {
	// Pagination helpers (use UI default limit 20 when undefined)
	const effectiveLimit = params.limit ?? DEFAULT_PAGE_SIZE;
	const effectiveOffset = params.offset ?? 0;

	const handlePrev = () => {
		const newOffset = Math.max(0, effectiveOffset - effectiveLimit);
		onParamsChange({ ...params, offset: newOffset });
	};

	const handleNext = () => {
		const newOffset = effectiveOffset + effectiveLimit;
		onParamsChange({ ...params, offset: newOffset });
	};

	return (
		<div className="flex items-center justify-end gap-2">
			<Button
				type="button"
				variant="outline"
				disabled={!hasPrev}
				onClick={handlePrev}
			>
				前へ
			</Button>
			<Button type="button" disabled={!hasNext} onClick={handleNext}>
				次へ
			</Button>
		</div>
	);
}
