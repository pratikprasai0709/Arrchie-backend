import { Router } from "express";
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from "../controller/order.controller.js";
import { checkToken, checkAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/', checkToken, createOrder);
router.get('/my-orders', checkToken, getMyOrders);
router.get('/', checkToken, checkAdmin, getAllOrders);
router.put('/:id/status', checkToken, checkAdmin, updateOrderStatus);

export default router;
