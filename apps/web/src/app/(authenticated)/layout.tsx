import { FooterNav } from "@/components/footer-nav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

export default async function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const token = cookieStore.get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen pb-16">
			{children}
			<FooterNav />
			<Toaster position="top-center" richColors closeButton duration={10000} />
		</div>
	);
}
