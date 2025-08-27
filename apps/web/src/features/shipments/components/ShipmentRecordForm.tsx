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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const shipmentRecordSchema = z.object({
	cattleId: z.number().min(1, "牛を選択してください"),
	shipmentDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "日付を入力してください"),
	price: z.number().min(1, "価格を入力してください"),
	weight: z.number().positive().optional(),
	ageAtShipment: z.number().int().positive().optional(),
	buyer: z.string().optional(),
	notes: z.string().optional()
});

type ShipmentRecordFormData = z.infer<typeof shipmentRecordSchema>;

export type ShipmentRecord = {
	shipmentId: string;
	cattleId: number;
	cattleName: string | null;
	shipmentDate: string;
	price: number;
	weight: number | null;
	ageAtShipment: number | null;
	buyer: string | null;
	notes: string | null;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: ShipmentRecordFormData) => Promise<void>;
	editingRecord?: ShipmentRecord | null;
	cattleOptions: Array<{
		id: number;
		name: string;
		identificationNumber: string;
	}>;
	isLoading?: boolean;
};

export function ShipmentRecordForm({
	open,
	onOpenChange,
	onSubmit,
	editingRecord,
	cattleOptions,
	isLoading = false
}: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ShipmentRecordFormData>({
		resolver: zodResolver(shipmentRecordSchema),
		defaultValues: {
			cattleId: 0,
			shipmentDate: "",
			price: 0,
			weight: undefined,
			ageAtShipment: undefined,
			buyer: "",
			notes: ""
		}
	});

	// 編集時のフォーム初期化
	useEffect(() => {
		if (editingRecord) {
			form.reset({
				cattleId: editingRecord.cattleId,
				shipmentDate: editingRecord.shipmentDate,
				price: editingRecord.price,
				weight: editingRecord.weight ?? undefined,
				ageAtShipment: editingRecord.ageAtShipment ?? undefined,
				buyer: editingRecord.buyer ?? "",
				notes: editingRecord.notes ?? ""
			});
		} else {
			// 新規作成時は今日の日付を初期値に設定
			const today = new Date().toISOString().split("T")[0];
			form.reset({
				cattleId: 0,
				shipmentDate: today,
				price: 0,
				weight: undefined,
				ageAtShipment: undefined,
				buyer: "",
				notes: ""
			});
		}
	}, [editingRecord, form]);

	const handleSubmit = async (data: ShipmentRecordFormData) => {
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
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{editingRecord ? "出荷実績を編集" : "出荷実績を登録"}
					</DialogTitle>
					<DialogDescription>
						{editingRecord
							? "出荷実績の情報を編集してください"
							: "新しい出荷実績を登録してください"}
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
									<FormLabel>牛を選択 *</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(Number(value))}
										value={field.value?.toString() || ""}
										disabled={!!editingRecord} // 編集時は牛の変更不可
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
							name="shipmentDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>出荷日 *</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>価格（円） *</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											placeholder="500000"
											{...field}
											onChange={(e) =>
												field.onChange(Number(e.target.value) || 0)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="weight"
							render={({ field }) => (
								<FormItem>
									<FormLabel>体重（kg）</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											step="0.1"
											placeholder="450.5"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined
												)
											}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="ageAtShipment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>出荷時月齢</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											placeholder="24"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined
												)
											}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="buyer"
							render={({ field }) => (
								<FormItem>
									<FormLabel>買主</FormLabel>
									<FormControl>
										<Input placeholder="○○畜産" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>メモ</FormLabel>
									<FormControl>
										<Textarea
											placeholder="品質良好、市場での評価が高かった..."
											className="resize-none"
											rows={3}
											{...field}
										/>
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
								disabled={isSubmitting || isLoading}
							>
								キャンセル
							</Button>
							<Button type="submit" disabled={isSubmitting || isLoading}>
								{isSubmitting ? "処理中..." : editingRecord ? "更新" : "登録"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
