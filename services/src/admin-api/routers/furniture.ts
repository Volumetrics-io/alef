import { Hono } from 'hono';
import { Env } from '../config/ctx';

export const furnitureRouter = new Hono<Env>();
