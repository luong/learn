-- SQLite: tạo bảng trên cơ sở dữ liệu trống trước spotify-data.sql.
PRAGMA foreign_keys = ON;
CREATE TABLE ca_si (id INTEGER PRIMARY KEY, ten_ca_si VARCHAR(100) NOT NULL);
CREATE TABLE bai_hat (id INTEGER PRIMARY KEY, ten_bai_hat VARCHAR(200) NOT NULL, thoi_luong INTEGER NOT NULL CHECK(thoi_luong > 0), ngay_phat_hanh DATE NOT NULL, ca_si_id INTEGER NOT NULL REFERENCES ca_si(id), the_loai VARCHAR(100) NOT NULL);
CREATE TABLE nguoi_dung (id INTEGER PRIMARY KEY, ten_nguoi_dung VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL UNIQUE, ngay_dang_ky DATETIME NOT NULL);
CREATE TABLE playlist (id INTEGER PRIMARY KEY, ten_playlist VARCHAR(200) NOT NULL, nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung(id));
CREATE TABLE playlist_bai_hat (playlist_id INTEGER NOT NULL REFERENCES playlist(id), bai_hat_id INTEGER NOT NULL REFERENCES bai_hat(id), thu_tu INTEGER NOT NULL DEFAULT 1 CHECK(thu_tu > 0), PRIMARY KEY(playlist_id, bai_hat_id), UNIQUE(playlist_id, thu_tu));
CREATE TABLE yeu_thich (id INTEGER PRIMARY KEY, nguoi_dung_id INTEGER NOT NULL REFERENCES nguoi_dung(id), bai_hat_id INTEGER NOT NULL REFERENCES bai_hat(id), ngay_yeu_thich DATETIME NOT NULL, UNIQUE(nguoi_dung_id, bai_hat_id));
