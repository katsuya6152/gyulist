import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusLabelMap, statusOptions } from "@/features/cattle/constants";
import type { Status } from "@/features/cattle/constants";
import {
	STATUS_BORDER_CLASS_MAP,
	STATUS_ICON_MAP,
	STATUS_TEXT_CLASS_MAP
} from "../constants";
import type { StatusCounts } from "../types";

interface StatusCountsCardProps {
	statusCounts: StatusCounts;
}

export function StatusCountsCard({ statusCounts }: StatusCountsCardProps) {
	return (
		<Card>
			<CardHeader className="space-y-2 pb-4">
				<CardTitle className="text-lg font-semibold">
					各ステータスの牛の数
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{statusOptions
						.filter((opt) => opt.value !== "DEAD")
						.map((opt) => (
							<div
								key={opt.value}
								className="flex items-center justify-between rounded-md border p-3"
							>
								<div className="flex items-center gap-2 min-w-0">
									{STATUS_ICON_MAP[opt.value as Status]}
									<Badge
										variant="outline"
										className={`truncate max-w-[70%] ${STATUS_TEXT_CLASS_MAP[opt.value as Status]} ${STATUS_BORDER_CLASS_MAP[opt.value as Status]}`}
									>
										{statusLabelMap[opt.value]}
									</Badge>
								</div>
								<span className="text-base font-semibold">
									{statusCounts[opt.value as keyof typeof statusCounts] ?? 0}
								</span>
							</div>
						))}
				</div>
			</CardContent>
		</Card>
	);
}
