#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

/**
 * Lint genérico de SEO.md: no asume nada de la app que lo usa. Recibe la
 * ruta a un SEO.md y la ruta a un módulo JS que exporta `PAGINAS` — un
 * array de `{ ruta, render }` (función que devuelve HTML) o `{ ruta, html }`
 * (string ya renderizado). Cualquier proyecto puede apuntar esto a su propio
 * módulo de páginas sin tocar este archivo — ver SEO.md, regla 6 ("Herramientas
 * CLI que operan sobre el SEO.md de un proyecto, no reimplementadas por sitio").
 *
 * Techos duros (fallan el proceso) vs. señales blandas (se informan, nunca
 * fallan): ver SEO.md, regla 2 y 4, para el razonamiento de por qué la
 * cobertura de keywords y el uso de negative-terms en el body NO son gates
 * duros.
 */

function stripHtml(html) {
  return String(html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cargarConfig(seoMdPath) {
  const raw = readFileSync(seoMdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${seoMdPath} no tiene frontmatter YAML (---...---) al inicio.`);
  return parseYaml(match[1]);
}

async function cargarPaginas(pagesModulePath) {
  const mod = await import(pathToFileURL(path.resolve(pagesModulePath)).href);
  if (!Array.isArray(mod.PAGINAS)) {
    throw new Error(`${pagesModulePath} debe exportar \`PAGINAS\`: [{ ruta, render } | { ruta, html }, ...]`);
  }
  return mod.PAGINAS.map((p) => ({ ruta: p.ruta, html: p.html ?? p.render() }));
}

function extraerTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? null;
}

function extraerMetaDescription(html) {
  return html.match(/<meta name="description" content="([\s\S]*?)">/)?.[1] ?? null;
}

function extraerJsonLd(html) {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!raw) return { presente: false };
  try {
    return { presente: true, valor: JSON.parse(raw) };
  } catch (e) {
    return { presente: true, error: e.message };
  }
}

function extraerLang(html) {
  return html.match(/<html\s[^>]*lang="([^"]*)"/)?.[1] ?? null;
}

// Excluye links a la propia ruta (ej. un logo apuntando a "/" desde "/"):
// no diluyen nada, no son "linking" en el sentido que la regla protege.
function linksInternos(html, rutaActual) {
  return [...html.matchAll(/<a\s[^>]*href="(\/[^"]*)"/g)].map((m) => m[1]).filter((href) => href !== rutaActual);
}

// Techo de densidad: para páginas más cortas que la ventana (per_words), el
// límite es simplemente `count` total. Para páginas más largas, escala hacia
// arriba una vez por cada ventana completa (ver SEO.md, regla 2).
function techoDeDensidad(wordCount, { count, per_words }) {
  return count * Math.max(1, Math.ceil(wordCount / per_words));
}

function contarOcurrencias(texto, termino) {
  const escaped = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (texto.match(new RegExp(escaped, "gi")) ?? []).length;
}

function contieneTerminoConLimite(texto, termino) {
  const escaped = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(texto);
}

function lintearPagina(pagina, cfg) {
  const { html, ruta } = pagina;
  const title = extraerTitle(html);
  const description = extraerMetaDescription(html);
  const jsonLd = extraerJsonLd(html);
  const bodyMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const bodyTexto = stripHtml(bodyMatch ? bodyMatch[1] : html);
  const wordCount = bodyTexto.split(/\s+/).filter(Boolean).length;
  const links = linksInternos(html, ruta);
  const lang = extraerLang(html);

  const duros = [];
  const blandos = [];

  if (cfg.locale && lang !== cfg.locale) {
    duros.push(`<html lang="${lang}">, pero SEO.md declara locale "${cfg.locale}".`);
  }

  const pillarPages = cfg.linking?.pillar_pages ?? [];
  const esPillarPage = pillarPages.includes(ruta);
  if (!esPillarPage && pillarPages.length > 0 && !links.some((href) => pillarPages.includes(href))) {
    duros.push(`No linkea a ninguna pillar_page (${pillarPages.join(", ")}) — ver SEO.md, "Estrategia de enlazado".`);
  }

  if (title === null) {
    duros.push("No se encontró <title>.");
  } else if (title.length > cfg.meta.title.max_chars) {
    duros.push(`<title> mide ${title.length} chars, máximo ${cfg.meta.title.max_chars}. ("${title}")`);
  }

  if (description === null) {
    duros.push('No se encontró <meta name="description">.');
  } else if (description.length > cfg.meta.description.max_chars) {
    duros.push(`meta description mide ${description.length} chars, máximo ${cfg.meta.description.max_chars}.`);
  }

  const negativeScope = cfg.keywords?.negative?.hard_scope ?? [];
  const negativeTerms = cfg.keywords?.negative?.terms ?? [];
  if (negativeScope.includes("meta.title") && title) {
    for (const termino of negativeTerms) {
      if (contieneTerminoConLimite(title, termino)) duros.push(`Término prohibido "${termino}" aparece en <title>.`);
    }
  }
  if (negativeScope.includes("meta.description") && description) {
    for (const termino of negativeTerms) {
      if (contieneTerminoConLimite(description, termino)) duros.push(`Término prohibido "${termino}" aparece en meta description.`);
    }
  }
  // Fuera del hard_scope (body): nunca es gate duro — solo se informa, porque
  // un match ciego por substring no distingue uso propio de comparativo/
  // negado (ver SEO.md, regla 4).
  for (const termino of negativeTerms) {
    if (contieneTerminoConLimite(bodyTexto, termino)) {
      blandos.push(`"${termino}" aparece en el body — revisar a mano si describe la oferta propia o es comparación/negación.`);
    }
  }

  for (const keyword of cfg.keywords?.primary ?? []) {
    const ocurrencias = contarOcurrencias(bodyTexto, keyword);
    const maxPermitido = techoDeDensidad(wordCount, cfg.keywords.max_density);
    if (ocurrencias > maxPermitido) {
      duros.push(`Keyword primaria "${keyword}" aparece ${ocurrencias} veces (${wordCount} palabras) — techo ${maxPermitido}.`);
    } else if (ocurrencias === 0) {
      blandos.push(`Keyword primaria "${keyword}" no aparece — revisar cobertura semántica (sinónimos cuentan).`);
    }
  }

  const maxLinks = cfg.linking?.max_internal_links_per_page;
  if (typeof maxLinks === "number" && links.length > maxLinks) {
    duros.push(`${links.length} links internos, máximo ${maxLinks}.`);
  }

  if (jsonLd.presente && jsonLd.error) {
    duros.push(`JSON-LD presente pero inválido: ${jsonLd.error}`);
  } else if (jsonLd.presente && cfg.schema?.default_type && jsonLd.valor["@type"] !== cfg.schema.default_type) {
    blandos.push(`JSON-LD @type es "${jsonLd.valor["@type"]}", el default de SEO.md es "${cfg.schema.default_type}".`);
  }

  return { ruta, title, duros, blandos };
}

// Títulos duplicados entre páginas != un problema por página — necesita ver
// el set completo, así que corre después de lintearPagina, no adentro.
function chequearTitulosDuplicados(resultados) {
  const porTitulo = new Map();
  for (const r of resultados) {
    if (!r.title) continue;
    if (!porTitulo.has(r.title)) porTitulo.set(r.title, []);
    porTitulo.get(r.title).push(r.ruta);
  }
  for (const [title, rutas] of porTitulo) {
    if (rutas.length > 1) {
      for (const ruta of rutas) {
        const r = resultados.find((x) => x.ruta === ruta);
        r.duros.push(`<title> duplicado con ${rutas.filter((x) => x !== ruta).join(", ")}: "${title}"`);
      }
    }
  }
}

export async function lint(seoMdPath, pagesModulePath) {
  const cfg = cargarConfig(seoMdPath);
  const paginas = await cargarPaginas(pagesModulePath);
  const resultados = paginas.map((pagina) => lintearPagina(pagina, cfg));
  chequearTitulosDuplicados(resultados);
  return resultados;
}

async function main() {
  const [, , seoMdArg, pagesArg] = process.argv;
  const seoMdPath = seoMdArg ?? path.resolve("SEO.md");
  const pagesModulePath = pagesArg ?? path.resolve("example/pages.js");

  const resultados = await lint(seoMdPath, pagesModulePath);
  const totalDuros = resultados.reduce((acc, r) => acc + r.duros.length, 0);

  for (const r of resultados) {
    console.log(`\n${r.ruta}`);
    for (const d of r.duros) console.log(`  ✗ ${d}`);
    for (const b of r.blandos) console.log(`  · ${b}`);
    if (!r.duros.length && !r.blandos.length) console.log("  ✓ sin observaciones");
  }

  console.log(`\n${totalDuros === 0 ? "PASS" : "FAIL"} — ${totalDuros} violación(es) de gate duro.`);
  process.exit(totalDuros === 0 ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
