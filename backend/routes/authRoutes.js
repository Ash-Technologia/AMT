import express from "express";
import { body } from "express-validator";
import passport from "passport";
import { register, login, oauthSuccess } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  register
);

router.post("/login", login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: true, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

router.get("/oauth/failure", (req, res) => {
  res.status(400).json({ message: "OAuth Authentication Failed" });
});

export default router;
