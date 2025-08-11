import AdminRegistrationsContainer from "@/features/admin/registrations/list/container";

export const runtime = "edge";

interface Props {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default function AdminRegistrationsPage({ searchParams }: Props) {
	return <AdminRegistrationsContainer searchParams={searchParams} />;
}
