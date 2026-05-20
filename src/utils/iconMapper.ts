// Định nghĩa danh sách icon (Ở đây dùng Emoji vì thư viện MUI Icons không có sẵn các icon động vật thủy sản đặc thù như Cua, Tôm. Bạn có thể thay bằng chuỗi SVG hoặc Component tùy ý).
export const SPECIES_ICONS = {
  SHRIMP: "🦐",
  CRAB: "🦀",
  LOBSTER: "🦞",
  SQUID: "🦑",
  OCTOPUS: "🐙",
  SHELLFISH: "🐚",
  TURTLE: "🐢",
  EEL: "🐍", // Dùng tạm icon rắn cho lươn/trạch
  FROG: "🐸",
  FISH_DEFAULT: "🐟",
  FISH_ALT: "🐠",
  DOLPHIN: "🐬",
};

export const FALLBACK_ICON = SPECIES_ICONS.FISH_DEFAULT;

// Cấu hình từ khóa (Dictionary)
const ICON_DICTIONARY = [
  { icon: SPECIES_ICONS.SHRIMP, keywords: ["tom", "shrimp", "prawn", "tep"] },
  { icon: SPECIES_ICONS.CRAB, keywords: ["cua", "crab", "ghe"] },
  { icon: SPECIES_ICONS.LOBSTER, keywords: ["hum", "lobster"] },
  { icon: SPECIES_ICONS.SQUID, keywords: ["muc", "squid"] },
  { icon: SPECIES_ICONS.OCTOPUS, keywords: ["bach tuoc", "octopus"] },
  {
    icon: SPECIES_ICONS.SHELLFISH,
    keywords: ["ngheu", "ngao", "so", "oc", "clam", "oyster"],
  },
  { icon: SPECIES_ICONS.TURTLE, keywords: ["rua", "ba ba", "turtle"] },
  { icon: SPECIES_ICONS.EEL, keywords: ["luon", "trach", "eel"] },
  { icon: SPECIES_ICONS.FROG, keywords: ["ech", "nhai", "frog"] },
  // Cấu hình cá chung nằm ở cuối để ưu tiên các loài đặc thù trước
  {
    icon: SPECIES_ICONS.FISH_DEFAULT,
    keywords: ["ca", "fish", "chep", "tram", "troi", "me", "ro", "loc"],
  },
];

// Hàm loại bỏ dấu tiếng Việt để so sánh chính xác hơn
function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function autoSuggestIcon(speciesName: string): string {
  const normalizedName = removeVietnameseTones(speciesName.trim());
  if (!normalizedName) return FALLBACK_ICON;

  // Tìm icon khớp với từ khóa
  for (const item of ICON_DICTIONARY) {
    if (item.keywords.some((kw) => normalizedName.includes(kw))) {
      return item.icon;
    }
  }

  return FALLBACK_ICON; // Fallback
}
