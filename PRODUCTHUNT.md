---
version: "1.0"
name: producthunt-launch-protocol
description: "Protocolo hermano de SEO.md, mismo patrón de dos capas (frontmatter verificable + prosa), aplicado a un lanzamiento de Product Hunt: tagline, descripción y primer comentario."
---

# PRODUCTHUNT.md — Protocolo para lanzamientos de Product Hunt

## Problema que resuelve

Un lanzamiento de Product Hunt tiene el mismo problema de fondo que el contenido SEO: pedirle
a un agente de IA "escribí un tagline corto y llamativo, no pidas upvotes" en prosa es ambiguo
— nada verifica que el tagline entre en el campo del formulario, y "no pidas upvotes" sin una
lista concreta de qué evitar deja al modelo adivinando qué frase específica cruza la línea.

## Por qué no es una instancia de SEO.md, sino un protocolo hermano

Un post de Product Hunt no tiene `<title>`/`<meta description>` — el tagline y la descripción
SON el contenido, no hay una capa de metadata que un buscador lee y otra que el usuario ve. No
hay `<a href>` internos, no hay JSON-LD, no hay `hreflang`. El linter de SEO.md hace regex sobre
esas etiquetas HTML — pasarle un tagline de texto plano no encuentra nada que validar, o peor,
reporta errores falsos ("no se encontró `<title>`") sobre restricciones que nunca aplicaron. El
*patrón* (techo duro + prosa, nunca piso duro por presencia) se reusa entero; el *schema* y el
*extractor* son nuevos porque el objeto que se valida es distinto.

## Regla de estructura

1. **Fuentes verificadas, no asumidas.** Los límites de este protocolo están tomados del
   [Help Center oficial de Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product)
   y sus [Community Guidelines](https://help.producthunt.com/en/articles/3615694-community-guidelines),
   no de guías de terceros. Donde la fuente oficial no da un número exacto, este documento lo
   dice explícitamente en vez de inventar una cifra con falsa precisión — ver el campo
   `tagline.max_chars` más abajo.

2. **`negative.terms` bloquea en TODO el post, no solo en una superficie corta**, a diferencia
   de la regla 4 de SEO.md. En SEO.md el bloqueo se restringe a `meta.title`/`meta.description`
   porque el cuerpo puede usar el término de forma comparativa legítima ("a diferencia de una
   plantilla Excel..."). Acá no aplica esa excepción: no existe un uso legítimo de "votá por
   nosotros" en tu propio tagline o descripción de lanzamiento — Product Hunt lo prohíbe sin
   matices ("asking for upvotes... is not acceptable", Community Guidelines) y remueve el post.
   El techo pasa a ser un piso de exclusión total, con la misma justificación de siempre
   (evitar falsos positivos) invertida: acá no HAY falsos positivos posibles.

3. **Galería mínima es un dato numérico declarado por quien publica, no algo que el linter
   pueda extraer de texto.** `gallery.min_images` se valida contra un campo `imageCount` que
   el módulo de contenido declara (ver `example/producthunt/post.js`), no contra HTML.

### Ejemplo de frontmatter

```yaml
---
version: "1.0"
platform: "Product Hunt"
locale: "es"
tagline:
  max_chars: 60   # cifra ampliamente citada en guías de terceros; el Help Center oficial de PH
                   # NO da un número exacto para el tagline (solo "muy corto, que enganche") —
                   # tratar 60 como techo conservador, no como hecho confirmado en fuente oficial
description:
  max_chars: 260   # confirmado: help.producthunt.com/en/articles/479557
negative:
  terms: ["upvote", "vota por nosotros", "dale like", "apoyanos con tu voto", "ayudanos a llegar a top"]
  # hard_scope no aplica acá — ver regla 2: es todo el post, siempre
gallery:
  min_images: 2   # confirmado: help.producthunt.com/en/articles/479557
---

## Audiencia e intención de búsqueda
(prosa: quién ve esto — makers/early adopters navegando /todos los lanzamientos del día,
no gente buscando por keyword — el tagline compite por atención en una lista, no en un SERP)

## Tono y estructura
(prosa: directo, sin gimmicks, qué problema resuelve el producto en una frase)
```

## Trade-off aceptado

El `tagline.max_chars: 60` de este protocolo es una cifra prudente, no verificada — se prefiere
un techo conservador que puede rechazar un tagline técnicamente válido de 65 caracteres, a
confiar en un número no confirmado y dejar pasar algo que el formulario real rechaza. Si en
algún momento se confirma el límite real (por ejemplo inspeccionando el `maxlength` del campo
en el formulario de creación real, con sesión iniciada), este valor se actualiza acá.
