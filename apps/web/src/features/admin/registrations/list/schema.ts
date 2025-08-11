import { z } from "zod";

export const filterSchema = z.object({
	q: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	source: z.string().optional(),
	limit: z.coerce.number().optional(),
	offset: z.coerce.number().optional(),
});

export type FilterInput = z.infer<typeof filterSchema>;
