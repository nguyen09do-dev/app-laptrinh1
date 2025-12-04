/**
 * Text Normalization Utilities
 * Chuẩn hóa văn bản tiếng Việt và tiếng Anh
 */

/**
 * Remove Vietnamese accents/diacritics
 * Chuyển "Tiếng Việt" thành "Tieng Viet"
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Normalize search text for Vietnamese and English
 * Chuẩn hóa text cho tìm kiếm (không phân biệt dấu)
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';

  return removeVietnameseAccents(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces
}

/**
 * Check if text matches search query (accent-insensitive)
 * Kiểm tra text có khớp với query không (không phân biệt dấu)
 */
export function matchesSearch(text: string, query: string): boolean {
  if (!query) return true;
  if (!text) return false;

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);

  return normalizedText.includes(normalizedQuery);
}

/**
 * Highlight matching text in search results
 * Highlight text khớp với search query
 */
export function highlightSearchMatch(text: string, query: string): string {
  if (!query || !text) return text;

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedText.includes(normalizedQuery)) return text;

  // Find the actual position in original text
  const regex = new RegExp(
    query.split('').map(char => {
      // Escape special regex characters
      const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match with or without accent
      return `[${escaped}${getAccentedVariants(char)}]`;
    }).join(''),
    'gi'
  );

  return text.replace(regex, match => `<mark>${match}</mark>`);
}

/**
 * Get accented variants of a character
 */
function getAccentedVariants(char: string): string {
  const variants: { [key: string]: string } = {
    'a': 'àáảãạăằắẳẵặâầấẩẫậ',
    'e': 'èéẻẽẹêềếểễệ',
    'i': 'ìíỉĩị',
    'o': 'òóỏõọôồốổỗộơờớởỡợ',
    'u': 'ùúủũụưừứửữự',
    'y': 'ỳýỷỹỵ',
    'd': 'đ',
  };

  return variants[char.toLowerCase()] || '';
}

/**
 * Clean and normalize Vietnamese text for display
 * Làm sạch và chuẩn hóa text tiếng Việt
 */
export function cleanVietnameseText(text: string): string {
  if (!text) return '';

  return text
    // Remove excessive quotation marks
    .replace(/[""]([^""]{1,50})[""]/g, '$1')
    // Fix spacing around punctuation
    .replace(/\s+([.,!?:;])/g, '$1')
    .replace(/([.,!?:;])([^\s])/g, '$1 $2')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Capitalize first letter after sentence-ending punctuation
    .replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
    .trim();
}

/**
 * Convert to slug (URL-friendly format)
 * Chuyển thành slug cho URL
 */
export function toSlug(text: string): string {
  if (!text) return '';

  return removeVietnameseAccents(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Format word count in Vietnamese
 */
export function formatWordCount(count: number): string {
  if (count < 1000) return `${count} từ`;
  if (count < 10000) return `${(count / 1000).toFixed(1)}k từ`;
  return `${Math.round(count / 1000)}k từ`;
}

/**
 * Format reading time in Vietnamese
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 phút đọc';
  if (minutes === 1) return '1 phút đọc';
  return `${minutes} phút đọc`;
}
