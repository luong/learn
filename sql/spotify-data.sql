-- Dữ liệu giả lập cho SQLite; chạy sau spotify-schema.sql.
PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;
INSERT INTO ca_si VALUES
(1, 'Minh Anh'),
(2, 'The Waves'),
(3, 'Luna'),
(4, 'Hoàng Nam');

INSERT INTO bai_hat VALUES
(1, 'Bình minh', 210, '2025-01-10', 1, 'Pop'),
(2, 'Nắng sân trường', 240, '2025-01-10', 1, 'Acoustic'),
(3, 'Blue Sea', 195, '2024-06-15', 2, 'Rock'),
(4, 'Ocean Road', 270, '2024-06-15', 2, 'Rock'),
(5, 'Moonlight', 225, '2026-03-01', 3, 'Pop'),
(6, 'Starry Night', 180, '2026-03-01', 3, 'Pop'),
(7, 'Chiều thu', 300, '2026-09-20', 1, 'Acoustic'),
(8, 'Silent Sky', 200, '2026-10-01', 2, 'Acoustic');

INSERT INTO nguoi_dung VALUES
(1, 'Nguyễn An', 'an@example.com', '2026-09-01 08:00:00'),
(2, 'Trần Bình', 'binh@example.com', '2026-10-02 09:00:00'),
(3, 'Lê Chi', 'chi@example.com', '2026-10-15 10:00:00'),
(4, 'Phạm Dũng', 'dung@example.com', '2026-11-01 11:00:00');

INSERT INTO playlist VALUES
(1, 'Buổi sáng', 1),
(2, 'Tập trung', 1),
(3, 'Chuyến đi', 2),
(4, 'Thư giãn', 3),
(5, 'Khám phá', 4);

INSERT INTO playlist_bai_hat VALUES
(1, 1, 1),
(1, 5, 2),
(1, 6, 3),
(2, 2, 1),
(2, 7, 2),
(3, 3, 1),
(3, 4, 2),
(3, 1, 3),
(4, 5, 1),
(4, 7, 2);

INSERT INTO yeu_thich VALUES
(1, 1, 1, '2026-10-01 08:00:00'),
(2, 1, 5, '2026-10-02 09:00:00'),
(3, 2, 1, '2026-10-03 10:00:00'),
(4, 2, 3, '2026-10-03 11:00:00'),
(5, 3, 5, '2026-10-16 08:00:00'),
(6, 3, 7, '2026-11-01 09:00:00');

COMMIT;
