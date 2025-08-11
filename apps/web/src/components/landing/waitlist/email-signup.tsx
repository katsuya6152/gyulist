import { redirect } from "next/navigation";

async function submitWaitlist(formData: FormData) {
	"use server";

	const email = formData.get("email") as string;

	if (!email) {
		return;
	}

	// 実運用ではデータベースに保存やメール送信処理を行う
	// 現在はwaitlistページにリダイレクト
	redirect(`/waitlist?email=${encodeURIComponent(email)}`);
}

export function EmailSignup() {
	return (
		<section id="waitlist" className="py-12 md:py-16 bg-blue-50">
			<div className="container mx-auto px-4 max-w-2xl">
				<div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-blue-100">
					<h2 className="text-xl md:text-2xl font-bold text-center">
						正式開始の先行案内を受け取る
					</h2>
					<p className="mt-2 text-center text-gray-600">
						メールを登録すると、先行アクセスや特典のご案内をお送りします。
					</p>
					<form
						action={submitWaitlist}
						className="mt-6 flex flex-col sm:flex-row gap-3"
					>
						<label htmlFor="waitlist-email" className="sr-only">
							メールアドレス
						</label>
						<input
							id="waitlist-email"
							name="email"
							type="email"
							required
							inputMode="email"
							placeholder="メールアドレス"
							className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
						/>
						<button
							type="submit"
							className="inline-flex justify-center items-center bg-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
							data-cta="waitlist-submit"
						>
							登録する
						</button>
					</form>
				</div>
			</div>
		</section>
	);
}
