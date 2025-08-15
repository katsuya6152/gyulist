export type HttpMappableDomainError = {
	type:
		| "ValidationError"
		| "Unauthorized"
		| "Forbidden"
		| "NotFound"
		| "Conflict"
		| "InfraError"
		| (string & {});
} & Record<string, unknown>;

export function toHttpStatus(e: HttpMappableDomainError): number {
	switch (e.type) {
		case "ValidationError":
			return 400;
		case "Unauthorized":
			return 401;
		case "Forbidden":
			return 403;
		case "NotFound":
			return 404;
		case "Conflict":
			return 409;
		default:
			return 500;
	}
}
