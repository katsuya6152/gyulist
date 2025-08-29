"use client";

import { Badge } from "@/components/ui/badge";
import {
	downloadRegistrationsCsv,
	listRegistrations
} from "@/services/preRegisterService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "./components/AuthCard";
import { DataTableCard } from "./components/DataTableCard";
import { Pagination } from "./components/Pagination";
import { SearchFilterCard } from "./components/SearchFilterCard";
import type { PreRegisterAdminProps } from "./types";
import type { AuthCredentials, PreRegisterItem, QueryParams } from "./types";
import { buildQuery, downloadCsv } from "./utils";

export function PreRegisterAdmin({ initialParams }: PreRegisterAdminProps) {
	const router = useRouter();
	const [auth, setAuth] = useState<AuthCredentials | null>(null);
	const [credentials, setCredentials] = useState<AuthCredentials>({
		user: "",
		pass: ""
	});
	const [params, setParams] = useState<QueryParams>(initialParams);
	const [items, setItems] = useState<PreRegisterItem[]>([]);
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
			const mapped: PreRegisterItem[] = (data.items ?? []).map((r: ApiReg) => {
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

	const handleCredentialsChange = (newCredentials: AuthCredentials) => {
		setCredentials(newCredentials);
	};

	const handleParamsChange = (newParams: QueryParams) => {
		setParams(newParams);
		// URLも更新
		router.replace(`?${buildQuery(newParams)}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const searchParams = { ...params, offset: 0 };
		handleParamsChange(searchParams);
	};

	const handleDownload = async () => {
		if (!auth) return;
		const basic = btoa(`${auth.user}:${auth.pass}`);
		const blob = await downloadRegistrationsCsv(params, basic);
		await downloadCsv(blob, "pre-registers.csv");
	};

	// Pagination helpers
	const effectiveLimit = params.limit ?? 20;
	const effectiveOffset = params.offset ?? 0;
	const hasPrev = effectiveOffset > 0;
	const hasNext = hasTotal
		? effectiveOffset + effectiveLimit < total
		: items.length === effectiveLimit;

	if (!auth) {
		return (
			<AuthCard
				credentials={credentials}
				onCredentialsChange={handleCredentialsChange}
				onLogin={handleLogin}
			/>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl py-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">事前登録 管理</h1>
				<Badge variant="secondary">合計 {total}</Badge>
			</div>

			<SearchFilterCard
				params={params}
				onParamsChange={handleParamsChange}
				onSearch={handleSearch}
				onDownload={handleDownload}
			/>

			<DataTableCard items={items} />

			<Pagination
				params={params}
				onParamsChange={handleParamsChange}
				hasNext={hasNext}
				hasPrev={hasPrev}
			/>
		</div>
	);
}
