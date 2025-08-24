/**
 * Registration Repository Implementation
 *
 * 事前登録ドメインのリポジトリ実装（Drizzle ORM使用）
 */

import { and, count, desc, eq, gte, like, lte } from "drizzle-orm";
import type { AnyD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { emailLogs, registrations } from "../../../db/schema";
import type { RegistrationError } from "../../../domain/errors/registration/RegistrationErrors";
import type {
	RegistrationRepository,
	SearchRegistrationsParams,
	SearchRegistrationsResult
} from "../../../domain/ports/registration";
import type {
	EmailLog,
	ReferralSource,
	Registration,
	RegistrationId,
	RegistrationStatus,
	Timestamp
} from "../../../domain/types/registration";
import type { Result } from "../../../shared/result";
import { err, ok } from "../../../shared/result";
import {
	mapEmailLogToDbInsert,
	mapRawEmailLogToEmailLog,
	mapRawEmailLogsToEmailLogs,
	mapRawRegistrationToRegistration,
	mapRawRegistrationsToRegistrations,
	mapReferralSourceUpdateToDbUpdate,
	mapRegistrationToDbInsert,
	mapStatusUpdateToDbUpdate
} from "../mappers/registrationDbMapper";

// ============================================================================
// Memory Database Type (for testing)
// ============================================================================

type MemoryDB = {
	registrations: Array<{
		id: string;
		email: string;
		referralSource: string | null;
		status: string;
		locale: string;
		createdAt: number;
		updatedAt: number;
	}>;
	email_logs: Array<{
		id: string;
		email: string;
		type: string;
		httpStatus?: number;
		resendId?: string | null;
		error?: string | null;
		createdAt: number;
	}>;
};

// ============================================================================
// Repository Implementation
// ============================================================================

/**
 * Drizzle ORMを使用した事前登録リポジトリの実装
 */
export class RegistrationRepositoryImpl implements RegistrationRepository {
	private readonly db?: ReturnType<typeof drizzle>;
	private readonly isMemoryDb: boolean;
	private readonly memoryDb?: MemoryDB;

	constructor(dbInstance: AnyD1Database | MemoryDB) {
		this.isMemoryDb = Array.isArray((dbInstance as MemoryDB).registrations);

		if (this.isMemoryDb) {
			this.memoryDb = dbInstance as MemoryDB;
			// Memory DBの場合は使用しない
		} else {
			this.db = drizzle(dbInstance as AnyD1Database);
		}
	}

	async findByEmail(
		email: string
	): Promise<Result<Registration | null, RegistrationError>> {
		try {
			if (this.isMemoryDb && this.memoryDb) {
				const row = this.memoryDb.registrations.find((r) => r.email === email);
				return ok(row ? mapRawRegistrationToRegistration(row) : null);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const rows = await this.db
				.select()
				.from(registrations)
				.where(eq(registrations.email, email))
				.limit(1);

			const row = rows[0];
			return ok(row ? mapRawRegistrationToRegistration(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find registration by email",
				cause
			});
		}
	}

	async findById(
		id: RegistrationId
	): Promise<Result<Registration | null, RegistrationError>> {
		try {
			if (this.isMemoryDb && this.memoryDb) {
				const row = this.memoryDb.registrations.find(
					(r) => r.id === (id as string)
				);
				return ok(row ? mapRawRegistrationToRegistration(row) : null);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const rows = await this.db
				.select()
				.from(registrations)
				.where(eq(registrations.id, id as string))
				.limit(1);

			const row = rows[0];
			return ok(row ? mapRawRegistrationToRegistration(row) : null);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find registration by ID",
				cause
			});
		}
	}

	async create(
		registration: Registration
	): Promise<Result<Registration, RegistrationError>> {
		try {
			const insertData = mapRegistrationToDbInsert(registration);

			if (this.isMemoryDb && this.memoryDb) {
				this.memoryDb.registrations.push(insertData);
				return ok(registration);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const result = await this.db
				.insert(registrations)
				.values({
					id: insertData.id,
					email: insertData.email,
					referralSource: insertData.referralSource,
					status: insertData.status,
					locale: insertData.locale,
					createdAt: insertData.createdAt,
					updatedAt: insertData.updatedAt
				})
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "InfraError",
					message: "Failed to create registration - no data returned"
				});
			}

			return ok(mapRawRegistrationToRegistration(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create registration",
				cause
			});
		}
	}

	async search(
		params: SearchRegistrationsParams
	): Promise<Result<SearchRegistrationsResult, RegistrationError>> {
		try {
			if (this.isMemoryDb && this.memoryDb) {
				let items = [...this.memoryDb.registrations];

				// フィルタリング
				if (params.query) {
					const query = params.query;
					items = items.filter((r) => r.email.includes(query));
				}
				if (params.fromDate) {
					const fromTimestamp = Math.floor(params.fromDate.getTime() / 1000);
					items = items.filter((r) => r.createdAt >= fromTimestamp);
				}
				if (params.toDate) {
					const toTimestamp = Math.floor(params.toDate.getTime() / 1000);
					items = items.filter((r) => r.createdAt <= toTimestamp);
				}
				if (params.referralSource) {
					items = items.filter(
						(r) => r.referralSource === params.referralSource
					);
				}

				// ソートとページネーション
				items.sort((a, b) => b.createdAt - a.createdAt);
				const total = items.length;
				const sliced = items.slice(params.offset, params.offset + params.limit);

				return ok({
					items: mapRawRegistrationsToRegistrations(sliced),
					total
				});
			}

			// Drizzle ORM での検索
			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const conditions = [];

			if (params.query) {
				conditions.push(like(registrations.email, `%${params.query}%`));
			}
			if (params.fromDate) {
				const fromTimestamp = Math.floor(params.fromDate.getTime() / 1000);
				conditions.push(gte(registrations.createdAt, fromTimestamp));
			}
			if (params.toDate) {
				const toTimestamp = Math.floor(params.toDate.getTime() / 1000);
				conditions.push(lte(registrations.createdAt, toTimestamp));
			}
			if (params.referralSource) {
				conditions.push(
					eq(registrations.referralSource, params.referralSource)
				);
			}

			const whereCondition =
				conditions.length > 0 ? and(...conditions) : undefined;

			// アイテム取得
			const items = await this.db
				.select()
				.from(registrations)
				.where(whereCondition)
				.orderBy(desc(registrations.createdAt))
				.limit(params.limit)
				.offset(params.offset);

			// 総件数取得
			const totalResult = await this.db
				.select({ count: count() })
				.from(registrations)
				.where(whereCondition);

			const total = totalResult[0]?.count ?? 0;

			return ok({
				items: mapRawRegistrationsToRegistrations(items),
				total
			});
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to search registrations",
				cause
			});
		}
	}

	async updateStatus(
		id: RegistrationId,
		status: RegistrationStatus,
		reason?: string
	): Promise<Result<Registration, RegistrationError>> {
		try {
			const currentTime = Math.floor(Date.now() / 1000) as Timestamp;
			const updateData = mapStatusUpdateToDbUpdate(status, currentTime);

			if (this.isMemoryDb && this.memoryDb) {
				const index = this.memoryDb.registrations.findIndex(
					(r) => r.id === (id as string)
				);
				if (index === -1) {
					return err({
						type: "NotFoundError",
						message: "Registration not found",
						id: id as string
					});
				}

				this.memoryDb.registrations[index] = {
					...this.memoryDb.registrations[index],
					...updateData
				};

				return ok(
					mapRawRegistrationToRegistration(this.memoryDb.registrations[index])
				);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const result = await this.db
				.update(registrations)
				.set(updateData)
				.where(eq(registrations.id, id as string))
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "NotFoundError",
					message: "Registration not found",
					id: id as string
				});
			}

			return ok(mapRawRegistrationToRegistration(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update registration status",
				cause
			});
		}
	}

	async updateReferralSource(
		id: RegistrationId,
		referralSource: ReferralSource | null
	): Promise<Result<Registration, RegistrationError>> {
		try {
			const currentTime = Math.floor(Date.now() / 1000) as Timestamp;
			const updateData = mapReferralSourceUpdateToDbUpdate(
				referralSource,
				currentTime
			);

			if (this.isMemoryDb && this.memoryDb) {
				const index = this.memoryDb.registrations.findIndex(
					(r) => r.id === (id as string)
				);
				if (index === -1) {
					return err({
						type: "NotFoundError",
						message: "Registration not found",
						id: id as string
					});
				}

				this.memoryDb.registrations[index] = {
					...this.memoryDb.registrations[index],
					...updateData
				};

				return ok(
					mapRawRegistrationToRegistration(this.memoryDb.registrations[index])
				);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const result = await this.db
				.update(registrations)
				.set(updateData)
				.where(eq(registrations.id, id as string))
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "NotFoundError",
					message: "Registration not found",
					id: id as string
				});
			}

			return ok(mapRawRegistrationToRegistration(row));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to update referral source",
				cause
			});
		}
	}

	async delete(id: RegistrationId): Promise<Result<void, RegistrationError>> {
		try {
			if (this.isMemoryDb && this.memoryDb) {
				const index = this.memoryDb.registrations.findIndex(
					(r) => r.id === (id as string)
				);
				if (index === -1) {
					return err({
						type: "NotFoundError",
						message: "Registration not found",
						id: id as string
					});
				}

				this.memoryDb.registrations.splice(index, 1);
				return ok(undefined);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const result = await this.db
				.delete(registrations)
				.where(eq(registrations.id, id as string))
				.returning();

			if (result.length === 0) {
				return err({
					type: "NotFoundError",
					message: "Registration not found",
					id: id as string
				});
			}

			return ok(undefined);
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to delete registration",
				cause
			});
		}
	}

	async createEmailLog(
		emailLog: EmailLog
	): Promise<Result<EmailLog, RegistrationError>> {
		try {
			const insertData = mapEmailLogToDbInsert(emailLog);

			if (this.isMemoryDb && this.memoryDb) {
				this.memoryDb.email_logs.push(insertData);
				return ok(emailLog);
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const result = await this.db
				.insert(emailLogs)
				.values({
					id: insertData.id,
					email: insertData.email,
					type: insertData.type,
					httpStatus: insertData.httpStatus,
					resendId: insertData.resendId,
					error: insertData.error,
					createdAt: insertData.createdAt
				})
				.returning();

			const row = result[0];
			if (!row) {
				return err({
					type: "InfraError",
					message: "Failed to create email log - no data returned"
				});
			}

			// Convert null to undefined for domain type compatibility
			const domainRow = {
				...row,
				httpStatus: row.httpStatus ?? undefined,
				resendId: row.resendId ?? undefined,
				error: row.error ?? undefined
			};

			return ok(mapRawEmailLogToEmailLog(domainRow));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to create email log",
				cause
			});
		}
	}

	async findEmailLogsByEmail(
		email: string,
		limit = 50
	): Promise<Result<EmailLog[], RegistrationError>> {
		try {
			if (this.isMemoryDb && this.memoryDb) {
				const logs = this.memoryDb.email_logs
					.filter((log) => log.email === email)
					.sort((a, b) => b.createdAt - a.createdAt)
					.slice(0, limit);

				return ok(mapRawEmailLogsToEmailLogs(logs));
			}

			if (!this.db) {
				return err({
					type: "InfraError",
					message: "Database not available"
				});
			}

			const rows = await this.db
				.select()
				.from(emailLogs)
				.where(eq(emailLogs.email, email))
				.orderBy(desc(emailLogs.createdAt))
				.limit(limit);

			// Convert null to undefined for domain type compatibility
			const domainRows = rows.map((row) => ({
				...row,
				httpStatus: row.httpStatus ?? undefined,
				resendId: row.resendId ?? undefined,
				error: row.error ?? undefined
			}));

			return ok(mapRawEmailLogsToEmailLogs(domainRows));
		} catch (cause) {
			return err({
				type: "InfraError",
				message: "Failed to find email logs by email",
				cause
			});
		}
	}
}
