import React from 'react';
import { useSite } from '../../context/SiteContext';

/**
 * Component hiển thị ảnh sản phẩm với hỗ trợ Frame và Watermark (cài đặt trong Admin → Settings).
 *
 * Chế độ hoạt động:
 * 1. Không có frame/watermark → render thẻ <img> đơn giản (nhẹ DOM nhất)
 * 2. Có frame/watermark → render dạng lồng các layer:
 *    - Background frame (nếu frameMode = 'background'): nằm phíd sau ảnh
 *    - Ảnh sản phẩm gốc (giữa)
 *    - Overlay frame (nếu frameMode = 'overlay'): nằm phíd trước ảnh
 *    - Watermark logo (góc tuỳ chọn)
 *
 * Props: giống <img> thông thường (src, alt, className, style, ...)
 */
export default function AutoImage({ src, alt, className = '', style = {}, ...props }) {
  const { settings } = useSite();

  if (!settings) {
    return <img src={src} alt={alt} className={className} style={style} {...props} />;
  }

  const {
    frameUrl,
    frameMode,
    framePaddingPct,
    watermarkLogoUrl,
    watermarkPosition,
    watermarkSizePct,
    watermarkOpacity
  } = settings;

  // Nếu không có cài đặt frame/watermark nào, chỉ render thẻ img bình thường cho nhẹ DOM
  if (!frameUrl && !watermarkLogoUrl) {
    return <img src={src} alt={alt} className={className} style={style} {...props} />;
  }

  // Dùng transform: scale() thay vì padding để thu nhỏ ảnh mà không làm méo tỷ lệ khung hình (aspect ratio) của wrapper
  const scaleValue = frameUrl && framePaddingPct ? (100 - framePaddingPct * 2) / 100 : 1;
  const transformStyle = scaleValue !== 1 ? { '--img-scale': scaleValue, transform: `scale(var(--img-scale))` } : { '--img-scale': 1 };

  // Hàm tính toán vị trí watermark
  const getWatermarkPositionStyle = () => {
    if (!watermarkLogoUrl) return {};
    
    const pos = watermarkPosition || 'bottom-right';
    const margin = '3%';
    const size = `${watermarkSizePct || 22}%`;
    const opacity = watermarkOpacity || 0.9;

    const baseStyle = {
      position: 'absolute',
      width: size,
      opacity: opacity,
      pointerEvents: 'none', // Không chặn click
    };

    switch (pos) {
      case 'bottom-right': return { ...baseStyle, bottom: margin, right: margin };
      case 'bottom-left':  return { ...baseStyle, bottom: margin, left: margin };
      case 'top-right':    return { ...baseStyle, top: margin, right: margin };
      case 'top-left':     return { ...baseStyle, top: margin, left: margin };
      case 'center':       return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'bottom-center':return { ...baseStyle, bottom: margin, left: '50%', transform: 'translateX(-50%)' };
      default:             return { ...baseStyle, bottom: margin, right: margin };
    }
  };

  return (
    <div 
      className={`auto-image-wrapper ${className}`} 
      style={{ 
        position: 'relative', 
        display: 'inline-block', 
        width: '100%', 
        height: '100%',
        lineHeight: 0, // Xóa khoảng trắng thừa của thẻ img
        ...style 
      }}
    >
      {/* 1. Frame Background (nếu mode là background) */}
      {frameUrl && frameMode === 'background' && (
        <img 
          src={frameUrl} 
          alt="Frame Background" 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, 
            width: '100%', height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 1
          }} 
        />
      )}

      {/* 2. Ảnh sản phẩm gốc */}
      <img 
        src={src} 
        alt={alt} 
        className="auto-image-main"
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          position: 'relative',
          zIndex: 2,
          transition: 'transform 0.3s ease',
          ...transformStyle 
        }} 
        {...props} 
      />

      {/* 3. Frame Overlay (nếu mode là overlay) */}
      {frameUrl && frameMode === 'overlay' && (
        <img 
          src={frameUrl} 
          alt="Frame Overlay" 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, 
            width: '100%', height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 3
          }} 
        />
      )}

      {/* 4. Watermark Logo */}
      {watermarkLogoUrl && (
        <img 
          src={watermarkLogoUrl} 
          alt="Watermark" 
          style={{
            ...getWatermarkPositionStyle(),
            zIndex: 4
          }} 
        />
      )}
    </div>
  );
}
