import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "pacotes-organizacao",
    section: "pacotes-erros",
    title: "Organização de pacotes",
    difficulty: "iniciante",
    subtitle: "Como Go organiza código em pastas, módulos e pacotes — uma pasta, um package",
    intro: `Em Python você importa arquivos .py soltos. Em Java o nome do pacote tem que bater com a pasta e cada arquivo precisa de uma classe pública. Em Go a regra é mais simples ainda e, quando você entende, fica difícil de esquecer: cada pasta é um pacote, e todos os arquivos .go dentro dela compartilham o mesmo "package nome" no topo. Não existe arquivo solto, não existe import relativo, não tem "main.go" mágico fora de um módulo.

A unidade maior é o módulo. Um módulo Go é, na prática, qualquer pasta com um arquivo go.mod na raiz. Você cria isso uma vez com 'go mod init github.com/seuusuario/projeto'. Esse caminho vira o prefixo de todos os imports internos do seu projeto. Se você tem uma pasta 'internal/pagamento' dentro do módulo, importa como "github.com/seuusuario/projeto/internal/pagamento". Não tem nada de relativo nem de "../../utils".

Dentro de cada pacote, a visibilidade é decidida pelo case da primeira letra. Se o identificador começa com maiúscula (ex.: CalcularJuros), ele é exportado e qualquer pacote que importar pode usar. Se começa com minúscula (ex.: calcularImposto), é privado ao pacote. Não existe palavra-chave 'public' ou 'private'. Isso é idiomático Go: a regra está no nome, e o compilador é seu segurança.

Existe uma pasta com nome especial: 'internal'. Tudo que estiver dentro de uma pasta chamada internal só pode ser importado por código que mora abaixo do mesmo "pai" da internal. É a forma do Go de dizer "isto aqui é detalhe da minha biblioteca, não dependa". Use sem medo para esconder implementação. E lembre: cada pasta normalmente tem um nome curto e em minúsculas, e o nome do pacote no topo dos arquivos costuma ser exatamente o nome da pasta — manter os dois iguais é a convenção que todo mundo segue.`,
    codes: [
      {
        lang: "bash",
        code: `# Criando um módulo do zero. Faça uma vez por projeto.
mkdir loja && cd loja
go mod init github.com/maria/loja
# Isso gera um arquivo go.mod parecido com:
# module github.com/maria/loja
#
# go 1.22`,
      },
      {
        lang: "bash",
        code: `# Estrutura típica de um projeto Go bem organizado.
# loja/
#   go.mod
#   main.go                  ← pacote main, ponto de entrada
#   internal/
#     pagamento/
#       cartao.go            ← package pagamento
#       boleto.go            ← package pagamento (mesma pasta)
#   pkg/
#     desconto/
#       percentual.go        ← package desconto (público para outros)
ls -R`,
      },
      {
        lang: "go",
        code: `// Arquivo: internal/pagamento/cartao.go
// Toda a pasta usa o mesmo nome de package no topo.
package pagamento

import "errors"

// Cobrar é exportado (começa com maiúscula) — outros pacotes enxergam.
func Cobrar(valor float64) error {
    if valor <= 0 {
        return errors.New("valor deve ser positivo")
    }
    return nil
}

// validarLimite começa com minúscula → privado a este pacote.
func validarLimite(valor float64) bool {
    return valor < 10000
}`,
      },
      {
        lang: "go",
        code: `// Arquivo: main.go
// O ponto de entrada do binário SEMPRE é package main + func main.
package main

import (
    "fmt"

    // Import absoluto baseado no caminho do módulo (go.mod).
    "github.com/maria/loja/internal/pagamento"
)

func main() {
    if err := pagamento.Cobrar(199.90); err != nil {
        fmt.Println("falhou:", err)
        return
    }
    fmt.Println("cobrança realizada")
    // → saída: cobrança realizada
}`,
      },
      {
        lang: "bash",
        code: `# Compilar e rodar:
go run .              # roda o pacote main da pasta atual
go build ./...        # compila TODOS os pacotes do módulo
go test ./...         # roda testes de todos os pacotes
# O "./..." é o jeito Go de dizer "tudo, recursivamente".`,
      },
    ],
    points: [
      "Uma pasta = um pacote. Todos os arquivos .go da pasta declaram o mesmo package no topo.",
      "Um módulo é qualquer pasta com go.mod. Crie com 'go mod init caminho/do/projeto'.",
      "Imports são sempre absolutos a partir do caminho do módulo, nunca relativos.",
      "Identificador com letra Maiúscula = exportado. Com minúscula = privado ao pacote.",
      "A pasta 'internal' restringe imports — use para esconder detalhes de implementação.",
      "Idiomático: nome do pacote curto, em minúsculas, igual ao nome da pasta (ex.: 'pagamento').",
      "Armadilha: tentar importar com '../utils' como em JavaScript — não compila em Go.",
      "Erro comum: dois packages diferentes na mesma pasta. O compilador rejeita imediatamente.",
    ],
    alerts: [
      {
        type: "info",
        content: "O nome do módulo no go.mod normalmente é o caminho de onde ele será publicado (ex.: github.com/usuario/projeto). Mesmo que você nunca publique, manter o padrão evita conflitos.",
      },
      {
        type: "tip",
        content: "Use 'internal' generosamente. Tudo que não precisa ser API pública vai para internal e o compilador garante que outros projetos não dependam disso.",
      },
      {
        type: "warning",
        content: "Não crie pacotes só para 'organizar'. Em Go, dependências circulares entre pacotes são proibidas pelo compilador, e dividir demais cria nós difíceis de desfazer.",
      },
    ],
  },
  {
    slug: "imports-aliases",
    section: "pacotes-erros",
    title: "Imports e aliases",
    difficulty: "iniciante",
    subtitle: "Bloco de import, aliases, import em branco e por que o Go é exigente com imports não usados",
    intro: `Go trata imports com um rigor que assusta quem vem de Python ou JavaScript: se você importar um pacote e não usar, o código nem compila. No começo isso parece chato, mas é proposital — evita aquele acúmulo de imports mortos que ninguém limpa. A ferramenta 'goimports' resolve isso automaticamente, e a maioria dos editores roda ela ao salvar.

A sintaxe tem duas formas. A curta é 'import "fmt"' em uma linha só. A mais comum é o bloco com parênteses, agrupando vários imports juntos. Dentro do bloco, a convenção é separar com uma linha em branco os imports da biblioteca padrão dos imports externos (de terceiros) e dos imports internos do seu projeto. O 'gofmt' mantém isso ordenado por você.

Aliases servem para resolver dois problemas. O primeiro é renomear um pacote para evitar conflito de nomes — por exemplo, se você precisa usar dois pacotes chamados 'log', um interno e um externo. O segundo é encurtar nomes longos. Você escreve 'm "math"' e passa a usar m.Pi, m.Sqrt etc. Use com moderação: aliases atrapalham a leitura quando você esconde o pacote real.

Existe também o import em branco, com sublinhado: '_ "github.com/lib/pq"'. Isso importa o pacote só pelos seus efeitos colaterais (geralmente registrar um driver via init()), sem expor nada para você usar. É comum em drivers de banco de dados e em pacotes que se autorregistram em algum hub. E, por fim, o ponto: 'import . "fmt"' importa tudo direto no namespace do arquivo. É legal? Sim. Idiomático? Não. Evite, exceto em alguns testes específicos — quem ler depois vai perder tempo procurando de onde Println veio.`,
    codes: [
      {
        lang: "go",
        code: `// Forma 1: import simples em uma linha.
package main

import "fmt"

func main() {
    fmt.Println("Olá, módulos!")
    // → saída: Olá, módulos!
}`,
      },
      {
        lang: "go",
        code: `// Forma 2: bloco com parênteses, agrupando por origem.
package main

import (
    // Biblioteca padrão.
    "fmt"
    "strings"
    "time"

    // Bibliotecas externas (rode antes: go get github.com/google/uuid).
    "github.com/google/uuid"

    // Pacotes internos do seu próprio módulo.
    "github.com/maria/loja/internal/pagamento"
)

func main() {
    pedido := strings.ToUpper("ped-" + uuid.NewString()[:8])
    fmt.Println(pedido, "criado em", time.Now().Format("2006-01-02"))
    _ = pagamento.Cobrar(50.0) // ignorando erro de propósito por enquanto
}`,
      },
      {
        lang: "go",
        code: `// Aliases: renomeando pacotes na hora do import.
package main

import (
    "fmt"
    m "math"             // alias curto para math
    crand "crypto/rand"  // alias para diferenciar de math/rand
    mrand "math/rand"
)

func main() {
    fmt.Println("Pi:", m.Pi)              // → Pi: 3.141592653589793
    fmt.Println("sorteio:", mrand.Intn(10))

    // crand.Read preenche um slice de bytes com dados aleatórios seguros.
    b := make([]byte, 4)
    _, _ = crand.Read(b)
    fmt.Printf("token: %x\\n", b)         // → token: 1a2b3c4d (varia)
}`,
      },
      {
        lang: "go",
        code: `// Import em branco: só queremos o efeito colateral (init do driver).
package main

import (
    "database/sql"
    "fmt"

    // O sublinhado importa SEM expor nada — registra o driver "postgres".
    _ "github.com/lib/pq"
)

func main() {
    // sql.Open só funciona porque o driver foi registrado no init() do pq.
    db, err := sql.Open("postgres", "postgres://user:pass@localhost/loja")
    if err != nil {
        fmt.Println("erro:", err)
        return
    }
    defer db.Close()
    fmt.Println("conexão preparada")
}`,
      },
      {
        lang: "bash",
        code: `# Ferramentas que cuidam dos imports por você.
go install golang.org/x/tools/cmd/goimports@latest
goimports -w .          # adiciona/remove imports faltantes em todos os arquivos
gofmt -w .              # só formata, não mexe em imports
# Configure seu editor para rodar goimports ao salvar e esqueça o assunto.`,
      },
    ],
    points: [
      "Importou e não usou? O código não compila. É proposital, evita lixo.",
      "Use o bloco 'import ( ... )' agrupando: stdlib, externos, internos, separados por linha em branco.",
      "Alias é 'nome \"caminho\"' — ótimo para resolver conflitos, ruim quando esconde sem motivo.",
      "Idiomático: deixar 'goimports' arrumar imports automaticamente ao salvar.",
      "Import em branco (_) só dispara o init() do pacote, sem expor símbolos.",
      "Import com ponto (. \"pkg\") joga tudo no namespace — evite fora de testes.",
      "Armadilha: comentar uma linha que usava um pacote e esquecer o import — dá erro de compilação.",
      "Antes de usar libs externas, rode 'go get caminho/da/lib' para baixar e atualizar o go.mod.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Configure seu editor (VS Code, GoLand, Neovim) para rodar goimports ao salvar. Você nunca mais vai pensar em ordem ou import faltando.",
      },
      {
        type: "warning",
        content: "Aliases muito curtos (l, p, s) escondem o que está rodando. Em código de equipe, prefira o nome completo do pacote ou um alias que ainda comunique a origem.",
      },
      {
        type: "info",
        content: "O comando 'go mod tidy' remove dependências não usadas do go.mod e baixa as que estão faltando. Rode antes de commits para manter o módulo limpo.",
      },
    ],
  },
  {
    slug: "documentacao-godoc",
    section: "pacotes-erros",
    title: "Documentação no estilo godoc",
    difficulty: "iniciante",
    subtitle: "Comentários que viram documentação navegável de graça, sem ferramentas externas",
    intro: `Documentação em Go não é um sistema separado como JSDoc, Sphinx ou Javadoc. É só comentário comum, em prosa simples, escrito logo acima do que ele documenta — sem tags, sem @param, sem marcação especial. A regra de ouro é: o comentário começa com o nome do identificador. Se você está documentando a função 'Cobrar', o comentário começa com "Cobrar realiza...". Essa convenção tem uma razão prática: a ferramenta 'go doc' (e o site pkg.go.dev) extrai esses comentários e gera documentação navegável automaticamente.

Comente todo identificador exportado (com letra maiúscula). Funções, tipos, constantes, variáveis e o próprio pacote. Para documentar o pacote, escreva um comentário em qualquer arquivo .go logo acima da linha 'package nome'. É comum ter um arquivo dedicado, geralmente chamado 'doc.go', que serve só para isso — é onde fica a visão geral, exemplos de uso e qualquer coisa que valha para o pacote inteiro.

Você pode fazer mais do que descrever. Indentar uma linha em quatro espaços faz o godoc renderizar como bloco de código. Listas com hífen viram listas. URLs viram links. E, talvez o mais legal, funções de exemplo (Example functions) em arquivos _test.go aparecem na documentação rodáveis no playground. Isso é idiomático: no lugar de escrever em prosa "use assim", você cria 'func ExampleCobrar()' e a doc mostra o uso real e ainda valida na build.

Para ler documentação no terminal, use 'go doc fmt.Println' ou 'go doc github.com/maria/loja/internal/pagamento'. Não precisa de internet, não precisa de site. Toda lib Go bem cuidada vem com docs no próprio código — e se você seguir a mesma disciplina, sua lib vai aparecer bonita em pkg.go.dev assim que for publicada.`,
    codes: [
      {
        lang: "go",
        code: `// Package pagamento processa cobranças de pedidos da loja.
//
// Suporta cartão de crédito e boleto. As funções exportadas
// retornam erro nos casos de valor inválido ou falha externa.
//
// Exemplo de uso:
//
//     err := pagamento.Cobrar(99.90)
//     if err != nil {
//         log.Fatal(err)
//     }
package pagamento

import "errors"

// MoedaPadrao é a moeda usada quando o chamador não especifica.
const MoedaPadrao = "BRL"

// Cobrar realiza uma cobrança de cartão no valor informado.
// Retorna erro se o valor for menor ou igual a zero.
func Cobrar(valor float64) error {
    if valor <= 0 {
        return errors.New("valor deve ser positivo")
    }
    return nil
}`,
      },
      {
        lang: "go",
        code: `// Pedido representa um pedido feito por um cliente.
//
// Os campos exportados podem ser serializados para JSON.
// Use NovoPedido para construir, em vez de criar o struct na mão.
type Pedido struct {
    // ID único gerado pelo backend, formato UUID v4.
    ID string

    // Total em reais, sempre positivo.
    Total float64
}

// NovoPedido constrói um Pedido com valores iniciais consistentes.
// Falha se total for negativo.
func NovoPedido(total float64) (*Pedido, error) {
    if total < 0 {
        return nil, errors.New("total negativo")
    }
    return &Pedido{ID: "ped-novo", Total: total}, nil
}`,
      },
      {
        lang: "go",
        code: `// Arquivo: pagamento_example_test.go
// Funções Example viram documentação rodável no pkg.go.dev.
package pagamento_test

import (
    "fmt"

    "github.com/maria/loja/internal/pagamento"
)

func ExampleCobrar() {
    err := pagamento.Cobrar(150.00)
    fmt.Println(err)
    // Output: <nil>
}

func ExampleCobrar_invalido() {
    err := pagamento.Cobrar(-10)
    fmt.Println(err)
    // Output: valor deve ser positivo
}`,
      },
      {
        lang: "bash",
        code: `# Lendo documentação direto do terminal, sem internet.
go doc fmt.Println
# func Println(a ...any) (n int, err error)
#     Println formats using the default formats for its operands ...

go doc github.com/maria/loja/internal/pagamento
# package pagamento // import "..."
# Package pagamento processa cobranças ...
# func Cobrar(valor float64) error
# func NovoPedido(total float64) (*Pedido, error)

# Para servir uma versão web local enquanto desenvolve:
go install golang.org/x/pkgsite/cmd/pkgsite@latest
pkgsite -open .`,
      },
    ],
    points: [
      "Documentação é comentário comum, sem tags. Escreva em prosa, em pt-BR ou inglês.",
      "Idiomático: o comentário começa com o nome do identificador documentado.",
      "Documente todo símbolo exportado (com letra maiúscula). É padrão da comunidade.",
      "Para documentar o pacote, escreva acima do 'package' — geralmente em um arquivo doc.go.",
      "Funções 'ExampleNome' em _test.go viram exemplos rodáveis na documentação.",
      "Use 'go doc pkg.Func' no terminal para consultar docs sem abrir navegador.",
      "Indentar com 4 espaços vira bloco de código no godoc; URLs viram links automaticamente.",
      "Armadilha: começar o comentário com 'Esta função...' em vez do nome — quebra a convenção e fica feio em pkg.go.dev.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Toda vez que adicionar uma função pública, escreva o comentário ANTES de implementar. Forçar essa explicação ajuda você a perceber se a API está confusa.",
      },
      {
        type: "info",
        content: "O linter 'golint' (e o moderno 'revive') reclama quando símbolos exportados estão sem comentário. Configure no CI para manter a disciplina.",
      },
      {
        type: "success",
        content: "Quando você publica um pacote no GitHub e ele aparece em pkg.go.dev, toda essa documentação vira um site bonito automaticamente — sem você configurar nada.",
      },
    ],
  },
  {
    slug: "erros-philosophy",
    section: "pacotes-erros",
    title: "Filosofia de erros em Go",
    difficulty: "intermediario",
    subtitle: "Por que Go retorna error em vez de lançar exceções, e como tratar erros com elegância",
    intro: `Se você vem de Python, Java ou JavaScript, está acostumado com try/except (ou try/catch). Em Go, esse mecanismo não existe para erros previsíveis. A linguagem inteira é construída sobre um princípio simples: erros são valores. Funções que podem falhar retornam um 'error' como último valor de retorno, e quem chama decide o que fazer. Não há fluxo invisível, não há "stack unwinding" pulando dez funções para cima até alguém capturar.

A vantagem é honestidade: você lê o código e enxerga onde cada coisa pode dar errado. A desvantagem é verbosidade — aquele bloco 'if err != nil { return err }' aparece muito. Programadores de Go aceitam isso porque o ganho em previsibilidade compensa, especialmente em sistemas longos como servidores que precisam rodar meses sem cair. Em Java, um NullPointerException pode subir e matar uma thread inteira; em Go, você é forçado a olhar o erro no momento que ele acontece.

A interface 'error' é minúscula: um único método 'Error() string'. Qualquer tipo que implemente esse método é um error. Isso permite criar erros ricos com contexto (campos extras, código, status) sem precisar herdar de uma classe base. A partir do Go 1.13, o pacote 'errors' ganhou 'errors.Is' e 'errors.As' para inspecionar erros embrulhados (wrapped) — você pode envolver um erro com fmt.Errorf usando o verbo %w e depois desembrulhar lá em cima.

A regra prática é: trate o erro perto de onde ele aparece se souber o que fazer; senão, embrulhe com contexto e devolva. "Embrulhar" significa adicionar informação ao redor — em vez de devolver "arquivo não encontrado", devolva "carregando config: arquivo não encontrado". Quem lê o log lá em cima entende a cadeia inteira. Idiomático em Go é também ser específico: criar variáveis de erro sentinela (ErrNaoEncontrado, ErrSemSaldo) ou tipos próprios que carregam dados úteis para quem trata.`,
    codes: [
      {
        lang: "go",
        code: `// Padrão básico: função retorna (resultado, error).
package main

import (
    "errors"
    "fmt"
)

// Sacar tira dinheiro de uma conta. Falha se saldo for insuficiente.
func Sacar(saldo, valor float64) (float64, error) {
    if valor <= 0 {
        return saldo, errors.New("valor deve ser positivo")
    }
    if valor > saldo {
        return saldo, errors.New("saldo insuficiente")
    }
    return saldo - valor, nil
}

func main() {
    novo, err := Sacar(100, 150)
    if err != nil {
        fmt.Println("falha:", err)
        return
    }
    fmt.Println("novo saldo:", novo)
    // → saída: falha: saldo insuficiente
}`,
      },
      {
        lang: "go",
        code: `// Erros sentinela: variáveis exportadas que o chamador compara.
package conta

import "errors"

// ErrSemSaldo indica que a conta não tem fundos suficientes.
var ErrSemSaldo = errors.New("conta: saldo insuficiente")

// ErrContaBloqueada indica que a operação foi recusada por bloqueio.
var ErrContaBloqueada = errors.New("conta: bloqueada")

func Debitar(saldo, valor float64, bloqueada bool) (float64, error) {
    if bloqueada {
        return saldo, ErrContaBloqueada
    }
    if valor > saldo {
        return saldo, ErrSemSaldo
    }
    return saldo - valor, nil
}`,
      },
      {
        lang: "go",
        code: `// Embrulhando erro com contexto usando %w (Go 1.13+).
package main

import (
    "errors"
    "fmt"
    "os"
)

func carregarConfig(caminho string) ([]byte, error) {
    dados, err := os.ReadFile(caminho)
    if err != nil {
        // %w preserva o erro original para errors.Is/As funcionarem.
        return nil, fmt.Errorf("carregando config %q: %w", caminho, err)
    }
    return dados, nil
}

func main() {
    _, err := carregarConfig("/nao/existe.json")
    if err != nil {
        fmt.Println(err)
        // → carregando config "/nao/existe.json": open ...: no such file or directory

        // Inspecionando: era o erro "arquivo não existe"?
        if errors.Is(err, os.ErrNotExist) {
            fmt.Println("avisar usuário: crie o arquivo de config")
        }
    }
}`,
      },
      {
        lang: "go",
        code: `// Tipo de erro próprio: carrega dados estruturados.
package main

import (
    "errors"
    "fmt"
)

// ErroValidacao guarda qual campo falhou e por quê.
type ErroValidacao struct {
    Campo string
    Motivo string
}

// Implementa a interface error com o método Error().
func (e *ErroValidacao) Error() string {
    return fmt.Sprintf("campo %q inválido: %s", e.Campo, e.Motivo)
}

func validarEmail(email string) error {
    if email == "" {
        return &ErroValidacao{Campo: "email", Motivo: "vazio"}
    }
    return nil
}

func main() {
    err := validarEmail("")
    var ev *ErroValidacao
    // errors.As tenta encaixar o erro no tipo desejado.
    if errors.As(err, &ev) {
        fmt.Println("campo problemático:", ev.Campo)
        // → campo problemático: email
    }
}`,
      },
      {
        lang: "go",
        code: `// Anti-padrão: ignorar erros silenciosamente.
package main

import (
    "fmt"
    "os"
)

func main() {
    // RUIM: ignorar com _ esconde problemas reais.
    dados, _ := os.ReadFile("dados.txt")
    fmt.Println(len(dados)) // pode imprimir 0 e você nem sabe por quê.

    // BOM: trate o erro, mesmo que seja só logando.
    dados, err := os.ReadFile("dados.txt")
    if err != nil {
        fmt.Println("aviso: não consegui ler dados.txt:", err)
        return
    }
    fmt.Println(len(dados))
}`,
      },
    ],
    points: [
      "Em Go, erros são valores normais retornados por funções, não exceções.",
      "A interface 'error' tem um único método: Error() string.",
      "Idiomático: 'if err != nil { return err }' logo após cada chamada que pode falhar.",
      "Use fmt.Errorf com %w para embrulhar erros e adicionar contexto sem perder o original.",
      "errors.Is compara contra um erro sentinela; errors.As extrai um tipo específico.",
      "Erros sentinela (variáveis exportadas) ajudam quem chama a tratar casos conhecidos.",
      "Tipos próprios de erro guardam dados estruturados (campo inválido, código HTTP, etc.).",
      "Armadilha: ignorar erro com '_' achando que 'depois eu vejo'. Quase sempre vira bug obscuro.",
      "Erro comum: comparar com == quando o erro foi embrulhado — use errors.Is em vez disso.",
    ],
    alerts: [
      {
        type: "info",
        content: "A 'verbosidade' do err != nil é uma escolha consciente. Os criadores do Go preferem explicitamente que o tratamento de erro seja visível, e a comunidade aprendeu a achar isso bom.",
      },
      {
        type: "warning",
        content: "Nunca use panic para erros previsíveis (entrada inválida, banco fora do ar, arquivo faltando). Panic é só para situações realmente inesperadas que indicam bug no programa.",
      },
      {
        type: "tip",
        content: "Quando embrulhar um erro com fmt.Errorf, sempre inclua contexto útil: parâmetros, arquivo, ID da operação. Logs com 'erro: erro: erro' sem contexto são inúteis na produção.",
      },
      {
        type: "success",
        content: "Depois de duas semanas escrevendo Go, a verbosidade some do radar e você passa a sentir falta dela em outras linguagens. Saber exatamente onde algo pode falhar vicia.",
      },
    ],
  },
  {
    slug: "panic-recover",
    section: "pacotes-erros",
    title: "Panic e recover",
    difficulty: "avancado",
    subtitle: "Quando usar panic, como recuperar com defer e por que isso NÃO é um substituto para try/catch",
    intro: `Panic é o mecanismo do Go para situações realmente excepcionais — aquelas que indicam que o programa entrou num estado em que não dá para continuar. Acessar um índice fora do slice, dividir int por zero, desreferenciar um ponteiro nil: tudo isso causa panic automaticamente. Quando um panic acontece, a execução para, as funções vão "desempilhando" (e os defers de cada uma rodam), e o programa morre imprimindo um stack trace.

A primeira lição importante é: panic NÃO é o try/throw do Java ou Python. Não use panic para controlar fluxo de erro normal. Se uma função pode falhar de um jeito previsível (entrada inválida, recurso indisponível), retorne 'error'. Use panic só quando descobrir um bug interno: invariante violada, configuração impossível detectada na inicialização, índice inválido depois de você jurar que validou.

O recover serve para interceptar um panic em curso. Ele só funciona dentro de uma função adiada com 'defer'. Quando chamado, devolve o valor passado ao panic e impede que o programa morra. O caso de uso real é em servidores: você não quer que um bug em uma única requisição derrube todo o serviço. Frameworks HTTP como o net/http já fazem isso para você em cada handler. Em código de aplicação comum, recover quase nunca aparece.

Ainda há um padrão legítimo: converter panics em erros nas fronteiras de uma biblioteca. Imagine um parser que usa panic internamente para abortar caminhos profundos sem if encadeado — na borda pública você captura com recover e devolve um error normal para o usuário da lib. Isso é raro e exige cuidado: nem todo panic deve ser engolido. Panics que indicam bug real (nil pointer dereference) devem subir e ser corrigidos, não escondidos.`,
    codes: [
      {
        lang: "go",
        code: `// Panic automático: acessando índice fora do slice.
package main

import "fmt"

func main() {
    nums := []int{10, 20, 30}
    fmt.Println(nums[5])
    // → panic: runtime error: index out of range [5] with length 3
    //
    // goroutine 1 [running]:
    // main.main()
    //         /tmp/main.go:6 +0x...
}`,
      },
      {
        lang: "go",
        code: `// Panic explícito: invariante violada na inicialização.
package main

import "fmt"

// MultaPercentual deve ser configurada na startup do servidor.
var MultaPercentual = 0.0

func init() {
    MultaPercentual = 0.05
    if MultaPercentual <= 0 || MultaPercentual >= 1 {
        // Bug de configuração: melhor morrer agora que silenciar.
        panic(fmt.Sprintf("multa fora do intervalo: %f", MultaPercentual))
    }
}

func main() {
    fmt.Println("multa configurada:", MultaPercentual)
    // → multa configurada: 0.05
}`,
      },
      {
        lang: "go",
        code: `// Recover dentro de defer: salva o programa de morrer.
package main

import "fmt"

func processarPedido(id int) {
    // O defer é avaliado primeiro; se houver panic, recover captura.
    defer func() {
        if r := recover(); r != nil {
            fmt.Printf("pedido %d falhou (recuperado): %v\\n", id, r)
        }
    }()

    if id < 0 {
        panic("ID de pedido negativo")
    }
    fmt.Println("pedido processado:", id)
}

func main() {
    processarPedido(42)   // → pedido processado: 42
    processarPedido(-1)   // → pedido -1 falhou (recuperado): ID de pedido negativo
    fmt.Println("servidor segue de pé")
    // → servidor segue de pé
}`,
      },
      {
        lang: "go",
        code: `// Padrão real: converter panic em error na borda da lib.
package parser

import "fmt"

// Parse interpreta uma expressão. Erros internos viram error público.
func Parse(entrada string) (resultado string, err error) {
    // Named return permite atribuir 'err' dentro do defer.
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("parser falhou: %v", r)
        }
    }()

    return parseInterno(entrada), nil
}

func parseInterno(s string) string {
    if s == "" {
        panic("entrada vazia") // uso interno, fora da fronteira pública
    }
    return "ok:" + s
}`,
      },
      {
        lang: "go",
        code: `// Goroutines: panic em uma goroutine NÃO é capturado por recover na main.
package main

import (
    "fmt"
    "time"
)

func tarefa() {
    // Cada goroutine precisa do próprio recover.
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("tarefa morreu, mas main sobreviveu:", r)
        }
    }()
    panic("falha na thread de fundo")
}

func main() {
    go tarefa()
    time.Sleep(100 * time.Millisecond) // dá tempo da goroutine rodar
    fmt.Println("main continua viva")
    // → tarefa morreu, mas main sobreviveu: falha na thread de fundo
    // → main continua viva
}`,
      },
    ],
    points: [
      "Panic é para situações realmente inesperadas, não para controle de fluxo de erro normal.",
      "Recover SÓ funciona dentro de uma função executada via defer.",
      "Panic em uma goroutine NÃO é capturado pela main — cada goroutine precisa do próprio recover.",
      "Idiomático: usar named return values para que o defer possa setar o err de saída.",
      "Use panic em init() quando uma configuração obrigatória estiver inválida.",
      "Servidores HTTP normalmente já têm recover por handler — você raramente escreve esse código.",
      "Armadilha: usar recover para esconder bugs (nil pointer) em vez de corrigir a causa raiz.",
      "Erro comum: chamar recover() fora de defer — não acontece nada, ele só funciona em defer.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Engolir panics com recover sem logar nem investigar transforma bugs sérios em fantasmas. Se recuperou um panic, no mínimo logue stack trace antes de seguir adiante.",
      },
      {
        type: "warning",
        content: "Bibliotecas públicas NÃO devem fazer panic em uso normal. Quem chama sua API espera erros via error, não surpresas que matam o processo.",
      },
      {
        type: "tip",
        content: "Use 'runtime/debug.Stack()' dentro do recover para capturar o stack trace completo no log. Sem isso, você só tem a string do panic e perde o caminho que levou até lá.",
      },
    ],
  },
  {
    slug: "log-pkg",
    section: "pacotes-erros",
    title: "O pacote log",
    difficulty: "iniciante",
    subtitle: "Logging básico da stdlib, log.Fatal, log.Panic e o moderno log/slog estruturado",
    intro: `Toda aplicação séria precisa registrar o que faz: requisições recebidas, erros, eventos importantes. A stdlib do Go traz dois pacotes para isso: 'log', simples e antigo, e 'log/slog', moderno e estruturado, disponível desde o Go 1.21. Saber os dois é importante — log ainda aparece muito em código legado e em scripts pequenos, mas slog é o caminho recomendado para sistemas novos.

O pacote 'log' tem três funções principais que você usa direto: log.Print (loga e segue), log.Fatal (loga e chama os.Exit(1)) e log.Panic (loga e dispara panic). Por padrão, ele escreve para stderr, com data/hora prefixadas. Você pode customizar prefixo, flags (incluir nome de arquivo, microssegundos) e até onde escreve (para um arquivo, por exemplo). É barato e funciona, mas tem uma limitação grande: as mensagens são texto livre, difíceis de filtrar e analisar em ferramentas como Datadog, Loki ou ELK.

O 'log/slog' nasceu para resolver isso. Em vez de "usuario X fez login", você escreve uma mensagem e atributos estruturados (chave=valor). O resultado é uma linha que pode ser texto legível (handler de texto) ou JSON pronto para ingestão (handler JSON). Ele tem níveis de severidade (Debug, Info, Warn, Error), suporte a contexto e é muito mais útil quando seu sistema cresce e logs viram a principal ferramenta de diagnóstico.

Uma armadilha clássica é usar log.Fatal dentro de bibliotecas. Fatal chama os.Exit, o que pula todos os defers — conexões ficam abertas, arquivos não fecham, panics não rodam. Em libs, devolva error. Reserve Fatal para o main() ou scripts pequenos. E, regra de ouro: nunca use Println com fmt para logar produção. Logs precisam de timestamp, nível e (idealmente) estrutura. Use o pacote certo desde o começo.`,
    codes: [
      {
        lang: "go",
        code: `// Pacote 'log' clássico: simples, prefixo + timestamp.
package main

import "log"

func main() {
    log.Print("servidor iniciando na porta 8080")
    // → 2024/05/12 10:30:42 servidor iniciando na porta 8080

    log.Printf("usuário %s autenticado", "ana@email.com")
    // → 2024/05/12 10:30:42 usuário ana@email.com autenticado

    // log.Fatal loga + os.Exit(1). Pula defers!
    // log.Fatal("config inválida, não consigo subir")
}`,
      },
      {
        lang: "go",
        code: `// Customizando prefixo, flags e destino.
package main

import (
    "log"
    "os"
)

func main() {
    arquivo, err := os.OpenFile("app.log",
        os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
    if err != nil {
        log.Fatal("não consegui abrir log:", err)
    }
    defer arquivo.Close()

    // SetOutput direciona para o arquivo aberto.
    log.SetOutput(arquivo)
    log.SetPrefix("[loja] ")
    // Lshortfile inclui arquivo:linha. Útil para debug.
    log.SetFlags(log.LstdFlags | log.Lshortfile)

    log.Print("pedido criado")
    // No app.log: [loja] 2024/05/12 10:30:42 main.go:18: pedido criado
}`,
      },
      {
        lang: "go",
        code: `// log/slog: logging estruturado moderno (Go 1.21+).
package main

import (
    "log/slog"
    "os"
)

func main() {
    // Handler JSON: cada linha é um JSON pronto para ingestão.
    logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

    logger.Info("usuário autenticado",
        "user_id", 42,
        "email", "ana@email.com",
        "duracao_ms", 87,
    )
    // → {"time":"2024-05-12T10:30:42Z","level":"INFO",
    //    "msg":"usuário autenticado","user_id":42,
    //    "email":"ana@email.com","duracao_ms":87}

    logger.Warn("estoque baixo", "produto_id", 7, "quantidade", 2)
    logger.Error("pagamento recusado", "pedido_id", 1234, "codigo", "INSUF")
}`,
      },
      {
        lang: "go",
        code: `// Logger com atributos sempre presentes (With).
package main

import (
    "log/slog"
    "os"
)

func main() {
    base := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelDebug, // mostra Debug também
    }))

    // Logger derivado já carrega os campos service e versão.
    log := base.With("service", "api-pedidos", "version", "1.4.2")

    log.Debug("entrando no handler", "rota", "/pedidos")
    log.Info("pedido aceito", "id", 1234)
    // → time=... level=INFO msg="pedido aceito"
    //   service=api-pedidos version=1.4.2 id=1234
}`,
      },
      {
        lang: "go",
        code: `// Substituindo o logger global do slog (afeta todo o programa).
package main

import (
    "log/slog"
    "os"
)

func main() {
    h := slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    })
    slog.SetDefault(slog.New(h))

    // Agora qualquer slog.Info em qualquer pacote usa o handler JSON.
    slog.Info("aplicação subiu", "porta", 8080)
    slog.Error("falha externa", "servico", "cep-api", "status", 503)
}`,
      },
    ],
    points: [
      "log.Print adiciona timestamp por padrão; log.Fatal loga e chama os.Exit(1).",
      "log.Fatal pula TODOS os defers — não use dentro de bibliotecas, só no main.",
      "log/slog (Go 1.21+) faz logging estruturado, ideal para sistemas modernos.",
      "Em slog, prefira pares chave/valor a frases — facilita filtrar em ferramentas de log.",
      "Use slog.New(slog.NewJSONHandler(...)) para logs prontos para Datadog/Loki/ELK.",
      "Idiomático: criar um logger base com .With() para campos comuns (service, version).",
      "Armadilha: usar fmt.Println para logar — sem timestamp, sem nível, péssimo na produção.",
      "Erro comum: chamar log.Fatal numa goroutine — derruba o programa todo de surpresa.",
      "slog.SetDefault troca o logger global do programa inteiro.",
    ],
    alerts: [
      {
        type: "info",
        content: "O pacote log/slog faz parte da stdlib desde o Go 1.21. Antes disso, projetos usavam libs externas como zap (Uber) ou zerolog. Para projetos novos, comece com slog.",
      },
      {
        type: "warning",
        content: "Logs em produção podem vazar dados sensíveis: senhas, tokens, CPFs. Tenha cuidado com o que coloca nos atributos e considere mascarar campos críticos.",
      },
      {
        type: "tip",
        content: "Em ambiente de desenvolvimento use TextHandler (mais legível). Em produção use JSONHandler (mais fácil de processar). Decida pelo ambiente, não pelo gosto.",
      },
    ],
  },
  {
    slug: "fmt-detalhes",
    section: "pacotes-erros",
    title: "fmt em profundidade",
    difficulty: "intermediario",
    subtitle: "Verbos %v, %+v, %#v, %T, %q, %x e como Printf, Sprintf, Errorf e Fprintf se relacionam",
    intro: `O pacote 'fmt' é o canivete suíço do Go para formatação. Você já usou fmt.Println e fmt.Printf, mas aposto que pelo menos metade dos verbos disponíveis ainda é mistério. Conhecê-los direito poupa horas de debug e torna seu código mais expressivo.

A família tem um padrão claro de prefixos. P (Print) escreve para stdout. F (Fprint) escreve para um io.Writer qualquer (arquivo, buffer, conexão). S (Sprint) devolve uma string em vez de imprimir. E (Errorf) devolve um error. Cada um tem três versões: a básica (Print, Sprint), a com formato (Printf, Sprintf) e a com nova linha automática (Println, Sprintln). Combinar essas peças cobre 99% das necessidades.

Os verbos são a parte rica. %v imprime o valor "natural" — usa o método String() se houver, senão um padrão razoável. %+v inclui nome dos campos em structs (ótimo para debug). %#v imprime no formato Go (literal que você pode colar de volta no código). %T mostra o tipo dinâmico, indispensável para investigar interface{}. %q coloca aspas e escapa caracteres especiais — perfeito para mostrar strings em logs. Para números, %d (decimal), %x (hex), %b (binário), %o (octal), %f (float), %e (científico), %g (escolhe entre f e e). E você ainda pode controlar largura e precisão: %5d alinha em 5 colunas, %.2f mostra duas casas decimais.

Implementar 'fmt.Stringer' (método String() string) num tipo seu faz com que ele apareça bonito em qualquer lugar que use %v. Idiomático em Go é não escrever logs com fmt.Println — mas é totalmente idiomático construir mensagens de erro com fmt.Errorf e mostrar valores em testes com %+v. Domine os verbos: você vai usá-los todo dia.`,
    codes: [
      {
        lang: "go",
        code: `// Verbos básicos: %v, %+v, %#v, %T, %q.
package main

import "fmt"

type Produto struct {
    Nome  string
    Preco float64
}

func main() {
    p := Produto{Nome: "Café", Preco: 12.5}

    fmt.Printf("%v\\n", p)   // → {Café 12.5}
    fmt.Printf("%+v\\n", p)  // → {Nome:Café Preco:12.5}
    fmt.Printf("%#v\\n", p)  // → main.Produto{Nome:"Café", Preco:12.5}
    fmt.Printf("%T\\n", p)   // → main.Produto
    fmt.Printf("%q\\n", p.Nome) // → "Café"
}`,
      },
      {
        lang: "go",
        code: `// Verbos numéricos: largura, precisão, base.
package main

import "fmt"

func main() {
    fmt.Printf("%d\\n", 255)       // → 255
    fmt.Printf("%x\\n", 255)       // → ff
    fmt.Printf("%X\\n", 255)       // → FF
    fmt.Printf("%b\\n", 255)       // → 11111111
    fmt.Printf("%o\\n", 8)         // → 10
    fmt.Printf("%5d\\n", 42)       // → "   42" (largura 5)
    fmt.Printf("%-5d|\\n", 42)     // → "42   |" (alinhado à esquerda)
    fmt.Printf("%05d\\n", 42)      // → 00042  (preenche com zeros)

    fmt.Printf("%f\\n", 3.14159)   // → 3.141590
    fmt.Printf("%.2f\\n", 3.14159) // → 3.14
    fmt.Printf("%8.2f\\n", 3.1)    // → "    3.10"
    fmt.Printf("%e\\n", 1234567.0) // → 1.234567e+06
    fmt.Printf("%g\\n", 1234567.0) // → 1.234567e+06 (escolhe melhor formato)
}`,
      },
      {
        lang: "go",
        code: `// fmt.Stringer: deixe seu tipo se imprimir bonito.
package main

import "fmt"

type Moeda struct {
    Valor   int    // em centavos para evitar erros de float
    Codigo  string // "BRL", "USD"
}

// Implementar String() faz %v e %s usarem essa formatação.
func (m Moeda) String() string {
    inteira := m.Valor / 100
    centavos := m.Valor % 100
    return fmt.Sprintf("%s %d,%02d", m.Codigo, inteira, centavos)
}

func main() {
    preco := Moeda{Valor: 1599, Codigo: "BRL"}
    fmt.Println("Total:", preco)
    // → Total: BRL 15,99
    fmt.Printf("Total formatado: %v\\n", preco)
    // → Total formatado: BRL 15,99
}`,
      },
      {
        lang: "go",
        code: `// Sprintf, Fprintf e Errorf: variações úteis.
package main

import (
    "fmt"
    "os"
    "strings"
)

func main() {
    // Sprintf: monta string sem imprimir.
    nome := "Marcos"
    saudacao := fmt.Sprintf("Olá, %s! Bom dia.", nome)
    fmt.Println(saudacao)
    // → Olá, Marcos! Bom dia.

    // Fprintf: escreve em qualquer io.Writer (arquivo, buffer, stderr).
    fmt.Fprintf(os.Stderr, "AVISO: estoque baixo (%d unid.)\\n", 3)

    // Buffer em memória: ótimo para construir strings grandes.
    var sb strings.Builder
    for i := 1; i <= 3; i++ {
        fmt.Fprintf(&sb, "linha %d\\n", i)
    }
    fmt.Print(sb.String())
    // → linha 1
    // → linha 2
    // → linha 3

    // Errorf: cria um error formatado, pode embrulhar com %w.
    err := fmt.Errorf("validação falhou no campo %q", "email")
    fmt.Println(err)
    // → validação falhou no campo "email"
}`,
      },
      {
        lang: "go",
        code: `// Argumentos posicionais com [N]: reusar o mesmo argumento.
package main

import "fmt"

func main() {
    // [1] aponta para o primeiro argumento, [2] para o segundo.
    fmt.Printf("%[1]d em hex é %[1]x e em binário %[1]b\\n", 100)
    // → 100 em hex é 64 e em binário 1100100

    // Útil em mensagens de erro com variável repetida.
    nome := "config.json"
    msg := fmt.Sprintf("falha em %[1]s: arquivo %[1]s ausente", nome)
    fmt.Println(msg)
    // → falha em config.json: arquivo config.json ausente
}`,
      },
    ],
    points: [
      "%v imprime valor padrão; %+v inclui nomes de campos; %#v gera literal Go.",
      "%T revela o tipo dinâmico — indispensável ao investigar interface{}.",
      "%q coloca aspas e escapa caracteres; ótimo para logs com strings.",
      "Controle largura e precisão: %5d, %.2f, %05d, %-10s.",
      "Implemente fmt.Stringer (String() string) para tipos próprios aparecerem bonitos.",
      "Sprintf devolve string; Fprintf escreve em io.Writer; Errorf devolve error.",
      "Use fmt.Errorf com %w para embrulhar erros preservando a cadeia.",
      "Idiomático: usar %+v em mensagens de teste para ver structs com nomes de campos.",
      "Armadilha: passar argumentos demais ou menos do que verbos — gera %!(EXTRA ...) no output.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando estiver debugando, troque %v por %+v em structs. A diferença é enorme: você passa a ver os nomes dos campos junto dos valores.",
      },
      {
        type: "info",
        content: "fmt.Println separa argumentos com espaço e adiciona nova linha. fmt.Print não adiciona espaço entre strings adjacentes (só entre não-strings). Detalhe sutil que confunde.",
      },
      {
        type: "warning",
        content: "Concatenar strings em loop com fmt.Sprintf é caro. Para construir strings grandes em laços, use strings.Builder com Fprintf — bem mais rápido.",
      },
    ],
  },
  {
    slug: "strings-pkg",
    section: "pacotes-erros",
    title: "Pacote strings",
    difficulty: "iniciante",
    subtitle: "Manipulação de texto: Split, Join, Replace, Contains, HasPrefix e o estratégico strings.Builder",
    intro: `Em Go, string é um tipo imutável de bytes (UTF-8 por padrão). Você não pode alterar uma string no lugar como em C; toda 'modificação' produz uma nova. O pacote 'strings' da stdlib reúne dezenas de funções utilitárias para fazer essas transformações: dividir por separador, juntar, substituir, verificar prefixo/sufixo, mudar caixa, remover espaços. É pacote de uso diário e merece ficar na ponta da língua.

A maioria das funções segue um padrão consistente. Recebem a string como primeiro argumento, retornam o resultado novo. strings.Split(s, sep) devolve um slice com as partes; strings.Join(slice, sep) faz o caminho inverso. HasPrefix e HasSuffix são checagens booleanas óbvias. Contains diz se uma substring aparece. ToLower e ToUpper mudam caixa (com cuidado para Unicode — caracteres como 'İ' têm pegadinhas). TrimSpace remove espaços nas pontas, Trim remove qualquer conjunto de runes que você passar.

Para substituições simples use strings.Replace ou ReplaceAll. Quando precisar fazer várias substituições de uma vez, use strings.NewReplacer — ele é mais eficiente porque processa tudo numa passada só. Para construir strings grandes em loop (concatenação repetida é cara, cada + cria uma string nova), use strings.Builder com Write/WriteString/Fprintf. É a técnica idiomática em Go para montagem incremental de texto.

Lembre que string em Go é bytes UTF-8, não caracteres. len(s) devolve o tamanho em bytes, não em letras. 'café' tem 5 bytes, não 4. Para iterar por caracteres (runes) corretamente, use range — ele decodifica UTF-8 para você. Para contar caracteres reais, use utf8.RuneCountInString do pacote unicode/utf8. É um detalhe que pega muita gente quando aparece um nome com acento.`,
    codes: [
      {
        lang: "go",
        code: `// Funções fundamentais: Split, Join, Contains, HasPrefix.
package main

import (
    "fmt"
    "strings"
)

func main() {
    csv := "café,pão,leite,queijo"
    itens := strings.Split(csv, ",")
    fmt.Println(itens)              // → [café pão leite queijo]
    fmt.Println(len(itens))         // → 4

    junto := strings.Join(itens, " | ")
    fmt.Println(junto)              // → café | pão | leite | queijo

    fmt.Println(strings.Contains(csv, "leite"))      // → true
    fmt.Println(strings.HasPrefix(csv, "café"))      // → true
    fmt.Println(strings.HasSuffix(csv, ".csv"))      // → false
    fmt.Println(strings.Count(csv, ","))             // → 3
    fmt.Println(strings.Index(csv, "leite"))         // → 14
}`,
      },
      {
        lang: "go",
        code: `// Substituições e limpeza de espaços.
package main

import (
    "fmt"
    "strings"
)

func main() {
    bagunca := "   Olá, Mundo!   "
    limpa := strings.TrimSpace(bagunca)
    fmt.Printf("%q\\n", limpa)  // → "Olá, Mundo!"

    // Remove caracteres específicos das pontas.
    cep := "##01310-100##"
    fmt.Println(strings.Trim(cep, "#"))  // → 01310-100

    // ReplaceAll troca todas as ocorrências.
    texto := "rato roeu a roupa do rei de Roma"
    fmt.Println(strings.ReplaceAll(texto, "r", "R"))
    // → Rato Roeu a Roupa do Rei de Roma

    // Caixa.
    fmt.Println(strings.ToUpper("ana@email.com"))  // → ANA@EMAIL.COM
    fmt.Println(strings.ToLower("ANA@EMAIL.COM"))  // → ana@email.com
    fmt.Println(strings.Title("olá mundo"))        // depreciado, mas ainda funciona
}`,
      },
      {
        lang: "go",
        code: `// strings.Builder: construa texto grande sem desperdiçar memória.
package main

import (
    "fmt"
    "strings"
)

func gerarRelatorio(itens []string) string {
    var sb strings.Builder
    sb.WriteString("=== RELATÓRIO ===\\n")
    for i, item := range itens {
        // Fprintf escreve direto no Builder, sem alocar string intermediária.
        fmt.Fprintf(&sb, "%d. %s\\n", i+1, item)
    }
    sb.WriteString("=== FIM ===\\n")
    return sb.String()
}

func main() {
    fmt.Print(gerarRelatorio([]string{"Café", "Pão", "Leite"}))
    // → === RELATÓRIO ===
    // → 1. Café
    // → 2. Pão
    // → 3. Leite
    // → === FIM ===
}`,
      },
      {
        lang: "go",
        code: `// strings.NewReplacer: várias substituições numa só passada.
package main

import (
    "fmt"
    "strings"
)

func main() {
    // Pares (de, para). Útil para escapar HTML, normalizar texto, etc.
    escapaHTML := strings.NewReplacer(
        "&", "&amp;",
        "<", "&lt;",
        ">", "&gt;",
        "\\"", "&quot;",
    )

    entrada := \`<a href="x">A & B</a>\`
    fmt.Println(escapaHTML.Replace(entrada))
    // → &lt;a href=&quot;x&quot;&gt;A &amp; B&lt;/a&gt;
}`,
      },
      {
        lang: "go",
        code: `// UTF-8: len é bytes, não caracteres. Use range para runes.
package main

import (
    "fmt"
    "unicode/utf8"
)

func main() {
    nome := "café"
    fmt.Println(len(nome))                       // → 5  (bytes)
    fmt.Println(utf8.RuneCountInString(nome))    // → 4  (caracteres)

    // range itera por (índice em bytes, rune).
    for i, r := range nome {
        fmt.Printf("posição %d: %c (U+%04X)\\n", i, r, r)
    }
    // → posição 0: c (U+0063)
    // → posição 1: a (U+0061)
    // → posição 2: f (U+0066)
    // → posição 3: é (U+00E9)
    //   (a posição 4 estaria no segundo byte do 'é', range pula isso)
}`,
      },
    ],
    points: [
      "Strings em Go são imutáveis — toda 'modificação' produz nova string.",
      "Split/Join são duas faces da mesma moeda: separar e remontar por delimitador.",
      "TrimSpace remove só espaços nas pontas; Trim aceita conjunto custom de runes.",
      "Para várias substituições, prefira strings.NewReplacer — bem mais rápido que vários ReplaceAll.",
      "Idiomático: use strings.Builder com Fprintf para construir strings grandes em loop.",
      "len(s) devolve bytes, não caracteres. Use utf8.RuneCountInString para contar runes.",
      "Itere strings UTF-8 com range — cada iteração já entrega a rune decodificada.",
      "Armadilha: usar s[i] esperando o i-ésimo caractere — você pega o i-ésimo byte e pode partir um caractere multibyte ao meio.",
      "strings.Index devolve -1 quando não encontra; sempre cheque antes de usar como offset.",
    ],
    alerts: [
      {
        type: "info",
        content: "strings.Title está depreciado desde Go 1.18 por não lidar bem com regras Unicode. Para capitalizar palavras corretamente, use golang.org/x/text/cases.",
      },
      {
        type: "tip",
        content: "Quando precisar comparar strings ignorando caixa, use strings.EqualFold(a, b). É correto para Unicode e mais rápido que ToLower nas duas pontas.",
      },
      {
        type: "warning",
        content: "Não use + dentro de loop para concatenar muitas strings. Cada + aloca uma string nova; com 1000 iterações você tem 1000 alocações. strings.Builder resolve.",
      },
    ],
  },
  {
    slug: "strconv",
    section: "pacotes-erros",
    title: "Conversões com strconv",
    difficulty: "iniciante",
    subtitle: "Itoa, Atoi, ParseFloat, ParseBool e por que Go é rigoroso com conversões entre número e texto",
    intro: `Diferente de JavaScript ou PHP, Go não converte automaticamente entre número e texto. Em Go, "10" + 5 nem compila. Essa rigidez é proposital: ela elimina toda uma classe de bugs sutis (somar dois "10" e receber "105" em vez de 20). Para fazer a conversão você usa o pacote 'strconv', que oferece funções dedicadas para cada direção, com tratamento de erro explícito quando a conversão pode falhar.

As funções mais usadas têm nomes curtos por tradição. strconv.Itoa(int) devolve string. strconv.Atoi(string) devolve (int, error). Quando a string não é um número válido, error é não-nulo. Para outros tipos numéricos use ParseInt, ParseFloat, ParseBool, ou as versões para escrever (FormatInt, FormatFloat, FormatBool). Cada uma aceita parâmetros como base (2, 10, 16) e bit size (32, 64), dando controle preciso.

ParseFloat tem um detalhe importante: ela usa ponto como separador decimal, padrão internacional/inglês. Se você está lendo "3,14" do usuário brasileiro, troque a vírgula por ponto antes. Não existe locale automático. ParseInt aceita base — base 0 é especial: ela detecta o prefixo (0x para hex, 0b para binário, 0 para octal). Útil para ler configurações de usuário avançado.

Saiba a diferença entre Atoi e ParseInt: Atoi é só um atalho para ParseInt(s, 10, 0) com cast pra int. Para int32 ou int64, use ParseInt direto e passe o bit size correto. Para qualquer conversão de input externo (formulário, arquivo, query string), SEMPRE trate o erro. Ignorar o erro é o caminho mais rápido para "0" silencioso onde deveria estar uma exceção alta e clara.`,
    codes: [
      {
        lang: "go",
        code: `// Itoa e Atoi: o par mais comum, int <-> string.
package main

import (
    "fmt"
    "strconv"
)

func main() {
    // int → string
    idade := 30
    s := strconv.Itoa(idade)
    fmt.Println("idade como texto:", s, "len=", len(s))
    // → idade como texto: 30 len= 2

    // string → int (sempre cheque o erro!)
    entrada := "42"
    n, err := strconv.Atoi(entrada)
    if err != nil {
        fmt.Println("não é número:", err)
        return
    }
    fmt.Println(n + 8) // → 50

    // String inválida.
    _, err = strconv.Atoi("abc")
    fmt.Println(err)
    // → strconv.Atoi: parsing "abc": invalid syntax
}`,
      },
      {
        lang: "go",
        code: `// ParseFloat e FormatFloat: floats com controle de precisão.
package main

import (
    "fmt"
    "strconv"
    "strings"
)

func main() {
    // ParseFloat usa ponto como separador decimal.
    preco, err := strconv.ParseFloat("19.90", 64)
    if err != nil {
        fmt.Println("preço inválido:", err)
        return
    }
    fmt.Println(preco * 3) // → 59.7

    // Para input brasileiro com vírgula, troque antes.
    bruto := "1.234,56"
    normalizado := strings.ReplaceAll(strings.ReplaceAll(bruto, ".", ""), ",", ".")
    valor, _ := strconv.ParseFloat(normalizado, 64)
    fmt.Println(valor) // → 1234.56

    // Formatando float para string.
    // 'f' = formato fixo, 2 = casas decimais, 64 = bits.
    fmt.Println(strconv.FormatFloat(3.14159, 'f', 2, 64)) // → 3.14
    fmt.Println(strconv.FormatFloat(1234.5, 'e', 3, 64))  // → 1.235e+03
}`,
      },
      {
        lang: "go",
        code: `// ParseInt com base e bit size.
package main

import (
    "fmt"
    "strconv"
)

func main() {
    // Base 16 (hexadecimal), até 64 bits.
    n, err := strconv.ParseInt("ff", 16, 64)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(n) // → 255

    // Base 2 (binário).
    bin, _ := strconv.ParseInt("1010", 2, 64)
    fmt.Println(bin) // → 10

    // Base 0: detecta automaticamente pelo prefixo.
    auto, _ := strconv.ParseInt("0x1A", 0, 64)
    fmt.Println(auto) // → 26
    autoBin, _ := strconv.ParseInt("0b1100", 0, 64)
    fmt.Println(autoBin) // → 12

    // Bit size 32 garante que cabe em int32.
    _, err = strconv.ParseInt("99999999999", 10, 32)
    fmt.Println(err)
    // → strconv.ParseInt: parsing "99999999999": value out of range
}`,
      },
      {
        lang: "go",
        code: `// ParseBool: aceita várias formas comuns.
package main

import (
    "fmt"
    "strconv"
)

func main() {
    valores := []string{"true", "false", "1", "0", "T", "F", "yes", "TRUE"}
    for _, v := range valores {
        b, err := strconv.ParseBool(v)
        if err != nil {
            fmt.Printf("%q → inválido: %v\\n", v, err)
            continue
        }
        fmt.Printf("%q → %v\\n", v, b)
    }
    // → "true" → true
    // → "false" → false
    // → "1" → true
    // → "0" → false
    // → "T" → true
    // → "F" → false
    // → "yes" → inválido: strconv.ParseBool: parsing "yes": invalid syntax
    // → "TRUE" → true
}`,
      },
      {
        lang: "go",
        code: `// Quote e Unquote: escapar strings para literais Go.
package main

import (
    "fmt"
    "strconv"
)

func main() {
    s := "linha 1\\nlinha 2\\t\\"aspas\\""
    aspas := strconv.Quote(s)
    fmt.Println(aspas)
    // → "linha 1\\nlinha 2\\t\\"aspas\\""

    // Útil para gerar logs ou código fonte.
    original, err := strconv.Unquote(aspas)
    if err != nil {
        fmt.Println("erro:", err)
        return
    }
    fmt.Println(original)
    // → linha 1
    // → linha 2  "aspas"
}`,
      },
    ],
    points: [
      "Go não converte número/texto automaticamente — use strconv para tudo.",
      "Atoi e Itoa são atalhos para int <-> string em base 10.",
      "Para int32, int64, uint16 etc., use ParseInt/FormatInt com bit size correto.",
      "ParseFloat usa ponto como separador decimal — converta vírgula antes se vier do usuário BR.",
      "ParseInt com base 0 detecta automaticamente prefixos 0x, 0b, 0o.",
      "ParseBool aceita 'true', 'false', '1', '0', 't', 'f', 'T', 'F' (e variações).",
      "Idiomático: nunca ignore o erro de conversão — input inválido vira bug silencioso.",
      "Armadilha: esquecer que ParseFloat retorna float64 e tentar atribuir direto a float32 sem cast.",
      "strconv.Quote escapa string para virar literal Go válido — útil em logs e geração de código.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Não use fmt.Sprintf(\"%d\", n) para converter int em string só por costume. strconv.Itoa é mais rápido e mais explícito sobre a intenção.",
      },
      {
        type: "info",
        content: "Erros de strconv têm tipo concreto *strconv.NumError. Se precisar saber qual era a string original, faça type assertion e leia o campo Num.",
      },
      {
        type: "tip",
        content: "Em validação de formulário, junte strconv com mensagens específicas. 'idade deve ser número' é melhor que repassar 'strconv.Atoi: parsing ...' direto para o usuário final.",
      },
    ],
  },
  {
    slug: "time-pkg",
    section: "pacotes-erros",
    title: "Pacote time",
    difficulty: "intermediario",
    subtitle: "Now, Parse, Format com a referência mágica 2006-01-02, Duration, timeouts e Tickers",
    intro: `O pacote 'time' do Go faz datas, durações, timers e tickers. Tem decisões de design únicas que merecem atenção. A primeira: o método Format e Parse usam uma string de referência fixa em vez de letras como 'YYYY-MM-DD'. A referência é '2006-01-02 15:04:05', uma data específica em janeiro de 2006 escolhida porque os números formam a sequência 1, 2, 3, 4, 5, 6 (mês, dia, hora, minuto, segundo, ano). Estranho à primeira vista, mas você nunca confunde mês com minuto depois que decora.

A segunda decisão importante: time.Duration é um tipo, representado em nanossegundos (int64). Você não soma "3 minutos" como número solto; usa 3 * time.Minute, que vira uma Duration tipada. Isso evita unidades misturadas. Para criar timeouts: 5 * time.Second. Para somar duas durações: d1 + d2. Para imprimir: a Duration tem String() bonito ("3m20s").

time.Now() devolve a hora atual no fuso local. Para UTC use Now().UTC(). Para outro fuso, carregue com time.LoadLocation("America/Sao_Paulo") e use In(loc). Em sistemas distribuídos, prefira UTC internamente e converta só na hora de exibir; assim você evita confusão quando logs vêm de máquinas em fusos diferentes.

Tickers e Timers são para agendamento. time.NewTicker(d) emite valores num channel a cada d segundos — útil para tarefas periódicas. time.AfterFunc(d, f) chama f depois de d. Para timeouts em operações de rede, normalmente você combina time.After ou context.WithTimeout com select sobre channels. Cuidado para sempre chamar Stop() em tickers que você não precisa mais — senão eles ficam consumindo recursos até o programa fechar. Esse é um vazamento clássico.`,
    codes: [
      {
        lang: "go",
        code: `// time.Now, formatação e parsing.
package main

import (
    "fmt"
    "time"
)

func main() {
    agora := time.Now()
    fmt.Println(agora)
    // → 2024-05-12 10:30:42.123 -0300 -03

    // Format usa a string de referência mágica: 2006-01-02 15:04:05.
    fmt.Println(agora.Format("02/01/2006"))         // → 12/05/2024
    fmt.Println(agora.Format("2006-01-02"))         // → 2024-05-12
    fmt.Println(agora.Format("15:04"))              // → 10:30
    fmt.Println(agora.Format(time.RFC3339))         // → 2024-05-12T10:30:42-03:00
    fmt.Println(agora.Format("Mon, 02 Jan 2006"))   // → Sun, 12 May 2024

    // Parse: caminho inverso.
    t, err := time.Parse("02/01/2006", "25/12/2024")
    if err != nil {
        fmt.Println("data inválida:", err)
        return
    }
    fmt.Println(t.Weekday()) // → Wednesday
}`,
      },
      {
        lang: "go",
        code: `// Fusos horários: LoadLocation e ParseInLocation.
package main

import (
    "fmt"
    "time"
)

func main() {
    // Carrega o fuso pelo nome IANA.
    sp, err := time.LoadLocation("America/Sao_Paulo")
    if err != nil {
        fmt.Println(err)
        return
    }

    agora := time.Now()
    fmt.Println("UTC:", agora.UTC().Format(time.RFC3339))
    // → UTC: 2024-05-12T13:30:42Z
    fmt.Println("SP:", agora.In(sp).Format(time.RFC3339))
    // → SP: 2024-05-12T10:30:42-03:00

    // Parse interpretando data sem fuso como sendo de SP.
    t, _ := time.ParseInLocation("2006-01-02 15:04", "2024-12-25 18:00", sp)
    fmt.Println(t)
    // → 2024-12-25 18:00:00 -0300 -03
}`,
      },
      {
        lang: "go",
        code: `// Duration: aritmética com tempo, timeouts e Sleep.
package main

import (
    "fmt"
    "time"
)

func main() {
    cinco := 5 * time.Second
    meio  := 500 * time.Millisecond
    total := cinco + meio
    fmt.Println("total:", total) // → total: 5.5s

    // Diferença entre dois instantes.
    inicio := time.Now()
    time.Sleep(150 * time.Millisecond)
    fim := time.Now()
    fmt.Println("levou:", fim.Sub(inicio))
    // → levou: 150.xxxxxxxms

    // Adicionar duração a uma data.
    amanha := time.Now().Add(24 * time.Hour)
    fmt.Println("amanhã:", amanha.Format("02/01/2006"))

    // Comparações.
    fmt.Println(amanha.After(inicio))  // → true
    fmt.Println(inicio.Before(amanha)) // → true
}`,
      },
      {
        lang: "go",
        code: `// Ticker: tarefa periódica. SEMPRE chame Stop() para evitar leak.
package main

import (
    "fmt"
    "time"
)

func main() {
    ticker := time.NewTicker(300 * time.Millisecond)
    defer ticker.Stop() // libera recursos quando a função terminar

    fim := time.After(1 * time.Second) // canal que dispara depois de 1s
    contador := 0

    for {
        select {
        case t := <-ticker.C:
            contador++
            fmt.Printf("tick %d em %s\\n", contador, t.Format("15:04:05.000"))
        case <-fim:
            fmt.Println("encerrando após 1 segundo")
            return
        }
    }
    // → tick 1 em 10:30:42.300
    // → tick 2 em 10:30:42.600
    // → tick 3 em 10:30:42.900
    // → encerrando após 1 segundo
}`,
      },
      {
        lang: "go",
        code: `// AfterFunc: agenda execução em background.
package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("agendando lembrete...")
    timer := time.AfterFunc(500*time.Millisecond, func() {
        fmt.Println("hora de regar as plantas!")
    })
    // Você pode cancelar antes de disparar:
    // timer.Stop()
    _ = timer

    // Espera para a função rodar.
    time.Sleep(700 * time.Millisecond)
    // → agendando lembrete...
    // → hora de regar as plantas!
}`,
      },
    ],
    points: [
      "A referência de format/parse é 2006-01-02 15:04:05 (em UTC com nome 'Mon Jan').",
      "time.Duration é um tipo em nanossegundos — use 5 * time.Second, não 5.",
      "time.Now() devolve hora local; .UTC() ou .In(loc) muda fuso.",
      "Carregue fusos com time.LoadLocation(\"America/Sao_Paulo\").",
      "Idiomático: armazenar internamente em UTC e converter só ao exibir.",
      "Ticker emite valores num canal periodicamente; Stop libera recursos.",
      "AfterFunc agenda função em background; Stop cancela antes de disparar.",
      "Armadilha: esquecer defer ticker.Stop() — vazamento clássico de goroutine/timer.",
      "Erro comum: usar formato 'YYYY-MM-DD' por hábito — Go ignora e devolve a string literal.",
    ],
    alerts: [
      {
        type: "info",
        content: "Para timeouts em chamadas de rede ou banco, prefira context.WithTimeout em vez de time.After. context propaga cancelamento de forma estruturada e é o padrão atual.",
      },
      {
        type: "warning",
        content: "time.Time tem comparação delicada porque carrega fuso. Use Equal() em vez de == para comparar instantes em fusos diferentes que representam o mesmo momento.",
      },
      {
        type: "tip",
        content: "Decore as constantes time.RFC3339 e time.RFC1123. Quase toda integração externa pede uma delas, e usar a constante evita digitar a referência 2006-01-02 errada.",
      },
    ],
  },
  {
    slug: "math-rand",
    section: "pacotes-erros",
    title: "math/rand e crypto/rand",
    difficulty: "intermediario",
    subtitle: "Aleatoriedade pseudo-random com rand.New + Source, e quando trocar por crypto/rand",
    intro: `Go tem dois pacotes para números aleatórios e a diferença entre eles é importante. 'math/rand' é um gerador pseudo-random rápido, ótimo para jogos, simulações, embaralhar listas, escolher uma cor ao acaso. 'crypto/rand' é criptograficamente seguro, mais lento, usado para gerar tokens de sessão, senhas iniciais, IDs imprevisíveis. Misturar os dois é um erro de segurança real.

A partir do Go 1.20, math/rand foi reformulado. As funções globais (rand.Intn, rand.Float64) agora são auto-seedadas — não precisa mais chamar rand.Seed(time.Now().UnixNano()) no init. Antes do Go 1.20, esquecer essa chamada significava que o programa gerava sempre a mesma sequência. Hoje isso é resolvido para você. Para reproducibilidade controlada (testes, simulações que precisam ser determinísticas), use math/rand/v2 (Go 1.22+) com rand.New(rand.NewPCG(seed1, seed2)).

A maioria dos casos de uso é coberto por algumas funções: Intn(n) devolve int em [0, n); Float64() em [0.0, 1.0); Shuffle reordena um slice in-place; Perm dá uma permutação. Para distribuições específicas (normal, exponencial), as funções existem mas raramente são usadas em código de aplicação típica. Quando precisar, leia a doc — os nomes são claros.

Para tokens, IDs sensíveis, OTPs, NUNCA use math/rand. Mesmo seedado com tempo, é previsível. Use crypto/rand.Read para preencher um slice de bytes e converta para hex/base64. Há também encoding/hex e encoding/base64 prontos para essa conversão. Se precisa de UUID, prefira uma lib como github.com/google/uuid — implementa o RFC 4122 e usa crypto/rand internamente.`,
    codes: [
      {
        lang: "go",
        code: `// math/rand: rápido, pseudo-random, ótimo para jogo/simulação.
// A partir do Go 1.20 não precisa mais chamar rand.Seed() — auto-seed.
package main

import (
    "fmt"
    "math/rand"
)

func main() {
    fmt.Println(rand.Intn(6) + 1)         // dado de 6 lados, 1-6
    fmt.Println(rand.Float64())           // float em [0, 1)
    fmt.Println(rand.Intn(100))           // int em [0, 100)

    // Embaralhar um slice in-place.
    cartas := []string{"A", "K", "Q", "J", "10"}
    rand.Shuffle(len(cartas), func(i, j int) {
        cartas[i], cartas[j] = cartas[j], cartas[i]
    })
    fmt.Println(cartas) // → ordem diferente a cada execução
}`,
      },
      {
        lang: "go",
        code: `// math/rand/v2 (Go 1.22+): API mais limpa, com source explícito.
package main

import (
    "fmt"
    "math/rand/v2"
)

func main() {
    // Funções globais: simples e auto-seedadas.
    fmt.Println(rand.IntN(6) + 1)        // dado 1-6
    fmt.Println(rand.Float64())          // [0, 1)

    // Para sequência reproducível (tests, simulações), use NewPCG com seed fixa.
    r := rand.New(rand.NewPCG(42, 1024))
    fmt.Println(r.IntN(100), r.IntN(100), r.IntN(100))
    // → mesma sequência sempre que rodar com (42, 1024)

    // N[T] é genérica: respeita o tipo.
    var n int32 = rand.N[int32](500) // int32 em [0, 500)
    fmt.Println(n)
}`,
      },
      {
        lang: "go",
        code: `// Selecionando aleatoriamente um item de um slice.
package main

import (
    "fmt"
    "math/rand"
)

func sortear[T any](itens []T) T {
    return itens[rand.Intn(len(itens))]
}

func main() {
    sabores := []string{"chocolate", "morango", "creme", "flocos"}
    fmt.Println("hoje vou de:", sortear(sabores))

    // Resposta motivacional aleatória.
    frases := []string{
        "você consegue!",
        "um passo de cada vez",
        "errar faz parte",
    }
    fmt.Println(sortear(frases))
}`,
      },
      {
        lang: "go",
        code: `// crypto/rand: para tokens, sessões, IDs imprevisíveis.
package main

import (
    "crypto/rand"
    "encoding/hex"
    "fmt"
)

// TokenSeguro gera n bytes aleatórios e devolve como hex.
func TokenSeguro(nBytes int) (string, error) {
    b := make([]byte, nBytes)
    // crypto/rand.Read usa fonte do SO (urandom no Linux/macOS).
    if _, err := rand.Read(b); err != nil {
        return "", fmt.Errorf("falha ao gerar token: %w", err)
    }
    return hex.EncodeToString(b), nil
}

func main() {
    tok, err := TokenSeguro(16) // 16 bytes = 128 bits = 32 chars hex
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println("token de sessão:", tok)
    // → token de sessão: 4f3a92b1ce... (sempre diferente)
}`,
      },
      {
        lang: "go",
        code: `// UUID com lib externa (rode antes: go get github.com/google/uuid).
package main

import (
    "fmt"

    "github.com/google/uuid"
)

func main() {
    // NewRandom usa crypto/rand internamente — é seguro para IDs públicos.
    id := uuid.NewString()
    fmt.Println("pedido:", id)
    // → pedido: 550e8400-e29b-41d4-a716-446655440000
}`,
      },
    ],
    points: [
      "math/rand é pseudo-random — rápido, ótimo para jogos e simulações.",
      "crypto/rand é criptograficamente seguro — use para tokens, senhas, IDs sensíveis.",
      "Go 1.20+ auto-seeda math/rand global, não precisa mais chamar rand.Seed.",
      "Para reproducibilidade, use math/rand/v2 com rand.New(rand.NewPCG(seed1, seed2)).",
      "Idiomático Go 1.22+: prefira math/rand/v2 — API mais limpa e com generics (rand.N[T]).",
      "rand.Intn(n) devolve [0, n); para [a, b] use a + rand.Intn(b-a+1).",
      "rand.Shuffle reordena slices in-place com função de troca.",
      "Armadilha: usar math/rand para gerar tokens de sessão — é previsível e vira buraco de segurança.",
      "Erro comum: passar 0 para Intn — gera panic 'invalid argument'.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Tokens de autenticação, OTPs, senhas iniciais e qualquer coisa que vá para um cookie ou cabeçalho HTTP DEVEM usar crypto/rand. math/rand é trivialmente previsível para um atacante.",
      },
      {
        type: "info",
        content: "math/rand/v2 (Go 1.22+) é uma reescrita completa que aproveitou para limpar a API antiga. O original ainda funciona, mas projetos novos devem usar v2.",
      },
      {
        type: "tip",
        content: "Para gerar UUIDs, instale github.com/google/uuid em vez de implementar à mão. A lib é pequena, sem dependências, segura e compatível com o RFC 4122.",
      },
    ],
  },
  {
    slug: "json-encoding",
    section: "pacotes-erros",
    title: "encoding/json",
    difficulty: "intermediario",
    subtitle: "Marshal, Unmarshal, struct tags e o decoder streaming para arquivos grandes",
    intro: `JSON é o formato de troca de dados mais comum em APIs e Go traz um pacote competente na stdlib: encoding/json. Ele converte structs para JSON (Marshal) e JSON para structs (Unmarshal), respeitando regras de mapeamento que você controla via struct tags. É código limpo, performático e amplamente usado.

A regra básica: campos exportados (com letra maiúscula) são serializados; campos privados são ignorados. Por padrão, o nome do campo no JSON é o nome do campo Go. Para customizar, use a tag json:"nome_no_json". Você pode adicionar opções: omitempty pula o campo se estiver vazio (zero value), - omite sempre, string codifica como string mesmo sendo número. Tags em Go ficam entre crases — atenção ao escapar quando estiver dentro de template literal TypeScript.

json.Marshal devolve []byte (não string!) e error. Para imprimir bonito use json.MarshalIndent com prefixo e indentação. json.Unmarshal recebe os bytes e um ponteiro para onde colocar o resultado. Sempre passe ponteiro — sem ele, Unmarshal não consegue alterar o destino. Tipos não conhecidos no JSON viram silenciosamente o zero value; campos extras no JSON que não existem no struct são ignorados (a menos que você use DisallowUnknownFields no Decoder).

Para arquivos ou streams grandes, use json.NewDecoder e json.NewEncoder. Eles operam sobre io.Reader/io.Writer e processam de forma incremental, sem carregar tudo na memória. Se o JSON é uma sequência de objetos (NDJSON, comum em logs), você pode chamar Decode em loop, lendo um objeto por vez. Para mapas dinâmicos cuja estrutura você não conhece em compile-time, use map[string]any — funciona, mas perde tipo. Quando possível, prefira structs tipados; eles documentam o contrato e evitam type assertions.`,
    codes: [
      {
        lang: "go",
        code: `// Marshal: struct → JSON.
package main

import (
    "encoding/json"
    "fmt"
)

// Tags em crases controlam o nome no JSON.
type Produto struct {
    ID    int     \`json:"id"\`
    Nome  string  \`json:"nome"\`
    Preco float64 \`json:"preco"\`
}

func main() {
    p := Produto{ID: 1, Nome: "Café 500g", Preco: 19.90}

    data, err := json.Marshal(p)
    if err != nil {
        fmt.Println("erro:", err)
        return
    }
    fmt.Println(string(data))
    // → {"id":1,"nome":"Café 500g","preco":19.9}

    // Versão indentada (mais legível).
    bonito, _ := json.MarshalIndent(p, "", "  ")
    fmt.Println(string(bonito))
    // → {
    // →   "id": 1,
    // →   "nome": "Café 500g",
    // →   "preco": 19.9
    // → }
}`,
      },
      {
        lang: "go",
        code: `// omitempty, json:"-" e renomear campos.
package main

import (
    "encoding/json"
    "fmt"
)

type Cliente struct {
    Nome     string  \`json:"nome"\`
    Email    string  \`json:"email,omitempty"\`   // pula se vazio
    Senha    string  \`json:"-"\`                 // nunca serializa
    Idade    int     \`json:"idade,omitempty"\`   // pula se zero
}

func main() {
    c := Cliente{Nome: "Ana", Senha: "secreta123"}
    out, _ := json.Marshal(c)
    fmt.Println(string(out))
    // → {"nome":"Ana"}
    // (sem email, sem idade, sem senha)
}`,
      },
      {
        lang: "go",
        code: `// Unmarshal: JSON → struct. Sempre passe ponteiro!
package main

import (
    "encoding/json"
    "fmt"
)

type Endereco struct {
    Rua    string \`json:"rua"\`
    Numero int    \`json:"numero"\`
    CEP    string \`json:"cep"\`
}

func main() {
    raw := []byte(\`{
        "rua": "Av. Paulista",
        "numero": 1578,
        "cep": "01310-100",
        "complemento": "ignorado"
    }\`)

    var e Endereco
    if err := json.Unmarshal(raw, &e); err != nil {
        fmt.Println("JSON inválido:", err)
        return
    }
    fmt.Printf("%+v\\n", e)
    // → {Rua:Av. Paulista Numero:1578 CEP:01310-100}
    // (campo "complemento" foi ignorado silenciosamente)
}`,
      },
      {
        lang: "go",
        code: `// Decoder streaming: arquivos grandes ou NDJSON.
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "strings"
)

type Evento struct {
    ID    int    \`json:"id"\`
    Tipo  string \`json:"tipo"\`
}

func main() {
    // NDJSON: um objeto JSON por linha (formato comum em logs).
    fonte := \`{"id":1,"tipo":"login"}
{"id":2,"tipo":"compra"}
{"id":3,"tipo":"logout"}\`

    dec := json.NewDecoder(strings.NewReader(fonte))
    for {
        var ev Evento
        if err := dec.Decode(&ev); err == io.EOF {
            break
        } else if err != nil {
            fmt.Println("erro:", err)
            return
        }
        fmt.Printf("processando evento %d: %s\\n", ev.ID, ev.Tipo)
    }
    // → processando evento 1: login
    // → processando evento 2: compra
    // → processando evento 3: logout
}`,
      },
      {
        lang: "go",
        code: `// JSON dinâmico com map[string]any quando o schema é desconhecido.
package main

import (
    "encoding/json"
    "fmt"
)

func main() {
    raw := []byte(\`{"nome":"Loja X","ativos":true,"funcionarios":42,"cidades":["SP","RJ"]}\`)

    var dados map[string]any
    if err := json.Unmarshal(raw, &dados); err != nil {
        fmt.Println(err)
        return
    }

    // Type assertions para extrair tipos concretos.
    fmt.Println(dados["nome"].(string))           // → Loja X
    fmt.Println(dados["ativos"].(bool))           // → true
    fmt.Println(dados["funcionarios"].(float64))  // JSON number sempre vira float64
    cidades := dados["cidades"].([]any)
    fmt.Println(cidades[0].(string))              // → SP
}`,
      },
      {
        lang: "go",
        code: `// DisallowUnknownFields: rejeitar JSON com campos extras.
package main

import (
    "encoding/json"
    "fmt"
    "strings"
)

type Config struct {
    Porta int \`json:"porta"\`
}

func main() {
    raw := \`{"porta": 8080, "x": "campo extra"}\`
    dec := json.NewDecoder(strings.NewReader(raw))
    dec.DisallowUnknownFields() // ativa modo estrito

    var cfg Config
    if err := dec.Decode(&cfg); err != nil {
        fmt.Println("erro:", err)
        // → erro: json: unknown field "x"
        return
    }
    fmt.Println(cfg)
}`,
      },
    ],
    points: [
      "Apenas campos exportados (maiúscula) são serializados em JSON.",
      "Use struct tags `json:\"nome\"` para customizar o nome no JSON.",
      "omitempty pula o campo quando ele tem o zero value (string vazia, 0, nil).",
      "json:\"-\" remove o campo da serialização (útil para senhas, segredos).",
      "json.Marshal devolve []byte, não string — converta com string() se precisar.",
      "Idiomático: usar json.NewDecoder/Encoder em vez de Marshal/Unmarshal para streams.",
      "Para schemas dinâmicos use map[string]any; números viram sempre float64.",
      "DisallowUnknownFields ativa modo estrito que rejeita campos não declarados.",
      "Armadilha: esquecer & no Unmarshal — sem ponteiro, ele não consegue alterar a variável.",
      "Erro comum: confundir crases (struct tag) com aspas — só crase funciona em tag.",
    ],
    alerts: [
      {
        type: "info",
        content: "Em JSON, todo número vira float64 quando você decodifica para map[string]any. Para inteiros grandes, use json.Number (UseNumber no decoder) ou structs tipados.",
      },
      {
        type: "warning",
        content: "Cuidado com JSON vindo de fora: sem DisallowUnknownFields, qualquer campo extra é ignorado silenciosamente. Pode esconder typos como 'idadde' no payload do cliente.",
      },
      {
        type: "tip",
        content: "Para validação avançada de payloads (mensagens custom, regras de negócio), combine encoding/json com uma lib como github.com/go-playground/validator/v10.",
      },
    ],
  },
  {
    slug: "csv-encoding",
    section: "pacotes-erros",
    title: "encoding/csv",
    difficulty: "intermediario",
    subtitle: "Leitura e escrita de CSV em streaming, separadores customizados e armadilhas com Excel BR",
    intro: `CSV é o formato mais simples e mais bagunçado que existe. Cada planilha de Excel exportada vem com pequenas variações: separador vírgula no padrão americano ou ponto-e-vírgula no Excel brasileiro, aspas dentro de aspas, BOM no início do arquivo, fim de linha em \\r\\n no Windows. O pacote 'encoding/csv' do Go cobre o caso normal e permite ajustar para os casos chatos.

A API é minimalista. Você cria um Reader sobre um io.Reader (arquivo, request body, string em buffer) e chama Read() para pegar uma linha por vez ou ReadAll() para tudo de uma vez. Cada linha vem como []string. Read() devolve io.EOF quando acaba — laço típico é 'for' com 'if err == io.EOF { break }'. Para escrita, NewWriter expõe Write para uma linha e WriteAll para várias, e você precisa chamar Flush ao final senão o buffer interno pode não chegar ao destino.

A configuração mais útil é r.Comma, que muda o separador. Para CSVs do Excel BR (separados por ;) você seta r.Comma = ';'. Há também r.LazyQuotes (mais tolerante a aspas mal formadas) e r.FieldsPerRecord (-1 desativa a checagem de número fixo de colunas — útil quando linhas variam). Para o BOM (Byte Order Mark) no início do arquivo, você precisa removê-lo manualmente — o pacote csv não cuida disso.

Em arquivos grandes, sempre prefira leitura em streaming (Read em loop) em vez de ReadAll. ReadAll carrega tudo em memória; com 1GB de CSV você fica sem RAM. Ainda em fluxo, é comum mapear cada linha para um struct manualmente — não há reflection automática como no encoding/json. Para isso há libs externas (gocarina/gocsv, jszwec/csvutil), mas para projetos simples vale a pena escrever 5 linhas de mapeamento explícito.`,
    codes: [
      {
        lang: "go",
        code: `// Lendo CSV simples com vírgula como separador.
package main

import (
    "encoding/csv"
    "fmt"
    "io"
    "strings"
)

func main() {
    raw := \`nome,idade,cidade
Ana,28,São Paulo
Bruno,35,Recife
Carla,42,Curitiba\`

    r := csv.NewReader(strings.NewReader(raw))

    // Lê todas as linhas de uma vez (ok para arquivos pequenos).
    linhas, err := r.ReadAll()
    if err != nil {
        fmt.Println("erro:", err)
        return
    }

    cabecalho := linhas[0]
    for _, linha := range linhas[1:] {
        fmt.Println(cabecalho[0]+":", linha[0],
            "| idade:", linha[1],
            "| cidade:", linha[2])
    }
    // → nome: Ana | idade: 28 | cidade: São Paulo
    // → nome: Bruno | idade: 35 | cidade: Recife
    // → nome: Carla | idade: 42 | cidade: Curitiba

    _ = io.EOF // só para silenciar import quando não usado
}`,
      },
      {
        lang: "go",
        code: `// Streaming linha-a-linha: ideal para arquivos grandes.
package main

import (
    "encoding/csv"
    "fmt"
    "io"
    "os"
    "strconv"
)

type Pedido struct {
    ID    int
    Total float64
}

func main() {
    f, err := os.Open("pedidos.csv")
    if err != nil {
        fmt.Println(err)
        return
    }
    defer f.Close()

    r := csv.NewReader(f)
    r.Comma = ';' // Excel BR usa ; como separador

    // Pula cabeçalho.
    if _, err := r.Read(); err != nil {
        fmt.Println("CSV vazio:", err)
        return
    }

    var pedidos []Pedido
    for {
        rec, err := r.Read()
        if err == io.EOF {
            break
        }
        if err != nil {
            fmt.Println("linha inválida:", err)
            continue
        }

        id, _ := strconv.Atoi(rec[0])
        total, _ := strconv.ParseFloat(rec[1], 64)
        pedidos = append(pedidos, Pedido{ID: id, Total: total})
    }
    fmt.Println("pedidos lidos:", len(pedidos))
}`,
      },
      {
        lang: "go",
        code: `// Escrevendo CSV: SEMPRE chame Flush() no fim.
package main

import (
    "encoding/csv"
    "fmt"
    "os"
)

func main() {
    f, err := os.Create("relatorio.csv")
    if err != nil {
        fmt.Println(err)
        return
    }
    defer f.Close()

    w := csv.NewWriter(f)
    defer w.Flush() // garante que o buffer interno vá para o arquivo

    w.Comma = ';' // separador para abrir bem no Excel BR

    // Cabeçalho.
    if err := w.Write([]string{"produto", "qtd", "preco_unit"}); err != nil {
        fmt.Println(err)
        return
    }

    dados := [][]string{
        {"Café 500g", "3", "19.90"},
        {"Pão francês", "12", "0.75"},
        {"Leite 1L", "6", "5.20"},
    }
    if err := w.WriteAll(dados); err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println("relatorio.csv gerado")
}`,
      },
      {
        lang: "go",
        code: `// CSV irregular: variando número de colunas por linha.
package main

import (
    "encoding/csv"
    "fmt"
    "strings"
)

func main() {
    raw := \`a,b,c
1,2
4,5,6,7\`

    r := csv.NewReader(strings.NewReader(raw))
    r.FieldsPerRecord = -1 // desliga validação de número fixo de colunas

    linhas, err := r.ReadAll()
    if err != nil {
        fmt.Println(err)
        return
    }
    for i, linha := range linhas {
        fmt.Printf("linha %d (%d cols): %v\\n", i, len(linha), linha)
    }
    // → linha 0 (3 cols): [a b c]
    // → linha 1 (2 cols): [1 2]
    // → linha 2 (4 cols): [4 5 6 7]
}`,
      },
      {
        lang: "go",
        code: `// Removendo BOM (Byte Order Mark) do início de CSV vindo do Excel.
package main

import (
    "bufio"
    "encoding/csv"
    "fmt"
    "io"
    "os"
    "strings"
)

func novoLeitor(r io.Reader) *csv.Reader {
    br := bufio.NewReader(r)
    // Olha os 3 primeiros bytes; se forem o BOM UTF-8, descarta.
    rune, _, err := br.ReadRune()
    if err == nil && rune != '\\ufeff' {
        br.UnreadRune()
    }
    return csv.NewReader(br)
}

func main() {
    f, _ := os.Open("planilha-excel.csv")
    defer f.Close()
    r := novoLeitor(f)
    r.Comma = ';'

    for {
        rec, err := r.Read()
        if err == io.EOF {
            break
        }
        if err != nil {
            fmt.Println(err)
            return
        }
        fmt.Println(strings.Join(rec, " | "))
    }
}`,
      },
    ],
    points: [
      "csv.NewReader lê CSV; r.Read() devolve uma linha como []string ou io.EOF.",
      "Para Excel BR, configure r.Comma = ';' antes de ler.",
      "ReadAll carrega tudo na memória — em arquivos grandes use Read em loop.",
      "csv.NewWriter precisa de Flush() para garantir que o buffer chegue ao destino.",
      "Idiomático: defer w.Flush() logo após criar o writer.",
      "FieldsPerRecord = -1 aceita linhas com número variado de colunas.",
      "LazyQuotes torna o parser mais tolerante a aspas mal formadas (use com cuidado).",
      "CSVs do Excel BR podem vir com BOM UTF-8 — remova manualmente, csv não trata.",
      "Armadilha: esquecer Flush e ver o arquivo de saída cortado ou vazio.",
      "Erro comum: assumir vírgula em CSV exportado pelo Excel BR — quase sempre é ponto-e-vírgula.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Não confie no formato CSV vindo de planilhas externas. Confirme separador, encoding (UTF-8 ou Latin-1) e presença de BOM antes de processar em produção.",
      },
      {
        type: "tip",
        content: "Para arquivos enormes (gigabytes), combine csv.Reader com bufio.Reader maior (bufio.NewReaderSize com 1MB ou mais). Reduz chamadas de sistema e acelera muito.",
      },
      {
        type: "info",
        content: "encoding/csv não tem mapeamento automático para structs. Se sua aplicação lida com dezenas de colunas, libs como github.com/jszwec/csvutil economizam código.",
      },
    ],
  },
  {
    slug: "os-flag",
    section: "pacotes-erros",
    title: "os.Args e flag para CLIs",
    difficulty: "iniciante",
    subtitle: "Lendo argumentos de linha de comando do jeito básico (os.Args) e do jeito profissional (flag)",
    intro: `Quase todo programa Go que vira binário precisa ler argumentos de linha de comando — caminho do arquivo a processar, modo verboso, número de workers, configuração. A stdlib oferece duas abordagens: os.Args para o caso simples e o pacote 'flag' para o caso profissional. Saber as duas e quando usar cada uma é parte do dia-a-dia.

os.Args é um slice de strings com tudo que veio depois de invocar o programa. O índice 0 é o nome do executável; argumentos começam no índice 1. Funciona para scripts pequenos onde você sabe exatamente quantos argumentos vêm em qual ordem. É frágil: o usuário precisa lembrar a ordem, não há ajuda automática, e tipos vêm sempre como string que você precisa converter à mão.

O pacote 'flag' resolve isso. Você declara as flags com tipo (Int, String, Bool, Float64, Duration), descrição e valor padrão. Chama flag.Parse() uma vez no main, e os valores aparecem nas variáveis. O pacote gera mensagem de --help automaticamente, valida tipos, suporta -nome=valor e -nome valor, e sobra-os.Args sem flag fica em flag.Args(). Para subcomandos (estilo 'git commit', 'git push'), usa flag.NewFlagSet e parseia conforme o primeiro argumento.

Para CLIs grandes com subcomandos aninhados, autocomplete e ajuda rica, a comunidade usa libs externas como github.com/spf13/cobra (a mesma do kubectl, hugo, helm). Mas comece com flag — ele cobre 80% dos casos sem dependência externa. Idiomático Go é evitar dependências quando a stdlib resolve. Cobra é poderoso, mas se sua CLI tem 3 flags simples, flag basta.`,
    codes: [
      {
        lang: "go",
        code: `// os.Args: o jeito mais simples (e mais frágil).
package main

import (
    "fmt"
    "os"
)

func main() {
    // os.Args[0] é o caminho do executável.
    fmt.Println("executável:", os.Args[0])

    if len(os.Args) < 2 {
        fmt.Println("uso: ./app <nome>")
        os.Exit(1)
    }

    nome := os.Args[1]
    fmt.Println("Olá,", nome)

    // Mostra todos os argumentos restantes.
    fmt.Println("argumentos extras:", os.Args[2:])
    // Rodando: ./app Ana --algo --xyz
    // → executável: ./app
    // → Olá, Ana
    // → argumentos extras: [--algo --xyz]
}`,
      },
      {
        lang: "go",
        code: `// flag: a forma profissional, com tipos, padrão e ajuda automática.
package main

import (
    "flag"
    "fmt"
    "time"
)

func main() {
    // flag.<Tipo>(nome, padrão, descrição) → ponteiro para o valor.
    porta := flag.Int("porta", 8080, "porta HTTP a escutar")
    host := flag.String("host", "localhost", "host de bind")
    debug := flag.Bool("debug", false, "ativa logs de debug")
    timeout := flag.Duration("timeout", 30*time.Second, "timeout das requisições")

    flag.Parse() // SEMPRE chame antes de ler os valores

    fmt.Printf("subindo em %s:%d (debug=%v, timeout=%s)\\n",
        *host, *porta, *debug, *timeout)

    // Argumentos posicionais que não são flags ficam em flag.Args().
    fmt.Println("posicionais:", flag.Args())
}

// Rodando: ./app -porta=9000 -debug arquivo.txt
// → subindo em localhost:9000 (debug=true, timeout=30s)
// → posicionais: [arquivo.txt]
//
// ./app -h
// → Usage of ./app:
// →   -debug    ativa logs de debug
// →   -host string
// →         host de bind (default "localhost")
// →   -porta int
// →         porta HTTP a escutar (default 8080)
// →   -timeout duration
// →         timeout das requisições (default 30s)`,
      },
      {
        lang: "go",
        code: `// flag.Var: criar tipo customizado (lista separada por vírgula).
package main

import (
    "flag"
    "fmt"
    "strings"
)

// listaStrings implementa a interface flag.Value (Set + String).
type listaStrings []string

func (l *listaStrings) String() string {
    return strings.Join(*l, ",")
}

func (l *listaStrings) Set(valor string) error {
    *l = append(*l, valor)
    return nil
}

func main() {
    var hosts listaStrings
    flag.Var(&hosts, "host", "host (pode repetir)")
    flag.Parse()

    fmt.Println("hosts informados:", hosts)
}

// Rodando: ./app -host=app1 -host=app2 -host=app3
// → hosts informados: [app1 app2 app3]`,
      },
      {
        lang: "go",
        code: `// Subcomandos: 'app criar ...' vs 'app listar ...'.
package main

import (
    "flag"
    "fmt"
    "os"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Println("uso: app [criar|listar] ...")
        os.Exit(1)
    }

    switch os.Args[1] {
    case "criar":
        cmd := flag.NewFlagSet("criar", flag.ExitOnError)
        nome := cmd.String("nome", "", "nome do recurso")
        cmd.Parse(os.Args[2:])
        if *nome == "" {
            fmt.Println("--nome é obrigatório")
            os.Exit(1)
        }
        fmt.Println("criando:", *nome)

    case "listar":
        cmd := flag.NewFlagSet("listar", flag.ExitOnError)
        formato := cmd.String("formato", "json", "formato de saída")
        cmd.Parse(os.Args[2:])
        fmt.Println("listando em", *formato)

    default:
        fmt.Println("comando desconhecido:", os.Args[1])
        os.Exit(1)
    }
}

// Rodando: ./app criar -nome=pedido-1
// → criando: pedido-1
// Rodando: ./app listar -formato=tabela
// → listando em tabela`,
      },
      {
        lang: "go",
        code: `// Lendo variáveis de ambiente como complemento das flags.
package main

import (
    "fmt"
    "os"
)

func main() {
    // os.Getenv devolve "" se a variável não existe.
    db := os.Getenv("DATABASE_URL")
    if db == "" {
        db = "postgres://localhost:5432/loja" // fallback
    }
    fmt.Println("conectando em:", db)

    // LookupEnv distingue "vazia" de "não definida".
    if v, ok := os.LookupEnv("DEBUG"); ok {
        fmt.Println("DEBUG está definida como:", v)
    } else {
        fmt.Println("DEBUG não foi definida")
    }
}

// Rodando: DATABASE_URL=postgres://prod/loja DEBUG=1 ./app
// → conectando em: postgres://prod/loja
// → DEBUG está definida como: 1`,
      },
    ],
    points: [
      "os.Args[0] é o nome do executável; argumentos reais começam no índice 1.",
      "Use o pacote 'flag' assim que o programa tiver mais de um argumento ou opção opcional.",
      "flag.<Tipo> retorna ponteiro; lembre de desreferenciar com * ao usar.",
      "flag.Parse() é obrigatório antes de ler os valores.",
      "flag.Args() devolve os argumentos posicionais que sobraram após as flags.",
      "Idiomático: usar flag.Duration para timeouts, em vez de int de segundos.",
      "Para subcomandos, use flag.NewFlagSet por comando e parseie com os.Args[2:].",
      "Combine flags com os.Getenv/os.LookupEnv para suportar configuração via ambiente.",
      "Armadilha: esquecer flag.Parse() e ver todos os valores como o padrão, sem entender por quê.",
      "Erro comum: usar os.Args[i] sem checar len(os.Args) primeiro — panic na falta de argumento.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use flag.StringVar/IntVar quando quiser passar a variável já existente em vez de receber ponteiro novo. Fica mais legível em CLIs com muitas opções.",
      },
      {
        type: "info",
        content: "O pacote flag aceita tanto -nome=valor quanto -nome valor (e --nome também). Ele NÃO suporta o estilo POSIX de juntar flags curtas (-abc para -a -b -c). Para isso, use spf13/pflag.",
      },
      {
        type: "warning",
        content: "Não passe segredos (senhas, tokens) como flags de linha de comando. Eles aparecem em ps, em históricos de shell e em logs do sistema. Prefira variáveis de ambiente ou arquivos de config.",
      },
      {
        type: "success",
        content: "Quando sua CLI cresce além de 4-5 subcomandos, vale migrar para spf13/cobra. Você ganha autocomplete, ajuda rica e o mesmo padrão usado por kubectl, helm, gh e muitas outras ferramentas.",
      },
    ],
  },
];
