import { VALID_CATEGORIES, MAX_QUERY_LIMIT } from "./const.js";

export const isCategoryValid = (category: string): boolean => {
  return VALID_CATEGORIES.includes(category);
}

export const parseURL = (urlPath: string, urlBase: string): { pathName: string, skip: number, limit: number } => {
  const url = new URL(urlPath, urlBase);
  let skip = Number(url.searchParams.get("skip") ?? "0");
  let limit = Math.min(Number(url.searchParams.get("limit") ?? MAX_QUERY_LIMIT), MAX_QUERY_LIMIT);

  // Piazza @105 - invalid params should be ignored
  if (isNaN(skip) || skip < 0) {
    skip = 0;
  }
  if (isNaN(limit) || limit < 1) {
    limit = MAX_QUERY_LIMIT;
  }
  return { pathName: url.pathname, skip: skip, limit: limit };
}
