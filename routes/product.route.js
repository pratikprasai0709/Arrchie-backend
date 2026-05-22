import { Router } from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controller/product.controller.js";
import { checkToken, checkAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', checkToken, checkAdmin, upload.single('productImage'), createProduct);
router.put('/:id', checkToken, checkAdmin, upload.single('productImage'), updateProduct);
router.delete('/:id', checkToken, checkAdmin, deleteProduct);

export default router;

