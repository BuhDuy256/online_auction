import * as categoryRepository from '../repositories/category.repository';
import { Category } from '../api/dtos/responses/category.type';
import { mapToCategories } from '../mappers/category.mapper';

export const getAllCategories = async (): Promise<Category[]> => {
  const rawCategories = await categoryRepository.getAllCategories();
  return mapToCategories(rawCategories);
};