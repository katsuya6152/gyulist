package services

import (
	"gyulist-api-go/internal/domain/services"
)

// EmailTemplate メールテンプレート実装
type EmailTemplate struct {
	config services.EmailConfig
}

// NewEmailTemplate EmailTemplateのコンストラクタ
func NewEmailTemplate(config services.EmailConfig) services.EmailTemplate {
	return &EmailTemplate{
		config: config,
	}
}

// GenerateCompletionEmail 事前登録完了メールのHTMLを生成
func (t *EmailTemplate) GenerateCompletionEmail() string {
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
</html>`
}

// GenerateVerificationEmail 会員登録確認メールのHTMLを生成
func (t *EmailTemplate) GenerateVerificationEmail(token string) string {
	verificationLink := t.config.WebURL + "/verify?token=" + token

	return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <title>ギュウリスト会員登録の確認</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-family: Arial, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: auto;
            padding: 40px;
        }
        .logo {
            text-align: center;
            padding-bottom: 32px;
        }
        .logo img {
            display: block;
            width: 120px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding-bottom: 16px;
            color: #333333;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            text-align: center;
            padding-bottom: 32px;
            color: #555555;
        }
        .button {
            display: inline-block;
            background-color: #BA5B34;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            padding: 14px 28px;
            border-radius: 6px;
            margin-bottom: 32px;
        }
        .footer {
            font-size: 12px;
            color: #999999;
            text-align: center;
            line-height: 1.4;
        }
        .footer a {
            color: #BA5B34;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- ロゴ -->
        <div class="logo">
            <img src="https://gyulist.com/icon-horizontal.png" alt="Gyulist" width="120">
        </div>

        <!-- タイトル -->
        <div class="title">
            会員登録の確認
        </div>

        <!-- 本文 -->
        <div class="content">
            ギュウリストへの会員登録がリクエストされました。<br>
            下記のリンクをクリックして、会員登録を完了してください。
        </div>

        <!-- 確認ボタン -->
        <div style="text-align: center;">
            <a href="` + verificationLink + `" class="button">
                会員登録を完了する
            </a>
        </div>

        <!-- リンク直接表示 -->
        <div class="content">
            ボタンがクリックできない場合は、以下のURLをブラウザにコピーしてアクセスしてください：<br>
            <a href="` + verificationLink + `" style="color: #BA5B34; word-break: break-all;">` + verificationLink + `</a>
        </div>

        <!-- 注意事項 -->
        <div class="content" style="font-size: 14px; color: #666666;">
            ※ このリンクの有効期限は24時間です。<br>
            ※ 登録リクエストをしていない場合は、このメールを無視してください。
        </div>

        <!-- フッター -->
        <div class="footer">
            ギュウリスト 運営事務局<br>
            <a href="mailto:support@gyulist.com">support@gyulist.com</a><br>
            <a href="https://gyulist.com">https://gyulist.com</a>
        </div>
    </div>
</body>
</html>`
}
