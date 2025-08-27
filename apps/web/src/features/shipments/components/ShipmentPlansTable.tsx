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
import { getGrowthStage } from "@/lib/utils";
import type { ShipmentPlan } from "@/services/shipmentService";
import type { GrowthStage } from "@repo/api";
import { clsx } from "clsx";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
	data: ShipmentPlan[] | undefined;
	onEdit: (plan: ShipmentPlan) => void;
	onDelete: (planId: string) => void;
	onConvertToRecord: (plan: ShipmentPlan) => void;
};

export function ShipmentPlansTable({
	data,
	onEdit,
	onDelete,
	onConvertToRecord
}: Props) {
	const router = useRouter();

	const handleCattleClick = (cattleId: number) => {
		router.push(`/cattle/${cattleId}`);
	};

	// dataがundefinedの場合の安全な処理
	if (!data || data.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				出荷予定がありません
			</div>
		);
	}

	return (
		<div className="hidden lg:block rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>牛名</TableHead>
						<TableHead>個体識別番号</TableHead>
						<TableHead>性別</TableHead>
						<TableHead>成長段階</TableHead>
						<TableHead>出荷予定月</TableHead>
						<TableHead>登録日</TableHead>
						<TableHead className="text-center">実績化</TableHead>
						<TableHead className="text-right">操作</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((plan) => (
						<TableRow key={plan.planId}>
							<TableCell className="font-medium">
								<button
									type="button"
									onClick={() => handleCattleClick(plan.cattleId)}
									className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
								>
									{plan.cattleName || "-"}
								</button>
							</TableCell>
							<TableCell>{plan.identificationNumber || "-"}</TableCell>
							<TableCell>
								{plan.gender && (
									<Badge
										variant="outline"
										className="transition-all duration-200 hover:shadow-sm"
									>
										<span
											className={clsx(
												"text-sm font-medium",
												plan.gender === "雄" && "text-blue-500",
												plan.gender === "去勢" && "text-gray-500",
												plan.gender === "雌" && "text-red-500"
											)}
										>
											{plan.gender}
										</span>
									</Badge>
								)}
							</TableCell>
							<TableCell>
								{plan.growthStage && (
									<Badge
										variant="default"
										className="transition-all duration-200 hover:shadow-sm"
									>
										{getGrowthStage(plan.growthStage as GrowthStage)}
									</Badge>
								)}
							</TableCell>
							<TableCell className="font-medium">
								{plan.plannedShipmentMonth}
							</TableCell>
							<TableCell>
								{new Date(plan.createdAt).toLocaleDateString("ja-JP")}
							</TableCell>
							<TableCell className="text-center">
								<Button
									variant="outline"
									size="sm"
									onClick={() => onConvertToRecord(plan)}
									className="h-8 px-3 text-xs text-green-600 hover:text-green-700"
								>
									<ArrowRight className="h-3 w-3 mr-1" />
									実績化
								</Button>
							</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(plan)}
										className="h-8 w-8 p-0"
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(plan.planId)}
										className="h-8 w-8 p-0 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
