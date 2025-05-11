import { FooterNav } from "@/components/footer-nav";

export default function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen pb-16">
			{children}
			<FooterNav />
		</div>
	);
}
