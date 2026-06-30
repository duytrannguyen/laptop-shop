-- =====================================================
-- SEED PRODUCTS - Sản phẩm thật với thông tin thực tế
-- Chạy trực tiếp vào MySQL database techshop
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 1. THÊM BRANDS MỚI
-- =====================================================
INSERT INTO brand (name, slug, image, active) VALUES
('Anker', 'anker', NULL, 1),
('Baseus', 'baseus', NULL, 1),
('JBL', 'jbl', NULL, 1),
('Razer', 'razer', NULL, 1),
('SteelSeries', 'steelseries', NULL, 1),
('HyperX', 'hyperx', NULL, 1),
('SanDisk', 'sandisk', NULL, 1),
('Western Digital', 'western-digital', NULL, 1),
('TP-Link', 'tp-link', NULL, 1),
('Xiaomi', 'xiaomi', NULL, 1),
('Ugreen', 'ugreen', NULL, 1),
('Corsair', 'corsair', NULL, 1),
('Microsoft', 'microsoft', NULL, 1),
('Rapoo', 'rapoo', NULL, 1),
('Seagate', 'seagate', NULL, 1),
('Kingston', 'kingston', NULL, 1),
('Blue', 'blue', NULL, 1),
('Elgato', 'elgato', NULL, 1),
('8BitDo', '8bitdo', NULL, 1),
('Tomtoc', 'tomtoc', NULL, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Lấy brand IDs
SET @apple = (SELECT id FROM brand WHERE slug='apple');
SET @samsung = (SELECT id FROM brand WHERE slug='samsung');
SET @logitech = (SELECT id FROM brand WHERE slug='logitech');
SET @sony = (SELECT id FROM brand WHERE slug='sony');
SET @anker = (SELECT id FROM brand WHERE slug='anker');
SET @baseus = (SELECT id FROM brand WHERE slug='baseus');
SET @jbl = (SELECT id FROM brand WHERE slug='jbl');
SET @razer = (SELECT id FROM brand WHERE slug='razer');
SET @steelseries = (SELECT id FROM brand WHERE slug='steelseries');
SET @hyperx = (SELECT id FROM brand WHERE slug='hyperx');
SET @sandisk = (SELECT id FROM brand WHERE slug='sandisk');
SET @wd = (SELECT id FROM brand WHERE slug='western-digital');
SET @tplink = (SELECT id FROM brand WHERE slug='tp-link');
SET @xiaomi = (SELECT id FROM brand WHERE slug='xiaomi');
SET @ugreen = (SELECT id FROM brand WHERE slug='ugreen');
SET @corsair = (SELECT id FROM brand WHERE slug='corsair');
SET @microsoft = (SELECT id FROM brand WHERE slug='microsoft');
SET @rapoo = (SELECT id FROM brand WHERE slug='rapoo');
SET @seagate = (SELECT id FROM brand WHERE slug='seagate');
SET @kingston = (SELECT id FROM brand WHERE slug='kingston');
SET @blue = (SELECT id FROM brand WHERE slug='blue');
SET @elgato = (SELECT id FROM brand WHERE slug='elgato');
SET @bitdo = (SELECT id FROM brand WHERE slug='8bitdo');
SET @tomtoc = (SELECT id FROM brand WHERE slug='tomtoc');

-- =====================================================
-- 2. SẢN PHẨM: ỐP LƯNG ĐIỆN THOẠI (category_id = 11)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Ốp lưng Apple MagSafe Silicone Case iPhone 15 Pro Max',
  'op-lung-apple-magsafe-silicone-iphone-15-pro-max',
  'OL-APL-15PM-SIL',
  @apple, 1290000, 1090000,
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MT473?wid=1144&hei=1144',
  NULL, NULL, NULL, NULL, NULL, NULL, '30g',
  50, 1, 1, NOW(),
  'Ốp lưng silicone chính hãng Apple với công nghệ MagSafe tích hợp, bảo vệ iPhone 15 Pro Max toàn diện.',
  '<h2>Ốp lưng Apple MagSafe Silicone Case iPhone 15 Pro Max</h2><p>Ốp lưng Silicone Case chính hãng Apple được thiết kế đặc biệt cho iPhone 15 Pro Max, với nam châm MagSafe tích hợp giúp gắn phụ kiện dễ dàng. Chất liệu silicone mềm mại bên ngoài, lớp lót sợi microfiber bên trong bảo vệ iPhone không bị trầy xước.</p><ul><li>Chất liệu silicone cao cấp, cảm giác cầm mịn màng</li><li>MagSafe tích hợp - tương thích hoàn hảo với bộ sạc và phụ kiện MagSafe</li><li>Lớp lót microfiber bảo vệ mặt lưng iPhone</li><li>Dễ dàng tháo lắp, không để lại vết bẩn</li></ul>',
  'Giảm 200.000đ - Tặng kèm kính cường lực khi mua online',
  '{"Chất liệu":"Silicone cao cấp","Tương thích":"iPhone 15 Pro Max","Công nghệ":"MagSafe","Lớp lót":"Microfiber","Trọng lượng":"30g","Xuất xứ":"Chính hãng Apple"}',
  'Ốp lưng Apple MagSafe Silicone iPhone 15 Pro Max - Chính hãng',
  'Mua ốp lưng Apple MagSafe Silicone Case cho iPhone 15 Pro Max chính hãng. Chất liệu silicone cao cấp, MagSafe tích hợp, bảo vệ toàn diện.',
  11
),
(
  'Ốp lưng Samsung Galaxy S24 Ultra Silicone Case',
  'op-lung-samsung-galaxy-s24-ultra-silicone-case',
  'OL-SS-S24U-SIL',
  @samsung, 890000, 690000,
  'https://images.samsung.com/is/image/samsung/p6pim/vn/ef-ps928tbegww/gallery/vn-galaxy-s24-ultra-silicone-case-ef-ps928-ef-ps928tbegww-thumb-539505157',
  NULL, NULL, NULL, NULL, NULL, NULL, '28g',
  40, 1, 1, NOW(),
  'Ốp lưng Silicone chính hãng Samsung cho Galaxy S24 Ultra, thiết kế mỏng nhẹ, chống trơn trượt.',
  '<h2>Ốp lưng Samsung Galaxy S24 Ultra Silicone Case</h2><p>Ốp lưng chính hãng Samsung với chất liệu silicone mềm mại, ôm sát thân máy Galaxy S24 Ultra. Thiết kế tối giản, mỏng nhẹ nhưng vẫn đảm bảo bảo vệ máy khỏi va đập nhẹ và trầy xước hàng ngày.</p><ul><li>Silicone mềm mại, chống trơn trượt</li><li>Thiết kế mỏng chỉ 1.1mm, không làm cồng kềnh máy</li><li>Viền camera được nâng cao bảo vệ cụm camera</li><li>Hỗ trợ sạc không dây</li></ul>',
  'Giảm 200.000đ - Mua kèm kính cường lực chỉ 99.000đ',
  '{"Chất liệu":"Silicone","Tương thích":"Galaxy S24 Ultra","Độ dày":"1.1mm","Trọng lượng":"28g","Sạc không dây":"Có hỗ trợ","Xuất xứ":"Chính hãng Samsung"}',
  'Ốp lưng Samsung Galaxy S24 Ultra Silicone Case - Chính hãng',
  'Mua ốp lưng Samsung Galaxy S24 Ultra Silicone Case chính hãng. Silicone mềm mại, mỏng nhẹ, bảo vệ toàn diện.',
  11
);

-- =====================================================
-- 3. SẢN PHẨM: KÍNH CƯỜNG LỰC (category_id = 12)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Kính cường lực iPhone 15 Pro Max Spigen GlasTR EZ Fit',
  'kinh-cuong-luc-iphone-15-pro-max-spigen-glastr',
  'KCL-SPG-15PM',
  NULL, 390000, 290000,
  'https://m.media-amazon.com/images/I/71Lxn68u4hL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '15g',
  100, 1, 1, NOW(),
  'Kính cường lực Spigen GlasTR EZ Fit cho iPhone 15 Pro Max, độ cứng 9H, khung dán tự động.',
  '<h2>Kính cường lực Spigen GlasTR EZ Fit</h2><p>Spigen GlasTR EZ Fit là kính cường lực cao cấp với công nghệ EZ Fit giúp dán kính chuẩn vị trí chỉ trong vài giây. Độ cứng 9H chống trầy xước, lớp phủ oleophobic chống vân tay.</p><ul><li>Độ cứng 9H - chống trầy xước tối đa</li><li>Khung EZ Fit - dán chuẩn vị trí tự động</li><li>Lớp phủ oleophobic chống vân tay, dễ lau chùi</li><li>Độ mỏng 0.33mm, không ảnh hưởng cảm ứng</li><li>Bộ 2 miếng kính</li></ul>',
  'Bộ 2 miếng - Giảm giá 100.000đ',
  '{"Độ cứng":"9H","Độ dày":"0.33mm","Số lượng":"2 miếng/hộp","Tương thích":"iPhone 15 Pro Max","Lớp phủ":"Oleophobic","Công nghệ dán":"EZ Fit Auto-Align"}',
  'Kính cường lực Spigen GlasTR EZ Fit iPhone 15 Pro Max',
  'Kính cường lực Spigen GlasTR EZ Fit cho iPhone 15 Pro Max, 9H, chống vân tay, khung dán tự động. Bộ 2 miếng.',
  12
);

-- =====================================================
-- 4. SẢN PHẨM: CÁP SẠC (category_id = 13)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Cáp sạc Anker PowerLine III Flow USB-C to Lightning 1.8m',
  'cap-sac-anker-powerline-iii-flow-usb-c-to-lightning',
  'CS-ANK-PL3-CL',
  @anker, 450000, 350000,
  'https://m.media-amazon.com/images/I/51YjBxm8jnL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '25g',
  80, 1, 1, NOW(),
  'Cáp sạc Anker PowerLine III Flow USB-C to Lightning dài 1.8m, silicone mềm, sạc nhanh PD, chứng nhận MFi.',
  '<h2>Anker PowerLine III Flow USB-C to Lightning</h2><p>Cáp sạc Anker PowerLine III Flow với chất liệu silicone mềm mại, không bị rối, hỗ trợ sạc nhanh Power Delivery lên đến 30W cho iPhone. Được chứng nhận MFi bởi Apple, đảm bảo tương thích hoàn hảo.</p><ul><li>Chất liệu silicone mềm, không bị rối, dễ cuộn gọn</li><li>Sạc nhanh PD lên đến 30W</li><li>Chứng nhận MFi chính hãng Apple</li><li>Bền bỉ - chịu được 25.000 lần uốn gập</li><li>Chiều dài 1.8m tiện dụng</li></ul>',
  'Giảm 100.000đ - Flash Sale cuối tuần',
  '{"Chiều dài":"1.8m","Đầu vào":"USB-C","Đầu ra":"Lightning","Công suất":"30W PD","Chất liệu":"Silicone","Chứng nhận":"MFi Apple","Độ bền":"25.000 lần uốn gập"}',
  'Cáp sạc Anker PowerLine III Flow USB-C to Lightning 1.8m',
  'Cáp sạc Anker PowerLine III Flow USB-C to Lightning 1.8m, sạc nhanh PD 30W, MFi, silicone mềm không rối.',
  13
),
(
  'Cáp sạc Baseus Crystal Shine USB-C to USB-C 100W 1.2m',
  'cap-sac-baseus-crystal-shine-usb-c-100w',
  'CS-BS-CRYS-CC',
  @baseus, 199000, 149000,
  'https://m.media-amazon.com/images/I/61Dw5Z8PFOL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '22g',
  120, 0, 1, NOW(),
  'Cáp sạc Baseus Crystal Shine USB-C to USB-C 100W, hỗ trợ sạc nhanh PD cho laptop và điện thoại.',
  '<h2>Baseus Crystal Shine USB-C to USB-C 100W</h2><p>Cáp sạc nhanh Baseus Crystal Shine với công suất lên đến 100W, phù hợp sạc nhanh cho cả laptop và điện thoại. Thiết kế trong suốt hiện đại, dây dẹt chống rối.</p><ul><li>Công suất sạc lên đến 100W (20V/5A)</li><li>Truyền dữ liệu 480Mbps</li><li>Dây dẹt chống rối, dễ cuộn gọn</li><li>Thiết kế trong suốt Crystal Shine</li><li>Tương thích MacBook, iPad, Samsung, Xiaomi</li></ul>',
  'Mua 2 giảm thêm 10%',
  '{"Chiều dài":"1.2m","Đầu vào":"USB-C","Đầu ra":"USB-C","Công suất":"100W (20V/5A)","Truyền dữ liệu":"480Mbps","Chất liệu":"TPE trong suốt"}',
  'Cáp sạc Baseus Crystal Shine USB-C 100W',
  'Cáp sạc Baseus Crystal Shine USB-C to USB-C 100W, sạc nhanh PD cho laptop và điện thoại. Dây dẹt chống rối.',
  13
);

-- =====================================================
-- 5. SẢN PHẨM: PIN DỰ PHÒNG (category_id = 14)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Pin dự phòng Anker PowerCore 20000mAh 22.5W',
  'pin-du-phong-anker-powercore-20000mah',
  'PDP-ANK-PC20K',
  @anker, 790000, 590000,
  'https://m.media-amazon.com/images/I/61lhMFLpjpL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '20000mAh', '340g',
  60, 1, 1, NOW(),
  'Pin dự phòng Anker PowerCore 20000mAh, sạc nhanh 22.5W, 2 cổng USB-A, 1 cổng USB-C, sạc được 4 lần iPhone.',
  '<h2>Anker PowerCore 20000mAh</h2><p>Pin dự phòng dung lượng lớn 20000mAh từ Anker, đủ sạc iPhone 15 khoảng 4 lần. Hỗ trợ sạc nhanh 22.5W qua USB-C, tương thích với nhiều thiết bị.</p><ul><li>Dung lượng 20000mAh - sạc iPhone 15 khoảng 4 lần</li><li>Sạc nhanh 22.5W qua USB-C</li><li>2 cổng USB-A + 1 cổng USB-C, sạc 3 thiết bị cùng lúc</li><li>Chip PowerIQ 3.0 tự nhận diện thiết bị</li><li>Công nghệ MultiProtect 10 lớp bảo vệ</li></ul>',
  'Giảm 200.000đ - Tặng cáp USB-C',
  '{"Dung lượng":"20000mAh","Công suất sạc":"22.5W","Cổng vào":"USB-C (Input/Output)","Cổng ra":"2x USB-A, 1x USB-C","Số lần sạc iPhone 15":"~4 lần","Trọng lượng":"340g","Kích thước":"158 x 74 x 19.4mm"}',
  'Pin dự phòng Anker PowerCore 20000mAh 22.5W',
  'Pin dự phòng Anker PowerCore 20000mAh sạc nhanh 22.5W, 3 cổng sạc, chip PowerIQ 3.0, bảo vệ 10 lớp.',
  14
),
(
  'Pin dự phòng Xiaomi Mi Power Bank 3 10000mAh 22.5W',
  'pin-du-phong-xiaomi-mi-power-bank-3-10000mah',
  'PDP-XM-PB3-10K',
  @xiaomi, 390000, 290000,
  'https://m.media-amazon.com/images/I/41rY+8mfPnL._AC_SL1000_.jpg',
  NULL, NULL, NULL, NULL, NULL, '10000mAh', '223g',
  80, 1, 1, NOW(),
  'Pin dự phòng Xiaomi Mi Power Bank 3, 10000mAh, sạc nhanh 22.5W, thiết kế nhỏ gọn, vỏ kim loại.',
  '<h2>Xiaomi Mi Power Bank 3 10000mAh</h2><p>Pin dự phòng Xiaomi thế hệ thứ 3 với dung lượng 10000mAh, hỗ trợ sạc nhanh 22.5W. Vỏ kim loại nguyên khối sang trọng, thiết kế mỏng nhẹ dễ mang theo.</p><ul><li>Dung lượng 10000mAh - sạc iPhone 15 khoảng 2 lần</li><li>Sạc nhanh 22.5W hai chiều (sạc vào và sạc ra)</li><li>Vỏ kim loại nguyên khối cao cấp</li><li>Tương thích sạc nhanh QC 3.0, AFC, PD</li><li>Đèn LED hiển thị dung lượng</li></ul>',
  'Flash Sale - Giảm 100.000đ',
  '{"Dung lượng":"10000mAh","Công suất sạc":"22.5W","Cổng":"1x USB-A, 1x USB-C, 1x Micro-USB","Sạc nhanh":"QC 3.0, AFC, PD","Trọng lượng":"223g","Kích thước":"105 x 69 x 14.2mm","Vỏ":"Kim loại nguyên khối"}',
  'Pin dự phòng Xiaomi Mi Power Bank 3 10000mAh',
  'Pin dự phòng Xiaomi Mi Power Bank 3 10000mAh sạc nhanh 22.5W, vỏ kim loại, nhỏ gọn, QC 3.0/PD.',
  14
);

-- =====================================================
-- 6. SẢN PHẨM: GIÁ ĐỠ ĐIỆN THOẠI (category_id = 15)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Giá đỡ điện thoại Baseus Gravity Car Mount',
  'gia-do-dien-thoai-baseus-gravity-car-mount',
  'GD-BS-GRAV',
  @baseus, 250000, 190000,
  'https://m.media-amazon.com/images/I/51u0h6VCuuL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '85g',
  70, 0, 1, NOW(),
  'Giá đỡ điện thoại trên ô tô Baseus Gravity, kẹp tự động bằng trọng lực, tương thích 4.7-6.7 inch.',
  '<h2>Baseus Gravity Car Mount</h2><p>Giá đỡ điện thoại trên xe ô tô Baseus sử dụng cơ chế kẹp tự động bằng trọng lực - chỉ cần đặt điện thoại vào là tự kẹp chặt, lấy ra nhẹ nhàng.</p><ul><li>Cơ chế kẹp trọng lực tự động - không cần bấm nút</li><li>Tương thích điện thoại 4.7 - 6.7 inch</li><li>Gắn khe gió điều hòa ô tô</li><li>Xoay 360° linh hoạt</li><li>Chất liệu hợp kim nhôm + silicone chống trơn</li></ul>',
  'Giảm 60.000đ khi mua online',
  '{"Loại":"Kẹp khe gió ô tô","Cơ chế":"Trọng lực tự động","Tương thích":"4.7 - 6.7 inch","Góc xoay":"360°","Chất liệu":"Hợp kim nhôm + Silicone","Trọng lượng":"85g"}',
  'Giá đỡ điện thoại Baseus Gravity Car Mount',
  'Giá đỡ điện thoại xe ô tô Baseus Gravity, kẹp tự động bằng trọng lực, xoay 360°, tương thích 4.7-6.7 inch.',
  15
);

-- =====================================================
-- 7. SẢN PHẨM: TAI NGHE BLUETOOTH (category_id = 16)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Apple AirPods Pro 2 USB-C (2024)',
  'apple-airpods-pro-2-usb-c-2024',
  'TN-APL-APP2-UC',
  @apple, 6190000, 5490000,
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202409',
  NULL, NULL, NULL, NULL, NULL, '30 giờ (với hộp sạc)', '5.3g/bên',
  30, 1, 1, NOW(),
  'Apple AirPods Pro 2 phiên bản USB-C với chip H2, chống ồn chủ động ANC, âm thanh không gian Spatial Audio.',
  '<h2>Apple AirPods Pro 2 USB-C (2024)</h2><p>AirPods Pro thế hệ 2 với cổng USB-C, trang bị chip H2 cho khả năng chống ồn chủ động (ANC) gấp 2 lần thế hệ trước. Âm thanh không gian Adaptive Audio tự điều chỉnh theo môi trường.</p><ul><li>Chip H2 - chống ồn chủ động ANC vượt trội</li><li>Adaptive Audio - tự điều chỉnh âm thanh theo môi trường</li><li>Spatial Audio với theo dõi chuyển động đầu</li><li>Cổng USB-C tiện lợi, hỗ trợ sạc Apple Watch</li><li>Pin 6 giờ nghe nhạc, 30 giờ với hộp sạc</li><li>Chống nước IP54</li></ul>',
  'Giảm 700.000đ - Tặng ốp AirPods chính hãng',
  '{"Chip":"Apple H2","ANC":"Có - Chống ồn chủ động","Âm thanh":"Spatial Audio, Adaptive Audio","Driver":"Custom Apple","Bluetooth":"5.3","Pin tai nghe":"6 giờ","Pin tổng (với hộp)":"30 giờ","Sạc":"USB-C, MagSafe, Qi","Chống nước":"IP54","Trọng lượng":"5.3g/bên, hộp 50.8g"}',
  'Apple AirPods Pro 2 USB-C 2024 - Chính hãng',
  'Mua Apple AirPods Pro 2 USB-C 2024 chính hãng. Chip H2, ANC, Spatial Audio, pin 30h, chống nước IP54.',
  16
),
(
  'Sony WF-1000XM5 True Wireless',
  'sony-wf-1000xm5-true-wireless',
  'TN-SONY-WF1KXM5',
  @sony, 6490000, 4990000,
  'https://m.media-amazon.com/images/I/51Bz75FirTL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '24 giờ (với hộp sạc)', '5.9g/bên',
  25, 1, 1, NOW(),
  'Sony WF-1000XM5, tai nghe true wireless nhỏ nhất thế giới với chống ồn ANC đỉnh cao, chip V2 + QN2e.',
  '<h2>Sony WF-1000XM5</h2><p>Tai nghe true wireless cao cấp nhất của Sony với thiết kế nhỏ gọn nhất trong phân khúc. Chip V2 kết hợp QN2e mang đến khả năng chống ồn hàng đầu thế giới. Driver 8.4mm Dynamic cho âm thanh Hi-Res Audio.</p><ul><li>Chống ồn ANC hàng đầu - chip V2 + QN2e</li><li>Driver Dynamic 8.4mm - Hi-Res Audio Wireless (LDAC)</li><li>Thiết kế nhỏ gọn nhất phân khúc</li><li>Speak-to-Chat & Quick Attention</li><li>Pin 8 giờ ANC bật, 24 giờ với hộp sạc</li><li>Chống nước IPX4</li></ul>',
  'Giảm 1.500.000đ - Trả góp 0%',
  '{"Chip":"Sony V2 + QN2e","ANC":"Có - Industry Leading","Driver":"Dynamic 8.4mm","Codec":"LDAC, AAC, SBC","Bluetooth":"5.3","Pin tai nghe":"8 giờ (ANC bật)","Pin tổng":"24 giờ","Sạc":"USB-C, Qi","Chống nước":"IPX4","Trọng lượng":"5.9g/bên"}',
  'Tai nghe Sony WF-1000XM5 True Wireless - Chính hãng',
  'Tai nghe Sony WF-1000XM5, chống ồn ANC hàng đầu thế giới, Hi-Res Audio LDAC, pin 24h, IPX4.',
  16
),
(
  'Samsung Galaxy Buds3 Pro',
  'samsung-galaxy-buds3-pro',
  'TN-SS-BUDS3P',
  @samsung, 5490000, 3990000,
  'https://images.samsung.com/is/image/samsung/p6pim/vn/sm-r630nzaaxev/gallery/vn-galaxy-buds3-pro-sm-r630-sm-r630nzaaxev-thumb-539700654',
  NULL, NULL, NULL, NULL, NULL, '26 giờ (với hộp sạc)', '4.7g/bên',
  35, 1, 1, NOW(),
  'Samsung Galaxy Buds3 Pro với thiết kế blade mới, chống ồn ANC thông minh, âm thanh 360 Audio, codec SSC.',
  '<h2>Samsung Galaxy Buds3 Pro</h2><p>Galaxy Buds3 Pro với thiết kế blade hiện đại hoàn toàn mới, driver 2-way planar + dynamic cho âm thanh Hi-Fi. Chống ồn ANC thông minh với AI tự điều chỉnh theo môi trường.</p><ul><li>Thiết kế Blade Design hoàn toàn mới</li><li>Driver 2-way: Planar + Dynamic cho âm Hi-Fi</li><li>ANC thông minh với AI</li><li>360 Audio với theo dõi chuyển động đầu</li><li>Codec Samsung Seamless (SSC) + LDAC</li><li>Chống nước IP57</li></ul>',
  'Giảm 1.500.000đ - Tặng ốp case chính hãng',
  '{"Chip":"Samsung","ANC":"Có - AI ANC","Driver":"2-way (Planar + Dynamic 10.5mm)","Codec":"SSC, LDAC, AAC, SBC","Bluetooth":"5.4","Pin tai nghe":"6 giờ (ANC bật)","Pin tổng":"26 giờ","Sạc":"USB-C, Qi","Chống nước":"IP57","Trọng lượng":"4.7g/bên"}',
  'Samsung Galaxy Buds3 Pro - Chính hãng',
  'Tai nghe Samsung Galaxy Buds3 Pro, thiết kế blade, ANC AI, driver 2-way Hi-Fi, IP57, pin 26h.',
  16
),
(
  'JBL Tune 770NC Wireless',
  'jbl-tune-770nc-wireless',
  'TN-JBL-T770NC',
  @jbl, 2490000, 1790000,
  'https://m.media-amazon.com/images/I/51m-LY2MnIL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '44 giờ', '225g',
  40, 0, 1, NOW(),
  'Tai nghe over-ear JBL Tune 770NC, chống ồn ANC, âm bass mạnh mẽ JBL Pure Bass, pin 44 giờ.',
  '<h2>JBL Tune 770NC</h2><p>Tai nghe chụp tai không dây JBL Tune 770NC với công nghệ chống ồn chủ động ANC hiệu quả. Âm thanh JBL Pure Bass mạnh mẽ, pin lên đến 44 giờ sử dụng liên tục.</p><ul><li>Chống ồn chủ động ANC</li><li>JBL Pure Bass Sound - bass sâu, mạnh mẽ</li><li>Pin khủng 44 giờ, sạc nhanh 5 phút = 3 giờ nghe</li><li>Đệm tai mềm, đeo thoải mái cả ngày</li><li>Gập gọn, dễ mang theo</li><li>Kết nối Multipoint 2 thiết bị</li></ul>',
  'Giảm 700.000đ - Freeship toàn quốc',
  '{"Loại":"Over-ear","ANC":"Có","Driver":"40mm","Bluetooth":"5.3","Pin":"44 giờ (ANC tắt), 34 giờ (ANC bật)","Sạc nhanh":"5 phút = 3 giờ nghe","Multipoint":"Có - 2 thiết bị","Trọng lượng":"225g","Gập gọn":"Có"}',
  'Tai nghe JBL Tune 770NC Wireless ANC',
  'Tai nghe JBL Tune 770NC chống ồn ANC, JBL Pure Bass, pin 44 giờ, Multipoint, gập gọn tiện lợi.',
  16
);

-- =====================================================
-- 8. SẢN PHẨM: TAI NGHE CÓ DÂY (category_id = 17)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Tai nghe Apple EarPods USB-C',
  'tai-nghe-apple-earpods-usb-c',
  'TN-APL-EP-UC',
  @apple, 590000, 490000,
  'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJY3?wid=1144&hei=1144',
  NULL, NULL, NULL, NULL, NULL, NULL, '11g',
  60, 0, 1, NOW(),
  'Tai nghe Apple EarPods với đầu cắm USB-C, điều khiển nhạc và cuộc gọi tích hợp, micro rõ ràng.',
  '<h2>Apple EarPods USB-C</h2><p>EarPods chính hãng Apple với đầu cắm USB-C, tương thích iPhone 15 series, iPad và MacBook. Thiết kế ergonomic theo hình dáng tai, đeo thoải mái lâu dài.</p><ul><li>Đầu cắm USB-C - tương thích iPhone 15, iPad, MacBook</li><li>Thiết kế ergonomic, đeo thoải mái</li><li>Điều khiển nhạc, âm lượng, cuộc gọi tích hợp trên dây</li><li>Micro tích hợp rõ ràng cho đàm thoại</li><li>Chất lượng âm thanh cân bằng từ Apple</li></ul>',
  'Giảm 100.000đ khi mua kèm iPhone',
  '{"Loại":"In-ear có dây","Đầu cắm":"USB-C","Micro":"Có","Điều khiển":"Có - Volume, Play/Pause, Call","Tương thích":"iPhone 15+, iPad, MacBook","Trọng lượng":"11g","Xuất xứ":"Chính hãng Apple"}',
  'Tai nghe Apple EarPods USB-C - Chính hãng',
  'Tai nghe Apple EarPods USB-C chính hãng, tương thích iPhone 15, iPad, MacBook. Micro và điều khiển tích hợp.',
  17
),
(
  'Sony MDR-EX155AP Tai nghe In-ear có dây',
  'sony-mdr-ex155ap-in-ear-co-day',
  'TN-SONY-EX155',
  @sony, 390000, 290000,
  'https://m.media-amazon.com/images/I/61YJm77+bWL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '3g',
  90, 0, 1, NOW(),
  'Tai nghe in-ear Sony MDR-EX155AP với driver 9mm, micro tích hợp, jack 3.5mm, âm bass ấm áp.',
  '<h2>Sony MDR-EX155AP</h2><p>Tai nghe in-ear Sony MDR-EX155AP với driver Neodymium 9mm cho âm thanh chi tiết, bass ấm áp. Nút tai silicone hybrid đeo thoải mái, micro tích hợp cho đàm thoại rõ ràng.</p><ul><li>Driver Neodymium 9mm - âm thanh chi tiết, bass ấm</li><li>Nút tai silicone hybrid SS/S/M/L</li><li>Micro tích hợp + nút điều khiển</li><li>Jack 3.5mm tương thích rộng rãi</li><li>Dây dài 1.2m, thiết kế Y-type chống rối</li></ul>',
  'Giảm 100.000đ',
  '{"Loại":"In-ear có dây","Driver":"Neodymium 9mm","Dải tần":"5Hz - 24kHz","Jack":"3.5mm","Micro":"Có","Chiều dài dây":"1.2m","Trọng lượng":"3g (không dây)","Nút tai":"Silicone hybrid (4 size)"}',
  'Tai nghe Sony MDR-EX155AP In-ear',
  'Tai nghe Sony MDR-EX155AP in-ear có dây, driver 9mm, micro tích hợp, jack 3.5mm, nhiều size nút tai.',
  17
);

-- =====================================================
-- 9. SẢN PHẨM: TAI NGHE GAMING (category_id = 18)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Razer BlackShark V2 X USB',
  'razer-blackshark-v2-x-usb',
  'TN-RZ-BSV2X-USB',
  @razer, 1590000, 1290000,
  'https://m.media-amazon.com/images/I/61u2bKAtvCL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '240g',
  35, 1, 1, NOW(),
  'Tai nghe gaming Razer BlackShark V2 X USB, driver TriForce 50mm, 7.1 Surround Sound, micro Hyperclear.',
  '<h2>Razer BlackShark V2 X USB</h2><p>Tai nghe gaming esports Razer BlackShark V2 X với driver TriForce Titanium 50mm, âm thanh vòm 7.1 qua USB. Micro Hyperclear Cardioid tách tiếng rõ ràng trong game.</p><ul><li>Driver TriForce Titanium 50mm - bass/mid/treble tách biệt</li><li>Âm thanh vòm 7.1 Surround (USB)</li><li>Micro Hyperclear Cardioid - loại bỏ tạp âm</li><li>Đệm tai FlowKnit Memory Foam thoáng khí</li><li>Trọng lượng chỉ 240g, đeo lâu không mỏi</li><li>Tương thích PC, PS5, Nintendo Switch</li></ul>',
  'Giảm 300.000đ - Tặng mousepad Razer',
  '{"Loại":"Over-ear Gaming","Driver":"TriForce Titanium 50mm","Âm thanh":"7.1 Surround (USB)","Micro":"Hyperclear Cardioid, tháo rời","Kết nối":"USB","Đệm tai":"FlowKnit Memory Foam","Trọng lượng":"240g","Tương thích":"PC, PS5, Switch"}',
  'Tai nghe gaming Razer BlackShark V2 X USB',
  'Tai nghe gaming Razer BlackShark V2 X USB, driver TriForce 50mm, 7.1 Surround, micro Hyperclear, 240g nhẹ.',
  18
),
(
  'HyperX Cloud III Wireless',
  'hyperx-cloud-iii-wireless',
  'TN-HX-CLD3-WL',
  @hyperx, 3490000, 2790000,
  'https://m.media-amazon.com/images/I/61p0iMLkF7L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '120 giờ', '330g',
  20, 1, 1, NOW(),
  'Tai nghe gaming HyperX Cloud III Wireless, pin 120 giờ, driver 53mm DTS Headphone:X, micro noise-cancelling.',
  '<h2>HyperX Cloud III Wireless</h2><p>Tai nghe gaming không dây HyperX Cloud III với pin khủng 120 giờ. Driver gốc 53mm với DTS Headphone:X Spatial Audio, micro noise-cancelling tháo rời.</p><ul><li>Pin khủng 120 giờ - chơi game cả tuần không cần sạc</li><li>Driver gốc 53mm - âm thanh rõ ràng, chi tiết</li><li>DTS Headphone:X Spatial Audio</li><li>Micro noise-cancelling tháo rời</li><li>Kết nối 2.4GHz wireless (USB dongle)</li><li>Đệm tai memory foam bọc da nhân tạo</li></ul>',
  'Giảm 700.000đ - Trả góp 0%',
  '{"Loại":"Over-ear Gaming Wireless","Driver":"53mm","Âm thanh":"DTS Headphone:X Spatial Audio","Micro":"Noise-cancelling, tháo rời","Kết nối":"2.4GHz Wireless (USB dongle)","Pin":"120 giờ","Sạc":"USB-C","Trọng lượng":"330g","Tương thích":"PC, PS5, PS4, Switch"}',
  'Tai nghe gaming HyperX Cloud III Wireless',
  'Tai nghe gaming HyperX Cloud III Wireless, pin 120 giờ, driver 53mm, DTS Spatial Audio, micro noise-cancelling.',
  18
);

-- =====================================================
-- 10. SẢN PHẨM: MICROPHONE (category_id = 19)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Blue Yeti USB Microphone',
  'blue-yeti-usb-microphone',
  'MIC-BLUE-YETI',
  @blue, 2990000, 2490000,
  'https://m.media-amazon.com/images/I/71jJS3cMPaL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '550g',
  15, 1, 1, NOW(),
  'Microphone Blue Yeti USB, thu âm chất lượng cao, 4 pattern thu: Cardioid, Bidirectional, Omnidirectional, Stereo.',
  '<h2>Blue Yeti USB Microphone</h2><p>Blue Yeti là microphone USB huyền thoại cho streamer, podcaster và content creator. 3 capsule condenser với 4 pattern thu âm linh hoạt, chất lượng studio ngay trên bàn làm việc.</p><ul><li>3 capsule condenser - chất lượng studio</li><li>4 pattern thu: Cardioid, Bidirectional, Omnidirectional, Stereo</li><li>Kết nối USB plug-and-play, không cần driver</li><li>Điều chỉnh gain, volume, mute ngay trên mic</li><li>Jack headphone 3.5mm cho monitoring realtime</li><li>Chân đế bàn tích hợp, tương thích boom arm</li></ul>',
  'Giảm 500.000đ - Tặng pop filter',
  '{"Loại":"USB Condenser","Capsule":"3x condenser","Pattern":"4 (Cardioid, Bidirectional, Omnidirectional, Stereo)","Sample rate":"48kHz/16-bit","Tần số":"20Hz - 20kHz","Kết nối":"USB","Jack monitor":"3.5mm","Trọng lượng":"550g (không chân)"}',
  'Microphone Blue Yeti USB - Thu âm chất lượng studio',
  'Microphone Blue Yeti USB, 3 capsule condenser, 4 pattern thu âm, plug-and-play, chất lượng studio.',
  19
),
(
  'Elgato Wave:3 USB Condenser Microphone',
  'elgato-wave-3-usb-condenser-microphone',
  'MIC-ELG-WAVE3',
  @elgato, 3890000, 3290000,
  'https://m.media-amazon.com/images/I/51qNDBuSYzL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '280g',
  12, 1, 1, NOW(),
  'Microphone Elgato Wave:3, USB condenser cao cấp, 96kHz/24-bit, Clipguard chống méo tiếng, phần mềm Wave Link.',
  '<h2>Elgato Wave:3</h2><p>Microphone USB condenser cao cấp từ Elgato, thu âm 96kHz/24-bit cho chất lượng broadcast. Công nghệ Clipguard độc quyền tự động chống méo tiếng khi nói to. Tích hợp phần mềm Wave Link mixer.</p><ul><li>Thu âm 96kHz/24-bit - chất lượng broadcast</li><li>Clipguard - tự động chống méo tiếng</li><li>Capsule condenser 17mm chuyên dụng</li><li>Phần mềm Wave Link mixer tích hợp</li><li>Điều khiển cảm ứng capacitive trên mic</li><li>Tương thích OBS, Streamlabs, Discord</li></ul>',
  'Giảm 600.000đ - Tặng boom arm Elgato',
  '{"Loại":"USB Condenser","Capsule":"17mm condenser","Pattern":"Cardioid","Sample rate":"96kHz/24-bit","Tần số":"70Hz - 20kHz","Kết nối":"USB-C","Clipguard":"Có","Phần mềm":"Wave Link","Trọng lượng":"280g (không chân)"}',
  'Microphone Elgato Wave:3 USB Condenser',
  'Microphone Elgato Wave:3, USB condenser 96kHz/24-bit, Clipguard chống méo, Wave Link mixer.',
  19
);

-- =====================================================
-- 11. SẢN PHẨM: CHUỘT MÁY TÍNH (category_id = 20)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Logitech MX Master 3S',
  'logitech-mx-master-3s',
  'CM-LG-MXM3S',
  @logitech, 2490000, 1990000,
  'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '70 ngày', '141g',
  30, 1, 1, NOW(),
  'Chuột không dây Logitech MX Master 3S, cảm biến 8000 DPI, cuộn MagSpeed, kết nối 3 thiết bị, sạc USB-C.',
  '<h2>Logitech MX Master 3S</h2><p>Chuột không dây cao cấp nhất của Logitech dành cho dân văn phòng và creative. Cảm biến Darkfield 8000 DPI, cuộn MagSpeed electromagnetic cực nhanh, click yên lặng.</p><ul><li>Cảm biến Darkfield 8000 DPI - hoạt động trên mọi bề mặt kể cả kính</li><li>Cuộn MagSpeed - 1000 dòng/giây, cực êm</li><li>Quiet Click - giảm 90% tiếng click</li><li>Flow - điều khiển 3 máy tính, kéo thả file giữa các máy</li><li>Kết nối Bluetooth + USB Bolt receiver</li><li>Pin sạc USB-C, dùng 70 ngày, sạc nhanh 1 phút = 3 giờ</li></ul>',
  'Giảm 500.000đ - Tặng bàn di chuột Logitech',
  '{"Cảm biến":"Darkfield 8000 DPI","Cuộn":"MagSpeed Electromagnetic","Kết nối":"Bluetooth + USB Bolt","Số thiết bị":"3","Pin":"70 ngày (sạc USB-C)","Sạc nhanh":"1 phút = 3 giờ","Nút bấm":"7 nút (có thể tùy chỉnh)","Trọng lượng":"141g","Tương thích":"Windows, macOS, iPadOS, ChromeOS"}',
  'Chuột Logitech MX Master 3S - Cao cấp văn phòng',
  'Chuột không dây Logitech MX Master 3S, 8000 DPI, MagSpeed, Flow, pin 70 ngày, kết nối 3 thiết bị.',
  20
),
(
  'Logitech Pebble Mouse 2 M750',
  'logitech-pebble-mouse-2-m750',
  'CM-LG-PBL2-M750',
  @logitech, 790000, 590000,
  'https://m.media-amazon.com/images/I/61LPe9ewjTL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '24 tháng (pin AA)', '101g',
  50, 0, 1, NOW(),
  'Chuột không dây Logitech Pebble Mouse 2 M750, thiết kế tròn đáng yêu, Bluetooth + USB Bolt, click yên lặng.',
  '<h2>Logitech Pebble Mouse 2 M750</h2><p>Chuột không dây Logitech Pebble 2 với thiết kế tròn trịa đáng yêu, nhiều màu sắc trẻ trung. Click yên lặng, kết nối Bluetooth hoặc USB Bolt receiver, pin AA dùng 24 tháng.</p><ul><li>Thiết kế tròn trịa, nhỏ gọn, nhiều màu sắc</li><li>Click yên lặng - giảm 90% tiếng click</li><li>Bluetooth + USB Bolt - kết nối 3 thiết bị</li><li>SmartWheel - cuộn mượt mà</li><li>Pin AA dùng đến 24 tháng</li><li>Làm từ 65% nhựa tái chế</li></ul>',
  'Giảm 200.000đ - Freeship',
  '{"Cảm biến":"1000 DPI","Kết nối":"Bluetooth + USB Bolt","Số thiết bị":"3","Pin":"1x AA, 24 tháng","Click":"Yên lặng (SilentTouch)","Trọng lượng":"101g","Kích thước":"107 x 58 x 39mm","Vật liệu":"65% nhựa tái chế"}',
  'Chuột Logitech Pebble Mouse 2 M750',
  'Chuột không dây Logitech Pebble Mouse 2 M750, thiết kế tròn, click yên lặng, Bluetooth, pin 24 tháng.',
  20
),
(
  'Rapoo M650 Silent Chuột không dây',
  'rapoo-m650-silent-chuot-khong-day',
  'CM-RPO-M650',
  @rapoo, 290000, 229000,
  'https://m.media-amazon.com/images/I/51r1XTGEL0L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '12 tháng (pin AA)', '75g',
  100, 0, 1, NOW(),
  'Chuột không dây Rapoo M650 Silent, click yên lặng, Bluetooth 5.0 + 2.4GHz, thiết kế mỏng nhẹ.',
  '<h2>Rapoo M650 Silent</h2><p>Chuột không dây giá rẻ Rapoo M650 với thiết kế mỏng nhẹ và click yên lặng. Kết nối kép Bluetooth 5.0 và 2.4GHz, chuyển đổi nhanh giữa 3 thiết bị.</p><ul><li>Click yên lặng - phù hợp văn phòng, thư viện</li><li>Kết nối kép: Bluetooth 5.0 + 2.4GHz dongle</li><li>Chuyển đổi nhanh 3 thiết bị</li><li>DPI 1300 - phù hợp văn phòng</li><li>Pin AA dùng 12 tháng</li><li>Thiết kế mỏng 26mm, trọng lượng chỉ 75g</li></ul>',
  'Giảm 61.000đ - Mua 2 giảm thêm 10%',
  '{"Cảm biến":"1300 DPI","Kết nối":"Bluetooth 5.0 + 2.4GHz","Số thiết bị":"3","Pin":"1x AA, 12 tháng","Click":"Yên lặng","Trọng lượng":"75g","Kích thước":"107 x 60 x 26mm"}',
  'Chuột không dây Rapoo M650 Silent',
  'Chuột không dây Rapoo M650 Silent, click yên lặng, Bluetooth + 2.4GHz, 3 thiết bị, pin 12 tháng, 75g.',
  20
);

-- =====================================================
-- 12. SẢN PHẨM: BÀN PHÍM (category_id = 21)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Logitech MX Keys S Wireless',
  'logitech-mx-keys-s-wireless',
  'BP-LG-MXKS',
  @logitech, 2790000, 2290000,
  'https://m.media-amazon.com/images/I/71gOLpXMNlL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '10 ngày (có đèn) / 5 tháng (tắt đèn)', '506g',
  20, 1, 1, NOW(),
  'Bàn phím không dây Logitech MX Keys S, phím low-profile, Smart Backlight, kết nối 3 thiết bị, sạc USB-C.',
  '<h2>Logitech MX Keys S</h2><p>Bàn phím không dây cao cấp Logitech MX Keys S dành cho dân văn phòng chuyên nghiệp. Phím low-profile với lõm hình cầu cho cảm giác gõ chính xác. Smart Backlight tự điều chỉnh sáng theo môi trường.</p><ul><li>Phím low-profile, lõm hình cầu - gõ chính xác, êm ái</li><li>Smart Backlight - tự sáng khi tay đến gần</li><li>Flow - làm việc liền mạch giữa 3 máy tính</li><li>Kết nối Bluetooth + USB Bolt</li><li>Pin sạc USB-C, 10 ngày có đèn / 5 tháng tắt đèn</li><li>Tương thích Windows, macOS, ChromeOS</li></ul>',
  'Giảm 500.000đ - Combo MX Master 3S giảm thêm 300K',
  '{"Loại":"Low-profile Membrane","Kết nối":"Bluetooth + USB Bolt","Số thiết bị":"3","Đèn nền":"Smart Backlight (tự động)","Pin":"10 ngày (có đèn), 5 tháng (tắt đèn)","Sạc":"USB-C","Layout":"Full-size","Trọng lượng":"506g","Tương thích":"Windows, macOS, iPadOS, ChromeOS"}',
  'Bàn phím Logitech MX Keys S Wireless',
  'Bàn phím không dây Logitech MX Keys S, phím low-profile, Smart Backlight, Flow, sạc USB-C, 3 thiết bị.',
  21
),
(
  'Razer DeathStalker V2 Pro TKL',
  'razer-deathstalker-v2-pro-tkl',
  'BP-RZ-DSV2P-TKL',
  @razer, 4990000, 3990000,
  'https://m.media-amazon.com/images/I/61Pu-LXLG7L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '200 giờ', '603g',
  15, 1, 1, NOW(),
  'Bàn phím gaming không dây Razer DeathStalker V2 Pro TKL, switch quang học low-profile, HyperSpeed Wireless.',
  '<h2>Razer DeathStalker V2 Pro TKL</h2><p>Bàn phím gaming không dây cao cấp Razer với switch quang học low-profile siêu nhanh. HyperSpeed Wireless độ trễ cực thấp, Razer Chroma RGB 16.8 triệu màu.</p><ul><li>Switch quang học Low-Profile - actuation 1.2mm siêu nhanh</li><li>HyperSpeed Wireless - độ trễ cực thấp cho gaming</li><li>Bluetooth + USB-C có dây</li><li>Razer Chroma RGB - 16.8 triệu màu</li><li>Pin 200 giờ (tắt đèn), sạc USB-C</li><li>Layout TKL gọn gàng cho gaming</li></ul>',
  'Giảm 1.000.000đ - Trả góp 0%',
  '{"Loại":"Low-profile Optical","Switch":"Razer Optical (actuation 1.2mm)","Kết nối":"HyperSpeed 2.4GHz + Bluetooth + USB-C","Đèn nền":"Razer Chroma RGB","Pin":"200 giờ (tắt đèn)","Layout":"TKL (Tenkeyless)","Trọng lượng":"603g","N-Key Rollover":"Có"}',
  'Bàn phím gaming Razer DeathStalker V2 Pro TKL',
  'Bàn phím gaming Razer DeathStalker V2 Pro TKL, switch quang học, HyperSpeed Wireless, Chroma RGB.',
  21
);

-- =====================================================
-- 13. SẢN PHẨM: ĐẾ TẢN NHIỆT (category_id = 22)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Đế tản nhiệt laptop Baseus ThermoCool Heat-Dissipating',
  'de-tan-nhiet-baseus-thermocool',
  'DTN-BS-THERM',
  @baseus, 990000, 790000,
  'https://m.media-amazon.com/images/I/61q3X3MHYVL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '740g',
  25, 1, 1, NOW(),
  'Đế tản nhiệt laptop Baseus ThermoCool với quạt Turbo, giảm nhiệt đến 15°C, tương thích laptop 15-21 inch.',
  '<h2>Baseus ThermoCool Heat-Dissipating</h2><p>Đế tản nhiệt cao cấp Baseus với quạt Turbo tốc độ cao giúp giảm nhiệt độ laptop đến 15°C. Tương thích laptop từ 15 đến 21 inch, điều chỉnh 2 mức nghiêng.</p><ul><li>Quạt Turbo - giảm nhiệt đến 15°C</li><li>2 chế độ quạt: Bình thường & Turbo</li><li>Tương thích laptop 15 - 21 inch</li><li>2 mức nghiêng ergonomic</li><li>Thiết kế lưới kim loại tản nhiệt hiệu quả</li><li>Nguồn USB, không cần adapter riêng</li></ul>',
  'Giảm 200.000đ',
  '{"Quạt":"Turbo Fan","Giảm nhiệt":"Đến 15°C","Tương thích":"Laptop 15 - 21 inch","Mức nghiêng":"2 mức","Nguồn":"USB","Chất liệu":"Lưới kim loại + ABS","Trọng lượng":"740g"}',
  'Đế tản nhiệt Baseus ThermoCool',
  'Đế tản nhiệt laptop Baseus ThermoCool, quạt Turbo giảm 15°C, laptop 15-21 inch, 2 mức nghiêng.',
  22
);

-- =====================================================
-- 14. SẢN PHẨM: TÚI CHỐNG SỐC (category_id = 23)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Túi chống sốc Tomtoc Defender-A13 Laptop 14 inch',
  'tui-chong-soc-tomtoc-defender-a13-14-inch',
  'TCS-TT-A13-14',
  @tomtoc, 690000, 550000,
  'https://m.media-amazon.com/images/I/71Z3NddUqaL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '340g',
  40, 1, 1, NOW(),
  'Túi chống sốc Tomtoc Defender-A13 cho laptop 14 inch, bảo vệ 360° CornerArmor, chống nước, ngăn phụ kiện.',
  '<h2>Tomtoc Defender-A13 Laptop Sleeve 14"</h2><p>Túi chống sốc cao cấp Tomtoc Defender-A13 với công nghệ CornerArmor bảo vệ 360° cho laptop 14 inch. Vải chống nước, khóa kéo YKK bền bỉ, ngăn phụ kiện tiện lợi.</p><ul><li>CornerArmor - bảo vệ 4 góc va đập</li><li>Bảo vệ 360° toàn diện</li><li>Vải polyester chống nước, chống bụi</li><li>Khóa kéo YKK chất lượng cao</li><li>Ngăn phụ kiện phía trước</li><li>Tương thích MacBook Pro 14, Laptop 14 inch</li></ul>',
  'Giảm 140.000đ - Freeship',
  '{"Tương thích":"Laptop 14 inch, MacBook Pro 14","Bảo vệ":"CornerArmor 360°","Chất liệu":"Polyester chống nước","Khóa":"YKK","Ngăn phụ kiện":"Có - 1 ngăn phía trước","Trọng lượng":"340g","Kích thước":"362 x 256 x 30mm"}',
  'Túi chống sốc Tomtoc Defender-A13 14 inch',
  'Túi chống sốc Tomtoc Defender-A13, laptop 14 inch, CornerArmor 360°, chống nước, khóa YKK.',
  23
);

-- =====================================================
-- 15. SẢN PHẨM: HUB USB (category_id = 24)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Ugreen Revodok Pro 10-in-1 USB-C Hub',
  'ugreen-revodok-pro-10-in-1-usb-c-hub',
  'HUB-UG-RVD10',
  @ugreen, 1590000, 1290000,
  'https://m.media-amazon.com/images/I/61f+RobSa7L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '170g',
  30, 1, 1, NOW(),
  'Hub USB-C Ugreen Revodok Pro 10-in-1, HDMI 4K@60Hz, Ethernet 1Gbps, USB 3.0, PD 100W, SD/TF.',
  '<h2>Ugreen Revodok Pro 10-in-1</h2><p>Hub USB-C đa năng Ugreen Revodok Pro với 10 cổng kết nối, biến 1 cổng USB-C thành trạm làm việc hoàn chỉnh. HDMI 4K@60Hz, Ethernet 1Gbps, sạc PD 100W.</p><ul><li>HDMI 4K@60Hz - xuất hình ảnh sắc nét</li><li>Ethernet RJ45 1Gbps - mạng ổn định</li><li>3x USB-A 3.0 + 1x USB-C 3.0</li><li>PD 100W Pass-Through Charging</li><li>Đầu đọc SD + TF (Micro SD)</li><li>Vỏ nhôm tản nhiệt tốt</li></ul>',
  'Giảm 300.000đ - Tặng cáp USB-C',
  '{"Cổng":"10 cổng","HDMI":"4K@60Hz","Ethernet":"RJ45 1Gbps","USB-A":"3x USB 3.0","USB-C":"1x USB 3.0 + 1x PD 100W","Đọc thẻ":"SD + TF","Chất liệu":"Vỏ nhôm","Trọng lượng":"170g","Tương thích":"MacBook, iPad Pro, Windows, ChromeOS"}',
  'Hub USB-C Ugreen Revodok Pro 10-in-1',
  'Hub USB-C Ugreen Revodok Pro 10-in-1, HDMI 4K 60Hz, Ethernet 1Gbps, USB 3.0, PD 100W, SD/TF.',
  24
),
(
  'Anker PowerExpand 8-in-1 USB-C Hub',
  'anker-powerexpand-8-in-1-usb-c-hub',
  'HUB-ANK-PE8',
  @anker, 1390000, 1090000,
  'https://m.media-amazon.com/images/I/61CaSyXPOBL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '155g',
  25, 0, 1, NOW(),
  'Hub USB-C Anker PowerExpand 8-in-1, HDMI 4K@30Hz, Ethernet 1Gbps, 2x USB-A 3.0, PD 85W.',
  '<h2>Anker PowerExpand 8-in-1</h2><p>Hub USB-C Anker PowerExpand 8-in-1 với đầy đủ cổng kết nối cần thiết cho công việc hàng ngày. HDMI 4K, Ethernet Gigabit, sạc PD 85W pass-through.</p><ul><li>HDMI 4K@30Hz</li><li>Ethernet RJ45 1Gbps</li><li>2x USB-A 3.0 + 1x USB-C Data</li><li>PD 85W Pass-Through</li><li>Đọc thẻ SD + Micro SD</li><li>Thiết kế thanh mảnh, vỏ nhôm</li></ul>',
  'Giảm 300.000đ',
  '{"Cổng":"8 cổng","HDMI":"4K@30Hz","Ethernet":"RJ45 1Gbps","USB-A":"2x USB 3.0","USB-C":"1x PD 85W","Đọc thẻ":"SD + Micro SD","Chất liệu":"Vỏ nhôm","Trọng lượng":"155g"}',
  'Hub USB-C Anker PowerExpand 8-in-1',
  'Hub USB-C Anker PowerExpand 8-in-1, HDMI 4K, Ethernet 1Gbps, USB 3.0, PD 85W, đọc thẻ SD.',
  24
);

-- =====================================================
-- 16. SẢN PHẨM: USB (category_id = 28)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'SanDisk Ultra Dual Drive Go USB Type-C 128GB',
  'sandisk-ultra-dual-drive-go-usb-c-128gb',
  'USB-SD-UDDG-128',
  @sandisk, 290000, 220000,
  'https://m.media-amazon.com/images/I/61FJjVmGDBL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '3.8g',
  80, 1, 1, NOW(),
  'USB SanDisk Ultra Dual Drive Go 128GB, 2 đầu USB-C + USB-A, tốc độ đọc 150MB/s, xoay 360°.',
  '<h2>SanDisk Ultra Dual Drive Go 128GB</h2><p>USB 2 đầu SanDisk với cổng USB-C và USB-A, tương thích mọi thiết bị. Tốc độ đọc lên đến 150MB/s, thiết kế xoay 360° nhỏ gọn.</p><ul><li>Dung lượng 128GB</li><li>2 đầu: USB-C + USB-A 3.1 Gen 1</li><li>Tốc độ đọc 150MB/s</li><li>Thiết kế xoay 360° - không lo mất nắp</li><li>Tương thích smartphone, tablet, laptop, PC</li></ul>',
  'Giảm 70.000đ',
  '{"Dung lượng":"128GB","Cổng":"USB-C + USB-A 3.1 Gen 1","Tốc độ đọc":"150MB/s","Thiết kế":"Xoay 360°","Trọng lượng":"3.8g","Kích thước":"33 x 13 x 7mm"}',
  'USB SanDisk Ultra Dual Drive Go 128GB USB-C',
  'USB SanDisk Ultra Dual Drive Go 128GB, 2 đầu USB-C + USB-A, tốc độ đọc 150MB/s, xoay 360°.',
  28
),
(
  'Kingston DataTraveler Max USB-C 256GB',
  'kingston-datatraveler-max-usb-c-256gb',
  'USB-KST-DTM-256',
  @kingston, 890000, 690000,
  'https://m.media-amazon.com/images/I/61XAm5ynz+L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '12g',
  40, 1, 1, NOW(),
  'USB Kingston DataTraveler Max 256GB USB-C 3.2 Gen 2, tốc độ đọc 1000MB/s, ghi 900MB/s.',
  '<h2>Kingston DataTraveler Max 256GB</h2><p>USB siêu nhanh Kingston DataTraveler Max với giao tiếp USB 3.2 Gen 2, tốc độ đọc lên đến 1000MB/s và ghi 900MB/s. Thiết kế trượt tiện lợi với móc khóa.</p><ul><li>Dung lượng 256GB</li><li>USB 3.2 Gen 2 - tốc độ đọc 1000MB/s, ghi 900MB/s</li><li>Thiết kế trượt - không lo mất nắp</li><li>Móc khóa tích hợp</li><li>LED hiển thị trạng thái hoạt động</li></ul>',
  'Giảm 200.000đ - Flash Sale',
  '{"Dung lượng":"256GB","Giao tiếp":"USB 3.2 Gen 2 (USB-C)","Tốc độ đọc":"1000MB/s","Tốc độ ghi":"900MB/s","Thiết kế":"Trượt + Móc khóa","Trọng lượng":"12g","Kích thước":"82 x 22 x 9mm"}',
  'USB Kingston DataTraveler Max 256GB USB-C',
  'USB Kingston DataTraveler Max 256GB, USB 3.2 Gen 2, đọc 1000MB/s, ghi 900MB/s, thiết kế trượt.',
  28
);

-- =====================================================
-- 17. SẢN PHẨM: Ổ CỨNG DI ĐỘNG (category_id = 29)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Samsung T7 Shield Portable SSD 1TB',
  'samsung-t7-shield-portable-ssd-1tb',
  'SSD-SS-T7S-1TB',
  @samsung, 2890000, 2290000,
  'https://m.media-amazon.com/images/I/81LswTpWiHL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '98g',
  20, 1, 1, NOW(),
  'Ổ cứng di động Samsung T7 Shield 1TB, SSD NVMe, tốc độ 1050MB/s, chống nước IP65, chống rơi 3m.',
  '<h2>Samsung T7 Shield Portable SSD 1TB</h2><p>Ổ cứng di động SSD Samsung T7 Shield với tốc độ NVMe lên đến 1050MB/s. Vỏ cao su bền bỉ, chống nước chống bụi IP65, chịu rơi từ 3m.</p><ul><li>Dung lượng 1TB</li><li>Tốc độ đọc 1050MB/s, ghi 1000MB/s (USB 3.2 Gen 2)</li><li>Chống nước, chống bụi IP65</li><li>Chịu rơi từ 3m</li><li>Mã hóa AES 256-bit bảo mật dữ liệu</li><li>Nhỏ gọn, nặng chỉ 98g</li></ul>',
  'Giảm 600.000đ - Tặng túi đựng ổ cứng',
  '{"Dung lượng":"1TB","Loại":"NVMe SSD","Tốc độ đọc":"1050MB/s","Tốc độ ghi":"1000MB/s","Giao tiếp":"USB 3.2 Gen 2 (USB-C)","Chống nước":"IP65","Chịu rơi":"3m","Mã hóa":"AES 256-bit","Trọng lượng":"98g","Kích thước":"88 x 59 x 13mm"}',
  'Ổ cứng di động Samsung T7 Shield 1TB SSD',
  'Ổ cứng di động Samsung T7 Shield 1TB, SSD NVMe 1050MB/s, chống nước IP65, chống rơi 3m, 98g.',
  29
),
(
  'Seagate One Touch HDD 2TB',
  'seagate-one-touch-hdd-2tb',
  'HDD-SG-OT-2TB',
  @seagate, 1690000, 1390000,
  'https://m.media-amazon.com/images/I/81c4OibqVuL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '149g',
  30, 0, 1, NOW(),
  'Ổ cứng di động Seagate One Touch 2TB HDD, thiết kế vải cao cấp, USB 3.0, tương thích Mac & PC.',
  '<h2>Seagate One Touch HDD 2TB</h2><p>Ổ cứng di động Seagate One Touch 2TB với thiết kế vỏ vải cao cấp sang trọng. Dung lượng lớn phù hợp lưu trữ dữ liệu, phim, ảnh. Tặng kèm Rescue Data Recovery Services.</p><ul><li>Dung lượng 2TB</li><li>USB 3.0 - tương thích USB 2.0</li><li>Thiết kế vỏ vải cao cấp, nhiều màu sắc</li><li>Tương thích Windows & macOS (cần format lại)</li><li>Tặng Seagate Rescue Data Recovery Services 3 năm</li><li>Nhỏ gọn, dễ mang theo</li></ul>',
  'Giảm 300.000đ - Tặng bao da',
  '{"Dung lượng":"2TB","Loại":"HDD 2.5 inch","Giao tiếp":"USB 3.0","Tốc độ quay":"5400rpm","Thiết kế":"Vỏ vải cao cấp","Trọng lượng":"149g","Kích thước":"78 x 115 x 12mm","Bảo hành":"3 năm + Rescue Data Recovery"}',
  'Ổ cứng di động Seagate One Touch 2TB',
  'Ổ cứng di động Seagate One Touch 2TB, HDD USB 3.0, thiết kế vải cao cấp, Rescue Data Recovery 3 năm.',
  29
);

-- =====================================================
-- 18. SẢN PHẨM: BỘ PHÁT WIFI (category_id = 30)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'TP-Link Archer AX73 Router WiFi 6 AX5400',
  'tp-link-archer-ax73-wifi-6-ax5400',
  'WIFI-TPL-AX73',
  @tplink, 2190000, 1690000,
  'https://m.media-amazon.com/images/I/61WFLqP6x-L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '540g',
  20, 1, 1, NOW(),
  'Router WiFi 6 TP-Link Archer AX73 AX5400, 6 ăng-ten, phủ sóng 230m², kết nối 200+ thiết bị, USB 3.0.',
  '<h2>TP-Link Archer AX73 WiFi 6 AX5400</h2><p>Router WiFi 6 TP-Link Archer AX73 với tốc độ lên đến 5400Mbps (4804Mbps 5GHz + 574Mbps 2.4GHz). 6 ăng-ten bên ngoài phủ sóng diện tích lên đến 230m², kết nối đồng thời 200+ thiết bị.</p><ul><li>WiFi 6 AX5400 - tốc độ siêu nhanh</li><li>6 ăng-ten bên ngoài - phủ sóng 230m²</li><li>OFDMA + MU-MIMO - kết nối 200+ thiết bị</li><li>CPU 3 nhân 1.5GHz - xử lý mạnh mẽ</li><li>Cổng USB 3.0 - chia sẻ file mạng</li><li>TP-Link HomeShield bảo mật mạng</li></ul>',
  'Giảm 500.000đ - Tặng cáp mạng Cat6',
  '{"Chuẩn WiFi":"WiFi 6 (802.11ax)","Tốc độ":"AX5400 (5GHz: 4804Mbps, 2.4GHz: 574Mbps)","Ăng-ten":"6 ăng-ten bên ngoài","Phủ sóng":"230m²","Thiết bị":"200+ đồng thời","CPU":"3 nhân 1.5GHz","Cổng LAN":"4x Gigabit","Cổng WAN":"1x Gigabit","USB":"1x USB 3.0"}',
  'Router TP-Link Archer AX73 WiFi 6 AX5400',
  'Router WiFi 6 TP-Link Archer AX73 AX5400, 6 ăng-ten, phủ sóng 230m², 200+ thiết bị, USB 3.0.',
  30
),
(
  'Xiaomi Router AX3000T WiFi 6',
  'xiaomi-router-ax3000t-wifi-6',
  'WIFI-XM-AX3000T',
  @xiaomi, 690000, 490000,
  'https://m.media-amazon.com/images/I/41DshpJGdiL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '420g',
  40, 1, 1, NOW(),
  'Router WiFi 6 Xiaomi AX3000T, tốc độ 3000Mbps, 4 ăng-ten, Mesh networking, giá siêu rẻ.',
  '<h2>Xiaomi Router AX3000T WiFi 6</h2><p>Router WiFi 6 giá rẻ nhất phân khúc từ Xiaomi với tốc độ AX3000 (2402Mbps 5GHz + 574Mbps 2.4GHz). Hỗ trợ Mesh networking, 4 ăng-ten, 3 cổng Gigabit LAN.</p><ul><li>WiFi 6 AX3000 - giá siêu rẻ</li><li>4 ăng-ten bên ngoài</li><li>Mesh Networking - ghép nhiều router mở rộng phủ sóng</li><li>128 thiết bị kết nối đồng thời</li><li>3 cổng Gigabit LAN + 1 WAN</li><li>Quản lý qua app Xiaomi Home</li></ul>',
  'Giảm 200.000đ - Flash Sale',
  '{"Chuẩn WiFi":"WiFi 6 (802.11ax)","Tốc độ":"AX3000 (5GHz: 2402Mbps, 2.4GHz: 574Mbps)","Ăng-ten":"4 ăng-ten bên ngoài","Mesh":"Có hỗ trợ","Thiết bị":"128 đồng thời","Cổng LAN":"3x Gigabit","Cổng WAN":"1x Gigabit","CPU":"MediaTek Filogic 820"}',
  'Router Xiaomi AX3000T WiFi 6',
  'Router WiFi 6 Xiaomi AX3000T, tốc độ 3000Mbps, Mesh networking, 4 ăng-ten, giá siêu rẻ.',
  30
);

-- =====================================================
-- 19. SẢN PHẨM: USB WIFI (category_id = 31)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'TP-Link Archer T3U Plus USB WiFi AC1300',
  'tp-link-archer-t3u-plus-usb-wifi-ac1300',
  'USBW-TPL-T3UP',
  @tplink, 390000, 290000,
  'https://m.media-amazon.com/images/I/41RuJVQ69bL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '20g',
  50, 0, 1, NOW(),
  'USB WiFi TP-Link Archer T3U Plus AC1300, ăng-ten ngoài tăng thu sóng, MU-MIMO, tương thích Windows/Mac.',
  '<h2>TP-Link Archer T3U Plus AC1300</h2><p>USB WiFi TP-Link Archer T3U Plus với tốc độ AC1300 (867Mbps 5GHz + 400Mbps 2.4GHz). Ăng-ten bên ngoài cao tăng thu sóng, MU-MIMO cho kết nối ổn định.</p><ul><li>Tốc độ AC1300 (5GHz + 2.4GHz)</li><li>Ăng-ten bên ngoài cao - tăng thu sóng mạnh</li><li>MU-MIMO - kết nối ổn định</li><li>USB 3.0 - tốc độ truyền nhanh</li><li>Tương thích Windows, macOS, Linux</li></ul>',
  'Giảm 100.000đ',
  '{"Chuẩn WiFi":"WiFi 5 (802.11ac)","Tốc độ":"AC1300 (5GHz: 867Mbps, 2.4GHz: 400Mbps)","Ăng-ten":"1 ăng-ten bên ngoài","Giao tiếp":"USB 3.0","MU-MIMO":"Có","Tương thích":"Windows 11/10/8.1/8/7, macOS, Linux"}',
  'USB WiFi TP-Link Archer T3U Plus AC1300',
  'USB WiFi TP-Link Archer T3U Plus AC1300, ăng-ten ngoài, USB 3.0, MU-MIMO, tương thích Win/Mac.',
  31
);

-- =====================================================
-- 20. SẢN PHẨM: CÁP MẠNG (category_id = 32)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Cáp mạng Ugreen Cat 8 Ethernet 3m',
  'cap-mang-ugreen-cat-8-ethernet-3m',
  'NET-UG-CAT8-3M',
  @ugreen, 190000, 150000,
  'https://m.media-amazon.com/images/I/61pIR49eVzL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '120g',
  100, 0, 1, NOW(),
  'Cáp mạng Ugreen Cat 8 Ethernet dài 3m, tốc độ 40Gbps, dây bện nylon bền bỉ, đầu RJ45 mạ vàng.',
  '<h2>Ugreen Cat 8 Ethernet Cable 3m</h2><p>Cáp mạng Cat 8 cao cấp từ Ugreen với tốc độ lên đến 40Gbps, băng thông 2000MHz. Dây bện nylon chống rối, đầu RJ45 mạ vàng 24K chống oxy hóa.</p><ul><li>Cat 8 - tốc độ 40Gbps, băng thông 2000MHz</li><li>Dây bện nylon chống rối, bền bỉ</li><li>Đầu RJ45 mạ vàng 24K</li><li>Chống nhiễu S/FTP kép</li><li>Chiều dài 3m - phù hợp gia đình, văn phòng</li><li>Tương thích ngược Cat 7/6a/6/5e/5</li></ul>',
  'Mua 2 giảm 15%',
  '{"Chuẩn":"Cat 8","Tốc độ":"40Gbps","Băng thông":"2000MHz","Chiều dài":"3m","Chống nhiễu":"S/FTP","Đầu nối":"RJ45 mạ vàng 24K","Chất liệu dây":"Bện nylon","Tương thích":"Cat 7/6a/6/5e/5"}',
  'Cáp mạng Ugreen Cat 8 Ethernet 3m',
  'Cáp mạng Ugreen Cat 8, 40Gbps, 3m, dây bện nylon, đầu RJ45 mạ vàng, chống nhiễu S/FTP.',
  32
);

-- =====================================================
-- 21. SẢN PHẨM: CAMERA WIFI (category_id = 33)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Xiaomi Camera C200 Home Security 1080p',
  'xiaomi-camera-c200-home-security-1080p',
  'CAM-XM-C200',
  @xiaomi, 590000, 390000,
  'https://m.media-amazon.com/images/I/41GJzRqjtvL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '120g',
  50, 1, 1, NOW(),
  'Camera WiFi Xiaomi C200, 1080p Full HD, xoay 360°, AI phát hiện người, hồng ngoại ban đêm, đàm thoại 2 chiều.',
  '<h2>Xiaomi Camera C200 Home Security</h2><p>Camera giám sát WiFi Xiaomi C200 với độ phân giải 1080p Full HD, xoay 360° quan sát toàn cảnh. AI phát hiện người thông minh, hồng ngoại ban đêm rõ nét, đàm thoại 2 chiều.</p><ul><li>1080p Full HD - hình ảnh rõ nét</li><li>Xoay 360° (ngang) + 108° (dọc)</li><li>AI phát hiện người - thông báo tức thì</li><li>Hồng ngoại ban đêm đến 10m</li><li>Đàm thoại 2 chiều</li><li>Lưu trữ MicroSD (tối đa 256GB) hoặc Cloud</li><li>Quản lý qua app Xiaomi Home</li></ul>',
  'Giảm 200.000đ - Tặng thẻ nhớ 32GB',
  '{"Độ phân giải":"1080p Full HD","Xoay":"360° ngang, 108° dọc","AI":"Phát hiện người","Hồng ngoại":"Đến 10m","Đàm thoại":"2 chiều","Lưu trữ":"MicroSD (max 256GB) / Cloud","Kết nối":"WiFi 2.4GHz","App":"Xiaomi Home"}',
  'Camera WiFi Xiaomi C200 1080p',
  'Camera WiFi Xiaomi C200, 1080p Full HD, xoay 360°, AI phát hiện người, hồng ngoại, đàm thoại 2 chiều.',
  33
),
(
  'TP-Link Tapo C210 Camera WiFi 3MP',
  'tp-link-tapo-c210-camera-wifi-3mp',
  'CAM-TPL-C210',
  @tplink, 690000, 490000,
  'https://m.media-amazon.com/images/I/41B8VCXjjBL._AC_SL1000_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '147g',
  35, 0, 1, NOW(),
  'Camera WiFi TP-Link Tapo C210, 3MP Super HD, xoay 360°, phát hiện chuyển động, hồng ngoại 9m.',
  '<h2>TP-Link Tapo C210</h2><p>Camera giám sát WiFi TP-Link Tapo C210 với độ phân giải 3MP Super HD (2304x1296), hình ảnh sắc nét hơn 1080p. Xoay 360°, phát hiện chuyển động thông minh, hồng ngoại 9m.</p><ul><li>3MP Super HD (2304x1296) - sắc nét hơn 1080p</li><li>Xoay 360° (ngang) + 114° (dọc)</li><li>Phát hiện chuyển động + phát hiện người</li><li>Hồng ngoại đến 9m</li><li>Đàm thoại 2 chiều</li><li>Tương thích Alexa, Google Assistant</li><li>Lưu trữ MicroSD max 256GB</li></ul>',
  'Giảm 200.000đ',
  '{"Độ phân giải":"3MP (2304x1296)","Xoay":"360° ngang, 114° dọc","Phát hiện":"Chuyển động + Người","Hồng ngoại":"Đến 9m","Đàm thoại":"2 chiều","Lưu trữ":"MicroSD (max 256GB)","Kết nối":"WiFi 2.4GHz","Smart Home":"Alexa, Google Assistant","App":"Tapo"}',
  'Camera WiFi TP-Link Tapo C210 3MP',
  'Camera WiFi TP-Link Tapo C210, 3MP Super HD, xoay 360°, phát hiện chuyển động, Alexa, Google.',
  33
);

-- =====================================================
-- 22. SẢN PHẨM: TAY CẦM CHƠI GAME (category_id = 25)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Sony DualSense Wireless Controller PS5',
  'sony-dualsense-wireless-controller-ps5',
  'GM-SONY-DS-PS5',
  @sony, 1790000, 1490000,
  'https://m.media-amazon.com/images/I/61lYIKPieDL._SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '12 giờ', '280g',
  25, 1, 1, NOW(),
  'Tay cầm chơi game Sony DualSense PS5, phản hồi xúc giác Haptic, Adaptive Trigger, micro tích hợp.',
  '<h2>Sony DualSense Wireless Controller</h2><p>Tay cầm chơi game không dây Sony DualSense cho PS5 với công nghệ Haptic Feedback và Adaptive Trigger mang lại cảm giác chơi game chân thực nhất. Micro và loa tích hợp, cổng USB-C.</p><ul><li>Haptic Feedback - phản hồi xúc giác đa dạng</li><li>Adaptive Trigger - lực nhấn nút L2/R2 thay đổi theo game</li><li>Micro và loa tích hợp</li><li>Cảm biến chuyển động 6 trục</li><li>Pin sạc USB-C, dùng 12 giờ</li><li>Tương thích PS5 + PC (qua Bluetooth/USB)</li></ul>',
  'Giảm 300.000đ - Tặng grip bảo vệ analog',
  '{"Kết nối":"Bluetooth 5.1 + USB-C","Haptic Feedback":"Có","Adaptive Trigger":"Có","Micro":"Tích hợp","Loa":"Tích hợp","Cảm biến":"Gyroscope + Accelerometer 6 trục","Pin":"12 giờ (sạc USB-C)","Trọng lượng":"280g","Tương thích":"PS5, PC"}',
  'Tay cầm Sony DualSense PS5 - Chính hãng',
  'Tay cầm Sony DualSense PS5, Haptic Feedback, Adaptive Trigger, micro tích hợp, pin 12h, Bluetooth.',
  25
),
(
  '8BitDo Ultimate C 2.4G Wireless Controller',
  '8bitdo-ultimate-c-2-4g-wireless-controller',
  'GM-8BD-ULTC',
  @bitdo, 690000, 550000,
  'https://m.media-amazon.com/images/I/61bJQhENuHL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '25 giờ', '220g',
  30, 0, 1, NOW(),
  'Tay cầm chơi game 8BitDo Ultimate C, kết nối 2.4GHz wireless, tương thích PC/Android/Steam Deck, pin 25 giờ.',
  '<h2>8BitDo Ultimate C 2.4G Wireless</h2><p>Tay cầm chơi game giá rẻ chất lượng cao từ 8BitDo. Kết nối 2.4GHz wireless với dongle USB, tương thích PC, Android, Steam Deck. Pin khủng 25 giờ sử dụng.</p><ul><li>Kết nối 2.4GHz - độ trễ thấp với USB dongle</li><li>Tương thích PC, Android, Steam Deck, Raspberry Pi</li><li>Rumble vibration motor kép</li><li>Thiết kế ergonomic, grip thoải mái</li><li>Pin 25 giờ sử dụng, sạc USB-C</li><li>Hall Effect joystick - không bị drift</li></ul>',
  'Giảm 140.000đ',
  '{"Kết nối":"2.4GHz Wireless (USB dongle)","Rung":"Dual rumble motors","Joystick":"Hall Effect","Pin":"25 giờ (sạc USB-C)","Trọng lượng":"220g","Tương thích":"PC, Android, Steam Deck, Raspberry Pi"}',
  'Tay cầm 8BitDo Ultimate C 2.4G',
  'Tay cầm 8BitDo Ultimate C, 2.4GHz wireless, Hall Effect joystick, pin 25h, PC/Android/Steam Deck.',
  25
);

-- =====================================================
-- 23. SẢN PHẨM: GIÁ TREO TAI NGHE (category_id = 26)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Corsair ST100 RGB Premium Headset Stand',
  'corsair-st100-rgb-premium-headset-stand',
  'GM-CRS-ST100',
  @corsair, 1590000, 1190000,
  'https://m.media-amazon.com/images/I/71kLkWvVJ0L._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, NULL, '290g',
  15, 1, 1, NOW(),
  'Giá treo tai nghe Corsair ST100 RGB, đèn LED RGB 2 zone, DAC 7.1 surround, cổng USB 3.1 pass-through.',
  '<h2>Corsair ST100 RGB Premium Headset Stand</h2><p>Giá treo tai nghe cao cấp Corsair ST100 với đèn LED RGB 2 zone có thể tùy chỉnh qua iCUE. Tích hợp DAC 7.1 surround, cổng USB 3.1 pass-through, jack 3.5mm.</p><ul><li>Đèn LED RGB 2 zone - tùy chỉnh qua Corsair iCUE</li><li>DAC 7.1 Surround Sound tích hợp</li><li>Cổng USB 3.1 pass-through</li><li>Jack 3.5mm cho tai nghe/loa</li><li>Chân đế cao su chống trượt</li><li>Thiết kế nhôm cao cấp</li></ul>',
  'Giảm 400.000đ - Tặng mousepad Corsair',
  '{"Đèn":"RGB 2 zone (iCUE)","DAC":"7.1 Surround Sound","Cổng USB":"1x USB 3.1 Pass-through","Audio":"Jack 3.5mm","Chất liệu":"Nhôm + Cao su","Trọng lượng":"290g","Chiều cao":"250mm"}',
  'Giá treo tai nghe Corsair ST100 RGB',
  'Giá treo tai nghe Corsair ST100 RGB, DAC 7.1, USB 3.1 pass-through, đèn RGB iCUE, chất liệu nhôm.',
  26
);

-- =====================================================
-- 24. SẢN PHẨM: CHUỘT GAMING (category_id = 27)
-- =====================================================
INSERT INTO product (name, slug, sku, brand_id, price, sale_price, image, cpu, ram, ssd, screen, vga, battery, weight, stock, featured, active, created_at, description, content, promotion, specs, meta_title, meta_description, category_id) VALUES
(
  'Razer DeathAdder V3 HyperSpeed Wireless',
  'razer-deathadder-v3-hyperspeed-wireless',
  'GM-RZ-DAV3-HS',
  @razer, 2490000, 1890000,
  'https://m.media-amazon.com/images/I/51HwjV-CPoL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '235 giờ (HyperSpeed)', '55g',
  20, 1, 1, NOW(),
  'Chuột gaming Razer DeathAdder V3 HyperSpeed, cảm biến Focus Pro 30K, siêu nhẹ 55g, pin 235 giờ.',
  '<h2>Razer DeathAdder V3 HyperSpeed</h2><p>Chuột gaming không dây Razer DeathAdder V3 HyperSpeed với thiết kế ergonomic huyền thoại, cảm biến Focus Pro 30K DPI. Siêu nhẹ chỉ 55g, pin 235 giờ với HyperSpeed wireless.</p><ul><li>Cảm biến Focus Pro 30K DPI - tracking siêu chính xác</li><li>HyperSpeed Wireless - độ trễ cực thấp</li><li>Siêu nhẹ 55g - không cần khoan lỗ</li><li>Switch Gen-3 Mechanical - 90 triệu click</li><li>Pin 235 giờ (HyperSpeed), 615 giờ (Bluetooth)</li><li>Feet PTFE 100% trượt mượt</li></ul>',
  'Giảm 600.000đ - Tặng mousepad gaming Razer',
  '{"Cảm biến":"Focus Pro 30K DPI","Kết nối":"HyperSpeed 2.4GHz + Bluetooth","Switch":"Gen-3 Mechanical (90M click)","DPI":"30000","Polling rate":"1000Hz (4000Hz with dongle)","Pin":"235 giờ (HyperSpeed)","Trọng lượng":"55g","Feet":"100% PTFE","Tương thích":"PC, PS5, Xbox"}',
  'Chuột gaming Razer DeathAdder V3 HyperSpeed',
  'Chuột gaming Razer DeathAdder V3 HyperSpeed, 30K DPI, 55g siêu nhẹ, pin 235h, switch 90M click.',
  27
),
(
  'Logitech G Pro X Superlight 2',
  'logitech-g-pro-x-superlight-2',
  'GM-LG-GPXSL2',
  @logitech, 3290000, 2690000,
  'https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '95 giờ', '60g',
  18, 1, 1, NOW(),
  'Chuột gaming Logitech G Pro X Superlight 2, cảm biến HERO 2 32K DPI, siêu nhẹ 60g, LIGHTSPEED wireless.',
  '<h2>Logitech G Pro X Superlight 2</h2><p>Chuột gaming không dây esports Logitech G Pro X Superlight 2 với cảm biến HERO 2 Sensor 32K DPI. Siêu nhẹ 60g, LIGHTSPEED wireless, được pro player tin dùng.</p><ul><li>Cảm biến HERO 2 Sensor 32K DPI - zero smoothing, zero filtering</li><li>LIGHTSPEED Wireless - 1ms report rate</li><li>Siêu nhẹ 60g - nhẹ nhất phân khúc</li><li>LIGHTFORCE Hybrid Switch - nhanh, bền</li><li>Pin 95 giờ sử dụng liên tục</li><li>Feet PTFE zero-additive trượt cực mượt</li></ul>',
  'Giảm 600.000đ - Trả góp 0%',
  '{"Cảm biến":"HERO 2 Sensor 32K DPI","Kết nối":"LIGHTSPEED 2.4GHz + Bluetooth","Switch":"LIGHTFORCE Hybrid","DPI":"32000","Polling rate":"2000Hz (LIGHTSPEED)","Pin":"95 giờ","Trọng lượng":"60g","Feet":"PTFE zero-additive","Số nút":"5"}',
  'Chuột gaming Logitech G Pro X Superlight 2',
  'Chuột gaming Logitech G Pro X Superlight 2, HERO 2 32K DPI, 60g, LIGHTSPEED, pin 95h, pro-level.',
  27
),
(
  'SteelSeries Rival 3 Wireless',
  'steelseries-rival-3-wireless',
  'GM-SS-RVL3-WL',
  @steelseries, 1290000, 990000,
  'https://m.media-amazon.com/images/I/61H13TA2gvL._AC_SL1500_.jpg',
  NULL, NULL, NULL, NULL, NULL, '400+ giờ', '106g',
  30, 0, 1, NOW(),
  'Chuột gaming SteelSeries Rival 3 Wireless, dual wireless (2.4GHz + Bluetooth), pin 400 giờ, TrueMove Air.',
  '<h2>SteelSeries Rival 3 Wireless</h2><p>Chuột gaming không dây SteelSeries Rival 3 với kết nối kép 2.4GHz và Bluetooth 5.0. Cảm biến TrueMove Air 18K DPI, pin siêu bền 400+ giờ dùng pin AA.</p><ul><li>Cảm biến TrueMove Air 18K DPI</li><li>Dual Wireless: 2.4GHz + Bluetooth 5.0</li><li>Pin 400+ giờ (2.4GHz), 600+ giờ (Bluetooth)</li><li>6 nút có thể lập trình</li><li>Switch Mechanical 60 triệu click</li><li>Trọng lượng 106g - cân bằng tốt</li></ul>',
  'Giảm 300.000đ',
  '{"Cảm biến":"TrueMove Air 18K DPI","Kết nối":"2.4GHz + Bluetooth 5.0","Switch":"Mechanical (60M click)","DPI":"18000","Polling rate":"1000Hz","Pin":"400+ giờ (1x AA)","Trọng lượng":"106g (có pin)","Số nút":"6"}',
  'Chuột gaming SteelSeries Rival 3 Wireless',
  'Chuột gaming SteelSeries Rival 3 Wireless, TrueMove Air 18K, dual wireless, pin 400h, 106g.',
  27
);

-- =====================================================
-- 25. GÁN SẢN PHẨM VÀO NEED (Mới = 1)
-- =====================================================
INSERT INTO product_need (product_id, need_id)
SELECT p.id, 1 FROM product p WHERE p.id > 0
ON DUPLICATE KEY UPDATE need_id=need_id;

-- Xong! Đã thêm sản phẩm vào tất cả các danh mục.
SELECT CONCAT('Đã thêm thành công ', COUNT(*), ' sản phẩm!') AS result FROM product;
