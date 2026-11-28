"use strict";
const IT_QUESTIONS_11 = [
  {
    "id": "it11-001",
    "lesson": 1,
    "difficulty": 1,
    "prompt": "Hệ điều hành có vai trò nào sau đây?",
    "options": [
      "Quản lí phần cứng, tổ chức thực hiện chương trình và cung cấp môi trường giao tiếp",
      "Chỉ soạn thảo văn bản cho người dùng",
      "Chỉ lưu dữ liệu lâu dài khi máy tắt",
      "Thay thế bộ xử lí để thực hiện mọi phép tính"
    ],
    "answer": 0,
    "explanation": "Hệ điều hành là phần mềm hệ thống quản lí tài nguyên, tổ chức thực hiện chương trình và cung cấp giao diện với người dùng."
  },
  {
    "id": "it11-002",
    "lesson": 1,
    "difficulty": 2,
    "prompt": "Máy tính tự nhận biết thiết bị ngoại vi vừa cắm và hỗ trợ cài trình điều khiển. Đây là cơ chế nào?",
    "options": [
      "Sao lưu dữ liệu",
      "Plug & play",
      "Phân phối mã nguồn",
      "Phân quyền CSDL"
    ],
    "answer": 1,
    "explanation": "Plug & play giúp tự động nhận biết thiết bị và hỗ trợ cài trình điều khiển, làm việc kết nối thuận tiện hơn."
  },
  {
    "id": "it11-003",
    "lesson": 1,
    "difficulty": 2,
    "prompt": "Phát biểu nào mô tả đúng quan hệ giữa phần cứng, hệ điều hành và phần mềm ứng dụng?",
    "options": [
      "Phần cứng phải thông qua phần mềm soạn thảo để quản lí hệ điều hành",
      "Hệ điều hành là thiết bị vật lí nằm giữa CPU và RAM",
      "Ứng dụng giải quyết công việc thông qua hệ điều hành; hệ điều hành quản lí phần cứng",
      "Mọi ứng dụng đều tự quản lí toàn bộ phần cứng, không cần hệ điều hành"
    ],
    "answer": 2,
    "explanation": "Phần cứng thực hiện xử lí, hệ điều hành quản lí tài nguyên và cung cấp môi trường cho ứng dụng."
  },
  {
    "id": "it11-004",
    "lesson": 3,
    "difficulty": 1,
    "prompt": "Một phần mềm được cung cấp mã nguồn và cho phép sửa đổi, phân phối lại theo giấy phép được gọi là gì?",
    "options": [
      "Phần mềm chỉ được cung cấp ở dạng mã máy",
      "Thiết bị lưu trữ ngoài",
      "Trình điều khiển phần cứng bắt buộc trả phí",
      "Phần mềm nguồn mở"
    ],
    "answer": 3,
    "explanation": "Phần mềm nguồn mở cung cấp mã nguồn cùng quyền sử dụng, sửa đổi, phân phối theo giấy phép."
  },
  {
    "id": "it11-005",
    "lesson": 3,
    "difficulty": 2,
    "prompt": "Một bệnh viện thuê viết phần mềm theo quy trình riêng của mình. Đây là loại phần mềm thương mại nào?",
    "options": [
      "Phần mềm đặt hàng",
      "Phần mềm đóng gói với tính năng tổng quát",
      "Phần mềm miễn phí bắt buộc không có mã nguồn",
      "Phần mềm nguồn mở chỉ vì được thiết kế riêng"
    ],
    "answer": 0,
    "explanation": "Phần mềm đặt hàng được thiết kế theo yêu cầu riêng của người mua; phần mềm đóng gói hướng tới nhu cầu chung."
  },
  {
    "id": "it11-006",
    "lesson": 3,
    "difficulty": 2,
    "prompt": "Theo nội dung đã học về GNU GPL, phát biểu nào đúng khi sao chép và phân phối phần mềm?",
    "options": [
      "Được xoá thông báo bản quyền gốc nếu không thu phí",
      "Có thể thu phí chuyển giao, nhưng phải giữ thông báo bản quyền gốc và miễn trừ bảo hành",
      "Mọi hình thức thu phí chuyển giao đều bị cấm",
      "Phải đổi tên tác giả gốc thành tên người phân phối"
    ],
    "answer": 1,
    "explanation": "GNU GPL cho phép sao chép, phân phối và thu phí chuyển giao theo điều kiện, gồm giữ các thông báo bản quyền và miễn trừ bảo hành."
  },
  {
    "id": "it11-007",
    "lesson": 3,
    "difficulty": 1,
    "prompt": "Đặc điểm nào phù hợp với phần mềm trực tuyến như Google Docs?",
    "options": [
      "Bắt buộc cài bản riêng trên từng máy mới dùng được",
      "Chỉ hoạt động khi máy tính không kết nối Internet",
      "Thường sử dụng qua trình duyệt, thuận tiện cộng tác và truy cập từ nhiều thiết bị",
      "Không thể cho nhiều người cùng làm việc trên tài liệu"
    ],
    "answer": 2,
    "explanation": "Phần mềm trực tuyến thường sử dụng qua Internet và trình duyệt, hỗ trợ cộng tác, truy cập từ nhiều thiết bị với chi phí thấp hoặc miễn phí."
  },
  {
    "id": "it11-008",
    "lesson": 4,
    "difficulty": 1,
    "prompt": "Bộ nhớ nào lưu tạm dữ liệu đang dùng và mất dữ liệu khi tắt máy?",
    "options": [
      "ROM",
      "Ổ SSD",
      "Đĩa quang",
      "RAM"
    ],
    "answer": 3,
    "explanation": "RAM lưu tạm chương trình và dữ liệu trong lúc hoạt động; nội dung mất khi mất điện."
  },
  {
    "id": "it11-009",
    "lesson": 4,
    "difficulty": 2,
    "prompt": "CPU đa lõi có đặc điểm nào?",
    "options": [
      "Có nhiều đơn vị xử lí trên cùng một chip, hỗ trợ thực hiện song song nhiều công việc",
      "Dùng nhiều màn hình để thay thế bộ điều khiển",
      "Luôn lưu được dữ liệu khi mất điện như ổ cứng",
      "Chỉ thực hiện được một công việc vì các lõi không thể hoạt động song song"
    ],
    "answer": 0,
    "explanation": "Mỗi lõi là một đơn vị xử lí; CPU đa lõi hỗ trợ thực hiện song song nhiều công việc."
  },
  {
    "id": "it11-010",
    "lesson": 4,
    "difficulty": 2,
    "prompt": "Vì sao các mạch lôgic có vai trò trong hoạt động của máy tính?",
    "options": [
      "Chúng chỉ dùng để hiển thị hình ảnh trên vỏ máy",
      "Chúng kết hợp để thực hiện các phép tính và xử lí dữ liệu nhị phân",
      "Chúng thay thế bộ nhớ ngoài để lưu tệp lâu dài",
      "Chúng chỉ điều chỉnh độ sáng màn hình"
    ],
    "answer": 1,
    "explanation": "Các mạch lôgic kết hợp với nhau để tính toán và xử lí dữ liệu nhị phân."
  },
  {
    "id": "it11-011",
    "lesson": 5,
    "difficulty": 1,
    "prompt": "Thông số 1920 × 1080 pixel của màn hình cho biết điều gì?",
    "options": [
      "Độ dài đường chéo tính bằng inch",
      "Số lần làm mới hình ảnh mỗi giây",
      "Số điểm ảnh theo chiều ngang và chiều dọc",
      "Thời gian cần để một điểm ảnh đổi màu"
    ],
    "answer": 2,
    "explanation": "Độ phân giải màn hình là số điểm ảnh theo chiều ngang và chiều dọc; 1920 × 1080 là Full HD."
  },
  {
    "id": "it11-012",
    "lesson": 5,
    "difficulty": 2,
    "prompt": "Loại máy in nào dùng kim gõ qua băng mực và phù hợp in hoá đơn nhiều liên?",
    "options": [
      "Máy in nhiệt",
      "Máy in laser",
      "Máy in phun",
      "Máy in kim"
    ],
    "answer": 3,
    "explanation": "Máy in kim tạo điểm bằng kim gõ qua băng mực; cơ chế tác động cơ học phù hợp với giấy nhiều liên."
  },
  {
    "id": "it11-013",
    "lesson": 5,
    "difficulty": 2,
    "prompt": "Muốn truyền đồng thời hình ảnh và âm thanh số từ máy tính tới màn hình qua một cổng, nên chọn cổng nào?",
    "options": [
      "HDMI",
      "VGA",
      "Cổng chỉ nhận bàn phím",
      "Cổng chỉ nhận micro"
    ],
    "answer": 0,
    "explanation": "HDMI truyền cả hình ảnh và âm thanh số; VGA truyền hình ảnh tương tự và không truyền âm thanh."
  },
  {
    "id": "it11-014",
    "lesson": 5,
    "difficulty": 3,
    "prompt": "Một máy in đã cắm đúng cáp nhưng chưa hoạt động. Cách xử lí nào phù hợp với kiến thức đã học?",
    "options": [
      "Kết luận mọi máy in đều hỏng nếu không dùng ngay sau khi cắm",
      "Đọc tài liệu kĩ thuật, kiểm tra thiết lập và cài driver của nhà sản xuất nếu cần",
      "Xoá các tệp hệ điều hành để máy tự nhận lại thiết bị",
      "Thay mọi cổng kết nối bằng VGA vì VGA dùng được cho mọi thiết bị"
    ],
    "answer": 1,
    "explanation": "Không phải thiết bị nào cũng dùng được ngay sau khi cắm. Một số cần trình điều khiển hoặc thiết lập theo tài liệu kĩ thuật."
  },
  {
    "id": "it11-015",
    "lesson": 9,
    "difficulty": 3,
    "prompt": "Bạn nhận tin nhắn từ tài khoản mang tên người quen, thúc ép chuyển tiền ngay vào tài khoản lạ. Nên làm gì?",
    "options": [
      "Chuyển tiền ngay vì tên tài khoản giống người quen",
      "Gửi mật khẩu để người đó tự kiểm tra tài khoản",
      "Bình tĩnh, liên hệ người quen qua kênh độc lập để xác minh và dừng chuyển tiền nếu đáng ngờ",
      "Chỉ hỏi lại chính tài khoản đang nhắn và coi câu trả lời là đủ xác minh"
    ],
    "answer": 2,
    "explanation": "Áp dụng ba nguyên tắc: hãy chậm lại, kiểm tra ngay, dừng lại không gửi; xác minh qua kênh độc lập."
  },
  {
    "id": "it11-016",
    "lesson": 9,
    "difficulty": 2,
    "prompt": "Hành động nào thể hiện ứng xử có trách nhiệm trên mạng?",
    "options": [
      "Chia sẻ tin gây sốc ngay để nhiều người biết",
      "Đăng mã xác thực của mình để nhờ người lạ hỗ trợ",
      "Cho rằng nội dung trên mạng không cần chịu trách nhiệm",
      "Kiểm tra nguồn tin và xin phép trước khi chia sẻ hình ảnh riêng tư của người khác"
    ],
    "answer": 3,
    "explanation": "Ứng xử có trách nhiệm gồm chia sẻ thông tin đáng tin cậy, tôn trọng riêng tư và bảo vệ thông tin cá nhân."
  },
  {
    "id": "it11-017",
    "lesson": 11,
    "difficulty": 1,
    "prompt": "Cơ sở dữ liệu là gì?",
    "options": [
      "Tập hợp dữ liệu có liên quan, được lưu trữ có tổ chức trong hệ thống máy tính",
      "Thiết bị chuyên dùng để in các bảng dữ liệu",
      "Phần mềm chỉ dùng thay đổi độ sáng màn hình",
      "Mọi tệp bất kì đặt cạnh nhau mà không cần quan hệ hay tổ chức"
    ],
    "answer": 0,
    "explanation": "CSDL là tập hợp dữ liệu liên quan được tổ chức và lưu trữ trên hệ thống máy tính."
  },
  {
    "id": "it11-018",
    "lesson": 11,
    "difficulty": 2,
    "prompt": "Quy định điểm học tập phải nằm từ 0 đến 10 thể hiện thuộc tính nào của CSDL?",
    "options": [
      "Tính độc lập",
      "Tính toàn vẹn",
      "Tính không dư thừa",
      "Tính phân tán"
    ],
    "answer": 1,
    "explanation": "Tính toàn vẹn yêu cầu giá trị dữ liệu thoả mãn ràng buộc của bài toán, như miền giá trị hợp lệ của điểm."
  },
  {
    "id": "it11-019",
    "lesson": 11,
    "difficulty": 3,
    "prompt": "Tài khoản gửi đã bị trừ tiền nhưng tài khoản nhận chưa được cộng, và hệ thống ghi nhận giao dịch đã hoàn tất. Thuộc tính nào bị vi phạm?",
    "options": [
      "Tính độc lập với phần mềm",
      "Tính không dư thừa của tên trường",
      "Tính nhất quán",
      "Khả năng tăng dung lượng lưu trữ"
    ],
    "answer": 2,
    "explanation": "Giao dịch chuyển tiền phải bảo đảm việc trừ và cộng tiền tương ứng để dữ liệu nhất quán."
  },
  {
    "id": "it11-020",
    "lesson": 12,
    "difficulty": 2,
    "prompt": "Một hệ cơ sở dữ liệu gồm những thành phần nào?",
    "options": [
      "Chỉ các bảng dữ liệu, không cần phần mềm",
      "Màn hình, máy in và bàn phím",
      "Chỉ hệ điều hành và trình duyệt",
      "CSDL, hệ quản trị CSDL và các phần mềm ứng dụng CSDL"
    ],
    "answer": 3,
    "explanation": "Hệ CSDL gồm dữ liệu, phần mềm quản trị và các ứng dụng tương tác để phục vụ người dùng."
  },
  {
    "id": "it11-021",
    "lesson": 12,
    "difficulty": 3,
    "prompt": "Nhiều máy trạm cùng truy cập một CSDL được lưu trên một máy chủ. Có thể kết luận điều gì?",
    "options": [
      "Có thể là hệ CSDL tập trung; nhiều máy truy cập không có nghĩa dữ liệu được lưu phân tán",
      "Chắc chắn là CSDL phân tán vì có nhiều người dùng",
      "Không thể dùng hệ quản trị CSDL trong mô hình này",
      "Mỗi máy trạm bắt buộc phải lưu một CSDL độc lập"
    ],
    "answer": 0,
    "explanation": "Phân biệt tập trung và phân tán dựa vào cách lưu trữ dữ liệu, không chỉ dựa vào số máy truy cập."
  },
  {
    "id": "it11-022",
    "lesson": 15,
    "difficulty": 2,
    "prompt": "Học sinh chỉ cần xem điểm, giáo viên cần nhập và sửa điểm môn mình dạy. Nên phân quyền thế nào?",
    "options": [
      "Cho mọi người quyền quản trị để thao tác nhanh",
      "Cấp quyền theo nhiệm vụ: học sinh xem, giáo viên cập nhật phần được giao",
      "Chỉ cần giấu địa chỉ truy cập, không cần phân quyền",
      "Dùng chung tài khoản quản trị cho cả học sinh và giáo viên"
    ],
    "answer": 1,
    "explanation": "Phân quyền theo nhiệm vụ giúp ngăn cập nhật hoặc truy cập trái phép."
  },
  {
    "id": "it11-023",
    "lesson": 15,
    "difficulty": 3,
    "prompt": "Biện pháp nào giúp khôi phục dữ liệu nếu thiết bị lưu trữ bị hỏng?",
    "options": [
      "Chỉ đổi mật khẩu tài khoản sau khi thiết bị hỏng",
      "Chỉ tăng độ phân giải màn hình máy chủ",
      "Sao lưu định kì ra nơi dự phòng và chuẩn bị phương án phục hồi",
      "Chỉ ghi nhớ tên các bảng, không cần sao lưu nội dung"
    ],
    "answer": 2,
    "explanation": "Sao lưu dự phòng và phương án phục hồi giúp lấy lại dữ liệu khi thiết bị hoặc hệ thống gặp sự cố."
  },
  {
    "id": "it11-024",
    "lesson": 16,
    "difficulty": 1,
    "prompt": "Mục đích chính của công việc quản trị CSDL là gì?",
    "options": [
      "Chỉ thiết kế hình ảnh quảng cáo cho hệ thống",
      "Chỉ nhập dữ liệu hằng ngày thay tất cả người dùng",
      "Loại bỏ việc sao lưu để giảm thời gian vận hành",
      "Giữ hệ CSDL thông suốt, an toàn, hiệu quả và sẵn sàng phục vụ khai thác"
    ],
    "answer": 3,
    "explanation": "Quản trị CSDL bảo đảm hoạt động liên tục, hiệu quả, an toàn và sẵn sàng phục vụ nhu cầu khai thác."
  },
  {
    "id": "it11-025",
    "lesson": 16,
    "difficulty": 2,
    "prompt": "Tổ hợp năng lực nào phù hợp với người quản trị CSDL?",
    "options": [
      "Hiểu CSDL, thành thạo hệ quản trị và SQL, cẩn thận và có khả năng tự học",
      "Chỉ biết dùng bảng tính, không cần hiểu CSDL",
      "Chỉ giỏi thiết kế đồ hoạ, không cần phân tích sự cố",
      "Không cần cập nhật kiến thức sau khi đã cài xong hệ thống"
    ],
    "answer": 0,
    "explanation": "Người quản trị cần kiến thức CSDL, hệ quản trị, SQL, hệ điều hành, mạng cùng tính cẩn thận, khả năng phân tích và tự học."
  },
  {
    "id": "it11-026",
    "lesson": 1,
    "difficulty": 1,
    "prompt": "Đặc điểm nào được chú trọng ở hệ điều hành thiết bị di động như Android, iOS?",
    "options": [
      "Chỉ giao tiếp bằng dòng lệnh, không có cảm ứng",
      "Thao tác cảm ứng, kết nối không dây, cảm biến và tiện ích cá nhân",
      "Chỉ hoạt động khi gắn bàn phím và màn hình rời",
      "Không hỗ trợ kết nối không dây để tiết kiệm bộ nhớ"
    ],
    "answer": 1,
    "explanation": "Hệ điều hành di động chú trọng giao diện cảm ứng, kết nối không dây, cảm biến và các tiện ích cá nhân."
  },
  {
    "id": "it11-027",
    "lesson": 3,
    "difficulty": 1,
    "prompt": "Trong bảng phần mềm cùng chức năng đã học, phần mềm nguồn mở nào dùng để chỉnh sửa ảnh, tương ứng với Photoshop?",
    "options": [
      "Writer",
      "Calc",
      "GIMP",
      "MySQL"
    ],
    "answer": 2,
    "explanation": "GIMP là phần mềm chỉnh sửa ảnh nguồn mở; Writer soạn thảo văn bản, Calc làm bảng tính, MySQL quản trị CSDL."
  },
  {
    "id": "it11-028",
    "lesson": 4,
    "difficulty": 2,
    "prompt": "Máy tính cần giữ chương trình kiểm tra và khởi động ngay cả khi mất điện. Loại bộ nhớ trong nào phù hợp?",
    "options": [
      "RAM",
      "Thanh ghi đang dùng của CPU",
      "Bộ nhớ tạm của ứng dụng",
      "ROM"
    ],
    "answer": 3,
    "explanation": "ROM giữ được nội dung khi mất điện và thường lưu dữ liệu hệ thống, chương trình kiểm tra, khởi động máy."
  },
  {
    "id": "it11-029",
    "lesson": 5,
    "difficulty": 2,
    "prompt": "Màn hình có tần số quét 75 Hz. Thông số này cho biết điều gì?",
    "options": [
      "Hình ảnh được làm mới 75 lần trong một giây",
      "Đường chéo màn hình dài 75 inch",
      "Mỗi điểm ảnh cần 75 giây để đổi màu",
      "Màn hình chỉ biểu diễn được 75 màu"
    ],
    "answer": 0,
    "explanation": "Tần số quét đo số lần làm mới hình ảnh trong một giây, đơn vị Hz."
  },
  {
    "id": "it11-030",
    "lesson": 5,
    "difficulty": 2,
    "prompt": "Máy in tạo chữ bằng cách làm nóng giấy cảm nhiệt thường thuộc loại nào?",
    "options": [
      "Máy in phun",
      "Máy in nhiệt",
      "Máy in laser",
      "Máy in kim"
    ],
    "answer": 1,
    "explanation": "Máy in nhiệt làm nóng giấy cảm nhiệt để tạo chữ, hình và thường dùng in hoá đơn bán hàng."
  },
  {
    "id": "it11-031",
    "lesson": 9,
    "difficulty": 2,
    "prompt": "Khi nhận một liên kết lạ yêu cầu nhập mật khẩu và mã xác thực để tránh bị khoá tài khoản, em nên làm gì?",
    "options": [
      "Nhập ngay vì yêu cầu có cảnh báo khẩn cấp",
      "Gửi mã xác thực cho người gửi để họ xác minh hộ",
      "Không nhập thông tin, kiểm tra yêu cầu qua kênh chính thức độc lập",
      "Chuyển tiếp liên kết cho bạn bè và nhờ họ đăng nhập thử"
    ],
    "answer": 2,
    "explanation": "Không cung cấp mật khẩu, mã xác thực cho người lạ; kiểm tra người gửi và liên kết, xác minh qua kênh độc lập."
  },
  {
    "id": "it11-032",
    "lesson": 11,
    "difficulty": 2,
    "prompt": "Mục đích của việc hạn chế lưu trùng lặp dữ liệu trong CSDL là gì?",
    "options": [
      "Buộc mỗi thông tin phải được lưu lại ở nhiều nơi hơn",
      "Loại bỏ mọi cấu trúc để dữ liệu trở nên tự do",
      "Thay thế hoàn toàn nhu cầu bảo mật và sao lưu",
      "Giảm dư thừa và hạn chế sai khác giữa các bản dữ liệu khi cập nhật"
    ],
    "answer": 3,
    "explanation": "Hạn chế lưu trùng giúp giảm dư thừa, tránh phải sửa cùng thông tin ở nhiều nơi và giảm nguy cơ dữ liệu không nhất quán."
  },
  {
    "id": "it11-033",
    "lesson": 11,
    "difficulty": 3,
    "prompt": "Khi cách tổ chức lưu trữ dữ liệu thay đổi, ứng dụng khai thác ít phải sửa theo. Điều này thể hiện thuộc tính nào?",
    "options": [
      "Tính độc lập dữ liệu",
      "Tần số quét cao",
      "Tính toàn vẹn của miền điểm từ 0 đến 10",
      "Khả năng phân phối phần mềm theo GPL"
    ],
    "answer": 0,
    "explanation": "Tính độc lập tách cách tổ chức, lưu trữ dữ liệu khỏi phần mềm khai thác, hạn chế phải sửa ứng dụng khi cách lưu trữ thay đổi."
  },
  {
    "id": "it11-034",
    "lesson": 12,
    "difficulty": 2,
    "prompt": "Chức năng nào thuộc về hệ quản trị CSDL?",
    "options": [
      "Thực hiện phun mực lên giấy để tạo bản in",
      "Định nghĩa cấu trúc, cập nhật, truy xuất và kiểm soát quyền truy cập dữ liệu",
      "Thay đổi màu từng điểm ảnh của màn hình bằng mạch hiển thị",
      "Cấp nguồn điện liên tục thay cho bộ lưu điện"
    ],
    "answer": 1,
    "explanation": "Hệ quản trị CSDL hỗ trợ định nghĩa, cập nhật, truy xuất, bảo mật, an toàn dữ liệu và cung cấp giao diện lập trình ứng dụng."
  },
  {
    "id": "it11-035",
    "lesson": 15,
    "difficulty": 3,
    "prompt": "Người quản trị muốn kiểm tra ai đã truy cập dữ liệu khi có sự cố. Biện pháp nào hỗ trợ trực tiếp việc này?",
    "options": [
      "Tắt toàn bộ nhật kí để giảm số lượng tệp",
      "Cấp quyền quản trị cho mọi người dùng",
      "Ghi nhật kí hoạt động và tổ chức giám sát hệ thống",
      "Chỉ lưu tên CSDL, không lưu hoạt động truy cập"
    ],
    "answer": 2,
    "explanation": "Nhật kí lưu lại hoạt động để hỗ trợ kiểm tra và phân tích; giám sát giúp phát hiện sự cố hoặc truy cập bất thường."
  }
];
