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

# LINKEDIN.md — Notas Rápidas (ejemplo)

Instancia mínima para probar `../../lint/linkedin-lint.js`, mismo producto ficticio que
`../SEO.md` y `../producthunt/`.

## Audiencia e intención de búsqueda

Gente que ya sabe qué es una app de notas — busca entender si esta resuelve algo puntual
que le molesta de las que ya usa.

## Tono y estructura

Rioplatense, directo, primera persona.
