-- =============================
-- 0) テーブルデータのリセット（依存順に削除し、自動採番をリセット）
-- =============================
DELETE FROM events;
DELETE FROM cattle_status_history;
DELETE FROM breeding_summary;
DELETE FROM breeding_status;
DELETE FROM mother_info;
DELETE FROM bloodline;
DELETE FROM cattle;
DELETE FROM sessions;
DELETE FROM registrations;
DELETE FROM email_logs;
DELETE FROM users;

-- 自動増分IDのリセット (sqlite_sequence)
DELETE FROM sqlite_sequence WHERE name = 'events';
DELETE FROM sqlite_sequence WHERE name = 'cattle_status_history';
DELETE FROM sqlite_sequence WHERE name = 'breeding_summary';
DELETE FROM sqlite_sequence WHERE name = 'breeding_status';
DELETE FROM sqlite_sequence WHERE name = 'mother_info';
DELETE FROM sqlite_sequence WHERE name = 'bloodline';
DELETE FROM sqlite_sequence WHERE name = 'cattle';
DELETE FROM sqlite_sequence WHERE name = 'users';

-- =============================
-- 1) users テーブルのダミーデータ
-- =============================
INSERT INTO users (userName, email, passwordHash, is_verified, verification_token)
VALUES
  ('Test User', 'test@test.co.jp', '$2a$10$3L5VA0dU9n13/ZHOO.ak.uXmJI1YkyvfLV45OwnJl99DJCznEvdsa', 1, NULL),
  ('Bob', 'bob@example.com', '$2a$10$uvwxyz0123456789ABCDE', 1, NULL),
  ('Charlie', 'charlie@example.com', '$2a$10$ABCD1234EFGH5678IJKL', 0, NULL),
  ('David', 'david@example.com', '$2a$10$MNOPQRSTUVWX01234567', 0, NULL);

-- =============================
-- 2) cattle テーブル（全15頭、"けいぴー"系は含めない）
-- =============================
INSERT INTO cattle (
  ownerUserId,
  identificationNumber,
  earTagNumber,
  name,
  growthStage,
  birthday,
  gender,
  weight,
  score,
  breed,
  status,
  producerName,
  barn,
  breedingValue,
  notes
)
VALUES
-- cattleId=1
(1, 11001, 21001, 'あやめ', 'MULTI_PAROUS', '2021-01-15', '雌', 520, 85, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'AACBBA', '落ち着いた性格'),
-- cattleId=2
(1, 11002, 21002, 'ハナコ', 'MULTI_PAROUS', '2020-06-10', '雌', 540, 88, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'ABABAB', '繁殖実績安定'),
-- cattleId=3
(2, 12001, 22001, 'じろう', 'FATTENING', '2023-07-20', '去勢', 430, 78, '黒毛和種', 'HEALTHY', '生産者B', '牛舎B', 'BABCBB', '増体良好'),
-- cattleId=4
(2, 12002, 22002, 'マルコ', 'GROWING', '2022-05-15', '雌', 380, 80, '黒毛和種', 'RESTING', '生産者B', '牛舎B', 'AAAAAA', '休息中'),
-- cattleId=5
(1, 11005, 21005, 'さくら', 'FIRST_CALVED', '2022-03-25', '雌', 480, 82, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'AACBBA', '初産後回復良好'),
-- cattleId=6
(1, 11006, 21006, 'みずき', 'MULTI_PAROUS', '2021-02-12', '雌', 510, 84, '黒毛和種', 'PREGNANT', '生産者A', '牛舎A', 'BBABAC', '妊娠経過良好'),
-- cattleId=7
(2, 12007, 22007, 'ゆき', 'MULTI_PAROUS', '2020-11-05', '雌', 530, 86, '黒毛和種', 'HEALTHY', '生産者B', '牛舎B', 'AABBCC', '温厚で扱いやすい'),
-- cattleId=8
(2, 12008, 22008, 'こたろう', 'GROWING', '2024-04-05', '去勢', 210, 65, '黒毛和種', 'HEALTHY', '生産者B', '牛舎B', 'AABBCC', '活発'),
-- cattleId=9
(1, 11009, 21009, 'ひかり', 'CALF', '2025-06-20', '雌', 95, 60, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'CCBBAA', '生後間もない'),
-- cattleId=10
(2, 12010, 22010, 'りん', 'MULTI_PAROUS', '2019-12-15', '雌', 560, 90, '黒毛和種', 'PREGNANT', '生産者B', '牛舎B', 'ABABAB', '産次3'),
-- cattleId=11
(1, 11011, 21011, 'しょうた', 'FATTENING', '2023-09-10', '去勢', 400, 75, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'BBBBBA', '採食量多い'),
-- cattleId=12
(1, 11012, 21012, 'もも', 'CALF', '2025-05-30', '雌', 88, 58, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'CBABAC', '健診異常なし'),
-- cattleId=13
(2, 12013, 22013, 'けんた', 'GROWING', '2024-03-18', '去勢', 230, 66, '黒毛和種', 'HEALTHY', '生産者B', '牛舎B', 'CACACA', 'よく動く'),
-- cattleId=14
(1, 11014, 21014, 'あおい', 'FIRST_CALVED', '2022-08-22', '雌', 490, 83, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'BCBCAB', '初産準備中'),
-- cattleId=15
(1, 11015, 21015, 'そら', 'GROWING', '2023-12-01', '雌', 350, 72, '黒毛和種', 'HEALTHY', '生産者A', '牛舎A', 'ABCCBA', '順調に成長中');

-- =============================
-- 3) bloodline テーブル
-- =============================
INSERT INTO bloodline (
  cattleId,
  fatherCattleName,
  motherFatherCattleName,
  motherGrandFatherCattleName,
  motherGreatGrandFatherCattleName
)
VALUES
  (1,  '茂忠',   '幸茂',   '茂晴花',   '福忠'),
  (2,  '安福久', '藤忠',   '勝忠平',   '茂晴花'),
  (3,  '茂福',   '福忠',   '安茂勝',   '藤茂'),
  (4,  '茂晴花', '福茂',   '忠富士',   '安茂勝'),
  (5,  '美国桜', '福之国', '平茂勝',   '安福久'),
  (6,  '安福久', '忠富士', '福忠',     '茂晴花'),
  (7,  '勝忠平', '美国桜', '福之国',   '平茂勝'),
  (8,  '芳之国', '忠富士', '安福久',   '平茂勝'),
  (9,  '勝平正', '茂金波', '安茂勝',   '福之国'),
  (10, '百合茂', '安福久', '勝忠平',   '福之国'),
  (11, '美津照重','北国7の8','忠富士','菊安'),
  (12, '幸紀雄', '芳之国', '隆之国',   '安平'),
  (13, '久茂福', '美津照', '福之国',   '北国7の8'),
  (14, '安平',   '平茂勝', '百合茂',   '忠富士'),
  (15, '菊安',   '勝忠平', '安福久',   '茂晴花');

-- =============================
-- 4) mother_info テーブル（母は既存の雌個体を参照）
-- =============================
INSERT INTO mother_info (
  cattleId,
  motherCattleId,
  motherName,
  motherIdentificationNumber,
  motherScore
)
VALUES
  (1,  2,  'ハナコ', '11002', 88),
  (2,  4,  'マルコ', '12002', 80),
  (3,  2,  'ハナコ', '11002', 88),
  (4,  2,  'ハナコ', '11002', 88),
  (5,  2,  'ハナコ', '11002', 88),
  (6,  2,  'ハナコ', '11002', 88),
  (7,  4,  'マルコ', '12002', 80),
  (8,  2,  'ハナコ', '11002', 88),
  (9,  5,  'さくら', '11005', 82),
  (10, 7,  'ゆき',   '12007', 86),
  (11, 2,  'ハナコ', '11002', 88),
  (12, 5,  'さくら', '11005', 82),
  (13, 4,  'マルコ', '12002', 80),
  (14, 2,  'ハナコ', '11002', 88),
  (15, 5,  'さくら', '11005', 82);

-- =============================
-- 5) breeding_status テーブル（繁殖関連の現在値）
-- =============================
INSERT INTO breeding_status (
  cattleId,
  parity,
  expectedCalvingDate,
  scheduledPregnancyCheckDate,
  daysAfterCalving,
  daysOpen,
  pregnancyDays,
  daysAfterInsemination,
  inseminationCount,
  breedingMemo,
  isDifficultBirth
)
VALUES
  (1,  2, NULL,            '2025-08-20', 105,  30, NULL,  5,  2, '順調に推移', 0),
  (2,  3, NULL,            NULL,         400, 180, NULL, 10,  2, '経産で安定', 0),
  (3,  NULL, NULL,         NULL,         NULL, NULL, NULL, NULL, NULL, '肥育のため対象外', 0),
  (4,  0, NULL,            NULL,         0,    0,   0,    0,   0,  '育成中', 0),
  (5,  1, '2025-08-14',    NULL,         0,    0,   0,    0,   1,  '本日分娩予定/分娩', 0),
  (6,  2, '2026-04-10',    '2025-07-25', 152, 112, 30,   40,  1,  '7月に受胎推定', 0),
  (7,  2, NULL,            NULL,         90,   50,  NULL,  2,   1,  '健康管理中', 0),
  (8,  0, NULL,            NULL,         0,    0,   0,    0,   0,  '育成中', 0),
  (9,  0, NULL,            NULL,         0,    0,   0,    0,   0,  '子牛', 0),
  (10, 3, '2025-10-10',    '2025-02-01', 300, 150, 120, 100,  2,  '妊娠経過良好', 0),
  (11, NULL, NULL,         NULL,         NULL, NULL, NULL, NULL, NULL, '肥育', 0),
  (12, 0, NULL,            NULL,         0,    0,   0,    0,   0, '子牛', 0),
  (13, 0, NULL,            NULL,         0,    0,   0,    0,   0, '育成', 0),
  (14, 1, '2025-12-01',    '2025-03-10', 70,   40,  NULL, 10,  1, '初産準備', 0),
  (15, 0, NULL,            NULL,         0,    0,   0,    0,   0, '育成', 0);

-- =============================
-- 6) breeding_summary テーブル（累計統計）
-- =============================
INSERT INTO breeding_summary (
  cattleId,
  totalInseminationCount,
  averageDaysOpen,
  averagePregnancyPeriod,
  averageCalvingInterval,
  difficultBirthCount,
  pregnancyHeadCount,
  pregnancySuccessRate
)
VALUES
  (1,  2, 25, 280, 360, 0, 1,  90),
  (2,  3, 30, 290, 370, 1, 1,  95),
  (3,  0,  0,   0,   0, 0, 0,   0),
  (4,  0,  0,   0,   0, 0, 0,   0),
  (5,  1, 30, 280, 360, 0, 1, 100),
  (6,  1, 35, 280, 365, 0, 1, 100),
  (7,  1, 40, 281, 365, 0, 1, 100),
  (8,  0,  0,   0,   0, 0, 0,   0),
  (9,  0,  0,   0,   0, 0, 0,   0),
  (10, 3, 32, 282, 360, 0, 2,  67),
  (11, 0,  0,   0,   0, 0, 0,   0),
  (12, 0,  0,   0,   0, 0, 0,   0),
  (13, 0,  0,   0,   0, 0, 0,   0),
  (14, 1, 28, 281, 365, 0, 1, 100),
  (15, 0,  0,   0,   0, 0, 0,   0);

-- =============================
-- 7) events テーブル（基本イベント）
-- =============================
INSERT INTO events (
  cattleId,
  eventType,
  eventDatetime,
  notes
)
VALUES
  -- cattleId=1
  (1, 'ESTRUS',        '2024-12-01', '発情メモ'),
  (1, 'INSEMINATION',  '2024-12-02', '人工授精メモ'),
  -- cattleId=2
  (2, 'CALVING',       '2024-12-03', '分娩メモ'),
  (2, 'VACCINATION',   '2024-12-04', 'ワクチン接種'),
  -- cattleId=3
  (3, 'SHIPMENT',      '2024-12-05', '出荷予定メモ'),
  (3, 'HOOF_TRIMMING', '2024-12-06', '削蹄'),
  -- cattleId=4
  (4, 'ESTRUS',        '2024-12-07', '発情メモ'),
  (4, 'OTHER',         '2024-12-08', 'その他');

-- =============================
-- 7-2) KPI表示用 追加イベント（年間・当日・トレンド）
-- =============================
-- 年間ウィンドウ内の受胎リンク用データ（採用AI 260-300日前）
INSERT INTO events (cattleId, eventType, eventDatetime, notes) VALUES
  -- cattleId=1: 前回分娩→採用AI→年末分娩、期間内AIも追加
  (1, 'CALVING',      '2024-03-01', 'KPI: 前回分娩'),
  (1, 'INSEMINATION', '2024-03-10', 'KPI: 採用AI候補'),
  (1, 'INSEMINATION', '2024-11-15', 'KPI: 期間内AI'),
  (1, 'CALVING',      '2024-12-01', 'KPI: 受胎分娩'),
  -- cattleId=2: 分娩間隔算出用の前回分娩
  (2, 'CALVING',      '2024-06-01', 'KPI: 前回分娩');

-- 当日(2025-08-14)のKPI算出が成立するためのデータ
INSERT INTO events (cattleId, eventType, eventDatetime, notes) VALUES
  -- cattleId=1: 今日のAI（分母）と将来分娩（daysOpen用）
  (1, 'CALVING',      '2025-05-01T00:00:00Z', 'KPI: 今日のdaysOpen計算用 前回分娩'),
  (1, 'INSEMINATION', '2025-08-14T09:00:00Z', 'KPI: 今日のAI（分母・daysOpen採用AI）'),
  (1, 'CALVING',      '2026-05-21T00:00:00Z', 'KPI: 採用AIから約280日後の分娩'),
  -- cattleId=5: 今日の分娩（分子）とその採用AI（260-300日差）、直前分娩はAIより前
  (5, 'CALVING',      '2024-10-01T00:00:00Z', 'KPI: 直前分娩'),
  (5, 'INSEMINATION', '2024-11-20T00:00:00Z', 'KPI: 採用AI（分娩まで約267日）'),
  (5, 'CALVING',      '2025-08-14T06:00:00Z', 'KPI: 今日の分娩（受胎）');

-- 直近2ヶ月（2025-07, 2025-08）でトレンドが算出されるためのデータ
INSERT INTO events (cattleId, eventType, eventDatetime, notes) VALUES
  -- cattleId=2: 2025-07 分娩（分娩間隔・受胎率用）。前回分娩は上で 2024-06-01 を投入済み
  (2, 'INSEMINATION', '2024-10-05T00:00:00Z', 'KPI: 2025-07分娩に対応する採用AI'),
  (2, 'CALVING',      '2025-07-12T03:00:00Z', 'KPI: 2025-07の分娩'),
  -- cattleId=6: 7月の受胎AI（daysOpen算出用）。前回分娩→受胎AI→将来分娩
  (6, 'CALVING',      '2025-03-15T00:00:00Z', 'KPI: cattle6 前回分娩'),
  (6, 'INSEMINATION', '2025-07-05T08:00:00Z', 'KPI: 受胎AI（2026-04分娩へ）'),
  (6, 'CALVING',      '2026-04-10T00:00:00Z', 'KPI: cattle6 将来分娩'),
  -- 受胎率の分母が0にならないよう、7月のAIをもう1本（cattleId=7）
  (7, 'INSEMINATION', '2025-07-02T00:00:00Z', 'KPI: 7月のAI（分母用）');

-- =============================
-- 8) alerts テーブル（アラート用ダミーデータ）
-- =============================
-- 既存のアラートをクリア
DELETE FROM alerts;
DELETE FROM alert_history;

-- アラートのダミーデータ（様々な状況のアラートを作成）
INSERT INTO alerts (
  id,
  type,
  severity,
  status,
  cattle_id,
  cattle_name,
  cattle_ear_tag_number,
  due_at,
  message,
  memo,
  owner_user_id,
  created_at,
  updated_at,
  acknowledged_at,
  resolved_at
) VALUES
  -- 1. 空胎60日以上（AI未実施）のアラート
  ('alert_dummy_001', 'OPEN_DAYS_OVER60_NO_AI', 'high', 'active', 2, 'ハナコ', '21002', '2024-12-03', '空胎60日以上（AI未実施）', '繁殖指導員に相談が必要', 1, strftime('%s', 'now', '-7 days'), strftime('%s', 'now', '-7 days'), NULL, NULL),
  
  -- 2. 60日以内分娩予定のアラート
  ('alert_dummy_002', 'CALVING_WITHIN_60', 'medium', 'active', 5, 'さくら', '21005', '2025-08-14', '60日以内分娩予定', '分娩準備を開始してください', 1, strftime('%s', 'now', '-5 days'), strftime('%s', 'now', '-5 days'), NULL, NULL),
  ('alert_dummy_003', 'CALVING_WITHIN_60', 'medium', 'active', 6, 'みずき', '21006', '2026-04-10', '60日以内分娩予定', '妊娠経過良好、定期検診を継続', 1, strftime('%s', 'now', '-3 days'), strftime('%s', 'now', '-3 days'), NULL, NULL),
  
  -- 3. 分娩予定日超過のアラート
  ('alert_dummy_004', 'CALVING_OVERDUE', 'high', 'active', 10, 'りん', '22010', '2025-10-10', '分娩予定日超過', '緊急対応が必要、獣医師に連絡', 2, strftime('%s', 'now', '-10 days'), strftime('%s', 'now', '-10 days'), NULL, NULL),
  
  -- 4. 発情から20日以上未妊娠のアラート
  ('alert_dummy_005', 'ESTRUS_OVER20_NOT_PREGNANT', 'medium', 'active', 7, 'ゆき', '22007', '2024-12-07', '発情から20日以上未妊娠', '再発情の確認が必要', 2, strftime('%s', 'now', '-15 days'), strftime('%s', 'now', '-15 days'), NULL, NULL),
  
  -- 5. 既に解決済みのアラート（履歴確認用）
  ('alert_dummy_006', 'OPEN_DAYS_OVER60_NO_AI', 'high', 'resolved', 1, 'あやめ', '21001', '2024-12-01', '空胎60日以上（AI未実施）', '人工授精を実施、解決済み', 1, strftime('%s', 'now', '-20 days'), strftime('%s', 'now', '-20 days'), strftime('%s', 'now', '-18 days'), strftime('%s', 'now', '-18 days')),
  
  -- 6. 承認済みのアラート（対応中）
  ('alert_dummy_007', 'CALVING_WITHIN_60', 'medium', 'acknowledged', 14, 'あおい', '21014', '2025-12-01', '60日以内分娩予定', '分娩準備を開始済み、順調に推移', 1, strftime('%s', 'now', '-12 days'), strftime('%s', 'now', '-12 days'), strftime('%s', 'now', '-10 days'), NULL);

-- =============================
-- 9) alert_history テーブル（アラート履歴用ダミーデータ）
-- =============================
INSERT INTO alert_history (
  id,
  alert_id,
  action,
  previous_status,
  new_status,
  changed_by,
  reason,
  created_at
) VALUES
  -- アラート作成履歴
  ('history_dummy_001', 'alert_dummy_001', 'created', NULL, 'active', 1, '自動生成', strftime('%s', 'now', '-7 days')),
  ('history_dummy_002', 'alert_dummy_002', 'created', NULL, 'active', 1, '自動生成', strftime('%s', 'now', '-5 days')),
  ('history_dummy_003', 'alert_dummy_003', 'created', NULL, 'active', 1, '自動生成', strftime('%s', 'now', '-3 days')),
  ('history_dummy_004', 'alert_dummy_004', 'created', NULL, 'active', 2, '自動生成', strftime('%s', 'now', '-10 days')),
  ('history_dummy_005', 'alert_dummy_005', 'created', NULL, 'active', 2, '自動生成', strftime('%s', 'now', '-15 days')),
  
  -- アラート解決履歴
  ('history_dummy_006', 'alert_dummy_006', 'resolved', 'active', 'resolved', 1, '人工授精を実施、受胎確認済み', strftime('%s', 'now', '-18 days')),
  
  -- アラート承認履歴
  ('history_dummy_007', 'alert_dummy_007', 'acknowledged', 'active', 'acknowledged', 1, '分娩準備を開始、対応中', strftime('%s', 'now', '-10 days')),
  
  -- アラート更新履歴
  ('history_dummy_008', 'alert_dummy_001', 'updated', 'active', 'active', 1, 'メモを追加：繁殖指導員に相談予定', strftime('%s', 'now', '-2 days')),
  ('history_dummy_009', 'alert_dummy_004', 'updated', 'active', 'active', 2, '獣医師に連絡済み、経過観察中', strftime('%s', 'now', '-1 days'));


