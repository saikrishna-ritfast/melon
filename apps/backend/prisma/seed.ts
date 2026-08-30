import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables from parent directory of prisma (apps/backend/.env)
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 0. Clear existing data to ensure idempotency
  console.log('Clearing existing database tables...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const customerPassword = await bcrypt.hash('Password123', 10);
  const adminPassword = await bcrypt.hash('AdminPassword123', 10);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@store.com' },
    update: {},
    create: {
      email: 'customer@store.com',
      name: 'John Customer',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      name: 'Jane Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Users seeded:', { customer: customer.email, admin: admin.email });

  // 2. Create Categories
  const beveragesParent = await prisma.category.upsert({
    where: { slug: 'beverages' },
    update: {},
    create: {
      name: 'Beverages',
      slug: 'beverages',
    },
  });

  const booksParent = await prisma.category.upsert({
    where: { slug: 'books' },
    update: {},
    create: {
      name: 'Books',
      slug: 'books',
    },
  });

  const softDrinks = await prisma.category.upsert({
    where: { slug: 'soft-drinks' },
    update: {},
    create: {
      name: 'Soft Drinks',
      slug: 'soft-drinks',
      parentId: beveragesParent.id,
    },
  });

  const energyDrinks = await prisma.category.upsert({
    where: { slug: 'energy-drinks' },
    update: {},
    create: {
      name: 'Energy Drinks',
      slug: 'energy-drinks',
      parentId: beveragesParent.id,
    },
  });

  const techBooks = await prisma.category.upsert({
    where: { slug: 'technology-software' },
    update: {},
    create: {
      name: 'Technology & Software',
      slug: 'technology-software',
      parentId: booksParent.id,
    },
  });

  console.log('Categories seeded.');

  // 3. Create Products & Variants
  // Product 1: Classic Cola (Drink)
  const colaProduct = await prisma.product.create({
    data: {
      name: 'Classic Cola',
      description: 'Refreshing classic cola flavor with carbonated water and natural flavors.',
      categoryId: softDrinks.id,
      status: 'ACTIVE',
      specs: {
        volumeMl: 330,
        ingredients: ['Carbonated Water', 'Sugar', 'Caramel Color', 'Phosphoric Acid', 'Natural Flavors', 'Caffeine'],
        sugarGrams: 35,
        caffeineMg: 32,
        packagingType: 'CAN',
      },
      variants: {
        create: [
          {
            name: 'Single Can (330ml)',
            sku: 'COLA-330ML-CAN',
            price: 1.49,
            inventory: {
              create: {
                stock: 120,
                warehouse: 'Main Warehouse - Aisle 4',
              },
            },
          },
          {
            name: 'Pack of 6 Cans',
            sku: 'COLA-330ML-PACK6',
            price: 6.99,
            inventory: {
              create: {
                stock: 45,
                warehouse: 'Main Warehouse - Aisle 4',
              },
            },
          },
        ],
      },
    },
  });

  // Product 2: Diet Lime Soda (Drink)
  await prisma.product.create({
    data: {
      name: 'Diet Lime Soda',
      description: 'Zesty lime soda with zero sugar and calories.',
      categoryId: softDrinks.id,
      status: 'ACTIVE',
      specs: {
        volumeMl: 500,
        ingredients: ['Carbonated Water', 'Citric Acid', 'Natural Lime Flavor', 'Sucralose', 'Sodium Benzoate'],
        sugarGrams: 0,
        caffeineMg: 0,
        packagingType: 'BOTTLE',
      },
      variants: {
        create: [
          {
            name: 'Single Bottle (500ml)',
            sku: 'LIME-500ML-BOTTLE',
            price: 1.79,
            inventory: {
              create: {
                stock: 80,
                warehouse: 'Main Warehouse - Aisle 4',
              },
            },
          },
        ],
      },
    },
  });

  // Product 3: Quantum Charge Energy (Drink)
  await prisma.product.create({
    data: {
      name: 'Quantum Charge Energy',
      description: 'High-octane energy drink with B-vitamins and taurine to charge your day.',
      categoryId: energyDrinks.id,
      status: 'ACTIVE',
      specs: {
        volumeMl: 250,
        ingredients: ['Carbonated Water', 'Sucrose', 'Glucose', 'Citric Acid', 'Taurine', 'Caffeine', 'Niacin', 'Vitamin B6', 'Vitamin B12'],
        sugarGrams: 27,
        caffeineMg: 80,
        packagingType: 'CAN',
      },
      variants: {
        create: [
          {
            name: 'Single Energy Can (250ml)',
            sku: 'QUANTUM-250ML-CAN',
            price: 2.49,
            inventory: {
              create: {
                stock: 150,
                warehouse: 'Main Warehouse - Aisle 5',
              },
            },
          },
        ],
      },
    },
  });

  // Product 4: DDIA (Book)
  const ddiaProduct = await prisma.product.create({
    data: {
      name: 'Designing Data-Intensive Applications',
      description: 'The definitive guide to data system architectures, storage engines, processing models, and distribution networks.',
      categoryId: techBooks.id,
      status: 'ACTIVE',
      specs: {
        isbn: '9781449373320',
        author: 'Martin Kleppmann',
        publisher: "O'Reilly Media",
        pageCount: 616,
        language: 'English',
        publishYear: 2017,
      },
      variants: {
        create: [
          {
            name: 'Paperback Edition',
            sku: 'BOOK-DDIA-PB',
            price: 44.99,
            inventory: {
              create: {
                stock: 25,
                warehouse: 'Secondary Warehouse - Row B',
              },
            },
          },
          {
            name: 'Hardcover Edition',
            sku: 'BOOK-DDIA-HC',
            price: 59.99,
            inventory: {
              create: {
                stock: 10,
                warehouse: 'Secondary Warehouse - Row B',
              },
            },
          },
        ],
      },
    },
  });

  // Product 5: Clean Code (Book)
  await prisma.product.create({
    data: {
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship, filled with best practices and code examples.',
      categoryId: techBooks.id,
      status: 'ACTIVE',
      specs: {
        isbn: '9780132350884',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        pageCount: 464,
        language: 'English',
        publishYear: 2008,
      },
      variants: {
        create: [
          {
            name: 'Paperback Edition',
            sku: 'BOOK-CC-PB',
            price: 37.50,
            inventory: {
              create: {
                stock: 30,
                warehouse: 'Secondary Warehouse - Row B',
              },
            },
          },
        ],
      },
    },
  });

  console.log('Products and Inventory seeded successfully.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
