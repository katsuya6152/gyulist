export function preRegistrationCompleteHtml(): string {
	return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
<title>事前登録完了のお知らせ｜ギュウリスト</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family: Arial, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; color:#333333;">

<!-- コンテナ -->
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; padding:40px;">
  <!-- ロゴ -->
  <tr>
    <td align="center" style="padding-bottom:32px;">
      <img src="https://gyulist.com/icon-horizontal.png" alt="Gyulist" width="120" style="display:block;">
    </td>
  </tr>

  <!-- タイトル -->
  <tr>
    <td style="font-size:24px; font-weight:bold; text-align:center; padding-bottom:16px;">
      事前登録ありがとうございます！
    </td>
  </tr>

  <!-- 本文 -->
  <tr>
    <td style="font-size:16px; line-height:1.6; text-align:center; padding-bottom:32px; color:#555555;">
      「ギュウリスト」に事前登録いただき、誠にありがとうございます。<br>
      ご登録は無事に完了しました。<br>
      正式リリースや最新情報はメールでお知らせいたします。
    </td>
  </tr>

  <!-- CTAボタン -->
  <tr>
    <td align="center" style="padding-bottom:40px;">
      <a href="https://gyulist.com/login" target="_blank" style="background-color:#BA5B34; color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold; padding:14px 28px; border-radius:6px; display:inline-block;">
        デモを見る
      </a>
    </td>
  </tr>

  <!-- フッター -->
  <tr>
    <td style="font-size:12px; color:#999999; text-align:center; line-height:1.4;">
      ギュウリスト 運営事務局<br>
      <a href="mailto:support@gyulist.com" style="color:#BA5B34; text-decoration:none;">support@gyulist.com</a><br>
      <a href="https://gyulist.com" style="color:#BA5B34; text-decoration:none;">https://gyulist.com</a>
    </td>
  </tr>
</table>

</body>
</html>`;
}
