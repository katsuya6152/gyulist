import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { BasicInfo } from "./components/basic-info";
import { CattleDetailHeader } from "./components/hedear";

type Props = {
	cattle: GetCattleDetailResType;
};

export default function CattleDetailPresentation({ cattle }: Props) {
	return (
		<div className="p-4">
			{cattle ? (
				<div className="mt-4 flex flex-col gap-4">
					<CattleDetailHeader cattle={cattle} />

					<Tabs defaultValue="basic" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="basic">基本情報</TabsTrigger>
							<TabsTrigger value="bloodline">血統</TabsTrigger>
							<TabsTrigger value="breeding">繁殖</TabsTrigger>
							<TabsTrigger value="history">活動履歴</TabsTrigger>
						</TabsList>

						<TabsContent value="basic">
							<BasicInfo cattle={cattle} />
						</TabsContent>
						<TabsContent value="bloodline">
							Bloodline
							<BasicInfo cattle={cattle} />
							{/* <Bloodline cattle={cattle} /> */}
						</TabsContent>
						<TabsContent value="breeding">
							Breeding
							<BasicInfo cattle={cattle} />
							{/* <Breeding
								statusData={breedingStatus?.data}
								summaryData={breedingSummary?.data}
							/> */}
						</TabsContent>
						<TabsContent value="history">
							History
							<BasicInfo cattle={cattle} />
							{/* <History eventData={events?.data} /> */}
						</TabsContent>
					</Tabs>

					<div className="flex justify-center gap-2 text-xs text-gray-500">
						<p>
							登録日時:
							{cattle.createdAt}
						</p>
						/
						<p>
							更新日時:
							{cattle.updatedAt}
						</p>
					</div>
				</div>
			) : (
				<p>読み込み中...</p>
			)}
		</div>
	);
}
