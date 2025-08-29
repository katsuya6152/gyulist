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
	DEFAULT_PAGE_SIZE,
	PAGE_SIZE_OPTIONS,
	REFERRAL_SOURCES
} from "../constants";
import type { QueryParams } from "../types";

interface SearchFilterCardProps {
	params: QueryParams;
	onParamsChange: (params: QueryParams) => void;
	onSearch: (e: React.FormEvent) => void;
	onDownload: () => void;
}

export function SearchFilterCard({
	params,
	onParamsChange,
	onSearch,
	onDownload
}: SearchFilterCardProps) {
	return (
		<Card className="shadow-sm">
			<CardHeader>
				<CardTitle className="text-base">検索フィルタ</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={onSearch}
					className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
				>
					<div className="md:col-span-2">
						<Input
							placeholder="メール検索"
							value={params.q ?? ""}
							onChange={(e) => onParamsChange({ ...params, q: e.target.value })}
						/>
					</div>
					<Input
						type="date"
						value={params.from ?? ""}
						onChange={(e) =>
							onParamsChange({ ...params, from: e.target.value })
						}
					/>
					<Input
						type="date"
						value={params.to ?? ""}
						onChange={(e) => onParamsChange({ ...params, to: e.target.value })}
					/>
					<div>
						<Select
							value={params.source ?? "all"}
							onValueChange={(v) =>
								onParamsChange({
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
								{REFERRAL_SOURCES.map((s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select
							value={String(params.limit ?? DEFAULT_PAGE_SIZE)}
							onValueChange={(v) => {
								const newLimit = Number(v);
								onParamsChange({ ...params, limit: newLimit, offset: 0 });
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="表示件数" />
							</SelectTrigger>
							<SelectContent>
								{PAGE_SIZE_OPTIONS.map((n) => (
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
							onClick={onDownload}
							className="shrink-0"
						>
							CSV
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
