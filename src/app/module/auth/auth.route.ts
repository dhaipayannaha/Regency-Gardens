import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get(
	"/me",
	auth(Role.USER, Role.AGENT, Role.ADMIN),
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);

// Google OAuth redirect flow (browser-based)
router.get("/google", AuthController.googleOAuthRedirect);
router.get("/google/callback", AuthController.googleOAuthCallback);

// Google idToken flow (for direct token-based clients)
router.post("/google", AuthController.googleLogin);

export const AuthRoutes = router;

