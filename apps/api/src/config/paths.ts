import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_ROOT = path.join(__dirname, "../../uploads");
export const BABY_PHOTOS_DIR = path.join(UPLOADS_ROOT, "babies");
