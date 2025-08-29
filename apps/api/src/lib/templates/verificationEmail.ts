/**
 * 会員登録確認メールのHTMLテンプレート
 */

export function generateVerificationEmailHtml(verificationUrl: string): string {
	return `
<!DOCTYPE html>
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
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #A04A2A;
        }
        .highlight {
            background-color: #FFF8F6;
            border: 1px solid #F0E6E0;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
            text-align: left;
        }
        .highlight p {
            margin: 0 0 10px 0;
            color: #BA5B34;
            font-weight: bold;
        }
        .highlight p:last-child {
            margin-bottom: 0;
            font-weight: normal;
            color: #555555;
        }
        .warning {
            background-color: #FFF3E0;
            border: 1px solid #FFCC80;
            color: #E65100;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #E0E0E0;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: #999999;
            margin: 5px 0;
            line-height: 1.4;
        }
        .footer a {
            color: #BA5B34;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://gyulist.com/icon-horizontal.png" alt="Gyulist" width="120">
        </div>
        
        <div class="title">会員登録の確認</div>
        
        <div class="content">
            ギュウリストにご登録いただきありがとうございます。<br>
            以下のボタンをクリックして、メールアドレスの認証を完了してください。
        </div>
        
        <div class="highlight">
            <p>次のステップ</p>
            <p>メールアドレスの認証が完了すると、ギュウリストのサービスをご利用いただけます。</p>
        </div>
        
        <div style="text-align: center;">
            <a class="button" href="${verificationUrl}">メールアドレスを認証する</a>
        </div>
        
        <div class="warning">
            <strong>⚠️ 重要:</strong> このリンクは <strong>24時間</strong> 有効です。
        </div>
        
        <div class="content">
            もしこのメールに覚えがない場合は、このまま無視してください。
        </div>
        
        <div class="footer">
            <p>ギュウリスト 運営事務局</p>
            <p><a href="mailto:support@gyulist.com">support@gyulist.com</a></p>
            <p><a href="https://gyulist.com">https://gyulist.com</a></p>
            <p>畜産管理をより簡単に、より効率的に</p>
        </div>
    </div>
</body>
</html>
	`;
}
