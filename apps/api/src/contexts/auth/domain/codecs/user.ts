import { z } from "zod";

export const UserIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, { message: "id must be a number string" })
});

export const UpdateThemeSchema = z.object({
	theme: z.enum(["light", "dark", "system"], {
		errorMap: () => ({ message: "theme must be 'light', 'dark', or 'system'" })
	})
});
