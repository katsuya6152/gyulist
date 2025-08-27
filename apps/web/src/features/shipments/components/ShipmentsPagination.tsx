import { Button } from "@/components/ui/button";
import type { Pagination } from "@/services/shipmentService";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
	pagination: Pagination;
	onPageChange: (page: number) => void;
};

export function ShipmentsPagination({ pagination, onPageChange }: Props) {
	const { page, totalPages, total } = pagination;

	if (totalPages <= 1) {
		return null;
	}

	const startIndex = (page - 1) * pagination.limit + 1;
	const endIndex = Math.min(page * pagination.limit, total);

	return (
		<div className="flex items-center justify-between">
			<div className="text-sm text-muted-foreground">
				{total} 件中 {startIndex}-{endIndex} 件を表示
			</div>

			<div className="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
				>
					<ChevronLeft className="h-4 w-4" />
					前へ
				</Button>

				<div className="flex items-center space-x-1">
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						let pageNum: number;
						if (totalPages <= 5) {
							pageNum = i + 1;
						} else if (page <= 3) {
							pageNum = i + 1;
						} else if (page >= totalPages - 2) {
							pageNum = totalPages - 4 + i;
						} else {
							pageNum = page - 2 + i;
						}

						return (
							<Button
								key={pageNum}
								variant={page === pageNum ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange(pageNum)}
							>
								{pageNum}
							</Button>
						);
					})}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
				>
					次へ
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
