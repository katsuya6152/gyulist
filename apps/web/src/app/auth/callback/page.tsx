"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			console.error("No token found in URL");
			router.push("/login?error=no_token");
			return;
		}

		try {
			// トークンをCookieに保存
			const isProduction = window.location.protocol === "https:";
			const cookieString = `token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax${isProduction ? "; secure" : ""}`;
			document.cookie = cookieString;

			// 成功後にスケジュールページにリダイレクト
			router.push("/schedule?filter=today");
		} catch (error) {
			console.error("Failed to set token cookie:", error);
			router.push("/login?error=cookie_failed");
		}
	}, [searchParams, router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
				<p>ログイン処理中...</p>
			</div>
		</div>
	);
}

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
						<p>読み込み中...</p>
					</div>
				</div>
			}
		>
			<AuthCallbackContent />
		</Suspense>
	);
}
