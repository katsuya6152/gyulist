"use client";

import { logoutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
	return (
		<form action={logoutAction}>
			<Button variant="outline" type="submit">
				ログアウト
			</Button>
		</form>
	);
}
