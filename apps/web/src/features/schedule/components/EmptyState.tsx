import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import type { DateFilter } from "../constants";

interface EmptyStateProps {
	currentFilter: DateFilter;
}

// 空状態コンポーネント
export const EmptyState = memo(({ currentFilter }: EmptyStateProps) => (
	<Card>
		<CardContent className="py-12">
			<div className="text-center text-gray-500">
				<Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
				<h3 className="text-xl font-medium mb-2">
					{currentFilter === "all"
						? "イベントが登録されていません"
						: "該当する日付のイベントがありません"}
				</h3>
				<Button asChild variant="outline" size="sm">
					<Link href="/cattle" className="text-primary">
						<CalendarPlus className="h-4 w-4 mr-1" />
						牛を選択してイベント追加
					</Link>
				</Button>
			</div>
		</CardContent>
	</Card>
));

EmptyState.displayName = "EmptyState";
