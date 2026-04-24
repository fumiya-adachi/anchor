import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getDiscoverUsers } from '../services/discoverService';
import { getUserIdByCognitoId } from '../services/userService';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// GET /api/discover
router.get('/', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { cognitoId } = (req as any).user;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const userId = await getUserIdByCognitoId(cognitoId);
  const users = await getDiscoverUsers(userId, { limit });
  res.json({ users });
}));

export default router;
