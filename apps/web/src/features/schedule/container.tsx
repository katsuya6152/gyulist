import { getFilteredEvents } from "./actions";
import { SchedulePresentation } from "./presentational";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ScheduleContainer({ searchParams }: Props) {
	const params = await searchParams;
	const filter = Array.isArray(params.filter)
		? params.filter[0]
		: params.filter;
	const customDate = Array.isArray(params.date) ? params.date[0] : params.date;

	// フィルターの型安全性を確保
	const validFilter =
		filter === "today" ||
		filter === "tomorrow" ||
		filter === "dayAfterTomorrow" ||
		filter === "all" ||
		filter === "custom"
			? filter
			: "all";

	const result = await getFilteredEvents(validFilter, customDate);

	return (
		<SchedulePresentation
			events={result.events}
			currentFilter={result.filter}
			customDate={result.customDate}
			error={result.success ? undefined : result.error}
		/>
	);
}
