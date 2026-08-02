---
version: "1.0"
name: linkedin-content-protocol
description: "Protocolo hermano de SEO.md para LinkedIn: dos formatos con reglas duras distintas (copy corto de feed con hashtags, artículo de newsletter largo con estructura fija), tomado de una skill real de producción."
---

# LINKEDIN.md — Protocolo para contenido de LinkedIn

## Problema que resuelve

LinkedIn no es un solo formato de contenido — es al menos dos, con restricciones técnicas
que no se parecen entre sí: un copy de feed que se trunca a los pocos segundos de lectura y
compite por hashtags, y un artículo de newsletter largo con estructura editorial fija. Tratar
ambos con las mismas reglas (o sin reglas verificables, solo prosa) reproduce el mismo
problema que motiva a SEO.md: un agente de IA puede escribir un artículo técnicamente válido
que igual falla por exceder el largo óptimo, meter una tabla que el editor no renderiza, o
usar una de las diez frases corporativas vacías que el registro editorial prohíbe.

## Por qué son dos schemas, no una instancia con dos "modos"

`feed_copy` y `newsletter_article` no comparten casi ninguna restricción real: el copy no
tiene título ni SEO description, el artículo no tiene límite de hashtags relevante (los
hashtags del artículo son decorativos, no algorítmicos como en el feed). Forzarlos a un
único schema con campos opcionales para todo produce un YAML donde la mitad de los campos
no aplican según qué se esté validando — más confuso que dos secciones separadas y
explícitas, cada una con solo los campos que le corresponden.

## Regla de estructura

1. **`forbidden_structure` en LinkedIn SÍ soporta `raw_html` y `literal_markdown`**, a
   diferencia del linter de SEO.md para páginas web (que los descarta por ser contradictorios
   en un medio que ya es HTML — ver SEO.md, regla 8). El editor de LinkedIn escapa/ignora HTML
   crudo y no procesa Markdown (`**negrita**` se publica como asteriscos literales) — ambos
   son errores reales y detectables en este medio, no una regla que nunca podría fallar.

2. **`title.max_chars` es techo duro; `title.optimal_min`/`optimal_max` es señal blanda**
   (SEO.md regla 9). Un título de 140 caracteres es válido (bajo el techo de 150) aunque esté
   lejos del rango óptimo de 40-60 — se informa, no se bloquea.

3. **`seo_description` SÍ es un rango duro (min Y max), no solo un techo** (SEO.md regla 7):
   LinkedIn indexa artículos en Google, y una descripción demasiado corta pierde contexto en
   el SERP igual que una demasiado larga se trunca — ambos extremos son un fallo real, no una
   preferencia de estilo.

4. **`context_paragraph` (min/max en palabras) es un piso estructural, no un intento de
   forzar densidad** (SEO.md regla 7): un párrafo de contexto de 10 palabras no cumple su
   función aunque técnicamente exista. Se acepta el riesgo de relleno que la regla 7 ya
   señala como trade-off.

5. **Los guiones largos (`—`) se prohíben por carácter, no como `negative.terms`.** El
   matching de `negative.terms` usa límite de palabra (`\b`), que no tiene sentido para un
   signo de puntuación — se implementa como chequeo de substring aparte
   (`negative.forbidden_chars`).

6. **El contenido es un objeto estructurado, no texto a parsear con regex de headings.**
   `newsletter_article` recibe `{ title, seoDescription, hook, contextParagraph, sections:
   [{heading, body}], closing }` — contar secciones/heading es leer `sections.length`, no
   adivinar niveles de Markdown con expresiones regulares frágiles.

### Ejemplo de frontmatter

```yaml
---
version: "1.0"
platform: "LinkedIn"
locale: "es-AR"
forbidden_structure: ["table", "raw_html", "literal_markdown"]
negative:
  terms: ["robusto", "sinergias", "aprovechar al máximo el potencial de",
          "en el dinámico mundo de", "holístico", "muy importante",
          "sumamente relevante", "extremadamente útil",
          "espero que este artículo haya sido de ayuda", "no olvides suscribirte"]
  forbidden_chars: ["—"]
feed_copy:
  max_chars: 3000            # límite real de plataforma
  hashtags: { max: 5 }        # techo — exceso de hashtags reduce alcance, mismo riesgo que stuffing
newsletter_article:
  title: { max_chars: 150, optimal_min: 40, optimal_max: 60 }
  seo_description: { min_chars: 140, max_chars: 160 }
  body: { max_chars: 110000, optimal_min_words: 1200, optimal_max_words: 1800 }
  context_paragraph: { min_words: 50, max_words: 80 }
  sections: { min: 3, max: 5 }
---

## Audiencia e intención de búsqueda
(prosa: audiencia técnica LATAM, lee código, no necesariamente experta en cada tema)

## Tono y estructura
(prosa: registro rioplatense — vos/tenés/podés —, analítico y directo, opiniones en
primera persona con fundamento; ver la skill `linkedin-newsletter-article` para el detalle
completo del registro editorial)
```

## Trade-off aceptado

Dos schemas separados significan que agregar un tercer formato de LinkedIn (comentarios,
mensajes InMail) requiere una tercera sección, no una extensión de las dos existentes — más
verboso que un único schema genérico. Se acepta porque un schema genérico con campos
opcionales para todo es exactamente el tipo de ambigüedad que este protocolo existe para
eliminar: mejor explícito y repetido que implícito y adivinado.
