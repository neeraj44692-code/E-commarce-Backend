import express from "express";
import { isAdmin } from "../middeleware/isauthentication.js";
import {
  addproduct,
  deleteProduct,
  getAllProduct,
  updateProduct,
} from "../controller/productController.js";
import { multipleUpload } from "../middeleware/multer.js";
import { isauthentication } from "../middeleware/isauthentication.js";

const router = express.Router();

router.post(
  "/addproduct",
  isauthentication,
  isAdmin,
  multipleUpload,
  addproduct,
);

router.get("/getallproducts", getAllProduct);
router.delete("/delete/:productId", isauthentication, isAdmin, deleteProduct);
router.put(
  "/update/:productId",
  isauthentication,
  isAdmin,
  multipleUpload,
  updateProduct,
);

export default router;
