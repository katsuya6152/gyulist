import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { SEVERITY_ICON_MAP, SEVERITY_TEXT_CLASS_MAP } from "../constants";
import type { Alert } from "../types";

interface AlertsCardProps {
	alerts: Alert[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-amber-600" />
					アラートのある牛
				</CardTitle>
				<span className="text-sm text-muted-foreground">{alerts.length}頭</span>
			</CardHeader>
			<CardContent>
				{alerts.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						現在アラートはありません
					</p>
				) : (
					<ul className="space-y-2">
						{alerts.map((a) => (
							<li
								key={a.alertId}
								className="flex items-start justify-between gap-3"
							>
								<span className="text-sm font-medium shrink-0">
									{a.cattleName}（{a.cattleEarTagNumber}）
								</span>
								<span
									className={`text-xs flex-1 break-words whitespace-normal inline-flex items-start gap-1 ${SEVERITY_TEXT_CLASS_MAP[a.severity]}`}
								>
									{SEVERITY_ICON_MAP[a.severity]}
									<span
										className={a.severity === "high" ? "font-semibold" : ""}
									>
										{a.message}
									</span>
								</span>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
