"use server";

import { logoutAction as originalLogoutAction } from "../../app/(auth)/login/actions";

export async function logoutAction() {
	await originalLogoutAction();
}
