const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const publicDir = path.join(__dirname, "../apps/web/public");

async function generateBlurDataURL(imagePath) {
	try {
		const buffer = await sharp(imagePath)
			.resize(10, 7, { fit: "cover" })
			.jpeg({ quality: 20 })
			.toBuffer();

		return `data:image/jpeg;base64,${buffer.toString("base64")}`;
	} catch (error) {
		console.error(`Error generating blur for ${imagePath}:`, error.message);
		return null;
	}
}

async function generateAllBlurDataURLs() {
	console.log("🖼️ ぼやけ画像データを生成中...\n");

	const images = [
		"hero-bg-pc.png",
		"hero-bg-sp.png",
		"app-shot.png",
		"icon-horizontal.png"
	];

	for (const imageName of images) {
		const imagePath = path.join(publicDir, imageName);

		if (fs.existsSync(imagePath)) {
			const blurDataURL = await generateBlurDataURL(imagePath);

			if (blurDataURL) {
				console.log(`✅ ${imageName}:`);
				console.log(`   blurDataURL="${blurDataURL}"`);
				console.log("");
			}
		} else {
			console.log(`⚠️  ${imageName} が見つかりません`);
		}
	}

	console.log("🎉 ぼやけ画像データの生成が完了しました！");
	console.log("\n💡 使用方法:");
	console.log("1. 上記のblurDataURLを各Imageコンポーネントに設定");
	console.log('2. placeholder="blur" と組み合わせて使用');
}

generateAllBlurDataURLs().catch(console.error);
