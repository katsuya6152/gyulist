import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
import { Activity, Info, TrendingUp } from "lucide-react";
import { KPI_DATA_CONFIG } from "../constants";
import type { BreedingKpi } from "../types";

interface BreedingKpiCardProps {
	breedingKpi: BreedingKpi;
}

export function BreedingKpiCard({ breedingKpi }: BreedingKpiCardProps) {
	const kpiData = KPI_DATA_CONFIG.map((config) => {
		let value: string;
		switch (config.id) {
			case "conception-rate":
				value =
					breedingKpi.conceptionRate != null
						? `${breedingKpi.conceptionRate}%`
						: "-";
				break;
			case "avg-days-open":
				value =
					breedingKpi.avgDaysOpen != null
						? `${breedingKpi.avgDaysOpen}日`
						: "-";
				break;
			case "calving-interval":
				value =
					breedingKpi.avgCalvingInterval != null
						? `${breedingKpi.avgCalvingInterval}日`
						: "-";
				break;
			case "ai-per-conception":
				value =
					breedingKpi.aiPerConception != null
						? `${breedingKpi.aiPerConception}回`
						: "-";
				break;
			default:
				value = "-";
		}

		return {
			...config,
			value
		};
	});

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<Activity className="h-5 w-5" />
					繁殖指標（全期間）
				</CardTitle>
				<TrendingUp className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					{kpiData.map((kpi) => (
						<div key={kpi.id} className="rounded-md border p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
								{kpi.icon}
								<span className="inline-flex items-center gap-1">
									{kpi.key}
									<Popover>
										<PopoverTrigger asChild>
											<button
												type="button"
												aria-label={kpi.tip}
												className="p-0.5"
											>
												<Info className="h-3 w-3 text-muted-foreground" />
											</button>
										</PopoverTrigger>
										<PopoverContent
											side="top"
											align="start"
											className="max-w-[220px] text-xs leading-relaxed"
										>
											{kpi.tip}
										</PopoverContent>
									</Popover>
								</span>
							</div>
							<div className="text-xl font-bold leading-tight">{kpi.value}</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
