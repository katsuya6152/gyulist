/**
 * Performance Benchmarks Configuration - New Architecture
 *
 * 新アーキテクチャのパフォーマンスベンチマーク設定
 */

export const PERFORMANCE_THRESHOLDS = {
	// Response time thresholds (ms)
	HEALTH_CHECK: 50,
	SIMPLE_GET: 200,
	COMPLEX_CALCULATION: 500,
	DATABASE_OPERATION: 1000,

	// Memory usage thresholds (bytes)
	MAX_MEMORY_INCREASE: 10 * 1024 * 1024, // 10MB
	MAX_HEAP_SIZE: 100 * 1024 * 1024, // 100MB

	// Concurrency thresholds
	MAX_CONCURRENT_REQUESTS: 50,
	AVERAGE_RESPONSE_TIME: 100,

	// Error handling thresholds
	AUTH_ERROR_RESPONSE: 10,
	VALIDATION_ERROR_RESPONSE: 50
} as const;

export const BENCHMARK_SCENARIOS = {
	CATTLE_MANAGEMENT: {
		name: "Cattle Management Workflow",
		steps: [
			"Create cattle",
			"Get cattle details",
			"Update cattle",
			"Search cattle",
			"Delete cattle"
		],
		expectedDuration: 1000 // 1 second total
	},

	EVENT_PROCESSING: {
		name: "Event Processing Workflow",
		steps: ["Create event", "List events", "Update event", "Delete event"],
		expectedDuration: 800
	},

	KPI_ANALYSIS: {
		name: "KPI Analysis Workflow",
		steps: [
			"Calculate breeding metrics",
			"Get trend analysis",
			"Generate delta report"
		],
		expectedDuration: 1500 // More complex calculations
	},

	ALERT_MANAGEMENT: {
		name: "Alert Management Workflow",
		steps: ["Get alerts", "Update alert status", "Resolve alert"],
		expectedDuration: 600
	}
} as const;

export async function measurePerformance<T>(
	operation: () => Promise<T>,
	name: string
): Promise<{ result: T; duration: number; memoryUsage: NodeJS.MemoryUsage }> {
	const startMemory = process.memoryUsage();
	const startTime = performance.now();

	try {
		const result = await operation();
		const endTime = performance.now();
		const endMemory = process.memoryUsage();

		return {
			result,
			duration: endTime - startTime,
			memoryUsage: {
				rss: endMemory.rss - startMemory.rss,
				heapTotal: endMemory.heapTotal - startMemory.heapTotal,
				heapUsed: endMemory.heapUsed - startMemory.heapUsed,
				external: endMemory.external - startMemory.external,
				arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
			}
		};
	} catch (error) {
		const endTime = performance.now();
		const endMemory = process.memoryUsage();

		return {
			result: error as T,
			duration: endTime - startTime,
			memoryUsage: {
				rss: endMemory.rss - startMemory.rss,
				heapTotal: endMemory.heapTotal - startMemory.heapTotal,
				heapUsed: endMemory.heapUsed - startMemory.heapUsed,
				external: endMemory.external - startMemory.external,
				arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
			}
		};
	}
}

export function generatePerformanceReport(
	results: Array<{
		name: string;
		duration: number;
		memoryUsage: NodeJS.MemoryUsage;
		success: boolean;
	}>
) {
	const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
	const avgDuration = totalDuration / results.length;
	const maxMemoryUsed = Math.max(...results.map((r) => r.memoryUsage.heapUsed));
	const successRate = results.filter((r) => r.success).length / results.length;

	return {
		summary: {
			totalTests: results.length,
			totalDuration: Math.round(totalDuration),
			averageDuration: Math.round(avgDuration),
			maxMemoryUsed: Math.round(maxMemoryUsed / 1024 / 1024), // MB
			successRate: Math.round(successRate * 100) // Percentage
		},
		details: results.map((r) => ({
			...r,
			duration: Math.round(r.duration),
			memoryUsed: Math.round(r.memoryUsage.heapUsed / 1024) // KB
		}))
	};
}
