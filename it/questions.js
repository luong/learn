"use strict";
const IT_QUESTIONS = [
  {
    "id": "it10-001",
    "lesson": 1,
    "difficulty": 1,
    "prompt": "Dữ liệu nhiệt kế ghi 39°C khi đo thân nhiệt cho biết điều gì?",
    "options": [
      "Người được đo đang sốt",
      "Dung lượng bộ nhớ là 39 byte",
      "Nhiệt kế có 39 mức màu",
      "Máy tính đang xử lí 39 bit"
    ],
    "answer": 0,
    "explanation": "Thông tin là ý nghĩa của dữ liệu; trong ngữ cảnh đo thân nhiệt, 39°C cho biết người được đo đang sốt."
  },
  {
    "id": "it10-002",
    "lesson": 1,
    "difficulty": 1,
    "prompt": "Quá trình xử lí thông tin của máy tính diễn ra theo thứ tự nào?",
    "options": [
      "Đưa ra kết quả → tiếp nhận dữ liệu → xoá chương trình",
      "Lưu kết quả → xoá dữ liệu → nhập chương trình",
      "Xử lí → đưa ra kết quả → mới tiếp nhận dữ liệu",
      "Tiếp nhận dữ liệu → xử lí theo chương trình → đưa ra kết quả"
    ],
    "answer": 3,
    "explanation": "Máy tính tiếp nhận dữ liệu, xử lí theo chương trình rồi đưa ra kết quả; kết quả có thể được lưu hoặc dùng cho lần xử lí tiếp theo."
  },
  {
    "id": "it10-003",
    "lesson": 1,
    "difficulty": 2,
    "prompt": "Biết 1 MB = 1024 KB và 1 KB = 1024 byte, 2 MB bằng bao nhiêu byte?",
    "options": [
      "16 byte",
      "2.000 byte",
      "2.097.152 byte",
      "2.048 byte"
    ],
    "answer": 2,
    "explanation": "1 byte = 8 bit; 1 MB = 1024 KB và 1 KB = 1024 byte, nên 2 MB = 2 × 1024 × 1024 = 2.097.152 byte."
  },
  {
    "id": "it10-004",
    "lesson": 2,
    "difficulty": 1,
    "prompt": "Thiết bị nào phù hợp với khái niệm thiết bị thông minh?",
    "options": [
      "Bóng đèn sợi đốt không có bộ điều khiển",
      "Camera kết nối Internet tự ghi hình khi phát hiện chuyển động",
      "Thước kẻ nhựa",
      "Ghế gỗ"
    ],
    "answer": 1,
    "explanation": "Thiết bị thông minh có khả năng xử lí, hoạt động tự chủ ở mức độ nhất định và trao đổi dữ liệu; camera này đáp ứng các đặc điểm đó."
  },
  {
    "id": "it10-005",
    "lesson": 2,
    "difficulty": 1,
    "prompt": "Nhóm nào gồm các công nghệ chính của Cách mạng công nghiệp 4.0?",
    "options": [
      "AI, IoT, điện toán đám mây, dữ liệu lớn",
      "Động cơ hơi nước, guồng nước, khung cửi thủ công",
      "Giấy, bút, bàn tính gỗ",
      "Máy đánh chữ cơ, đĩa than, đèn dầu"
    ],
    "answer": 0,
    "explanation": "AI, IoT, Cloud Computing và Big Data là các công nghệ chính của Cách mạng công nghiệp 4.0; tin học hỗ trợ tự động hoá và nâng cao hiệu quả công việc."
  },
  {
    "id": "it10-006",
    "lesson": 3,
    "difficulty": 1,
    "prompt": "Dữ liệu trong máy tính được phân loại thành những nhóm nào?",
    "options": [
      "Chỉ văn bản và số",
      "Chỉ hình ảnh và âm thanh",
      "Chỉ dữ liệu đúng và dữ liệu sai",
      "Văn bản, số, lôgic, đa phương tiện (âm thanh, hình ảnh)"
    ],
    "answer": 3,
    "explanation": "Dữ liệu được phân thành văn bản, số, lôgic và đa phương tiện."
  },
  {
    "id": "it10-007",
    "lesson": 3,
    "difficulty": 2,
    "prompt": "Phát biểu nào đúng về ASCII và ASCII mở rộng?",
    "options": [
      "Cả hai luôn dùng 16 bit cho mỗi kí tự",
      "ASCII hỗ trợ đầy đủ mọi ngôn ngữ",
      "ASCII dùng 7 bit cho 128 kí tự; ASCII mở rộng dùng 8 bit cho tối đa 256 kí tự",
      "ASCII dùng 8 bit cho 128 kí tự; ASCII mở rộng dùng 7 bit cho 256 kí tự"
    ],
    "answer": 2,
    "explanation": "2^7 = 128; 2^8 = 256. Unicode mới là hệ thống gán mã cho kí tự của nhiều ngôn ngữ."
  },
  {
    "id": "it10-008",
    "lesson": 3,
    "difficulty": 2,
    "prompt": "UTF-8 dùng lần lượt bao nhiêu byte để mã hoá ba kí tự viết sẵn A, á, ệ?",
    "options": [
      "4, 4, 4 byte",
      "1, 2, 3 byte",
      "1, 1, 1 byte",
      "2, 2, 2 byte"
    ],
    "answer": 1,
    "explanation": "UTF-8 dùng 1–4 byte cho mỗi mã Unicode; A, á, ệ viết sẵn lần lượt dùng 1, 2 và 3 byte."
  },
  {
    "id": "it10-009",
    "lesson": 4,
    "difficulty": 2,
    "prompt": "Biểu diễn nhị phân của số thập phân 19 là gì?",
    "options": [
      "10011",
      "11001",
      "10101",
      "10010"
    ],
    "answer": 0,
    "explanation": "Chia liên tiếp 19 cho 2 rồi đọc số dư từ dưới lên được 10011."
  },
  {
    "id": "it10-010",
    "lesson": 4,
    "difficulty": 2,
    "prompt": "Số nhị phân 10110 có giá trị thập phân bằng bao nhiêu?",
    "options": [
      "20",
      "26",
      "18",
      "22"
    ],
    "answer": 3,
    "explanation": "10110 = 1×2^4 + 0×2^3 + 1×2^2 + 1×2^1 + 0×2^0 = 16 + 4 + 2 = 22."
  },
  {
    "id": "it10-011",
    "lesson": 4,
    "difficulty": 2,
    "prompt": "Trong hệ nhị phân, 101 + 11 bằng bao nhiêu?",
    "options": [
      "110",
      "1011",
      "1000",
      "111"
    ],
    "answer": 2,
    "explanation": "101 tương ứng 5, 11 tương ứng 3; 5 + 3 = 8, viết ở hệ nhị phân là 1000."
  },
  {
    "id": "it10-012",
    "lesson": 4,
    "difficulty": 3,
    "prompt": "Trong hệ nhị phân, 101 × 11 bằng bao nhiêu?",
    "options": [
      "10101",
      "1111",
      "1000",
      "1101"
    ],
    "answer": 1,
    "explanation": "Các tích riêng là 101 và 1010; cộng lại được 1111, tương ứng 5 × 3 = 15."
  },
  {
    "id": "it10-013",
    "lesson": 4,
    "difficulty": 3,
    "prompt": "Với 8 bit, bộ mã nào của −19 đúng theo thứ tự: mã thuận, mã bù 1, mã bù 2?",
    "options": [
      "10010011; 11101100; 11101101",
      "100010011; 11101100; 11101101",
      "10010011; 00010011; 11101100",
      "00010011; 11101101; 11101100"
    ],
    "answer": 0,
    "explanation": "+19 là 00010011. Mã thuận thay bit dấu bằng 1; mã bù 1 đảo các bit; mã bù 2 lấy mã bù 1 cộng 1. Cả ba mã vẫn có 8 bit."
  },
  {
    "id": "it10-014",
    "lesson": 5,
    "difficulty": 1,
    "prompt": "Giá trị lôgic đúng và sai được biểu diễn tương ứng thế nào?",
    "options": [
      "0 và 1",
      "2 và 1",
      "−1 và 2",
      "1 và 0"
    ],
    "answer": 3,
    "explanation": "Giá trị lôgic đúng được biểu diễn bằng 1, sai bằng 0."
  },
  {
    "id": "it10-015",
    "lesson": 5,
    "difficulty": 2,
    "prompt": "Với p = 1, q = 0, kết quả (p AND q, p OR q, p XOR q, NOT p) là gì?",
    "options": [
      "(0, 1, 0, 1)",
      "(1, 1, 0, 0)",
      "(0, 1, 1, 0)",
      "(1, 0, 1, 0)"
    ],
    "answer": 2,
    "explanation": "AND cần cả hai đúng; OR cần ít nhất một đúng; XOR đúng khi khác nhau; NOT đảo giá trị."
  },
  {
    "id": "it10-016",
    "lesson": 6,
    "difficulty": 2,
    "prompt": "Quy trình số hoá âm thanh nào đúng?",
    "options": [
      "Lượng hoá → xoá mẫu → phát loa → lưu trữ",
      "Lấy mẫu biên độ → lượng hoá → mã hoá thành bit → lưu trữ",
      "Lưu trữ → mã hoá → thu âm → lượng hoá",
      "Mã hoá → phát loa → lấy mẫu → lượng hoá"
    ],
    "answer": 1,
    "explanation": "ADC tham gia lấy mẫu, lượng hoá và mã hoá tín hiệu; DAC chuyển dữ liệu số thành tín hiệu tương tự để loa hoặc tai nghe phát lại."
  },
  {
    "id": "it10-017",
    "lesson": 6,
    "difficulty": 2,
    "prompt": "Dùng 8 bit cho mỗi mẫu âm thanh, có bao nhiêu mức và mã nhị phân của mức 175 là gì?",
    "options": [
      "256 mức; 10101111",
      "255 mức; 10101111",
      "256 mức; 10100111",
      "8 mức; 10101111"
    ],
    "answer": 0,
    "explanation": "8 bit biểu diễn 256 mức từ 0 đến 255; 175 = 128 + 32 + 8 + 4 + 2 + 1 nên có mã 10101111."
  },
  {
    "id": "it10-018",
    "lesson": 6,
    "difficulty": 3,
    "prompt": "Âm thanh PCM stereo, tần số lấy mẫu 44.100 Hz, 16 bit/mẫu có bit rate bao nhiêu?",
    "options": [
      "705.600 bit/s",
      "88.200 bit/s",
      "44.100 bit/s",
      "1.411.200 bit/s"
    ],
    "answer": 3,
    "explanation": "Bit rate PCM = tần số lấy mẫu × số bit/mẫu × số kênh = 44.100 × 16 × 2 = 1.411.200 bit/s. Stereo có 2 kênh, mono có 1 kênh."
  },
  {
    "id": "it10-019",
    "lesson": 6,
    "difficulty": 2,
    "prompt": "Nhận định nào đúng về các định dạng âm thanh?",
    "options": [
      "Mọi tệp WAV đều chỉ có 1 bit/mẫu",
      "MP3 và FLAC đều không bao giờ dùng nén",
      "FLAC nén không mất dữ liệu; MP3 và AAC nén mất dữ liệu; WAV thường không nén",
      "FLAC luôn nén mất dữ liệu; MP3 không nén"
    ],
    "answer": 2,
    "explanation": "FLAC nén không mất dữ liệu; MP3, AAC và các mã hoá Vorbis/Opus trong OGG thường nén mất dữ liệu; WAV thường chứa PCM không nén."
  },
  {
    "id": "it10-020",
    "lesson": 6,
    "difficulty": 2,
    "prompt": "Ảnh 800 × 600 có bao nhiêu pixel và RGB 8 bit mỗi thành phần dùng bao nhiêu bit/pixel?",
    "options": [
      "1.400 pixel; 24 bit/pixel",
      "480.000 pixel; 24 bit/pixel",
      "1.400 pixel; 8 bit/pixel",
      "480.000 pixel; 8 bit/pixel"
    ],
    "answer": 1,
    "explanation": "Số pixel = 800 × 600 = 480.000. RGB có ba thành phần đỏ, lục, lam: 3 × 8 = 24 bit/pixel, cho 16.777.216 màu."
  },
  {
    "id": "it10-021",
    "lesson": 6,
    "difficulty": 2,
    "prompt": "Nhóm nhận định nào đúng về màu và độ sâu màu?",
    "options": [
      "RGB (255,255,255) là trắng; ảnh xám 8 bit có 256 mức; ảnh đen trắng 1 bit có 2 màu",
      "RGB (0,0,0) là trắng; ảnh xám 8 bit chỉ có 2 mức",
      "RGB (255,0,0) là lục; ảnh đen trắng có 256 mức",
      "RGB (0,0,255) là đỏ; ảnh xám 8 bit có 8 mức"
    ],
    "answer": 0,
    "explanation": "RGB trắng có cả ba thành phần đạt 255; đen là (0,0,0). 8 bit cho 256 mức xám; 1 bit cho hai màu đen và trắng."
  },
  {
    "id": "it10-022",
    "lesson": 6,
    "difficulty": 2,
    "prompt": "Phát biểu nào đúng về ảnh bitmap và các định dạng ảnh?",
    "options": [
      "Bitmap chỉ lưu đường nét toán học, không dùng pixel",
      "JPEG luôn giữ nguyên mọi thông tin của ảnh gốc",
      "PNG chỉ lưu được ảnh đen trắng 1 bit",
      "Bitmap lưu màu theo pixel; JPEG nén mất chất lượng; PNG nén không mất chất lượng và hỗ trợ trong suốt"
    ],
    "answer": 3,
    "explanation": "Ảnh bitmap nguyên gốc thường lưu trong .bmp; JPEG giảm dung lượng bằng nén mất mát, PNG dùng nén không mất mát và hỗ trợ nền trong suốt."
  },
  {
    "id": "it10-023",
    "lesson": 8,
    "difficulty": 1,
    "prompt": "Nhận định nào đúng về LAN, Internet và thiết bị kết nối?",
    "options": [
      "Switch luôn thay thế được mọi Router để kết nối các mạng khác nhau",
      "LAN bắt buộc phải phủ toàn cầu",
      "LAN có phạm vi nhỏ; Router kết nối các mạng LAN với Internet",
      "Internet chỉ hoạt động trong một phòng"
    ],
    "answer": 2,
    "explanation": "LAN thường trong gia đình, cơ quan; Switch/Hub kết nối thiết bị trong LAN, Router nối các mạng với nhau và Internet."
  },
  {
    "id": "it10-024",
    "lesson": 8,
    "difficulty": 2,
    "prompt": "Google Docs được dùng trực tiếp để soạn thảo văn bản trực tuyến thuộc loại dịch vụ nào?",
    "options": [
      "Thiết bị lưu trữ ngoại tuyến",
      "SaaS — phần mềm như dịch vụ",
      "PaaS — nền tảng như dịch vụ",
      "IaaS — hạ tầng như dịch vụ"
    ],
    "answer": 1,
    "explanation": "SaaS cung cấp phần mềm ứng dụng dùng trực tiếp, như Google Docs và Zoom."
  },
  {
    "id": "it10-025",
    "lesson": 8,
    "difficulty": 2,
    "prompt": "Thuê môi trường phát triển, triển khai ứng dụng và thuê máy chủ ảo lần lượt thuộc loại nào?",
    "options": [
      "PaaS và IaaS",
      "SaaS và PaaS",
      "IaaS và SaaS",
      "SaaS và SaaS"
    ],
    "answer": 0,
    "explanation": "PaaS cung cấp nền tảng phát triển, triển khai; IaaS cung cấp tài nguyên tính toán, lưu trữ và mạng."
  },
  {
    "id": "it10-026",
    "lesson": 8,
    "difficulty": 2,
    "prompt": "Trong hệ thống thu phí không dừng, chuỗi hoạt động nào thể hiện ứng dụng IoT?",
    "options": [
      "Người lái tự viết số tiền lên giấy rồi cất trong xe",
      "Chụp ảnh xe nhưng không truyền hay xử lí dữ liệu",
      "Chỉ bật một bóng đèn bằng công tắc cơ",
      "Đọc thẻ RFID → kiểm tra tài khoản → trừ phí → mở thanh chắn"
    ],
    "answer": 3,
    "explanation": "Các thiết bị kết nối thu thập và trao đổi dữ liệu, hệ thống tự xử lí để điều khiển thanh chắn."
  },
  {
    "id": "it10-027",
    "lesson": 8,
    "difficulty": 2,
    "prompt": "Trường hợp nào là ứng dụng IoT trong nhà thông minh?",
    "options": [
      "Dùng sổ giấy ghi thời gian mở cửa",
      "Một ổ khoá cơ không có cảm biến",
      "Cảm biến điều khiển đèn, cảnh báo đột nhập; chủ nhà giám sát qua Internet",
      "Mọi đèn chỉ bật được bằng công tắc cơ và không có kết nối"
    ],
    "answer": 2,
    "explanation": "Nhà thông minh kết nối cảm biến và thiết bị để tự động điều khiển, cảnh báo và giám sát từ xa."
  },
  {
    "id": "it10-028",
    "lesson": 9,
    "difficulty": 1,
    "prompt": "Nhóm nào gồm các nguy cơ khi sử dụng Internet?",
    "options": [
      "Chỉ sai phông chữ và hết giấy in",
      "Tin giả, tin phản văn hoá; lừa đảo; lộ thông tin cá nhân; bắt nạt; nghiện mạng",
      "Chỉ virus và hỏng màn hình",
      "Chỉ mất điện và đứt dây sạc"
    ],
    "answer": 1,
    "explanation": "Tin giả, tin phản văn hoá, lừa đảo, lộ thông tin cá nhân, bắt nạt và nghiện mạng đều là các nguy cơ khi sử dụng Internet."
  },
  {
    "id": "it10-029",
    "lesson": 9,
    "difficulty": 2,
    "prompt": "Phân biệt virus, worm và trojan nào đúng?",
    "options": [
      "Virus gắn vào phần mềm khác; worm là phần mềm hoàn chỉnh có thể lây; trojan nhằm nội gián, chiếm quyền",
      "Virus không bao giờ cần phần mềm khác; worm chỉ là ảnh tĩnh",
      "Trojan luôn là công cụ bảo vệ máy tính",
      "Cả ba đều không thể gây hại dữ liệu"
    ],
    "answer": 0,
    "explanation": "Virus cần vật chủ; worm có thể lây lan dưới dạng chương trình hoàn chỉnh; trojan thường ngụy trang để đánh cắp thông tin hoặc chiếm quyền."
  },
  {
    "id": "it10-030",
    "lesson": 9,
    "difficulty": 2,
    "prompt": "Bộ ghép nào đúng về các dạng phần mềm nội gián?",
    "options": [
      "Spyware: diệt virus; keylogger: nén ảnh; backdoor: tăng sáng; rootkit: soạn thảo",
      "Keylogger chỉ phát nhạc, không ghi thao tác",
      "Backdoor luôn là tính năng đăng xuất an toàn",
      "Spyware: đánh cắp thông tin; keylogger: ghi bàn phím; backdoor: truy cập bí mật; rootkit: quyền cao và che dấu vết"
    ],
    "answer": 3,
    "explanation": "Các dạng nội gián có thể thu thập thông tin, ghi thao tác, tạo đường truy cập ngầm hoặc chiếm quyền và che giấu hoạt động."
  },
  {
    "id": "it10-031",
    "lesson": 9,
    "difficulty": 2,
    "prompt": "Cách phòng chống mã độc nào phù hợp?",
    "options": [
      "Mở mọi tệp đính kèm vì có tên người quen",
      "Công khai mật khẩu để nhờ mọi người bảo vệ",
      "Không chạy phần mềm không rõ nguồn gốc, tránh liên kết lạ, giữ mật khẩu bí mật và dùng phần mềm chống mã độc",
      "Tắt công cụ bảo vệ trước khi tải phần mềm bẻ khoá"
    ],
    "answer": 2,
    "explanation": "Mã độc có thể xoá, mã hoá dữ liệu, đánh cắp thông tin và làm tê liệt máy; cần kiểm tra nguồn tải, liên kết và dùng công cụ bảo vệ."
  },
  {
    "id": "it10-032",
    "lesson": 11,
    "difficulty": 2,
    "prompt": "Một người đăng tin chưa kiểm chứng kèm lời xúc phạm bạn học. Cách ứng xử phù hợp là gì?",
    "options": [
      "Đăng cả thông tin riêng của bạn học",
      "Không phát tán, kiểm chứng thông tin và giao tiếp tôn trọng",
      "Chia sẻ ngay để tăng lượt xem",
      "Thêm lời miệt thị để gây chú ý"
    ],
    "answer": 1,
    "explanation": "Giao tiếp có trách nhiệm đòi hỏi tôn trọng người khác, tránh xúc phạm và lan truyền tin sai."
  },
  {
    "id": "it10-033",
    "lesson": 11,
    "difficulty": 2,
    "prompt": "Muốn dùng ảnh của người khác trong sản phẩm, cần làm gì?",
    "options": [
      "Tuân thủ điều kiện sử dụng, ghi nguồn; cân nhắc quyền riêng tư nếu có người trong ảnh",
      "Ghi tên mình là tác giả vì ảnh tải từ Internet",
      "Chỉ cần xoá chữ kí tác giả",
      "Mọi ảnh trên mạng đều tự do sử dụng bất kì cách nào"
    ],
    "answer": 0,
    "explanation": "Cần tôn trọng bản quyền, điều kiện cho phép và quyền riêng tư; không nhận sản phẩm của người khác là của mình."
  },
  {
    "id": "it10-034",
    "lesson": 33,
    "difficulty": 1,
    "prompt": "Công việc và năng lực nào phù hợp với nghề thiết kế đồ hoạ máy tính?",
    "options": [
      "Chỉ nhập số liệu, không cần bố cục hay hình ảnh",
      "Chỉ sửa phần cứng, không cần học công cụ đồ hoạ",
      "Chỉ sao chép sản phẩm người khác và nhận là của mình",
      "Thiết kế logo, áp phích; cần thẩm mĩ, sáng tạo, dùng phần mềm và hợp tác"
    ],
    "answer": 3,
    "explanation": "Nghề thiết kế đồ hoạ truyền đạt thông điệp bằng hình ảnh, chữ và bố cục; cần rèn công cụ, sản phẩm thực hành và khả năng giao tiếp, tự học."
  },
  {
    "id": "it10-035",
    "lesson": 34,
    "difficulty": 1,
    "prompt": "Nhận định nào đúng về nghề phát triển phần mềm?",
    "options": [
      "Không cần cập nhật kiến thức sau khi học xong",
      "Chỉ thiết kế áp phích và chọn màu in",
      "Gồm phân tích, thiết kế, lập trình, kiểm thử, triển khai, bảo trì; cần tư duy lôgic, hợp tác và tự học",
      "Chỉ viết mã, không cần kiểm thử hay hiểu yêu cầu"
    ],
    "answer": 2,
    "explanation": "Phát triển phần mềm bao gồm nhiều công đoạn; cần nền tảng tin học, ngoại ngữ, thực hành dự án, tính cẩn thận và học hỏi liên tục."
  }
];
