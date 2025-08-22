## 📊 データベースカラム仕様

この表はGyulistの全テーブルについて、各カラムの日本語名・分類・必須性をまとめたものです。

| テーブル             | カラム                         | 日本語カラム名                  | 分類               | 必須 |
|----------------------|--------------------------------|-----------------------------|--------------------|------|
| **cattle**           | cattleId                       | 牛ID                         | システム自動設定   | Yes  |
|                      | ownerUserId                    | 所有者ユーザーID              | システム自動設定   | Yes  |
|                      | identificationNumber           | 個体識別番号                  | ユーザー入力       | Yes  |
|                      | earTagNumber                   | 耳標番号                      | ユーザー入力       | No   |
|                      | name                           | 名号                          | ユーザー入力       | No   |
|                      | growthStage                    | 成長段階                      | ユーザー入力       | No   |
|                      | birthday                       | 出生日                        | ユーザー入力       | No   |
|                      | gender                         | 性別                          | ユーザー入力       | No   |
|                      | score                          | 得点                          | ユーザー入力       | No   |
|                      | breed                          | 品種                          | ユーザー入力       | No   |
|                      | status                         | ステータス                    | ユーザー入力       | No   |
|                      | producerName                   | 生産者名                      | ユーザー入力       | No   |
|                      | barn                            | 牛舎                          | ユーザー入力       | No   |
|                      | breedingValue                  | 育種価                        | ユーザー入力       | No   |
|                      | notes                           | 備考                          | ユーザー入力       | No   |
|                      | age                             | 年齢（満何歳）                | 表示時計算         | No   |
|                      | monthsOld                       | 月齢                          | 表示時計算         | No   |
|                      | daysOld                         | 日齢                          | 表示時計算         | No   |
|                      | createdAt                       | 登録日時                      | システム自動設定   | Yes  |
|                      | updatedAt                       | 更新日時                      | システム自動設定   | Yes  |
| **bloodline**        | bloodlineId                     | 血統情報ID                    | システム自動設定   | Yes  |
|                      | cattleId                        | 牛ID                          | システム自動設定   | Yes  |
|                      | fatherCattleName                | 父の名号                      | ユーザー入力       | No   |
|                      | motherFatherCattleName          | 母の父の名号                  | ユーザー入力       | No   |
|                      | motherGrandFatherCattleName     | 母の祖父の名号                | ユーザー入力       | No   |
|                      | motherGreatGrandFatherCattleName| 母の曾祖父の名号              | ユーザー入力       | No   |
| **mother_info**      | motherInfoId                    | 母情報ID                      | システム自動設定   | Yes  |
|                      | cattleId                        | 牛ID                          | システム自動設定   | Yes  |
|                      | motherCattleId                  | 母の牛ID                      | ユーザー入力       | Yes  |
|                      | motherName                      | 母の名号                      | ユーザー入力       | No   |
|                      | motherIdentificationNumber      | 母の個体識別番号              | ユーザー入力       | No   |
|                      | motherScore                     | 母の得点                      | ユーザー入力       | No   |
| **breeding_status**  | breedingStatusId                | 繁殖状態ID                    | システム自動設定   | Yes  |
|                      | cattleId                        | 牛ID                          | システム自動設定   | Yes  |
|                      | parity                          | 産次                          | システム自動計算   | No   |
|                      | expectedCalvingDate             | 分娩予定日                    | システム自動計算   | No   |
|                      | scheduledPregnancyCheckDate     | 妊娠鑑定予定日                | システム自動計算   | No   |
|                      | daysAfterCalving                | 分娩後経過日数                | システム自動計算   | No   |
|                      | daysOpen                        | 空胎日数                      | システム自動計算   | No   |
|                      | pregnancyDays                   | 妊娠日数                      | システム自動計算   | No   |
|                      | daysAfterInsemination           | 受精後経過日数                | システム自動計算   | No   |
|                      | inseminationCount               | 種付回数                      | システム自動計算   | No   |
|                      | breedingMemo                    | 繁殖メモ                      | ユーザー入力       | No   |
|                      | isDifficultBirth                | 難産フラグ                    | ユーザー入力       | No   |
|                      | createdAt                       | 登録日時                      | システム自動設定   | Yes  |
|                      | updatedAt                       | 更新日時                      | システム自動設定   | Yes  |
| **breeding_summary** | breedingSummaryId               | 繁殖サマリーID                | システム自動設定   | Yes  |
|                      | cattleId                        | 牛ID                          | システム自動設定   | Yes  |
|                      | totalInseminationCount          | 累計種付回数                  | システム自動計算   | No   |
|                      | averageDaysOpen                 | 平均空胎日数                  | システム自動計算   | No   |
|                      | averagePregnancyPeriod          | 平均妊娠期間                  | システム自動計算   | No   |
|                      | averageCalvingInterval          | 平均分娩間隔                  | システム自動計算   | No   |
|                      | difficultBirthCount             | 難産回数                      | システム自動計算   | No   |
|                      | pregnancyHeadCount              | 受胎頭数                      | システム自動計算   | No   |
|                      | pregnancySuccessRate            | 受胎率                        | システム自動計算   | No   |
|                      | createdAt                       | 登録日時                      | システム自動設定   | Yes  |
|                      | updatedAt                       | 更新日時                      | システム自動設定   | Yes  |
| **events**           | eventId                         | イベントID                    | システム自動設定   | Yes  |
|                | cattleId                        | 牛ID                          | システム自動設定   | Yes  |
|                      | eventType                       | イベント種別                  | ユーザー入力       | Yes  |
|                      | eventDatetime                   | イベント日時                  | ユーザー入力       | Yes  |
|                      | notes                            | メモ                           | ユーザー入力       | No   |
|                      | createdAt                       | 登録日時                      | システム自動設定   | Yes  |
|                      | updatedAt                       | 更新日時                      | システム自動設定   | Yes  |
| **cattle_status_history** | historyId                   | ステータス履歴ID              | システム自動設定   | Yes  |
|                      | cattleId                        | 牛ID                          | システム自動設定   | Yes  |
|                      | oldStatus                      | 旧ステータス                  | システム自動設定   | No   |
|                      | newStatus                      | 新ステータス                  | ユーザー入力       | Yes  |
|                      | changedAt                      | 変更日時                      | システム自動設定   | Yes  |
|                      | changedBy                      | 変更者ユーザーID              | システム自動設定   | Yes  |
|                      | reason                         | 変更理由                      | ユーザー入力       | No   |
