import { Router } from 'express';
import * as categoryController from './controllers/category.controller';

const router = Router();

// Category Endpoints
router.get('/products/categories', categoryController.getCategories);
router.post('/products/categories', categoryController.createCategories);
router.patch('/products/categories/:id', categoryController.editCategories);
router.delete('/products/categories/:id', categoryController.deleteCategory);

// Direct Category Endpoints
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategories);
router.patch('/categories/:id', categoryController.editCategories);
router.delete('/categories/:id', categoryController.deleteCategory);

export default router;
