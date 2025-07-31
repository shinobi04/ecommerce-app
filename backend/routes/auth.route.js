import express, { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  signup,
} from "../controllers/auth.controllers.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export default router;
