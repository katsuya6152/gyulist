import { EventNewContainer } from "@/features/events/new/container";

export const runtime = "edge";

export default async function EventsNewPage({
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <EventNewContainer cattleId={id} />;
}
