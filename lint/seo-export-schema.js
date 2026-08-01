#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

/**
 * Cumple la regla 6 de SEO.md ("export schema... sin LLM de por medio, es
 * templating puro sobre config"): lee el bloque `schema:` de un SEO.md y
 * devuelve el JSON-LD listo para pegar en el <head>. Cero ambigüedad posible
 * porque no interpreta nada — si un campo no está en el YAML, no aparece en
 * la salida.
 *
 * Requiere `schema.name` y `schema.description` en el YAML (no solo
 * `default_type`/`applicationCategory`, que es todo lo que el schema traía
 * hasta ahora) — sin esos dos campos no hay JSON-LD válido que generar.
 */

function cargarConfig(seoMdPath) {
  const raw = readFileSync(seoMdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${seoMdPath} no tiene frontmatter YAML (---...---) al inicio.`);
  return parseYaml(match[1]);
}

export function construirJsonLd(cfg, { url } = {}) {
  const schema = cfg.schema;
  if (!schema) throw new Error("SEO.md no tiene bloque `schema:` — nada que generar.");
  if (!schema.default_type) throw new Error("`schema.default_type` es obligatorio.");
  if (!schema.name) throw new Error("`schema.name` es obligatorio (agregalo a schema: en el SEO.md).");
  if (!schema.description) throw new Error("`schema.description` es obligatorio (agregalo a schema: en el SEO.md).");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schema.default_type,
    name: schema.name,
    description: schema.description,
  };
  if (schema.applicationCategory) jsonLd.applicationCategory = schema.applicationCategory;
  if (schema.operating_system) jsonLd.operatingSystem = schema.operating_system;
  if (url) jsonLd.url = url;

  return jsonLd;
}

function main() {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes("--json-only");
  const urlIdx = args.indexOf("--url");
  const url = urlIdx !== -1 ? args[urlIdx + 1] : undefined;
  const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--url");
  const seoMdPath = positional[0] ?? path.resolve("SEO.md");

  const cfg = cargarConfig(seoMdPath);
  const jsonLd = construirJsonLd(cfg, { url });

  if (jsonOnly) {
    console.log(JSON.stringify(jsonLd, null, 2));
  } else {
    console.log(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
