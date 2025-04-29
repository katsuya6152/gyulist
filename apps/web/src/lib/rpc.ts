import { createClient } from "@repo/api";

export const client = createClient(
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
);
