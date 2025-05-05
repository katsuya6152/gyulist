import { LogoutButton } from "@/components/logout-button";
import { fetchCattleList } from "@/services/cattleService";
import { notFound } from "next/navigation";

type Cattle = {
	cattleId: number;
	ownerUserId: number;
	identificationNumber: number;
	earTagNumber: number | null;
	name: string | null;
	growthStage:
		| "CALF"
		| "GROWING"
		| "FATTENING"
		| "FIRST_CALVED"
		| "MULTI_PAROUS"
		| null;
	birthday: string | null;
	age: number | null;
	monthsOld: number | null;
	daysOld: number | null;
	gender: string | null;
	weight: number | null;
	score: number | null;
	breed: string | null;
	healthStatus: string | null;
	producerName: string | null;
	barn: string | null;
	breedingValue: string | null;
	notes: string | null;
	createdAt: string | null;
	updatedAt: string | null;
};

type CattleResponse = {
	cattle: Cattle;
	mother_info: {
		motherInfoId: number;
		cattleId: number;
		motherCattleId: number;
		motherName: string | null;
		motherIdentificationNumber: string | null;
		motherScore: number | null;
	} | null;
	bloodline: {
		bloodlineId: number;
		cattleId: number;
		fatherCattleName: string | null;
		motherFatherCattleName: string | null;
		motherGrandFatherCattleName: string | null;
		motherGreatGrandFatherCattleName: string | null;
	} | null;
};

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
