/**
 * 構造化ログシステム
 * 本番環境での運用性向上とデバッグ効率化を目的とする
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
	userId?: number;
	requestId?: string;
	endpoint?: string;
	method?: string;
	duration?: number;
	statusCode?: number;
	[key: string]: unknown;
};

export interface StructuredLogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: LogContext;
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
}

class Logger {
	private isDevelopment: boolean;

	constructor(environment?: string) {
		// Cloudflare Workers環境では process.env が使用不可のため、
		// 環境変数を外部から注入する方式に変更
		this.isDevelopment = environment === "development";
	}

	private formatLog(entry: StructuredLogEntry): string {
		if (this.isDevelopment) {
			// 開発環境: 読みやすい形式
			const contextStr = entry.context
				? ` | Context: ${JSON.stringify(entry.context, null, 2)}`
				: "";
			const errorStr = entry.error
				? ` | Error: ${entry.error.name}: ${entry.error.message}`
				: "";
			return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`;
		}
		// 本番環境: JSON形式（ログ分析ツール向け）
		return JSON.stringify(entry);
	}

	private log(
		level: LogLevel,
		message: string,
		context?: LogContext,
		error?: Error
	): void {
		const entry: StructuredLogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			context,
			error: error
				? {
						name: error.name,
						message: error.message,
						stack: this.isDevelopment ? error.stack : undefined
					}
				: undefined
		};

		const formatted = this.formatLog(entry);

		// レベルに応じてconsoleメソッドを使い分け
		switch (level) {
			case "debug":
				console.debug(formatted);
				break;
			case "info":
				console.info(formatted);
				break;
			case "warn":
				console.warn(formatted);
				break;
			case "error":
				console.error(formatted);
				break;
			default:
				console.log(formatted);
		}
	}

	debug(message: string, context?: LogContext): void {
		this.log("debug", message, context);
	}

	info(message: string, context?: LogContext): void {
		this.log("info", message, context);
	}

	warn(message: string, context?: LogContext): void {
		this.log("warn", message, context);
	}

	error(message: string, context?: LogContext, error?: Error): void {
		this.log("error", message, context, error);
	}

	// API リクエスト専用のログメソッド
	apiRequest(
		method: string,
		endpoint: string,
		userId?: number,
		requestId?: string
	): void {
		this.info("API Request", {
			method,
			endpoint,
			userId,
			requestId
		});
	}

	// API レスポンス専用のログメソッド
	apiResponse(
		method: string,
		endpoint: string,
		statusCode: number,
		duration: number,
		userId?: number,
		requestId?: string
	): void {
		this.info("API Response", {
			method,
			endpoint,
			statusCode,
			duration,
			userId,
			requestId
		});
	}

	// バリデーションエラー専用のログメソッド
	validationError(endpoint: string, errors: unknown, userId?: number): void {
		this.warn("Validation Error", {
			endpoint,
			userId,
			validationErrors: errors
		});
	}

	// ビジネスロジックエラー専用のログメソッド
	businessError(
		message: string,
		errorType: string,
		context?: LogContext
	): void {
		this.warn("Business Logic Error", {
			...context,
			errorType,
			businessMessage: message
		});
	}

	// 予期しないエラー専用のログメソッド
	unexpectedError(message: string, error: Error, context?: LogContext): void {
		this.error("Unexpected Error", context, error);
	}
}

// ファクトリー関数でLoggerインスタンスを作成
export function createLogger(environment?: string): Logger {
	return new Logger(environment);
}

// Context から Logger を作成するヘルパー
export function getLogger(context?: {
	env?: { ENVIRONMENT?: string };
}): Logger {
	return createLogger(context?.env?.ENVIRONMENT);
}

// デフォルトインスタンス（後方互換性のため）
export const logger = createLogger();

// 便利な型定義
export type ApiLogContext = {
	method: string;
	endpoint: string;
	userId?: number;
	requestId?: string;
	duration?: number;
	statusCode?: number;
};
