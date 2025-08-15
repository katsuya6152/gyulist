export type Brand<T, K extends string> = T & { readonly __brand: K };

export type CattleId = Brand<number, "CattleId">;

export type UserId = Brand<number, "UserId">;

// 必要に応じて EarTagNumber, IdentificationNumber 等を追加
