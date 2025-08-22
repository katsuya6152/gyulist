import type { GetCattleDetailResType } from "@/services/cattleService";
import { BreedingHistory } from "./breeding-history";
import { BreedingSchedule } from "./breeding-schedule";
import { BreedingStatus } from "./breeding-status";

export function Breeding({ cattle }: { cattle: GetCattleDetailResType }) {
	return (
		<div className="flex flex-col gap-4">
			{/* 妊娠・分娩スケジュール */}
			<BreedingSchedule cattle={cattle} />

			{/* 繁殖状態（現在） */}
			<BreedingStatus cattle={cattle} />

			{/* 繁殖履歴・パフォーマンス */}
			<BreedingHistory cattle={cattle} />
		</div>
	);
}
