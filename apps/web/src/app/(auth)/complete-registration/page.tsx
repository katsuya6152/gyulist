"use client";

import { Suspense } from "react";
import CompleteRegistrationForm from "./form";

export const runtime = "edge";

export default function CompleteRegistrationPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CompleteRegistrationForm />
		</Suspense>
	);
}
