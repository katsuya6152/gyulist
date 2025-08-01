import { GetCattleDetail } from "@/services/cattleService";
import { notFound } from "next/navigation";
import { EventNewPresentation } from "./presentational";

interface EventNewContainerProps {
	cattleId: string;
}

export async function EventNewContainer({ cattleId }: EventNewContainerProps) {
	try {
		const cattle = await GetCattleDetail(cattleId);

		if (!cattle) {
			notFound();
		}

		return <EventNewPresentation cattle={cattle} />;
	} catch (error) {
		console.error("Failed to fetch cattle data:", error);
		notFound();
	}
}
