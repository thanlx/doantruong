// ==============================================================================
// VIETNAMESE SEARCH UTILITY: NFD NORMALIZATION & DIACRITIC STRIPPING
// ==============================================================================

/**
 * Chuyển chuỗi tiếng Việt có dấu thành không dấu chữ thường để tìm kiếm linh hoạt
 * Ví dụ: "Lê Xuân Thân" -> "le xuan than", "Đoàn trường" -> "doan truong"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Kiểm tra xem chuỗi haystack có chứa chuỗi needle (không phân biệt dấu tiếng Việt và hoa thường)
 */
export function matchesVietnameseSearch(haystack: string, needle: string): boolean {
  if (!needle || !needle.trim()) return true;
  if (!haystack) return false;
  return removeVietnameseTones(haystack).includes(removeVietnameseTones(needle));
}
