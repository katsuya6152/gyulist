import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// Next.js router mock
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();
const mockPrefetch = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
		replace: mockReplace,
		back: mockBack,
		forward: mockForward,
		refresh: mockRefresh,
		prefetch: mockPrefetch,
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/schedule",
}));

// Date mocking for consistent test results
const mockDate = new Date("2024-01-15T10:00:00.000Z");
vi.setSystemTime(mockDate);

// Reset all mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
});
