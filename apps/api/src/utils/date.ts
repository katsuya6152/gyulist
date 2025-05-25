type AgeUnit = "years" | "months" | "days";

export function calculateAge(birthday: Date, unit: AgeUnit = "years"): number {
	const today = new Date();
	const diffTime = Math.abs(today.getTime() - birthday.getTime());

	switch (unit) {
		case "years":
			return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
		case "months":
			return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
		case "days":
			return Math.floor(diffTime / (1000 * 60 * 60 * 24));
		default:
			return 0;
	}
}
