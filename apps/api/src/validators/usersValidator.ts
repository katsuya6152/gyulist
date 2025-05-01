import { z } from "zod";

export const UserIdParamSchema = z.object({
	id: z.string().regex(/^\d+$/, { message: "id must be a number string" }),
});
