#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

/**
 * Lint de LINKEDIN.md — dos formatos, dos funciones (lintearFeedCopy,
 * lintearNewsletter). Reusa el mismo principio de techo/piso/óptimo de
 * SEO.md (reglas 2, 7 y 9), pero el contenido es un objeto estructurado,
 * no HTML a parsear — ver LINKEDIN.md, regla 6.
 */

function cargarConfig(mdPath) {
  const raw = readFileSync(mdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${mdPath} no tiene frontmatter YAML (---...---) al inicio.`);
  return parseYaml(match[1]);
}

async function cargarContenido(contentModulePath) {
  return import(pathToFileURL(path.resolve(contentModulePath)).href);
}

function contarPalabras(texto) {
  return String(texto ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function contieneTerminoConLimite(texto, termino) {
  const escaped = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(texto);
}

// LINKEDIN.md regla 1: a diferencia del linter de SEO.md para páginas web,
// acá SÍ tiene sentido chequear raw_html y literal_markdown — el medio es
// texto plano, no HTML, así que ambos son errores reales y detectables.
const TIPOS_FORBIDDEN_STRUCTURE_SOPORTADOS = ["table", "raw_html", "literal_markdown"];

function chequearEstructuraProhibida(texto, tiposConfigurados) {
  const duros = [];
  const blandos = [];
  for (const tipo of tiposConfigurados ?? []) {
    if (!TIPOS_FORBIDDEN_STRUCTURE_SOPORTADOS.includes(tipo)) {
      blandos.push(`forbidden_structure: "${tipo}" no reconocido por este linter — no verificado.`);
      continue;
    }
    if (tipo === "table" && /^\s*\|.*\|.*\|/m.test(texto)) {
      duros.push("Tabla estilo Markdown (`| a | b |`) encontrada — el editor de LinkedIn la muestra como texto plano sin estructura.");
    }
    if (tipo === "raw_html" && /<[a-z][a-z0-9]*(\s[^>]*)?>/i.test(texto)) {
      duros.push("Etiqueta HTML cruda encontrada — el editor de LinkedIn la escapa o la ignora.");
    }
    if (tipo === "literal_markdown" && /\*\*[^*\n]+\*\*|^#{1,6}\s|^[-*]\s/m.test(texto)) {
      duros.push("Sintaxis de Markdown sin procesar encontrada (`**negrita**`, `#`, `-` como bullet) — se publica como texto literal, el editor no lo interpreta.");
    }
  }
  return { duros, blandos };
}

function chequearNegativeTerms(texto, negative) {
  const duros = [];
  for (const termino of negative?.terms ?? []) {
    if (contieneTerminoConLimite(texto, termino)) {
      duros.push(`Frase/término prohibido "${termino}" encontrado.`);
    }
  }
  for (const caracter of negative?.forbidden_chars ?? []) {
    if (texto.includes(caracter)) {
      duros.push(`Carácter prohibido "${caracter}" encontrado (LINKEDIN.md, regla 5).`);
    }
  }
  return duros;
}

// El YAML usa las claves propias de cada campo (max_chars/min_chars,
// max_words/min_words) para que sea legible ahí — chequearRango normaliza
// a min/max genéricos acá, un solo lugar en vez de repetir el mapeo en
// cada call site (motivo real: un mapeo manual repetido en 3 lugares fue
// justo el bug que este helper reemplaza — dos de los tres nunca miraban
// la clave correcta).
function rangoDesde(cfgRango, { maxKey = "max_chars", minKey = "min_chars" } = {}) {
  if (!cfgRango) return {};
  return { max: cfgRango[maxKey], min: cfgRango[minKey], optimal_min: cfgRango.optimal_min, optimal_max: cfgRango.optimal_max };
}

// Techo/piso duro + rango óptimo blando en una sola función — ver SEO.md
// reglas 7 (piso numérico duro) y 9 (rango óptimo, siempre blando).
function chequearRango(valor, unidad, { min, max, optimal_min, optimal_max } = {}, etiqueta) {
  const duros = [];
  const blandos = [];
  if (typeof max === "number" && valor > max) duros.push(`${etiqueta}: ${valor} ${unidad}, máximo ${max}.`);
  if (typeof min === "number" && valor < min) duros.push(`${etiqueta}: ${valor} ${unidad}, mínimo ${min}.`);
  if (typeof optimal_max === "number" && valor > optimal_max) {
    blandos.push(`${etiqueta}: ${valor} ${unidad}, por encima del óptimo (${optimal_min ?? "—"}-${optimal_max}).`);
  } else if (typeof optimal_min === "number" && valor < optimal_min) {
    blandos.push(`${etiqueta}: ${valor} ${unidad}, por debajo del óptimo (${optimal_min}-${optimal_max ?? "—"}).`);
  }
  return { duros, blandos };
}

export function lintearFeedCopy(feedCopy, cfg) {
  const duros = [];
  const blandos = [];
  const texto = feedCopy?.text ?? "";

  if (!texto) duros.push("`text` faltante o vacío.");
  const rango = chequearRango(texto.length, "chars", { max: cfg.feed_copy.max_chars }, "feed_copy.text");
  duros.push(...rango.duros);

  const maxHashtags = cfg.feed_copy.hashtags?.max;
  const hashtags = feedCopy?.hashtags ?? [];
  if (typeof maxHashtags === "number" && hashtags.length > maxHashtags) {
    duros.push(`${hashtags.length} hashtags, máximo ${maxHashtags}.`);
  }

  duros.push(...chequearNegativeTerms(texto, cfg.negative));
  const estructura = chequearEstructuraProhibida(texto, cfg.forbidden_structure);
  duros.push(...estructura.duros);
  blandos.push(...estructura.blandos);

  return { duros, blandos };
}

export function lintearNewsletter(art, cfg) {
  const duros = [];
  const blandos = [];
  const s = cfg.newsletter_article;
  const textoCompleto = [art?.title, art?.seoDescription, art?.hook, art?.contextParagraph, ...(art?.sections ?? []).flatMap((sec) => [sec.heading, sec.body]), art?.closing].filter(Boolean).join("\n");

  if (!art?.title) {
    duros.push("`title` faltante.");
  } else {
    const r = chequearRango(art.title.length, "chars", rangoDesde(s.title), "title");
    duros.push(...r.duros);
    blandos.push(...r.blandos);
  }

  if (!art?.seoDescription) duros.push("`seoDescription` faltante.");
  else {
    const r = chequearRango(art.seoDescription.length, "chars", rangoDesde(s.seo_description), "seoDescription");
    duros.push(...r.duros);
    blandos.push(...r.blandos);
  }

  const cuerpoTexto = (art?.sections ?? []).map((sec) => sec.body).join(" ");
  const cuerpoChars = cuerpoTexto.length;
  const cuerpoPalabras = contarPalabras(cuerpoTexto);
  const rBody = chequearRango(cuerpoChars, "chars", { max: s.body?.max_chars }, "body");
  duros.push(...rBody.duros);
  const rBodyPalabras = chequearRango(cuerpoPalabras, "palabras", { optimal_min: s.body?.optimal_min_words, optimal_max: s.body?.optimal_max_words }, "body");
  blandos.push(...rBodyPalabras.blandos);

  if (art?.contextParagraph) {
    const r = chequearRango(contarPalabras(art.contextParagraph), "palabras", rangoDesde(s.context_paragraph, { maxKey: "max_words", minKey: "min_words" }), "contextParagraph");
    duros.push(...r.duros);
    blandos.push(...r.blandos);
  }

  const nSecciones = (art?.sections ?? []).length;
  if (typeof s.sections?.min === "number" && nSecciones < s.sections.min) {
    duros.push(`${nSecciones} secciones, mínimo ${s.sections.min}.`);
  }
  if (typeof s.sections?.max === "number" && nSecciones > s.sections.max) {
    duros.push(`${nSecciones} secciones, máximo ${s.sections.max}.`);
  }

  duros.push(...chequearNegativeTerms(textoCompleto, cfg.negative));
  const estructura = chequearEstructuraProhibida(textoCompleto, cfg.forbidden_structure);
  duros.push(...estructura.duros);
  blandos.push(...estructura.blandos);

  return { duros, blandos };
}

async function main() {
  const [, , mdPathArg, contentArg] = process.argv;
  const mdPath = mdPathArg ?? path.resolve("LINKEDIN.md");
  const contentModulePath = contentArg ?? path.resolve("example/linkedin/content.js");

  const cfg = cargarConfig(mdPath);
  const { FEED_COPY, NEWSLETTER } = await cargarContenido(contentModulePath);

  const resultados = [];
  if (FEED_COPY) resultados.push({ nombre: "feed_copy", ...lintearFeedCopy(FEED_COPY, cfg) });
  if (NEWSLETTER) resultados.push({ nombre: "newsletter_article", ...lintearNewsletter(NEWSLETTER, cfg) });

  let totalDuros = 0;
  for (const r of resultados) {
    console.log(`\n${r.nombre}`);
    for (const d of r.duros) console.log(`  ✗ ${d}`);
    for (const b of r.blandos) console.log(`  · ${b}`);
    if (!r.duros.length && !r.blandos.length) console.log("  ✓ sin observaciones");
    totalDuros += r.duros.length;
  }

  console.log(`\n${totalDuros === 0 ? "PASS" : "FAIL"} — ${totalDuros} violación(es) de gate duro.`);
  process.exit(totalDuros === 0 ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
