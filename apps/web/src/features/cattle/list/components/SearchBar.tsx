"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { memo, useState } from "react";

interface SearchBarProps {
	initialValue: string;
	onSearch: (value: string) => void;
	onClear: () => void;
}

export const SearchBar = memo(
	({ initialValue, onSearch, onClear }: SearchBarProps) => {
		const [searchValue, setSearchValue] = useState(initialValue);

		const handleSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSearch(searchValue);
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchValue(e.target.value);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				onSearch(searchValue);
			}
		};

		const handleClear = () => {
			setSearchValue("");
			onClear();
		};

		return (
			<form onSubmit={handleSubmit} className="relative flex w-full mb-2">
				<Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
				<Input
					type="search"
					placeholder="検索..."
					className="pl-10 ml-6 mr-32 bg-muted border-none transition-all duration-200 focus:shadow-md"
					value={searchValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
				/>
				{searchValue && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleClear}
						className="absolute right-20 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
				<Button
					type="submit"
					size="sm"
					className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-gradient-primary hover:shadow-lg transition-all duration-200 tap-feedback"
				>
					<Search className="h-4 w-4 mr-1" />
					検索
				</Button>
			</form>
		);
	}
);

SearchBar.displayName = "SearchBar";
