import { SearchEvents } from "@/services/eventService";
import { SchedulePresentation } from "./presentational";

export async function ScheduleContainer() {
	try {
		const eventsData = await SearchEvents({ limit: 50 });
		return <SchedulePresentation events={eventsData.results} />;
	} catch (error) {
		console.error("Failed to fetch events:", error);
		return <SchedulePresentation events={[]} />;
	}
}
