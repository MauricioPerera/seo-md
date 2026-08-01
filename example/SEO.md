---
version: "1.0"
domain: "https://notas-rapidas.example"
locale: "es-AR"
meta:
  title:
    max_chars: 60
    separator: " | "
    suffix: "Notas Rápidas"
  description:
    max_chars: 155
keywords:
  primary: ["app de notas", "notas rápidas online"]
  secondary: ["organizar notas", "notas colaborativas"]
  negative:
    hard_scope: ["meta.title", "meta.description"]
    terms: ["gratis para siempre", "sin límites"]
  max_density: { count: 3, per_words: 500 }
schema:
  default_type: "SoftwareApplication"
  applicationCategory: "ProductivityApplication"
linking:
  max_internal_links_per_page: 5
  pillar_pages:
    - "/funciones"
---

# SEO.md — Notas Rápidas (ejemplo mínimo)

Instancia mínima de `../SEO.md` para probar `../lint/seo-lint.js` de punta a punta sin
depender de ningún framework — `pages.js` son funciones puras que devuelven HTML plano.
"Notas Rápidas" es un producto ficticio que solo existe para este ejemplo.

## Audiencia e intención de búsqueda

Alguien buscando una app de notas simple — intención mayormente informativa/comparativa
en la home, transaccional en la página de funciones (evaluando si conviene registrarse).

## Tono y estructura

Directo, sin jerga. Párrafos cortos. Sin superlativos vacíos.

## Estrategia de enlazado

La home linkea a `/funciones` (la pillar page) con anchor text descriptivo.
