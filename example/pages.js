/**
 * Ejemplo mínimo, sin framework: cada página es una función pura que
 * devuelve un string de HTML completo. `PAGINAS` es el contrato que
 * lint/seo-lint.js espera de cualquier proyecto — ver ese archivo.
 */

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Notas Rápidas",
  applicationCategory: "ProductivityApplication",
  description: "App de notas simple para organizar ideas rápido.",
};

function pagina({ titulo, descripcion, jsonLd, cuerpo }) {
  return `<!doctype html><html lang="es-AR"><head>
<meta charset="utf-8">
<title>${titulo}</title>
<meta name="description" content="${descripcion}">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head><body>
<header><a href="/">Notas Rápidas</a> <a href="/funciones">Funciones</a></header>
<main>${cuerpo}</main>
</body></html>`;
}

function renderHome() {
  return pagina({
    titulo: "La app de notas más simple | Notas Rápidas",
    descripcion:
      "Notas Rápidas es una app de notas online para organizar ideas sin fricción: sin carpetas anidadas, sin configuración previa.",
    jsonLd: JSON_LD,
    cuerpo: `
      <h1>Tomá notas sin fricción</h1>
      <p>Notas Rápidas es una <strong>app de notas</strong> pensada para anotar una idea
      en segundos, no para armar un sistema de organización complejo.</p>
      <p><a href="/funciones">Mirá todo lo que podés hacer</a></p>
    `,
  });
}

function renderFunciones() {
  return pagina({
    titulo: "Búsqueda, etiquetas y notas rápidas online | Notas Rápidas",
    descripcion:
      "Búsqueda instantánea, etiquetas simples y sincronización — las funciones de Notas Rápidas explicadas una por una.",
    cuerpo: `
      <h1>Qué incluye Notas Rápidas</h1>
      <ul>
        <li>Búsqueda instantánea en todas tus notas</li>
        <li>Etiquetas en vez de carpetas anidadas</li>
        <li>Sincronización entre dispositivos</li>
      </ul>
      <p><a href="/">Volver al inicio</a></p>
    `,
  });
}

export const PAGINAS = [
  { ruta: "/", render: renderHome },
  { ruta: "/funciones", render: renderFunciones },
];
