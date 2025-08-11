"use client";

import { useRouter } from "next/navigation";

const sources = ["Twitter/X", "検索", "友人", "ブログ記事", "その他"];

interface Registration {
	email: string;
	referral_source: string | null;
	created_at: number;
}

interface Props {
	registrations: Registration[];
	params: URLSearchParams;
}

export default function AdminRegistrationsPresentation({
	registrations,
	params,
}: Props) {
	const router = useRouter();
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const newParams = new URLSearchParams();
		formData.forEach((value, key) => {
			if (value) newParams.set(key, String(value));
		});
		router.push(`/admin/registrations?${newParams.toString()}`);
	};
	const limit = Number(params.get("limit") || "10");
	const offset = Number(params.get("offset") || "0");
	const next = () => {
		params.set("offset", String(offset + limit));
		router.push(`/admin/registrations?${params.toString()}`);
	};
	const prev = () => {
		params.set("offset", String(Math.max(offset - limit, 0)));
		router.push(`/admin/registrations?${params.toString()}`);
	};
	const csvUrl = `/api/v1/admin/registrations.csv?${params.toString()}`;

	return (
		<div className="p-4">
			<form onSubmit={handleSubmit} className="space-y-2 mb-4">
				<input
					name="q"
					placeholder="メール検索"
					defaultValue={params.get("q") || ""}
					className="border p-1"
				/>
				<input
					name="from"
					type="date"
					defaultValue={params.get("from") || ""}
					className="border p-1"
				/>
				<input
					name="to"
					type="date"
					defaultValue={params.get("to") || ""}
					className="border p-1"
				/>
				<select
					name="source"
					defaultValue={params.get("source") || ""}
					className="border p-1"
				>
					<option value="">流入元</option>
					{sources.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>
				<button type="submit" className="border px-2 py-1">
					検索
				</button>
			</form>
			<table className="w-full border">
				<thead>
					<tr>
						<th className="border px-2">email</th>
						<th className="border px-2">referral_source</th>
						<th className="border px-2">created_at</th>
					</tr>
				</thead>
				<tbody>
					{registrations.map((r) => (
						<tr key={r.email}>
							<td className="border px-2">{r.email}</td>
							<td className="border px-2">{r.referral_source ?? ""}</td>
							<td className="border px-2">
								{new Date(r.created_at * 1000).toLocaleString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex gap-2 mt-2">
				<button
					type="button"
					onClick={prev}
					className="border px-2 py-1"
					disabled={offset === 0}
				>
					前へ
				</button>
				<button type="button" onClick={next} className="border px-2 py-1">
					次へ
				</button>
				<a href={csvUrl} className="border px-2 py-1" download>
					CSV
				</a>
			</div>
		</div>
	);
}
