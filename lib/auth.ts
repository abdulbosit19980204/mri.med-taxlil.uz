// Authentication utilities
// This file contains helper functions for JWT tokens, password hashing, and session management

import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

interface JWTPayload extends User {
  [key: string]: any;
  iat?: number;
  exp?: number;
}

/**
 * Create a JWT token
 */
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT(user as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Hash password (in production, use bcrypt)
 * This is a placeholder - replace with proper bcrypt implementation
 */
export async function hashPassword(password: string): Promise<string> {
  // In production environment, use:
  // import bcrypt from 'bcryptjs';
  // return await bcrypt.hash(password, 10);

  // For now, using simple base64 encoding (NOT SECURE - for demo only)
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.SALT || 'default-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Parol kamida 8 ta belgi bo\'lishi kerak');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Parolda kamida 1 ta bosh harf bo\'lishi kerak');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Parolda kamida 1 ta kichik harf bo\'lishi kerak');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Parolda kamida 1 ta raqam bo\'lishi kerak');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
