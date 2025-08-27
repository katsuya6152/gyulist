import ShipmentsContainer from "@/features/shipments/container";

export const runtime = "edge";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ShipmentsPage({ searchParams }: Props) {
	return <ShipmentsContainer searchParams={searchParams} />;
}
