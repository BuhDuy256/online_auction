import prisma from "../database/prisma";
import * as categoryRepository from "./category.repository";

export const getCategoriesForSchema = async () => {
    const categoriesData = await categoryRepository.getAllCategories();
    
    const parentOptions: { const: number; title: string }[] = [];
    const dataMap: Record<string, { const: number; title: string }[]> = {};
    
    for (const parent of categoriesData.data) {
        parentOptions.push({
            const: parent.category_id,
            title: parent.name
        });
        
        dataMap[parent.category_id.toString()] = parent.sub_categories.map(sub => ({
            const: sub.category_id,
            title: sub.name
        }));
    }
    
    return { parentOptions, dataMap };
};

