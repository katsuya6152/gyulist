import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetCattleDetailResType } from "@/services/cattleService";

type Props = {
	cattle: GetCattleDetailResType;
};

export default function CattleDetailPresentation({ cattle }: Props) {
	return (
		<div className="container mx-auto py-8">
			<Card>
				<CardHeader>
					<CardTitle>牛の詳細情報</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<dt className="text-sm font-medium text-gray-500">
								個体識別番号
							</dt>
							<dd className="mt-1 text-lg">{cattle.identificationNumber}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">名前</dt>
							<dd className="mt-1 text-lg">{cattle.name || "未設定"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">品種</dt>
							<dd className="mt-1 text-lg">{cattle.breed || "未設定"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">体重</dt>
							<dd className="mt-1 text-lg">
								{cattle.weight ? `${cattle.weight}kg` : "未設定"}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">健康状態</dt>
							<dd className="mt-1 text-lg">
								{cattle.healthStatus || "未設定"}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">メモ</dt>
							<dd className="mt-1 text-lg">{cattle.notes || "未設定"}</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">登録日</dt>
							<dd className="mt-1 text-lg">
								{cattle.createdAt
									? new Date(cattle.createdAt).toLocaleDateString("ja-JP")
									: "未設定"}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">最終更新日</dt>
							<dd className="mt-1 text-lg">
								{cattle.updatedAt
									? new Date(cattle.updatedAt).toLocaleDateString("ja-JP")
									: "未設定"}
							</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
