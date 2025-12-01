import db from "../database/db";
import { NotFoundError } from "../errors";


export const getCategoryBySlug = async (slug: string) => {
  const category = await db("categories")
    .where({ slug })
    .select("category_id", "parent_id")
    .first();

  if (!category) {
    throw new NotFoundError(`Category '${slug}' not found`);
  }

  return category;
};

export const getChildCategories = async (parentId: number) => {
  return await db("categories")
    .where({ parent_id: parentId })
    .select("category_id");
};

export const getCategoryIds = async (slug: string): Promise<number[]> => {
  const category = await db("categories")
    .where({ slug })
    .select("category_id", "parent_id")
    .first();

  if (!category) return [];

  if (category.parent_id === null) {
    const children = await db("categories")
      .where({ parent_id: category.category_id })
      .select("category_id");

    return [category.category_id, ...children.map((c) => c.category_id)];
  }

  return [category.category_id];
};

export const getAllCategories = async () => {
  return await db("categories").select("*");
};
