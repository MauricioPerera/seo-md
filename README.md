# SEO.md

Protocolo de dos capas para generar contenido web con restricciones SEO
verificables usando agentes de IA — sin caer en keyword stuffing ni en
prosa forzada para esquivar un checker.

El problema real: pedirle a un modelo "escribí un título corto, usá estas
keywords, no menciones X" en prosa es ambiguo — no hay forma de saber si
cumplió. Convertir cada regla en un gate estricto (longitud exacta, keyword
obligatoria, palabra prohibida en cualquier lugar) genera el problema
opuesto: el modelo optimiza para pasar el checker, no para escribir bien.

**SEO.md separa dos capas que nunca se mezclan:**

- **Frontmatter YAML** — límites objetivos que un script puede verificar sin
  ambigüedad (longitud de título/descripción, techo de densidad de keywords,
  términos prohibidos por superficie, links internos, JSON-LD).
- **Prosa Markdown** — audiencia, tono, intención de búsqueda: señales que
  un linter no puede evaluar y que el modelo necesita para escribir bien,
  no solo para pasar el check.

La distinción clave que evita el keyword stuffing: **techos son gates
duros, pisos son señales blandas.** "No más de N menciones" es seguro como
bloqueo — cumplirlo es compatible con escribir natural. "Debe mencionar
esta keyword" NO lo es — fuerza al modelo a insertar la frase a la fuerza.
Ver [`SEO.md`](./SEO.md) para el protocolo completo, con el razonamiento
detrás de cada regla.

## Estructura de este repo

```
SEO.md              el protocolo — leé esto primero
lint/seo-lint.js     linter de referencia, genérico (no asume ningún framework)
example/             instancia mínima de SEO.md + páginas de ejemplo, sin dependencias
```

## Probarlo

```bash
npm install
npm run lint
```

Corre el linter contra `example/SEO.md` y `example/pages.js` — un producto
ficticio ("Notas Rápidas") con 2 páginas, sin build step ni framework.

## Usarlo en tu propio proyecto

El linter es genérico: `node lint/seo-lint.js <tu-SEO.md> <tu-modulo-de-paginas.js>`.
Tu módulo de páginas solo necesita exportar:

```js
export const PAGINAS = [
  { ruta: "/", render: () => "<html>...</html>" },     // función que devuelve HTML
  { ruta: "/otra", html: "<html>...</html>" },          // o el HTML ya renderizado
];
```

El linter valida, contra tu `SEO.md`:

- `<title>` y `<meta name="description">` dentro de sus presupuestos de caracteres
  (incluyendo `separator`/`suffix` si tu título los usa)
- keywords primarias por debajo del techo de densidad, nunca exigidas por presencia
- términos prohibidos bloqueados en `meta.title`/`meta.description`, informados
  (no bloqueados) en el cuerpo — evita falsos positivos en frases comparativas
- `<html lang>` contra el `locale` declarado
- que cada página no-pilar linkee al menos a una `pillar_page`
- que no haya `<title>` duplicado entre páginas
- que el JSON-LD (si está presente) sea válido

## Un caso real

[reference-admin](https://github.com/MauricioPerera/design/tree/master/reference-admin)
tiene una instancia completa de este protocolo sobre un proyecto real con
Node/Express, incluyendo el mismo linter integrado a CI (GitHub Actions).

## Licencia

MIT — ver [`LICENSE`](./LICENSE).
