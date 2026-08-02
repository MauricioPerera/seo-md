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
  max_chars: 3000
  hashtags: { max: 5 }
newsletter_article:
  title: { max_chars: 150, optimal_min: 40, optimal_max: 60 }
  seo_description: { min_chars: 140, max_chars: 160 }
  body: { max_chars: 110000, optimal_min_words: 1200, optimal_max_words: 1800 }
  context_paragraph: { min_words: 50, max_words: 80 }
  sections: { min: 3, max: 5 }
---

# LINKEDIN.md — prueba de agente independiente

No es contenido de ejemplo escrito a mano: `content.js` lo escribió un sub-agente sin
contexto de ninguna conversación previa, con acceso únicamente a este archivo y a
`../../README.md`/`../../SEO.md` (el propio proyecto seo-md, como tema real). El objetivo
era responder una pregunta concreta: ¿es este documento, solo, suficiente para que un
agente independiente produzca contenido que cumpla el protocolo sin iterar contra el
linter ni recibir ninguna aclaración? El resultado (verificado corriendo el linter real,
no por autoreporte del agente): sí, en el primer intento — ver
[`../../README.md`](../../README.md#prueba-de-un-agente-independiente) para el detalle.

## Audiencia e intención de búsqueda

Gente que ya usa o evalúa usar agentes de IA para generar contenido web y se topó con el
problema de la ambigüedad de las instrucciones en prosa — intención informativa/técnica.

## Tono y estructura

Rioplatense, directo, primera persona — mismo registro que el resto del proyecto.
