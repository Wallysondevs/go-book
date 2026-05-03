// Aggregator — content lives in sections/<sectionId>.ts (one file per trail)
import type { Chapter, Section } from "./types";
import { chapters as s0 } from "./sections/boas-vindas";
import { chapters as s1 } from "./sections/instalacao";
import { chapters as s2 } from "./sections/sintaxe";
import { chapters as s3 } from "./sections/controle";
import { chapters as s4 } from "./sections/estruturas";
import { chapters as s5 } from "./sections/funcoes";
import { chapters as s6 } from "./sections/metodos-interfaces";
import { chapters as s7 } from "./sections/pacotes-erros";
import { chapters as s8 } from "./sections/io-concorrencia";
import { chapters as s9 } from "./sections/testes-web";
import { chapters as s10 } from "./sections/frameworks-web";
import { chapters as s11 } from "./sections/data-cli";
import { chapters as s12 } from "./sections/tooling-perf";
import { chapters as s13 } from "./sections/casos-apendice";

export type { Chapter, Section, Difficulty, AlertType, CodeSample, AlertSpec } from "./types";

export const sections: Section[] = [
  {
    id: "boas-vindas",
    icon: "BookOpen",
    label: "Boas-vindas e Fundamentos",
    chapterSlugs: ["bem-vindo", "por-que-go", "historia-go", "go-vs-outras", "onde-go-roda"],
  },
  {
    id: "instalacao",
    icon: "Terminal",
    label: "Instalação e Primeiros Passos",
    chapterSlugs: [
      "instalacao-go",
      "go-tool-cli",
      "primeiro-programa",
      "editores-gopls",
      "go-mod-init",
      "pacotes-imports",
      "gopath-vs-modules",
      "estrutura-projeto",
      "go-run-build",
      "hello-world-completo",
    ],
  },
  {
    id: "sintaxe",
    icon: "Code2",
    label: "Sintaxe e Tipos Básicos",
    chapterSlugs: [
      "sintaxe-basica",
      "pacote-main-imports",
      "variaveis-var-curta",
      "constantes-iota",
      "tipos-numericos",
      "strings-runes",
      "bytes-vs-strings",
      "formatacao-fmt",
      "operadores",
      "conversao-tipos",
      "zero-values",
      "nomes-exportados",
    ],
  },
  {
    id: "controle",
    icon: "GitBranch",
    label: "Controle de Fluxo",
    chapterSlugs: [
      "if-else",
      "switch-case",
      "type-switch",
      "for-loop",
      "for-range",
      "break-continue-labels",
      "goto",
      "defer-fluxo",
      "return-multiplos",
      "expression-statements",
    ],
  },
  {
    id: "estruturas",
    icon: "Database",
    label: "Estruturas de Dados",
    chapterSlugs: [
      "arrays",
      "slices-intro",
      "slices-append-make",
      "slices-internas",
      "slices-truques",
      "maps",
      "maps-padroes",
      "structs",
      "structs-tags",
      "ponteiros",
      "composicao-embedding",
      "estruturas-aninhadas",
    ],
  },
  {
    id: "funcoes",
    icon: "Sparkles",
    label: "Funções",
    chapterSlugs: [
      "funcoes-declaracao",
      "valores-retorno",
      "multiplos-retornos",
      "retornos-nomeados",
      "variadic",
      "funcoes-anonimas",
      "closures",
      "recursao",
      "funcoes-primeira-classe",
      "defer-recover",
    ],
  },
  {
    id: "metodos-interfaces",
    icon: "Cpu",
    label: "Métodos e Interfaces",
    chapterSlugs: [
      "metodos",
      "receivers-ponteiro",
      "interfaces-basico",
      "interfaces-implicitas",
      "interface-vazia-any",
      "type-assertion",
      "composicao-interfaces",
      "generics-intro",
      "generics-constraints",
      "erros-customizados",
    ],
  },
  {
    id: "pacotes-erros",
    icon: "Wrench",
    label: "Pacotes, Erros e Stdlib",
    chapterSlugs: [
      "pacotes-organizacao",
      "imports-aliases",
      "documentacao-godoc",
      "erros-philosophy",
      "panic-recover",
      "log-pkg",
      "fmt-detalhes",
      "strings-pkg",
      "strconv",
      "time-pkg",
      "math-rand",
      "json-encoding",
      "csv-encoding",
      "os-flag",
    ],
  },
  {
    id: "io-concorrencia",
    icon: "Wrench",
    label: "Arquivos, Generics e Concorrência",
    chapterSlugs: [
      "arquivos-leitura",
      "arquivos-escrita",
      "bufio",
      "io-reader-writer",
      "embed-arquivos",
      "goroutines-intro",
      "channels-intro",
      "channels-direcao-buffer",
      "select",
      "sync-mutex",
      "sync-waitgroup",
      "context-pkg",
      "race-detector",
      "pool-workers",
    ],
  },
  {
    id: "testes-web",
    icon: "Globe",
    label: "Testes, HTTP e Tooling",
    chapterSlugs: [
      "testing-pkg",
      "table-driven-tests",
      "subtests-tparallel",
      "helpers-cleanup",
      "benchmarks",
      "fuzz-testing",
      "httptest",
      "mocks-stub",
      "coverage",
      "net-http-client",
      "websockets-go",
      "chromedp",
    ],
  },
  {
    id: "frameworks-web",
    icon: "Globe",
    label: "Web, APIs e Banco de Dados",
    chapterSlugs: [
      "net-http-server",
      "gin",
      "gin-rotas-middleware",
      "echo",
      "fiber",
      "chi-router",
      "gorm",
      "sqlx",
      "database-sql",
      "postgres-pgx",
      "sqlite-go",
      "redis-go",
      "mongo-go",
      "templates-html",
    ],
  },
  {
    id: "data-cli",
    icon: "BarChart3",
    label: "CLI, Dados e Integrações",
    chapterSlugs: [
      "cobra-cli",
      "viper-config",
      "urfave-cli",
      "log-slog",
      "prometheus-metricas",
      "json-streaming",
      "excel-xlsx",
      "yaml-toml",
      "protobuf",
      "grpc-intro",
      "grpc-streaming",
      "ml-inference",
      "pdf-go",
      "templates-text",
    ],
  },
  {
    id: "tooling-perf",
    icon: "Brain",
    label: "Performance, Tooling e Boas Práticas",
    chapterSlugs: [
      "gofmt-goimports",
      "go-vet",
      "golangci-lint",
      "staticcheck",
      "pprof-cpu",
      "pprof-mem",
      "benchmarks-cmp",
      "escape-analysis",
      "garbage-collector",
      "build-tags",
      "cross-compile",
      "cgo",
      "modules-vendor",
      "security-vuln",
    ],
  },
  {
    id: "casos-apendice",
    icon: "BookOpen",
    label: "Casos Práticos e Apêndice",
    chapterSlugs: [
      "projeto-cli-todo",
      "projeto-api-rest",
      "projeto-bot-discord",
      "projeto-scraper",
      "projeto-dashboard",
      "projeto-microservico",
      "empacotando",
      "docker-go",
      "ci-github-actions",
      "debugging-delve",
      "error-handling-patterns",
      "go-proverbs",
      "recursos",
      "proximos-passos",
    ],
  },
];

export const chapters: Chapter[] = [
  ...s0, ...s1, ...s2, ...s3, ...s4, ...s5, ...s6,
  ...s7, ...s8, ...s9, ...s10, ...s11, ...s12, ...s13,
];

export const chapterMap: Record<string, Chapter> = Object.fromEntries(
  chapters.map((c) => [c.slug, c])
);

export function chapterIndex(slug: string): number {
  return chapters.findIndex((c) => c.slug === slug);
}
