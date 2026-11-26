-- SQLite. Chạy trên cơ sở dữ liệu trống trước highland-data.sql.
PRAGMA foreign_keys = ON;

CREATE TABLE nhan_vien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten VARCHAR(100) NOT NULL
);

CREATE TABLE khach_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL UNIQUE
);

CREATE TABLE san_pham (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_san_pham VARCHAR(100) NOT NULL,
    loai VARCHAR(20) NOT NULL,
    don_gia REAL NOT NULL CHECK (don_gia >= 0)
);

CREATE TABLE hoa_don (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    khach_hang_id INTEGER NOT NULL REFERENCES khach_hang(id),
    nhan_vien_id INTEGER NOT NULL REFERENCES nhan_vien(id),
    giam_gia REAL NOT NULL DEFAULT 0 CHECK (giam_gia >= 0),
    thanh_toan REAL NOT NULL CHECK (thanh_toan >= 0),
    ngay_lap DATETIME NOT NULL
);

CREATE TABLE chi_tiet_hoa_don (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hoa_don_id INTEGER NOT NULL REFERENCES hoa_don(id),
    san_pham_id INTEGER NOT NULL REFERENCES san_pham(id),
    so_luong INTEGER NOT NULL DEFAULT 1
        CHECK (typeof(so_luong) = 'integer' AND so_luong > 0),
    don_gia REAL NOT NULL CHECK (don_gia >= 0),
    UNIQUE (hoa_don_id, san_pham_id)
);
-- Khi hoàn tất hóa đơn, ứng dụng kiểm tra có chi tiết,
-- giảm giá không quá tiền hàng và thanh toán = tiền hàng - giảm giá.
