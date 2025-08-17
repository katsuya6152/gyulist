/// <reference types="node" />

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Hono } from "hono";
import { createRoutes } from "../src/routes";
import openapiApp from "../src/routes/openapi";
import type { Bindings } from "../src/types";

async function main() {
	// Build a minimal app just to mount /api-docs
	const app = new Hono<{ Bindings: Bindings }>();
	// Mount actual API (not strictly required for spec output, but ok)
	createRoutes(app);
	app.route("/api/v1/api-docs", openapiApp);

	// Fetch the generated OpenAPI JSON
	const res = await app.request(
		"http://localhost/api/v1/api-docs/openapi.json"
	);
	const spec = await res.text();

	const outPath = resolve(process.cwd(), "../../docs/openapi.json");
	mkdirSync(dirname(outPath), { recursive: true });
	writeFileSync(outPath, spec);
	console.log(`OpenAPI spec written to ${outPath}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
