# Go: Do Zero ao Avançado

Livro online em português sobre **Go (Golang)** — do "olá mundo" até concorrência, gRPC, microsserviços e performance.

- **165 capítulos** distribuídos em **14 trilhas**
- Conteúdo profundo, em pt-BR, com exemplos do mundo real
- Cada capítulo: introdução longa, 3-7 blocos de código com comentários, pontos-chave, alertas didáticos
- Busca, navegação por teclado, dark/light, copy de código

Inspirado na estrutura do livro irmão [`python-book`](https://github.com/Wallysondevs/python-book).

## Trilhas

1. Boas-vindas e Fundamentos
2. Instalação e Primeiros Passos
3. Sintaxe e Tipos Básicos
4. Controle de Fluxo
5. Estruturas de Dados (arrays, slices, maps, structs, ponteiros)
6. Funções (closures, variadic, defer/recover)
7. Métodos e Interfaces (+ generics)
8. Pacotes, Erros e Stdlib
9. Arquivos, Generics e Concorrência (goroutines, channels, select, context)
10. Testes, HTTP e Tooling (testing, fuzz, httptest, chromedp)
11. Web, APIs e Banco de Dados (Gin, Echo, Fiber, chi, GORM, pgx, Mongo, Redis)
12. CLI, Dados e Integrações (cobra, viper, slog, prometheus, gRPC)
13. Performance, Tooling e Boas Práticas (pprof, escape analysis, GC, vuln)
14. Casos Práticos e Apêndice

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4
- wouter (routing por hash)
- framer-motion (animações)
- lucide-react (ícones)

## Rodando localmente

```bash
pnpm install   # ou npm install / yarn
pnpm dev       # http://localhost:5173
pnpm build     # gera /dist
```

## Estrutura de conteúdo

```
src/data/
├── types.ts                # interfaces Chapter / Section
├── chapters.ts             # aggregator (sections + chapters)
└── sections/
    ├── boas-vindas.ts      # 1 arquivo por trilha
    ├── instalacao.ts
    └── ...
```

Cada `Chapter` tem: `slug`, `section`, `title`, `difficulty`, `subtitle`, `intro`, `codes[]`, `points[]`, `alerts[]`.

## Contribuindo

Pull requests são bem-vindos! Para adicionar/editar capítulos basta editar o arquivo da trilha em `src/data/sections/`.

## Licença

MIT — feito com 💙 por [@Wallysondevs](https://github.com/Wallysondevs).
