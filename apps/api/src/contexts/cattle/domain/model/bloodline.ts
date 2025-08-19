import type { Result } from "../../../../shared/result";
import { err, ok } from "../../../../shared/result";
import type { DomainError } from "../errors";
import type {
	FatherName,
	MotherFatherName,
	MotherGrandFatherName,
	MotherGreatGrandFatherName
} from "./types";

/**
 * 血統の値オブジェクト。
 *
 * - fatherName: 父の名前
 * - motherFatherName: 母方の父（外祖父）の名前
 * - motherGrandFatherName: 母方の祖父の名前
 * - motherGreatGrandFatherName: 母方の曾祖父の名前
 */
export type Bloodline = {
	/** 父名 */ readonly fatherName: FatherName | null;
	/** 母方父名 */ readonly motherFatherName: MotherFatherName | null;
	/** 母方祖父名 */ readonly motherGrandFatherName: MotherGrandFatherName | null;
	/** 母方曾祖父名 */ readonly motherGreatGrandFatherName: MotherGreatGrandFatherName | null;
};

/**
 * 血統のファクトリ（バリデーション付き）。
 *
 * 空文字は null として扱い、型の不一致はエラーとします。
 */
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

/**
 * いずれかの血統情報が設定されているかを判定します。
 */
export function hasBloodlineData(bloodline: Bloodline): boolean {
	return !!(
		bloodline.fatherName ||
		bloodline.motherFatherName ||
		bloodline.motherGrandFatherName ||
		bloodline.motherGreatGrandFatherName
	);
}

/**
 * 記録されている血統の世代の深さを返します（最大4）。
 */
export function getBloodlineDepth(bloodline: Bloodline): number {
	let depth = 0;
	if (bloodline.fatherName) depth = Math.max(depth, 1);
	if (bloodline.motherFatherName) depth = Math.max(depth, 2);
	if (bloodline.motherGrandFatherName) depth = Math.max(depth, 3);
	if (bloodline.motherGreatGrandFatherName) depth = Math.max(depth, 4);
	return depth;
}
