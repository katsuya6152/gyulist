import { cors } from "hono/cors";

export const corsMiddleware = cors({
	origin: ["http://localhost:3000", "https://gyulist.pages.dev"],
	allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type", "Authorization"],
	credentials: true,
});
