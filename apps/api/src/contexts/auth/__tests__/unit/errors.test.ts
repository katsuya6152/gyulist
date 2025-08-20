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

describe("Auth Domain Errors", () => {
	describe("ValidationError", () => {
		it("should have correct structure", () => {
			const error: ValidationError = {
				type: "ValidationError",
				message: "Invalid email format",
				issues: [{ path: "email", message: "Invalid email format" }]
			};

			expect(error.type).toBe("ValidationError");
			expect(error.message).toBe("Invalid email format");
			expect(error.issues).toHaveLength(1);
			expect(error.issues?.[0]).toEqual({
				path: "email",
				message: "Invalid email format"
			});
		});

		it("should work without issues", () => {
			const error: ValidationError = {
				type: "ValidationError",
				message: "Invalid input"
			};

			expect(error.type).toBe("ValidationError");
			expect(error.message).toBe("Invalid input");
			expect(error.issues).toBeUndefined();
		});
	});

	describe("Unauthorized", () => {
		it("should have correct structure with message", () => {
			const error: Unauthorized = {
				type: "Unauthorized",
				message: "Invalid credentials"
			};

			expect(error.type).toBe("Unauthorized");
			expect(error.message).toBe("Invalid credentials");
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
				entity: "User",
				id: "user-123",
				message: "User not found"
			};

			expect(error.type).toBe("NotFound");
			expect(error.entity).toBe("User");
			expect(error.id).toBe("user-123");
			expect(error.message).toBe("User not found");
		});

		it("should work with minimal fields", () => {
			const error: NotFound = {
				type: "NotFound",
				entity: "User"
			};

			expect(error.type).toBe("NotFound");
			expect(error.entity).toBe("User");
			expect(error.id).toBeUndefined();
			expect(error.message).toBeUndefined();
		});

		it("should work with numeric id", () => {
			const error: NotFound = {
				type: "NotFound",
				entity: "User",
				id: 123
			};

			expect(error.id).toBe(123);
		});
	});

	describe("Conflict", () => {
		it("should have correct structure", () => {
			const error: Conflict = {
				type: "Conflict",
				message: "User already exists"
			};

			expect(error.type).toBe("Conflict");
			expect(error.message).toBe("User already exists");
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
				message: "Invalid credentials"
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
				entity: "User"
			};
			expect(error.type).toBe("NotFound");
		});

		it("should accept Conflict", () => {
			const error: DomainError = {
				type: "Conflict",
				message: "User already exists"
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
				{ type: "Unauthorized", message: "Invalid credentials" },
				{ type: "Forbidden", message: "Insufficient permissions" },
				{ type: "NotFound", entity: "User" },
				{ type: "Conflict", message: "User already exists" },
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
	});
});
