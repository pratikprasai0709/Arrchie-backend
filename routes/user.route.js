import { Router } from "express";
import { getAllUsers, updateProfile } from "../controller/user.controller.js";
import { checkToken, checkAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/', checkToken, checkAdmin, getAllUsers);
router.put('/profile', checkToken, updateProfile);

export default router;