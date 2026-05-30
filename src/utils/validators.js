/**
 * @file validators.js
 * @description Utility functions and helpers for validators operations.
 * @author Thabotharan Balachandran
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128)
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional()
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").max(255),
  subject: z.string().min(2, "Subject is required").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000)
});

export const resumeSaveSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().max(255),
  data: z.string(), // Encrypted payload
  iv: z.string(),
  isPublic: z.boolean().optional(),
  customSlug: z.string().max(100).optional().nullable(),
  password: z.string().max(100).optional().nullable()
});
