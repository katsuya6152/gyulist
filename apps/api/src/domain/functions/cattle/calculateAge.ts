/**
 * 牛の日齢計算ドメイン関数
 *
 * 誕生日から現在の日齢、月齢、年齢を計算します。
 */

/**
 * 日齢計算ユーティリティ
 */
export const calculateAgeFromBirthday = (birthday: string | null) => {
	if (!birthday) {
		return {
			daysOld: null,
			monthsOld: null,
			age: null
		};
	}

	try {
		const birthDate = new Date(birthday);

		// 不正な日付の場合、Invalid Dateとなる
		if (Number.isNaN(birthDate.getTime())) {
			return {
				daysOld: null,
				monthsOld: null,
				age: null
			};
		}

		const today = new Date();
		const diffTime = today.getTime() - birthDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		// より正確な月齢計算
		const monthsOld = Math.floor(diffDays / 30.44); // 平均月日数

		// より正確な年齢計算
		const yearsExact = diffDays / 365.25;
		const age = Math.floor(yearsExact);

		return {
			daysOld: diffDays,
			monthsOld,
			age
		};
	} catch {
		return {
			daysOld: null,
			monthsOld: null,
			age: null
		};
	}
};
