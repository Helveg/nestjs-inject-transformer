export function isClass(obj: unknown): boolean {
  return typeof obj === "function" && /^class\s/.test(obj.toString());
}
