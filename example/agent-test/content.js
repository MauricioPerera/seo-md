// Generado siguiendo LINKEDIN.md a partir de README.md y SEO.md (el propio
// proyecto seo-md como tema). Llamada ambigua que tuve que resolver por mi
// cuenta: LINKEDIN.md no especifica el formato literal de los strings en
// `hashtags` (con o sin "#", mayúsculas). Usé el mismo formato que
// example/linkedin/content.js (minúsculas, sin "#") por consistencia con la
// única instancia de referencia existente en el repo.

export const FEED_COPY = {
  text: "Le pedís a un agente de IA que escriba SEO sin ambigüedad. Le decís usá estas keywords, no menciones tal palabra, título corto. Prosa pura: no hay forma de verificar si cumplió.\n\nLa corrección obvia es peor: convertir cada regla en un gate estricto, la keyword tiene que aparecer sí o sí, la palabra prohibida no puede estar en ningún lado. Ahí el modelo deja de escribir para vos y empieza a escribir para el checker. Eso es keyword stuffing.\n\nArmé SEO.md para separar las dos capas que nunca deberían mezclarse. El frontmatter YAML tiene los límites que un script puede chequear sin ambigüedad: largo de título y descripción, techo de densidad de keywords, términos prohibidos por superficie. La prosa Markdown lleva lo que ningún linter puede evaluar: audiencia, tono, intención de búsqueda.\n\nLa regla que evita el stuffing en una frase: los techos son gates duros, no más de N menciones. Los pisos son señales blandas, debe cubrir este tema. Exigir una keyword por presencia literal es lo que rompe la prosa.\n\nMismo patrón después para Product Hunt y para LinkedIn, con linter propio de cada uno, sin dependencias. Repo y sitio en los comentarios.",
  hashtags: ["seo", "iaaplicada", "opensource", "desarrolloweb", "automatizacion"],
};

export const NEWSLETTER = {
  title: "SEO.md: el protocolo que frena el keyword stuffing con IA",
  seoDescription:
    "SEO.md es un protocolo de dos capas para generar SEO web verificable por código, sin caer en keyword stuffing ni en prosa forzada para esquivar un checker.",
  hook:
    "Pedirle a un agente de IA que escriba SEO sin ambigüedad no es un problema de mejor prompt. Es un problema de arquitectura, y con solo prosa no se resuelve.",
  contextParagraph:
    "Vengo generando contenido web con agentes de IA hace un tiempo y siempre choco con la misma pared. Si la instrucción es prosa, el modelo interpreta como quiere y nadie puede verificar si cumplió. Si la instrucción es un gate estricto por presencia de palabra, el modelo empieza a escribir para pasar el check, no para la persona que va a leer el texto. SEO.md nació de separar esas dos cosas en capas distintas, en vez de seguir mezclándolas.",
  sections: [
    {
      heading: "El problema real",
      body: "Pedirle a un agente escribí un título corto, usá estas keywords, no menciones tal palabra en una sola instrucción de prosa es ambiguo. El modelo no tiene forma de saber si cumplió y una persona tiene que revisar cada pieza a mano, línea por línea, comparando contra una lista de reglas que solo existe en la cabeza de quien escribió el prompt. A esa escala, revisar a mano deja de ser viable apenas el sitio tiene más de un puñado de páginas.\n\nLa solución que parece obvia es convertir cada regla en un gate estricto: longitud exacta, la keyword aparece sí o sí, la palabra prohibida no puede estar en ningún lugar del texto. Esa solución genera un problema nuevo y peor: el modelo deja de optimizar para escribir bien y empieza a optimizar para pasar el checker. Ahí aparece el anti-patrón clásico del contenido generado por IA: keyword stuffing, frases forzadas solo para esquivar una palabra, títulos que miden exactamente sesenta caracteres pero que ningún humano escribiría así. Cambiaste un problema de ambigüedad por un problema de calidad, y en el camino perdiste las dos cosas que en principio querías cuidar: que el contenido sea bueno y que cumpla la regla.",
    },
    {
      heading: "Dos capas que no se mezclan",
      body: "SEO.md separa el problema en dos partes de un mismo documento que nunca se pisan entre sí. El frontmatter en YAML define límites objetivos que un script puede chequear sin ambigüedad: cuántos caracteres puede tener el título y la descripción, cuál es el techo de densidad de una keyword, qué términos quedan prohibidos y en qué parte del documento. Nada de eso necesita criterio humano para evaluarse, es aritmética o coincidencia de texto, así que se puede validar en un pipeline sin que nadie lo revise a ojo.\n\nLa prosa en Markdown, debajo de ese frontmatter, define todo lo que un linter no puede evaluar: quién busca este contenido, qué tono corresponde, si la intención de búsqueda es transaccional o informativa, cómo se enlaza una página con otra dentro del sitio. El agente recibe las dos capas juntas antes de escribir: la prosa le da criterio para producir un texto que se lea bien, el frontmatter le anticipa qué se va a validar apenas termine. Ninguna de las dos capas reemplaza a la otra, y mezclarlas en un único bloque de instrucciones es exactamente el error que este protocolo evita.",
    },
    {
      heading: "Techos duros, pisos blandos",
      body: "La distinción que evita el keyword stuffing cabe en una frase: los techos son gates duros y los pisos son señales blandas. No más de tres menciones de una keyword cada quinientas palabras es seguro como bloqueo, porque cumplir un techo es perfectamente compatible con escribir de forma natural, alcanza con no repetir de más y ya está. Un modelo que respeta un techo no necesita forzar nada, solo dejar de insistir con la misma frase.\n\nDebe mencionar esta keyword como gate duro por presencia literal no es seguro, porque fuerza al modelo a insertar la frase exacta en algún lugar del texto, exista o no un lugar natural para ella. Por eso los pisos de contenido, cobertura de un tema, uso correcto de un término, se validan como señal semántica y se reportan como puntaje informativo, nunca bloquean la entrega por sí solos. Un piso numérico de longitud, en cambio, sí es un gate duro legítimo: una descripción de ciento veinte caracteres mínimo es tan verificable como un máximo, solo que invertido, y no depende de que aparezca ninguna palabra puntual.",
    },
    {
      heading: "Dos protocolos hermanos y un caso real",
      body: "El mismo patrón, techo duro verificable más prosa, nunca piso duro por presencia, no es específico de una página web. PRODUCTHUNT.md lo aplica a un lanzamiento de Product Hunt: tagline, descripción y galería, con su propio linter, porque un posteo no tiene título ni descripción de metadatos que el linter de SEO.md pueda validar directamente. LINKEDIN.md hace lo mismo para LinkedIn, con dos schemas separados en vez de uno: feed_copy para el copy corto con hashtags, newsletter_article para el artículo largo con estructura fija de hook, contexto, entre tres y cinco secciones, y cierre.\n\nEste mismo posteo y este mismo artículo se generaron siguiendo esas reglas, incluida la lista de frases corporativas prohibidas y el guion largo bloqueado como carácter. El repo completo, con los tres linters, una instancia de ejemplo sin dependencias y el sitio que explica el protocolo en español, inglés y portugués sobre GitHub Pages, para quien no quiera leer el YAML directamente, está en la sección de comentarios.",
    },
  ],
  closing:
    "Si generás contenido con agentes de IA, ¿dónde trazás vos el límite entre regla verificable y criterio de prosa?",
};
