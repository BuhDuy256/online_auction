import * as categoryRepository from "./category.repository";

export const getCategoriesForSchema = async () => {
  const categories = await categoryRepository.getAllCategories();

  const parentOptions: { const: number; title: string }[] = [];
  const dataMap: Record<string, { const: number; title: string }[]> = {};

  const parents = categories.filter((c) => c.parent_id === null);

  for (const parent of parents) {
    parentOptions.push({
      const: parent.category_id,
      title: parent.name,
    });

    const children = categories.filter((c) => c.parent_id === parent.category_id);
    dataMap[parent.category_id.toString()] = children.map((sub) => ({
      const: sub.category_id,
      title: sub.name,
    }));
  }

  return { parentOptions, dataMap };
};
