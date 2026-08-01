import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lee el HTML tal cual lo sirve GitHub Pages — no una copia paralela que
// pueda desincronizarse del archivo real.
export const PAGINAS = [{ ruta: "/", html: readFileSync(path.join(__dirname, "index.html"), "utf8") }];
