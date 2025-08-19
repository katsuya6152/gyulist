"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { Edit2, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditableSummaryProps {
	cattle: GetCattleDetailResType;
	onSave?: (updatedData: Partial<GetCattleDetailResType>) => Promise<void>;
	onUpdate?: (updatedCattle: GetCattleDetailResType) => void;
}

export function EditableSummary({
	cattle,
	onSave,
	onUpdate
}: EditableSummaryProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		notes: cattle.notes || ""
	});

	// cattle.notesが変更された場合にformDataを更新
	useEffect(() => {
		setFormData({
			notes: cattle.notes || ""
		});
	}, [cattle.notes]);

	const handleSave = async () => {
		if (!onSave) return;

		setIsLoading(true);
		try {
			await onSave({
				notes: formData.notes || null
			});
			setIsEditing(false);

			// 保存成功後にcattleオブジェクトを更新
			if (onUpdate) {
				onUpdate({
					...cattle,
					notes: formData.notes || null,
					updatedAt: new Date().toISOString()
				});
			}

			toast.success("メモを保存しました", {
				description: "メモが正常に更新されました",
				style: {
					background: "#f0fdf4",
					border: "1px solid #bbf7d0",
					color: "#166534"
				}
			});
		} catch (error) {
			console.error("保存に失敗しました:", error);
			toast.error("保存に失敗しました", {
				description: "メモの更新中にエラーが発生しました",
				style: {
					background: "#fef2f2",
					border: "1px solid #fecaca",
					color: "#dc2626"
				}
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			notes: cattle.notes || ""
		});
		setIsEditing(false);
	};

	return (
		<div className="flex flex-col gap-4">
			{/* 基本情報編集 */}
			<Card className="py-4">
				<CardHeader className="px-4">
					<div className="flex items-center justify-between">
						<CardTitle>メモ</CardTitle>
						{!isEditing ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsEditing(true)}
								className="flex items-center gap-2"
							>
								<Edit2 className="h-4 w-4" />
								編集
							</Button>
						) : (
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleCancel}
									disabled={isLoading}
									className="flex items-center gap-2"
								>
									<X className="h-4 w-4" />
									キャンセル
								</Button>
								<Button
									size="sm"
									onClick={handleSave}
									disabled={isLoading}
									className="flex items-center gap-2"
								>
									<Save className="h-4 w-4" />
									{isLoading ? "保存中..." : "保存"}
								</Button>
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="px-4 pb-2 pt-0">
					<div className="space-y-4">
						{/* メモ */}
						<div className="space-y-2">
							{isEditing ? (
								<Textarea
									id="notes"
									value={formData.notes}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, notes: e.target.value }))
									}
									placeholder="メモを入力"
									rows={3}
								/>
							) : (
								<div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
									{cattle.notes || "メモはありません"}
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-center gap-2 text-xs text-gray-500">
				<p>登録日時: {cattle.createdAt}</p>/<p>更新日時: {cattle.updatedAt}</p>
			</div>
		</div>
	);
}
