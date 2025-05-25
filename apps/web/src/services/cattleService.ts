import { client } from "@/lib/rpc";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Cattle = {
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

export async function fetchCattleList(): Promise<Cattle[]> {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	const res = await client.api.v1.cattle.$get(
		{},
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!res.ok) {
		redirect("/login");
	}
	const data = await res.json();
	return data.map((item: Cattle) => item);
}
