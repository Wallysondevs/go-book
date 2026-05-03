import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "gofmt-goimports",
    section: "tooling-perf",
    title: "gofmt e goimports: formatação que não se discute",
    difficulty: "iniciante",
    subtitle: "Por que todo código Go do mundo tem o mesmo estilo e como isso elimina debates inúteis no time",
    intro: `Em quase toda outra linguagem, formatação é assunto de guerra santa. Em JavaScript a galera briga entre Prettier, ESLint, ponto e vírgula sim ou não. Em Python existe black, autopep8, yapf, e cada projeto adota um estilo. Em Java cada IDE formata diferente. Em Go essa discussão simplesmente não existe, e isso é uma das decisões mais inteligentes do projeto: existe uma única ferramenta oficial chamada gofmt que dita exatamente como o código deve ficar, e o ecossistema inteiro usa ela.

A ideia por trás é simples: o tempo gasto discutindo se a chave fica na mesma linha ou na próxima, se a indentação é com tab ou espaço, se a vírgula vai antes ou depois, é tempo que poderia ser gasto resolvendo o problema do cliente. O gofmt resolve isso de cima para baixo. Ele usa tabs para indentar, alinha campos de struct, organiza imports e impõe um único estilo. Não tem opção de configuração, e isso é proposital. Você não escolhe o estilo, o estilo é Go.

O goimports é o irmão mais esperto do gofmt. Além de formatar, ele também gerencia os imports do seu arquivo: remove os que não são usados (Go nem compila com import sobrando) e adiciona os que estão faltando, buscando no GOPATH e nos módulos do projeto. Na prática, você escreve fmt.Println sem importar nada, salva o arquivo, e o goimports adiciona o import "fmt" no topo. É como ter um assistente silencioso que arruma a bagunça enquanto você pensa.

Idiomático em Go é configurar o seu editor para rodar goimports a cada save. Toda IDE moderna (VS Code com a extensão Go, GoLand, Vim com vim-go, Neovim com gopls) faz isso por padrão. O resultado é que diff de pull request nunca contém ruído de formatação, e revisão de código foca no que importa: lógica, nomes, design.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar goimports (gofmt já vem junto com o Go)
go install golang.org/x/tools/cmd/goimports@latest

# O binário fica em $GOPATH/bin (geralmente ~/go/bin)
# Adicione ao PATH se ainda não estiver
export PATH="$PATH:$(go env GOPATH)/bin"`,
      },
      {
        lang: "bash",
        code: `# Formatar um arquivo no lugar (sobrescreve)
gofmt -w main.go

# Formatar a pasta inteira recursivamente
gofmt -w .

# Apenas mostrar o diff sem aplicar (útil em CI)
gofmt -d main.go

# Listar arquivos que precisam de formatação (sai com código != 0 se houver)
gofmt -l .`,
      },
      {
        lang: "go",
        code: `// Antes do goimports — código bagunçado que um humano escreveria às pressas
package main
import("fmt"
"strings"
   "os")
func main(){
nome:=strings.ToUpper("ana")
   fmt.Println("Olá",nome)
   os.Exit(0)
}
// Depois do goimports — mesmo código, formatado:
//
// package main
//
// import (
//      "fmt"
//      "os"
//      "strings"
// )
//
// func main() {
//      nome := strings.ToUpper("ana")
//      fmt.Println("Olá", nome)
//      os.Exit(0)
// }`,
      },
      {
        lang: "bash",
        code: `# goimports vai além: gerencia os imports automaticamente
goimports -w main.go

# Imagine este arquivo: você usa fmt.Println mas esqueceu o import
# goimports adiciona "fmt" automaticamente
# E se você importou "strings" mas não usa, ele remove
# Compare com Python ou Java, onde imports não usados ficam lá silenciosamente`,
      },
      {
        lang: "bash",
        code: `// .vscode/settings.json — configura VS Code para formatar ao salvar
{
  "[go]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "go.formatTool": "goimports"
}`,
      },
      {
        lang: "bash",
        code: `# .github/workflows/ci.yml — falha o CI se alguém commitar código mal formatado
name: lint
on: [push, pull_request]
jobs:
  fmt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Verificar formatação
        run: |
          # Se gofmt -l listar qualquer arquivo, o CI quebra
          test -z "$(gofmt -l .)"`,
      },
    ],
    points: [
      "gofmt define UM único estilo oficial e não é configurável — isso é proposital.",
      "goimports faz tudo que o gofmt faz e ainda gerencia imports automaticamente.",
      "Configure o editor para formatar ao salvar; nunca formate manualmente.",
      "No CI, use 'gofmt -l .' como gate: se listar arquivo, falha o build.",
      "Idiomático: indentação com tab (não espaço); o gofmt impõe isso.",
      "Armadilha: tentar mudar o estilo do gofmt com flags inexistentes — não tem.",
      "Erro comum: commitar arquivo sem formatar e gerar diff gigante no PR.",
      "Code review em Go nunca discute formatação, só lógica e design.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Adicione um pre-commit hook rodando 'gofmt -l .' para impedir commits desformatados. Cinco linhas de shell que economizam horas de revisão chata.",
      },
      {
        type: "info",
        content: "O comando 'go fmt ./...' é um wrapper sobre gofmt e formata o módulo inteiro. Já vem com o Go, sem instalar nada.",
      },
      {
        type: "success",
        content: "Times Go que adotam goimports no save relatam quase zero discussão sobre estilo em PRs. O assunto vira invisível, como deveria ser.",
      },
    ],
  },
  {
    slug: "go-vet",
    section: "tooling-perf",
    title: "go vet: o detetive de bugs sutis",
    difficulty: "iniciante",
    subtitle: "Análise estática oficial que pega problemas que o compilador deixa passar, antes de virar bug em produção",
    intro: `O compilador do Go é rigoroso: variáveis não usadas quebram o build, imports não usados também, atribuições inválidas idem. Mas existem categorias inteiras de bugs que o compilador, por design, não consegue detectar. São coisas como format strings com tipo errado em fmt.Printf, structs com lock copiada por valor, comparações inúteis (interface == nil quando o tipo concreto não é nil), e shadowing de variáveis. Para isso existe o go vet.

O go vet é uma ferramenta oficial que vem instalada junto com o Go. Diferente de linters externos, ele é mantido pelo time da linguagem e só reporta coisas com altíssima taxa de acerto — quase zero falso positivo. A regra do projeto é: se vet apontou, tem bug. Por isso a saída dele é levada a sério em CI e revisão. Compare com linters de outras linguagens: pylint em Python e ESLint em JS são poderosos mas frequentemente reportam estilo subjetivo. O go vet é cirúrgico.

Por baixo dos panos, ele roda um conjunto de analisadores escritos com o framework golang.org/x/tools/go/analysis. Cada analisador pega uma família de bug. Os mais úteis no dia a dia são printf (formato vs argumentos), copylocks (cópia de mutex), shadow (variável ocultando outra), unreachable (código morto), bools (operações booleanas inúteis) e structtag (tags de struct mal escritas — bug clássico em quem usa JSON ou ORM).

Um detalhe importante: 'go test' já roda 'go vet' automaticamente antes dos testes desde Go 1.10. Então se você já roda testes no CI, parte do vet já está protegendo o código. Mas é boa prática rodar 'go vet ./...' explicitamente no pipeline antes dos testes, para falhar mais cedo e com mensagem mais clara.`,
    codes: [
      {
        lang: "bash",
        code: `# Rodar vet em todo o módulo
go vet ./...

# Rodar um analisador específico (lista todos disponíveis)
go vet -help

# Rodar só o analisador de printf
go vet -printf ./...

# Em CI, falha se o vet reclamar
go vet ./... || exit 1`,
      },
      {
        lang: "go",
        code: `// Bug clássico que vet pega: tipo errado no Printf
package main

import "fmt"

func main() {
        idade := 30
        // %s espera string, mas idade é int — vai imprimir "%!s(int=30)"
        fmt.Printf("Idade: %s\n", idade)
        // vet reporta:
        // main.go:9: Printf format %s has arg idade of wrong type int
}`,
      },
      {
        lang: "go",
        code: `// Outro bug que vet pega: copiar struct com mutex (sync.Mutex)
package main

import (
        "fmt"
        "sync"
)

type Conta struct {
        mu      sync.Mutex // mutex protege saldo
        saldo   int
}

func (c Conta) Saldo() int { // recebe POR VALOR — copia o mutex!
        c.mu.Lock()
        defer c.mu.Unlock()
        return c.saldo
}

func main() {
        c := Conta{saldo: 100}
        fmt.Println(c.Saldo())
        // vet reporta:
        // Saldo passes lock by value: Conta contains sync.Mutex
        // O correto é receber *Conta (ponteiro)
}`,
      },
      {
        lang: "go",
        code: `// Tag de struct com erro de digitação — vet pega
package main

import (
        "encoding/json"
        "fmt"
)

type Pedido struct {
        ID     int    \`json:"id"\`
        Total  float64 \`josn:"total"\` // typo: josn em vez de json
}

func main() {
        p := Pedido{ID: 1, Total: 99.9}
        b, _ := json.Marshal(p)
        fmt.Println(string(b))
        // Sem vet: o campo Total vira "Total" no JSON (não "total")
        // vet reporta:
        // struct field tag \`josn:"total"\` not compatible with reflect.StructTag.Get
}`,
      },
      {
        lang: "go",
        code: `// Shadowing — variável escondendo outra do escopo externo
package main

import "fmt"

func processarPedido(id int) error {
        pedido, err := buscarPedido(id)
        if err != nil {
                return err
        }
        if pedido.Total > 1000 {
                // AQUI: := cria um NOVO err local, escondendo o de fora
                err := validarLimite(pedido)
                if err != nil {
                        fmt.Println("limite excedido")
                }
                // O err externo nunca recebe esse valor — bug silencioso
        }
        return nil
}

func buscarPedido(id int) (*struct{ Total float64 }, error) { return &struct{ Total float64 }{1500}, nil }
func validarLimite(p *struct{ Total float64 }) error          { return fmt.Errorf("acima do limite") }
// vet com -vettool=$(which shadow) reporta o shadowing`,
      },
    ],
    points: [
      "go vet é oficial, vem com o Go e tem quase zero falso positivo.",
      "Se vet apontou algo, trate como bug — não ignore.",
      "go test já roda vet por padrão desde Go 1.10.",
      "Rode 'go vet ./...' no CI antes dos testes para falhar cedo.",
      "Idiomático: tags de struct sempre passam pelo vet (json, db, validate).",
      "Armadilha: copiar struct com sync.Mutex — vira mutex falso.",
      "Erro comum: usar %s para int em Printf e ver '%!s(int=X)' em produção.",
      "Para shadowing, instale a ferramenta extra 'shadow' de golang.org/x/tools.",
    ],
    alerts: [
      {
        type: "warning",
        content: "vet não substitui testes nem code review. Ele pega uma classe específica de bugs estruturais. Você ainda precisa de cobertura de testes e revisão humana.",
      },
      {
        type: "info",
        content: "O analisador shadow não vem habilitado por padrão porque shadowing às vezes é intencional. Habilite caso a caso ou use o golangci-lint que tem essa regra ajustada.",
      },
      {
        type: "success",
        content: "Times maduros tratam o vet como compilador estendido. Falhou o vet, falhou o build. Essa disciplina elimina uma camada inteira de bugs idiotas em produção.",
      },
    ],
  },
  {
    slug: "golangci-lint",
    section: "tooling-perf",
    title: "golangci-lint: o meta-linter que roda dezenas de checks de uma vez",
    difficulty: "intermediario",
    subtitle: "Como configurar uma ferramenta única que roda staticcheck, gosec, errcheck, revive e muitos outros em paralelo",
    intro: `Existe um problema na comunidade Go: dezenas de linters bons foram escritos por pessoas diferentes, cada um com o próprio binário, configuração e formato de saída. Rodar staticcheck, errcheck, gosec, revive, ineffassign, unconvert um por um na sua máquina e no CI é lento e dá trabalho de manter. O golangci-lint resolve isso sendo um agregador: ele empacota mais de 100 linters, roda todos em paralelo, deduplica resultados, cacheia análises e tem uma única configuração em YAML.

A diferença para um simples script que chama vários binários é grande. O golangci-lint analisa o código uma única vez e passa o AST/SSA para cada linter, o que é muito mais rápido. Em projetos médios é a diferença entre 30 segundos e 5 minutos no CI. Ele também tem cache de resultados, então em re-execuções só checa o que mudou. Times grandes (Uber, Google Cloud, HashiCorp) usam ele como porta de entrada de PR.

A configuração fica em .golangci.yml na raiz do projeto. Você escolhe quais linters habilitar (presets úteis: bugs, style, performance), define exclusões para arquivos gerados (mocks, código gerado por protoc) e configura severidade. O padrão é razoável mas a maioria dos times customiza para casar com seu estilo.

Comparado a outras linguagens: em Python existe ruff (que também é multi-linter rápido) e em JS o ESLint com plugins. O golangci-lint é o equivalente Go desses, mas com a vantagem de que cada linter individual já é maduro e testado em separado. Idiomático em projetos Go modernos é ter um .golangci.yml versionado no repositório e o lint rodando como obrigatório no CI.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar (binário pré-compilado é o jeito recomendado)
# Linux/macOS:
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.59.1

# Verificar instalação
golangci-lint --version

# Rodar com configuração padrão
golangci-lint run ./...

# Rodar só linters específicos
golangci-lint run --disable-all --enable=govet,staticcheck ./...`,
      },
      {
        lang: "bash",
        code: `# .golangci.yml — configuração realista para projeto de produção
run:
  timeout: 5m
  tests: true            # também lintar arquivos _test.go
  modules-download-mode: readonly

linters:
  disable-all: true      # começamos do zero, melhor que filtrar
  enable:
    - errcheck           # checa se você ignora erros silenciosamente
    - govet              # análise oficial
    - staticcheck        # melhor linter Go que existe
    - ineffassign        # atribuição que nunca é lida
    - unused             # código morto
    - gosimple           # simplificações idiomáticas
    - gofmt              # formatação
    - goimports          # imports organizados
    - misspell           # typos em comentários (em inglês)
    - revive             # substituto moderno do golint
    - gosec              # segurança (SQL injection, hardcoded secrets)
    - bodyclose          # http.Response.Body fechado?
    - noctx              # http.NewRequest sem contexto

linters-settings:
  errcheck:
    check-type-assertions: true
  gosec:
    excludes:
      - G104             # já coberto pelo errcheck

issues:
  exclude-dirs:
    - vendor
    - third_party
  exclude-rules:
    - path: _test\\.go    # testes podem ignorar errcheck em alguns casos
      linters: [errcheck, gosec]
  max-issues-per-linter: 0  # mostrar tudo
  max-same-issues: 0`,
      },
      {
        lang: "go",
        code: `// Exemplo de código que o golangci-lint pega (cada um por um linter diferente)
package main

import (
        "fmt"
        "net/http"
)

func buscarUsuario(id int) {
        resp, _ := http.Get(fmt.Sprintf("https://api.exemplo.com/users/%d", id))
        // errcheck: erro do http.Get foi ignorado
        // bodyclose: resp.Body nunca é fechado — vaza file descriptor
        // noctx: deveria usar http.NewRequestWithContext
        defer resp.Body.Close() // vai dar panic se Get falhou (resp == nil)

        var nome string
        nome = "anônimo"
        nome = buscarNome(id) // ineffassign: a primeira atribuição é jogada fora
        fmt.Println(nome)
}

func buscarNome(id int) string {
        return fmt.Sprintf("user-%d", id)
}

func main() {
        buscarUsuario(42)
}`,
      },
      {
        lang: "bash",
        code: `# Saída típica de golangci-lint run sobre o código acima:
# main.go:10:14: Error return value is not checked (errcheck)
#     resp, _ := http.Get(fmt.Sprintf("https://api.exemplo.com/users/%d", id))
#              ^
# main.go:14:2: response body must be closed (bodyclose)
#     defer resp.Body.Close()
#     ^
# main.go:10:14: net/http.Get must not be called (noctx)
# main.go:18:2: ineffectual assignment to nome (ineffassign)
#     nome = "anônimo"
#     ^

# Para ver lista de todos os linters disponíveis
golangci-lint linters

# Para corrigir o que dá pra corrigir automaticamente
golangci-lint run --fix ./...`,
      },
      {
        lang: "bash",
        code: `# .github/workflows/lint.yml — rodar no CI
name: lint
on: [push, pull_request]
jobs:
  golangci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true
      - name: golangci-lint
        uses: golangci/golangci-lint-action@v6
        with:
          version: v1.59.1
          args: --timeout=5m`,
      },
    ],
    points: [
      "golangci-lint roda 100+ linters em paralelo com cache, muito mais rápido que rodar um a um.",
      "Configure em .golangci.yml versionado no repositório.",
      "Comece com 'disable-all: true' e habilite só o que faz sentido — fica mais previsível.",
      "Idiomático: errcheck, govet, staticcheck e ineffassign são o pacote básico de qualquer projeto sério.",
      "Use --fix para correções automáticas (poucos linters suportam, mas ajuda).",
      "Rode no CI obrigatoriamente — não confie só na máquina dos devs.",
      "Armadilha: habilitar linters demais e gastar semanas só calando falsos positivos.",
      "Erro comum: deixar o golangci-lint rodar sem timeout e travar o CI em projetos grandes.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Rode 'golangci-lint run --new-from-rev=origin/main' em PRs grandes para focar só nos issues novos. Útil ao adotar o linter em código legado.",
      },
      {
        type: "warning",
        content: "Linters como deadcode, varcheck e structcheck foram removidos em versões recentes (substituídos pelo unused). Mantenha sua versão do golangci-lint atualizada.",
      },
      {
        type: "info",
        content: "Existe um servidor de cache distribuído opcional (GOLANGCI_LINT_CACHE) para acelerar ainda mais o CI compartilhado entre PRs.",
      },
    ],
  },
  {
    slug: "staticcheck",
    section: "tooling-perf",
    title: "staticcheck: o linter mais inteligente do ecossistema",
    difficulty: "intermediario",
    subtitle: "Análises profundas que rivalizam com sistemas de tipos avançados — entenda as categorias SA, S, ST e QF",
    intro: `Se você só pode escolher um linter para Go, escolha o staticcheck. Mantido pelo Dominik Honnef há quase uma década, ele faz análise profunda do código (não só sintaxe, mas fluxo de dados e tipos) e detecta bugs que muito linter superficial deixa passar. É o linter de referência da comunidade e está embutido no golangci-lint, mas também roda como ferramenta independente.

As regras dele são organizadas por categorias com prefixo de duas letras. SA (Staticcheck Analyses) são as principais: detectam bugs reais como deadlock garantido, comparação que sempre dá falso, defer dentro de loop sem necessidade. S (Simple) sugere simplificações, do tipo trocar 'if x == true' por 'if x'. ST (Style) é estilo (nomes de variáveis, comentários de exportados). QF (Quick Fix) são regras com correção automática. Conhecer esse vocabulário ajuda a ler a saída e configurar exclusões com precisão cirúrgica.

Comparado ao gopls (que também faz análise estática para o editor), o staticcheck é mais agressivo e tem mais regras. Comparado a ferramentas de outras linguagens: é o que mypy faz para Python ou TypeScript faz para JS, mas focado em padrões idiomáticos de Go. Ele não substitui o sistema de tipos (Go já tem), mas adiciona uma camada de checks semânticos que pegam coisas como 'esse código está logicamente impossível'.

Idiomático em projetos sérios é rodar staticcheck no CI e tratar warnings como erros. Vale também rodar localmente via integração do editor: o gopls (servidor LSP do Go) pode rodar staticcheck como provider de diagnósticos, então as squigglies vermelhas no seu VS Code já mostram o resultado.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar
go install honnef.co/go/tools/cmd/staticcheck@latest

# Rodar no projeto inteiro
staticcheck ./...

# Listar todos os checks disponíveis
staticcheck -list-checks

# Rodar só uma categoria
staticcheck -checks=SA1019 ./...   # deprecated APIs
staticcheck -checks=SA1*  ./...    # toda família SA1 (correctness)
staticcheck -checks=all,-ST1000 ./... # tudo, exceto ST1000`,
      },
      {
        lang: "go",
        code: `// SA4006: variável recebe valor mas nunca é lida
package main

import "fmt"

func calcularTotal(itens []float64) float64 {
        total := 0.0
        for _, v := range itens {
                total = total + v
                _ = total // staticcheck pegaria se essa linha fosse a última atribuição inútil
        }
        soma := total
        soma = 999 // SA4006: this value of soma is never used
        return total
}

func main() {
        fmt.Println(calcularTotal([]float64{10, 20, 30}))
}`,
      },
      {
        lang: "go",
        code: `// SA1019: usar API marcada como deprecated
package main

import (
        "crypto/md5"
        "fmt"
        "io/ioutil" // SA1019: deprecated desde Go 1.16, use io ou os
)

func hashArquivo(caminho string) string {
        dados, _ := ioutil.ReadFile(caminho)
        soma := md5.Sum(dados)
        return fmt.Sprintf("%x", soma)
}

func main() {
        fmt.Println(hashArquivo("config.txt"))
        // staticcheck:
        // main.go:7:2: SA1019: "io/ioutil" has been deprecated since Go 1.16: ...
}`,
      },
      {
        lang: "go",
        code: `// S1005: simplificação — você não precisa do "_, ok" se só checa presença
package main

import "fmt"

func main() {
        usuarios := map[string]int{"ana": 30, "bruno": 25}

        // Antes (verbose)
        if _, ok := usuarios["ana"]; ok {
                fmt.Println("existe")
        }

        // Depois — quando não usa o "_, ok" para nada útil, pode simplificar
        // Para CHECAR EXISTÊNCIA, o padrão acima continua sendo o jeito.
        // S1005 ataca casos como:
        //   for _, v := range slice  →  for _, v := range slice (sem mudança aqui)
        //   for _ = range ch         →  for range ch  (essa é a real)
        ch := make(chan int, 3)
        ch <- 1; ch <- 2; ch <- 3
        close(ch)
        for range ch {
                // só queremos contar/iterar, não usamos o valor
        }
}`,
      },
      {
        lang: "go",
        code: `// SA5007: loop infinito com defer dentro — vaza recursos!
package main

import (
        "fmt"
        "os"
)

func processarLogs(arquivos []string) {
        for _, nome := range arquivos {
                f, err := os.Open(nome)
                if err != nil {
                        continue
                }
                defer f.Close() // SA5001 / problema clássico:
                // defer só executa ao SAIR DA FUNÇÃO, não da iteração.
                // Se 'arquivos' tem 10000 itens, ficam 10000 fds abertos até o fim.
                fmt.Println("processando", nome)
        }
}

// Forma correta: feche dentro de uma função anônima por iteração
func processarLogsOk(arquivos []string) {
        for _, nome := range arquivos {
                func(n string) {
                        f, err := os.Open(n)
                        if err != nil {
                                return
                        }
                        defer f.Close() // executa ao sair desta closure, a cada iteração
                        fmt.Println("processando", n)
                }(nome)
        }
}

func main() {
        processarLogsOk([]string{"a.log", "b.log"})
}`,
      },
    ],
    points: [
      "Categorias: SA (bugs), S (simples), ST (estilo), QF (quick-fix).",
      "SA1019 é o melhor amigo: avisa quando você usa API deprecated.",
      "Rode com '-checks=all,-ST1000' se não quiser regras de estilo opinativas.",
      "Idiomático: integrar staticcheck no editor via gopls para feedback ao vivo.",
      "Use staticcheck como ferramenta solo OU dentro do golangci-lint, não ambos.",
      "Armadilha: defer dentro de loop longo — staticcheck pode não pegar todos os casos, fique atento.",
      "Erro comum: ignorar SA1006 (Printf com format) e ver bug em produção.",
      "Mantenha a versão atualizada: novas regras saem a cada release de Go.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para descobrir o que cada código significa, acesse staticcheck.dev/docs/checks/. A documentação online tem exemplo de cada SA, S, ST e QF.",
      },
      {
        type: "info",
        content: "O staticcheck usa SSA (Static Single Assignment) por baixo dos panos, a mesma representação intermediária que o compilador. Por isso pega bugs que linters baseados só em AST não pegam.",
      },
      {
        type: "success",
        content: "Adotar staticcheck em uma base legada costuma revelar dezenas de bugs reais escondidos há anos. Vale o esforço de habilitar e ir corrigindo aos poucos.",
      },
    ],
  },
  {
    slug: "pprof-cpu",
    section: "tooling-perf",
    title: "pprof: profiling de CPU para encontrar gargalos reais",
    difficulty: "avancado",
    subtitle: "Como descobrir exatamente em qual função sua aplicação queima ciclos, com flame graphs e o pacote net/http/pprof",
    intro: `Otimizar código sem medir é torcer. Você acha que o gargalo está naquele loop, gasta dois dias reescrevendo, e descobre que o problema real era serializar JSON. O Go vem com uma ferramenta de profiling de classe mundial chamada pprof, originalmente do Google, integrada na linguagem desde sempre. Profiling significa rodar a aplicação medindo onde o tempo de CPU é gasto, função por função, com sobrecarga baixíssima (~1-5%).

Existem duas formas principais de capturar profile: importar net/http/pprof num servidor já rodando (jeito mais comum em produção) ou usar runtime/pprof manualmente em um trecho específico de código. O primeiro abre endpoints HTTP em /debug/pprof/ que entregam profiles binários. O segundo dá controle programático fino, útil para benchmarks e binários CLI.

O pprof funciona por amostragem: 100 vezes por segundo (ajustável) o runtime captura a stack trace atual de cada goroutine. Depois de N segundos coletando, você baixa esse profile e a ferramenta 'go tool pprof' agrega tudo em um relatório: quais funções aparecem mais nas amostras, quanto tempo cumulativo cada uma consome, e gera flame graph SVG navegável. Compare com Python (cProfile) ou Java (JFR/async-profiler): a abordagem é a mesma, mas no Go já vem embutido sem libs externas.

O fluxo idiomático é: 1) habilitar net/http/pprof na sua aplicação (é literal um import _ "net/http/pprof"), 2) gerar carga real no sistema (com k6, hey, vegeta), 3) baixar o profile com 'go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30', 4) explorar com comandos top, list, web. Em poucos minutos você sabe exatamente onde a CPU vai.`,
    codes: [
      {
        lang: "go",
        code: `// Servidor HTTP com pprof embutido — basta importar com underscore
package main

import (
        "fmt"
        "log"
        "net/http"
        _ "net/http/pprof" // registra os handlers em /debug/pprof/ automaticamente
        "strings"
)

// Função propositalmente ineficiente para gerar carga de CPU
func textoLento(n int) string {
        var s string
        for i := 0; i < n; i++ {
                s += "a" // concatenação ruim — aloca a cada iteração
        }
        return strings.ToUpper(s)
}

func handler(w http.ResponseWriter, r *http.Request) {
        resultado := textoLento(50000)
        fmt.Fprintf(w, "tamanho: %d", len(resultado))
}

func main() {
        http.HandleFunc("/processar", handler)
        // pprof já está em /debug/pprof/ por causa do import _
        log.Println("ouvindo em :6060")
        log.Fatal(http.ListenAndServe(":6060", nil))
}`,
      },
      {
        lang: "bash",
        code: `# Em outro terminal, gerar carga (instale 'hey' antes: go install github.com/rakyll/hey@latest)
hey -z 30s -c 50 http://localhost:6060/processar

# Capturar CPU profile de 30 segundos
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

# Dentro do prompt interativo do pprof:
# (pprof) top10              — funções que mais consomem CPU
# (pprof) list textoLento    — código fonte com tempo por linha
# (pprof) web                — abre flame graph SVG no navegador
# (pprof) png > cpu.png      — salva em PNG
# (pprof) quit

# Saída típica de top10:
#       flat  flat%   sum%        cum   cum%
#      8.20s 65.60% 65.60%      8.20s 65.60%  runtime.memmove
#      2.10s 16.80% 82.40%     10.30s 82.40%  main.textoLento
#      0.80s  6.40% 88.80%      0.80s  6.40%  runtime.mallocgc`,
      },
      {
        lang: "bash",
        code: `# Modo flame graph direto no navegador (pprof tem UI web embutida)
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30
# Abre http://localhost:8080 com:
# - Top: tabela das funções mais quentes
# - Graph: grafo de chamadas com nós coloridos por tempo
# - Flame Graph: visualização icônica
# - Source: código fonte anotado linha a linha`,
      },
      {
        lang: "go",
        code: `// Profiling em CLI (sem servidor HTTP) com runtime/pprof
package main

import (
        "fmt"
        "os"
        "runtime/pprof"
)

func calcularPesado() int {
        soma := 0
        for i := 0; i < 100_000_000; i++ {
                soma += i % 7
        }
        return soma
}

func main() {
        f, err := os.Create("cpu.prof")
        if err != nil {
                panic(err)
        }
        defer f.Close()

        if err := pprof.StartCPUProfile(f); err != nil {
                panic(err)
        }
        defer pprof.StopCPUProfile() // garante flush ao sair

        resultado := calcularPesado()
        fmt.Println("resultado:", resultado)

        // Depois rode: go tool pprof cpu.prof
}`,
      },
      {
        lang: "go",
        code: `// Endpoint pprof em servidor que já usa mux customizado (chi, gin, etc.)
// Você precisa registrar manualmente os handlers
package main

import (
        "net/http"
        "net/http/pprof"
)

func registrarPprof(mux *http.ServeMux) {
        mux.HandleFunc("/debug/pprof/", pprof.Index)
        mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
        mux.HandleFunc("/debug/pprof/profile", pprof.Profile) // CPU
        mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
        mux.HandleFunc("/debug/pprof/trace", pprof.Trace)
}

func main() {
        mux := http.NewServeMux()
        mux.HandleFunc("/api/pedidos", func(w http.ResponseWriter, r *http.Request) {
                w.Write([]byte("ok"))
        })
        registrarPprof(mux)
        http.ListenAndServe(":6060", mux)
}`,
      },
    ],
    points: [
      "pprof faz amostragem (~100Hz), overhead baixo, seguro em produção.",
      "Para servidores HTTP, basta 'import _ \"net/http/pprof\"'.",
      "Endpoint /debug/pprof/profile?seconds=30 captura 30s de CPU.",
      "Comandos essenciais no prompt: top, list, web, peek.",
      "Idiomático: 'go tool pprof -http=:8080 url' abre UI web completa.",
      "SEMPRE meça com carga realista — profile sem carga não diz nada.",
      "Armadilha: deixar /debug/pprof/ exposto na internet pública (vaza info).",
      "Erro comum: micro-otimizar antes de profilar — geralmente o gargalo é outro.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Endpoints /debug/pprof/ não devem ser expostos publicamente. Em produção, deixe acessível apenas via rede interna ou bind em 127.0.0.1 e use SSH tunnel para baixar.",
      },
      {
        type: "tip",
        content: "Antes de otimizar, capture um baseline. Salve o profile com nome datado (cpu-2024-01-15.prof). Depois compare com o pós-otimização usando 'go tool pprof -base baseline.prof novo.prof'.",
      },
      {
        type: "info",
        content: "O profile binário é compatível com pprof do Google e ferramentas como Pyroscope e Grafana, que oferecem profiling contínuo em produção com retenção histórica.",
      },
    ],
  },
  {
    slug: "pprof-mem",
    section: "tooling-perf",
    title: "pprof de memória: heap, alocações e como caçar vazamentos",
    difficulty: "avancado",
    subtitle: "Diferença entre alloc_space, alloc_objects, inuse_space e inuse_objects — e como interpretar cada um",
    intro: `Profile de CPU diz onde o tempo é gasto. Profile de memória diz onde a memória é alocada e onde ela continua viva. São perguntas diferentes e ambas importam, especialmente em Go onde o Garbage Collector trabalha em cima das alocações que você faz. Quanto mais alocação, mais GC, mais pause time, mais CPU desperdiçada coletando.

O pprof de memória tem quatro métricas que confundem muita gente. alloc_space é o total de bytes alocados desde o início do programa (cumulativo, conta tudo que já foi alocado mesmo que já tenha sido coletado). alloc_objects é o total de objetos alocados (mesma ideia, mas em contagem). inuse_space é o que está vivo agora no heap. inuse_objects é a contagem de objetos vivos. Para caçar vazamento, você quer inuse_*. Para reduzir pressão do GC, quer alloc_*.

A captura é parecida com CPU: importa net/http/pprof, expõe /debug/pprof/heap, e baixa com go tool pprof. A diferença é que o profile de heap é instantâneo — uma foto do momento. Para vazamento, faça duas fotos com algumas horas/dias de diferença e compare com a flag -base. Crescimento contínuo de inuse_space sem motivo aparente é o sintoma clássico.

Em Go, vazamento de memória não vem de você esquecer de liberar (não tem free()), mas de manter referências por engano: goroutine eterna segurando uma struct, slice/map global que só cresce, finalizer que nunca dispara. Comparado a C, é mais difícil vazar, mas comparado a Java/Python (que têm GC parecido), os padrões de vazamento são bem similares. Idiomático em Go é desconfiar de map global e goroutine sem context.`,
    codes: [
      {
        lang: "go",
        code: `// Aplicação que aloca pesado para gerarmos profile
package main

import (
        "log"
        "net/http"
        _ "net/http/pprof"
)

// Cache global que cresce sem limite — clássico vazamento
var cache = map[string][]byte{}

func handler(w http.ResponseWriter, r *http.Request) {
        chave := r.URL.Query().Get("k")
        // Cada request guarda 1MB no cache, sem nunca limpar
        cache[chave] = make([]byte, 1024*1024)
        w.Write([]byte("ok"))
}

func main() {
        http.HandleFunc("/", handler)
        log.Println("subindo em :6060")
        log.Fatal(http.ListenAndServe(":6060", nil))
}`,
      },
      {
        lang: "bash",
        code: `# Gere carga
hey -n 1000 -c 10 'http://localhost:6060/?k=user1'
hey -n 1000 -c 10 'http://localhost:6060/?k=user2'

# Capture o heap (foto do momento)
go tool pprof http://localhost:6060/debug/pprof/heap

# Dentro do prompt:
# (pprof) top10
# Showing nodes accounting for 1.95GB, 99.91% of 1.95GB total
#       flat  flat%   sum%        cum   cum%
#     1.95GB 99.91% 99.91%     1.95GB 99.91%  main.handler

# (pprof) list handler  — vê linha exata da alocação
# (pprof) web           — flame graph

# Por padrão mostra inuse_space. Para alterar:
go tool pprof -alloc_space http://localhost:6060/debug/pprof/heap
go tool pprof -inuse_objects http://localhost:6060/debug/pprof/heap`,
      },
      {
        lang: "bash",
        code: `# Comparar dois snapshots para detectar vazamento
go tool pprof http://localhost:6060/debug/pprof/heap > heap1.prof
# ... espere algumas horas com o sistema rodando ...
go tool pprof http://localhost:6060/debug/pprof/heap > heap2.prof

# Diferença entre os dois — mostra só o que CRESCEU
go tool pprof -base heap1.prof heap2.prof

# top10 agora mostra qual função alocou MAIS entre as duas fotos.
# Se a mesma função aparece crescendo a cada nova captura → vazamento.`,
      },
      {
        lang: "go",
        code: `// Captura programática de heap profile (útil em job batch ou teste)
package main

import (
        "os"
        "runtime"
        "runtime/pprof"
)

func main() {
        // ... código que aloca muito ...
        processar()

        // Força GC antes para profile mostrar só o que está REALMENTE vivo
        runtime.GC()

        f, _ := os.Create("heap.prof")
        defer f.Close()
        if err := pprof.WriteHeapProfile(f); err != nil {
                panic(err)
        }
        // Depois: go tool pprof heap.prof
}

func processar() {
        dados := make([][]byte, 1000)
        for i := range dados {
                dados[i] = make([]byte, 1024)
        }
        _ = dados
}`,
      },
      {
        lang: "go",
        code: `// Padrão para reduzir alocação: sync.Pool reaproveitando buffers
package main

import (
        "bytes"
        "fmt"
        "sync"
)

// Pool global de buffers — cada goroutine pega, usa, devolve
var bufPool = sync.Pool{
        New: func() any {
                return new(bytes.Buffer)
        },
}

func renderizarMensagem(nome string) string {
        buf := bufPool.Get().(*bytes.Buffer)
        defer func() {
                buf.Reset()         // limpa antes de devolver
                bufPool.Put(buf)    // devolve para reuso
        }()

        buf.WriteString("Olá, ")
        buf.WriteString(nome)
        buf.WriteString("! Bem-vindo de volta.")
        return buf.String()
}

func main() {
        // Em alta concorrência, isso reduz drasticamente alocações no heap
        // e portanto pressão sobre o GC. Medir antes e depois com pprof!
        fmt.Println(renderizarMensagem("Ana"))
}`,
      },
    ],
    points: [
      "alloc_space = total alocado desde o início (acumulado).",
      "inuse_space = vivo no heap agora — use para caçar vazamento.",
      "alloc_objects/inuse_objects = mesma ideia, mas em contagem de objetos.",
      "Capture dois heaps com horas de diferença e use -base para diff.",
      "Idiomático: sync.Pool para reaproveitar buffers em hot path.",
      "Vazamento típico em Go: map global, goroutine sem context, channel não fechado.",
      "Sempre rode runtime.GC() antes de WriteHeapProfile programático.",
      "Armadilha: profile de heap sem GC mostra lixo que ainda não foi coletado.",
      "Erro comum: confundir alloc_space (pressão de GC) com inuse_space (vazamento).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Reduzir alocações é importante, mas não exagere. Código extremamente otimizado para evitar alocação fica feio e difícil de manter. Meça primeiro: a maior parte do código não precisa.",
      },
      {
        type: "tip",
        content: "Em produção, exporte continuamente os profiles para um sistema como Pyroscope ou Parca. Você ganha histórico e detecta vazamentos antes do OOM kill.",
      },
      {
        type: "info",
        content: "O runtime do Go ajusta dinamicamente a frequência de amostragem do heap (MemProfileRate, padrão 512 KiB). Para profile mais detalhado em testes, baixe esse valor.",
      },
    ],
  },
  {
    slug: "benchmarks-cmp",
    section: "tooling-perf",
    title: "Benchmarks com testing.B e benchstat: como provar que ficou mais rápido",
    difficulty: "intermediario",
    subtitle: "Microbenchmarks confiáveis em Go e o ritual estatístico para comparar antes e depois sem se enganar",
    intro: `Você reescreveu uma função e jura que ficou mais rápida. Como provar? Em Go, escrever benchmark é tão fácil quanto escrever teste: cria uma função BenchmarkXxx(b *testing.B) no arquivo _test.go, e o framework cuida da maior parte. Ele descobre quantas iterações rodar para ter um resultado estável, mede tempo por operação e (opcional) alocações por operação.

A mecânica do testing.B é importante de entender. O Go roda sua função uma vez para estimar duração, depois roda N vezes (ajustando N até atingir ~1 segundo por padrão), e divide tempo total por N. Isso dá ns/op (nanossegundos por operação). Com -benchmem, mostra também B/op (bytes alocados por operação) e allocs/op (número de alocações). Essas três métricas são as âncoras para qualquer comparação séria.

Aqui mora um problema que muita gente ignora: variação. Rodar o benchmark uma vez não diz nada. CPU térmica, outros processos, GC em momentos diferentes — tudo afeta. A solução idiomática é rodar 10 vezes (-count=10) e usar a ferramenta benchstat para fazer comparação estatística (teste t de Student) entre dois resultados. Se a diferença não é estatisticamente significativa, sua otimização é placebo.

Compare com Python (timeit, pytest-benchmark) ou Java (JMH). O Go fica no meio: mais simples que JMH (que precisa de anotações e build separado) e mais robusto que timeit (que não tem statistical reporting nativo). O fluxo Go é benchmark, salvar resultado, mudar código, rodar de novo, benchstat. Em poucos minutos você sabe se valeu a pena.`,
    codes: [
      {
        lang: "go",
        code: `// arquivo: strings_test.go
// Comparando duas formas de concatenar strings
package main

import (
        "strings"
        "testing"
)

func concatPlus(partes []string) string {
        var s string
        for _, p := range partes {
                s += p // aloca a cada iteração — ruim
        }
        return s
}

func concatBuilder(partes []string) string {
        var b strings.Builder
        for _, p := range partes {
                b.WriteString(p)
        }
        return b.String()
}

var entrada = []string{"o", "rato", "roeu", "a", "roupa", "do", "rei", "de", "roma"}

func BenchmarkConcatPlus(b *testing.B) {
        for i := 0; i < b.N; i++ {
                _ = concatPlus(entrada)
        }
}

func BenchmarkConcatBuilder(b *testing.B) {
        for i := 0; i < b.N; i++ {
                _ = concatBuilder(entrada)
        }
}`,
      },
      {
        lang: "bash",
        code: `# Rodar todos os benchmarks
go test -bench=. -benchmem ./...

# Saída típica:
# goos: linux
# goarch: amd64
# BenchmarkConcatPlus-8         1500000     780 ns/op    240 B/op    8 allocs/op
# BenchmarkConcatBuilder-8      5000000     245 ns/op     64 B/op    2 allocs/op

# -bench=. → roda todos
# -bench=ConcatPlus → roda só esse
# -benchmem → adiciona colunas B/op e allocs/op
# -benchtime=5s → cada benchmark roda por ~5 segundos (mais estável)
# -count=10 → roda cada bench 10 vezes (necessário para benchstat)`,
      },
      {
        lang: "bash",
        code: `# Instalar benchstat
go install golang.org/x/perf/cmd/benchstat@latest

# Workflow para comparar antes/depois:
# 1) versão antiga
go test -bench=. -benchmem -count=10 ./... > antigo.txt

# 2) altere o código
# ...edita strings.go...

# 3) versão nova
go test -bench=. -benchmem -count=10 ./... > novo.txt

# 4) comparação estatística
benchstat antigo.txt novo.txt

# Saída:
#                  │   antigo   │              novo               │
#                  │   sec/op   │   sec/op     vs base            │
# ConcatPlus-8       780.0n ± 2%  240.0n ± 1%  -69.23% (p=0.000)
# ConcatBuilder-8    245.0n ± 1%  240.0n ± 1%   -2.04% (p=0.180)
#
# p=0.000 → diferença ALTAMENTE significativa
# p=0.180 → não significativa (provavelmente ruído)`,
      },
      {
        lang: "go",
        code: `// Resetar timer e usar b.ReportAllocs explicitamente
package bench

import (
        "encoding/json"
        "testing"
)

type Pedido struct {
        ID     int
        Total  float64
        Itens  []string
}

var pedidoExemplo = Pedido{
        ID: 1, Total: 199.90,
        Itens: []string{"café", "pão", "leite", "manteiga", "queijo"},
}

func BenchmarkMarshalJSON(b *testing.B) {
        b.ReportAllocs() // força colunas B/op e allocs/op mesmo sem -benchmem

        // Setup pesado que NÃO deve contar para o tempo
        dadosPesados := make([]Pedido, 100)
        for i := range dadosPesados {
                dadosPesados[i] = pedidoExemplo
        }

        b.ResetTimer() // zera o cronômetro AQUI, depois do setup

        for i := 0; i < b.N; i++ {
                _, err := json.Marshal(dadosPesados)
                if err != nil {
                        b.Fatal(err)
                }
        }
}`,
      },
      {
        lang: "go",
        code: `// Sub-benchmarks: testar várias entradas com um único arquivo
package bench

import (
        "strings"
        "testing"
)

func BenchmarkContains(b *testing.B) {
        casos := []struct {
                nome string
                s    string
                sub  string
        }{
                {"curto", "go é legal", "legal"},
                {"medio", strings.Repeat("abc", 100) + "fim", "fim"},
                {"longo", strings.Repeat("abc", 10000) + "fim", "fim"},
        }

        for _, c := range casos {
                b.Run(c.nome, func(b *testing.B) {
                        b.ReportAllocs()
                        for i := 0; i < b.N; i++ {
                                strings.Contains(c.s, c.sub)
                        }
                })
        }
}

// Saída:
// BenchmarkContains/curto-8     200000000     5.2 ns/op    0 B/op    0 allocs/op
// BenchmarkContains/medio-8       3000000   420.0 ns/op    0 B/op    0 allocs/op
// BenchmarkContains/longo-8         50000 32000.0 ns/op    0 B/op    0 allocs/op`,
      },
    ],
    points: [
      "Funções BenchmarkXxx(b *testing.B) ficam em arquivos _test.go.",
      "Use sempre -benchmem para ver alocações junto com tempo.",
      "Idiomático: rodar -count=10 e comparar com benchstat (teste t).",
      "p-value < 0.05 é o limiar comum para considerar diferença real.",
      "b.ResetTimer() depois de setup pesado, b.ReportAllocs() para forçar métricas.",
      "Use b.Run(nome, func) para sub-benchmarks com várias entradas.",
      "Armadilha: comparar ns/op de uma única execução — ruído enorme, conclusões erradas.",
      "Erro comum: deixar setup dentro do loop, contaminando o tempo medido.",
      "Variação esperada (±%) acima de 10% indica máquina barulhenta — feche outros apps.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Antes de benchmark, desative turbo boost e governor de CPU (cpupower frequency-set -g performance no Linux). Resultados ficam muito mais estáveis.",
      },
      {
        type: "warning",
        content: "Cuidado com dead code elimination: se você não usa o resultado da função, o compilador pode otimizar tudo. Atribua a uma variável global ou use _ = resultado para forçar avaliação.",
      },
      {
        type: "info",
        content: "Benchmarks são tipo de teste, então rodam apenas com 'go test -bench=...'. Sem a flag, 'go test' ignora completamente as funções Benchmark.",
      },
    ],
  },
  {
    slug: "escape-analysis",
    section: "tooling-perf",
    title: "Escape analysis: stack vs heap e por que isso importa para performance",
    difficulty: "avancado",
    subtitle: "Como o compilador decide o que vai para o heap e como ler -gcflags=-m para evitar alocações desnecessárias",
    intro: `Em Go, você não controla manualmente onde uma variável é alocada. Não tem 'malloc' nem 'new' que vai obrigatoriamente para o heap como em C++. O compilador faz uma análise chamada escape analysis para decidir, para cada variável, se ela pode viver na stack (rápido, libera ao retornar da função) ou se precisa ir para o heap (mais lento, depende do GC para liberar). Entender as regras dessa análise é uma das maneiras mais eficazes de escrever Go performático.

A regra geral: se uma variável escapa do escopo da função (alguém de fora vai precisar dela depois que a função retornar), ela vai para o heap. Os casos clássicos de escape são: retornar ponteiro para variável local, capturar variável em closure que vai para outra goroutine, atribuir a campo de struct global, ou passar para função que armazena referência. Caso contrário, ela fica na stack, que é praticamente gratuita.

A diferença de performance é grande. Alocação na stack é só ajustar o stack pointer (1 instrução). No heap, envolve sincronização, bookkeeping para o GC, e eventualmente trabalho de coleta. Em hot paths, eliminar uma alocação por iteração pode dobrar a velocidade. Mais que isso: cada alocação no heap aumenta a pressão sobre o GC, que vai pausar a aplicação para coletar.

A boa notícia é que o compilador te conta o que decidiu. Basta compilar com -gcflags=-m e ler a saída. Linhas como 'moved to heap: x' e 'x escapes to heap' mostram o que escapou. 'x does not escape' mostra o que ficou na stack. Comparado a Java (onde tudo que é objeto vai para o heap por design) ou Python (idem), Go te dá uma janela única: ver o trabalho do otimizador e ajustar seu código.`,
    codes: [
      {
        lang: "bash",
        code: `# Ver decisões do escape analysis
go build -gcflags="-m" ./...

# Mais detalhes (níveis 2 e 3)
go build -gcflags="-m -m" ./...

# Combinar com -l para desabilitar inlining (saída mais clara)
go build -gcflags="-m -l" ./...

# Saída típica:
# ./main.go:10:6: can inline criarUsuario
# ./main.go:11:9: &Usuario{...} escapes to heap
# ./main.go:20:13: ... does not escape`,
      },
      {
        lang: "go",
        code: `// Exemplo clássico: retornar ponteiro força escape
package main

import "fmt"

type Usuario struct {
        Nome  string
        Saldo float64
}

// 'u' escapa para o heap porque retornamos &u
func criarUsuario(nome string) *Usuario {
        u := Usuario{Nome: nome, Saldo: 0}
        return &u // → escapa, vai para heap
}

// 'u' fica na stack porque não vaza
func saudacao(nome string) string {
        u := Usuario{Nome: nome}
        return "Olá, " + u.Nome
}

func main() {
        p := criarUsuario("Ana")
        fmt.Println(p.Nome, saudacao("Bruno"))
}

// Compile com: go build -gcflags="-m" main.go
// Saída inclui:
// ./main.go:13:2: moved to heap: u
// ./main.go:18:6: u does not escape`,
      },
      {
        lang: "go",
        code: `// Slices: quando uma slice escapa para o heap?
package main

func small() []int {
        // Slice pequena de tamanho conhecido em compile time
        // pode ficar na stack
        s := make([]int, 4)
        for i := range s {
                s[i] = i
        }
        return s // mas como retornamos, escapa!
}

func internal(n int) int {
        // Slice de tamanho dinâmico, mas usada APENAS dentro
        s := make([]int, n)
        for i := range s {
                s[i] = i
        }
        soma := 0
        for _, v := range s {
                soma += v
        }
        return soma
        // Aqui depende: se n é "pequeno" e conhecido, fica na stack.
        // Se n vier de runtime (ex: lido de arquivo), tende a ir para o heap.
}

// Rode: go build -gcflags="-m" e veja as decisões`,
      },
      {
        lang: "go",
        code: `// Interface vazia força escape — caso surpreendente
package main

import "fmt"

func semInterface(n int) {
        x := n * 2
        _ = x // x fica na stack
}

func comInterface(n int) {
        x := n * 2
        // fmt.Println recebe ...any (interface{})
        // Isso força x a ser convertido para interface, que vira ponteiro,
        // que precisa ter um endereço estável → x escapa para o heap
        fmt.Println(x)
}

// Por isso, em hot paths, evite fmt.Println desnecessário.
// Logging frequente é uma das fontes mais comuns de pressão de GC.`,
      },
      {
        lang: "go",
        code: `// Closure capturando variável vs não capturando
package main

import "fmt"

func semCaptura() func() int {
        return func() int {
                return 42 // não captura nada — closure leve
        }
}

func comCaptura(seed int) func() int {
        contador := seed // CAPTURADA pela closure abaixo
        return func() int {
                contador++   // closure precisa modificar contador
                return contador
        }
        // 'contador' escapa para o heap: a closure carrega referência
        // a ele e a closure sobrevive ao retorno desta função
}

func main() {
        c := comCaptura(10)
        fmt.Println(c(), c(), c()) // → 11 12 13
}

// gcflags=-m mostraria:
// moved to heap: contador`,
      },
      {
        lang: "go",
        code: `// Padrão para evitar escape em hot paths: passar buffer pré-alocado
package main

import "strconv"

// Versão ruim: aloca uma string nova a cada chamada
func formatarRuim(n int) string {
        return strconv.Itoa(n) + "!" // escapa: string concat retorna nova
}

// Versão melhor: o chamador fornece o buffer
func formatarBom(buf []byte, n int) []byte {
        buf = strconv.AppendInt(buf, int64(n), 10)
        buf = append(buf, '!')
        return buf
}

func main() {
        buf := make([]byte, 0, 16) // alocada uma vez na stack/heap
        for i := 0; i < 1000; i++ {
                buf = buf[:0] // reseta sem realocar
                buf = formatarBom(buf, i)
                _ = buf
        }
}`,
      },
    ],
    points: [
      "Stack alloc é praticamente gratuita; heap envolve bookkeeping e GC.",
      "Use 'go build -gcflags=\"-m\"' para ver decisões do escape analysis.",
      "Retornar &local força escape para o heap.",
      "Variáveis capturadas por closure que sobrevive escapam.",
      "Idiomático: passar buffer pré-alocado em vez de retornar slice nova.",
      "fmt.Println com tipos que precisam virar interface{} pode forçar escape.",
      "Armadilha: assumir que ponteiro é sempre mais rápido que valor — não é.",
      "Erro comum: micro-otimizar escape sem medir antes com pprof e benchstat.",
      "Slice pequena de tamanho constante tende a ficar na stack.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Não saia mudando código para evitar escape sem medir o impacto. Em código frio (não executado em loop quente) a diferença é invisível e você só piora a legibilidade.",
      },
      {
        type: "tip",
        content: "Para hot paths comprovados, a combinação benchstat + gcflags=-m é poderosa: benchmark mostra que ficou mais rápido, gcflags mostra POR QUE — uma alocação a menos.",
      },
      {
        type: "info",
        content: "O escape analysis do Go é conservador: quando ele não tem certeza, escolhe heap (correto e seguro). Por isso em alguns casos uma reestruturação pequena de código revela alocações que pareciam inevitáveis.",
      },
    ],
  },
  {
    slug: "garbage-collector",
    section: "tooling-perf",
    title: "Garbage Collector: como funciona, GOGC e GOMEMLIMIT",
    difficulty: "avancado",
    subtitle: "Entenda o GC concorrente do Go e os dois botões que importam para tunar latência e memória",
    intro: `Go tem um Garbage Collector concorrente (roda em paralelo com sua aplicação), tricolor (algoritmo de marcação) e com pause times tipicamente menores que 1 milissegundo. Comparado ao GC do Java (G1, ZGC), o do Go é mais simples e otimizado para latência baixa em vez de throughput máximo. Comparado ao Python (refcounting + GC cíclico), é completamente diferente — Go conta com GC pleno desde o início.

O GC roda quando o heap dobra de tamanho desde a última coleta (regra padrão). Ou seja, se depois de coletar sobraram 100MB vivos, o próximo GC dispara quando o heap chegar a 200MB. Esse fator de 2x é controlado pela variável GOGC (default 100, que significa 100% de crescimento permitido). Aumentar GOGC para 200 dobra esse limite, faz GC menos frequente, usa mais memória, mas economiza CPU. Diminuir para 50 faz o oposto: mais GC, menos memória, mais CPU gasta coletando.

Desde Go 1.19 existe o GOMEMLIMIT, que define um teto absoluto de memória que o runtime pode usar (heap + metadata). Quando se aproxima do teto, o GC é forçado a rodar mais agressivamente para evitar OOM. Em containers Kubernetes onde o memory limit é fixo, configurar GOMEMLIMIT um pouco abaixo do limit do container previne o pod ser morto pelo OOM Killer. É a melhoria mais significativa de operacional dos últimos anos.

A combinação idiomática moderna é setar GOMEMLIMIT explicitamente em produção (para casar com cgroups/k8s) e GOGC=off ou um valor alto se quiser confiar 100% no limite de memória. Para a maioria dos serviços, deixar o default funciona bem. O grande benefício de saber dessas variáveis é diagnosticar quando algo dá errado: pause time alto, GC consumindo 30% da CPU, OOM em container — tudo se resolve nesses dois botões.`,
    codes: [
      {
        lang: "bash",
        code: `# Variáveis principais do GC
# GOGC: percentual de crescimento do heap antes do próximo GC
GOGC=100 ./meu-app   # padrão
GOGC=200 ./meu-app   # menos GC, mais memória
GOGC=50  ./meu-app   # mais GC, menos memória
GOGC=off ./meu-app   # desabilita GC (só com GOMEMLIMIT!)

# GOMEMLIMIT: teto de memória (Go 1.19+)
GOMEMLIMIT=1GiB ./meu-app
GOMEMLIMIT=512MiB ./meu-app

# Combinação típica em container k8s com 1Gi de limit:
GOMEMLIMIT=900MiB GOGC=100 ./meu-app
# Margem de 100MiB para metadata e picos breves`,
      },
      {
        lang: "go",
        code: `// Configurar GOMEMLIMIT programaticamente (útil em entrypoint)
package main

import (
        "fmt"
        "runtime/debug"
)

func main() {
        // Ler o limite atual
        limAtual := debug.SetMemoryLimit(-1) // -1 só lê, não muda
        fmt.Println("limite atual:", limAtual)

        // Definir 800 MiB explicitamente
        const limite = 800 * 1024 * 1024
        debug.SetMemoryLimit(limite)

        // Equivalente a: GOMEMLIMIT=800MiB ./app

        // Também dá para ajustar GOGC
        gcAntigo := debug.SetGCPercent(50) // mais agressivo
        fmt.Println("GOGC anterior:", gcAntigo)

        // ... resto da aplicação ...
}`,
      },
      {
        lang: "go",
        code: `// Observar atividade do GC com GODEBUG
// Roda assim:
// GODEBUG=gctrace=1 ./meu-app
//
// Saída a cada GC:
// gc 1 @0.012s 0%: 0.018+0.41+0.005 ms clock, ...
// gc 2 @0.045s 0%: 0.020+0.35+0.004 ms clock, ...
//
// Decifrando:
// gc 1                = número da coleta
// @0.012s             = tempo desde início do programa
// 0%                  = % do tempo total da CPU gasto em GC
// 0.018+0.41+0.005 ms = STW(stop-the-world) sweep / mark concurrent / STW mark term
//
// Se o terceiro número (CPU%) passar de ~5%, o GC está pesado.
// Soluções: GOGC mais alto, GOMEMLIMIT, ou reduzir alocações.
package main

import "fmt"

func main() {
        // Aloca muito para forçar GC
        for i := 0; i < 100; i++ {
                _ = make([]byte, 10*1024*1024) // 10MB cada
        }
        fmt.Println("fim")
}`,
      },
      {
        lang: "go",
        code: `// Forçar GC manualmente (raríssimo precisar — só em debug ou batch)
package main

import (
        "fmt"
        "runtime"
)

func main() {
        var stats runtime.MemStats

        // Aloca alguma coisa
        dados := make([][]byte, 1000)
        for i := range dados {
                dados[i] = make([]byte, 1024)
        }

        runtime.ReadMemStats(&stats)
        fmt.Printf("Antes do GC: HeapAlloc=%d KB, NumGC=%d\n",
                stats.HeapAlloc/1024, stats.NumGC)

        dados = nil           // libera referências
        runtime.GC()          // força ciclo de GC

        runtime.ReadMemStats(&stats)
        fmt.Printf("Depois do GC: HeapAlloc=%d KB, NumGC=%d\n",
                stats.HeapAlloc/1024, stats.NumGC)
}`,
      },
      {
        lang: "bash",
        code: `# Em manifesto Kubernetes, casar GOMEMLIMIT com resources.limits
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-pedidos
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: empresa/api-pedidos:v1.4.2
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"     # k8s mata se passar
              cpu: "500m"
          env:
            - name: GOMEMLIMIT
              # 90% do limit do container, deixa folga para sidecars
              value: "460MiB"
            - name: GOGC
              value: "100"
            - name: GOMAXPROCS
              # Casa com o cpu limit (em milicores)
              valueFrom:
                resourceFieldRef:
                  resource: limits.cpu`,
      },
    ],
    points: [
      "GC do Go é concorrente, tricolor, com STW pause < 1ms na maioria dos casos.",
      "GOGC controla agressividade: maior = menos GC + mais memória.",
      "GOMEMLIMIT (Go 1.19+) define teto de memória — essencial em containers.",
      "Idiomático em k8s: GOMEMLIMIT ≈ 90% do memory limit do container.",
      "Use GODEBUG=gctrace=1 para ver atividade do GC em tempo real.",
      "Combine GOGC=off + GOMEMLIMIT para confiar só no teto de memória.",
      "GOMAXPROCS deve casar com cpu.limits do container (use uber-go/automaxprocs).",
      "Armadilha: chamar runtime.GC() em código de produção sem motivo claro.",
      "Erro comum: container OOM killed por não setar GOMEMLIMIT — Go não sabe do cgroup.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Em containers, se você não setar GOMEMLIMIT, o Go ignora o memory limit do cgroup e aloca até bater no kill. Resultado: pod morto sem aviso. Configure SEMPRE.",
      },
      {
        type: "tip",
        content: "Use o pacote go.uber.org/automaxprocs com import _ no main para ajustar GOMAXPROCS automaticamente conforme o cpu.limits do container. Resolve outra dor clássica.",
      },
      {
        type: "info",
        content: "Pause times de GC do Go raramente passam de 1ms para heaps de até alguns gigabytes. Para SLA de latência ultrabaixa (<100µs), considere reduzir alocações em hot paths via sync.Pool.",
      },
    ],
  },
  {
    slug: "build-tags",
    section: "tooling-perf",
    title: "Build tags: compilação condicional com //go:build",
    difficulty: "intermediario",
    subtitle: "Como incluir ou excluir arquivos do build dependendo do sistema, arquitetura ou flags customizadas",
    intro: `Às vezes você precisa que um arquivo .go só seja compilado em certos contextos: só no Linux, só na arquitetura ARM, só em testes de integração, só quando uma flag específica é passada. Em Java você usaria perfis Maven, em Python um if sys.platform, em C um #ifdef. Em Go o mecanismo é o build tag, declarado com a diretiva //go:build no topo do arquivo.

Build tags são linhas de comentário especiais que o compilador interpreta antes mesmo de parsear o código. Elas aceitam expressões booleanas com nomes de tags conhecidas (linux, darwin, windows, amd64, arm64, cgo, race) e tags customizadas que você inventa. A sintaxe moderna //go:build (Go 1.17+) é como uma expressão lógica clara: //go:build linux && amd64 quer dizer 'só compile este arquivo em Linux AMD64'.

Existem dois usos típicos. Primeiro, código específico de plataforma: você tem um wrapper que chama syscall diferente em cada SO. Coloca o código do Linux em arquivo_linux.go (o sufixo _linux.go já implica //go:build linux automaticamente, é a convenção implícita), do Windows em arquivo_windows.go, e o Go monta o binário certo. Segundo, separar testes: //go:build integration faz com que aqueles testes só rodem se você usar 'go test -tags=integration'. Útil para testes lentos que dependem de banco de dados.

A regra de ouro é colocar o //go:build na primeiríssima linha do arquivo, com uma linha em branco depois antes do package. Errar isso silenciosamente quebra o build (o tag é ignorado e o arquivo entra em todo build). Idiomático em projetos profissionais: tags 'integration', 'e2e' e 'racy' para separar tipos de teste; arquivos sufixados _linux.go, _windows.go, _amd64.go para platform-specific; tag custom 'wireinject' para code generation.`,
    codes: [
      {
        lang: "go",
        code: `// arquivo: signal_unix.go
// Só compila em Linux, macOS, BSD (qualquer Unix)
//go:build !windows

package app

import (
        "os"
        "os/signal"
        "syscall"
)

// SinaisDeShutdown retorna canal que recebe SIGTERM e SIGINT
func SinaisDeShutdown() chan os.Signal {
        c := make(chan os.Signal, 1)
        signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)
        return c
}`,
      },
      {
        lang: "go",
        code: `// arquivo: signal_windows.go
// Só compila no Windows
//go:build windows

package app

import (
        "os"
        "os/signal"
)

// SinaisDeShutdown — versão Windows (sem SIGTERM)
func SinaisDeShutdown() chan os.Signal {
        c := make(chan os.Signal, 1)
        signal.Notify(c, os.Interrupt) // Ctrl+C
        return c
}

// O Go compila apenas o arquivo certo para cada SO.
// Você usa app.SinaisDeShutdown() sem se preocupar com qual.`,
      },
      {
        lang: "go",
        code: `// arquivo: integration_test.go
// Só roda com: go test -tags=integration
//go:build integration

package pedidos_test

import (
        "database/sql"
        "testing"

        _ "github.com/lib/pq"
)

func TestSalvarPedidoNoBanco(t *testing.T) {
        db, err := sql.Open("postgres", "host=localhost user=test sslmode=disable")
        if err != nil {
                t.Fatal(err)
        }
        defer db.Close()

        // teste pesado que sobe banco real
        _, err = db.Exec("INSERT INTO pedidos(total) VALUES ($1)", 99.90)
        if err != nil {
                t.Fatal(err)
        }
}

// 'go test ./...'                       → testes unitários (rápido)
// 'go test -tags=integration ./...'    → testes unitários + integração`,
      },
      {
        lang: "bash",
        code: `# Ver o efeito do build tag
go build ./...                           # compila tudo padrão
GOOS=windows go build ./...              # compila para Windows
GOOS=linux GOARCH=arm64 go build ./...   # cross-compile

# Tags customizadas
go build -tags=feature_x ./...
go build -tags="feature_x,debug" ./...   # múltiplas, separadas por vírgula

# Em testes
go test -tags=integration ./...
go test -tags="integration,slow" ./...

# Para ver QUAIS arquivos serão usados em determinado build:
go list -f '{{.GoFiles}}' ./pkg/app
GOOS=windows go list -f '{{.GoFiles}}' ./pkg/app`,
      },
      {
        lang: "go",
        code: `// Sintaxe moderna vs antiga
// MODERNA (Go 1.17+) — recomendada
//go:build linux && amd64

// ANTIGA (ainda funciona, mas não use em código novo)
// +build linux,amd64

package app

// Operadores válidos:
// && (e)   :  //go:build linux && amd64
// || (ou)  :  //go:build linux || darwin
// !  (não) :  //go:build !windows
// (parens) :  //go:build (linux || darwin) && amd64

// Tag de ferramenta — só compila com Go 1.21+
//go:build go1.21

// Tag de feature custom — só compila com -tags=experimental
//go:build experimental`,
      },
      {
        lang: "go",
        code: `// Padrão: sufixo de arquivo implica build tag automático
// arquivo_linux.go        → implica //go:build linux
// arquivo_windows.go      → implica //go:build windows
// arquivo_amd64.go        → implica //go:build amd64
// arquivo_linux_arm64.go  → implica //go:build linux && arm64
// arquivo_test.go         → só compilado durante go test
//
// Por isso esses dois arquivos juntos funcionam sem nenhum //go:build:
// - signal_linux.go      (só em Linux)
// - signal_windows.go    (só em Windows)
//
// Use sufixo quando puder, é mais limpo. Use //go:build quando
// precisar de combinações que o sufixo não expressa.

package app

// Exemplo: arquivo só usado quando cgo está habilitado
// nome do arquivo: db_cgo.go com //go:build cgo`,
      },
    ],
    points: [
      "Coloque //go:build na PRIMEIRA linha, com linha em branco antes do package.",
      "Sintaxe moderna: //go:build linux && amd64 (Go 1.17+).",
      "Sufixos como _linux.go ou _arm64.go já implicam build tag.",
      "Use tags 'integration' ou 'e2e' para separar testes lentos dos rápidos.",
      "Idiomático: combinar com 'go test -tags=...' no CI para várias suítes.",
      "Tags conhecidas: linux, darwin, windows, amd64, arm64, cgo, race.",
      "Armadilha: linha //go:build em local errado — silenciosamente ignorada.",
      "Erro comum: misturar sintaxe nova e antiga (//go:build e // +build) inconsistente.",
      "Use 'go list -f {{.GoFiles}}' para verificar quais arquivos entram no build.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para projetos com muitos OS-specific, prefira sempre o sufixo de arquivo (_linux.go). É menos verboso que //go:build e a convenção é universal no ecossistema.",
      },
      {
        type: "warning",
        content: "Build tags afetam o binário: se você esquecer de testar uma combinação (ex: GOOS=windows), pode descobrir bug só em produção. Configure CI para fazer cross-compile de todas as plataformas alvo.",
      },
      {
        type: "info",
        content: "A diretiva //go:build foi introduzida no Go 1.17 substituindo a velha // +build. Ferramentas como gofmt convertem automaticamente. Use só a nova em código novo.",
      },
    ],
  },
  {
    slug: "cross-compile",
    section: "tooling-perf",
    title: "Cross-compilation: gerar binários para qualquer plataforma a partir do seu laptop",
    difficulty: "intermediario",
    subtitle: "Como o GOOS e GOARCH transformam Go na linguagem mais simples do mercado para distribuir binários",
    intro: `Em C, gerar binário para outra plataforma é uma aventura: você precisa de toolchain cruzado, libc da plataforma alvo, headers específicos, e configurar autoconf/cmake direitinho. Em Java o JAR é portável mas precisa da JVM no destino. Em Python depende do interpretador instalado. Em Go, basta exportar duas variáveis e rodar 'go build'. É literalmente a melhor experiência de cross-compile do mercado, e isso explica boa parte do sucesso da linguagem em CLIs e ferramentas de DevOps (kubectl, terraform, docker, gh — todos Go).

Os dois mecanismos são GOOS (sistema operacional alvo) e GOARCH (arquitetura). GOOS=linux GOARCH=amd64 gera binário Linux x86-64. GOOS=darwin GOARCH=arm64 gera binário macOS para chips Apple Silicon. GOOS=windows GOARCH=amd64 gera .exe para Windows. Não precisa instalar nada extra: a toolchain do Go já vem com suporte a praticamente todas as combinações relevantes (linux, darwin, windows, freebsd, netbsd, openbsd, plan9, js, wasip1; arquiteturas amd64, arm64, arm, 386, riscv64, mips64, wasm).

Para listar todas as combinações suportadas, rode 'go tool dist list'. São mais de 40. Algumas precisam de cgo desabilitado (CGO_ENABLED=0) porque o Go puro não consegue cruzar a fronteira de C automaticamente. Para a maioria dos serviços HTTP e CLIs, desabilitar cgo é o caminho: o binário fica estaticamente lincado, roda em qualquer container distroless, scratch, alpine, sem depender de glibc.

O fluxo idiomático para distribuir CLI é uma matriz no CI: para cada par (GOOS, GOARCH) que você suporta, gera o binário, comprime em tar.gz/zip, e publica no GitHub Release. Ferramentas como goreleaser automatizam tudo isso em um único arquivo YAML. Em poucos minutos seu projeto está pronto para download em Linux, macOS Intel, macOS ARM, Windows e por aí vai.`,
    codes: [
      {
        lang: "bash",
        code: `# Listar todas as combinações suportadas
go tool dist list

# Exemplos de saída:
# linux/amd64
# linux/arm64
# linux/arm
# darwin/amd64
# darwin/arm64
# windows/amd64
# freebsd/amd64
# js/wasm

# Conferir o atual
go env GOOS GOARCH
# darwin
# arm64`,
      },
      {
        lang: "bash",
        code: `# Compilar para Linux AMD64 (servidor padrão)
GOOS=linux GOARCH=amd64 go build -o bin/app-linux-amd64 ./cmd/api

# Para Linux ARM64 (Raspberry Pi 4, AWS Graviton, etc.)
GOOS=linux GOARCH=arm64 go build -o bin/app-linux-arm64 ./cmd/api

# Para macOS Apple Silicon (M1/M2/M3)
GOOS=darwin GOARCH=arm64 go build -o bin/app-darwin-arm64 ./cmd/api

# Para Windows
GOOS=windows GOARCH=amd64 go build -o bin/app.exe ./cmd/api

# Para WebAssembly (rodar no navegador!)
GOOS=js GOARCH=wasm go build -o web/app.wasm ./cmd/api`,
      },
      {
        lang: "bash",
        code: `# Binário totalmente estático — desabilitando cgo
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \\
  -ldflags="-s -w" \\
  -o bin/app-linux-amd64 ./cmd/api

# Flags importantes do -ldflags:
# -s : remove tabela de símbolos (binário menor)
# -w : remove informação de debug DWARF (binário menor ainda)
# Reduz ~30% do tamanho do binário

# Trimar caminhos para builds reproduzíveis
go build -trimpath -ldflags="-s -w" -o bin/app ./cmd/api

# Embutir versão e build date no binário
VERSION=$(git describe --tags --always)
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
go build -ldflags="-X main.version=$VERSION -X main.buildDate=$DATE" \\
  -o bin/app ./cmd/api`,
      },
      {
        lang: "go",
        code: `// cmd/api/main.go — variáveis preenchidas via -ldflags=-X
package main

import (
        "flag"
        "fmt"
)

// Estas variáveis são sobrescritas em build time
var (
        version   = "dev"
        buildDate = "unknown"
)

func main() {
        versionFlag := flag.Bool("version", false, "imprime versão e sai")
        flag.Parse()

        if *versionFlag {
                fmt.Printf("api v%s (build: %s)\n", version, buildDate)
                return
        }

        fmt.Println("rodando api...")
}

// $ go build -ldflags="-X main.version=1.4.2" -o app ./cmd/api
// $ ./app -version
// → api v1.4.2 (build: unknown)`,
      },
      {
        lang: "bash",
        code: `# Script bash gerando matriz de binários para release
#!/usr/bin/env bash
set -euo pipefail

VERSION=\${1:-dev}
PLATAFORMAS=(
  "linux/amd64"
  "linux/arm64"
  "darwin/amd64"
  "darwin/arm64"
  "windows/amd64"
)

for plat in "\${PLATAFORMAS[@]}"; do
  IFS='/' read -r OS ARCH <<< "$plat"
  EXT=""
  [ "$OS" = "windows" ] && EXT=".exe"
  NOME="bin/app-\${VERSION}-\${OS}-\${ARCH}\${EXT}"
  echo "Compilando para $OS/$ARCH..."
  CGO_ENABLED=0 GOOS=$OS GOARCH=$ARCH go build \\
    -ldflags="-s -w -X main.version=$VERSION" \\
    -trimpath \\
    -o "$NOME" ./cmd/api
done

ls -lh bin/`,
      },
      {
        lang: "bash",
        code: `# .goreleaser.yaml — alternativa profissional
# Roda: goreleaser release --snapshot --clean
project_name: api
builds:
  - id: api
    main: ./cmd/api
    binary: api
    env:
      - CGO_ENABLED=0
    flags:
      - -trimpath
    ldflags:
      - -s -w
      - -X main.version={{.Version}}
      - -X main.buildDate={{.Date}}
    goos:
      - linux
      - darwin
      - windows
    goarch:
      - amd64
      - arm64
    ignore:
      - goos: windows
        goarch: arm64

archives:
  - format: tar.gz
    format_overrides:
      - goos: windows
        format: zip

release:
  github:
    owner: empresa
    name: api`,
      },
    ],
    points: [
      "GOOS define o SO (linux, darwin, windows, etc.).",
      "GOARCH define a arquitetura (amd64, arm64, arm, 386, etc.).",
      "'go tool dist list' mostra todas as combinações suportadas.",
      "CGO_ENABLED=0 é quase obrigatório para cross-compile sem dor.",
      "Idiomático: -ldflags='-s -w' + -trimpath para binário menor e reproduzível.",
      "Use -X main.version=... para embutir versão no binário em build time.",
      "Para distribuir CLI sério, use goreleaser — automatiza release no GitHub.",
      "Armadilha: usar cgo e tentar cross-compile sem toolchain de C apropriada.",
      "Erro comum: esquecer extensão .exe no Windows e gerar binário sem extensão.",
    ],
    alerts: [
      {
        type: "success",
        content: "Cross-compile do Go é tão simples que ferramentas inteiras (kubectl, terraform, gh, docker CLI) distribuem binários para 5+ plataformas a cada release com um único pipeline.",
      },
      {
        type: "warning",
        content: "Se você usa cgo (sqlite3, libpq nativo, ffi para C), cross-compile vira pesadelo: precisa de toolchain do C alvo. Procure alternativas pure-Go (modernc.org/sqlite, jackc/pgx) sempre que possível.",
      },
      {
        type: "tip",
        content: "Para imagens Docker mínimas, compile com CGO_ENABLED=0 e rode 'FROM scratch' ou 'FROM gcr.io/distroless/static'. Imagem final fica abaixo de 20MB.",
      },
    ],
  },
  {
    slug: "cgo",
    section: "tooling-perf",
    title: "cgo: chamando C a partir do Go (e os custos disso)",
    difficulty: "avancado",
    subtitle: "Quando faz sentido usar cgo, o overhead da fronteira Go-C e por que a comunidade tenta evitar",
    intro: `O cgo é o mecanismo oficial do Go para chamar funções escritas em C. Por que isso existe? Porque tem código C maduro no mundo (libcurl, libcrypto, OpenCV, libsqlite3) e reescrever tudo em Go puro nem sempre é viável. O cgo permite que você inclua trechos de C diretamente em arquivos .go via comentário especial, e o compilador faz a ponte. Parece mágico, mas vem com custos importantes que você precisa conhecer antes de adotar.

A sintaxe é peculiar: você escreve C em um comentário, depois importa o pseudo-pacote 'C' e usa C.funcao() para chamar. O comentário pode incluir #include <stdio.h>, definir funções inline, ou linkar com bibliotecas externas via #cgo LDFLAGS. Por baixo dos panos, o build do Go invoca o gcc/clang, compila o C, e gera glue code para a chamada cruzar a fronteira de runtime. Essa fronteira é o problema.

Toda chamada Go→C tem overhead. Não é nanossegundos, é centenas de nanossegundos por call (vs ~2ns de uma chamada Go→Go). O motivo é que Go tem stacks pequenas crescíveis, escalonador próprio de goroutines, e GC que precisa saber sobre referências. Para chamar C, o runtime troca para uma stack maior (de SO), bloqueia a goroutine em uma OS thread, e marca essa thread como ocupada para o GC. Em hot path com milhões de chamadas, isso vira gargalo gigante.

Outras consequências: cross-compile fica difícil (precisa toolchain do C alvo), build fica mais lento, binário não é mais estaticamente lincado por padrão (depende de libc), e debug fica menos amigável. Por essas razões, a comunidade Go evita cgo como a peste. Existe inclusive um ditado: 'cgo is not Go'. Quando você precisar de uma lib C, primeiro busque alternativa pure-Go. Para SQLite tem modernc.org/sqlite (transpilação do C para Go), para PostgreSQL tem jackc/pgx (driver pure-Go), para crypto tem o pacote crypto/ padrão. Idiomático em 2024 é cgo só quando absolutamente necessário (ex: integração com biblioteca de sistema sem alternativa).`,
    codes: [
      {
        lang: "go",
        code: `// Exemplo simples: chamar função da libc
package main

/*
#include <stdio.h>
#include <stdlib.h>

// Você pode definir funções C diretamente no comentário
static void cumprimentar(const char* nome) {
    printf("Olá, %s, do C!\n", nome);
}
*/
import "C"
import "unsafe"

func main() {
        nome := "Ana"

        // Converte string Go para *C.char (precisa liberar manualmente!)
        cnome := C.CString(nome)
        defer C.free(unsafe.Pointer(cnome)) // GC do Go não conhece memória do C

        C.cumprimentar(cnome)
        // → Olá, Ana, do C!
}`,
      },
      {
        lang: "go",
        code: `// Linkar com biblioteca externa (libcurl como exemplo)
package main

/*
#cgo pkg-config: libcurl
#include <curl/curl.h>
#include <stdlib.h>

static CURLcode baixar(const char* url) {
    CURL* c = curl_easy_init();
    if (!c) return CURLE_FAILED_INIT;
    curl_easy_setopt(c, CURLOPT_URL, url);
    CURLcode rc = curl_easy_perform(c);
    curl_easy_cleanup(c);
    return rc;
}
*/
import "C"
import (
        "fmt"
        "unsafe"
)

func main() {
        url := C.CString("https://example.com")
        defer C.free(unsafe.Pointer(url))

        rc := C.baixar(url)
        fmt.Println("código de retorno:", rc)
}

// Para compilar: precisa ter libcurl-dev instalada
// $ sudo apt install libcurl4-openssl-dev
// $ go build .`,
      },
      {
        lang: "go",
        code: `// Benchmark mostrando o custo da fronteira Go-C
// arquivo: cgo_test.go
package main

/*
static int somar(int a, int b) {
    return a + b;
}
*/
import "C"
import "testing"

func somarGo(a, b int) int { return a + b }

func BenchmarkSomarGo(b *testing.B) {
        for i := 0; i < b.N; i++ {
                _ = somarGo(2, 3)
        }
}

func BenchmarkSomarC(b *testing.B) {
        for i := 0; i < b.N; i++ {
                _ = C.somar(2, 3)
        }
}

// Resultado típico:
// BenchmarkSomarGo-8     1000000000   0.5 ns/op
// BenchmarkSomarC-8         5000000  280.0 ns/op
//
// 560x mais lento! A função em si é trivial — o custo é a fronteira.`,
      },
      {
        lang: "go",
        code: `// Boa prática: agrupe trabalho em uma única chamada cgo
package main

/*
#include <stdint.h>

// Em vez de chamar processar() N vezes,
// passamos um array e processamos tudo dentro do C
static int64_t processarLote(int64_t* dados, int n) {
    int64_t soma = 0;
    for (int i = 0; i < n; i++) {
        soma += dados[i] * dados[i];
    }
    return soma;
}
*/
import "C"
import (
        "fmt"
        "unsafe"
)

func main() {
        dados := make([]int64, 1_000_000)
        for i := range dados {
                dados[i] = int64(i)
        }

        // UMA chamada cgo processa o lote inteiro
        resultado := C.processarLote(
                (*C.int64_t)(unsafe.Pointer(&dados[0])),
                C.int(len(dados)),
        )

        fmt.Println("soma de quadrados:", int64(resultado))
}

// Padrão geral: amortize o custo da fronteira fazendo MUITO trabalho
// por chamada. Nunca chame cgo dentro de loop quente.`,
      },
      {
        lang: "bash",
        code: `# Build com cgo
go build .                    # cgo habilitado por padrão (se C disponível)
CGO_ENABLED=1 go build .      # explícito

# Desabilitar cgo (binário pure-Go, estaticamente lincado)
CGO_ENABLED=0 go build .

# Cross-compile com cgo precisa de toolchain do alvo
# Para Linux ARM64 a partir de Linux AMD64:
sudo apt install gcc-aarch64-linux-gnu
CC=aarch64-linux-gnu-gcc \\
  CGO_ENABLED=1 GOOS=linux GOARCH=arm64 \\
  go build .

# Verificar se um binário usa cgo
go version -m ./meu-app | grep CGO_ENABLED
# build CGO_ENABLED=true   ← usa cgo
# ou
# build CGO_ENABLED=false  ← pure Go (preferível)`,
      },
    ],
    points: [
      "cgo permite chamar C a partir de Go via comentário especial e import \"C\".",
      "Cada chamada Go→C custa ~280ns vs ~2ns de Go→Go.",
      "Idiomático: prefira sempre alternativa pure-Go quando existir.",
      "Memória alocada com C.CString deve ser liberada com C.free.",
      "Cross-compile com cgo precisa de toolchain do C alvo (CC=...).",
      "Use CGO_ENABLED=0 para gerar binário estático sem dor.",
      "Padrão: amortize fronteira fazendo lote grande de trabalho por chamada.",
      "Armadilha: chamar cgo dentro de loop quente — overhead destrói performance.",
      "Erro comum: esquecer C.free e vazar memória que o GC do Go não vê.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Memória alocada via C.CString, C.malloc ou similares NÃO é gerenciada pelo GC do Go. Esquecer de liberar gera vazamento de verdade. Sempre defer C.free.",
      },
      {
        type: "warning",
        content: "Cgo bloqueia uma OS thread inteira durante a chamada C. Em alta concorrência isso pode levar à explosão de threads e degradar o scheduler do Go drasticamente.",
      },
      {
        type: "info",
        content: "Projetos como modernc.org/sqlite mostram que dá para transpilar bibliotecas C inteiras para Go puro automaticamente. Antes de adotar cgo, verifique se já existe versão pure-Go.",
      },
    ],
  },
  {
    slug: "modules-vendor",
    section: "tooling-perf",
    title: "go mod vendor: trazendo dependências para dentro do repositório",
    difficulty: "intermediario",
    subtitle: "Quando vendoring faz sentido em 2024, prós e contras versus o cache de módulos do Go",
    intro: `Antes do go modules existir (Go 1.11), a forma comum de gerenciar dependências era copiar o código delas para uma pasta vendor/ dentro do projeto. Essa prática se chama vendoring e ainda existe, agora oficialmente suportada via 'go mod vendor'. A ideia é simples: criar a pasta vendor/ com cópia exata das dependências usadas, e o go build passa a ler dali em vez de baixar do GOPATH/pkg/mod.

Por que ainda usar vendor em 2024? Três motivos principais. Primeiro, builds completamente offline e reprodutíveis: tudo que compila o projeto está no repositório, sem depender de proxy, GitHub estar no ar, ou cache local. Segundo, auditoria: revisores podem ver exatamente que código de terceiros entrou no projeto, com diff de PR aparecendo quando uma dep é atualizada (gigante, mas explícito). Terceiro, requisitos corporativos: muita empresa exige que código auditado fique versionado.

Os contras também são reais. O repositório fica enorme — projetos médios geram dezenas de MB em vendor/. Diffs de PR ficam poluídos quando uma dep recebe update grande. Toda vez que você muda go.mod, precisa rodar 'go mod vendor' de novo para sincronizar. E a maioria dos projetos modernos confia no proxy oficial (proxy.golang.org), no go.sum para integridade, e no GOPROXY/GOSUMDB para garantir que builds sejam reprodutíveis sem precisar copiar o código.

A regra prática: se seu projeto é open source pequeno/médio, NÃO use vendor. Se é monorepo corporativo, regulado (banco, gov, saúde), ou precisa rodar offline em ambientes isolados, vendor pode ser obrigatório. Idiomático moderno é usar go.mod + go.sum + GOPROXY, e ativar vendor só com motivo concreto. Quando ativado, lembre que 'go build' passa a usar vendor/ por padrão, e atualizar deps requer 'go get pacote && go mod tidy && go mod vendor' nessa ordem.`,
    codes: [
      {
        lang: "bash",
        code: `# Inicializar um projeto Go novo
mkdir minha-api && cd minha-api
go mod init exemplo/minha-api

# Adicionar dependência
go get github.com/google/uuid

# Estrutura agora:
# minha-api/
# ├── go.mod
# ├── go.sum   ← hashes para verificação
# └── main.go

# Sem vendor: as deps ficam em ~/go/pkg/mod/cache (compartilhado)
# Com vendor: copia tudo para ./vendor/ no projeto

# Criar pasta vendor com todas as deps
go mod vendor

# Estrutura agora:
# minha-api/
# ├── go.mod
# ├── go.sum
# ├── main.go
# └── vendor/
#     ├── modules.txt
#     └── github.com/google/uuid/...`,
      },
      {
        lang: "bash",
        code: `# Quando vendor/ existe, 'go build' usa ele AUTOMATICAMENTE
go build ./...

# Para ignorar vendor e usar o cache global temporariamente
go build -mod=mod ./...

# Forçar uso do vendor explicitamente (verifica se está sincronizado)
go build -mod=vendor ./...

# Ver de qual lugar uma dep está vindo
go list -m -mod=vendor all

# Sincronizar vendor após mudar go.mod
go get nova/dependencia
go mod tidy       # remove deps não usadas, adiciona faltantes
go mod vendor     # atualiza ./vendor/ para refletir`,
      },
      {
        lang: "go",
        code: `// main.go usando dependência externa — funciona igual com ou sem vendor
package main

import (
        "fmt"

        "github.com/google/uuid"
)

type Pedido struct {
        ID    string
        Itens []string
}

func novoPedido(itens []string) Pedido {
        return Pedido{
                ID:    uuid.NewString(),
                Itens: itens,
        }
}

func main() {
        p := novoPedido([]string{"café", "pão"})
        fmt.Printf("Pedido %s criado com %d itens\n", p.ID, len(p.Itens))
}`,
      },
      {
        lang: "bash",
        code: `# Workflow para auditar mudanças em vendor/ no PR

# Antes de mudar deps:
git status

# Adicionar nova dep
go get github.com/jackc/pgx/v5
go mod tidy
go mod vendor

# Diff que aparece no PR
git status
# modified:   go.mod
# modified:   go.sum
# modified:   vendor/modules.txt
# new file:   vendor/github.com/jackc/pgx/v5/...   (centenas de arquivos!)

# Em projetos com vendor, é COMUM revisores pedirem para SQUASH
# os commits de vendor separadamente para facilitar review`,
      },
      {
        lang: "bash",
        code: `# .gitignore quando NÃO usar vendor (recomendado para maioria)
# nada relacionado a vendor — não existe a pasta

# Para builds reprodutíveis sem vendor, use no CI:
# .github/workflows/ci.yml
name: build
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true        # cacheia ~/go/pkg/mod entre runs
      - name: Verificar go.mod sincronizado
        run: |
          go mod tidy
          git diff --exit-code go.mod go.sum
      - name: Build
        run: go build ./...
      - name: Testes
        run: go test ./...`,
      },
      {
        lang: "bash",
        code: `# Quando você QUER vendor (cenário corporativo)
# .gitignore — vendor entra no repo, mas pasta de cache do Go não
echo "/.idea/" >> .gitignore
echo "/coverage.out" >> .gitignore
# vendor/ NÃO está no gitignore — é versionado!

# Garantir no CI que vendor está sincronizado com go.mod
go mod vendor
git diff --exit-code vendor/   # falha se houver mudança não commitada

# Build do CI usa vendor por padrão (mais rápido, offline)
go build -mod=vendor ./...
go test -mod=vendor ./...`,
      },
    ],
    points: [
      "vendor/ é gerado por 'go mod vendor' a partir do go.mod.",
      "Quando vendor/ existe, 'go build' usa ele automaticamente.",
      "Vantagem: build offline, reprodutível, deps versionadas.",
      "Desvantagem: repositório enorme, diffs de PR poluídos.",
      "Idiomático moderno: NÃO usar vendor — confiar em go.sum + GOPROXY.",
      "Use vendor em monorepo corporativo ou ambientes regulados.",
      "Sempre rode 'go mod tidy' antes de 'go mod vendor'.",
      "Armadilha: editar manualmente arquivos em vendor/ — sumirá no próximo vendor.",
      "Erro comum: esquecer de 'go mod vendor' depois de 'go get' — CI quebra.",
    ],
    alerts: [
      {
        type: "info",
        content: "go.sum guarda hashes criptográficos de cada dep. Mesmo sem vendor, isso garante que builds futuros usem exatamente o mesmo bytes — se alguém adulterar, o checksum falha.",
      },
      {
        type: "tip",
        content: "Configure GOPROXY=https://proxy.golang.org,direct e GOSUMDB=sum.golang.org. Build fica rápido (proxy oficial) e seguro (verificação via checksum database).",
      },
      {
        type: "warning",
        content: "Se um repo tem vendor/, e você roda 'go get' sem rodar 'go mod vendor' depois, o CI vai falhar porque vendor estará dessincronizado. Crie um pre-commit hook para evitar.",
      },
    ],
  },
  {
    slug: "security-vuln",
    section: "tooling-perf",
    title: "govulncheck: caçando CVEs no seu código e nas suas dependências",
    difficulty: "intermediario",
    subtitle: "Como usar a ferramenta oficial de análise de vulnerabilidades do Go para evitar bibliotecas com falhas conhecidas",
    intro: `Toda dependência que você adiciona ao projeto é também a soma das vulnerabilidades dela. Em 2021, log4shell mostrou ao mundo o que acontece quando uma lib popular tem CVE crítico. Em Go, o equivalente acontece com regularidade: drivers de banco, libs de crypto, parsers de JSON. A pergunta não é se você terá CVE no projeto, é quando — e quando vier, quanto tempo levará para você descobrir.

O ecossistema Go tem uma resposta oficial chamada govulncheck, mantida pelo time de segurança da linguagem. Ele lê seu código, identifica as funções que você realmente chama de cada dependência, e cruza com o banco de vulnerabilidades públicas (vuln.go.dev). O diferencial em relação a ferramentas como Snyk e Dependabot é a precisão: se o projeto usa uma biblioteca com CVE em uma função que você não chama, o govulncheck NÃO te alerta. Em outras ferramentas, qualquer dep com CVE gera ruído.

A análise é estática: o govulncheck usa o mesmo SSA do staticcheck para rastrear o grafo de chamadas e ver se a função vulnerável é alcançável a partir do main. Resultado: lista curta e acionável das CVEs que realmente importam para você. Em projetos médios, o ratio costuma ser 10:1 — você teria 10 CVEs em 'tem dependência vulnerável' e só 1 ou 2 em 'você usa o caminho ruim'.

Como integrar isso no fluxo? Primeiro, rode local com 'govulncheck ./...' antes de cada release. Segundo, no CI como step bloqueante (falha PR se aparecer CVE alta). Terceiro, em produção via cron diário sobre o binário compilado, para pegar CVEs que saíram depois do deploy. Quando o govulncheck reporta vulnerabilidade, você tem três opções: atualizar a dep para a versão fixed, mudar seu código para não chamar a função vulnerável, ou (último recurso) registrar uma exceção justificada. Idiomático em times maduros é tratar CVE como bug de produção: para tudo, corrige, segue.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar govulncheck
go install golang.org/x/vuln/cmd/govulncheck@latest

# Rodar análise no projeto
govulncheck ./...

# Em modo verboso (mostra TUDO, inclusive vulns não usadas)
govulncheck -show=verbose ./...

# Apenas listar resumo (útil em CI)
govulncheck -format=json ./... > vulns.json

# Analisar binário já compilado (útil em produção)
govulncheck -mode=binary ./bin/api`,
      },
      {
        lang: "bash",
        code: `# Saída típica de govulncheck encontrando vuln REALMENTE alcançável

# Vulnerability #1: GO-2024-2611
#     html/template parses cookie domain incorrectly
#   More info: https://pkg.go.dev/vuln/GO-2024-2611
#   Standard library
#     Found in: net/http@go1.21.5
#     Fixed in: net/http@go1.22.0
#     Example traces found:
#       #1: cmd/api/main.go:42:18: main.handler calls http.SetCookie

# Vulnerability #2: GO-2023-1567
#     golang.org/x/net DOS via maliciously crafted HTTP/2 request
#   More info: https://pkg.go.dev/vuln/GO-2023-1567
#     Found in: golang.org/x/net@v0.7.0
#     Fixed in: golang.org/x/net@v0.17.0
#     Example traces found:
#       #1: internal/server/server.go:18:12: server.New calls http2.ConfigureServer

# Saída diz EXATAMENTE em qual linha do SEU código o caminho começa.`,
      },
      {
        lang: "bash",
        code: `# Workflow para corrigir CVE
# 1) Identificar a versão fixed (vem na saída do govulncheck)
# Fixed in: golang.org/x/net@v0.17.0

# 2) Atualizar a dependência
go get golang.org/x/net@v0.17.0
# ou pular para a mais recente:
go get -u golang.org/x/net

# 3) Limpar e revalidar
go mod tidy
go build ./...
go test ./...

# 4) Confirmar que o CVE sumiu
govulncheck ./...
# No vulnerabilities found.

# 5) Para CVE da stdlib, atualize a versão do Go:
# Fixed in: net/http@go1.22.0
# Edite go.mod: go 1.22
# Reinstale Go 1.22+ na máquina e no CI`,
      },
      {
        lang: "bash",
        code: `# .github/workflows/security.yml — rodar diariamente + em PR
name: vulnerability-check
on:
  pull_request:
  schedule:
    - cron: '0 8 * * *'   # todo dia 08:00 UTC

jobs:
  govulncheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Instalar govulncheck
        run: go install golang.org/x/vuln/cmd/govulncheck@latest
      - name: Rodar análise
        run: govulncheck ./...
      # Falha o PR se houver vuln alcançável.
      # Para vulns críticas em produção, abre issue automática:
      - name: Notificar Slack
        if: failure() && github.event_name == 'schedule'
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: \${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {"text":"⚠️ Vulnerabilidade encontrada em produção"}`,
      },
      {
        lang: "go",
        code: `// Exemplo de código que GERA alerta no govulncheck
package main

import (
        "fmt"
        "net/http"
        "net/url"
)

func main() {
        // Hipoteticamente, suponha que url.Parse tenha CVE em versão antiga.
        // govulncheck rastrearia: main → url.Parse → função vulnerável.
        u, err := url.Parse("https://exemplo.com/api?id=1")
        if err != nil {
                fmt.Println(err)
                return
        }
        fmt.Println(u.Host)

        // Mesmo se você IMPORTA crypto/md5 mas nunca chama,
        // govulncheck NÃO alerta — análise é precisa.
        resp, err := http.Get(u.String())
        if err != nil {
                return
        }
        defer resp.Body.Close()
        fmt.Println(resp.Status)
}`,
      },
      {
        lang: "bash",
        code: `# Analisar binário em produção (poderoso!)
# Você baixa o binário do servidor e roda local:
scp servidor:/opt/app/bin/api ./api-prod
govulncheck -mode=binary ./api-prod

# Saída lista CVEs com base no que está REALMENTE no binário,
# inclusive versão da stdlib usada para compilar.
# Mesmo sem ter o código fonte, descobre vulnerabilidades.

# Útil para:
# - Auditar binários de fornecedores
# - Verificar imagens Docker em produção sem rebuild
# - Rastrear CVEs em deploys antigos`,
      },
    ],
    points: [
      "govulncheck é a ferramenta oficial de análise de vulnerabilidades do Go.",
      "Diferencial: só alerta sobre CVEs em código REALMENTE alcançável.",
      "Banco de dados oficial: vuln.go.dev (curado pelo time de segurança).",
      "Idiomático: rodar no CI em todo PR e diariamente em produção.",
      "Para corrigir: 'go get pacote@versao-fixed && go mod tidy'.",
      "Para CVE da stdlib, atualize a versão do Go no go.mod.",
      "Modo -mode=binary analisa binário compilado, sem precisar do código fonte.",
      "Armadilha: ignorar avisos achando que não te afetam — atualize ou justifique.",
      "Erro comum: rodar govulncheck só na release — descobre CVE crítico horas antes do deploy.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Não confunda 'sem CVE no govulncheck' com 'aplicação segura'. A ferramenta cobre vulnerabilidades públicas em libs Go. Não checa segredos hardcoded, SQL injection no SEU código, configuração ruim, etc.",
      },
      {
        type: "tip",
        content: "Combine govulncheck com gosec (linter de segurança) e o pacote crypto/ padrão. govulncheck cobre 'libs vulneráveis', gosec cobre 'código inseguro', e crypto/ evita reinventar primitivas.",
      },
      {
        type: "success",
        content: "Times que rodam govulncheck diariamente respondem a CVEs em horas, não semanas. É a diferença entre patch tranquilo e correr atrás de incidente em produção.",
      },
      {
        type: "info",
        content: "O banco vuln.go.dev é alimentado por relatórios da comunidade e curadoria do time de segurança do Go. CVEs são publicados com IDs no formato GO-YYYY-XXXX, separado do CVE/NVD tradicional.",
      },
    ],
  },
];
