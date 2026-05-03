import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "sintaxe-basica",
    section: "sintaxe",
    title: "Sintaxe básica do Go",
    difficulty: "iniciante",
    subtitle: "Chaves obrigatórias, sem ponto e vírgula no fim e um compilador que não deixa passar nada",
    intro: `Antes de mergulhar em variáveis, tipos e funções, vale entender a personalidade do Go. A linguagem foi desenhada no Google por Rob Pike, Ken Thompson e Robert Griesemer com uma obsessão clara: código que gente diferente consiga ler sem brigar sobre estilo. Por isso a sintaxe é pequena, rígida em alguns pontos e bem permissiva em outros. Não existe "jeito Pythônico" ou "jeito enterprise Java" — existe o jeito Go, e ele é praticamente único.

Algumas regras te pegam de surpresa quando você vem de outras linguagens. Em Go, as chaves de abrir bloco precisam ficar na mesma linha do if, for ou func. Não é estética, é regra do compilador. Você também não escreve ponto e vírgula no fim das linhas, mas eles existem internamente — o lexer insere automaticamente quando termina uma linha "completa". Por causa disso, escrever a chave de abertura na linha de baixo gera erro de compilação. Estranho no começo, libertador depois.

Outra característica marcante: o compilador é severo. Variável declarada e não usada? Erro. Import não usado? Erro. Variável sombreada com := dentro de bloco aninhado? Pode virar bug silencioso. Comparado com JavaScript ou Python, parece chato. Mas em poucos dias você percebe que é o compilador te poupando de bugs reais que outras linguagens deixariam passar até produção.

Go também não tem classes, herança, exceções, generics complicados nem operadores sobrecarregados. Em vez disso, tem tipos simples, structs, interfaces implícitas, goroutines e canais. A linguagem é pequena de propósito: você consegue ler a especificação inteira em uma tarde. Esse minimalismo é um dos motivos pelos quais empresas como Uber, Cloudflare, Twitch e Itaú escolhem Go para serviços críticos. Menos surpresas, menos bugs, mais previsibilidade.`,
    codes: [
      {
        lang: "go",
        code: `// Programa Go mínimo que mostra a estrutura básica que você verá em todos os exemplos.
package main // todo arquivo executável vive em "package main"

import "fmt" // importa o pacote fmt da biblioteca padrão para formatar saída

func main() {
	// A chave acima OBRIGATORIAMENTE fica nesta mesma linha. Quebrar a linha dá erro.
	fmt.Println("Pedido #1024 recebido com sucesso")
	// → saída: Pedido #1024 recebido com sucesso
}`,
      },
      {
        lang: "bash",
        code: `# Para rodar este programa, salve em main.go e use o comando go run.
# Ele compila em memória e executa direto, sem deixar binário no disco.
go run main.go
# → Pedido #1024 recebido com sucesso

# Se quiser gerar o binário compilado de verdade:
go build -o pedidos main.go
./pedidos`,
      },
      {
        lang: "go",
        code: `// O que ACONTECE se você quebrar a linha antes da chave? O compilador reclama.
package main

import "fmt"

func main()
{ // ERRADO: a chave precisa estar na mesma linha de func main()
	fmt.Println("isso não vai compilar")
}
// Erro real do compilador:
// ./main.go:5:13: missing function body
// ./main.go:6:1: syntax error: unexpected semicolon or newline before {`,
      },
      {
        lang: "go",
        code: `// Sem ponto e vírgula no fim da linha — o compilador insere por baixo dos panos.
package main

import "fmt"

func main() {
	pedido := 42         // sem ; no fim
	preco := 199.90      // sem ; no fim
	fmt.Println(pedido, preco)
	// → 42 199.9
}`,
      },
      {
        lang: "go",
        code: `// O compilador é severo: variável declarada e não usada quebra a build.
package main

import "fmt"

func main() {
	cliente := "Maria"
	idade := 30 // ERRO: idade declared and not used
	fmt.Println(cliente)
}
// Para resolver: ou use a variável, ou troque por _ (blank identifier).`,
      },
    ],
    points: [
      "Todo arquivo Go começa com uma declaração package no topo.",
      "Chaves de abertura ficam na MESMA linha do if, for, func ou switch.",
      "Não existe ponto e vírgula no fim das linhas (o compilador insere internamente).",
      "Idiomático: use go run para experimentar e go build para gerar binário final.",
      "O compilador rejeita variáveis declaradas não usadas e imports não usados.",
      "Armadilha: vir de Java/C# e quebrar a linha antes da chave — quebra o build.",
      "Erro comum: tentar usar ponto e vírgula como separador no fim das linhas.",
    ],
    alerts: [
      {
        type: "info",
        content: "A regra das chaves não é capricho: o compilador insere ponto e vírgula automaticamente no fim de toda linha que parece terminada, e a chave em outra linha vira fim de declaração antes da hora.",
      },
      {
        type: "tip",
        content: "Use sempre o gofmt (vem dentro do comando go fmt). Ele formata seu código no padrão único da comunidade. Toda equipe Go séria roda gofmt no save do editor.",
      },
      {
        type: "warning",
        content: "Não tente escrever Go como se fosse Java ou C#. Resista à vontade de criar abstrações elaboradas — Go premia código direto e literal.",
      },
    ],
  },
  {
    slug: "pacote-main-imports",
    section: "sintaxe",
    title: "package main e imports",
    difficulty: "iniciante",
    subtitle: "Como Go organiza arquivos em pacotes e por que main é especial",
    intro: `Em Go, todo arquivo .go começa obrigatoriamente declarando a qual pacote ele pertence. Pacote é a unidade de organização da linguagem — uma pasta no disco corresponde a um pacote, e todos os arquivos .go dentro dela compartilham o mesmo namespace. Não existe arquivo solto, não existe código global fora de pacote. Essa decisão simples evita o caos que acontece em Python (com __init__.py confuso) e em JavaScript (com mil estilos de módulo competindo).

O pacote main tem um significado especial: é ele que produz um executável. Quando você roda go build em um diretório com package main e uma função main(), o Go gera um binário. Sem package main, você só consegue compilar uma biblioteca, importável por outros projetos mas não executável diretamente. É a diferença entre uma receita de bolo (biblioteca) e um restaurante funcionando (executável).

Imports em Go são literais: você lista exatamente os pacotes que vai usar. A biblioteca padrão é gigantesca e cobre quase tudo que um serviço precisa — fmt para saída formatada, net/http para servidores web, encoding/json para JSON, database/sql para bancos. Pacotes externos vêm via go modules: você roda go get github.com/...autor/biblioteca e o arquivo go.mod registra a dependência. É bem mais simples que pip, npm ou Maven na prática.

Uma regra que assusta no começo: import não usado é erro de compilação. Sim, erro mesmo, não warning. Isso obriga você a manter código limpo, sem aquela lista gigante de imports legados que ninguém mais sabe se serve. Editores como VSCode com a extensão oficial do Go organizam imports automaticamente no save, então você nem percebe a regra atrapalhar — ela só te protege.`,
    codes: [
      {
        lang: "bash",
        code: `# Todo projeto Go moderno começa com go mod init para criar o go.mod.
# O argumento é o "caminho" do módulo, geralmente um repositório futuro.
mkdir loja && cd loja
go mod init github.com/empresa/loja
# Cria um arquivo go.mod com:
# module github.com/empresa/loja
# go 1.22`,
      },
      {
        lang: "go",
        code: `// Arquivo: main.go
// Pacote main + função main() = executável.
package main

import (
	"fmt"      // pacote da biblioteca padrão para impressão formatada
	"strings"  // pacote para manipulação de strings
)

func main() {
	produto := "Café Especial"
	fmt.Println(strings.ToUpper(produto))
	// → CAFÉ ESPECIAL
}`,
      },
      {
        lang: "bash",
        code: `# Adicionar uma dependência externa: usamos go get com o caminho completo.
# Aqui pegamos a biblioteca uuid da Google para gerar identificadores únicos.
go get github.com/google/uuid
# Isso baixa o pacote e adiciona linha em go.mod e go.sum.`,
      },
      {
        lang: "go",
        code: `// Usando a dependência externa que acabamos de instalar.
package main

import (
	"fmt"

	"github.com/google/uuid" // dependência externa baixada via go get
)

func main() {
	pedidoID := uuid.New() // gera um identificador único universal
	fmt.Println("Pedido criado com ID:", pedidoID)
	// → Pedido criado com ID: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
}`,
      },
      {
        lang: "go",
        code: `// Renomeando imports e ignorando pacotes — dois truques úteis.
package main

import (
	"fmt"

	str "strings"           // alias: agora chamo de "str" em vez de "strings"
	_ "image/png"           // import "em branco": só roda init() do pacote
)

func main() {
	fmt.Println(str.Repeat("=", 20))
	// → ====================
}
// O alias é útil quando dois pacotes têm o mesmo nome final.
// O underscore é usado, por exemplo, para registrar drivers SQL.`,
      },
      {
        lang: "go",
        code: `// Arquivo de BIBLIOTECA (não tem main): pode ser importado por outros.
// Arquivo: calculadora/calculadora.go
package calculadora // mesmo nome da pasta, por convenção

// Soma é EXPORTADA porque começa com letra maiúscula.
func Soma(a, b int) int {
	return a + b
}

// soma (com s minúsculo) é privada do pacote, ninguém de fora enxerga.
func somaInterna(a, b int) int {
	return a + b
}`,
      },
    ],
    points: [
      "Todo arquivo .go declara package no topo; uma pasta = um pacote.",
      "Apenas package main com função main() vira executável.",
      "Idiomático: agrupe imports em parênteses e deixe o gofmt ordenar.",
      "Use go mod init no início de todo projeto novo (Go 1.16+).",
      "Dependências externas vêm via go get e ficam registradas em go.mod.",
      "Erro comum: import declarado e não usado — quebra a build.",
      "Armadilha: criar dois arquivos na mesma pasta com pacotes diferentes (não compila).",
      "Use _ como alias para rodar só o init() de um pacote (drivers SQL, image formats).",
    ],
    alerts: [
      {
        type: "info",
        content: "O nome do pacote não precisa ser exatamente igual ao da pasta, mas é uma convenção tão forte que sair dela vai confundir qualquer pessoa que ler seu código.",
      },
      {
        type: "tip",
        content: "Configure seu editor para rodar goimports no save. Ele adiciona imports que faltam, remove os que sobram e ainda ordena tudo conforme a convenção da comunidade.",
      },
      {
        type: "warning",
        content: "Não confunda o caminho do módulo (github.com/empresa/loja) com o caminho do pacote dentro do módulo. O primeiro é fixo no go.mod; o segundo depende da pasta.",
      },
    ],
  },
  {
    slug: "variaveis-var-curta",
    section: "sintaxe",
    title: "Variáveis: var e declaração curta",
    difficulty: "iniciante",
    subtitle: "Duas formas de criar variáveis em Go e quando usar cada uma na prática",
    intro: `Go te dá duas formas principais de declarar variáveis: a forma "longa" com a palavra-chave var e a forma "curta" com o operador :=. As duas existem por motivos diferentes, e saber quando usar cada uma é parte do que separa um código que parece Go de um código que parece Java tropicalizado.

A forma com var é a mais formal: você declara o tipo explicitamente (ou deixa o Go inferir) e pode declarar a variável sem atribuir valor inicial. Ela funciona em qualquer lugar — dentro de função, no nível do pacote, em blocos var agrupados. Já a declaração curta com := só funciona dentro de funções, e exige um valor inicial. O Go infere o tipo a partir desse valor. É o jeito que você vai usar 80% do tempo em código novo dentro de funções.

A diferença mais importante entre = e := é semântica: := DECLARA uma variável nova, enquanto = só ATRIBUI a uma já existente. Trocar um pelo outro sem querer gera bugs sutis, principalmente quando você está dentro de blocos aninhados. Esse é o famoso problema de "shadowing": você acha que está atribuindo a uma variável de fora, mas := criou uma nova variável local com o mesmo nome, escondendo a original.

Comparando com outras linguagens: em Python toda atribuição cria ou reusa a variável dependendo do escopo, e isso confunde. Em JavaScript, let e const tentam resolver de outro jeito. Em Java você sempre escreve o tipo explicitamente. Go fica num meio termo elegante: tipo é forte e estático, mas a inferência te poupa repetição. Idiomaticamente, prefira := dentro de funções e var só quando precisar declarar sem valor inicial ou no nível do pacote.`,
    codes: [
      {
        lang: "go",
        code: `// As duas formas de declarar variáveis em Go.
package main

import "fmt"

func main() {
	// Forma longa com var: tipo explícito, valor opcional.
	var saldo float64 = 1500.75
	var titular string = "Carlos Souza"

	// Forma longa com inferência: o tipo vem do valor.
	var ativo = true // Go infere bool

	// Forma curta com := (só dentro de funções).
	limite := 500.00 // float64 inferido

	fmt.Println(titular, saldo, ativo, limite)
	// → Carlos Souza 1500.75 true 500
}`,
      },
      {
        lang: "go",
        code: `// var sem valor inicial recebe o "zero value" do tipo.
package main

import "fmt"

func main() {
	var contador int       // zero value: 0
	var nome string        // zero value: "" (string vazia)
	var ativo bool         // zero value: false
	var preco float64      // zero value: 0
	var lista []int        // zero value: nil

	fmt.Printf("%d %q %t %g %v\n", contador, nome, ativo, preco, lista)
	// → 0 "" false 0 []
}`,
      },
      {
        lang: "go",
        code: `// Bloco var: agrupa várias declarações relacionadas.
package main

import "fmt"

var (
	tarifaMinima = 0.50
	tarifaMaxima = 25.00
	moeda        = "BRL"
)

func main() {
	fmt.Println("Tarifas em", moeda, ":", tarifaMinima, "a", tarifaMaxima)
	// → Tarifas em BRL : 0.5 a 25
}`,
      },
      {
        lang: "go",
        code: `// Múltipla declaração com := (idiomático em retornos de função).
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// strconv.Atoi devolve o número e um erro: capturamos os dois.
	idade, err := strconv.Atoi("42")
	if err != nil {
		fmt.Println("falhou:", err)
		return
	}
	fmt.Println("idade convertida:", idade)
	// → idade convertida: 42
}`,
      },
      {
        lang: "go",
        code: `// Armadilha de SHADOWING: := dentro de bloco cria variável NOVA.
package main

import "fmt"

func main() {
	saldo := 100.0

	if true {
		saldo := 200.0 // CUIDADO: := criou um NOVO saldo só dentro do if
		fmt.Println("dentro do if:", saldo) // → 200
	}

	fmt.Println("fora do if:", saldo) // → 100 (o saldo de fora não mudou!)
}
// Para mudar o de fora, use = sem dois pontos:
// if true { saldo = 200.0 }`,
      },
    ],
    points: [
      "var funciona em qualquer escopo; := só dentro de funções.",
      "Sem valor inicial, var atribui o zero value do tipo automaticamente.",
      "Idiomático: use := dentro de funções e var no nível do pacote.",
      "Múltiplos retornos com := são a forma natural de capturar valor + erro.",
      "Use bloco var ( ... ) para agrupar declarações relacionadas no nível do pacote.",
      "Armadilha: shadowing — usar := dentro de if/for cria variável nova com mesmo nome.",
      "Erro comum: tentar usar := no nível do pacote (só var funciona lá fora).",
      "Lembre-se: variável declarada e não usada quebra a compilação.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Shadowing é uma das principais fontes de bugs em Go. Quando := aparece dentro de if, for ou switch e o nome já existia fora, você criou uma variável nova. Ferramentas como go vet ajudam a detectar.",
      },
      {
        type: "tip",
        content: "Quando precisar declarar uma variável sem ter o valor ainda (por exemplo, antes de um if que vai atribuir), use var. Se já tem o valor, use :=. Essa regra simples resolve 95% dos casos.",
      },
      {
        type: "info",
        content: "Go não tem const com inferência igual ao JavaScript. const aqui só serve para valores conhecidos em tempo de compilação, e tem um capítulo só sobre isso a seguir.",
      },
    ],
  },
  {
    slug: "constantes-iota",
    section: "sintaxe",
    title: "Constantes e iota",
    difficulty: "iniciante",
    subtitle: "Valores imutáveis em tempo de compilação e o gerador automático de enums do Go",
    intro: `Constantes em Go são valores que o compilador conhece em tempo de compilação. Diferente de variáveis, elas nunca podem mudar e não ocupam espaço em memória da forma tradicional — são substituídas direto no código gerado. Isso significa que uma const é mais rápida e mais segura do que uma var equivalente, sempre que faz sentido usar.

Em Go, const aceita apenas tipos básicos: números, strings, booleanos e tipos derivados deles. Você não pode ter const para slice, mapa, struct ou qualquer coisa cujo valor seja conhecido só em tempo de execução. Isso é diferente de JavaScript, onde const apenas impede a reatribuição mas permite mutar o conteúdo. Em Go, constante é constante de verdade, no sentido matemático.

O grande poder das constantes em Go aparece quando você combina com o identificador iota. iota é um contador que começa em 0 dentro de um bloco const e incrementa a cada linha. Ele é a forma idiomática do Go criar enumerações — algo que outras linguagens resolvem com palavra-chave dedicada (enum em Java/C#) ou com classes especiais (Enum em Python). Em Go, é só const, iota e um pouco de criatividade.

Com iota você consegue gerar listas de status, tipos, flags binárias, dias da semana, qualquer enumeração. Quando combinado com bit shift (1 << iota), gera flags de bits eficientes para permissões e configurações. Idiomaticamente, sempre que você for criar uma família de constantes relacionadas, pense primeiro se iota resolve. Quase sempre resolve, e o código fica mais curto e mais fácil de manter.`,
    codes: [
      {
        lang: "go",
        code: `// Constantes simples: tipo opcional, valor obrigatório.
package main

import "fmt"

const (
	NomeApp     = "MeuBanco"
	VersaoApp   = "1.4.2"
	TaxaJurosAA = 0.0125 // 1,25% ao ano
	MaxClientes = 10_000 // _ é só separador visual em literais numéricos
)

func main() {
	fmt.Printf("%s v%s — taxa: %.4f, limite: %d\n",
		NomeApp, VersaoApp, TaxaJurosAA, MaxClientes)
	// → MeuBanco v1.4.2 — taxa: 0.0125, limite: 10000
}`,
      },
      {
        lang: "go",
        code: `// iota: contador automático que reinicia a cada bloco const.
package main

import "fmt"

const (
	StatusPendente   = iota // 0
	StatusAprovado          // 1 (iota incrementa sozinho)
	StatusRecusado          // 2
	StatusCancelado         // 3
)

func main() {
	fmt.Println(StatusPendente, StatusAprovado, StatusRecusado, StatusCancelado)
	// → 0 1 2 3
}`,
      },
      {
        lang: "go",
        code: `// Tipo customizado + iota = enum de verdade, type-safe.
package main

import "fmt"

type Prioridade int // criamos um tipo novo baseado em int

const (
	Baixa    Prioridade = iota // 0
	Media                      // 1
	Alta                       // 2
	Critica                    // 3
)

func (p Prioridade) String() string {
	switch p {
	case Baixa:
		return "baixa"
	case Media:
		return "média"
	case Alta:
		return "alta"
	case Critica:
		return "crítica"
	}
	return "desconhecida"
}

func main() {
	chamado := Critica
	fmt.Println("Prioridade do chamado:", chamado)
	// → Prioridade do chamado: crítica
}`,
      },
      {
        lang: "go",
        code: `// iota com bit shift: flags de permissão, clássico em sistemas de arquivos.
package main

import "fmt"

type Permissao uint

const (
	Ler     Permissao = 1 << iota // 1  (binário 001)
	Escrever                      // 2  (binário 010)
	Executar                      // 4  (binário 100)
)

func main() {
	// Combinamos permissões com OR bit a bit.
	usuario := Ler | Escrever
	fmt.Printf("permissões: %03b\n", usuario)
	// → permissões: 011

	// Verificamos se a permissão Escrever está ligada com AND.
	if usuario&Escrever != 0 {
		fmt.Println("usuário PODE escrever")
	}
	// → usuário PODE escrever
}`,
      },
      {
        lang: "go",
        code: `// Constantes "untyped" — característica única do Go.
package main

import "fmt"

const Pi = 3.14159 // sem tipo declarado: é uma constante "untyped"

func main() {
	var raio float32 = 2.0
	var area float64

	// A constante Pi se adapta ao tipo de cada operação.
	area = float64(raio) * float64(raio) * Pi
	fmt.Println("área:", area)
	// → área: 12.56636
}`,
      },
    ],
    points: [
      "const aceita só tipos básicos (números, strings, bool); slice/mapa não dá.",
      "Constantes são substituídas em tempo de compilação — zero custo em runtime.",
      "iota começa em 0 e incrementa por linha dentro do mesmo bloco const.",
      "Idiomático: combine type novo + iota para criar enums type-safe em Go.",
      "1 << iota cria flags binárias eficientes para permissões e opções.",
      "Use _ como separador visual em literais numéricos (Go 1.13+): 10_000.",
      "Armadilha: iota reinicia a cada bloco const ( ... ) — não atravessa blocos.",
      "Erro comum: tentar declarar const com chamada de função (ex: const t = time.Now()).",
    ],
    alerts: [
      {
        type: "info",
        content: "Constantes sem tipo (untyped constants) são uma das partes mais elegantes do Go. Elas se adaptam ao contexto, evitando casts que outras linguagens exigiriam.",
      },
      {
        type: "tip",
        content: "Quando criar enums com iota, implemente o método String() para o tipo. Assim fmt.Println imprime o nome legível em vez do número, e os logs ficam muito mais úteis.",
      },
      {
        type: "warning",
        content: "Não use iota só por usar. Para uma única constante, const Nome = valor é mais claro. Use iota quando tiver pelo menos três valores relacionados.",
      },
    ],
  },
  {
    slug: "tipos-numericos",
    section: "sintaxe",
    title: "Tipos numéricos",
    difficulty: "iniciante",
    subtitle: "int, uint, float, complex e por que escolher o tipo certo importa de verdade",
    intro: `Go é uma linguagem fortemente tipada, e isso fica claríssimo nos números. Em vez de ter um único tipo number como JavaScript, ou int e float meio fluidos como Python, Go te oferece uma família grande de tipos numéricos com tamanhos bem definidos: int8, int16, int32, int64, e os equivalentes sem sinal uint8, uint16, uint32, uint64. Mais os flutuantes float32 e float64, e os complexos complex64 e complex128. Parece muito, mas cada um existe por uma razão prática.

O tipo int (sem número no fim) é especial: ele tem o tamanho natural da arquitetura — 64 bits em máquinas modernas, 32 em sistemas antigos. É o tipo padrão que você usa em loops, contadores e índices. O mesmo vale para uint, com a diferença óbvia de não aceitar números negativos. Para representar bytes, Go te dá byte, que é um alias para uint8. Para representar caracteres Unicode, te dá rune, que é alias para int32.

Os flutuantes seguem o padrão IEEE 754, igual a outras linguagens. float64 é o padrão para qualquer cálculo decimal, salvo se você tem motivo forte para economizar memória com float32 (raro fora de gráficos e machine learning). E uma regra de ouro: NUNCA use float para dinheiro. Pequenos erros de arredondamento se acumulam e viram processo trabalhista. Para valores monetários, use int representando centavos, ou bibliotecas como shopspring/decimal.

Diferente de C, Go não converte números entre tipos automaticamente. Somar int32 com int64 é erro de compilação. Você precisa converter explicitamente com int64(x). Isso parece chato no começo, mas evita uma classe inteira de bugs sutis com overflow e conversão silenciosa que assombram código C. É deliberadamente verboso para ser deliberadamente seguro.`,
    codes: [
      {
        lang: "go",
        code: `// Os tipos numéricos básicos e seus tamanhos.
package main

import (
	"fmt"
	"unsafe"
)

func main() {
	var i8 int8 = 127      // de -128 a 127
	var i32 int32 = 2_000_000
	var i64 int64 = 9_000_000_000
	var u8 uint8 = 255     // de 0 a 255 (também conhecido como byte)
	var f32 float32 = 3.14
	var f64 float64 = 2.718281828

	fmt.Printf("int8 ocupa %d byte(s)\n", unsafe.Sizeof(i8))     // 1
	fmt.Printf("int32 ocupa %d byte(s)\n", unsafe.Sizeof(i32))   // 4
	fmt.Printf("int64 ocupa %d byte(s)\n", unsafe.Sizeof(i64))   // 8
	fmt.Printf("uint8 ocupa %d byte(s)\n", unsafe.Sizeof(u8))    // 1
	fmt.Printf("float32 ocupa %d byte(s)\n", unsafe.Sizeof(f32)) // 4
	fmt.Printf("float64 ocupa %d byte(s)\n", unsafe.Sizeof(f64)) // 8
}`,
      },
      {
        lang: "go",
        code: `// CUIDADO: dinheiro em float64 dá errado. Sempre.
package main

import "fmt"

func main() {
	preco := 0.1
	desconto := 0.2
	total := preco + desconto
	fmt.Println(total)
	// → 0.30000000000000004  (NÃO é 0.3 exato!)

	// Solução idiomática: trabalhar com centavos como int.
	precoCents := 10     // R$ 0,10
	descontoCents := 20  // R$ 0,20
	totalCents := precoCents + descontoCents
	fmt.Printf("total: R$ %d.%02d\n", totalCents/100, totalCents%100)
	// → total: R$ 0.30
}`,
      },
      {
        lang: "go",
        code: `// Overflow silencioso: int8 estoura sem aviso.
package main

import "fmt"

func main() {
	var x int8 = 127
	x++ // CUIDADO: int8 vai de -128 a 127. 127+1 dá overflow.
	fmt.Println(x)
	// → -128 (deu a volta!)
}`,
      },
      {
        lang: "go",
        code: `// Tipos sem sinal (uint) e suas pegadinhas.
package main

import "fmt"

func main() {
	var quantidade uint = 5
	var devolvidos uint = 10

	// CUIDADO: uint não vai abaixo de zero. 5 - 10 vira número GIGANTE.
	saldo := quantidade - devolvidos
	fmt.Println(saldo)
	// → 18446744073709551611 (em sistemas 64 bits!)

	// Para suportar negativo, sempre use int normal.
	var saldoCorreto int = int(quantidade) - int(devolvidos)
	fmt.Println(saldoCorreto)
	// → -5
}`,
      },
      {
        lang: "go",
        code: `// Cálculo financeiro real: juros compostos com int (centavos).
package main

import "fmt"

func main() {
	saldoCents := 100_000        // R$ 1.000,00
	taxaMensal := 0.01           // 1% ao mês
	meses := 12

	for i := 0; i < meses; i++ {
		// Multiplicamos e dividimos com cuidado para minimizar erro.
		jurosCents := int(float64(saldoCents) * taxaMensal)
		saldoCents += jurosCents
	}

	fmt.Printf("saldo final: R$ %d.%02d\n",
		saldoCents/100, saldoCents%100)
	// → saldo final: R$ 1126.82
}`,
      },
    ],
    points: [
      "int e uint têm o tamanho natural da máquina (64 bits hoje, 32 em legado).",
      "byte é alias de uint8; rune é alias de int32 — use os nomes apropriados ao contexto.",
      "Idiomático: use int para contadores e índices, float64 para cálculos decimais.",
      "NUNCA use float para dinheiro — trabalhe com centavos em int ou use shopspring/decimal.",
      "Go não converte tipos numéricos automaticamente; sempre faça T(valor) explícito.",
      "Armadilha: overflow em tipos pequenos (int8 vai de -128 a 127) acontece sem aviso.",
      "Erro comum: usar uint achando que ganha algo, e tomar overflow ao subtrair valores maiores.",
      "Use _ como separador em literais para legibilidade: 1_000_000.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Cálculo monetário com float64 vai render bugs em produção mais cedo ou mais tarde. A regra é absoluta: dinheiro nunca em float. Use int com centavos ou uma biblioteca decimal dedicada.",
      },
      {
        type: "warning",
        content: "Tipos sem sinal (uint) parecem legais mas trazem mais problemas que benefícios na prática. A comunidade Go recomenda preferir int salvo quando há razão muito específica (bit operations, índices que nunca podem ser negativos).",
      },
      {
        type: "info",
        content: "Go também tem complex64 e complex128 para números complexos com parte real e imaginária. São raros no dia a dia, mas úteis em computação científica e processamento de sinais.",
      },
    ],
  },
  {
    slug: "strings-runes",
    section: "sintaxe",
    title: "Strings e runes",
    difficulty: "intermediario",
    subtitle: "Strings imutáveis, codificação UTF-8 e por que len(s) nem sempre dá o que você espera",
    intro: `Strings em Go parecem simples até você precisar contar caracteres em uma string com acentos. Aí vem a surpresa. Por baixo dos panos, uma string em Go é apenas uma sequência imutável de bytes, e a codificação padrão é UTF-8. Isso significa que cada caractere ocupa um número variável de bytes — letras simples como "a" cabem em 1 byte, mas "ã", "ç" ou emojis ocupam de 2 a 4 bytes cada.

A consequência prática é direta: len(s) devolve o número de BYTES da string, não o número de caracteres visíveis. Para "café" que parece ter 4 letras, len devolve 5, porque o "é" usa 2 bytes em UTF-8. Vindo de Python ou JavaScript, isso pega de surpresa. Se você quer contar caracteres de verdade, precisa converter para []rune ou usar utf8.RuneCountInString.

Aqui entra o conceito de rune. Uma rune é um inteiro int32 que representa um único code point Unicode — o "caractere" no sentido humano da palavra. Quando você itera uma string com for ... range, o Go decodifica os bytes em runes automaticamente. Quando você indexa s[i], pega o byte cru. Saber a diferença entre essas duas formas de "ver" uma string é o pulo do gato para escrever código Go que lida bem com português, japonês e emojis.

Strings também são IMUTÁVEIS. Você não pode escrever s[0] = 'X'. Para "modificar" uma string, na verdade você cria uma nova. Isso é igual em Java e Python, e diferente de C. Para concatenar strings em loops, evite o operador +; use strings.Builder, que é dramaticamente mais rápido por não criar strings intermediárias a cada concatenação. É um detalhe de performance que vira gargalo real em código que processa logs, CSVs ou JSONs grandes.`,
    codes: [
      {
        lang: "go",
        code: `// String é uma sequência imutável de bytes UTF-8.
package main

import "fmt"

func main() {
	saudacao := "Olá, café com ☕"

	// len() devolve o número de BYTES, não de caracteres.
	fmt.Println("bytes:", len(saudacao))
	// → bytes: 19  (não 16, por causa de "á", "é" e do emoji)

	// Indexar uma string devolve o byte cru, não o caractere.
	fmt.Println("primeiro byte:", saudacao[0]) // 79 (código de 'O')
}`,
      },
      {
        lang: "go",
        code: `// Para CONTAR caracteres de verdade, converta para []rune.
package main

import (
	"fmt"
	"unicode/utf8"
)

func main() {
	texto := "São Paulo 🇧🇷"

	fmt.Println("len em bytes:", len(texto))
	fmt.Println("RuneCountInString:", utf8.RuneCountInString(texto))
	fmt.Println("len([]rune(...)):", len([]rune(texto)))
	// → len em bytes: 18
	// → RuneCountInString: 12
	// → len([]rune(...)): 12
}`,
      },
      {
        lang: "go",
        code: `// for...range itera por RUNES, não por bytes. Use isso.
package main

import "fmt"

func main() {
	palavra := "Pão"

	// Iteração por byte (ERRADO para texto humano):
	for i := 0; i < len(palavra); i++ {
		fmt.Printf("byte %d: %d\n", i, palavra[i])
	}
	// → byte 0: 80   (P)
	// → byte 1: 195  (1º byte de ã)
	// → byte 2: 163  (2º byte de ã)
	// → byte 3: 111  (o)

	fmt.Println("---")

	// Iteração por rune (CORRETO):
	for i, r := range palavra {
		fmt.Printf("posição %d: %q (%d)\n", i, r, r)
	}
	// → posição 0: 'P' (80)
	// → posição 1: 'ã' (227)
	// → posição 3: 'o' (111)  <- pulou de 1 para 3 porque ã ocupou 2 bytes
}`,
      },
      {
        lang: "go",
        code: `// Strings são imutáveis. Para modificar, crie nova.
package main

import (
	"fmt"
	"strings"
)

func main() {
	original := "café com leite"

	// strings.ToUpper retorna uma string NOVA, não muda a original.
	maiuscula := strings.ToUpper(original)

	fmt.Println("antes:", original)
	fmt.Println("depois:", maiuscula)
	// → antes: café com leite
	// → depois: CAFÉ COM LEITE
}`,
      },
      {
        lang: "go",
        code: `// strings.Builder: concatenar EFICIENTE em loop.
package main

import (
	"fmt"
	"strings"
)

func main() {
	produtos := []string{"café", "pão", "leite", "queijo", "manteiga"}

	var sb strings.Builder
	sb.WriteString("Lista de compras:\n")
	for i, p := range produtos {
		fmt.Fprintf(&sb, "  %d. %s\n", i+1, p)
	}

	fmt.Println(sb.String())
	// → Lista de compras:
	// →   1. café
	// →   2. pão
	// →   3. leite
	// →   4. queijo
	// →   5. manteiga
}`,
      },
      {
        lang: "go",
        code: `// Funções úteis do pacote strings no dia a dia.
package main

import (
	"fmt"
	"strings"
)

func main() {
	cep := "  01310-100  "

	// TrimSpace remove espaços do início e fim.
	limpo := strings.TrimSpace(cep)
	fmt.Printf("[%s]\n", limpo) // → [01310-100]

	// Split divide por separador.
	partes := strings.Split(limpo, "-")
	fmt.Println(partes) // → [01310 100]

	// Contains verifica se contém substring.
	fmt.Println(strings.Contains(limpo, "310")) // → true

	// Replace troca substrings.
	semHifen := strings.Replace(limpo, "-", "", -1) // -1 = todas
	fmt.Println(semHifen) // → 01310100
}`,
      },
    ],
    points: [
      "Strings em Go são bytes imutáveis em codificação UTF-8.",
      "len(s) devolve número de BYTES, não de caracteres visíveis ao humano.",
      "Para contar caracteres reais use utf8.RuneCountInString ou len([]rune(s)).",
      "Idiomático: use for ... range para iterar por runes corretamente.",
      "Indexar s[i] devolve o byte cru — útil para ASCII, perigoso para acentos.",
      "Use strings.Builder para concatenar dentro de loops (evita cópias).",
      "Armadilha: tentar mudar s[0] = 'X' — strings são imutáveis e o compilador rejeita.",
      "Erro comum: contar caracteres com len em strings com acentos e ter resultado errado.",
    ],
    alerts: [
      {
        type: "info",
        content: "UTF-8 foi inventado por Ken Thompson e Rob Pike em 1992 — os mesmos criadores do Go. Por isso a integração da linguagem com UTF-8 é tão natural e profunda.",
      },
      {
        type: "warning",
        content: "Concatenar strings com + dentro de loops grandes é um gargalo clássico de performance. strings.Builder pode ser 10x a 100x mais rápido em volumes razoáveis.",
      },
      {
        type: "tip",
        content: "Quando tiver dúvida sobre acentos, sempre teste com strings reais como 'São João do Açu'. ASCII puro disfarça bugs que aparecem só com texto português.",
      },
    ],
  },
  {
    slug: "bytes-vs-strings",
    section: "sintaxe",
    title: "Bytes vs strings",
    difficulty: "intermediario",
    subtitle: "Quando usar []byte e quando usar string e o custo escondido das conversões",
    intro: `Em Go, strings e []byte (slices de bytes) são primos próximos. Ambos guardam sequências de bytes e podem ser convertidos um no outro com facilidade. Mas existe uma diferença fundamental: string é IMUTÁVEL e []byte é MUTÁVEL. Essa única diferença muda completamente o caso de uso de cada um.

Use string quando você tem texto que não vai mudar — nomes, mensagens, identificadores, conteúdo de configuração. Strings são seguras de compartilhar entre goroutines sem locks, podem ser usadas como chave de mapa, e o compilador faz otimizações pesadas com elas (como deduplicar literais iguais). É a representação canônica de texto em Go.

Use []byte quando você precisa MODIFICAR o conteúdo, ou quando está fazendo IO. Funções de leitura de arquivo, rede e criptografia geralmente operam em []byte porque copiar bytes é mais barato do que criar strings novas a cada modificação. Buffers, parsers e compressores usam []byte por essa razão. Quando você ler dados de um arquivo, vai receber []byte; quando for serializar JSON, vai gerar []byte.

A conversão entre os dois (string(b) e []byte(s)) parece grátis mas NÃO é. Cada conversão ALOCA memória e COPIA todos os bytes. Em código de alta performance, evite conversões dentro de loops apertados. Use o pacote bytes que tem funções equivalentes às do strings, mas operando direto em []byte sem conversão. Pequena diferença na superfície, gigante diferença no profiler quando seu serviço processa milhões de requisições por minuto.`,
    codes: [
      {
        lang: "go",
        code: `// Conversão básica entre string e []byte.
package main

import "fmt"

func main() {
	mensagem := "olá mundo"

	// string → []byte: cria cópia mutável.
	bytes := []byte(mensagem)
	bytes[0] = 'O' // agora podemos modificar
	fmt.Println(string(bytes))
	// → Olá mundo

	// []byte → string: cria cópia imutável.
	novoTexto := string(bytes)
	fmt.Println(novoTexto)
	// → Olá mundo

	// A string ORIGINAL não muda (é imutável).
	fmt.Println(mensagem)
	// → olá mundo
}`,
      },
      {
        lang: "go",
        code: `// Leitura de arquivo: o padrão é receber []byte.
package main

import (
	"fmt"
	"os"
)

func main() {
	// os.ReadFile devolve []byte e error.
	conteudo, err := os.ReadFile("/etc/hostname")
	if err != nil {
		fmt.Println("erro:", err)
		return
	}

	// Convertemos para string só na hora de exibir.
	fmt.Printf("hostname: %s", string(conteudo))
}`,
      },
      {
        lang: "go",
        code: `// O pacote bytes espelha o pacote strings, mas para []byte.
package main

import (
	"bytes"
	"fmt"
)

func main() {
	dados := []byte("CAFÉ COM LEITE")

	// bytes.ToLower equivale a strings.ToLower mas sem converter.
	minusculo := bytes.ToLower(dados)
	fmt.Println(string(minusculo))
	// → café com leite

	// bytes.Contains, Split, Replace etc. existem todos.
	fmt.Println(bytes.Contains(dados, []byte("CAFÉ")))
	// → true

	partes := bytes.Split(dados, []byte(" "))
	for _, p := range partes {
		fmt.Printf("[%s] ", p)
	}
	// → [CAFÉ] [COM] [LEITE]
}`,
      },
      {
        lang: "go",
        code: `// bytes.Buffer: construir conteúdo binário ou texto eficientemente.
package main

import (
	"bytes"
	"fmt"
)

func main() {
	var buf bytes.Buffer

	buf.WriteString("HTTP/1.1 200 OK\r\n")
	buf.WriteString("Content-Type: text/plain\r\n")
	buf.WriteString("\r\n")
	buf.WriteString("pedido recebido")

	fmt.Println(buf.String())
	// → HTTP/1.1 200 OK
	// → Content-Type: text/plain
	// →
	// → pedido recebido
}`,
      },
      {
        lang: "go",
        code: `// Cuidado: cada conversão []byte(s) ALOCA memória.
package main

import (
	"bytes"
	"fmt"
)

func contemPalavraIneficiente(texto string, palavra string) bool {
	// MAU: converte string em []byte só para usar bytes.Contains.
	return bytes.Contains([]byte(texto), []byte(palavra))
}

func contemPalavraEficiente(texto string, palavra string) bool {
	// BOM: usa o pacote strings, evitando duas alocações.
	return len(texto) >= len(palavra) &&
		bytes.Contains([]byte(texto), []byte(palavra)) == true
}

func main() {
	frase := "pedido recebido às 10h"
	fmt.Println(contemPalavraIneficiente(frase, "pedido"))
	fmt.Println(contemPalavraEficiente(frase, "às"))
	// → true
	// → true
}
// Em produção, use strings.Contains direto. Pacote bytes é para []byte de fato.`,
      },
    ],
    points: [
      "string é imutável; []byte é mutável — essa é a diferença fundamental.",
      "Idiomático: use string para texto que não muda; []byte para IO e modificação.",
      "Conversão string([]byte) e []byte(string) sempre COPIA bytes — não é grátis.",
      "O pacote bytes oferece as mesmas funções de strings mas operando em []byte.",
      "bytes.Buffer é ótimo para construir respostas HTTP, payloads e binários.",
      "Funções de IO (os.ReadFile, http body) tipicamente devolvem []byte.",
      "Armadilha: converter string em []byte dentro de loops apertados destrói performance.",
      "Erro comum: tentar modificar uma string com s[0] = 'X' (não compila).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Toda conversão entre string e []byte aloca memória nova. Em hot paths, faça profiling com pprof para identificar conversões escondidas que viram garbage collection excessiva.",
      },
      {
        type: "info",
        content: "Existem truques avançados com unsafe para converter sem copiar (zero-copy), usados em bibliotecas como fasthttp. Mas são perigosos e quebram a garantia de imutabilidade — só use se souber exatamente o que está fazendo.",
      },
      {
        type: "tip",
        content: "Quando estiver lendo bytes de uma rede ou arquivo e for processar como texto, manipule como []byte até a última hora. Converta para string só quando precisar entregar para uma API que exige string.",
      },
    ],
  },
  {
    slug: "formatacao-fmt",
    section: "sintaxe",
    title: "Formatação com fmt",
    difficulty: "iniciante",
    subtitle: "Print, Println, Printf, Sprintf e os verbos de formatação que você vai usar todo dia",
    intro: `O pacote fmt é a porta de entrada da maioria dos programadores Go ao mundo da saída de dados. Ele faz o papel que printf faz em C, console.log faz em JavaScript e print em Python — mas com algumas diferenças importantes que vale entender desde o começo. fmt está na biblioteca padrão, não precisa instalar nada, e oferece dezenas de funções para imprimir e formatar valores.

As três funções básicas formam um padrão claro: Print imprime sem quebrar linha; Println imprime e quebra linha (e coloca espaços entre argumentos); Printf imprime com formato customizado usando "verbos" (%d, %s, %v, etc.). Cada uma tem variantes: Sprint, Sprintln, Sprintf devolvem a string em vez de imprimir; Fprint, Fprintf, Fprintln escrevem em qualquer io.Writer (arquivo, resposta HTTP, buffer).

Os verbos do Printf merecem atenção porque você vai usá-los milhares de vezes na vida. %v é o "valor padrão" — funciona para qualquer tipo e mostra de forma legível. %+v adiciona nomes de campos em structs. %#v mostra a sintaxe Go do valor (útil para debug). %T mostra o tipo. %d para inteiros decimais, %x para hexadecimal, %b para binário, %f para float, %s para string, %q para string entre aspas com escape, %t para boolean. Cada um tem opções de largura e precisão.

Uma característica única e poderosa do Go é o método String(). Se um tipo implementa func (t Tipo) String() string, então fmt automaticamente chama esse método quando você imprime com %v ou %s. É a forma idiomática de dar uma representação textual customizada para seus tipos. Implementar Stringer (a interface que esse método satisfaz) é praticamente um ritual de passagem em Go: torna seus tipos próprios cidadãos de primeira classe nas saídas de log e debug.`,
    codes: [
      {
        lang: "go",
        code: `// As três formas básicas de imprimir.
package main

import "fmt"

func main() {
	produto := "café"
	preco := 12.50

	// Print: sem quebra de linha, sem espaço extra.
	fmt.Print("produto:", produto, " preço:", preco)
	fmt.Print("\n")
	// → produto:café preço:12.5

	// Println: quebra linha e separa argumentos com espaço.
	fmt.Println("produto:", produto, "preço:", preco)
	// → produto: café preço: 12.5

	// Printf: formato controlado por verbos.
	fmt.Printf("produto: %s — preço: R$ %.2f\n", produto, preco)
	// → produto: café — preço: R$ 12.50
}`,
      },
      {
        lang: "go",
        code: `// Os verbos mais usados no dia a dia.
package main

import "fmt"

func main() {
	idade := 28
	nome := "Beatriz"
	ativo := true
	saldo := 1234.56

	fmt.Printf("%%d = %d\n", idade)     // decimal
	fmt.Printf("%%b = %b\n", idade)     // binário
	fmt.Printf("%%o = %o\n", idade)     // octal
	fmt.Printf("%%x = %x\n", idade)     // hexadecimal
	fmt.Printf("%%s = %s\n", nome)      // string
	fmt.Printf("%%q = %q\n", nome)      // string entre aspas
	fmt.Printf("%%t = %t\n", ativo)     // boolean
	fmt.Printf("%%f = %f\n", saldo)     // float padrão
	fmt.Printf("%%.2f = %.2f\n", saldo) // float com 2 casas
	fmt.Printf("%%e = %e\n", saldo)     // notação científica
	fmt.Printf("%%v = %v\n", saldo)     // valor padrão para qualquer tipo
	fmt.Printf("%%T = %T\n", saldo)     // tipo do valor
	// Saída:
	// %d = 28
	// %b = 11100
	// %o = 34
	// %x = 1c
	// %s = Beatriz
	// %q = "Beatriz"
	// %t = true
	// %f = 1234.560000
	// %.2f = 1234.56
	// %e = 1.234560e+03
	// %v = 1234.56
	// %T = float64
}`,
      },
      {
        lang: "go",
        code: `// %v, %+v e %#v com structs: os três níveis de detalhe.
package main

import "fmt"

type Cliente struct {
	Nome  string
	Idade int
}

func main() {
	c := Cliente{Nome: "Pedro", Idade: 35}

	fmt.Printf("%v\n", c)  // → {Pedro 35}
	fmt.Printf("%+v\n", c) // → {Nome:Pedro Idade:35}
	fmt.Printf("%#v\n", c) // → main.Cliente{Nome:"Pedro", Idade:35}
}`,
      },
      {
        lang: "go",
        code: `// Sprintf: formata e devolve string em vez de imprimir.
package main

import "fmt"

func resumoPedido(id int, total float64) string {
	return fmt.Sprintf("Pedido #%d: R$ %.2f", id, total)
}

func main() {
	msg := resumoPedido(42, 199.9)
	fmt.Println(msg)
	// → Pedido #42: R$ 199.90
}`,
      },
      {
        lang: "go",
        code: `// Implementando Stringer: customizar como seu tipo é impresso.
package main

import "fmt"

type Status int

const (
	StatusPendente Status = iota
	StatusPago
	StatusEnviado
)

// Este método transforma o seu tipo em "Stringer".
func (s Status) String() string {
	switch s {
	case StatusPendente:
		return "pendente"
	case StatusPago:
		return "pago"
	case StatusEnviado:
		return "enviado"
	}
	return "desconhecido"
}

func main() {
	s := StatusEnviado
	fmt.Println("Status do pedido:", s)
	fmt.Printf("Atual: %s (código %d)\n", s, int(s))
	// → Status do pedido: enviado
	// → Atual: enviado (código 2)
}`,
      },
      {
        lang: "go",
        code: `// Largura e alinhamento: gerando colunas alinhadas.
package main

import "fmt"

func main() {
	produtos := []struct {
		Nome  string
		Preco float64
	}{
		{"Café", 12.5},
		{"Sanduíche natural", 18.0},
		{"Suco", 7.9},
	}

	// %-20s alinha à esquerda em 20 colunas; %8.2f reserva 8 espaços.
	for _, p := range produtos {
		fmt.Printf("%-20s R$ %8.2f\n", p.Nome, p.Preco)
	}
	// → Café                 R$    12.50
	// → Sanduíche natural    R$    18.00
	// → Suco                 R$     7.90
}`,
      },
    ],
    points: [
      "Print, Println, Printf são as três funções fundamentais do fmt.",
      "Sprint* devolve string; Fprint* escreve em qualquer io.Writer.",
      "Use %v como verbo padrão; %+v e %#v dão mais detalhes para debug.",
      "Idiomático: implemente String() string para que fmt mostre seu tipo bonito.",
      "%q escapa caracteres especiais e coloca aspas — ótimo para mostrar strings em logs.",
      "Use %.2f para dinheiro e larguras como %-20s para colunar saídas.",
      "Armadilha: passar tipo errado para verbo (ex: %d com string) gera %!d(string=...) na saída.",
      "Erro comum: usar Println onde Printf seria mais legível com formato controlado.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando estiver debugando, %+v em structs e maps mostra os nomes dos campos. É um pequeno hábito que economiza muito tempo de logging em código novo.",
      },
      {
        type: "info",
        content: "fmt.Errorf com %w cria um erro com erro embrulhado (wrapped), permitindo desempilhar a cadeia de erros com errors.Is e errors.Unwrap. Veremos isso em detalhe na seção de erros.",
      },
      {
        type: "warning",
        content: "fmt usa reflexão internamente para determinar tipos — é flexível, mas mais lento que escrita direta de bytes. Em loops muito apertados de logging, considere alternativas como zap ou zerolog para performance.",
      },
    ],
  },
  {
    slug: "operadores",
    section: "sintaxe",
    title: "Operadores aritméticos, lógicos e bit a bit",
    difficulty: "iniciante",
    subtitle: "Os operadores que você usa todo dia e os menos óbvios que vão aparecer cedo ou tarde",
    intro: `Operadores em Go são bem parecidos com os de C, Java e a maioria das linguagens modernas. Você tem os aritméticos (+, -, *, /, %), de comparação (==, !=, <, <=, >, >=), lógicos (&&, ||, !) e os bit a bit (&, |, ^, &^, <<, >>). A grande maioria funciona como você espera. Mas Go tem algumas diferenças sutis que merecem atenção, especialmente quem vem de Python ou JavaScript.

A primeira pegadinha: divisão entre inteiros é divisão inteira, que descarta a parte fracionária. 7 / 2 dá 3, não 3.5. Para obter o decimal, pelo menos um dos operandos precisa ser float. Em Python 3 isso mudou (/ virou divisão real, // virou divisão inteira). Em Go, voltamos ao comportamento clássico de C. O operador % funciona com inteiros e devolve o resto da divisão — útil para alternar cores em listas, identificar pares e ímpares, ou rodar tarefas a cada N iterações.

Operadores lógicos && e || têm "short-circuit", ou seja, avaliam só o necessário. Em a && b, se a já é false, b nem é avaliado. Isso permite escrever código tipo if obj != nil && obj.Ativo sem medo de panic. O mesmo vale para || com false. Idiomaticamente, coloque a checagem de nil antes para aproveitar isso.

Os operadores bit a bit aparecem em código de baixo nível: parsing de protocolos, manipulação de flags, criptografia. & é E, | é OU, ^ é XOR (e também NOT unário), << e >> são deslocamentos. Go tem um operador único, &^, chamado "AND NOT" ou "bit clear", que limpa bits específicos. É equivalente a a & (^b). Útil para desligar flags em configurações sem afetar as outras. E, importante: Go NÃO tem operadores de incremento/decremento como expressão (você não pode fazer y = x++). Eles são instruções (statements), não expressões.`,
    codes: [
      {
        lang: "go",
        code: `// Aritmética básica e a divisão inteira.
package main

import "fmt"

func main() {
	a := 7
	b := 2
	fmt.Println(a + b) // → 9
	fmt.Println(a - b) // → 5
	fmt.Println(a * b) // → 14
	fmt.Println(a / b) // → 3 (DIVISÃO INTEIRA: descarta o decimal)
	fmt.Println(a % b) // → 1 (resto da divisão)

	// Para obter divisão decimal, pelo menos um precisa ser float.
	fmt.Println(float64(a) / float64(b)) // → 3.5
}`,
      },
      {
        lang: "go",
        code: `// % é útil para padrões cíclicos.
package main

import "fmt"

func main() {
	// Imprime cores alternadas a cada item.
	itens := []string{"banana", "maçã", "uva", "pera", "manga"}

	for i, item := range itens {
		if i%2 == 0 {
			fmt.Println("[branco]", item)
		} else {
			fmt.Println("[cinza] ", item)
		}
	}
	// → [branco] banana
	// → [cinza]  maçã
	// → [branco] uva
	// → [cinza]  pera
	// → [branco] manga
}`,
      },
      {
        lang: "go",
        code: `// Comparação e operadores lógicos.
package main

import "fmt"

func main() {
	idade := 25
	saldo := 1500.0
	temCadastro := true

	// && (E lógico) avalia da esquerda para direita, com short-circuit.
	if idade >= 18 && saldo >= 1000 && temCadastro {
		fmt.Println("crédito aprovado")
	}

	// || (OU lógico) também tem short-circuit.
	if idade < 18 || saldo < 500 {
		fmt.Println("perfil de risco")
	} else {
		fmt.Println("perfil normal")
	}

	// ! inverte o boolean.
	if !temCadastro {
		fmt.Println("precisa se cadastrar primeiro")
	}
}`,
      },
      {
        lang: "go",
        code: `// Operadores bit a bit: úteis para flags.
package main

import "fmt"

const (
	FlagAtivo    uint = 1 << 0 // 0001
	FlagPremium  uint = 1 << 1 // 0010
	FlagBloqueado uint = 1 << 2 // 0100
)

func main() {
	usuario := FlagAtivo | FlagPremium // ligamos duas flags

	fmt.Printf("flags: %04b\n", usuario)
	// → flags: 0011

	// Verificar se flag está ligada.
	if usuario&FlagPremium != 0 {
		fmt.Println("usuário premium")
	}

	// Desligar uma flag com &^ (bit clear).
	usuario = usuario &^ FlagPremium
	fmt.Printf("após remover premium: %04b\n", usuario)
	// → após remover premium: 0001
}`,
      },
      {
        lang: "go",
        code: `// ++ e -- existem, mas são INSTRUÇÕES, não expressões.
package main

import "fmt"

func main() {
	x := 5
	x++ // OK: instrução isolada
	fmt.Println(x) // → 6

	// y := x++  // ERRO: x++ não devolve valor
	// fmt.Println(x++) // ERRO

	// E também não existe ++x (só pós-fixado).
	// ++x  // ERRO
}`,
      },
      {
        lang: "go",
        code: `// Atribuição composta: +=, -=, *=, /=, %=, |=, &=, ^=, <<=, >>=.
package main

import "fmt"

func main() {
	saldo := 1000.0

	saldo += 250.50  // saldo = saldo + 250.50
	saldo -= 100     // saldo = saldo - 100
	saldo *= 1.05    // aplica 5% de juros

	fmt.Printf("saldo final: R$ %.2f\n", saldo)
	// → saldo final: R$ 1208.03
}`,
      },
    ],
    points: [
      "Divisão entre inteiros descarta o decimal: 7/2 = 3 (não 3.5).",
      "% (módulo) só funciona com inteiros e dá o resto da divisão.",
      "&& e || têm short-circuit — aproveite para checar nil antes de acessar campo.",
      "Idiomático: use atribuições compostas (+=, *=) em vez de reatribuir manualmente.",
      "&^ é o operador 'bit clear' do Go, único entre as linguagens populares.",
      "++ e -- são instruções, não expressões: não cabem dentro de outra expressão.",
      "Armadilha: dividir int por int esperando float — converta com float64() antes.",
      "Erro comum: usar = em vez de == em condições (em Go, isso nem compila no if).",
    ],
    alerts: [
      {
        type: "info",
        content: "Diferente de C, Java e JavaScript, Go não tem operador ternário (a ? b : c). A comunidade considera if/else mais legível, e a linguagem assume essa opinião deliberadamente.",
      },
      {
        type: "tip",
        content: "Quando precisar trabalhar com flags binárias, use o padrão type Flag uint + iota com 1<<iota. Isso te dá enums type-safe e operações bit a bit eficientes.",
      },
      {
        type: "warning",
        content: "Cuidado ao misturar tipos numéricos diferentes em expressões. Go vai recusar compilar — isso é proteção, não chatice. Faça as conversões explícitas para o tipo desejado.",
      },
    ],
  },
  {
    slug: "conversao-tipos",
    section: "sintaxe",
    title: "Conversão de tipos",
    difficulty: "intermediario",
    subtitle: "Por que Go nunca converte automaticamente e como fazer conversões corretas e seguras",
    intro: `Go é uma das linguagens mais rigorosas que existem em conversões de tipos. Não existe coerção implícita: somar int32 com int64 é erro de compilação. Atribuir int para uint é erro. Comparar int com float64 é erro. Quem vem de JavaScript (onde "5" + 1 vira "51") ou de C (onde tudo se converte automaticamente, gerando bugs sutis) leva um susto. Mas a rigidez é proposital: uma vez que seu código compila, você sabe que não tem conversão silenciosa estragando contas.

A sintaxe de conversão é simples: T(valor). Não tem cast(), não tem (T)valor como em C, não tem to_int. Apenas chame o nome do tipo como se fosse uma função. int64(meuInt32), float64(meuInt), uint(meuInt). Funciona para todos os tipos numéricos básicos e para tipos que têm relação direta de representação (como string para []byte e vice-versa).

Mas atenção: conversão NÃO é parsing. Converter a string "42" para int não é T(s) — é strconv.Atoi(s). A diferença é fundamental. T(valor) só funciona quando os tipos têm a mesma representação subjacente. Para transformar texto em número, ou JSON em struct, você precisa de funções de parsing dedicadas. Isso causa muita confusão em iniciantes vindos de Python (int("42") simples) ou JavaScript (Number("42")).

Conversões entre tipos numéricos podem perder informação. Converter float64(3.9) para int dá 3 (trunca, não arredonda). Converter int64(300) para int8 dá um valor lixo, porque 300 não cabe em 8 bits. O compilador deixa você fazer essas conversões — elas são explícitas, então a responsabilidade é sua. Para converter com segurança, valide o range antes ou use funções da biblioteca padrão como math.Round seguido de cast, ou strconv com tratamento de erro.`,
    codes: [
      {
        lang: "go",
        code: `// Conversão básica entre tipos numéricos.
package main

import "fmt"

func main() {
	var i int = 42
	var f float64 = float64(i)  // int → float64
	var u uint = uint(i)        // int → uint

	fmt.Println(i, f, u)
	// → 42 42 42

	// Sem conversão explícita = erro de compilação.
	// var f2 float64 = i  // ERRO: cannot use i (int) as float64
}`,
      },
      {
        lang: "go",
        code: `// Conversão que PERDE informação: cuidado.
package main

import "fmt"

func main() {
	pi := 3.14159
	inteiro := int(pi) // trunca, não arredonda
	fmt.Println(inteiro)
	// → 3 (e não 3 ou 4 por arredondamento)

	// Para arredondar de verdade:
	import_math := 3.7
	arredondado := int(import_math + 0.5) // truque clássico
	fmt.Println(arredondado)
	// → 4
}`,
      },
      {
        lang: "go",
        code: `// Conversão NÃO é parsing — para texto, use strconv.
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// String "42" para int: NÃO funciona com int("42").
	idade, err := strconv.Atoi("42")
	if err != nil {
		fmt.Println("não é número válido:", err)
		return
	}
	fmt.Println(idade + 1)
	// → 43

	// Int para string: tem dois caminhos.
	numero := 100

	// Caminho 1: strconv.Itoa (recomendado para inteiros).
	texto := strconv.Itoa(numero)
	fmt.Println(texto, len(texto))
	// → 100 3

	// Caminho 2: fmt.Sprintf (mais flexível para qualquer formatação).
	formatado := fmt.Sprintf("R$ %d.00", numero)
	fmt.Println(formatado)
	// → R$ 100.00
}`,
      },
      {
        lang: "go",
        code: `// Parsing seguro de float (preço vindo de input).
package main

import (
	"fmt"
	"strconv"
)

func main() {
	entradaUsuario := "199,90" // formato brasileiro com vírgula

	// strconv.ParseFloat espera ponto, não vírgula.
	// Trocamos antes:
	limpo := ""
	for _, r := range entradaUsuario {
		if r == ',' {
			limpo += "."
		} else {
			limpo += string(r)
		}
	}

	preco, err := strconv.ParseFloat(limpo, 64)
	if err != nil {
		fmt.Println("preço inválido:", err)
		return
	}

	fmt.Printf("preço: R$ %.2f\n", preco)
	// → preço: R$ 199.90
}`,
      },
      {
        lang: "go",
        code: `// String ↔ []byte ↔ []rune: trio essencial.
package main

import "fmt"

func main() {
	s := "café"

	// string → []byte: cópia mutável de bytes UTF-8.
	bs := []byte(s)
	fmt.Println(bs) // → [99 97 102 195 169]

	// string → []rune: cópia de code points Unicode.
	rs := []rune(s)
	fmt.Println(rs)             // → [99 97 102 233]
	fmt.Println(string(rs[3]))  // → é

	// []byte → string e []rune → string.
	fmt.Println(string(bs)) // → café
	fmt.Println(string(rs)) // → café
}`,
      },
      {
        lang: "go",
        code: `// Validar conversão segura entre tipos numéricos.
package main

import (
	"fmt"
	"math"
)

func intParaInt8(x int) (int8, error) {
	if x > math.MaxInt8 || x < math.MinInt8 {
		return 0, fmt.Errorf("valor %d fora do intervalo int8 (-128..127)", x)
	}
	return int8(x), nil
}

func main() {
	bom, err := intParaInt8(100)
	fmt.Println(bom, err) // → 100 <nil>

	ruim, err := intParaInt8(500)
	fmt.Println(ruim, err) // → 0 valor 500 fora do intervalo int8 (-128..127)
}`,
      },
    ],
    points: [
      "Toda conversão de tipo é EXPLÍCITA em Go: T(valor).",
      "Conversão NÃO é parsing — para texto use strconv.Atoi, ParseFloat etc.",
      "Idiomático: use strconv.Itoa para int→string e strconv.Atoi para string→int.",
      "Conversão float→int trunca (não arredonda). Para arredondar, some 0.5 antes.",
      "Conversão para tipo menor (int64→int8) pode silenciosamente perder dados.",
      "string ↔ []byte ↔ []rune são conversões válidas com semântica clara.",
      "Armadilha: tentar usar int(\"42\") como em Python — não compila em Go.",
      "Erro comum: ignorar o erro de strconv.Atoi e processar zero como se fosse válido.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Conversões entre tipos numéricos com tamanhos diferentes podem causar overflow silencioso. Sempre que converter para um tipo menor, valide o range ou prepare-se para resultados inesperados.",
      },
      {
        type: "tip",
        content: "Quando uma função pode falhar (como strconv.Atoi), Go te obriga a lidar com o segundo retorno. Resista à tentação de descartar com _ — esse erro é informação valiosa.",
      },
      {
        type: "info",
        content: "Para conversões mais ricas (struct ↔ JSON, Date ↔ string), Go usa pacotes como encoding/json e time. Eles fazem parsing real e bem mais sofisticado que conversão de tipos.",
      },
    ],
  },
  {
    slug: "zero-values",
    section: "sintaxe",
    title: "Zero values",
    difficulty: "iniciante",
    subtitle: "Por que toda variável em Go já nasce inicializada e como isso elimina uma classe inteira de bugs",
    intro: `Uma das decisões de design mais elegantes de Go é o conceito de "zero value". Toda variável declarada sem valor inicial recebe automaticamente um valor padrão definido pelo seu tipo: 0 para números, "" para strings, false para boolean, nil para slices, mapas, ponteiros, canais, funções e interfaces. Não existe variável "indefinida" como em JavaScript ou "lixo na memória" como em C. Isso elimina uma classe enorme de bugs antes mesmo de o programa rodar.

A consequência prática é que código Go é, por padrão, mais previsível. Você nunca precisa se perguntar "será que essa variável foi inicializada?". Em C, esquecer de inicializar gera bug aleatório que aparece em produção em uma sexta às 18h. Em Java, você toma NullPointerException. Em Go, o zero value já está lá, sensato e útil. Você pode até depender disso para escrever código mais limpo, sem inicializações redundantes.

O conceito vale para structs também: quando você declara uma struct sem inicializar campos, cada campo recebe seu próprio zero value. Isso permite o padrão idiomático de "struct usável de cara". Várias estruturas da biblioteca padrão são desenhadas para funcionar com zero value — bytes.Buffer e sync.Mutex são exemplos clássicos. Você declara var buf bytes.Buffer e já pode chamar buf.WriteString sem nenhuma inicialização extra.

Para tipos referência (slice, map, channel, function, interface, pointer), o zero value é nil. Aqui mora um ponto importante: usar um slice nil para LER é seguro (len, range, append funcionam). Mas usar um map nil para ESCREVER causa panic. É uma assimetria que confunde iniciantes. Para slices você pode trabalhar tranquilo com nil; para maps, sempre inicialize com make antes de escrever. Saber essas diferenças é o que separa código que funciona em desenvolvimento de código que sobrevive em produção.`,
    codes: [
      {
        lang: "go",
        code: `// Zero values dos tipos básicos.
package main

import "fmt"

func main() {
	var i int        // 0
	var f float64    // 0
	var b bool       // false
	var s string     // ""
	var p *int       // nil
	var sl []int     // nil
	var m map[string]int // nil

	fmt.Printf("int=%d float=%g bool=%t string=%q\n", i, f, b, s)
	fmt.Printf("ptr=%v slice=%v map=%v\n", p, sl, m)
	// → int=0 float=0 bool=false string=""
	// → ptr=<nil> slice=[] map=map[]
}`,
      },
      {
        lang: "go",
        code: `// Structs também recebem zero value campo a campo.
package main

import "fmt"

type Pedido struct {
	ID       int
	Cliente  string
	Total    float64
	Pago     bool
	Itens    []string
	Metadata map[string]string
}

func main() {
	var p Pedido
	fmt.Printf("%+v\n", p)
	// → {ID:0 Cliente: Total:0 Pago:false Itens:[] Metadata:map[]}
}`,
      },
      {
        lang: "go",
        code: `// bytes.Buffer e sync.Mutex: zero value usável de cara.
package main

import (
	"bytes"
	"fmt"
	"sync"
)

func main() {
	// Não precisamos de bytes.NewBuffer nem nada.
	var buf bytes.Buffer
	buf.WriteString("pronto para uso!")
	fmt.Println(buf.String())
	// → pronto para uso!

	// sync.Mutex também: var mu sync.Mutex já está pronto.
	var mu sync.Mutex
	mu.Lock()
	defer mu.Unlock()
	fmt.Println("seção crítica protegida")
	// → seção crítica protegida
}`,
      },
      {
        lang: "go",
        code: `// Slice nil X slice vazio: comportamento idêntico para a maioria dos usos.
package main

import "fmt"

func main() {
	var nilSlice []int          // nil
	vazioSlice := []int{}       // não nil, mas vazio

	fmt.Println(len(nilSlice), len(vazioSlice)) // → 0 0
	fmt.Println(nilSlice == nil, vazioSlice == nil) // → true false

	// append funciona nos dois!
	nilSlice = append(nilSlice, 1, 2, 3)
	vazioSlice = append(vazioSlice, 1, 2, 3)
	fmt.Println(nilSlice, vazioSlice)
	// → [1 2 3] [1 2 3]
}`,
      },
      {
        lang: "go",
        code: `// Map nil: pode LER, mas escrever causa PANIC.
package main

import "fmt"

func main() {
	var m map[string]int

	// LEITURA em map nil é segura, devolve zero value do valor.
	v, ok := m["chave"]
	fmt.Println(v, ok) // → 0 false

	// ESCRITA em map nil dá PANIC.
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("panic capturada:", r)
		}
	}()
	m["chave"] = 10
	// → panic capturada: assignment to entry in nil map
}`,
      },
      {
        lang: "go",
        code: `// Padrão idiomático: aproveitar zero value para configuração mínima.
package main

import "fmt"

type ConfigServidor struct {
	Porta        int    // 0 = usar padrão 8080
	Host         string // "" = usar padrão "localhost"
	MaxConexoes  int    // 0 = sem limite
}

func iniciar(c ConfigServidor) string {
	if c.Porta == 0 {
		c.Porta = 8080
	}
	if c.Host == "" {
		c.Host = "localhost"
	}
	limite := "sem limite"
	if c.MaxConexoes > 0 {
		limite = fmt.Sprintf("%d", c.MaxConexoes)
	}
	return fmt.Sprintf("servindo em %s:%d (max=%s)", c.Host, c.Porta, limite)
}

func main() {
	// Cliente que aceita tudo padrão:
	fmt.Println(iniciar(ConfigServidor{}))
	// → servindo em localhost:8080 (max=sem limite)

	// Cliente que customiza só o que precisa:
	fmt.Println(iniciar(ConfigServidor{Porta: 9000}))
	// → servindo em localhost:9000 (max=sem limite)
}`,
      },
    ],
    points: [
      "Toda variável em Go nasce com valor padrão (zero value), nunca indefinida.",
      "Numéricos = 0; bool = false; string = \"\"; tipos referência = nil.",
      "Idiomático: projete tipos cujo zero value já seja útil (bytes.Buffer, sync.Mutex).",
      "Slice nil é seguro para len, range e append; map nil só para LEITURA.",
      "Atribuir em map nil causa panic — sempre faça make(map[K]V) antes.",
      "Compare slice ou map com nil para detectar zero value vs vazio.",
      "Armadilha: assumir que map nil aceita escrita igual a slice nil aceita append.",
      "Erro comum: inicializar variáveis explicitamente quando o zero value já basta.",
    ],
    alerts: [
      {
        type: "info",
        content: "Zero value é uma das diferenças filosóficas que mais separa Go de outras linguagens. Em C/C++ você precisa inicializar manualmente; em Java tem null por toda parte; em Go, o valor padrão é deliberado e útil.",
      },
      {
        type: "warning",
        content: "Map nil é a fonte clássica de panic para iniciantes. Sempre inicialize com make antes de escrever, ou use o literal vazio: m := map[string]int{}.",
      },
      {
        type: "tip",
        content: "Quando criar um tipo público no seu pacote, pense se o zero value tem comportamento sensato. Se sim, sua API fica mais limpa e os usuários não precisam de New() obrigatório.",
      },
    ],
  },
  {
    slug: "nomes-exportados",
    section: "sintaxe",
    title: "Nomes exportados (visibilidade)",
    difficulty: "iniciante",
    subtitle: "Como Go decide o que é público ou privado usando uma única regra: a primeira letra",
    intro: `A maioria das linguagens controla visibilidade com palavras-chave: public, private, protected, internal. Go faz diferente, e mais simples: usa a primeira letra do nome. Se começa com maiúscula, é exportado (visível por outros pacotes). Se começa com minúscula, é privado (só visível dentro do próprio pacote). Não tem palavra-chave, não tem modificador. Só letra.

Isso vale para tudo: variáveis, constantes, funções, tipos, métodos, campos de struct. Cliente é exportado, cliente é privado. Soma() é exportada, soma() é privada. Esse padrão atravessa toda a biblioteca padrão e todo o ecossistema. É uma regra que parece estranha vinda de Java ou C#, mas em uma semana você nem nota mais — vira tão natural que aplicar visibilidade vira parte da escolha do nome.

A vantagem é que você sabe a visibilidade só de bater o olho no código. Não precisa procurar onde está a palavra-chave, não precisa lembrar regras complicadas de package-private vs protected. Bate o olho no nome, e sabe. A desvantagem é que mudar a visibilidade de algo (de privado para público ou vice-versa) implica RENOMEAR — o que tem efeito cascata se outros lugares já usam o nome.

Para campos de struct, a regra é igual e tem implicações enormes em serialização. Quando você usa encoding/json, só campos exportados (com letra maiúscula) são serializados. É um motivo comum de "por que meu JSON está vazio?" para iniciantes que escreveram campos com letra minúscula. A solução é exportar o campo e, se quiser, usar uma struct tag para customizar o nome no JSON. Esse padrão de tags entre crases é onipresente em Go: orienta encoding, validação, ORM, e muito mais.`,
    codes: [
      {
        lang: "go",
        code: `// Pacote contas/contas.go: tudo que começa com maiúscula é exportado.
package contas

// Conta é EXPORTADA (Conta com C maiúsculo).
type Conta struct {
	Numero  string  // exportado
	Titular string  // exportado
	saldo   float64 // PRIVADO (saldo com s minúsculo)
}

// NovaConta é EXPORTADA: outros pacotes podem chamar.
func NovaConta(numero, titular string) *Conta {
	return &Conta{Numero: numero, Titular: titular, saldo: 0}
}

// Depositar é EXPORTADA.
func (c *Conta) Depositar(valor float64) {
	c.saldo += valor
}

// Saldo expõe o saldo de leitura controlada.
func (c *Conta) Saldo() float64 {
	return c.saldo
}

// validar é PRIVADA: outros pacotes não podem chamar.
func (c *Conta) validar() bool {
	return c.saldo >= 0
}`,
      },
      {
        lang: "go",
        code: `// main.go consumindo o pacote contas.
package main

import (
	"fmt"

	"github.com/empresa/banco/contas"
)

func main() {
	c := contas.NovaConta("0001-2", "Mariana Silva")
	c.Depositar(500.00)

	fmt.Println(c.Numero, c.Titular, c.Saldo())
	// → 0001-2 Mariana Silva 500

	// c.saldo  // ERRO: saldo é privado, não acessível fora de contas
	// c.validar() // ERRO: validar é privada
}`,
      },
      {
        lang: "go",
        code: `// O efeito da visibilidade na serialização JSON.
package main

import (
	"encoding/json"
	"fmt"
)

type Produto struct {
	Nome    string  // exportado: vai para o JSON
	Preco   float64 // exportado: vai para o JSON
	estoque int     // privado: NÃO vai para o JSON
}

func main() {
	p := Produto{Nome: "Café", Preco: 12.50, estoque: 100}
	b, _ := json.Marshal(p)
	fmt.Println(string(b))
	// → {"Nome":"Café","Preco":12.5}
	// Note: estoque sumiu porque é privado.
}`,
      },
      {
        lang: "go",
        code: `// Struct tags: customizar nomes na serialização (atenção aos backticks!).
package main

import (
	"encoding/json"
	"fmt"
)

type Pedido struct {
	ID         int     ` + "`json:\"id\"`" + `
	Cliente    string  ` + "`json:\"cliente\"`" + `
	ValorTotal float64 ` + "`json:\"valor_total\"`" + `
	Cancelado  bool    ` + "`json:\"cancelado,omitempty\"`" + `
}

func main() {
	p := Pedido{ID: 42, Cliente: "Ana", ValorTotal: 199.9, Cancelado: false}
	b, _ := json.MarshalIndent(p, "", "  ")
	fmt.Println(string(b))
	// → {
	// →   "id": 42,
	// →   "cliente": "Ana",
	// →   "valor_total": 199.9
	// → }
	// Cancelado sumiu porque tem omitempty e é zero value.
}`,
      },
      {
        lang: "go",
        code: `// Pacote interno: tudo exportado dentro do pacote, mas não fora dele.
package main

import "fmt"

// dentro do MESMO pacote, maiúscula vs minúscula NÃO importa para acesso.
type produto struct {
	nome  string
	preco float64
}

func novoProduto(nome string, preco float64) produto {
	return produto{nome: nome, preco: preco}
}

func main() {
	p := novoProduto("Café", 12.5)
	// Acessamos campos privados sem problema, estamos no mesmo pacote.
	fmt.Println(p.nome, p.preco)
	// → Café 12.5
}`,
      },
      {
        lang: "go",
        code: `// Convenção de nomes em Go: curto e descritivo, sem prefixos como "I" ou "_".
package main

import "fmt"

// CORRETO (idiomático Go):
type Reader interface { Read(p []byte) (int, error) }
type User struct { ID int; Name string }
var maxRetries = 3

// EVITAR (estilo Java/Hungarian):
// type IReader interface { ... }
// type CUser struct { ... }
// var _maxRetries = 3 // sem underscore prefixo em Go

func main() {
	u := User{ID: 1, Name: "Bob"}
	fmt.Printf("%+v retries=%d\n", u, maxRetries)
	// → {ID:1 Name:Bob} retries=3
}`,
      },
    ],
    points: [
      "Letra inicial maiúscula = exportado (público); minúscula = privado.",
      "Vale para tudo: variáveis, funções, tipos, métodos e campos de struct.",
      "Idiomático: nomes curtos e expressivos; sem prefixos como I ou _.",
      "Dentro do MESMO pacote a regra não importa — todo mundo enxerga tudo.",
      "JSON e outros encoders só serializam campos EXPORTADOS por padrão.",
      "Use struct tags com crases para customizar nomes em JSON, DB ou XML.",
      "Armadilha: campo com letra minúscula que some no JSON e o iniciante acha bug.",
      "Erro comum: importar um símbolo achando que está acessível e ele estar minúsculo.",
    ],
    alerts: [
      {
        type: "info",
        content: "A regra de visibilidade pela letra inicial é citada na própria especificação da linguagem. Não tem modificador, não tem como burlar — esse é o sistema completo.",
      },
      {
        type: "tip",
        content: "Quando renomear um símbolo exportado, use o gopls (language server) ou ferramentas como gofmt -r. Mudar manualmente é caminho fácil para esquecer um lugar e quebrar o build.",
      },
      {
        type: "warning",
        content: "Cuidado com campos de struct ao receber JSON de fora. Se o campo for privado, o decoder ignora silenciosamente. Sempre exporte campos que devem ser preenchidos a partir de JSON ou banco.",
      },
    ],
  },
];
