import { FooterNav } from "@/components/footer-nav";
import { Toaster } from "sonner";

export default function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen pb-16">
			{children}
			<FooterNav />
			<Toaster position="top-center" richColors closeButton duration={10000} />
		</div>
	);
}
