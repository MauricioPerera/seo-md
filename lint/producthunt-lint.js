#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

/**
 * Lint de PRODUCTHUNT.md — mismas funciones de texto puro que seo-lint.js
 * (no dependen de HTML, así que se reusan tal cual), pero el extractor y el
 * schema son propios: acá no hay <title>/<meta>, el post ES el contenido.
 * Ver PRODUCTHUNT.md, "Por qué no es una instancia de SEO.md".
 */

function cargarConfig(mdPath) {
  const raw = readFileSync(mdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${mdPath} no tiene frontmatter YAML (---...---) al inicio.`);
  return parseYaml(match[1]);
}

async function cargarPost(postModulePath) {
  const mod = await import(pathToFileURL(path.resolve(postModulePath)).href);
  if (!mod.POST) throw new Error(`${postModulePath} debe exportar \`POST\`: { tagline, description, imageCount }`);
  return mod.POST;
}

function contieneTerminoConLimite(texto, termino) {
  const escaped = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(texto);
}

export function lintearPost(post, cfg) {
  const duros = [];
  const blandos = [];

  if (typeof post.tagline !== "string" || !post.tagline) {
    duros.push("`tagline` faltante o vacío.");
  } else if (post.tagline.length > cfg.tagline.max_chars) {
    duros.push(`tagline mide ${post.tagline.length} chars, máximo ${cfg.tagline.max_chars}. ("${post.tagline}")`);
  }

  if (typeof post.description !== "string" || !post.description) {
    duros.push("`description` faltante o vacía.");
  } else if (post.description.length > cfg.description.max_chars) {
    duros.push(`description mide ${post.description.length} chars, máximo ${cfg.description.max_chars}.`);
  }

  // Regla 2 de PRODUCTHUNT.md: sin hard_scope — se chequea tagline + description
  // completos, nunca como señal blanda. No hay uso legítimo de estos términos acá.
  const textoCompleto = `${post.tagline ?? ""} ${post.description ?? ""}`;
  for (const termino of cfg.negative?.terms ?? []) {
    if (contieneTerminoConLimite(textoCompleto, termino)) {
      duros.push(`Término prohibido "${termino}" aparece en el post — Product Hunt remueve posts que piden upvotes.`);
    }
  }

  const minImages = cfg.gallery?.min_images;
  if (typeof minImages === "number") {
    if (typeof post.imageCount !== "number") {
      blandos.push("`imageCount` no declarado — no se pudo verificar el mínimo de galería.");
    } else if (post.imageCount < minImages) {
      duros.push(`${post.imageCount} imagen(es) en la galería, mínimo ${minImages} (si hay menos de 2, la galería ni se muestra en el post).`);
    }
  }

  return { duros, blandos };
}

async function main() {
  const [, , mdPathArg, postArg] = process.argv;
  const mdPath = mdPathArg ?? path.resolve("PRODUCTHUNT.md");
  const postModulePath = postArg ?? path.resolve("example/producthunt/post.js");

  const cfg = cargarConfig(mdPath);
  const post = await cargarPost(postModulePath);
  const { duros, blandos } = lintearPost(post, cfg);

  for (const d of duros) console.log(`  ✗ ${d}`);
  for (const b of blandos) console.log(`  · ${b}`);
  if (!duros.length && !blandos.length) console.log("  ✓ sin observaciones");

  console.log(`\n${duros.length === 0 ? "PASS" : "FAIL"} — ${duros.length} violación(es) de gate duro.`);
  process.exit(duros.length === 0 ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
