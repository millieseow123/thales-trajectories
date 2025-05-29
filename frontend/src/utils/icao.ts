export function isICAO(code: string): boolean {
    return /^[A-Z]{4}$/.test(code);
}
  