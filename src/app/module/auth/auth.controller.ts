import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { IRequestUser } from "./auth.interface";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.registerUser(payload);

	const { accessToken, refreshToken, user } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "User registered successfully",
		data: {
			accessToken,
			refreshToken,
			user,
		},
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.loginUser(payload);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});

const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as unknown as IRequestUser;

	if (!user) {
		throw new Error("User information is missing in the request");
	}

	const result = await AuthService.getMe(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	if (!req.cookies.refreshToken) {
		throw new Error("Refresh token is missing");
	}
	const result = await AuthService.refreshToken(req.cookies.refreshToken);
	const { accessToken, refreshToken: newRefreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", newRefreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New tokens generated successfully",
		data: {
			accessToken,
			refreshToken: newRefreshToken,
		},
	});
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.googleLogin(payload);

	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New tokens generated successfully",
		data: {
			accessToken,
			refreshToken
		},
	});
});

/**
 * GET /api/v1/auth/google
 * Redirects the browser to Google's OAuth consent screen.
 * Accepts an optional ?callbackUrl= query param so the frontend can specify
 * where Google should send the user after authentication.
 */
const googleOAuthRedirect = catchAsync(async (req: Request, res: Response) => {
	const callbackUrl =
		(req.query.callbackUrl as string) ??
		"http://localhost:3000/api/auth/google/callback";

	const googleAuthUrl = AuthService.googleOAuthRedirect(callbackUrl);
	res.redirect(googleAuthUrl);
});

/**
 * GET /api/v1/auth/google/callback
 * Google redirects here after the user consents.
 * Exchanges the ?code= for tokens, issues our JWTs, then redirects to
 * the frontend callback URL with tokens in the query string.
 */
const googleOAuthCallback = catchAsync(async (req: Request, res: Response) => {
	const code  = req.query.code  as string | undefined;
	const state = req.query.state as string | undefined;
	const error = req.query.error as string | undefined;

	if (error || !code) {
		const frontendLogin = "http://localhost:3000/login?error=google_auth_failed";
		return res.redirect(frontendLogin);
	}

	try {
		const redirectUrl = await AuthService.googleOAuthCallback(code, state);
		return res.redirect(redirectUrl);
	} catch (err) {
		console.error("[googleOAuthCallback] error:", err);
		return res.redirect("http://localhost:3000/login?error=google_auth_failed");
	}
});

export const AuthController = {
	registerUser,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	googleOAuthRedirect,
	googleOAuthCallback,
};
