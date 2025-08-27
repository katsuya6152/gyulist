/**
 * 出荷管理ドメイン - 計算関数
 *
 * 出荷データの集計・統計計算を行う関数を提供します。
 */

import type {
	MotherShipmentDetail,
	ShipmentStatistics
} from "../../types/shipments";

/**
 * 出荷時日齢を計算
 */
export const calculateAgeAtShipment = (
	birthDate: Date,
	shipmentDate: Date
): number => {
	const timeDiff = shipmentDate.getTime() - birthDate.getTime();
	return Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // 日数に変換
};

/**
 * 出荷統計を計算
 */
export const calculateShipmentStatistics = (
	shipments: ReadonlyArray<MotherShipmentDetail>
): ShipmentStatistics => {
	const validShipments = shipments.filter(
		(s) =>
			s.price !== null && s.shipmentWeight !== null && s.ageAtShipment !== null
	);

	if (validShipments.length === 0) {
		return {
			totalShipments: 0,
			totalRevenue: 0,
			averagePrice: 0,
			averageWeight: 0,
			averageAge: 0
		};
	}

	const totalRevenue = validShipments.reduce(
		(sum, s) => sum + (s.price || 0),
		0
	);
	const totalWeight = validShipments.reduce(
		(sum, s) => sum + (s.shipmentWeight || 0),
		0
	);
	const totalAge = validShipments.reduce(
		(sum, s) => sum + (s.ageAtShipment || 0),
		0
	);

	return {
		totalShipments: validShipments.length,
		totalRevenue,
		averagePrice: Math.round(totalRevenue / validShipments.length),
		averageWeight: Math.round((totalWeight / validShipments.length) * 10) / 10, // 小数点1桁
		averageAge: Math.round(totalAge / validShipments.length)
	};
};

/**
 * 母牛別収益を計算
 */
export const calculateMotherRevenue = (
	calves: ReadonlyArray<{ shipment: { price: number } | null }>
): number => {
	return calves.reduce((sum, calf) => {
		return sum + (calf.shipment?.price || 0);
	}, 0);
};

/**
 * 母牛別平均価格を計算
 */
export const calculateMotherAveragePrice = (
	calves: ReadonlyArray<{ shipment: { price: number } | null }>
): number => {
	const validShipments = calves.filter((calf) => calf.shipment?.price);
	if (validShipments.length === 0) return 0;

	const totalRevenue = calculateMotherRevenue(calves);
	return Math.round(totalRevenue / validShipments.length);
};

/**
 * 月別統計を計算
 */
export const calculateMonthlyStatistics = (
	shipments: ReadonlyArray<MotherShipmentDetail>
): Record<string, ShipmentStatistics> => {
	const monthlyData: Record<string, MotherShipmentDetail[]> = {};

	// 月別にグループ化
	for (const shipment of shipments) {
		if (shipment.shipmentDate) {
			const month = shipment.shipmentDate.substring(0, 7); // YYYY-MM
			if (!monthlyData[month]) {
				monthlyData[month] = [];
			}
			monthlyData[month].push(shipment);
		}
	}

	// 各月の統計を計算
	const monthlyStats: Record<string, ShipmentStatistics> = {};
	for (const [month, monthShipments] of Object.entries(monthlyData)) {
		monthlyStats[month] = calculateShipmentStatistics(monthShipments);
	}

	return monthlyStats;
};
