import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { AuthProvider, Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
	IGooglePayload,
	ILoginUserPayload,
	IRegisterUserPayload,
	IRequestUser,
} from "./auth.interface";
import { googleClient } from "../../lib/googleAuth";
import { TokenPayload } from "google-auth-library";

const registerUser = async (payload: IRegisterUserPayload) => {
	const { name, password, phone } = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	const createdUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			phone,
			role: Role.USER,
		},
		omit: { password: true },
	});


	const jwtPayload = {
		userId: createdUser.id,
		name: createdUser.name,
		email: createdUser.email,
		role: createdUser.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		user: createdUser,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const isPasswordMatched = await bcrypt.compare(password, user.password as string);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: IGooglePayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;

	if (!payload || !payload.idToken) {
		throw new Error("Invalid request: idToken is missing");
	}

	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("google id token validation error", error);
		throw new Error("Invalid google id token");
	}

	if (!googleIdTokenPayload) {
		throw new Error("Invalid google id token");
	}
	if (!googleIdTokenPayload.email) {
		throw new Error("Google email not found");
	}
	if (!googleIdTokenPayload.name) {
		throw new Error("Google name not found");
	}

	// Look up by googleId (unique field) — findUnique only accepts one unique constraint at a time
	let user = await prisma.user.findUnique({
		where: { googleId: googleIdTokenPayload.sub }
	});

	// Fallback: check if the user previously registered with the same email via credentials
	if (!user) {
		user = await prisma.user.findUnique({
			where: { email: googleIdTokenPayload.email }
		});
	}

	if (!user) {
		user = await prisma.user.create({
			data: {
				name: googleIdTokenPayload.name,
				email: googleIdTokenPayload.email,
				role: Role.USER,
				googleId: googleIdTokenPayload.sub,
				authProvider: AuthProvider.googleId,
			}
		});
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

// ─── Google OAuth redirect flow ──────────────────────────────────────────────

/**
 * Step 1: Generate the Google consent-screen URL and return it so the
 * controller can redirect the browser there.
 */
const googleOAuthRedirect = (callbackUrl: string): string => {
	const redirectUri = config.google_redirect_uri;

	const url = googleClient.generateAuthUrl({
		access_type: "offline",
		scope: ["openid", "email", "profile"],
		// Pass the frontend callback URL through OAuth state so we remember it
		state: Buffer.from(JSON.stringify({ callbackUrl })).toString("base64"),
		redirect_uri: redirectUri,
	});

	return url;
};

/**
 * Step 2: Google redirects back here with ?code=...&state=...
 * Exchange the code for tokens, fetch user profile, find/create user, issue JWTs.
 */
const googleOAuthCallback = async (code: string, state?: string) => {
	const redirectUri = config.google_redirect_uri;

	// Exchange code for Google tokens
	const { tokens } = await googleClient.getToken({ code, redirect_uri: redirectUri });
	googleClient.setCredentials(tokens);

	// Verify and decode the id_token
	const ticket = await googleClient.verifyIdToken({
		idToken: tokens.id_token!,
		audience: config.google_client_id,
	});

	const googlePayload = ticket.getPayload();

	if (!googlePayload) throw new Error("Failed to get Google user info");
	if (!googlePayload.email) throw new Error("Google account has no email");
	if (!googlePayload.name) throw new Error("Google account has no name");

	// Find user by googleId first (fastest, unique index)
	let user = await prisma.user.findUnique({
		where: { googleId: googlePayload.sub },
	});

	// Fallback: user registered previously with the same email via credentials
	if (!user) {
		user = await prisma.user.findUnique({
			where: { email: googlePayload.email },
		});

		// Link their googleId so future logins are faster
		if (user) {
			user = await prisma.user.update({
				where: { id: user.id },
				data: {
					googleId: googlePayload.sub,
					authProvider: AuthProvider.googleId,
				},
			});
		}
	}

	// Brand-new user → create account
	if (!user) {
		user = await prisma.user.create({
			data: {
				name: googlePayload.name,
				email: googlePayload.email,
				role: Role.USER,
				googleId: googlePayload.sub,
				authProvider: AuthProvider.googleId,
			},
		});
	}

	// Issue our own JWTs
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	// Decode the state to recover the frontend callbackUrl
	let callbackUrl = "http://localhost:3000/api/auth/google/callback";
	if (state) {
		try {
			const parsed = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
			if (parsed.callbackUrl) callbackUrl = parsed.callbackUrl;
		} catch { /* ignore malformed state */ }
	}

	const userInfo = Buffer.from(JSON.stringify({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	})).toString("base64");

	const redirectUrl = new URL(callbackUrl);
	redirectUrl.searchParams.set("accessToken", accessToken);
	redirectUrl.searchParams.set("refreshToken", refreshToken);
	redirectUrl.searchParams.set("user", userInfo);

	return redirectUrl.toString();
};

export const AuthService = {
	registerUser,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	googleOAuthRedirect,
	googleOAuthCallback,
};
