-- =============================
-- 0) テーブルデータのリセット
-- =============================
-- 参照整合性の都合で依存順に削除
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
-- sessions はTEXT主キー、registrations/email_logs はTEXT主キーのためリセット不要
DELETE FROM sqlite_sequence WHERE name = 'users';

-- =============================
-- 以下、ダミーデータ挿入スクリプト
-- =============================

INSERT INTO users (userName, email, passwordHash, is_verified, verification_token)
VALUES
  ('Test User', 'test@test.co.jp', '$2a$10$3L5VA0dU9n13/ZHOO.ak.uXmJI1YkyvfLV45OwnJl99DJCznEvdsa', 0, NULL),
  ('Bob', 'bob@example.com', '$2a$10$uvwxyz0123456789ABCDE', 0, NULL), 
  ('Charlie', 'charlie@example.com', '$2a$10$ABCD1234EFGH5678IJKL', 0, NULL),
  ('David', 'david@example.com', '$2a$10$MNOPQRSTUVWX01234567', 0, NULL);

-- =============================
-- 1) cattle テーブルのダミーデータ
-- =============================
INSERT INTO cattle (
  ownerUserId,
  identificationNumber,
  earTagNumber,
  name,
  growthStage,
  birthday,
  age,
  monthsOld,
  daysOld,
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
-- cattleId=1 (自動採番)
(1, 1001, 1234, 'たろう',   'CALF',   '2023-01-01', 1,   12,  30,  'オス', '110',   70, '黒毛和種', 'PREGNANT',      '生産者A', '牛舎A', 'AAAAAA', '健康状態良好'),
-- cattleId=2
(1, 1002, 5678, 'ハナコ', 'FIRST_CALVED',   '2020-06-10', 3,   36,  100, 'メス', '120', 85, '黒毛和種', 'HEALTHY',      '生産者A', '牛舎A', 'BABCBB', '非常におとなしい性格で、健康良好'),
-- cattleId=3
(2, 2001, 9012, 'じろう',   'FATTENING', '2022-07-20', 1,   14,  45,  'メス', '130',   78, '黒毛和種',   'TREATING', '生産者B', '牛舎B', 'BABCBB', '成長が早く、今後の期待大'),
-- cattleId=4
(2, 2002, 3456, 'マルコ', 'GROWING', '2021-05-15', 2,   24,  70,  'オス', '140', 90, '黒毛和種',   'RESTING',      '生産者B', '牛舎B', 'AAAAAA', '生産後の休息中。元気な状態を維持');

-- 追加: cattleId=5（KPIデモ用）
INSERT INTO cattle (
  ownerUserId, identificationNumber, earTagNumber, name, status
) VALUES
(1, 1005, 5555, 'けいぴー', 'HEALTHY');

-- 追加: cattleId=6（KPIトレンド用: 2025-07 の daysOpen/AI分母用）
INSERT INTO cattle (
  ownerUserId, identificationNumber, earTagNumber, name, status
) VALUES
(1, 1006, 6666, 'けいぴー2', 'HEALTHY');

-- 追加: cattleId=7（KPIトレンド用: 2025-07 の分娩間隔/受胎率の安定化用）
INSERT INTO cattle (
  ownerUserId, identificationNumber, earTagNumber, name, status
) VALUES
(1, 1007, 7777, 'けいぴー3', 'HEALTHY');


-- =============================
-- 2) bloodline テーブルのダミーデータ
-- =============================
INSERT INTO bloodline (
  cattleId,
  fatherCattleName,
  motherFatherCattleName,
  motherGrandFatherCattleName,
  motherGreatGrandFatherCattleName
)
VALUES
-- 例: cattleId=1 (Taro) の血統
(1, '茂忠', '幸茂', '茂晴花', '福忠'),
-- 例: cattleId=2 (Hanako) の血統
(2, '安福久', '藤忠', '勝忠平', '茂晴花'),
-- 例: cattleId=3 (Jiro) の血統
(3, '茂福', '福忠', '安茂勝', '藤茂'),
-- 例: cattleId=4 (Maruko) の血統
(4, '茂晴花', '福茂', '忠富士', '安茂勝');



-- =============================
-- 3) mother_info テーブルのダミーデータ
-- =============================
INSERT INTO mother_info (
  cattleId,
  motherCattleId,
  motherName,
  motherIdentificationNumber,
  motherScore
)
VALUES
-- 例: cattleId=1(Taro) の母情報 (母をHanako(cattleId=2)と想定)
(1, 2, 'ハナコ', '1002', 85),
-- 例: cattleId=2(Hanako) の母情報 (母をMaruko(cattleId=4)と想定)
(2, 4, 'マルコ', '2002', 90),
-- 例: cattleId=3(Jiro) の母情報 (仮に母がHanako=2)
(3, 2, 'ハナコ', '1002', 85),
-- 例: cattleId=4(Maruko) の母情報 (母をHanako=2, ただし実際は任意)
(4, 2, 'ハナコ', '1002', 85);

-- =============================
-- 4) breeding_status テーブルのダミーデータ
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
-- cattleId=1 (たろう)
(1, 1, '2023-12-01', '2023-10-15', 30, 20, 50, 10, 2, '初産で順調', 0),
-- cattleId=2 (ハナコ)
(2, 2, '2024-01-15', '2023-11-30', 25, 15, 40, 5, 1, '順調に成長中', 0),
-- cattleId=3 (じろう)
(3, 1, '2023-11-20', '2023-10-05', 10, 5, 70, 20, 1, '妊娠期間長め', 1),
-- cattleId=4 (マルコ)
(4, 1, NULL, NULL, 0, 0, 0, 0, 0, 'まだ繁殖サイクルに入っていない', 0);


-- =============================
-- 5) breeding_summary テーブルのダミーデータ
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
-- cattleId=1 (たろう)
(1, 2, 25, 280, 360, 0, 1, 90),
-- cattleId=2 (ハナコ)
(2, 3, 30, 290, 370, 1, 1, 95),
-- cattleId=3 (じろう)
(3, 1, 20, 270, 365, 0, 2, 80),
-- cattleId=4 (マルコ)
(4, 0,  0,  0,   0,   0, 0, 0);


-- =============================
-- 6) events テーブルのダミーデータ
-- =============================
INSERT INTO events (
  cattleId,
  eventType,
  eventDatetime,
  notes
)
VALUES
-- cattleId=1
(1, 'ESTRUS',        '2024-12-01', '発情に関するメモがここに記載される'),
(1, 'INSEMINATION',  '2024-12-02', '人工授精に関するメモがここに記載される'),

-- cattleId=2
(2, 'CALVING',       '2024-12-03', '分娩に関するメモがここに記載される'),
(2, 'VACCINATION',   '2024-12-04', 'ワクチン接種に関するメモがここに記載される'),

-- cattleId=3
(3, 'SHIPMENT',      '2024-12-05', '出荷に関するメモがここに記載される'),
(3, 'HOOF_TRIMMING', '2024-12-06', '削蹄に関するメモがここに記載される'),

-- cattleId=4
(4, 'ESTRUS',        '2024-12-07', '発情に関するメモがここに記載される'),
(4, 'OTHER',         '2024-12-08', 'その他に関するメモがここに記載される');

-- =============================
-- 6-2) KPI表示用 追加ダミーイベント
-- =============================
INSERT INTO events (
  cattleId,
  eventType,
  eventDatetime,
  notes
)
VALUES
-- cattleId=1: 前回分娩→採用AI（約266日）→年末分娩、期間内AIも追加
(1, 'CALVING',      '2024-03-01', 'KPIデモ: 前回分娩'),
(1, 'INSEMINATION', '2024-03-10', 'KPIデモ: 採用AI候補'),
(1, 'INSEMINATION', '2024-11-15', 'KPIデモ: 期間内AI'),
(1, 'CALVING',      '2024-12-01', 'KPIデモ: 受胎分娩'),
-- cattleId=2: 分娩間隔算出用の前回分娩
(2, 'CALVING',      '2024-06-01', 'KPIデモ: 前回分娩');

-- =============================
-- 6-3) 今日(2025-08-14)にKPIが出るようにする追加ダミー
-- =============================
INSERT INTO events (
  cattleId,
  eventType,
  eventDatetime,
  notes
) VALUES
-- cattleId=1: 今日のAI（分母用）と将来分娩（daysOpen用）
(1, 'CALVING',      '2025-05-01T00:00:00Z', 'KPIデモ: 今日のdaysOpen計算用の前回分娩'),
(1, 'INSEMINATION', '2025-08-14T09:00:00Z', 'KPIデモ: 今日のAI（分母・daysOpen採用AI）'),
(1, 'CALVING',      '2026-05-21T00:00:00Z', 'KPIデモ: 採用AIから約280日後の分娩'),
-- cattleId=5: 今日の分娩（分子・分娩間隔用）とその採用AI（260-300日差）、直前分娩はAIより前
(5, 'CALVING',      '2024-10-01T00:00:00Z', 'KPIデモ: 直前分娩'),
(5, 'INSEMINATION', '2024-11-20T00:00:00Z', 'KPIデモ: 採用AI（分娩まで約267日）'),
(5, 'CALVING',      '2025-08-14T06:00:00Z', 'KPIデモ: 今日の分娩（受胎）');

-- =============================
-- 6-4) KPIトレンド用: 直近2ヶ月（2025-07, 2025-08）を両方算出可能にする追加データ
-- =============================
-- 目的:
--  - 2025-07 にも各指標が極力算出されるようデータを補完
--  - 受胎率: 7月に分娩が1件以上、かつ7月のAI分母が0にならないようにAIも配置
--  - 平均空胎日数: 7月に「受胎AI」があるように前回分娩→7月AI→将来分娩の流れを作る
--  - 分娩間隔: 7月に分娩があり、同個体の前回分娩も存在する
--  - AI回数/受胎: 7月分娩に対して受胎AI1本のシンプルケース（=1回）

-- cattleId=2: 7月分娩（分娩間隔・受胎率用）。前回分娩は既存の 2024-06-01
INSERT INTO events (cattleId, eventType, eventDatetime, notes) VALUES
  -- 7月に向けた採用AI（約280日前）
  (2, 'INSEMINATION', '2024-10-05T00:00:00Z', 'KPIデモ: 2025-07分娩に対応する採用AI'),
  -- 2025-07 の分娩
  (2, 'CALVING',      '2025-07-12T03:00:00Z', 'KPIデモ: 2025-07の分娩');

-- cattleId=6: 7月の「受胎AI」（daysOpen算出用）。前回分娩→受胎AI(7月)→将来分娩
INSERT INTO events (cattleId, eventType, eventDatetime, notes) VALUES
  (6, 'CALVING',      '2025-03-15T00:00:00Z', 'KPIデモ: cattle6 前回分娩'),
  (6, 'INSEMINATION', '2025-07-05T08:00:00Z', 'KPIデモ: 受胎AI（2026-04分娩へ）'),
  (6, 'CALVING',      '2026-04-10T00:00:00Z', 'KPIデモ: cattle6 将来分娩');

-- 受胎率の分母が0にならないよう、7月のAIをもう1本（cattleId=7）
INSERT INTO events (cattleId, eventType, eventDatetime, notes) VALUES
  (7, 'INSEMINATION', '2025-07-02T00:00:00Z', 'KPIデモ: 7月のAI（分母用）');
