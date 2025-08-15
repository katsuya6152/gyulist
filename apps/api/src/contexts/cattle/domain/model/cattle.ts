import type { Brand, CattleId, UserId } from "../../../../shared/brand";
import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";

export type GrowthStage =
	| "CALF"
	| "GROWING"
	| "FATTENING"
	| "FIRST_CALVED"
	| "MULTI_PAROUS";

export type Gender = "オス" | "メス";

export type Status =
	| "HEALTHY"
	| "PREGNANT"
	| "RESTING"
	| "TREATING"
	| "SHIPPED"
	| "DEAD";

export type IdentificationNumber = Brand<number, "IdentificationNumber">;
export type EarTagNumber = Brand<number, "EarTagNumber">;

export type Cattle = {
	cattleId: CattleId;
	ownerUserId: UserId;
	identificationNumber: IdentificationNumber;
	earTagNumber: EarTagNumber | null;
	name: string | null;
	gender: Gender | null;
	birthday: string | null; // ISO8601 (UTC)
	growthStage: GrowthStage | null;
	age: number | null;
	monthsOld: number | null;
	daysOld: number | null;
	breed: string | null;
	status: Status | null;
	producerName: string | null;
	barn: string | null;
	breedingValue: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

export type NewCattleProps = Omit<
	Cattle,
	"cattleId" | "age" | "monthsOld" | "daysOld" | "createdAt" | "updatedAt"
> & { cattleId?: CattleId };

export function createCattle(
	props: NewCattleProps
): Result<Cattle, DomainError> {
	// 不変条件: 誕生日は未来不可
	if (props.birthday) {
		const birth = new Date(props.birthday);
		if (Number.isNaN(birth.getTime())) {
			return err({
				type: "ValidationError",
				message: "Invalid birthday format"
			});
		}
		const now = new Date();
		if (birth.getTime() > now.getTime()) {
			return err({
				type: "ValidationError",
				message: "Birthday cannot be in the future"
			});
		}
	}

	// 年齢派生値の計算
	let age: number | null = null;
	let monthsOld: number | null = null;
	let daysOld: number | null = null;
	if (props.birthday) {
		const birth = new Date(props.birthday);
		const diffMs = Date.now() - birth.getTime();
		age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
		monthsOld = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
		daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	}

	const nowIso = new Date().toISOString();

	return ok({
		cattleId: (props.cattleId ?? (0 as unknown as CattleId)) as CattleId,
		ownerUserId: props.ownerUserId,
		identificationNumber: props.identificationNumber,
		earTagNumber: props.earTagNumber ?? null,
		name: props.name ?? null,
		gender: props.gender ?? null,
		birthday: props.birthday ?? null,
		growthStage: props.growthStage ?? null,
		age,
		monthsOld,
		daysOld,
		breed: props.breed ?? null,
		status: props.status ?? "HEALTHY",
		producerName: props.producerName ?? null,
		barn: props.barn ?? null,
		breedingValue: props.breedingValue ?? null,
		notes: props.notes ?? null,
		createdAt: nowIso,
		updatedAt: nowIso
	});
}
