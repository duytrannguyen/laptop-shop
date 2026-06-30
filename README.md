# Tech Shop

Website thương mại điện tử bán sản phẩm công nghệ, xây dựng bằng **React/Vite** (frontend) và **Spring Boot 3** (backend, JDK 21). Bao gồm giao diện khách hàng hiện đại và trang quản trị toàn diện.

---

## Chức năng

### Giao diện khách hàng

- **Trang chủ**: Banner slider tự động, banner phụ sidebar, banner dải, sản phẩm nổi bật, danh mục sản phẩm động.
- **Sản phẩm**: Danh sách sản phẩm có phân trang, lọc theo danh mục / thương hiệu / nhu cầu / khoảng giá, tìm kiếm.
- **Chi tiết sản phẩm**: Hiển thị ảnh, thông số kỹ thuật, giá bán, mô tả chi tiết, sản phẩm liên quan.
- **Giỏ hàng & Đặt hàng**: Giỏ hàng lưu localStorage, form đặt hàng (họ tên, SĐT, địa chỉ, ghi chú).
- **Theo dõi đơn hàng**: Tra cứu trạng thái đơn hàng bằng số điện thoại.
- **Tin tức**: Danh sách bài viết và trang chi tiết bài viết.
- **Liên hệ**: Form gửi tin nhắn liên hệ đến cửa hàng.
- **Trang tĩnh**: Giới thiệu, Bảo hành, Trả góp, FAQ.
- **UI/UX**: Responsive, Back to top, Scroll to top, Toast notification, SEO (meta tags, Open Graph, Schema.org).

### Trang quản trị (`/admin`)

- **Dashboard**: Tổng quan đơn hàng, sản phẩm, doanh thu.
- **Quản lý sản phẩm**: CRUD sản phẩm, upload ảnh, xử lý ảnh (xóa nền AI, khung ảnh, watermark logo), nhập/xuất hàng loạt.
- **Quản lý danh mục**: Danh mục cha/con, sắp xếp, ẩn/hiện.
- **Quản lý thương hiệu**: CRUD thương hiệu sản phẩm.
- **Nhóm sản phẩm**: Gom nhóm sản phẩm theo bộ sưu tập.
- **Nhu cầu**: Phân loại theo nhu cầu sử dụng (Mới, Đã sử dụng...).
- **Quản lý banner**: 3 vị trí (Slider chính, Sidebar phụ, Strip dải dưới), kéo thả sắp xếp, upload ảnh, ẩn/hiện.
- **Quản lý bài viết**: CRUD bài viết tin tức với editor trực quan.
- **Quản lý đơn hàng**: Xem, cập nhật trạng thái đơn hàng, quản lý tồn kho.
- **Quản lý liên hệ**: Xem và xử lý tin nhắn từ khách hàng.
- **Thiết lập Menu**: Menu header và footer, hỗ trợ cấp cha/con, kéo thả sắp xếp.
- **Quản lý Media**: Duyệt và quản lý file đã upload.
- **Cài đặt**: Thông tin cửa hàng (tên, hotline, email, địa chỉ, giờ mở cửa, logo, favicon).

### API & Bảo mật

- REST API chuẩn, phân quyền Admin/Public.
- Xác thực bằng JWT token có chữ ký HMAC và thời hạn cấu hình được.
- CORS cấu hình theo biến môi trường.
- Upload file: giới hạn 15MB, lưu theo thư mục (products, banners, frame, logo...).

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React, Vite, React Router DOM, Axios, Lucide Icons |
| Styling | Vanilla CSS (Google Fonts: Inter) |
| Backend | Spring Boot 3.3.5, JDK 21, Spring Data JPA, Spring Security |
| Database | MySQL (production) / H2 (development) |
| Xử lý ảnh | Thumbnailator (backend), @imgly/background-removal (frontend AI) |
| Editor | CKEditor 4, React Quill |
| Build tool | Maven (backend), Vite (frontend) |

---

## Cấu trúc dự án

```
laptop-shop/
├── backend/
│   ├── pom.xml
│   ├── uploads/                    # File upload (ảnh sản phẩm, banner...)
│   └── src/main/
│       ├── java/com/techshop/
│       │   ├── config/             # DataSeeder, WebConfig
│       │   ├── controller/         # AdminController, PublicController, AuthController...
│       │   ├── dto/                # Request DTOs
│       │   ├── entity/             # JPA Entities
│       │   ├── repository/         # Spring Data Repositories
│       │   ├── security/           # JWT filter, SecurityConfig
│       │   └── service/            # (reserved)
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                # Entry point + Router
│       ├── api/client.js           # Axios instance + interceptors
│       ├── context/                # AuthContext, CartContext, SiteContext, ToastContext
│       ├── components/
│       │   ├── common/             # ScrollToTop, BackToTop, AutoImage
│       │   ├── layout/             # UserLayout, AdminLayout, Header, Footer
│       │   └── specific/           # ProductCard, ImageTool
│       ├── pages/
│       │   ├── user/               # HomePage, ProductsPage, CartPage...
│       │   ├── admin/              # DashboardPage, ProductsManage, BannersManage...
│       │   └── auth/               # AdminLogin
│       └── styles/                 # CSS modules (app, admin, hero, product-card...)
└── README.md
```

---

## Chạy phát triển

**Yêu cầu**: JDK 21, Maven 3.9+, Node.js 20+, MySQL 8+.

### Backend

```powershell
cd backend
mvn spring-boot:run
```

Backend chạy tại: `http://localhost:8080`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

### Tài khoản quản trị mặc định

| Thông tin | Giá trị |
|---|---|
| Email | `admin@techshop.vn` |
| Mật khẩu | `123456` |

---

## Kích thước hình ảnh chuẩn

Để hình ảnh hiển thị đẹp nhất trên website, vui lòng tuân thủ các kích thước sau:

### Banner

| Vị trí | Kích thước khuyến nghị | Tỉ lệ | Ghi chú |
|---|---|---|---|
| **Slider chính** | 900 × 400 px | ~2.25:1 | Banner lớn giữa trang chủ, tự động trượt |
| **Banner phụ (Sidebar)** | 600 × 270 px | ~2.22:1 | 2 ô bên phải slider |
| **Banner dải (Strip)** | 600 × 225 px | 8:3 | 4 ô ngang phía dưới slider |

### Sản phẩm

| Vị trí | Tỉ lệ | Ghi chú |
|---|---|---|
| **Ảnh sản phẩm (card)** | 4:3 | Hiển thị trong danh sách, `object-fit: contain` trên nền trắng |
| **Ảnh chi tiết sản phẩm** | 4:3 | Ảnh lớn trang chi tiết |
| **Thumbnail** | 76 × 58 px | Ảnh nhỏ bên dưới ảnh chính |

### Chung

| Loại | Định dạng | Kích thước tối đa |
|---|---|---|
| Upload file | JPG, PNG, WebP, GIF | 15 MB |
| Logo cửa hàng | PNG (nền trong suốt) | Tùy ý |
| Khung ảnh (Frame) | PNG (nền trong suốt) | Tùy ý |

---

## Cấu hình triển khai (Production)

### Biến môi trường bắt buộc

```properties
# Database MySQL
DB_URL=jdbc:mysql://localhost:3306/techshop?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh&createDatabaseIfNotExist=true
DB_USERNAME=techshop
DB_PASSWORD=mat-khau-database

# Bảo mật
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=mat-khau-rat-manh
TOKEN_SECRET=chuoi-bi-mat-dai-ngau-nhien-it-nhat-32-ky-tu
TOKEN_TTL_SECONDS=43200

# CORS
CORS_ALLOWED_ORIGINS=https://ten-mien-cua-ban.vn

# Upload
UPLOAD_DIR=/duong-dan-luu/uploads

# Port (mặc định 8080)
PORT=8080
```

### Build production

**Backend:**

```powershell
cd backend
mvn clean package
java -jar target/laptop-shop-backend-1.0.0.jar
```

**Frontend:**

```powershell
cd frontend
npm install
npm run build
```

### Cấu hình Nginx

Đưa nội dung `frontend/dist` lên web server. Cấu hình reverse proxy và SPA fallback:

```nginx
server {
    listen 80;
    server_name techshop.vn;

    # Frontend SPA
    root /var/www/techshop/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Reverse proxy uploads
    location /uploads/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Sao lưu

Cần sao lưu định kỳ:

- **Database MySQL**: `mysqldump -u techshop -p techshop > backup.sql`
- **Thư mục uploads**: `backend/uploads/`

---

## Kiểm thử

```powershell
# Backend unit tests
cd backend
mvn test

# Frontend build check
cd frontend
npm run build
```
