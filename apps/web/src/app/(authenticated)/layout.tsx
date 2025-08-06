import { FooterNav } from "@/components/footer-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { verifyAndGetUserId } from "@/lib/jwt";
import { ThemeProvider } from "@/lib/theme-provider";
import { getUserById } from "@/services/userService";
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

	// JWTからユーザーIDを取得
	let userId: number;
	try {
		userId = await verifyAndGetUserId();
	} catch (error) {
		console.error("Failed to verify JWT:", error);
		redirect("/login");
	}

	// ユーザー情報を取得してテーマを取得
	let userTheme: string | undefined;
	try {
		const user = await getUserById(userId);
		userTheme = user.theme || undefined;
	} catch (error) {
		console.error("Failed to fetch user theme:", error);
		// 認証エラーの場合はログインページにリダイレクト
		if (error instanceof Error && error.message.includes("401")) {
			redirect("/login");
		}
		// その他のエラー時はデフォルトテーマを使用
	}

	return (
		<ThemeProvider defaultTheme={userTheme as "light" | "dark" | "system"}>
			<div className="min-h-screen pb-20 scroll-smooth">
				<main className="relative z-0 page-wrapper animate-fade-in bg-background">
					{children}
				</main>
				<FooterNav />
				<ScrollToTop threshold={200} duration={500} />
				<Toaster
					position="top-center"
					richColors
					closeButton
					duration={10000}
				/>
			</div>
		</ThemeProvider>
	);
}
