import Link from "next/link";

interface WaitlistPageProps {
	searchParams: Promise<{ email?: string }>;
}

export const runtime = "edge";

export default async function WaitlistPage({
	searchParams,
}: WaitlistPageProps) {
	const { email } = await searchParams;

	return (
		<div className="min-h-screen bg-gradient-to-br gradient-primary-start gradient-primary-end flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-8 h-8 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>登録完了</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					事前登録完了！
				</h1>

				{email && (
					<p className="text-gray-600 mb-6">
						<span className="font-medium">{email}</span> で登録いただきました
					</p>
				)}

				<p className="text-gray-600 mb-8">
					正式リリース時に先行案内をお送りします。
					<br />
					特典情報もお楽しみに！
				</p>

				<div className="space-y-3">
					<Link
						href="/login"
						className="block w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
					>
						デモを体験する
					</Link>
					<Link
						href="/"
						className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						トップページに戻る
					</Link>
				</div>
			</div>
		</div>
	);
}
