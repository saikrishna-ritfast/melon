import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db.service';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { 
    const { category, minPrice, maxPrice, search, page = '1', limit = '10' } = req.query;

    const parsedPage = parseInt(page as string, 10) || 1;
    const parsedLimit = parseInt(limit as string, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (category) {
      // Direct category slug match or checks if it's a child category of a parent category
      whereClause.category = {
        OR: [
          { slug: category as string },
          { parent: { slug: category as string } }
        ]
      };
    }

    if (minPrice || maxPrice) {
      whereClause.variants = {
        some: {
          price: {
            gte: minPrice ? parseFloat(minPrice as string) : undefined,
            lte: maxPrice ? parseFloat(maxPrice as string) : undefined,
          },
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            include: {
              inventory: {
                select: {
                  stock: true,
                },
              },
            },
          },
        },
        skip,
        take: parsedLimit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          totalCount,
          totalPages,
          currentPage: parsedPage,
          limit: parsedLimit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Fetch roots
      }
    });
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
    const { name, slug, parentId } = req.body;

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
        slug: cleanSlug
      }
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

