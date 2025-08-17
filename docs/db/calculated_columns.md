## 📊 自動計算仕様

| テーブル               | カラム                         | 日本語カラム名                     | 計算方法（人間向け説明）                                                 |
|------------------------|------------------------------|----------------------------------|---------------------------------------------------------------------|
| **cattle**             | `age`                        | 年齢（満何歳）                    | 現在日付から `birthday` を引き，365日ごとに切り捨てた値（満何歳）                     |
|                        | `monthsOld`                  | 月齢                              | 現在日付から `birthday` を引き，30日ごとに切り捨てた値（満何か月齢）                    |
|                        | `daysOld`                    | 日齢                              | 現在日付から `birthday` を引いた日数差（生後何日目）                             |
| **breeding_status**    | `parity`                     | 産次                              | これまでに記録された「分娩(CALVING)」イベントの合計回数                             |
|                        | `expectedCalvingDate`        | 分娩予定日                        | 最終「受精(INSEMINATION)」イベント日から標準妊娠期間（約283日）後の日付                 |
|                        | `scheduledPregnancyCheckDate`| 妊娠鑑定予定日                    | 最終「受精」イベント日から約30日後の日付                                        |
|                        | `daysAfterCalving`           | 分娩後経過日数                    | 最終「分娩」イベント日から今日までの経過日数                                       |
|                        | `daysOpen`                   | 空胎日数                          | 最終「分娩」イベント日から今日までの経過日数（`daysAfterCalving`と同じ）                |
|                        | `pregnancyDays`              | 妊娠日数                          | 最終「受精」イベント日から今日までの経過日数                                       |
|                        | `daysAfterInsemination`      | 受精後経過日数                    | 最終「受精」イベント日から今日までの経過日数（`pregnancyDays`と同じ）                   |
|                        | `inseminationCount`          | 種付回数                          | 最後の「分娩」イベント日以降に記録された「受精」イベントの回数                              |
| **breeding_summary**   | `totalInseminationCount`     | 累計種付回数                      | これまで記録されたすべての「受精」イベントの総数                                     |
|                        | `averageDaysOpen`            | 平均空胎日数                      | 過去の各分娩間隔（日数：ある分娩日〜次の分娩日の差）の平均値                               |
|                        | `averagePregnancyPeriod`     | 平均妊娠期間                      | 過去の各「受精」〜「分娩」までの日数の平均値                                       |
|                        | `averageCalvingInterval`     | 平均分娩間隔                      | `averageDaysOpen` と同一（分娩間隔の平均）                                |
|                        | `difficultBirthCount`        | 難産回数                          | 過去に「難産」とマークされた回数                                             |
|                        | `pregnancyHeadCount`         | 受胎頭数                          | 過去に成功した分娩（CALVING）イベントの総数                                    |
|                        | `pregnancySuccessRate`       | 受胎率                            | `pregnancyHeadCount ÷ totalInseminationCount × 100`（％表示の受胎率） |
