"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type QueryParams, buildQuery, downloadCsv, formatDate } from "./utils";

interface Props {
	initialParams: QueryParams;
}

type Item = {
	email: string;
	referral_source: string;
	created_at: string;
};

const sources = ["Twitter/X", "検索", "友人", "ブログ記事", "その他"];

export function PreRegisterAdmin({ initialParams }: Props) {
	const router = useRouter();
	const [auth, setAuth] = useState<{ user: string; pass: string } | null>(null);
	const [credentials, setCredentials] = useState({ user: "", pass: "" });
	const [params, setParams] = useState<QueryParams>(initialParams);
	const [items, setItems] = useState<Item[]>([]);

	useEffect(() => {
		if (!auth) return;
		const query = buildQuery(params);
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pre-registers?${query}`, {
			headers: {
				Authorization: `Basic ${btoa(`${auth.user}:${auth.pass}`)}`,
			},
		})
			.then((res) => res.json())
			.then((data) => setItems(data.items ?? []));
	}, [auth, params]);

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		setAuth(credentials);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setParams({ ...params, offset: 0 });
		router.replace(`?${buildQuery({ ...params, offset: 0 })}`);
	};

	const handleDownload = async () => {
		if (!auth) return;
		const query = buildQuery(params);
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pre-registers?${query}`,
			{
				headers: {
					Authorization: `Basic ${btoa(`${auth.user}:${auth.pass}`)}`,
					Accept: "text/csv",
				},
			},
		);
		const blob = await res.blob();
		await downloadCsv(blob, "pre-registers.csv");
	};

	if (!auth) {
		return (
			<form onSubmit={handleLogin} className="max-w-sm mx-auto mt-8 space-y-2">
				<Input
					placeholder="ユーザー"
					value={credentials.user}
					onChange={(e) =>
						setCredentials({
							...credentials,
							user: e.target.value,
						})
					}
				/>
				<Input
					placeholder="パスワード"
					type="password"
					value={credentials.pass}
					onChange={(e) =>
						setCredentials({
							...credentials,
							pass: e.target.value,
						})
					}
				/>
				<Button type="submit">ログイン</Button>
			</form>
		);
	}

	return (
		<div className="space-y-4">
			<form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
				<Input
					placeholder="メール検索"
					value={params.q ?? ""}
					onChange={(e) => setParams({ ...params, q: e.target.value })}
				/>
				<Input
					type="date"
					value={params.from ?? ""}
					onChange={(e) => setParams({ ...params, from: e.target.value })}
				/>
				<Input
					type="date"
					value={params.to ?? ""}
					onChange={(e) => setParams({ ...params, to: e.target.value })}
				/>
				<Select
					value={params.source ?? "all"}
					onValueChange={(v) =>
						setParams({
							...params,
							source: v === "all" ? undefined : v,
						})
					}
				>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="流入元" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">全て</SelectItem>
						{sources.map((s) => (
							<SelectItem key={s} value={s}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button type="submit">検索</Button>
				<Button type="button" onClick={handleDownload}>
					CSV
				</Button>
			</form>

			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="bg-gray-100">
						<th className="border p-2">email</th>
						<th className="border p-2">referral_source</th>
						<th className="border p-2">created_at</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<tr key={item.email}>
							<td className="border p-2">{item.email}</td>
							<td className="border p-2">{item.referral_source}</td>
							<td className="border p-2">{formatDate(item.created_at)}</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex gap-2">
				<Button
					type="button"
					disabled={(params.offset ?? 0) === 0}
					onClick={() => {
						const newOffset = Math.max(
							0,
							(params.offset ?? 0) - (params.limit ?? 20),
						);
						setParams({ ...params, offset: newOffset });
						router.replace(
							`?${buildQuery({
								...params,
								offset: newOffset,
							})}`,
						);
					}}
				>
					前へ
				</Button>
				<Button
					type="button"
					onClick={() => {
						const newOffset = (params.offset ?? 0) + (params.limit ?? 20);
						setParams({ ...params, offset: newOffset });
						router.replace(
							`?${buildQuery({
								...params,
								offset: newOffset,
							})}`,
						);
					}}
				>
					次へ
				</Button>
			</div>
		</div>
	);
}
