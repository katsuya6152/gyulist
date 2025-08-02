import ScheduleContainer from "@/features/schedule/container";

export const runtime = "edge";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function SchedulePage({ searchParams }: Props) {
	return <ScheduleContainer searchParams={searchParams} />;
}
