import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { fetchCattleList } from "@/services/cattleService";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = "edge";

export default async function CattlePage() {
	let cattleList: Awaited<ReturnType<typeof fetchCattleList>>;

	try {
		cattleList = await fetchCattleList();
	} catch (e) {
		console.error(e);
		notFound();
	}

	if (!cattleList) {
		notFound();
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-xl font-bold">牛の一覧</h1>
				<LogoutButton />
			</div>
			<div className="flex items-center gap-1 mb-6">
				<Button>
					<Link href="/cattle/new">新規登録</Link>
				</Button>
				<Button>
					<Link href="/cattle/1/edit">編集</Link>
				</Button>
				<Button>
					<Link href="/cattle/1">詳細</Link>
				</Button>
			</div>
			<div className="grid gap-4">
				{cattleList.map((cattle) => (
					<div
						key={cattle.cattleId}
						className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
					>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							<div>
								<p className="text-sm text-gray-500">個体識別番号</p>
								<p className="font-semibold">{cattle.identificationNumber}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">名前</p>
								<p className="font-semibold">{cattle.name}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">性別</p>
								<p className="font-semibold">{cattle.gender}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">成長段階</p>
								<p className="font-semibold">{cattle.growthStage}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">年齢</p>
								<p className="font-semibold">{cattle.age}歳</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">体重</p>
								<p className="font-semibold">{cattle.weight}kg</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">健康状態</p>
								<p className="font-semibold">{cattle.healthStatus}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">牛舎</p>
								<p className="font-semibold">{cattle.barn}</p>
							</div>
						</div>
						{cattle.notes && (
							<div className="mt-4">
								<p className="text-sm text-gray-500">備考</p>
								<p className="text-sm">{cattle.notes}</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
