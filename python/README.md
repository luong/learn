# Python Editor — Monaco + Pyodide

Trong thư mục gốc dự án, chạy:

```sh
python3 -m http.server 8000
```

Mở http://localhost:8000/python/ trên trình duyệt. Khi đưa lên GitHub Pages, trang nằm tại `/learn/python/`.

- Monaco Editor: tô màu cú pháp Python, số dòng, tự thụt lề, đóng ngoặc, tìm/thay thế và gợi ý từ trong tệp. Chưa tích hợp Python language server để phân tích kiểu hoặc gợi ý thư viện.
- Chạy bằng nút **Run** hoặc **Ctrl/⌘ + Enter**.
- Khi `input()` được gọi, gõ dữ liệu ngay sau prompt trong console rồi nhấn Enter. Có thể nhập nhiều lần; Ctrl+D gửi EOF, Ctrl+C dừng chương trình.
- Console sử dụng SharedArrayBuffer; service worker tự bật COOP/COEP. Khi mở lần đầu hoặc hard reload (Ctrl/⌘ + Shift + R), app tự điều hướng lại qua service worker để khôi phục console; tham số khởi tạo tạm được xóa khỏi URL khi thành công. Có giới hạn lần thử để tránh lặp vô hạn và không phụ thuộc sessionStorage. Phải mở bằng localhost hoặc HTTPS (hỗ trợ GitHub Pages).
- Nút **Stop** ngắt chương trình, kể cả vòng lặp vô hạn.
- Mở tệp `.py`, tải mã thành `main.py`, tự lưu mã trong trình duyệt.
- Mỗi lần chạy có không gian biến mới. Python được tải từ CDN Pyodide nên cần kết nối mạng; không cần cài Python để thực thi mã trên trang.
- Đây là Python trong trình duyệt; các tính năng phụ thuộc hệ điều hành như mở cửa sổ Tkinter hoặc chạy subprocess không được hỗ trợ.

Runtime: [Pyodide](https://pyodide.org/en/0.27.4/usage/index.html), chạy trong Web Worker.

Monaco dùng bản CDN cố định 0.52.2 (AMD) để giữ trang HTML tĩnh không cần build. Nếu CDN Monaco không tải được, trình soạn thảo văn bản thường vẫn hoạt động. Cần mạng để tải Monaco và Pyodide.

## Input / Output modes

- **Console** (mặc định): nhập trực tiếp sau prompt trong khi chương trình chạy.
- **Predefined input**: tạo nhiều test case, mỗi case có Input và Expected output nhập trước. Chương trình đọc bằng `input()` hoặc `sys.stdin`; kết quả `print()` (kể cả prompt) được so sánh để báo Pass/Fail. Hết dữ liệu sẽ gặp EOF.
- **File**: cùng bố cục test cases. Mỗi Input được ghi vào `input.txt` trong hệ thống tệp ảo. Code phải đọc `input.txt` và ghi `output.txt`; nội dung `output.txt` được so sánh với Expected output. Không tạo `output.txt` sẽ báo Error; không dùng kết quả cũ. Console output và lỗi hiện trong phần chi tiết của case.

Ví dụ cho chế độ File:

```python
with open("input.txt") as f:
    numbers = list(map(int, f.read().split()))

with open("output.txt", "w") as f:
    print(sum(numbers), file=f)
```

## Test cases

- **Add test case** thêm cặp Input / Expected output; **Remove** xóa case (giữ ít nhất một case).
- **Run** chạy lần lượt tất cả case của chế độ đang chọn với cùng một bản chụp mã nguồn, mỗi lần có không gian biến mới. Case lỗi vẫn cho phép case tiếp theo chạy.
- Kết quả từng case: **Pass**, **Fail**, **Error**; mở **Actual output** để xem kết quả và lỗi. **Stop** ngắt cả đợt chạy và để các case chưa chạy ở trạng thái **Not run**.
- So sánh chuẩn hóa CRLF thành LF và bỏ qua một dấu xuống dòng cuối. Các dấu cách và dòng trống còn lại được giữ nguyên. Giới hạn hiển thị không được tính là Pass nếu dữ liệu bị cắt.
- Test cases tự lưu trong localStorage, riêng cho Predefined input và File. **Clear** chỉ xóa kết quả, giữ Input / Expected output.
