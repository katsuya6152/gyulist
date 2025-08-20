import { describe, expect, it } from "vitest";
import type {
	Conflict,
	DomainError,
	Forbidden,
	InfraError,
	NotFound,
	Unauthorized,
	ValidationError
} from "../../domain/errors";

describe("Cattle Domain Errors", () => {
	describe("ValidationError", () => {
		it("should have correct structure with all fields", () => {
			const error: ValidationError = {
				type: "ValidationError",
				message: "Invalid cattle ID",
				field: "cattleId",
				issues: [{ path: "cattleId", message: "Invalid cattle ID" }]
			};

			expect(error.type).toBe("ValidationError");
			expect(error.message).toBe("Invalid cattle ID");
			expect(error.field).toBe("cattleId");
			expect(error.issues).toHaveLength(1);
			expect(error.issues?.[0]).toEqual({
				path: "cattleId",
				message: "Invalid cattle ID"
			});
		});

		it("should work without optional fields", () => {
			const error: ValidationError = {
				type: "ValidationError",
				message: "Invalid input"
			};

			expect(error.type).toBe("ValidationError");
			expect(error.message).toBe("Invalid input");
			expect(error.field).toBeUndefined();
			expect(error.issues).toBeUndefined();
		});
	});

	describe("Unauthorized", () => {
		it("should have correct structure with message", () => {
			const error: Unauthorized = {
				type: "Unauthorized",
				message: "Authentication required"
			};

			expect(error.type).toBe("Unauthorized");
			expect(error.message).toBe("Authentication required");
		});

		it("should work without message", () => {
			const error: Unauthorized = {
				type: "Unauthorized"
			};

			expect(error.type).toBe("Unauthorized");
			expect(error.message).toBeUndefined();
		});
	});

	describe("Forbidden", () => {
		it("should have correct structure with message", () => {
			const error: Forbidden = {
				type: "Forbidden",
				message: "Insufficient permissions"
			};

			expect(error.type).toBe("Forbidden");
			expect(error.message).toBe("Insufficient permissions");
		});

		it("should work without message", () => {
			const error: Forbidden = {
				type: "Forbidden"
			};

			expect(error.type).toBe("Forbidden");
			expect(error.message).toBeUndefined();
		});
	});

	describe("NotFound", () => {
		it("should have correct structure with all fields", () => {
			const error: NotFound = {
				type: "NotFound",
				entity: "Cattle",
				id: "cattle-123",
				message: "Cattle not found"
			};

			expect(error.type).toBe("NotFound");
			expect(error.entity).toBe("Cattle");
			expect(error.id).toBe("cattle-123");
			expect(error.message).toBe("Cattle not found");
		});

		it("should work with numeric id", () => {
			const error: NotFound = {
				type: "NotFound",
				entity: "Cattle",
				id: 123
			};

			expect(error.id).toBe(123);
		});

		it("should work with minimal fields", () => {
			const error: NotFound = {
				type: "NotFound",
				entity: "Cattle"
			};

			expect(error.type).toBe("NotFound");
			expect(error.entity).toBe("Cattle");
			expect(error.id).toBeUndefined();
			expect(error.message).toBeUndefined();
		});
	});

	describe("Conflict", () => {
		it("should have correct structure with all fields", () => {
			const error: Conflict = {
				type: "Conflict",
				message: "Cattle already exists",
				conflictingField: "earTagNumber"
			};

			expect(error.type).toBe("Conflict");
			expect(error.message).toBe("Cattle already exists");
			expect(error.conflictingField).toBe("earTagNumber");
		});

		it("should work without conflictingField", () => {
			const error: Conflict = {
				type: "Conflict",
				message: "Cattle already exists"
			};

			expect(error.type).toBe("Conflict");
			expect(error.message).toBe("Cattle already exists");
			expect(error.conflictingField).toBeUndefined();
		});
	});

	describe("InfraError", () => {
		it("should have correct structure with cause", () => {
			const cause = new Error("Database connection failed");
			const error: InfraError = {
				type: "InfraError",
				message: "Database error",
				cause
			};

			expect(error.type).toBe("InfraError");
			expect(error.message).toBe("Database error");
			expect(error.cause).toBe(cause);
		});

		it("should work without cause", () => {
			const error: InfraError = {
				type: "InfraError",
				message: "Database error"
			};

			expect(error.type).toBe("InfraError");
			expect(error.message).toBe("Database error");
			expect(error.cause).toBeUndefined();
		});
	});

	describe("DomainError union type", () => {
		it("should accept ValidationError", () => {
			const error: DomainError = {
				type: "ValidationError",
				message: "Invalid input"
			};
			expect(error.type).toBe("ValidationError");
		});

		it("should accept Unauthorized", () => {
			const error: DomainError = {
				type: "Unauthorized",
				message: "Authentication required"
			};
			expect(error.type).toBe("Unauthorized");
		});

		it("should accept Forbidden", () => {
			const error: DomainError = {
				type: "Forbidden",
				message: "Insufficient permissions"
			};
			expect(error.type).toBe("Forbidden");
		});

		it("should accept NotFound", () => {
			const error: DomainError = {
				type: "NotFound",
				entity: "Cattle"
			};
			expect(error.type).toBe("NotFound");
		});

		it("should accept Conflict", () => {
			const error: DomainError = {
				type: "Conflict",
				message: "Cattle already exists"
			};
			expect(error.type).toBe("Conflict");
		});

		it("should accept InfraError", () => {
			const error: DomainError = {
				type: "InfraError",
				message: "Database error"
			};
			expect(error.type).toBe("InfraError");
		});
	});

	describe("Type safety", () => {
		it("should ensure all error types are properly typed", () => {
			const errors: DomainError[] = [
				{ type: "ValidationError", message: "Invalid input" },
				{ type: "Unauthorized", message: "Authentication required" },
				{ type: "Forbidden", message: "Insufficient permissions" },
				{ type: "NotFound", entity: "Cattle" },
				{ type: "Conflict", message: "Cattle already exists" },
				{ type: "InfraError", message: "Database error" }
			];

			expect(errors).toHaveLength(6);
			expect(errors[0].type).toBe("ValidationError");
			expect(errors[1].type).toBe("Unauthorized");
			expect(errors[2].type).toBe("Forbidden");
			expect(errors[3].type).toBe("NotFound");
			expect(errors[4].type).toBe("Conflict");
			expect(errors[5].type).toBe("InfraError");
		});

		it("should handle different id types in NotFound", () => {
			const stringIdError: NotFound = {
				type: "NotFound",
				entity: "Cattle",
				id: "cattle-123"
			};

			const numericIdError: NotFound = {
				type: "NotFound",
				entity: "Cattle",
				id: 123
			};

			expect(typeof stringIdError.id).toBe("string");
			expect(typeof numericIdError.id).toBe("number");
		});
	});
});
