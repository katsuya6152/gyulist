import { describe, expect, it } from "vitest";
import { type Result, err, isErr, isOk, ok } from "../result";

describe("Result Type and Utilities", () => {
	describe("Result type", () => {
		it("should define Result as union type", () => {
			// Test that Result can be both success and error
			const successResult: Result<string, Error> = {
				ok: true,
				value: "success"
			};
			const errorResult: Result<string, Error> = {
				ok: false,
				error: new Error("error")
			};

			expect(successResult.ok).toBe(true);
			expect(errorResult.ok).toBe(false);
		});

		it("should enforce type constraints", () => {
			// Success case should have value property
			const success: Result<number, string> = { ok: true, value: 42 };
			expect(success.value).toBe(42);

			// Error case should have error property
			const error: Result<number, string> = {
				ok: false,
				error: "error message"
			};
			expect(error.error).toBe("error message");
		});
	});

	describe("ok function", () => {
		it("should create success result", () => {
			const result = ok("success value");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("success value");
			}
		});

		it("should work with different types", () => {
			const stringResult = ok("string");
			const numberResult = ok(42);
			const objectResult = ok({ key: "value" });
			const arrayResult = ok([1, 2, 3]);

			if (stringResult.ok) expect(stringResult.value).toBe("string");
			if (numberResult.ok) expect(numberResult.value).toBe(42);
			if (objectResult.ok) expect(objectResult.value).toEqual({ key: "value" });
			if (arrayResult.ok) expect(arrayResult.value).toEqual([1, 2, 3]);
		});

		it("should have correct type inference", () => {
			const result = ok(123);
			// Type should be Result<number, never>
			if (result.ok) {
				expect(typeof result.value).toBe("number");
				expect(result.value).toBe(123);
			}
		});
	});

	describe("err function", () => {
		it("should create error result", () => {
			const result = err("error message");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe("error message");
			}
		});

		it("should work with different error types", () => {
			const stringError = err("string error");
			const numberError = err(404);
			const objectError = err({ code: 500, message: "server error" });
			const errorObject = err(new Error("error object"));

			if (!stringError.ok) expect(stringError.error).toBe("string error");
			if (!numberError.ok) expect(numberError.error).toBe(404);
			if (!objectError.ok)
				expect(objectError.error).toEqual({
					code: 500,
					message: "server error"
				});
			if (!errorObject.ok) expect(errorObject.error).toBeInstanceOf(Error);
		});

		it("should have correct type inference", () => {
			const result = err("error");
			// Type should be Result<never, string>
			if (!result.ok) {
				expect(typeof result.error).toBe("string");
				expect(result.error).toBe("error");
			}
		});
	});

	describe("isOk function", () => {
		it("should return true for success results", () => {
			const successResult = ok("success");
			expect(isOk(successResult)).toBe(true);
		});

		it("should return false for error results", () => {
			const errorResult = err("error");
			expect(isOk(errorResult)).toBe(false);
		});

		it("should act as type guard for success", () => {
			const result: Result<string, Error> = ok("success");

			if (isOk(result)) {
				// TypeScript should know this is success case
				expect(result.value).toBe("success");
			}
		});

		it("should work with different value types", () => {
			const stringResult = ok("string");
			const numberResult = ok(42);
			const objectResult = ok({ key: "value" });

			expect(isOk(stringResult)).toBe(true);
			expect(isOk(numberResult)).toBe(true);
			expect(isOk(objectResult)).toBe(true);
		});
	});

	describe("isErr function", () => {
		it("should return true for error results", () => {
			const errorResult = err("error");
			expect(isErr(errorResult)).toBe(true);
		});

		it("should return false for success results", () => {
			const successResult = ok("success");
			expect(isErr(successResult)).toBe(false);
		});

		it("should act as type guard for error", () => {
			const result: Result<string, Error> = err(new Error("error"));

			if (isErr(result)) {
				// TypeScript should know this is error case
				expect(result.error).toBeInstanceOf(Error);
			}
		});

		it("should work with different error types", () => {
			const stringError = err("string error");
			const numberError = err(404);
			const objectError = err({ code: 500 });

			expect(isErr(stringError)).toBe(true);
			expect(isErr(numberError)).toBe(true);
			expect(isErr(objectError)).toBe(true);
		});
	});

	describe("Type safety and edge cases", () => {
		it("should handle null and undefined values", () => {
			const nullResult = ok(null);
			const undefinedResult = ok(undefined);

			expect(isOk(nullResult)).toBe(true);
			expect(isOk(undefinedResult)).toBe(true);
			if (nullResult.ok) expect(nullResult.value).toBeNull();
			if (undefinedResult.ok) expect(undefinedResult.value).toBeUndefined();
		});

		it("should handle complex nested types", () => {
			type ComplexType = {
				nested: {
					array: number[];
					optional?: string;
				};
			};

			const complexValue: ComplexType = {
				nested: {
					array: [1, 2, 3],
					optional: "value"
				}
			};

			const result = ok(complexValue);
			expect(isOk(result)).toBe(true);
			if (result.ok) {
				expect(result.value.nested.array).toEqual([1, 2, 3]);
				expect(result.value.nested.optional).toBe("value");
			}
		});

		it("should handle union types", () => {
			type UnionType = string | number | boolean;
			const unionValue: UnionType = "string value";

			const result = ok(unionValue);
			expect(isOk(result)).toBe(true);
			if (result.ok) {
				expect(typeof result.value).toBe("string");
			}
		});

		it("should handle generic constraints", () => {
			// Test that Result works with generic constraints
			const constrainedResult: Result<string, never> = ok("constrained");
			expect(isOk(constrainedResult)).toBe(true);
			if (constrainedResult.ok) {
				expect(constrainedResult.value).toBe("constrained");
			}
		});
	});

	describe("Integration tests", () => {
		it("should work together in typical usage patterns", () => {
			// Simulate a function that returns Result
			const divide = (a: number, b: number): Result<number, string> => {
				if (b === 0) {
					return err("Division by zero");
				}
				return ok(a / b);
			};

			const successResult = divide(10, 2);
			const errorResult = divide(10, 0);

			expect(isOk(successResult)).toBe(true);
			expect(isErr(errorResult)).toBe(true);

			if (isOk(successResult)) {
				expect(successResult.value).toBe(5);
			}

			if (isErr(errorResult)) {
				expect(errorResult.error).toBe("Division by zero");
			}
		});

		it("should handle chaining and composition", () => {
			const processResult = (
				input: Result<string, Error>
			): Result<number, Error> => {
				if (isErr(input)) {
					return err(input.error);
				}
				const parsed = Number.parseInt(input.value, 10);
				if (Number.isNaN(parsed)) {
					return err(new Error("Invalid number"));
				}
				return ok(parsed);
			};

			const validInput = ok("42");
			const invalidInput = ok("not a number");
			const errorInput = err(new Error("Input error"));

			const validResult = processResult(validInput);
			const invalidResult = processResult(invalidInput);
			const errorResult = processResult(errorInput);

			expect(isOk(validResult)).toBe(true);
			expect(isErr(invalidResult)).toBe(true);
			expect(isErr(errorResult)).toBe(true);

			if (isOk(validResult)) {
				expect(validResult.value).toBe(42);
			}
		});
	});
});
