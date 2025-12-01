export const toNum = (value: any): number =>
  value && typeof value.toNumber === 'function' ? value.toNumber() : Number(value) || 0;