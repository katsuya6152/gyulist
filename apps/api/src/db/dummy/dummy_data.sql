-- =============================
-- 0) テーブルデータのリセット
-- =============================
-- 各テーブルのデータ削除
DELETE FROM users;

-- 自動増分IDのリセット (sqlite_sequence)
DELETE FROM sqlite_sequence WHERE name = 'users';

-- =============================
-- 以下、ダミーデータ挿入スクリプト
-- =============================

INSERT INTO users (email, passwordHash)
VALUES
  ('test@test.co.jp', '$2a$10$3L5VA0dU9n13/ZHOO.ak.uXmJI1YkyvfLV45OwnJl99DJCznEvdsa', 0, null),
  ('bob@example.com',   '$2a$10$uvwxyz0123456789ABCDE', 0, null), 
  ('charlie@example.com', '$2a$10$ABCD1234EFGH5678IJKL', 0, null),
  ('david@example.com', '$2a$10$MNOPQRSTUVWX01234567', 0, null);
