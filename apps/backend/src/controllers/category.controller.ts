import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.service';

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        status: 'fail',
        message: 'Category name is required',
      });
      return;
    }

    const cleanName = name.trim();
    const cleanSlug = (slug && typeof slug === 'string' && slug.trim() ? slug : cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
      },
    });

    res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({
        status: 'fail',
        message: 'A category with this name or slug already exists',
      });
      return;
    }
    next(error);
  }
};

export const editCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = (req.params.id || req.body.id) as string;
    const { name } = req.body;

    if (!id || !name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        status: 'fail',
        message: 'Category ID and name are required',
      });
      return;
    }

    const cleanName = name.trim();
    const cleanSlug = cleanName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: cleanName,
        slug: cleanSlug,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({
        status: 'fail',
        message: 'A category with this name or slug already exists',
      });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
      return;
    }
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        status: 'fail',
        message: 'Category ID is required',
      });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Category has been deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
      return;
    }
    next(error);
  }
};
