---
version: "1.0"
name: seo-content-protocol
description: "Protocolo de dos capas (frontmatter con reglas duras verificables + prosa con contexto semántico) para que un agente de IA genere contenido web que respeta restricciones técnicas de SEO sin degradar el tono ni caer en sobre-optimización."
---

# SEO.md — Protocolo de generación de contenido con restricciones SEO verificables

## Problema que resuelve

Pedirle a un agente de IA "escribí un título corto, usá estas keywords, no menciones X"
como instrucción en prosa es ambiguo: el modelo no tiene forma de saber si cumplió, y el
humano tiene que revisar cada pieza a mano. La alternativa ingenua — convertir cada regla
en un gate de validación estricto (longitud exacta, keyword debe aparecer, palabra
prohibida en cualquier lugar) — genera un problema nuevo: el modelo optimiza para pasar el
checker, no para escribir bien. Eso produce el anti-patrón clásico de SEO generado por
IA — keyword stuffing, frases forzadas para esquivar una palabra prohibida, títulos que
técnicamente miden 60 caracteres pero leen mal.

## Regla de estructura

1. **Dos capas separadas, nunca mezcladas: frontmatter YAML (verificable por código) y
   prosa Markdown (contexto para el modelo).** El frontmatter define límites objetivos que
   un script puede chequear sin ambigüedad. La prosa define audiencia, tono e intención de
   búsqueda — señales que un linter no puede evaluar y que el modelo necesita para escribir
   bien, no solo para pasar el checker.

2. **Dentro del frontmatter, distinguir techos de pisos.** Un techo ("no más de N
   caracteres", "no más de N menciones cada M palabras") es seguro como gate duro que
   bloquea la entrega y fuerza un retry — cumplirlo es compatible con escribir natural. Un
   piso ("debe mencionar esta keyword", "debe cubrir este tema") NO debe ser un gate duro
   por presencia literal: fuerza al modelo a insertar la frase a la fuerza. Los pisos se
   validan por señal semántica (¿el tema está cubierto?) y se reportan como score
   informativo, nunca bloquean la entrega por sí solos.

   `max_density: { count, per_words }` en páginas más CORTAS que `per_words` no se prorratea
   hacia abajo — el techo es simplemente `count` total (una página de 180 palabras no
   "solo puede" mencionar la keyword 0.6 veces). Para páginas más largas que `per_words`,
   escala hacia arriba una vez por cada ventana completa:
   `techo = count × max(1, ceil(palabras_totales / per_words))`.

3. **Un techo de longitud incluye TODO lo que se renderiza, no solo la parte que escribe
   el modelo.** Si `meta.title` tiene un `suffix` fijo (nombre de marca) y un `separator`,
   el `max_chars` es el total renderizado (`título + separator + suffix`), no el título
   solo. El arnés calcula el presupuesto real disponible para el modelo (`max_chars -
   len(separator) - len(suffix)`) ANTES de instruirlo, y valida al cargar el archivo que
   ese presupuesto no sea negativo o cero — un `SEO.md` mal configurado debe fallar ahí, no
   en el primer intento de generación.

4. **Las palabras prohibidas (`negative`) se bloquean por superficie, no en todo el
   documento por igual.** En metadatos cortos (`meta.title`, `meta.description`) un
   bloqueo duro por substring con límite de palabra es seguro: no hay espacio en 60-155
   caracteres para un uso comparativo legítimo, así que si el término aparece ahí casi
   siempre describe la oferta directamente. En el cuerpo del contenido, el mismo bloqueo
   ciego genera falsos positivos (una frase comparativa como "a diferencia de una
   plantilla Excel..." es válida) — ahí el chequeo pasa a ser semántico: ¿el término
   describe la oferta propia, o es comparación/negación/mención de un competidor? Solo el
   primer caso frena la entrega.

5. **El arnés de ejecución es el linter, no el modelo.** El flujo es: (a) parsear el
   frontmatter a un objeto verificable y la prosa a texto plano; (b) inyectar la prosa +
   las keywords en el contexto del modelo para guiar semántica y tono; (c) generar; (d)
   validar la salida contra los techos duros del frontmatter — si falla, devolver el error
   exacto ("el título mide 75 caracteres, tenés 40 disponibles para el título después del
   sufijo") y reintentar; (e) reportar los scores blandos (cobertura de keywords, flags de
   negative-en-body) sin bloquear si todos los techos duros pasaron.

6. **Herramientas CLI que operan sobre el `SEO.md` de un proyecto, no reimplementadas por
   sitio.** Un `lint` que valida contenido ya escrito contra los techos duros + reporta los
   scores blandos, y un `export-schema` que genera el JSON-LD del `<head>` a partir de
   `schema:` — este último sin LLM de por medio, es templating puro sobre config y por eso
   no tiene ambigüedad posible. Requiere que `schema:` tenga `default_type`, `name` y
   `description` además de `applicationCategory` — sin esos dos últimos no hay JSON-LD
   válido que generar (implementación de referencia: `lint/seo-export-schema.js`, en
   este mismo repo).

### Ejemplo de frontmatter

```yaml
---
version: "1.0"
domain: "https://tu-sitio.com"
locale: "es-UY"
meta:
  title:
    max_chars: 60              # incluye separator + suffix, no solo el título (regla 3)
    separator: " | "
    suffix: "Nombre del sitio"
  description:
    max_chars: 155
keywords:
  primary: ["keyword principal uno", "keyword principal dos"]
  secondary: ["keyword secundaria"]
  negative:
    hard_scope: ["meta.title", "meta.description"]   # bloqueo duro solo acá (regla 4)
    terms: ["gratis", "barato", "manual"]
  max_density: { count: 3, per_words: 500 }           # techo, no piso (regla 2)
schema:
  default_type: "SoftwareApplication"
  name: "Nombre del producto"                         # obligatorio para export-schema
  description: "Qué es, en una frase."                # obligatorio para export-schema
  applicationCategory: "BusinessApplication"           # opcional
linking:
  max_internal_links_per_page: 5
  pillar_pages: ["/pagina-pilar-uno", "/pagina-pilar-dos"]
---

## Audiencia e intención de búsqueda
(prosa: quién busca esto, qué transmite el contenido — transaccional vs. informativo)

## Tono y estructura
(prosa: registro, longitud de párrafos, uso de listas — señales que el linter no valida)

## Estrategia de enlazado
(prosa: cuándo y cómo linkear a las pillar_pages, con qué anchor text)
```

## Trade-off aceptado

Separar techos de pisos, y meta-tags de body, significa que el `SEO.md` no da una garantía
binaria de "cumple/no cumple" — solo los techos duros la dan. La cobertura de keywords y
el uso correcto de negative-terms en el cuerpo quedan como score revisado por un humano o
por un juicio de LLM, no como un check formal. Se acepta esa pérdida de certeza porque la
alternativa (gates duros por presencia/ausencia literal) es la causa directa del keyword
stuffing y la prosa forzada — el problema que este protocolo existe para evitar.
