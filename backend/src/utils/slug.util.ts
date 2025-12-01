export const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')   // replace special characters with -
    .replace(/^-+|-+$/g, '')          // trim - at the start/end
};