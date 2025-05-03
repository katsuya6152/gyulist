"use client";

import { Suspense } from "react";
import CompleteRegistrationForm from "./form";

export default function CompleteRegistrationPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CompleteRegistrationForm />
		</Suspense>
	);
}
