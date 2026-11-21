# Python Editor — Monaco + Pyodide

Trong thư mục gốc dự án, chạy:

```sh
python3 -m http.server 8000
```

Mở http://localhost:8000/python/ trên trình duyệt. Khi đưa lên GitHub Pages, trang nằm tại `/learn/python/`.

- Monaco Editor: tô màu cú pháp Python, số dòng, tự thụt lề, đóng ngoặc, tìm/thay thế và gợi ý từ trong tệp. Chưa tích hợp Python language server để phân tích kiểu hoặc gợi ý thư viện.
- Chạy bằng nút **Run** hoặc **Ctrl/⌘ + Enter**.
- Khi `input()` được gọi, gõ dữ liệu ngay sau prompt trong console rồi nhấn Enter. Có thể nhập nhiều lần; Ctrl+D gửi EOF, Ctrl+C dừng chương trình.
- Console sử dụng SharedArrayBuffer; service worker tự bật COOP/COEP và tải lại trang một lần. Phải mở bằng localhost hoặc HTTPS (hỗ trợ GitHub Pages).
- Nút **Stop** ngắt chương trình, kể cả vòng lặp vô hạn.
- Mở tệp `.py`, tải mã thành `main.py`, tự lưu mã trong trình duyệt.
- Mỗi lần chạy có không gian biến mới. Python được tải từ CDN Pyodide nên cần kết nối mạng; không cần cài Python để thực thi mã trên trang.
- Đây là Python trong trình duyệt; các tính năng phụ thuộc hệ điều hành như mở cửa sổ Tkinter hoặc chạy subprocess không được hỗ trợ.

Runtime: [Pyodide](https://pyodide.org/en/0.27.4/usage/index.html), chạy trong Web Worker.

Monaco dùng bản CDN cố định 0.52.2 (AMD) để giữ trang HTML tĩnh không cần build. Nếu CDN Monaco không tải được, trình soạn thảo văn bản thường vẫn hoạt động. Cần mạng để tải Monaco và Pyodide.

## Input / Output modes

- **Console** (mặc định): nhập trực tiếp sau prompt trong khi chương trình chạy.
- **Predefined input**: nhập dữ liệu trước vào ô Input; chương trình đọc bằng `input()` hoặc `sys.stdin`, kết quả `print()` hiện trong Output. Hết dữ liệu sẽ gặp EOF.
- **File**: nội dung ô Input được tạo thành `input.txt` trong hệ thống tệp ảo. Chương trình phải tự đọc `input.txt` và ghi `output.txt`; nội dung `output.txt` hiện trong ô output tương ứng. `print()` thông thường và lỗi vẫn hiện riêng trong Console output. Mỗi lần chạy sẽ xóa `output.txt` cũ.

Ví dụ cho chế độ File:

```python
with open("input.txt") as f:
    numbers = list(map(int, f.read().split()))

with open("output.txt", "w") as f:
    print(sum(numbers), file=f)
```
