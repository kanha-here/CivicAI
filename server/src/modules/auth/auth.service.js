import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client.js';
import { normalizePhoneNumber } from '../../services/whatsapp.service.js';

const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '7d';

function normalizeRole(role) {
  if (!role) return 'CITIZEN';
  const upper = String(role).trim().toUpperCase();
  if (['CITIZEN', 'OFFICER', 'ADMIN', 'SUPER_ADMIN'].includes(upper)) return upper;
  return 'CITIZEN';
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role.toLowerCase() },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    { expiresIn: TOKEN_TTL },
  );
}

export async function registerUser({ name, email, password, role, phone }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedPhone = normalizePhoneNumber(phone);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: normalizeRole(role),
      phone: normalizedPhone,
    },
  });

  const token = signToken(user);
  return { user: toPublicUser(user), token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  return { user: toPublicUser(user), token };
}

export async function getCurrentUser(userId, tokenPayload) {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user && tokenPayload) {
    // Automatically create the user in our local database if they logged in via Neon OIDC
    const normalizedRole = normalizeRole(tokenPayload.role);
    user = await prisma.user.create({
      data: {
        id: userId,
        name: tokenPayload.name || tokenPayload.email?.split('@')[0] || 'User',
        email: tokenPayload.email,
        passwordHash: 'OIDC_EXTERNAL_SESSION', // Secure placeholder for OIDC users
        role: normalizedRole,
      },
    });
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}
