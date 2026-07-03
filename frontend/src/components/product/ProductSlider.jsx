import React, { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';

/**
 * Hiển thị danh sách sản phẩm theo 2 chế độ: Lưới (GRID) hoặc Slider cuộn ngang (SLIDER).
 *
 * Props:
 * - products: mảng sản phẩm cần hiển thị
 * - displayType: 'GRID' (mặc định) | 'SLIDER'
 * - interval: thời gian giữa các lần cuộn (ms), mặc định 3000ms
 * - speed: tốc độ animation cuộn (ms), mặc định 500ms
 *
 * Chế độ SLIDER:
 * - Nhân đôi danh sách sản phẩm để tạo hiệu ứng vòng lặp vô tận
 * - Dùng requestAnimationFrame + easeInOutQuad để cuộn mượt mà
 * - Khi đã cuộn hết bộ gốc → snap ngay về đầu (không thấy được giật)
 */
export default function ProductSlider({ products, interval = 3000, speed = 500, displayType = 'GRID' }) {
  const containerRef = useRef(null);

  // Nhân đôi danh sách để tạo vòng lặp vô tận (chỉ cho SLIDER)
  const displayProducts = displayType === 'SLIDER' && products?.length > 0
    ? [...products, ...products]
    : products;

  useEffect(() => {
    if (displayType !== 'SLIDER' || !products || products.length === 0) return;

    let timeoutId;
    let requestAnimationFrameId;

    const autoScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const item = el.firstElementChild;
      if (!item) return;

      // Tính chiều rộng mỗi item (bao gồm cả gap giữa các item)
      const style = window.getComputedStyle(el);
      const gap = parseFloat(style.gap) || 0;
      const itemWidth = item.offsetWidth + gap;

      // Chiều rộng của bộ sản phẩm gốc (một nửa danh sách nhân đôi)
      const originalWidth = itemWidth * products.length;

      let startScrollLeft = el.scrollLeft;

      // Kỹ thuật infinite loop: nếu đã cuộn qua hết bộ gốc → snap về đầu ngay lập tức
      // Việc snap xảy ra nhanh đến mức mắt người không nhận ra
      if (startScrollLeft >= originalWidth - 1) {
        startScrollLeft -= originalWidth;
        el.scrollLeft = startScrollLeft;
      }

      // Không cuộn nếu nội dung không tràn container
      if (el.scrollWidth <= el.clientWidth) return;

      let targetScrollLeft = startScrollLeft + itemWidth;
      const startTime = performance.now();

      // Animation cuộn với easing easeInOutQuad (tăng tốc rồi giảm dần)
      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / speed, 1);

        // Hàm easeInOutQuad: progress < 0.5 → tăng tốc, progress > 0.5 → giảm tốc
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        el.scrollLeft = startScrollLeft + (targetScrollLeft - startScrollLeft) * easeProgress;

        if (progress < 1) {
          requestAnimationFrameId = requestAnimationFrame(animateScroll);
        } else {
          // Animation xong → đợi 'interval' ms rồi cuộn tiếp
          timeoutId = setTimeout(autoScroll, interval);
        }
      };

      requestAnimationFrameId = requestAnimationFrame(animateScroll);
    };

    // Bắt đầu sau 'interval' ms đầu tiên
    timeoutId = setTimeout(autoScroll, interval);

    // Cleanup khi component unmount hoặc props thay đổi
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }, [displayType, products, interval, speed]);

  return (
    <div
      className={displayType === 'SLIDER' ? 'products-slider' : 'products-grid'}
      ref={containerRef}
    >
      {displayProducts?.map((p, index) => (
        // Key dùng cả id và index để tránh conflict khi danh sách bị nhân đôi
        <ProductCard product={p} key={`${p.id}-${index}`} />
      ))}
    </div>
  );
}
