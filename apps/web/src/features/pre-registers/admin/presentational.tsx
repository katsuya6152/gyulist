"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select";
import {
	downloadRegistrationsCsv,
	listRegistrations
} from "@/services/preRegisterService";
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
const pageSizeOptions = [5, 10, 20, 50, 100];

export function PreRegisterAdmin({ initialParams }: Props) {
	const router = useRouter();
	const [auth, setAuth] = useState<{ user: string; pass: string } | null>(null);
	const [credentials, setCredentials] = useState({ user: "", pass: "" });
	const [params, setParams] = useState<QueryParams>(initialParams);
	const [items, setItems] = useState<Item[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [hasTotal, setHasTotal] = useState<boolean>(false);

	useEffect(() => {
		if (!auth) return;
		const basic = btoa(`${auth.user}:${auth.pass}`);
		listRegistrations(params, basic).then((data) => {
			// API may return camelCase (memory) or snake_case (D1 raw select)
			type ApiReg = {
				email?: string;
				referralSource?: string | null;
				referral_source?: string | null;
				createdAt?: number;
				created_at?: number;
			};
			const mapped: Item[] = (data.items ?? []).map((r: ApiReg) => {
				const email = r.email ?? "";
				const referralSource = r.referralSource ?? r.referral_source ?? "";
				const sec = r.createdAt ?? r.created_at;
				const createdIso =
					typeof sec === "number" ? new Date(sec * 1000).toISOString() : "";
				return {
					email,
					referral_source: referralSource,
					created_at: createdIso
				};
			});
			setItems(mapped);
			const apiTotal = (data as { total?: number } | undefined)?.total;
			setHasTotal(typeof apiTotal === "number");
			setTotal(apiTotal ?? mapped.length);
		});
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
		const basic = btoa(`${auth.user}:${auth.pass}`);
		const blob = await downloadRegistrationsCsv(params, basic);
		await downloadCsv(blob, "pre-registers.csv");
	};

	// Pagination helpers (use UI default limit 20 when undefined)
	const effectiveLimit = params.limit ?? 20;
	const effectiveOffset = params.offset ?? 0;
	const hasPrev = effectiveOffset > 0;
	// Use server total when available, otherwise fall back to page-size heuristic
	const hasNext = hasTotal
		? effectiveOffset + effectiveLimit < total
		: items.length === effectiveLimit;

	if (!auth) {
		return (
			<div className="container max-w-lg mx-auto py-10">
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-xl">事前登録 管理ログイン</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-3">
							<Input
								placeholder="ユーザー"
								value={credentials.user}
								onChange={(e) =>
									setCredentials({
										...credentials,
										user: e.target.value
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
										pass: e.target.value
									})
								}
							/>
							<Button type="submit" className="w-full">
								ログイン
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl py-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">事前登録 管理</h1>
				<Badge variant="secondary">合計 {total}</Badge>
			</div>

			<Card className="shadow-sm">
				<CardHeader>
					<CardTitle className="text-base">検索フィルタ</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSearch}
						className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
					>
						<div className="md:col-span-2">
							<Input
								placeholder="メール検索"
								value={params.q ?? ""}
								onChange={(e) => setParams({ ...params, q: e.target.value })}
							/>
						</div>
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
						<div>
							<Select
								value={params.source ?? "all"}
								onValueChange={(v) =>
									setParams({
										...params,
										source: v === "all" ? undefined : v
									})
								}
							>
								<SelectTrigger className="w-full">
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
						</div>
						<div>
							<Select
								value={String(params.limit ?? 20)}
								onValueChange={(v) => {
									const newLimit = Number(v);
									const nextParams = { ...params, limit: newLimit, offset: 0 };
									setParams(nextParams);
									router.replace(`?${buildQuery(nextParams)}`);
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="表示件数" />
								</SelectTrigger>
								<SelectContent>
									{pageSizeOptions.map((n) => (
										<SelectItem key={n} value={String(n)}>
											{n}件
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-2 md:col-span-5">
							<Button type="submit" className="shrink-0">
								検索
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={handleDownload}
								className="shrink-0"
							>
								CSV
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card className="shadow-sm overflow-hidden">
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted sticky top-0 z-10">
								<tr>
									<th className="text-left px-4 py-3">email</th>
									<th className="text-left px-4 py-3">referral_source</th>
									<th className="text-left px-4 py-3">created_at</th>
								</tr>
							</thead>
							<tbody>
								{items.length === 0 ? (
									<tr>
										<td
											colSpan={3}
											className="px-4 py-8 text-center text-muted-foreground"
										>
											対象のデータがありません
										</td>
									</tr>
								) : (
									items.map((item, idx) => (
										<tr
											key={`${item.email}-${idx}`}
											className="border-t hover:bg-muted/40"
										>
											<td className="px-4 py-3 font-medium break-all">
												{item.email}
											</td>
											<td className="px-4 py-3">
												{item.referral_source || "-"}
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												{formatDate(item.created_at)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					disabled={!hasPrev}
					onClick={() => {
						const newOffset = Math.max(0, effectiveOffset - effectiveLimit);
						setParams({ ...params, offset: newOffset });
						router.replace(`?${buildQuery({ ...params, offset: newOffset })}`);
					}}
				>
					前へ
				</Button>
				<Button
					type="button"
					disabled={!hasNext}
					onClick={() => {
						const newOffset = effectiveOffset + effectiveLimit;
						setParams({ ...params, offset: newOffset });
						router.replace(`?${buildQuery({ ...params, offset: newOffset })}`);
					}}
				>
					次へ
				</Button>
			</div>
		</div>
	);
}
