import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type {
	FatherName,
	MotherFatherName,
	MotherGrandFatherName,
	MotherGreatGrandFatherName
} from "./types";

// Bloodline Value Object
export type Bloodline = {
	readonly fatherName: FatherName | null;
	readonly motherFatherName: MotherFatherName | null;
	readonly motherGrandFatherName: MotherGrandFatherName | null;
	readonly motherGreatGrandFatherName: MotherGreatGrandFatherName | null;
};

// Factory function for creating bloodline with validation
export function createBloodline(props: {
	fatherName?: string | null;
	motherFatherName?: string | null;
	motherGrandFatherName?: string | null;
	motherGreatGrandFatherName?: string | null;
}): Result<Bloodline, DomainError> {
	// Validation: names should not be empty strings
	const validateName = (
		name: string | null | undefined,
		field: string
	): string | null => {
		if (name === undefined || name === null) return null;
		if (typeof name === "string" && name.trim() === "") return null;
		if (typeof name !== "string") {
			throw new Error(`${field} must be a string`);
		}
		return name.trim();
	};

	try {
		const fatherName = validateName(props.fatherName, "fatherName");
		const motherFatherName = validateName(
			props.motherFatherName,
			"motherFatherName"
		);
		const motherGrandFatherName = validateName(
			props.motherGrandFatherName,
			"motherGrandFatherName"
		);
		const motherGreatGrandFatherName = validateName(
			props.motherGreatGrandFatherName,
			"motherGreatGrandFatherName"
		);

		return ok({
			fatherName: fatherName as FatherName | null,
			motherFatherName: motherFatherName as MotherFatherName | null,
			motherGrandFatherName:
				motherGrandFatherName as MotherGrandFatherName | null,
			motherGreatGrandFatherName:
				motherGreatGrandFatherName as MotherGreatGrandFatherName | null
		});
	} catch (error) {
		return err({
			type: "ValidationError",
			message: error instanceof Error ? error.message : "Invalid bloodline data"
		});
	}
}

// Pure function to check if bloodline has any data
export function hasBloodlineData(bloodline: Bloodline): boolean {
	return !!(
		bloodline.fatherName ||
		bloodline.motherFatherName ||
		bloodline.motherGrandFatherName ||
		bloodline.motherGreatGrandFatherName
	);
}

// Pure function to get bloodline depth (how many generations are recorded)
export function getBloodlineDepth(bloodline: Bloodline): number {
	let depth = 0;
	if (bloodline.fatherName) depth = Math.max(depth, 1);
	if (bloodline.motherFatherName) depth = Math.max(depth, 2);
	if (bloodline.motherGrandFatherName) depth = Math.max(depth, 3);
	if (bloodline.motherGreatGrandFatherName) depth = Math.max(depth, 4);
	return depth;
}
