import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetCattleDetailResType } from "@/services/cattleService";

export function Breeding({ cattle }: { cattle: GetCattleDetailResType }) {
	return (
		<div className="flex flex-col gap-2">
			{cattle.breedingStatus ? (
				<Card className="py-4 gap-2">
					<CardHeader className="px-4">
						<CardTitle>繁殖（現在の状態）</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-2 pt-0 flex flex-col gap-1">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">産次:</span>
							<span>{cattle.breedingStatus.parity ?? "-"}産</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">分娩予定日:</span>
							<span>{cattle.breedingStatus.expectedCalvingDate ?? "-"}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">妊娠鑑定予定日:</span>
							<span>
								{cattle.breedingStatus.scheduledPregnancyCheckDate ?? "-"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">分娩後経過日数:</span>
							<span>{cattle.breedingStatus.daysAfterCalving ?? "-"}日</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">空胎日数:</span>
							<span>{cattle.breedingStatus.daysOpen ?? "-"}日</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">妊娠日数:</span>
							<span>{cattle.breedingStatus.pregnancyDays ?? "-"}日</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">受精後日数:</span>
							<span>
								{cattle.breedingStatus.daysAfterInsemination ?? "-"}日
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">種付回数:</span>
							<span>{cattle.breedingStatus.inseminationCount ?? "-"}回</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">前回の出産:</span>
							<span>
								{cattle.breedingStatus.isDifficultBirth === null
									? "-"
									: cattle.breedingStatus.isDifficultBirth
										? "難産"
										: "安産"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">繁殖メモ:</span>
							<span>{cattle.breedingStatus.breedingMemo ?? "-"}</span>
						</div>
					</CardContent>
				</Card>
			) : (
				<p>読み込み中...</p>
			)}

			{cattle.breedingSummary ? (
				<Card className="py-4 gap-2">
					<CardHeader className="px-4">
						<CardTitle>繁殖（累計）</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-2 pt-0 flex flex-col gap-1">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">累計種付回数:</span>
							<span>
								{cattle.breedingSummary.totalInseminationCount !== null
									? `${cattle.breedingSummary.totalInseminationCount}回`
									: "-回"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">平均空胎日数:</span>
							<span>
								{cattle.breedingSummary.averageDaysOpen !== null
									? `${cattle.breedingSummary.averageDaysOpen}日`
									: "-日"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">平均妊娠期間:</span>
							<span>
								{cattle.breedingSummary.averagePregnancyPeriod !== null
									? `${cattle.breedingSummary.averagePregnancyPeriod}日`
									: "-日"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">平均分娩間隔:</span>
							<span>
								{cattle.breedingSummary.averageCalvingInterval !== null
									? `${cattle.breedingSummary.averageCalvingInterval}日`
									: "-日"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">難産回数:</span>
							<span>
								{cattle.breedingSummary.difficultBirthCount !== null
									? `${cattle.breedingSummary.difficultBirthCount}回`
									: "-回"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">受胎頭数:</span>
							<span>
								{cattle.breedingSummary.pregnancyHeadCount !== null
									? `${cattle.breedingSummary.pregnancyHeadCount}頭`
									: "-頭"}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">受胎率:</span>
							<span>
								{cattle.breedingSummary.pregnancySuccessRate !== null
									? `${cattle.breedingSummary.pregnancySuccessRate}％`
									: "-％"}
							</span>
						</div>
					</CardContent>
				</Card>
			) : (
				<p>読み込み中...</p>
			)}
			<div className="flex justify-center gap-2 text-xs text-gray-500">
				<p>登録日時: {cattle.createdAt}</p>/<p>更新日時: {cattle.updatedAt}</p>
			</div>
		</div>
	);
}
