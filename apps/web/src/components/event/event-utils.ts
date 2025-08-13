import { format, parseISO } from "date-fns";

export const formatEventDate = (iso: string) =>
	format(parseISO(iso), "yyyy/MM/dd");
export const formatEventTime = (iso: string) => format(parseISO(iso), "HH:mm");
