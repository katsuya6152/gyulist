import type { Brand } from "../../../../shared/brand";

// 牛管理ドメイン固有の値型
export type Weight = Brand<number, "Weight">;
export type Score = Brand<number, "Score">;
export type CattleName = Brand<string, "CattleName">;
export type Breed = Brand<string, "Breed">;
export type Barn = Brand<string, "Barn">;
export type BreedingValue = Brand<string, "BreedingValue">;
export type Notes = Brand<string, "Notes">;
export type ProducerName = Brand<string, "ProducerName">;

// 識別番号系（牛管理ドメイン固有だが、複数ドメインで使用される可能性がある）
export type IdentificationNumber = Brand<number, "IdentificationNumber">;
export type EarTagNumber = Brand<number, "EarTagNumber">;

// 繁殖管理ドメイン固有の値型
export type Parity = Brand<number, "Parity">;
export type DaysAfterCalving = Brand<number, "DaysAfterCalving">;
export type DaysOpen = Brand<number, "DaysOpen">;
export type PregnancyDays = Brand<number, "PregnancyDays">;
export type DaysAfterInsemination = Brand<number, "DaysAfterInsemination">;
export type InseminationCount = Brand<number, "InseminationCount">;
export type BreedingMemo = Brand<string, "BreedingMemo">;
export type DaysCount = Brand<number, "DaysCount">;
export type PregnancyRate = Brand<number, "PregnancyRate">;

// 血統管理ドメイン固有の値型
export type FatherName = Brand<string, "FatherName">;
export type MotherFatherName = Brand<string, "MotherFatherName">;
export type MotherGrandFatherName = Brand<string, "MotherGrandFatherName">;
export type MotherGreatGrandFatherName = Brand<
	string,
	"MotherGreatGrandFatherName"
>;

// 母情報ドメイン固有の値型
export type MotherName = Brand<string, "MotherName">;
export type MotherIdentificationNumber = Brand<
	string,
	"MotherIdentificationNumber"
>;
export type MotherScore = Brand<number, "MotherScore">;

// 繁殖統計ドメイン固有の値型
export type TotalInseminationCount = Brand<number, "TotalInseminationCount">;
export type AverageDaysOpen = Brand<number, "AverageDaysOpen">;
export type AveragePregnancyPeriod = Brand<number, "AveragePregnancyPeriod">;
export type AverageCalvingInterval = Brand<number, "AverageCalvingInterval">;
export type DifficultBirthCount = Brand<number, "DifficultBirthCount">;
export type PregnancyHeadCount = Brand<number, "PregnancyHeadCount">;
export type PregnancySuccessRate = Brand<number, "PregnancySuccessRate">;
