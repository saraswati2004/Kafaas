/**
 * Case conversion utilities for API compatibility
 * Frontend uses camelCase, Backend uses snake_case
 */

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function keysToSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(keysToSnakeCase);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    result[snakeKey] = keysToSnakeCase(value);
  }
  return result;
}

export function keysToCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(keysToCamelCase);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = keysToCamelCase(value);
  }
  return result;
}

/**
 * Transform axios request data to snake_case
 */
export function transformRequest(data: any): any {
  return keysToSnakeCase(data);
}

/**
 * Transform axios response data to camelCase
 */
export function transformResponse(data: any): any {
  return keysToCamelCase(data);
}