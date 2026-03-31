import express from "express";
import {
  register,
  login,
  logout,
  allUser,
  verify,
  reVerify,
} from "../controller/user.controller.js";
import { isAdmin, isauthentication } from "../middeleware/isauthentication.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/reverify", reVerify);
router.post("/login", login);
router.post("/logout", isauthentication, logout);
router.get("/all-user", isauthentication, isAdmin, allUser);

export default router;
