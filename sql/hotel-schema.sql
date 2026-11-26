-- SQLite. Chạy trên cơ sở dữ liệu trống trước hotel-data.sql.
PRAGMA foreign_keys = ON;
CREATE TABLE loai_phong (
    id VARCHAR(10) PRIMARY KEY NOT NULL,
    ten_phong VARCHAR(100) NOT NULL,
    gia_phong INTEGER NOT NULL CHECK (typeof(gia_phong) = 'integer' AND gia_phong >= 0)
);
CREATE TABLE phong (
    id VARCHAR(10) PRIMARY KEY NOT NULL,
    loai_phong_id VARCHAR(10) NOT NULL REFERENCES loai_phong(id),
    tang INTEGER NOT NULL CHECK (typeof(tang) = 'integer'),
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'Trống'
        CHECK (trang_thai IN ('Trống', 'Đang thuê', 'Đang bảo trì'))
);
CREATE TABLE khach_hang (
    cccd VARCHAR(12) PRIMARY KEY NOT NULL CHECK (length(cccd) = 12 AND cccd NOT GLOB '*[^0-9]*'),
    ho_ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL UNIQUE
);
CREATE TABLE thue_phong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phong_id VARCHAR(10) NOT NULL REFERENCES phong(id),
    cccd VARCHAR(12) NOT NULL REFERENCES khach_hang(cccd),
    ngay_nhan DATE NOT NULL CHECK (date(ngay_nhan, '+0 days') IS NOT NULL AND ngay_nhan = date(ngay_nhan, '+0 days')),
    ngay_tra DATE NOT NULL CHECK (date(ngay_tra, '+0 days') IS NOT NULL AND ngay_tra = date(ngay_tra, '+0 days') AND ngay_tra > ngay_nhan),
    gia_phong INTEGER NOT NULL CHECK (typeof(gia_phong) = 'integer' AND gia_phong >= 0),
    tong_tien INTEGER NOT NULL CHECK (typeof(tong_tien) = 'integer' AND tong_tien = CAST(julianday(ngay_tra) - julianday(ngay_nhan) AS INTEGER) * gia_phong)
);
CREATE INDEX idx_thue_phong_lich ON thue_phong(phong_id, ngay_nhan, ngay_tra);
CREATE TRIGGER khong_trung_lich_insert
BEFORE INSERT ON thue_phong
WHEN EXISTS (
    SELECT 1 FROM thue_phong t
    WHERE t.phong_id = NEW.phong_id
      AND NEW.ngay_nhan < t.ngay_tra AND NEW.ngay_tra > t.ngay_nhan
)
BEGIN
    SELECT RAISE(ABORT, 'Phong da co khach trong khoang thoi gian nay');
END;
CREATE TRIGGER khong_trung_lich_update
BEFORE UPDATE ON thue_phong
WHEN EXISTS (
    SELECT 1 FROM thue_phong t
    WHERE t.phong_id = NEW.phong_id AND t.id <> OLD.id
      AND NEW.ngay_nhan < t.ngay_tra AND NEW.ngay_tra > t.ngay_nhan
)
BEGIN
    SELECT RAISE(ABORT, 'Phong da co khach trong khoang thoi gian nay');
END;
