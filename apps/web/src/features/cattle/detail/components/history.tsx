import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GetCattleDetailResType } from "@/services/cattleService";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, Scissors, Syringe, TruckIcon } from "lucide-react";

type EventType =
	| "ESTRUS"
	| "INSEMINATION"
	| "CALVING"
	| "VACCINATION"
	| "SHIPMENT"
	| "HOOF_TRIMMING"
	| "OTHER";

type Event = {
	eventId: number;
	eventType: EventType;
	eventDatetime: string;
	notes: string | null;
};

export function History({ cattle }: { cattle: GetCattleDetailResType }) {
	const eventTypeIcons: Record<EventType, React.ReactNode> = {
		ESTRUS: <CalendarIcon className="text-red-500" />,
		INSEMINATION: <CalendarIcon className="text-blue-500" />,
		CALVING: <CalendarIcon className="text-green-500" />,
		VACCINATION: <Syringe className="text-purple-500" />,
		SHIPMENT: <TruckIcon className="text-yellow-500" />,
		HOOF_TRIMMING: <Scissors className="text-gray-500" />,
		OTHER: <CalendarIcon className="text-orange-500" />,
	};

	const eventTypeLabels: Record<EventType, string> = {
		ESTRUS: "発情",
		INSEMINATION: "受精",
		CALVING: "分娩",
		VACCINATION: "ワクチン",
		SHIPMENT: "出荷",
		HOOF_TRIMMING: "削蹄",
		OTHER: "その他",
	};

	const eventTypeColors: Record<EventType, string> = {
		ESTRUS: "border-l-4 border-red-500",
		INSEMINATION: "border-l-4 border-blue-500",
		CALVING: "border-l-4 border-green-500",
		VACCINATION: "border-l-4 border-purple-500",
		SHIPMENT: "border-l-4 border-yellow-500",
		HOOF_TRIMMING: "border-l-4 border-gray-500",
		OTHER: "border-l-4 border-orange-500",
	};

	const sortedEvents = (events: (Event | null)[]) =>
		[...events]
			.filter((event): event is Event => event !== null)
			.sort(
				(a, b) =>
					parseISO(b.eventDatetime).getTime() -
					parseISO(a.eventDatetime).getTime(),
			);

	const sortedEventsArray = sortedEvents(cattle.events ?? []);

	return (
		<div className="relative space-y-4 py-4">
			{sortedEventsArray.map((event, index) => (
				<Card
					key={event.eventId}
					className={`border-0 ${eventTypeColors[event.eventType]}`}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
						<CardTitle className="text-sm font-medium flex items-center">
							{eventTypeLabels[event.eventType]}
							{index === 0 && (
								<span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
									最新
								</span>
							)}
						</CardTitle>
						<div className="h-4 w-4">{eventTypeIcons[event.eventType]}</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm font-medium text-gray-600 mb-1">
							{format(parseISO(event.eventDatetime), "yyyy年MM月dd日 HH:mm", {
								locale: ja,
							})}
						</p>
						<p className="text-sm">{event.notes}</p>
					</CardContent>
				</Card>
			))}
			<div className="flex justify-center gap-2 text-xs text-gray-500">
				<p>登録日時: {cattle.createdAt}</p>/<p>更新日時: {cattle.updatedAt}</p>
			</div>
		</div>
	);
}
