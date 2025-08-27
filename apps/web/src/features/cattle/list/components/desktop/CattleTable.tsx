"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { statusLabelMap } from "@/features/cattle/constants";
import { getGrowthStage } from "@/lib/utils";
import type { GetAlertsRes } from "@/services/alertsService";
import classNames from "classnames";
import { clsx } from "clsx";
import {
	Activity,
	AlertTriangle,
	Calendar,
	Clock,
	Eye,
	Hash,
	Shield,
	Tag,
	User,
	Weight
} from "lucide-react";
import type { CattleListItem } from "../../constants";

interface CattleTableProps {
	cattleList: CattleListItem[];
	alerts: GetAlertsRes["results"];
	onItemClick: (cattleId: number) => void;
	onAddEvent: (cattleId: number) => void;
	sortBy?: string;
}

export function CattleTable({
	cattleList,
	alerts,
	onItemClick,
	onAddEvent,
	sortBy
}: CattleTableProps) {
	const getAlertCount = (cattleId: number) => {
		return alerts.filter((alert) => alert.cattleId === cattleId).length;
	};

	return (
		<div className="hidden lg:block w-full">
			<div className="rounded-lg border bg-card shadow-sm">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50 hover:bg-muted/50">
							<TableHead className="w-[100px] font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<Hash className="h-4 w-4 text-muted-foreground" />
									個体番号
								</div>
							</TableHead>
							<TableHead className="font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									名前
								</div>
							</TableHead>
							<TableHead className="w-[80px] font-semibold text-foreground">
								性別
							</TableHead>
							<TableHead className="w-[100px] font-semibold text-foreground">
								成長段階
							</TableHead>
							<TableHead className="w-[80px] font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<Tag className="h-4 w-4 text-muted-foreground" />
									耳標番号
								</div>
							</TableHead>
							<TableHead className="w-[80px] font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									日齢
								</div>
							</TableHead>
							<TableHead className="w-[80px] font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<Weight className="h-4 w-4 text-muted-foreground" />
									体重
								</div>
							</TableHead>
							<TableHead className="w-[80px] font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<Activity className="h-4 w-4 text-muted-foreground" />
									ステータス
								</div>
							</TableHead>
							<TableHead className="w-[100px] font-semibold text-foreground">
								<div className="flex items-center gap-2">
									<Shield className="h-4 w-4 text-muted-foreground" />
									アラート
								</div>
							</TableHead>
							<TableHead className="w-[120px] font-semibold text-foreground">
								操作
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{cattleList.map((cattle) => {
							const alertCount = getAlertCount(cattle.cattleId);
							const hasAlerts = alertCount > 0;

							return (
								<TableRow
									key={cattle.cattleId}
									className="cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50"
									onClick={() => onItemClick(cattle.cattleId)}
								>
									<TableCell className="font-mono font-medium text-primary">
										#{cattle.cattleId}
									</TableCell>
									<TableCell className="font-medium">{cattle.name}</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className="transition-all duration-200 hover:shadow-sm"
										>
											<span
												className={clsx(
													"text-sm font-medium",
													cattle.gender === "雄" && "text-blue-500",
													cattle.gender === "去勢" && "text-gray-500",
													cattle.gender === "雌" && "text-red-500"
												)}
											>
												{cattle.gender}
											</span>
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant="default"
											className="transition-all duration-200 hover:shadow-sm"
										>
											{getGrowthStage(cattle.growthStage)}
										</Badge>
									</TableCell>
									<TableCell>
										{cattle.earTagNumber ? (
											<span className="font-mono text-sm text-muted-foreground">
												#{cattle.earTagNumber}
											</span>
										) : (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</TableCell>
									<TableCell>
										{cattle.daysOld ? (
											<span className="text-sm font-medium text-muted-foreground">
												{cattle.daysOld}日
											</span>
										) : (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</TableCell>
									<TableCell>
										{cattle.weight ? (
											<span className="text-sm font-medium text-muted-foreground">
												{cattle.weight}kg
											</span>
										) : (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={classNames(
												"text-xs font-medium transition-all duration-200 hover:shadow-sm",
												{
													"border-blue-500 text-blue-500":
														cattle.status === "HEALTHY",
													"border-yellow-500 text-yellow-500":
														cattle.status === "PREGNANT",
													"border-green-500 text-green-500":
														cattle.status === "RESTING",
													"border-red-500 text-red-500":
														cattle.status === "TREATING",
													"border-orange-500 text-orange-500":
														cattle.status === "SCHEDULED_FOR_SHIPMENT",
													"border-gray-500 text-gray-500":
														cattle.status === "SHIPPED",
													"border-red-600 text-red-600":
														cattle.status === "DEAD"
												}
											)}
										>
											{statusLabelMap[
												cattle.status as keyof typeof statusLabelMap
											] || cattle.status}
										</Badge>
									</TableCell>
									<TableCell>
										{hasAlerts ? (
											<div className="flex items-center gap-2">
												<AlertTriangle className="h-4 w-4 text-destructive" />
												<Badge
													variant="destructive"
													className="text-xs font-medium"
												>
													{alertCount}
												</Badge>
											</div>
										) : (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													onItemClick(cattle.cattleId);
												}}
												className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
											>
												<Eye className="h-3 w-3 mr-1" />
												詳細
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													onAddEvent(cattle.cattleId);
												}}
												className="h-8 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
											>
												<Calendar className="h-3 w-3 mr-1" />
												イベント
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
