"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getGrowthStage } from "@/lib/utils";
import classNames from "classnames";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { memo } from "react";
import type { CattleListItem } from "../constants";

interface CattleItemProps {
	cattle: CattleListItem;
	index: number;
	onItemClick: (cattleId: number) => void;
	onAddEvent: (cattleId: number) => void;
}

export const CattleItem = memo(
	({ cattle, index, onItemClick, onAddEvent }: CattleItemProps) => {
		const handleItemClick = () => {
			onItemClick(cattle.cattleId);
		};

		const handleAddEvent = (e: React.MouseEvent) => {
			e.stopPropagation();
			onAddEvent(cattle.cattleId);
		};

		return (
			<div
				key={cattle.cattleId}
				className="animate-fade-in-up hover-lift"
				style={{ animationDelay: `${index * 0.05}s` }}
			>
				<div
					className="w-full flex items-center justify-between p-3 transition-all duration-200 hover:bg-muted/50 rounded-lg cursor-pointer tap-feedback"
					onClick={handleItemClick}
					onKeyDown={handleItemClick}
				>
					<div className="flex flex-col gap-4">
						<div className="flex gap-2">
							<p className="font-bold transition-colors duration-200">
								{cattle.name}
							</p>
							<Badge
								variant="outline"
								className="transition-all duration-200 hover:shadow-sm"
							>
								<span
									className={classNames(
										"font-semibold transition-colors duration-200",
										{
											"text-blue-500": cattle.gender === "オス",
											"text-red-500": cattle.gender === "メス",
										},
									)}
								>
									{cattle.gender}
								</span>
							</Badge>
							<Badge
								variant="default"
								className="transition-all duration-200 hover:shadow-sm"
							>
								{getGrowthStage(cattle.growthStage)}
							</Badge>
							{cattle.healthStatus && (
								<Badge
									variant="outline"
									className={classNames(
										"transition-all duration-200 hover:shadow-sm",
										{
											"border-blue-500 text-blue-500":
												cattle.healthStatus === "健康",
											"border-yellow-500 text-yellow-500":
												cattle.healthStatus === "妊娠中",
											"border-green-500 text-green-500":
												cattle.healthStatus === "休息中",
											"border-red-500 text-red-500":
												cattle.healthStatus === "治療中",
										},
									)}
								>
									{cattle.healthStatus}
								</Badge>
							)}
						</div>
						<div className="flex items-center h-3 gap-2 text-xs text-muted-foreground">
							<div>耳標番号：{cattle.earTagNumber}</div>
							<Separator orientation="vertical" />
							<div>日齢：{cattle.daysOld ? `${cattle.daysOld}日` : "-"}</div>
							<Separator orientation="vertical" />
							<div>体重：{cattle.weight ? `${cattle.weight}kg` : "-"}</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="text-primary tap-feedback hover:scale-110 transition-all duration-200"
							onClick={handleAddEvent}
						>
							<CalendarPlus className="transition-transform duration-200" />
						</Button>
						<ChevronRight className="transition-transform duration-200 hover:translate-x-1" />
					</div>
				</div>
				<Separator className="opacity-50" />
			</div>
		);
	},
);

CattleItem.displayName = "CattleItem";
