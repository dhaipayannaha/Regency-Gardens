import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { PropertyRoutes } from "./app/module/property/property.route";
import { CategoryRoutes } from "./app/module/category/category.route";
import { PropertyImageRoutes } from "./app/module/property-image/property-image.route";
import { FavoriteRoutes } from "./app/module/favourite/favorite.route";
import { InquiryRoutes } from "./app/module/inquiry/inquiry.route";
import { ReviewRoutes } from "./app/module/review/review.route";
import globalErrorHandler from "./app/middleware/globalErrorHandler";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/property", PropertyRoutes);
app.use("/api/v1/category", CategoryRoutes);
app.use('/api/v1/property-image', PropertyImageRoutes);
app.use('/api/v1/favorite', FavoriteRoutes);
app.use('/api/v1/inquiry', InquiryRoutes);
app.use('/api/v1/review', ReviewRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to PH Healthcare System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
