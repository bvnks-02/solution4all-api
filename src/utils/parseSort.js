export function parseSort(sortStr, defaultSort = { createdAt: -1 }) {
  if (!sortStr) return defaultSort;
  const fieldMap = { created: "createdAt", updated: "updatedAt" };
  const sortObj = {};
  for (const part of sortStr.split(",")) {
    const field = part.replace(/^-/, "");
    const direction = part.startsWith("-") ? -1 : 1;
    sortObj[fieldMap[field] || field] = direction;
  }
  return sortObj;
}
