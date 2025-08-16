export type ValidationError = {
	type: "ValidationError";
	message: string;
	issues?: Array<{ path: string; message: string }>;
};

export type Unauthorized = {
	type: "Unauthorized";
	message?: string;
};

export type Forbidden = {
	type: "Forbidden";
	message?: string;
};

export type NotFound = {
	type: "NotFound";
	entity: string;
	id?: string | number;
	message?: string;
};

export type Conflict = {
	type: "Conflict";
	message: string;
};

export type InfraError = {
	type: "InfraError";
	message: string;
	cause?: unknown;
};

export type DomainError =
	| ValidationError
	| Unauthorized
	| Forbidden
	| NotFound
	| Conflict
	| InfraError;
