# Tech Shop

Website bán laptop gồm React/Vite và Spring Boot 3 (JDK 21), có khu vực khách hàng và trang quản trị.

## Chức năng

- Sản phẩm, danh mục, tìm kiếm, lọc, giỏ hàng và đặt hàng.
- Theo dõi đơn bằng số điện thoại; quản trị trạng thái và tồn kho.
- Tin tức có trang chi tiết.
- Form liên hệ lưu vào hệ thống và trang quản trị xử lý tin nhắn.
- Quản trị banner: thêm, sửa, ẩn/hiện, sắp xếp, tải lên và thay ảnh.
- Chỉnh thông tin cửa hàng từ trang Cài đặt.
- API quản trị được bảo vệ bằng token có chữ ký và thời hạn.
- Dữ liệu mặc định lưu bền vững tại `backend/data`; có thể chuyển sang MySQL.

## Chạy phát triển

Yêu cầu: JDK 21, Maven 3.9+, Node.js 20+.

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8080`

Tài khoản khởi tạo:

- Email: `admin@techshop.vn`
- Mật khẩu: `123456`

## Cấu hình trước khi đưa lên mạng

Phải thay các biến sau trên máy chủ:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=mat-khau-rat-manh
TOKEN_SECRET=chuoi-bi-mat-dai-ngau-nhien
CORS_ALLOWED_ORIGINS=https://ten-mien-cua-ban.vn
UPLOAD_DIR=/duong-dan-luu/uploads
```

Mặc định ứng dụng dùng H2 file, phù hợp website nhỏ một máy chủ. Cần sao lưu định kỳ thư mục `backend/data` và `backend/uploads`.

Để dùng MySQL:

```text
DB_URL=jdbc:mysql://localhost:3306/techshop?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Ho_Chi_Minh
DB_USERNAME=techshop
DB_PASSWORD=mat-khau-database
```

Build production:

```powershell
cd backend
mvn.cmd clean package
java -jar target/laptop-shop-backend-1.0.0.jar
```

```powershell
cd frontend
npm.cmd install
npm.cmd run build
```

Đưa nội dung `frontend/dist` lên Nginx/Apache. Reverse proxy cả `/api` và `/uploads` về backend, đồng thời cấu hình fallback mọi route frontend về `index.html`.

## Kiểm thử

```powershell
cd backend
mvn.cmd test

cd ../frontend

npm.cmd run build
```

Trang quản lý banner nằm tại `/admin/banners`; ảnh tải lên được lưu trong thư mục cấu hình bởi `UPLOAD_DIR`.
