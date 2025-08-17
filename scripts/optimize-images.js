const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const publicDir = path.join(__dirname, "../apps/web/public");

// 最適化対象の画像
const imagesToOptimize = [
	{
		input: "hero-bg-pc.png",
		outputs: [
			{ name: "hero-bg-pc.webp", quality: 80, width: 1920 },
			{ name: "hero-bg-pc@2x.webp", quality: 80, width: 3840 }
		]
	},
	{
		input: "hero-bg-sp.png",
		outputs: [
			{ name: "hero-bg-sp.webp", quality: 80, width: 768 },
			{ name: "hero-bg-sp@2x.webp", quality: 80, width: 1536 }
		]
	},
	{
		input: "app-shot.png",
		outputs: [
			{ name: "app-shot.webp", quality: 85 },
			{ name: "app-shot@2x.webp", quality: 85, width: 1200 }
		]
	},
	{
		input: "icon-horizontal.png",
		outputs: [{ name: "icon-horizontal.webp", quality: 90 }]
	}
];

async function optimizeImages() {
	console.log("🖼️ 画像最適化を開始します...");

	for (const image of imagesToOptimize) {
		const inputPath = path.join(publicDir, image.input);

		if (!fs.existsSync(inputPath)) {
			console.log(`⚠️  ${image.input} が見つかりません`);
			continue;
		}

		console.log(`📸 ${image.input} を処理中...`);

		for (const output of image.outputs) {
			const outputPath = path.join(publicDir, output.name);

			try {
				let sharpInstance = sharp(inputPath);

				if (output.width) {
					sharpInstance = sharpInstance.resize(output.width, null, {
						withoutEnlargement: true,
						fit: "inside"
					});
				}

				await sharpInstance
					.webp({ quality: output.quality })
					.toFile(outputPath);

				const stats = fs.statSync(outputPath);
				const originalStats = fs.statSync(inputPath);
				const savings = (
					((originalStats.size - stats.size) / originalStats.size) *
					100
				).toFixed(1);

				console.log(
					`  ✅ ${output.name} (${(stats.size / 1024).toFixed(1)}KB, ${savings}% 削減)`
				);
			} catch (error) {
				console.error(`  ❌ ${output.name} の処理に失敗:`, error.message);
			}
		}
	}

	console.log("🎉 画像最適化が完了しました！");
}

optimizeImages().catch(console.error);
