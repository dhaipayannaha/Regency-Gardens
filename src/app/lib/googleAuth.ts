import { OAuth2Client } from "google-auth-library";
import config from "../config";

export const googleClient = new OAuth2Client({
    client_id: config.google_client_id,
    client_secret: config.google_client_secret,
    redirect_uri: config.google_redirect_uri,
})
