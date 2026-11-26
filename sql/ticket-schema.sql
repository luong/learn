-- SQLite: tạo bảng trên cơ sở dữ liệu trống trước ticket-data.sql.
PRAGMA foreign_keys = ON;
CREATE TABLE san_bay (
 id VARCHAR(3) PRIMARY KEY NOT NULL,
 ten VARCHAR(100) NOT NULL
);
CREATE TABLE chuyen_bay (
 id VARCHAR(10) PRIMARY KEY NOT NULL,
 ngay_bay DATE NOT NULL CHECK(date(ngay_bay,'+0 days') IS NOT NULL AND ngay_bay=date(ngay_bay,'+0 days')),
 san_bay_di VARCHAR(3) NOT NULL REFERENCES san_bay(id),
 san_bay_den VARCHAR(3) NOT NULL REFERENCES san_bay(id),
 gio_khoi_hanh TIME NOT NULL CHECK(time(gio_khoi_hanh) IS NOT NULL AND gio_khoi_hanh=time(gio_khoi_hanh)),
 gio_den TIME NOT NULL CHECK(time(gio_den) IS NOT NULL AND gio_den=time(gio_den) AND gio_den<>gio_khoi_hanh),
 gia_ve INTEGER NOT NULL CHECK(typeof(gia_ve)='integer' AND gia_ve>=0),
 so_ve_toi_da INTEGER NOT NULL CHECK(typeof(so_ve_toi_da)='integer' AND so_ve_toi_da>0),
 CHECK(san_bay_di<>san_bay_den)
);
CREATE TABLE khach_hang (
 id INTEGER PRIMARY KEY,
 ho_ten VARCHAR(100) NOT NULL,
 so_dien_thoai VARCHAR(15) NOT NULL UNIQUE,
 email VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE dat_ve (
 id INTEGER PRIMARY KEY,
 khach_hang_id INTEGER NOT NULL REFERENCES khach_hang(id),
 chuyen_bay_id VARCHAR(10) NOT NULL REFERENCES chuyen_bay(id),
 ngay_dat DATE NOT NULL CHECK(date(ngay_dat,'+0 days') IS NOT NULL AND ngay_dat=date(ngay_dat,'+0 days')),
 so_luong INTEGER NOT NULL CHECK(typeof(so_luong)='integer' AND so_luong>0),
 tong_tien INTEGER NOT NULL CHECK(typeof(tong_tien)='integer' AND tong_tien>=0)
);
