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
		const today = new Date();
		const diffTime = today.getTime() - birthDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		const monthsOld = Math.floor(diffDays / 30.44); // 平均月日数
		const age = Math.floor(diffDays / 365.25); // 平均年日数

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
