"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type {
	MotherShipmentDetail,
	MotherShipmentListResponse,
	MotherShipmentsListParams,
	ShipmentPlan,
	ShipmentPlansParams
} from "@/services/shipmentService";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	createShipmentPlanAction,
	createShipmentRecordAction,
	deleteShipmentPlanAction,
	deleteShipmentRecordAction,
	getCattleOptionsAction,
	getMotherShipmentsListAction,
	getShipmentPlansAction,
	getShipmentRecordsTransformedAction,
	updateShipmentPlanAction,
	updateShipmentRecordAction
} from "./actions";
import { ShipmentPlanForm } from "./components/ShipmentPlanForm";
import { ShipmentPlansTable } from "./components/ShipmentPlansTable";
import {
	type ShipmentRecord,
	ShipmentRecordForm
} from "./components/ShipmentRecordForm";
import { ShipmentsList } from "./components/ShipmentsList";
import { ShipmentPlanItem } from "./components/mobile/ShipmentPlanItem";

type Props = {
	searchParams: { [key: string]: string | string[] | undefined };
	initialData?: MotherShipmentListResponse;
	error?: string;
	initialSearchParams?: MotherShipmentsListParams;
};

export default function ShipmentsPresentation({
	searchParams: initialSearchParams,
	initialData,
	error: initialError
}: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	const [data] = useState<MotherShipmentListResponse | null>(
		initialData || null
	);
	const [error] = useState<string | null>(initialError || null);
	const [activeTab, setActiveTab] = useState<"records" | "plans">("records");

	// 出荷予定関連の状態
	const [shipmentPlans, setShipmentPlans] = useState<ShipmentPlan[]>([]);
	const [plansLoading, setPlansLoading] = useState(false);
	const [plansError, setPlansError] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingPlan, setEditingPlan] = useState<ShipmentPlan | null>(null);
	const [cattleOptions, setCattleOptions] = useState<
		Array<{ id: number; name: string; identificationNumber: string }>
	>([]);

	// 出荷実績関連の状態（メイン表示として使用）
	const [currentData, setCurrentData] =
		useState<MotherShipmentListResponse | null>(initialData || null);
	const [shipmentRecords, setShipmentRecords] = useState<ShipmentRecord[]>([]);
	const [recordsLoading, setRecordsLoading] = useState(false);
	const [recordsError, setRecordsError] = useState<string | null>(null);
	const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<ShipmentRecord | null>(
		null
	);

	// URLパラメータから初期値を取得
	const currentPage = Number.parseInt(searchParams.get("page") || "1", 10);
	const currentLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
	const currentSortBy =
		(searchParams.get("sortBy") as MotherShipmentsListParams["sortBy"]) ||
		"shipmentDate";
	const currentSortOrder =
		(searchParams.get("sortOrder") as MotherShipmentsListParams["sortOrder"]) ||
		"desc";
	const currentFilterBy = searchParams.get(
		"filterBy"
	) as MotherShipmentsListParams["filterBy"];
	const currentFilterValue = searchParams.get("filterValue") || "";

	// URLパラメータを更新する関数
	const updateSearchParams = (updates: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams.toString());

		for (const [key, value] of Object.entries(updates)) {
			if (value === null || value === "") {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}

		router.push(`${pathname}?${params.toString()}`);
	};

	// 牛詳細画面への遷移
	const handleMotherClick = (motherId: number) => {
		router.push(`/cattle/${motherId}`);
	};

	// 出荷予定関連のハンドラー
	const fetchShipmentPlans = useCallback(async () => {
		setPlansLoading(true);
		setPlansError(null);
		try {
			const response = await getShipmentPlansAction();
			setShipmentPlans(response.data || []);
		} catch (error) {
			console.error("Failed to fetch shipment plans:", error);
			setPlansError("出荷予定の取得に失敗しました");
			setShipmentPlans([]);
		} finally {
			setPlansLoading(false);
		}
	}, []);

	const fetchCattleOptions = useCallback(async () => {
		try {
			const options = await getCattleOptionsAction();
			setCattleOptions(options);
		} catch (error) {
			console.error("Failed to fetch cattle options:", error);
		}
	}, []);

	const handleCreatePlan = () => {
		setEditingPlan(null);
		setIsFormOpen(true);
	};

	const handleEditPlan = (plan: ShipmentPlan) => {
		setEditingPlan(plan);
		setIsFormOpen(true);
	};

	const handleDeletePlan = async (planId: string) => {
		if (!confirm("出荷予定を削除しますか？")) return;

		try {
			await deleteShipmentPlanAction(planId);
			toast.success("出荷予定を削除しました");
			fetchShipmentPlans();
		} catch (error) {
			console.error("Failed to delete shipment plan:", error);
			toast.error("出荷予定の削除に失敗しました");
		}
	};

	const handleFormSubmit = async (formData: {
		cattleId: number;
		plannedShipmentMonth: string;
	}) => {
		try {
			if (editingPlan) {
				await updateShipmentPlanAction(editingPlan.cattleId, {
					plannedShipmentMonth: formData.plannedShipmentMonth
				});
				toast.success("出荷予定を更新しました");
			} else {
				await createShipmentPlanAction({
					cattleId: formData.cattleId,
					plannedShipmentMonth: formData.plannedShipmentMonth
				});
				toast.success("出荷予定を作成しました");
			}
			fetchShipmentPlans();
		} catch (error) {
			console.error("Failed to save shipment plan:", error);
			toast.error(
				editingPlan
					? "出荷予定の更新に失敗しました"
					: "出荷予定の作成に失敗しました"
			);
		}
	};

	// 出荷実績関連のハンドラー（データ変換ロジックをactionsに移動）
	const fetchShipmentRecords = useCallback(async () => {
		setRecordsLoading(true);
		setRecordsError(null);
		try {
			const params: MotherShipmentsListParams = {
				page: currentPage,
				limit: currentLimit,
				sortBy: currentSortBy,
				sortOrder: currentSortOrder,
				filterBy: currentFilterBy,
				filterValue: currentFilterValue
			};
			const response = await getShipmentRecordsTransformedAction(params);
			setShipmentRecords(response.data);
			// 元のdataも更新するために、変換前のデータも取得
			const originalResponse = await getMotherShipmentsListAction(params);
			setCurrentData(originalResponse);
		} catch (error) {
			console.error("Failed to fetch shipment records:", error);
			setRecordsError("出荷実績の取得に失敗しました");
			setShipmentRecords([]);
		} finally {
			setRecordsLoading(false);
		}
	}, [
		currentPage,
		currentLimit,
		currentSortBy,
		currentSortOrder,
		currentFilterBy,
		currentFilterValue
	]);

	// MotherShipmentDetail用のハンドラー
	const handleEditShipmentRecord = (shipment: MotherShipmentDetail) => {
		// MotherShipmentDetailをShipmentRecordに変換
		const record: ShipmentRecord = {
			shipmentId: `${shipment.calfId}-${shipment.shipmentDate}`,
			cattleId: shipment.calfId,
			cattleName: shipment.calfName,
			shipmentDate: shipment.shipmentDate || "",
			price: shipment.price || 0,
			weight: shipment.shipmentWeight,
			ageAtShipment: shipment.ageAtShipment,
			buyer: shipment.buyer,
			notes: shipment.notes
		};
		setEditingRecord(record);
		setIsRecordFormOpen(true);
	};

	const handleDeleteShipmentRecord = async (shipment: MotherShipmentDetail) => {
		if (!confirm("出荷実績を削除しますか？")) return;

		try {
			const shipmentId = `${shipment.calfId}-${shipment.shipmentDate}`;
			await deleteShipmentRecordAction(shipmentId);
			toast.success("出荷実績を削除しました");
			fetchShipmentRecords();
		} catch (error) {
			console.error("Failed to delete shipment record:", error);
			toast.error("出荷実績の削除に失敗しました");
		}
	};

	const handleConvertPlanToRecord = (plan: ShipmentPlan) => {
		const plannedMonth = plan.plannedShipmentMonth;
		const initialDate = `${plannedMonth}-01`;

		const dummyRecord: ShipmentRecord = {
			shipmentId: "",
			cattleId: plan.cattleId,
			cattleName: plan.cattleName,
			shipmentDate: initialDate,
			price: 0,
			weight: null,
			ageAtShipment: null,
			buyer: null,
			notes: `出荷予定（${plan.plannedShipmentMonth}）から変換`
		};

		setEditingRecord(dummyRecord);
		setIsRecordFormOpen(true);
	};

	const handleRecordFormSubmit = async (formData: {
		cattleId: number;
		shipmentDate: string;
		price: number;
		weight?: number;
		ageAtShipment?: number;
		buyer?: string;
		notes?: string;
	}) => {
		try {
			if (editingRecord?.shipmentId) {
				await updateShipmentRecordAction(editingRecord.shipmentId, {
					shipmentDate: formData.shipmentDate,
					price: formData.price,
					weight: formData.weight,
					ageAtShipment: formData.ageAtShipment,
					buyer: formData.buyer,
					notes: formData.notes
				});
				toast.success("出荷実績を更新しました");
			} else {
				await createShipmentRecordAction({
					cattleId: formData.cattleId,
					shipmentDate: formData.shipmentDate,
					price: formData.price,
					weight: formData.weight,
					ageAtShipment: formData.ageAtShipment,
					buyer: formData.buyer,
					notes: formData.notes
				});
				toast.success("出荷実績を登録しました");
			}
			fetchShipmentRecords();
		} catch (error) {
			console.error("Failed to save shipment record:", error);
			toast.error(
				editingRecord?.shipmentId
					? "出荷実績の更新に失敗しました"
					: "出荷実績の登録に失敗しました"
			);
		}
	};

	// タブ切り替え時の処理
	const handleTabChange = (value: "records" | "plans") => {
		setActiveTab(value);
		if (value === "plans" && shipmentPlans.length === 0) {
			fetchShipmentPlans();
			fetchCattleOptions();
		}
		if (value === "records") {
			fetchShipmentRecords();
			fetchCattleOptions();
		}
	};

	// 初期データ読み込み
	useEffect(() => {
		if (activeTab === "records") {
			fetchShipmentRecords();
		}
	}, [activeTab, fetchShipmentRecords]);

	// タブ切り替え時のデータ読み込み
	useEffect(() => {
		if (activeTab === "plans") {
			fetchShipmentPlans();
			fetchCattleOptions();
		} else if (activeTab === "records") {
			fetchShipmentRecords();
			fetchCattleOptions();
		}
	}, [activeTab, fetchShipmentPlans, fetchCattleOptions, fetchShipmentRecords]);

	// エラー表示
	if (error) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">出荷管理</h1>
					<p className="text-muted-foreground">
						母牛別の出荷実績を管理・分析します
					</p>
				</div>

				<div className={`${!isDesktop ? "px-4" : ""}`}>
					<Card>
						<CardHeader>
							<CardTitle>エラーが発生しました</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-destructive mb-4">{error}</p>
							<Button
								onClick={() => window.location.reload()}
								variant="outline"
							>
								再試行
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// データなし
	if (!data) {
		return (
			<div className={`space-y-6 ${!isDesktop ? "px-4" : ""}`}>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">出荷管理</h1>
					<p className="text-muted-foreground">
						母牛別の出荷実績を管理・分析します
					</p>
				</div>
			</div>
		);
	}

	// メイン表示
	return (
		<div className={`space-y-6 ${!isDesktop ? "px-4" : ""}`}>
			<div>
				<h1 className="text-3xl font-bold tracking-tight">出荷管理</h1>
				<p className="text-muted-foreground">
					出荷実績と出荷予定を管理・分析します
				</p>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => handleTabChange(value as "records" | "plans")}
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="records">出荷実績</TabsTrigger>
					<TabsTrigger value="plans">出荷予定</TabsTrigger>
				</TabsList>

				{/* 出荷実績タブ */}
				<TabsContent value="records" className="space-y-6">
					{/* 出荷実績一覧 */}
					<ShipmentsList
						initialData={currentData || undefined}
						error={recordsError || undefined}
						initialSearchParams={{
							page: currentPage,
							limit: currentLimit,
							sortBy: currentSortBy,
							sortOrder: currentSortOrder,
							filterBy: currentFilterBy,
							filterValue: currentFilterValue
						}}
						onEdit={handleEditShipmentRecord}
						onDelete={handleDeleteShipmentRecord}
					/>
				</TabsContent>

				{/* 出荷予定タブ */}
				<TabsContent value="plans" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								出荷予定一覧
								<Button onClick={handleCreatePlan}>新規作成</Button>
							</CardTitle>
							<CardDescription>牛の出荷予定を管理します</CardDescription>
						</CardHeader>
						<CardContent>
							{plansLoading ? (
								<div className="text-center py-8 text-muted-foreground">
									読み込み中...
								</div>
							) : plansError ? (
								<div className="text-center py-8 text-destructive">
									{plansError}
								</div>
							) : shipmentPlans.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									出荷予定がありません
								</div>
							) : isDesktop ? (
								<ShipmentPlansTable
									data={shipmentPlans}
									onEdit={handleEditPlan}
									onDelete={handleDeletePlan}
									onConvertToRecord={handleConvertPlanToRecord}
								/>
							) : (
								<div className="grid gap-0 w-full">
									{(shipmentPlans || []).map((plan, index) => (
										<ShipmentPlanItem
											key={plan.planId}
											plan={plan}
											index={index}
											onCattleClick={handleMotherClick}
											onEdit={handleEditPlan}
											onDelete={handleDeletePlan}
											onConvertToRecord={handleConvertPlanToRecord}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* 出荷予定フォーム */}
			<ShipmentPlanForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				onSubmit={handleFormSubmit}
				editingPlan={editingPlan}
				cattleOptions={cattleOptions}
				isLoading={plansLoading}
			/>

			{/* 出荷実績フォーム */}
			<ShipmentRecordForm
				open={isRecordFormOpen}
				onOpenChange={setIsRecordFormOpen}
				onSubmit={handleRecordFormSubmit}
				editingRecord={editingRecord}
				cattleOptions={cattleOptions}
				isLoading={recordsLoading}
			/>
		</div>
	);
}
