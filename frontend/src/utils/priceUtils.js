/**
 * Tiện ích tính giá sản phẩm – xử lý logic giá khuyến mãi (sale).
 *
 * Lý do tách ra thành file riêng:
 * Nhiều component cần kiểm tra sản phẩm có đang sale không (ProductCard, CartContext,
 * CheckoutPage, ProductDetailPage...). Tập trung logic ở một chỗ để dễ bảo trì.
 */

/**
 * Kiểm tra xem sản phẩm có đang trong thời gian khuyến mãi không.
 *
 * Điều kiện hợp lệ:
 * - Có salePrice và salePrice < price (giá sale phải thấp hơn giá gốc)
 * - Nếu có saleStartTime: thời điểm hiện tại phải SAU thời gian bắt đầu
 * - Nếu có saleEndTime: thời điểm hiện tại phải TRƯỚC thời gian kết thúc
 *
 * @param {Object} product - Đối tượng sản phẩm từ API
 * @returns {boolean} true nếu đang trong thời gian khuyến mãi
 */
export const hasActiveSale = (product) => {
  if (!product || !product.salePrice || !product.price || product.salePrice >= product.price) {
    return false;
  }

  const now = new Date();

  // Kiểm tra thời gian bắt đầu sale (nếu có cài đặt)
  if (product.saleStartTime) {
    const startTime = new Date(product.saleStartTime);
    if (now < startTime) return false; // Chưa đến giờ sale
  }

  // Kiểm tra thời gian kết thúc sale (nếu có cài đặt)
  if (product.saleEndTime) {
    const endTime = new Date(product.saleEndTime);
    if (now > endTime) return false; // Đã hết giờ sale
  }

  return true;
};

/**
 * Lấy giá hiển thị của sản phẩm.
 * - Nếu đang sale → trả về salePrice
 * - Nếu không → trả về price gốc
 *
 * @param {Object} product - Đối tượng sản phẩm từ API
 * @returns {number} Giá hiển thị hiện tại
 */
export const getEffectivePrice = (product) => {
  if (!product) return 0;
  return hasActiveSale(product) ? product.salePrice : product.price;
};
