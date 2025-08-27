import type { ClockPort } from "../../shared/ports/clock";

export function createClockService(): ClockPort {
	return {
		now(): Date {
			return new Date();
		}
	};
}
