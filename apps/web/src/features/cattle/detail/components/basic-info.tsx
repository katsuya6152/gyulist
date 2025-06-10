import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetCattleDetailResType } from "@/services/cattleService";

export function BasicInfo({ cattle }: { cattle: GetCattleDetailResType }) {
	return (
		<div className="flex flex-col gap-2">
			<Card className="py-4 gap-2">
				<CardHeader className="px-4">
					<CardTitle>基本情報</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-2 pt-0 flex flex-col gap-1">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">個体識別番号:</span>
						<span>{cattle.identificationNumber}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">出生日:</span>
						<span>{cattle.birthday}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">年齢/月齢/日齢:</span>
						<span>
							{cattle.age}歳/{cattle.monthsOld}ヶ月/
							{cattle.daysOld}日
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">得点:</span>
						<span>{cattle.score ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">品種:</span>
						<span>{cattle.breed ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">生産者:</span>
						<span>{cattle.producerName ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">牛舎:</span>
						<span>{cattle.barn ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">育種価:</span>
						<span>{cattle.breedingValue ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">備考:</span>
						<span>{cattle.notes ?? "-"}</span>
					</div>
				</CardContent>
			</Card>
			<div className="flex justify-center gap-2 text-xs text-gray-500">
				<p>登録日時: {cattle.createdAt}</p>/<p>更新日時: {cattle.updatedAt}</p>
			</div>
		</div>
	);
}
