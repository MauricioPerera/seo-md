---
version: "1.0"
domain: "https://mauricioperera.github.io/seo-md"
locale: "pt"
meta:
  title:
    max_chars: 60
    separator: " | "
    suffix: "SEO.md"
  description:
    max_chars: 155
keywords:
  primary: ["conteúdo seo com ia", "protocolo seo para ia"]
  secondary: ["keyword stuffing", "seo verificável"]
  negative:
    hard_scope: ["meta.title", "meta.description"]
    terms: ["100% garantido", "garante o cumprimento"]
  max_density: { count: 3, per_words: 500 }
schema:
  default_type: "SoftwareApplication"
  name: "SEO.md"
  description: "Protocolo aberto de duas camadas para gerar conteúdo SEO verificável com IA."
  applicationCategory: "DeveloperApplication"
  operating_system: "Qualquer"
linking: {}
---

# SEO.md — site explicativo (PT)

Instância para `docs/pt/index.html`, a versão em português do site no GitHub Pages.

`linking` fica vazio de propósito: a navegação usa caminhos relativos (`../`, `../en/`)
para o site funcionar tanto local quanto no subpath do GitHub Pages (`/seo-md/...`) —
o linter de referência só reconhece links absolutos (`href="/..."`), então um limite
de "links por página" aqui seria uma checagem que nunca poderia falhar. Melhor omitir
do que deixar uma regra que parece verificar algo sem verificar nada de fato.

## Público e intenção de busca

Pessoas não técnicas avaliando se isso serve para elas — não chegam buscando "YAML
frontmatter", chegam se perguntando por que o conteúdo gerado pela IA "soa estranho"
ou "repete demais". O texto visível evita jargão (nada de "gate duro", "frontmatter"
sem explicar).

## Tom e estrutura

Direto, com exemplos concretos do problema antes de explicar a solução. Sem
superlativos vazios ("a melhor ferramenta") — o argumento é o problema real que
resolve, não uma promessa vazia.

## Estratégia de links

O único link "interno" real é o seletor de idioma (ES/EN/PT) — não há hierarquia de
conteúdo dentro deste site que justifique pillar pages.
