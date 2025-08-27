"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import type { ShipmentPlan } from "@/services/shipmentService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const shipmentPlanSchema = z.object({
	cattleId: z.number().min(1, "牛を選択してください"),
	plannedShipmentMonth: z
		.string()
		.regex(/^\d{4}-\d{2}$/, "YYYY-MM形式で入力してください")
});

type ShipmentPlanFormData = z.infer<typeof shipmentPlanSchema>;

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: ShipmentPlanFormData) => Promise<void>;
	editingPlan?: ShipmentPlan | null;
	cattleOptions: Array<{
		id: number;
		name: string;
		identificationNumber: string;
	}>;
	isLoading?: boolean;
};

export function ShipmentPlanForm({
	open,
	onOpenChange,
	onSubmit,
	editingPlan,
	cattleOptions,
	isLoading = false
}: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ShipmentPlanFormData>({
		resolver: zodResolver(shipmentPlanSchema),
		defaultValues: {
			cattleId: 0,
			plannedShipmentMonth: ""
		}
	});

	// 編集時のフォーム初期化
	useEffect(() => {
		if (editingPlan) {
			form.reset({
				cattleId: editingPlan.cattleId,
				plannedShipmentMonth: editingPlan.plannedShipmentMonth
			});
		} else {
			form.reset({
				cattleId: 0,
				plannedShipmentMonth: ""
			});
		}
	}, [editingPlan, form]);

	const handleSubmit = async (data: ShipmentPlanFormData) => {
		setIsSubmitting(true);
		try {
			await onSubmit(data);
			form.reset();
			onOpenChange(false);
		} catch (error) {
			console.error("Form submission error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{editingPlan ? "出荷予定を編集" : "出荷予定を作成"}
					</DialogTitle>
					<DialogDescription>
						牛の出荷予定月を設定してください
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="cattleId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>牛を選択</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(Number(value))}
										value={field.value?.toString() || ""}
										disabled={!!editingPlan} // 編集時は牛の変更不可
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="牛を選択してください" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{cattleOptions.map((cattle) => (
												<SelectItem
													key={cattle.id}
													value={cattle.id.toString()}
												>
													{cattle.name} ({cattle.identificationNumber})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="plannedShipmentMonth"
							render={({ field }) => (
								<FormItem>
									<FormLabel>出荷予定月</FormLabel>
									<FormControl>
										<Input type="month" placeholder="2025-01" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isSubmitting}
							>
								キャンセル
							</Button>
							<Button type="submit" disabled={isSubmitting || isLoading}>
								{isSubmitting ? "保存中..." : editingPlan ? "更新" : "作成"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
