// Builds a case- AND diacritic-insensitive regex for substring search.
// Both sides are effectively normalized: the term is lowercased and stripped
// of its own accents, then each base letter is expanded to match any accented
// variant. So "reseau", "Réseau" and "réseau" all match each other.

const ACCENT_GROUPS = {
  a: "aàáâãäå",
  c: "cç",
  e: "eèéêë",
  i: "iìíîï",
  n: "nñ",
  o: "oòóôõö",
  u: "uùúûü",
  y: "yýÿ",
};

export function buildSearchRegex(term) {
  // Strip accents from the query itself so an accented query maps to base letters.
  const normalized = term
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  // Escape regex specials, then expand each base letter to its accent group.
  const pattern = normalized
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/[a-z]/g, (ch) => {
      const group = ACCENT_GROUPS[ch];
      return group ? `[${group}]` : ch;
    });

  return new RegExp(pattern, "i");
}
