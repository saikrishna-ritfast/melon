import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../services/db.service';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinprod';
const JWT_EXPIRES_IN = '1d';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ status: 'fail', message: 'All fields (email, password, name) are required' });
      return;
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ status: 'fail', message: 'Invalid email address' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ status: 'fail', message: 'Password must be at least 8 characters long' });
      return;
    }
    const input = { email, password, name };

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      res.status(400).json({ status: 'fail', message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ status: 'fail', message: 'Email and password are required' });
      return;
    }
    const input = { email, password };

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
