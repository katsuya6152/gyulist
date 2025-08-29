import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_OPTIONS } from "../constants";
import type { ThemeOption } from "../constants";

interface ApplicationSettingsCardProps {
	theme: ThemeOption;
	onThemeChange: (theme: ThemeOption) => void;
	isUpdatingTheme: boolean;
}

export function ApplicationSettingsCard({
	theme,
	onThemeChange,
	isUpdatingTheme
}: ApplicationSettingsCardProps) {
	const getIcon = (iconName: string) => {
		switch (iconName) {
			case "Sun":
				return <Sun className="h-4 w-4" />;
			case "Moon":
				return <Moon className="h-4 w-4" />;
			case "Monitor":
				return <Monitor className="h-4 w-4" />;
			default:
				return null;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>アプリケーション設定</CardTitle>
				<CardDescription>アプリケーションの動作に関する設定</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label className="text-base font-medium">テーマ</Label>
					<p className="text-sm text-muted-foreground">
						アプリケーションの見た目をカスタマイズします
					</p>
					<RadioGroup
						value={theme}
						onValueChange={(value) => onThemeChange(value as ThemeOption)}
						className="grid grid-cols-1 gap-4 mt-4"
						disabled={isUpdatingTheme}
					>
						{THEME_OPTIONS.map((option) => (
							<div
								key={option.value}
								className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer"
							>
								<RadioGroupItem
									value={option.value}
									id={option.value}
									disabled={isUpdatingTheme}
								/>
								<Label
									htmlFor={option.value}
									className="flex items-center gap-2 cursor-pointer"
								>
									{getIcon(option.icon)}
									{option.label}
									{isUpdatingTheme && (
										<span className="text-sm text-muted-foreground">
											(保存中...)
										</span>
									)}
								</Label>
							</div>
						))}
					</RadioGroup>
				</div>
			</CardContent>
		</Card>
	);
}
