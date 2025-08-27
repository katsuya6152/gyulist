"use server";

import { GetCattleList } from "@/services/cattleService";
import {
	type CreateShipmentPlanRequest,
	type CreateShipmentRequest,
	type MotherShipmentListResponse,
	type MotherShipmentsListParams,
	type ShipmentListResponse,
	type ShipmentPlanListResponse,
	type ShipmentPlansParams,
	type UpdateShipmentPlanRequest,
	type UpdateShipmentRequest,
	createShipment,
	createShipmentPlan,
	deleteShipment,
	deleteShipmentPlan,
	getMotherShipmentsList,
	getShipmentPlans,
	getShipments,
	updateShipment,
	updateShipmentPlan
} from "@/services/shipmentService";
import { redirect } from "next/navigation";

export async function getMotherShipmentsListAction(
	params: MotherShipmentsListParams = {}
): Promise<MotherShipmentListResponse> {
	try {
		return await getMotherShipmentsList(params);
	} catch (error) {
		console.error("Failed to fetch mother shipments:", error);

		// 認証エラーの場合はログインページにリダイレクト
		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

// 出荷実績データを変換して返すアクション
export async function getShipmentRecordsTransformedAction(
	params: MotherShipmentsListParams = {}
): Promise<{
	data: Array<{
		shipmentId: string;
		cattleId: number;
		cattleName: string | null;
		shipmentDate: string;
		price: number;
		weight: number | null;
		ageAtShipment: number | null;
		buyer: string | null;
		notes: string | null;
	}>;
}> {
	try {
		const response = await getMotherShipmentsList(params);

		// MotherShipmentDetailをShipmentRecordに変換
		const records = response.data.map((detail) => ({
			shipmentId: `${detail.calfId}-${detail.shipmentDate}`,
			cattleId: detail.calfId,
			cattleName: detail.calfName,
			shipmentDate: detail.shipmentDate || "",
			price: detail.price || 0,
			weight: detail.shipmentWeight,
			ageAtShipment: detail.ageAtShipment,
			buyer: detail.buyer,
			notes: detail.notes
		}));

		return { data: records };
	} catch (error) {
		console.error("Failed to fetch shipment records:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function exportMotherShipmentsCsvAction(
	params: MotherShipmentsListParams = {}
): Promise<string> {
	try {
		const data = await getMotherShipmentsList(params);

		const headers = [
			"母牛名",
			"母牛耳標",
			"子牛名",
			"性別",
			"父",
			"母の父",
			"母の祖父",
			"母の母の祖父",
			"種付年月日",
			"分娩予定日",
			"分娩日",
			"出荷日",
			"出荷体重",
			"出荷日齢",
			"価格",
			"購買者",
			"備考"
		];

		const csvData = [
			headers.join(","),
			...data.data.map((row) =>
				[
					row.motherName,
					row.motherEarTag || "",
					row.calfName || "",
					row.sex || "",
					row.pedigree.father || "",
					row.pedigree.motherFather || "",
					row.pedigree.motherGrandfather || "",
					row.pedigree.motherMotherGrandfather || "",
					row.breedingDate || "",
					row.expectedBirthDate || "",
					row.birthDate || "",
					row.shipmentDate || "",
					row.shipmentWeight || "",
					row.ageAtShipment || "",
					row.price || "",
					row.buyer || "",
					row.notes || ""
				]
					.map((cell) => `"${cell}"`)
					.join(",")
			)
		].join("\n");

		return csvData;
	} catch (error) {
		console.error("Failed to export CSV:", error);
		throw error;
	}
}

// 出荷予定関連のServer Actions

export async function getShipmentPlansAction(
	params: ShipmentPlansParams = {}
): Promise<ShipmentPlanListResponse> {
	try {
		return await getShipmentPlans(params);
	} catch (error) {
		console.error("Failed to fetch shipment plans:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function createShipmentPlanAction(
	request: CreateShipmentPlanRequest
): Promise<void> {
	try {
		await createShipmentPlan(request);
	} catch (error) {
		console.error("Failed to create shipment plan:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function updateShipmentPlanAction(
	cattleId: number,
	request: UpdateShipmentPlanRequest
): Promise<void> {
	try {
		await updateShipmentPlan(cattleId, request);
	} catch (error) {
		console.error("Failed to update shipment plan:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function deleteShipmentPlanAction(
	cattleId: number | string
): Promise<void> {
	try {
		await deleteShipmentPlan(cattleId);
	} catch (error) {
		console.error("Failed to delete shipment plan:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function getCattleOptionsAction(): Promise<
	Array<{ id: number; name: string; identificationNumber: string }>
> {
	try {
		const response = await GetCattleList();
		return response.results.map((cattle) => ({
			id: cattle.cattleId,
			name: cattle.name || "名前未設定",
			identificationNumber: (cattle.identificationNumber || "").toString()
		}));
	} catch (error) {
		console.error("Failed to fetch cattle options:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

// 出荷実績関連のServer Actions
export async function getShipmentRecordsAction(
	params: {
		from?: string;
		to?: string;
		cattleId?: number;
		page?: number;
		limit?: number;
	} = {}
): Promise<{ data: ShipmentListResponse }> {
	try {
		const response = await getShipments(params);
		return { data: response };
	} catch (error) {
		console.error("Failed to get shipment records:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function createShipmentRecordAction(
	request: CreateShipmentRequest
): Promise<void> {
	try {
		await createShipment(request);
	} catch (error) {
		console.error("Failed to create shipment record:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function updateShipmentRecordAction(
	shipmentId: string,
	request: UpdateShipmentRequest
): Promise<void> {
	try {
		await updateShipment(shipmentId, request);
	} catch (error) {
		console.error("Failed to update shipment record:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}

export async function deleteShipmentRecordAction(
	shipmentId: string
): Promise<void> {
	try {
		await deleteShipment(shipmentId);
	} catch (error) {
		console.error("Failed to delete shipment record:", error);

		if (
			error instanceof Error &&
			(error.message.includes("401") || error.message.includes("403"))
		) {
			redirect("/login");
		}

		throw error;
	}
}
