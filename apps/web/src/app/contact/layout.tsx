import { MainContentWrapper } from "@/components/main-content-wrapper";
import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "sonner";

export default function ContactLayout({
	children
}: {
	children: React.ReactNode;
}) {
	return (
		<ThemeProvider defaultTheme="light">
			<div className="min-h-screen scroll-smooth">
				{/* メインコンテンツ */}
				<MainContentWrapper useSidebarLayout={false}>
					<main className="relative z-0 page-wrapper animate-fade-in bg-background">
						{children}
					</main>
				</MainContentWrapper>

				<Toaster position="top-center" richColors closeButton duration={5000} />
			</div>
		</ThemeProvider>
	);
}
