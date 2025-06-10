import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetCattleDetailResType } from "@/services/cattleService";

export function Bloodline({ cattle }: { cattle: GetCattleDetailResType }) {
	return (
		<div className="flex flex-col gap-2">
			<Card className="py-4 gap-2">
				<CardHeader className="px-4">
					<CardTitle>血統情報</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-2 pt-0 flex flex-col gap-1">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">父:</span>
						<span>{cattle.bloodline?.fatherCattleName ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">母の父:</span>
						<span>{cattle.bloodline?.motherFatherCattleName ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">母の祖父:</span>
						<span>{cattle.bloodline?.motherGrandFatherCattleName ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">母の祖祖父:</span>
						<span>
							{cattle.bloodline?.motherGreatGrandFatherCattleName ?? "-"}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card className="py-4 gap-2">
				<CardHeader className="px-4">
					<CardTitle>母情報</CardTitle>
				</CardHeader>
				<CardContent className="px-4 pb-2 pt-0 flex flex-col gap-1">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">母の名前:</span>
						<span>{cattle.motherInfo?.motherName ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">母の個体識別番号:</span>
						<span>{cattle.motherInfo?.motherIdentificationNumber ?? "-"}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500">母の得点:</span>
						<span>{cattle.motherInfo?.motherScore ?? "-"}</span>
					</div>
				</CardContent>
			</Card>
			<div className="flex justify-center gap-2 text-xs text-gray-500">
				<p>登録日時: {cattle.createdAt}</p>/<p>更新日時: {cattle.updatedAt}</p>
			</div>
		</div>
	);
}
