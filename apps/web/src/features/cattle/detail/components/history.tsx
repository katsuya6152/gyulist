import { EventCard } from "@/components/event/event-card";
import {
	deleteEventAction,
	updateEventAction
} from "@/features/schedule/actions";
import type { GetCattleDetailResType } from "@/services/cattleService";
import type { UpdateEventInput } from "@/services/eventService";
import { parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CattleEvent = NonNullable<GetCattleDetailResType["events"]>[number];

export function History({ cattle }: { cattle: GetCattleDetailResType }) {
	const router = useRouter();

	const sortedEvents = (
		events: GetCattleDetailResType["events"]
	): CattleEvent[] => {
		const safeEvents: CattleEvent[] = (events ?? []).filter(
			(e): e is CattleEvent => e != null
		);
		return safeEvents
			.slice()
			.sort(
				(a, b) =>
					parseISO(b.eventDatetime).getTime() -
					parseISO(a.eventDatetime).getTime()
			);
	};

	const sortedEventsArray = sortedEvents(cattle.events ?? []);

	return (
		<div className="relative space-y-2 py-4">
			<p className="text-sm text-gray-600 dark:text-gray-400 text-right">
				{sortedEventsArray.length}件のイベント
			</p>
			{sortedEventsArray.map((event) => (
				<EventCard
					key={event.eventId}
					event={{
						eventId: event.eventId,
						eventType: event.eventType,
						eventDatetime: event.eventDatetime,
						notes: event.notes ?? undefined,
						cattleName: cattle.name,
						cattleEarTagNumber: cattle.earTagNumber ?? undefined
					}}
					hideCattleInfo
					onSave={async (id, data) => {
						const res = await updateEventAction(id, data as UpdateEventInput);
						if (res && (res as { success?: boolean }).success) {
							toast.success("イベントを更新しました");
							router.refresh();
						} else {
							toast.error("イベントの更新に失敗しました");
						}
					}}
					onConfirmDelete={async (id) => {
						const res = await deleteEventAction(id);
						if (res && (res as { success?: boolean }).success) {
							toast.success("イベントを削除しました");
							router.refresh();
						} else {
							toast.error("イベントの削除に失敗しました");
						}
					}}
				/>
			))}
			<div className="flex justify-center gap-2 text-xs text-gray-500">
				<p>登録日時: {cattle.createdAt}</p>/<p>更新日時: {cattle.updatedAt}</p>
			</div>
		</div>
	);
}
