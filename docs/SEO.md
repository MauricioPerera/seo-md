---
version: "1.0"
domain: "https://mauricioperera.github.io/seo-md"
locale: "es"
meta:
  title:
    max_chars: 60
    separator: " | "
    suffix: "SEO.md"
  description:
    max_chars: 155
keywords:
  primary: ["contenido seo con ia", "protocolo seo para ia"]
  secondary: ["keyword stuffing", "seo verificable"]
  negative:
    hard_scope: ["meta.title", "meta.description"]
    terms: ["100% garantizado", "garantiza el cumplimiento"]
  max_density: { count: 3, per_words: 500 }
schema:
  default_type: "SoftwareApplication"
  applicationCategory: "DeveloperApplication"
linking: {}
---

# SEO.md — sitio explicativo (ES)

Instancia para `docs/index.html`, la versión en español del sitio de GitHub Pages.

`linking` queda vacío a propósito: la nav usa rutas relativas (`./`, `../en/`) para que
el sitio funcione tanto en local como bajo el subpath de GitHub Pages
(`/seo-md/...`) — el linter de referencia solo reconoce links absolutos
(`href="/..."`), así que un límite de "links por página" acá sería un chequeo que
nunca puede fallar. Se prefiere omitirlo a dejar una regla que parece verificar
algo y en realidad no verifica nada.

## Audiencia e intención de búsqueda

Gente NO técnica evaluando si esto le sirve — de bajada, no llegan buscando "YAML
frontmatter", llegan preguntándose por qué el contenido que genera su IA "suena raro"
o "repite demasiado". El lenguaje tiene que evitar jerga (nada de "gate duro",
"frontmatter" sin explicar) en el cuerpo visible.

## Tono y estructura

Directo, con ejemplos concretos del problema antes de explicar la solución. Sin
superlativos ("la mejor herramienta") — el argumento es el problema real que resuelve,
no una promesa vacía.

## Estrategia de enlazado

El único link "interno" real es el selector de idioma (ES/EN/PT) — no hay jerarquía
de contenido dentro de este sitio como para pillar pages.
