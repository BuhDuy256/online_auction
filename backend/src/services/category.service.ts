import * as categoryRepository from '../repositories/category.repository';

export const getAllCategories = async () => {
  const categories = await categoryRepository.getAllCategories();

  const parents = categories.filter((c) => c.parent_id === null);
  const result = parents.map((parent) => ({
    categoryId: parent.category_id,
    name: parent.name,
    subCategories: categories
      .filter((c) => c.parent_id === parent.category_id)
      .map((child) => ({
        categoryId: child.category_id,
        name: child.name,
      })),
  }));

  return { data: result };
};