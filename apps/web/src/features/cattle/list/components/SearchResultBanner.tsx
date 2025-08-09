import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { memo } from "react";

interface SearchResultBannerProps {
	searchTerm: string;
	onClearSearch: () => void;
}

export const SearchResultBanner = memo(
	({ searchTerm, onClearSearch }: SearchResultBannerProps) => (
		<div className="w-full px-6 py-3 bg-muted/30 animate-fade-in">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					「<span className="font-medium text-foreground">{searchTerm}</span>
					」の検索結果
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClearSearch}
					className="h-7 px-2 text-xs hover:bg-muted/50"
				>
					<X className="h-3 w-3 mr-1" />
					検索をクリア
				</Button>
			</div>
		</div>
	),
);

SearchResultBanner.displayName = "SearchResultBanner";
