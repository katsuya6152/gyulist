import { Card, CardContent } from "@/components/ui/card";
import type { PreRegisterItem } from "../types";
import { formatDate } from "../utils";

interface DataTableCardProps {
	items: PreRegisterItem[];
}

export function DataTableCard({ items }: DataTableCardProps) {
	return (
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
										<td className="px-4 py-3">{item.referral_source || "-"}</td>
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
	);
}
