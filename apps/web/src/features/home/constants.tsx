import type { Status } from "@/features/cattle/constants";
import {
	Activity,
	AlertTriangle,
	Baby,
	Bed,
	Bell,
	Calendar,
	Clock,
	Heart,
	Info,
	Repeat,
	Skull,
	Syringe,
	Truck
} from "lucide-react";
import type { ReactNode } from "react";

// ステータス関連のマッピング
export const STATUS_ICON_MAP: Record<Status, ReactNode> = {
	HEALTHY: <Heart className="h-4 w-4 text-blue-500" />,
	PREGNANT: <Baby className="h-4 w-4 text-yellow-500" />,
	RESTING: <Bed className="h-4 w-4 text-green-500" />,
	TREATING: <Syringe className="h-4 w-4 text-red-500" />,
	SCHEDULED_FOR_SHIPMENT: <Clock className="h-4 w-4 text-orange-500" />,
	SHIPPED: <Truck className="h-4 w-4 text-gray-500" />,
	DEAD: <Skull className="h-4 w-4 text-red-600" />
};

export const STATUS_TEXT_CLASS_MAP: Record<Status, string> = {
	HEALTHY: "text-blue-500",
	PREGNANT: "text-yellow-500",
	RESTING: "text-green-500",
	TREATING: "text-red-500",
	SCHEDULED_FOR_SHIPMENT: "text-orange-500",
	SHIPPED: "text-gray-500",
	DEAD: "text-red-600"
};

export const STATUS_BORDER_CLASS_MAP: Record<Status, string> = {
	HEALTHY: "border-blue-500",
	PREGNANT: "border-yellow-500",
	RESTING: "border-green-500",
	TREATING: "border-red-500",
	SCHEDULED_FOR_SHIPMENT: "border-orange-500",
	SHIPPED: "border-gray-500",
	DEAD: "border-red-600"
};

// アラートの重要度関連のマッピング
export const SEVERITY_ICON_MAP: Record<"high" | "medium" | "low", ReactNode> = {
	high: <AlertTriangle className="h-4 w-4" />,
	medium: <Bell className="h-4 w-4" />,
	low: <Info className="h-4 w-4" />
};

export const SEVERITY_TEXT_CLASS_MAP: Record<
	"high" | "medium" | "low",
	string
> = {
	high: "text-red-600",
	medium: "text-amber-600",
	low: "text-blue-600"
};

// KPIデータの定義
export const KPI_DATA_CONFIG = [
	{
		id: "conception-rate",
		key: "受胎率",
		tip: "過去1年間のAI本数に対する、受胎確定できた割合",
		icon: <Activity className="h-4 w-4" />
	},
	{
		id: "avg-days-open",
		key: "平均空胎日数",
		tip: "前回分娩から受胎AIまでの日数の平均（過去1年間のデータ）",
		icon: <Clock className="h-4 w-4" />
	},
	{
		id: "calving-interval",
		key: "分娩間隔",
		tip: "同一個体の連続分娩の間隔の平均（過去1年間のデータ）",
		icon: <Calendar className="h-4 w-4" />
	},
	{
		id: "ai-per-conception",
		key: "AI回数/受胎",
		tip: "受胎成立までに要したAI本数の平均（過去1年間のデータ）",
		icon: <Repeat className="h-4 w-4" />
	}
] as const;
