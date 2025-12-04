import { Category } from "../api/dtos/responses/category.type";

export const mapToCategories = (rawCategories: any[]): Category[] => {
  const parents = rawCategories.filter((c) => c.parent_id === null);

  return parents.map((parent) => ({
    slug: parent.slug,
    name: parent.name,
    children: rawCategories
      .filter((c) => c.parent_id === parent.category_id)
      .map((child) => ({
        slug: child.slug,
        name: child.name,
      })),
  }));
};
