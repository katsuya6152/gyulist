import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// Global mocks for browser APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

global.DataTransfer = vi.fn().mockImplementation(() => ({
	dropEffect: "none",
	effectAllowed: "none",
	files: [],
	items: [],
	types: [],
	clearData: vi.fn(),
	getData: vi.fn(),
	setData: vi.fn(),
	setDragImage: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

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

// Mock @repo/api
vi.mock("@repo/api", () => ({
	createClient: () => ({
		api: {
			v1: {
				cattle: {
					$get: vi.fn(),
					":id": {
						$get: vi.fn(),
						$patch: vi.fn(),
						$delete: vi.fn(),
					},
				},
				events: {
					$get: vi.fn(),
					":id": {
						$get: vi.fn(),
						$patch: vi.fn(),
						$delete: vi.fn(),
					},
				},
			},
		},
	}),
}));

// Mock lib/rpc
vi.mock("@/lib/rpc", () => ({
	client: {
		api: {
			v1: {
				cattle: {
					$get: vi.fn(),
					":id": {
						$get: vi.fn(),
						$patch: vi.fn(),
						$delete: vi.fn(),
					},
				},
				events: {
					$get: vi.fn(),
					":id": {
						$get: vi.fn(),
						$patch: vi.fn(),
						$delete: vi.fn(),
					},
				},
			},
		},
	},
}));

// Mock embla-carousel-react
vi.mock("embla-carousel-react", () => ({
	default: () => [
		() => null,
		{
			scrollTo: vi.fn(),
			selectedScrollSnap: vi.fn(),
			on: vi.fn(),
			off: vi.fn(),
		},
	],
}));

// Reset all mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
});
