export type Brand<T, K extends string> = T & { readonly __brand: K };

// 複数ドメインで共有される基本的なID型
export type UserId = Brand<number, "UserId">;
export type SessionId = Brand<string, "SessionId">;
export type RegistrationId = Brand<string, "RegistrationId">;

// 牛群管理系（複数ドメインで使用）
export type CattleId = Brand<number, "CattleId">;

// 繁殖・血統管理系（複数ドメインで使用）
export type BreedingId = Brand<number, "BreedingId">;
export type BloodlineId = Brand<number, "BloodlineId">;
export type MotherInfoId = Brand<number, "MotherInfoId">;
export type BreedingStatusId = Brand<number, "BreedingStatusId">;
export type BreedingSummaryId = Brand<number, "BreedingSummaryId">;

// イベント・アラート管理系（複数ドメインで使用）
export type EventId = Brand<number, "EventId">;
export type AlertId = Brand<string, "AlertId">;
export type HistoryId = Brand<number, "HistoryId">;

// システム管理系（複数ドメインで使用）
export type EmailLogId = Brand<string, "EmailLogId">;
export type ResendId = Brand<string, "ResendId">;
