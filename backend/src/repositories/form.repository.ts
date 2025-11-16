import prisma from "../database/prisma";
import * as categoryRepository from "./category.repository";

export const getCategoriesForSchema = async () => {
    const categoriesData = await categoryRepository.getAllCategories();
    
    const options: { const: number; title: string }[] = [];
    
    for (const parent of categoriesData.data) {
        for (const subCategory of parent.sub_categories) {
            options.push({
                const: subCategory.category_id,
                title: `${parent.name} - ${subCategory.name}`
            });
        }
    }
    
    return options;
};

