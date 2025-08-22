# 全イベントストーリー - 副作用処理ドキュメント

## 概要

このドキュメントは、Gyulistシステムにおける全イベントタイプのストーリーと副作用処理を包括的に記録したものです。各イベントがどのような条件で発生し、どのような副作用を引き起こすかを明確化し、システムの動作予測性と保守性を向上させます。

## イベント分類

### 1. 導入・移動イベント
- **ARRIVAL**: 牛の導入
- **SHIPMENT**: 牛の出荷

### 2. 繁殖イベント
- **ESTRUS**: 発情
- **EXPECTED_ESTRUS**: 発情予定日
- **INSEMINATION**: 人工授精
- **PREGNANCY_CHECK**: 妊娠鑑定
- **EXPECTED_CALVING**: 分娩予定日
- **CALVING**: 分娩
- **ABORTION**: 流産
- **STILLBIRTH**: 死産
- **DEATH**: 死亡

### 3. 成長・発達イベント
- **WEANING**: 断乳
- **START_FATTENING**: 肥育開始

### 4. 計測・記録イベント
- **WEIGHT_MEASURED**: 体重計測

### 5. 健康管理イベント
- **VACCINATION**: ワクチン接種
- **DIAGNOSIS**: 診断
- **MEDICATION**: 投薬
- **TREATMENT_STARTED**: 治療開始
- **TREATMENT_COMPLETED**: 治療完了
- **HOOF_TRIMMING**: 削蹄

### 6. その他
- **OTHER**: その他のイベント

---

## 詳細イベントストーリー

### 1. ARRIVAL（導入）

#### トリガー条件
- 新規牛の登録時
- 既存牛の移動時

#### 副作用処理
```typescript
// 1. 牛のステータス更新
- status: "HEALTHY" に設定
- arrivalDate: 導入日を記録

// 2. 繁殖集約の初期化
- 繁殖状態: "NOT_BREEDING"
- 産次: 0（初産牛の場合）
- 繁殖履歴: 空配列

// 3. アラート条件のリセット
- 空胎日数関連アラートをクリア
- 分娩予定関連アラートをクリア
```

#### ビジネスルール
- 導入日は過去の日付のみ許可
- 既存牛の場合は重複チェック
- 血統情報の整合性確認

#### 関連アラート
- 新規導入後の繁殖開始タイミングアラート

---

### 2. ESTRUS（発情）

#### トリガー条件
- 牛の発情観察時
- 繁殖管理の記録時

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- 繁殖状態: "IN_ESTRUS" に変更
- 発情開始日時: 記録
- 最適人工授精期間: 発情開始から12-18時間後

// 2. 繁殖統計の更新
- 発情回数: +1
- 最終発情日: 更新

// 3. 次回発情予定日の計算
- 標準周期: 21日後
- 個体差を考慮した範囲: 18-24日後

// 4. 発情予定イベントの自動作成
- 21日後の発情予定イベントを自動生成
- イベントタイプ: "EXPECTED_ESTRUS"
- ノート: "前回発情から21日後の発情予定日（自動生成）"
```

#### ビジネスルール
- 発情中の牛は人工授精可能
- 発情から20日経過で妊娠確認が必要
- 連続発情の場合は異常として記録

#### 関連アラート
- **ESTRUS_OVER20_NOT_PREGNANT**: 発情から20日経過で妊娠していない場合

---

### 3. EXPECTED_ESTRUS（発情予定日）

#### トリガー条件
- 発情観察後の次回発情予定日設定
- 繁殖管理計画での発情予定日設定
- 手動での発情予定日入力・調整

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- scheduledPregnancyCheckDate: 発情予定日を設定
- 繁殖メモ: イベントノートの記録
- 発情周期の管理

// 2. 繁殖統計の更新
- 発情予定頭数: 更新
- 発情周期の記録: 更新

// 3. アラート生成
- 発情予定3日前の通知
- 発情観察の開始通知
- 人工授精準備の通知

// 4. スケジュール管理
- 発情観察作業の計画
- 人工授精の準備計画
```

#### ビジネスルール
- 発情観察後または手動入力で設定
- 予定日の調整は可能
- 発情観察の開始タイミングの管理

#### 関連アラート
- 発情予定3日前の通知
- 発情観察開始の通知
- 人工授精準備の通知

---

### 3. INSEMINATION（人工授精）

#### トリガー条件
- 発情中の牛への人工授精実施時
- 繁殖管理の記録時

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- 繁殖状態: "INSEMINATED" に変更
- 人工授精日時: 記録
- 人工授精回数: +1

// 2. 分娩予定日の計算
- 標準妊娠期間: 280日
- 分娩予定日: 人工授精日 + 280日

// 3. 繁殖統計の更新
- 人工授精回数: +1
- 最終人工授精日: 更新

// 4. 妊娠確認スケジュールの設定
- 1回目: 人工授精から30-35日後
- 2回目: 人工授精から60-65日後
```

#### ビジネスルール
- 発情中の牛のみ人工授精可能
- 人工授精から妊娠確認まで適切な間隔を保持
- 複数回の人工授精は記録として残す

#### 関連アラート
- **CALVING_WITHIN_60**: 分娩予定日まで60日以内
- **CALVING_OVERDUE**: 分娩予定日を超過

---

### 3. PREGNANCY_CHECK（妊娠鑑定）

#### トリガー条件
- 人工授精後21日程度の妊娠鑑定時
- 妊娠状態の確認時

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- 繁殖状態: "PREGNANT" に変更
- 妊娠日数: 計算・記録
- 予定分娩日: 設定（妊娠鑑定日 + 約240日）
- 予定妊娠確認日: 次回鑑定日の設定

// 2. 繁殖統計の更新
- 妊娠頭数: +1
- 妊娠成功率: 更新
- 平均妊娠期間: 更新

// 3. 次回アクションのスケジュール
- 分娩予定日の設定
- 分娩準備の開始
- 健康管理の強化
```

#### ビジネスルール
- 人工授精後21日以降に実施
- 妊娠確認後の適切な管理計画の策定
- 分娩予定日の正確な設定

#### 関連アラート
- 妊娠鑑定予定日の通知
- 分娩予定日の接近通知

---

### 4. EXPECTED_CALVING（分娩予定日）

#### トリガー条件
- 妊娠鑑定時の予定日設定
- 手動での分娩予定日入力
- 予定日の調整・変更時

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- expectedCalvingDate: 設定・更新
- 繁殖メモ: イベントノートの記録
- 妊娠状態の確認

// 2. 繁殖統計の更新
- 分娩予定頭数: 更新
- 予定日別の管理計画: 更新

// 3. アラート生成
- 分娩予定5日前の通知
- 分娩準備の開始通知
- 獣医・スタッフの手配通知

// 4. スケジュール管理
- 分娩準備作業の計画
- 関連イベントのスケジュール
```

#### ビジネスルール
- 妊娠鑑定時または手動入力で設定
- 予定日の調整は可能
- 分娩準備の開始タイミングの管理

#### 関連アラート
- 分娩予定5日前の通知
- 分娩準備開始の通知
- 獣医・スタッフ手配の通知

---

### 5. CALVING（分娩）

#### トリガー条件
- 妊娠牛の分娩時
- 分娩管理の記録時

#### 副作用処理
```typescript
// 1. 牛のステータス更新
- status: "RESTING" に変更
- 分娩日: 記録
- 産次: +1

// 2. 繁殖集約の更新
- 繁殖状態: "POST_CALVING" に変更
- 分娩日時: 記録
- 分娩回数: +1

// 3. 繁殖統計の更新
- 分娩回数: +1
- 最終分娩日: 更新
- 妊娠期間: 計算・記録

// 4. 次回繁殖開始のスケジュール
- 推奨開始日: 分娩から60日後
- 最適人工授精期間: 分娩から60-90日後

// 5. 子牛情報の記録
- 子牛の性別、体重、健康状態
- 母子関係の確立
```

#### ビジネスルール
- 妊娠中の牛のみ分娩記録可能
- 分娩予定日との整合性チェック
- 分娩後の適切な休養期間の確保

#### 関連アラート
- **OPEN_DAYS_OVER60_NO_AI**: 分娩から60日以上で人工授精未実施

---

### 6. ABORTION（流産）

#### トリガー条件
- 妊娠牛の流産時
- 異常妊娠の記録時

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- 繁殖状態: "NOT_BREEDING" に変更
- 流産日時: 記録
- 流産回数: +1

// 2. 繁殖統計の更新
- 流産回数: +1
- 最終流産日: 更新

// 3. 健康状態の確認
- 流産原因の調査
- 治療の必要性判断

// 4. 次回繁殖開始のスケジュール
- 推奨開始日: 流産から30-45日後
- 個体の回復状況に応じた調整
```

#### ビジネスルール
- 妊娠中の牛のみ流産記録可能
- 流産原因の記録が必須
- 流産後の適切な休養期間の確保

#### 関連アラート
- 流産後の健康状態監視アラート

---

### 7. STILLBIRTH（死産）

#### トリガー条件
- 分娩時の死産時
- 異常分娩の記録時

#### 副作用処理
```typescript
// 1. 繁殖集約の更新
- 繁殖状態: "POST_CALVING" に変更
- 死産日時: 記録
- 死産回数: +1

// 2. 繁殖統計の更新
- 死産回数: +1
- 最終死産日: 更新

// 3. 健康状態の確認
- 死産原因の調査
- 母牛の健康状態評価

// 4. 次回繁殖開始のスケジュール
- 推奨開始日: 死産から60-90日後
- 個体の回復状況に応じた調整
```

#### ビジネスルール
- 分娩中の牛のみ死産記録可能
- 死産原因の記録が必須
- 死産後の適切な休養期間の確保

#### 関連アラート
- 死産後の健康状態監視アラート

---

### 8. DEATH（死亡）

#### トリガー条件
- 牛の死亡時
- 死亡管理の記録時

#### 副作用処理
```typescript
// 1. 牛のステータス更新
- status: "DEAD" に変更
- 死亡日: 記録
- 死亡原因: 記録

// 2. 繁殖集約の更新
- 繁殖状態: "DEAD" に変更
- 死亡日時: 記録

// 3. 血統情報の更新
- 死亡個体として記録
- 血統情報の継続性確保

// 4. 関連アラートの解決
- 繁殖関連アラートをクリア
- 健康管理アラートをクリア
```

#### ビジネスルール
- 死亡原因の記録が必須
- 死亡後の適切な記録管理
- 血統情報の継続性確保

#### 関連アラート
- 死亡関連アラートの生成
- 既存アラートの自動解決

---

### 8. WEANING（断乳）

#### トリガー条件
- 子牛の断乳時
- 母子分離の記録時

#### 副作用処理
```typescript
// 1. 子牛のステータス更新
- 子牛の独立個体としての管理開始
- 断乳日: 記録

// 2. 母牛の繁殖準備
- 繁殖状態: "READY_FOR_BREEDING" に変更
- 断乳日: 記録

// 3. 栄養管理の調整
- 母牛用飼料への切り替え
- 子牛用飼料の開始
```

#### ビジネスルール
- 適切な断乳時期の遵守
- 母子の健康状態確認
- 断乳後の栄養管理の適切な実施

#### 関連アラート
- 断乳後の子牛成長監視アラート

---

### 9. START_FATTENING（肥育開始）

#### トリガー条件
- 肥育牛の肥育開始時
- 肥育管理の記録時

#### 副作用処理
```typescript
// 1. 牛の成長段階更新
- growthStage: "FATTENING" に変更
- 肥育開始日: 記録

// 2. 栄養管理の開始
- 肥育用飼料への切り替え
- 肥育目標の設定

// 3. 計測スケジュールの設定
- 体重計測頻度: 月1回
- 肥育効果の評価

// 4. 成長段階の自動管理
- 肥育牛としての管理開始
- 肥育関連の統計・分析対象に追加
```

#### ビジネスルール
- 適切な肥育開始時期の遵守
- 肥育目標の明確化
- 定期的な成長評価の実施

---

### 10. WEIGHT_MEASURED（体重計測）

#### トリガー条件
- 定期的な体重計測時
- 肥育効果の評価時

#### 副作用処理
```typescript
// 1. 成長記録の更新
- 体重: 記録
- 計測日: 記録
- 計測回数: +1

// 2. 成長率の計算
- 日増体重: 計算
- 肥育効果: 評価

// 3. 栄養管理の調整
- 飼料給与量の調整
- 肥育目標の見直し
```

#### ビジネスルール
- 定期的な計測の実施
- 計測値の妥当性チェック
- 成長率の適切な評価

#### 関連アラート
- 成長率低下アラート
- 肥育目標未達アラート

---

### 11. VACCINATION（ワクチン接種）

#### トリガー条件
- 定期予防接種時
- 疾病予防の記録時

#### 副作用処理
```typescript
// 1. 予防接種記録の更新
- 接種日: 記録
- ワクチン種類: 記録
- 接種回数: +1

// 2. 次回接種予定日の設定
- ワクチン種類に応じた間隔
- 個体の健康状態に応じた調整

// 3. 健康状態の監視
- 接種後の副作用監視
- 免疫効果の評価
```

#### ビジネスルール
- 適切な接種時期の遵守
- ワクチン種類の適切な選択
- 接種後の健康状態監視

#### 関連アラート
- 次回接種予定日アラート
- 接種後の副作用監視アラート

---

### 12. DIAGNOSIS（診断）

#### トリガー条件
- 疾病の診断時
- 健康状態の評価時

#### 副作用処理
```typescript
// 1. 診断記録の更新
- 診断日: 記録
- 診断結果: 記録
- 診断医: 記録

// 2. 治療計画の策定
- 治療方法: 決定
- 治療期間: 設定
- 投薬計画: 策定

// 3. 健康状態の更新
- 疾病状態: 記録
- 治療必要性: 評価
```

#### ビジネスルール
- 適切な診断の実施
- 診断結果の正確な記録
- 治療計画の適切な策定

#### 関連アラート
- 治療開始アラート
- 治療完了予定アラート

---

### 13. MEDICATION（投薬）

#### トリガー条件
- 治療薬の投与時
- 予防薬の投与時

#### 副作用処理
```typescript
// 1. 投薬記録の更新
- 投薬日: 記録
- 薬剤名: 記録
- 投与量: 記録
- 投与回数: +1

// 2. 次回投薬予定日の設定
- 薬剤種類に応じた間隔
- 治療効果に応じた調整

// 3. 副作用の監視
- 投薬後の健康状態監視
- 治療効果の評価
```

#### ビジネスルール
- 適切な投薬時期の遵守
- 薬剤の適切な選択
- 投薬後の健康状態監視

#### 関連アラート
- 次回投薬予定日アラート
- 投薬後の副作用監視アラート

---

### 14. TREATMENT_STARTED（治療開始）

#### トリガー条件
- 治療の開始時
- 治療計画の実行時

#### 副作用処理
```typescript
// 1. 治療記録の更新
- 治療開始日: 記録
- 治療方法: 記録
- 治療期間: 設定

// 2. 牛のステータス更新
- status: "UNDER_TREATMENT" に変更
- 治療状態: 記録

// 3. 治療スケジュールの設定
- 治療回数: 設定
- 治療間隔: 設定
- 治療完了予定日: 計算
```

#### ビジネスルール
- 適切な治療の開始
- 治療計画の適切な実行
- 治療効果の定期的な評価

#### 関連アラート
- 治療完了予定アラート
- 治療効果監視アラート

---

### 15. TREATMENT_COMPLETED（治療完了）

#### トリガー条件
- 治療の完了時
- 治療効果の確認時

#### 副作用処理
```typescript
// 1. 治療記録の更新
- 治療完了日: 記録
- 治療結果: 記録
- 治療効果: 評価

// 2. 牛のステータス更新
- status: "HEALTHY" に変更
- 治療状態: "COMPLETED" に変更

// 3. 健康状態の評価
- 治療効果の評価
- 再発リスクの評価
- 予防策の検討
```

#### ビジネスルール
- 適切な治療完了の確認
- 治療効果の適切な評価
- 再発予防策の検討

#### 関連アラート
- 再発リスク監視アラート
- 予防接種推奨アラート

---

### 16. HOOF_TRIMMING（削蹄）

#### トリガー条件
- 定期的な削蹄時
- 蹄の異常時の削蹄時

#### 副作用処理
```typescript
// 1. 削蹄記録の更新
- 削蹄日: 記録
- 削蹄方法: 記録
- 削蹄回数: +1

// 2. 次回削蹄予定日の設定
- 標準間隔: 6ヶ月
- 個体の蹄状態に応じた調整

// 3. 蹄の健康状態の評価
- 蹄の状態評価
- 歩行状態の確認
```

#### ビジネスルール
- 適切な削蹄時期の遵守
- 削蹄方法の適切な選択
- 削蹄後の健康状態監視

#### 関連アラート
- 次回削蹄予定日アラート
- 蹄の異常監視アラート

---

### 17. SHIPMENT（出荷）

#### トリガー条件
- 市場への出荷時（実績）
- 出荷予定日の設定時（計画）

#### 副作用処理
```typescript
// 1. 牛のステータス更新（日付により判別）
const eventDate = new Date(eventDatetime);
const now = new Date();

if (eventDate > now) {
  // 未来の日付 → 出荷予定
  - status: "SCHEDULED_FOR_SHIPMENT" に変更
  - 出荷予定日: 記録
  - 出荷準備の開始
} else {
  // 過去・現在の日付 → 出荷完了
  - status: "SHIPPED" に変更
  - 出荷日: 記録
  - 出荷先: 記録
}

// 2. 繁殖集約の更新
- 繁殖状態: "SHIPPED" に変更（実績のみ）
- 出荷日時: 記録

// 3. 血統情報の更新（実績のみ）
- 出荷個体として記録
- 血統情報の継続性確保

// 4. アラート管理
if (eventDate > now) {
  // 出荷予定3日前の通知設定
  - 出荷準備開始アラート
  - 最終健康チェックアラート
} else {
  // 関連アラートの解決
  - 繁殖関連アラートをクリア
  - 健康管理アラートをクリア
}
```

#### ビジネスルール
- 出荷予定の場合：準備期間の確保が必要
- 出荷実績の場合：出荷先の記録が必須
- 出荷後の適切な記録管理
- 血統情報の継続性確保

#### 関連アラート
- **出荷予定**: 出荷予定3日前の準備通知
- **出荷実績**: 既存アラートの自動解決
- 最終健康チェックの実施通知

---

### 18. OTHER（その他）

#### トリガー条件
- 上記に分類されないイベント
- 特殊な管理イベント

#### 副作用処理
```typescript
// 1. イベント記録の更新
- イベント日: 記録
- イベント内容: 記録
- イベント種類: "OTHER"

// 2. 必要に応じた処理
- 個別の処理内容に応じた対応
- 関連するデータの更新
```

#### ビジネスルール
- イベント内容の適切な記録
- 必要に応じた処理の実施
- 記録の適切な管理

#### 関連アラート
- 特殊イベント監視アラート

---

## アラート生成条件の詳細

### 1. OPEN_DAYS_OVER60_NO_AI（空胎60日以上）

#### 生成条件
```typescript
// 1. 最終分娩の確認
const lastCalving = await findLastCalving(cattleId);
if (!lastCalving) return null;

// 2. 分娩からの経過日数計算
const daysSinceCalving = calculateDaysBetween(lastCalving.date, currentDate);
if (daysSinceCalving < 60) return null;

// 3. 分娩後の人工授精確認
const postCalvingAI = await findPostCalvingAI(cattleId, lastCalving.date);
if (postCalvingAI) return null;

// 4. アラート生成
return createAlert({
  type: "OPEN_DAYS_OVER60_NO_AI",
  severity: "medium",
  message: "最終分娩から60日以上、人工授精未実施"
});
```

#### 解決条件
- 人工授精の実施
- 牛の出荷
- 牛の死亡

---

### 2. CALVING_WITHIN_60（分娩予定日60日以内）

#### 生成条件
```typescript
// 1. 最終人工授精の確認
const lastAI = await findLastAI(cattleId);
if (!lastAI) return null;

// 2. 分娩予定日の計算
const expectedCalvingDate = calculateExpectedCalvingDate(lastAI.date);
const daysUntilCalving = calculateDaysBetween(currentDate, expectedCalvingDate);

// 3. 60日以内の確認
if (daysUntilCalving > 60) return null;

// 4. アラート生成
return createAlert({
  type: "CALVING_WITHIN_60",
  severity: "medium",
  message: "分娩予定日まで60日以内（エサ強化）"
});
```

#### 解決条件
- 分娩の実施
- 流産の発生
- 牛の出荷

---

### 3. CALVING_OVERDUE（分娩予定日超過）

#### 生成条件
```typescript
// 1. 最終人工授精の確認
const lastAI = await findLastAI(cattleId);
if (!lastAI) return null;

// 2. 分娩予定日の計算
const expectedCalvingDate = calculateExpectedCalvingDate(lastAI.date);

// 3. 予定日超過の確認
if (currentDate <= expectedCalvingDate) return null;

// 4. アラート生成
return createAlert({
  type: "CALVING_OVERDUE",
  severity: "high",
  message: "分娩予定日を経過"
});
```

#### 解決条件
- 分娩の実施
- 流産の発生
- 牛の出荷

---

### 4. ESTRUS_OVER20_NOT_PREGNANT（発情20日経過）

#### 生成条件
```typescript
// 1. 最終発情の確認
const lastEstrus = await findLastEstrus(cattleId);
if (!lastEstrus) return null;

// 2. 発情からの経過日数計算
const daysSinceEstrus = calculateDaysBetween(lastEstrus.date, currentDate);
if (daysSinceEstrus < 20) return null;

// 3. 妊娠状態の確認
const isPregnant = await checkPregnancyStatus(cattleId);
if (isPregnant) return null;

// 4. アラート生成
return createAlert({
  type: "ESTRUS_OVER20_NOT_PREGNANT",
  severity: "low",
  message: "発情から20日経過（再発情を確認）"
});
```

#### 解決条件
- 人工授精の実施
- 妊娠確認の実施
- 牛の出荷

---

## 副作用処理の実装パターン

### 1. イベントハンドラー

```typescript
// イベント作成時の副作用処理
export async function handleEventSideEffects(
  event: Event,
  deps: Dependencies
): Promise<Result<void, DomainError>> {
  switch (event.eventType) {
    case "CALVING":
      return await handleCalvingSideEffects(event, deps);
    case "INSEMINATION":
      return await handleInseminationSideEffects(event, deps);
    case "SHIPMENT":
      return await handleShipmentSideEffects(event, deps);
    default:
      return ok(undefined);
  }
}
```

### 2. 状態遷移処理

```typescript
// 牛のステータス更新
export async function updateCattleStatus(
  cattleId: CattleId,
  newStatus: CattleStatus,
  reason: string | null,
  deps: Dependencies
): Promise<Result<void, DomainError>> {
  // 1. 現在のステータスを取得
  const currentCattle = await deps.cattleRepo.findById(cattleId);
  if (!currentCattle) {
    return err({ type: "NotFound", message: "Cattle not found" });
  }

  // 2. ステータス履歴を記録
  await deps.cattleRepo.addStatusHistory({
    cattleId,
    oldStatus: currentCattle.status,
    newStatus,
    reason,
    changedBy: deps.currentUserId,
    createdAt: deps.clock.now()
  });

  // 3. ステータスを更新
  return await deps.cattleRepo.updateStatus(cattleId, newStatus);
}
```

### 3. アラート生成処理

```typescript
// アラート条件の評価
export async function evaluateAlertConditions(
  cattleId: CattleId,
  deps: Dependencies
): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // 1. 空胎日数超過チェック
  const openDaysAlert = await checkOpenDaysOver60(cattleId, deps);
  if (openDaysAlert) alerts.push(openDaysAlert);

  // 2. 分娩予定日チェック
  const calvingAlert = await checkCalvingDueDate(cattleId, deps);
  if (calvingAlert) alerts.push(calvingAlert);

  // 3. 発情経過チェック
  const estrusAlert = await checkEstrusOver20(cattleId, deps);
  if (estrusAlert) alerts.push(estrusAlert);

  return alerts;
}
```

---

## データ整合性の保証

### 1. トランザクション管理

```typescript
// イベント作成と副作用処理の原子性保証
export async function createEventWithSideEffects(
  eventData: CreateEventInput,
  deps: Dependencies
): Promise<Result<Event, DomainError>> {
  return await deps.db.transaction(async (tx) => {
    // 1. イベントを作成
    const event = await deps.eventsRepo.create(eventData, tx);
    
    // 2. 副作用処理を実行
    await handleEventSideEffects(event, { ...deps, db: tx });
    
    // 3. アラート条件を評価
    const alerts = await evaluateAlertConditions(event.cattleId, { ...deps, db: tx });
    
    // 4. アラートを保存
    for (const alert of alerts) {
      await deps.alertsRepo.create(alert, tx);
    }
    
    return event;
  });
}
```

### 2. 整合性チェック

```typescript
// イベントの整合性検証
export function validateEventConsistency(
  event: Event,
  existingEvents: Event[]
): Result<true, DomainError> {
  // 1. 日時の整合性
  const chronologicalEvents = existingEvents
    .filter(e => e.cattleId === event.cattleId)
    .sort((a, b) => a.eventDatetime.getTime() - b.eventDatetime.getTime());
  
  const lastEvent = chronologicalEvents[chronologicalEvents.length - 1];
  if (lastEvent && event.eventDatetime < lastEvent.eventDatetime) {
    return err({
      type: "ValidationError",
      message: "Event datetime must be after the last event"
    });
  }

  // 2. ビジネスルールの整合性
  const businessRuleValidation = validateBusinessRules(event, existingEvents);
  if (!businessRuleValidation.ok) return businessRuleValidation;

  return ok(true);
}
```

---

## パフォーマンス最適化

### 1. 並列処理

```typescript
// 複数の副作用処理を並列実行
export async function executeSideEffectsInParallel(
  event: Event,
  deps: Dependencies
): Promise<Result<void, DomainError>> {
  const [
    statusUpdateResult,
    breedingUpdateResult,
    alertEvaluationResult
  ] = await Promise.all([
    updateCattleStatus(event.cattleId, getNewStatus(event), null, deps),
    updateBreedingAggregate(event.cattleId, event, deps),
    evaluateAlertConditions(event.cattleId, deps)
  ]);

  // エラーチェック
  if (!statusUpdateResult.ok) return statusUpdateResult;
  if (!breedingUpdateResult.ok) return breedingUpdateResult;
  if (!alertEvaluationResult.ok) return alertEvaluationResult;

  return ok(undefined);
}
```

### 2. バッチ処理

```typescript
// アラート生成のバッチ処理
export async function generateAlertsBatch(
  userIds: UserId[],
  deps: Dependencies
): Promise<AlertBatchResult> {
  const batchSize = 100;
  const results: AlertBatchResult[] = [];

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const batchResult = await Promise.all(
      batch.map(userId => generateAlertsForUser(userId, deps))
    );
    results.push(...batchResult);
  }

  return aggregateBatchResults(results);
}
```
---

## 今後の拡張予定

### 1. 新しいイベントタイプ

- **BREEDING_PAUSE**: 繁殖休止
- **REACTIVATION**: 繁殖再開
- **MOVEMENT**: 牛舎移動
- **FEEDING_CHANGE**: 飼料変更

### 2. 高度な副作用処理

- **機械学習による予測**: 分娩予定日の精度向上
- **自動スケジュール生成**: 最適な管理スケジュールの提案

### 3. 外部システム連携

- **獣医システム**: 診断・治療情報の連携
- **飼料管理システム**: 栄養管理の最適化
- **市場情報システム**: 出荷タイミングの最適化
