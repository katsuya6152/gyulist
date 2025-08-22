export type CattleListFilter = {
	search?: string;
	growthStage?: string[];
	gender?: string[];
	status?: string[];
	hasAlert?: boolean;
};

export type CattleListSort = {
	sortBy: "id" | "name" | "days_old";
	sortOrder: "asc" | "desc";
};

export type CattleListParams = CattleListFilter &
	CattleListSort & {
		cursor?: string;
		limit?: number;
	};
