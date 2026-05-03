import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "if-else",
    section: "controle",
    title: "If, else if e else",
    difficulty: "iniciante",
    subtitle: "Tomando decisões em Go com a sintaxe enxuta e o famoso short statement",
    intro: `Programar é, no fundo, ensinar o computador a tomar decisões. "Se a conta tem saldo, libera o saque. Senão, mostra erro." Em Go, essa decisão é escrita com if, else if e else, igualzinho ao que você já viu em outras linguagens, mas com algumas particularidades que valem ouro.

A primeira diferença que salta aos olhos de quem vem de Java, JavaScript ou C é que em Go você não usa parênteses ao redor da condição. Escreve apenas if x > 0 { ... }. Em compensação, as chaves são obrigatórias, mesmo quando o bloco tem uma única linha. Isso elimina aquela classe de bugs em que alguém adiciona uma segunda linha "dentro" do if e descobre tarde demais que ela rodava sempre. Em Python a indentação resolve esse problema; em Go, são as chaves.

A segunda diferença, e essa é uma marca registrada da linguagem, é o short statement. Você pode declarar uma variável dentro do if, antes da condição, separada por ponto e vírgula. Algo como if err := salvar(); err != nil { ... }. Essa variável só existe dentro do if e dos elses associados, o que evita poluir o escopo externo com nomes que você só vai usar uma vez. É extremamente idiomático em Go, especialmente para tratar erros logo após a chamada que pode falhar.

Outro ponto importante: a condição precisa ser um booleano de verdade. Em Go não existe "valor truthy". Não escreva if usuario para checar se um ponteiro é não-nulo, escreva if usuario != nil. Não escreva if texto para checar string vazia, escreva if texto != "". Isso parece chato no começo, mas torna o código bem mais legível depois, porque você sempre sabe exatamente o que está sendo testado.

Por fim, lembre-se: Go não tem operador ternário (aquele a > b ? a : b do C/JavaScript). A comunidade decidiu que ele atrapalha mais do que ajuda, então acostume-se a escrever um if/else mesmo para casos curtos. Ou crie uma função helper se a expressão se repetir muito.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Decisão simples: liberar ou não um saque.
func main() {
	saldo := 250.00
	saque := 300.00

	if saldo >= saque {
		fmt.Println("Saque liberado")
	} else {
		fmt.Println("Saldo insuficiente")
	}
	// → saída: Saldo insuficiente
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// if com short statement: a variável "desconto" só vive dentro do if/else.
func main() {
	preco := 199.90

	if desconto := preco * 0.10; desconto > 15 {
		fmt.Printf("Você ganhou R$%.2f de desconto!\n", desconto)
	} else {
		fmt.Println("Sem desconto especial dessa vez")
	}
	// fmt.Println(desconto) // erro de compilação: desconto não existe aqui
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"strconv"
)

// Padrão clássico em Go: chamar função que retorna (valor, erro)
// e tratar o erro logo no if.
func main() {
	entrada := "42"

	if n, err := strconv.Atoi(entrada); err != nil {
		fmt.Println("Não consegui converter:", err)
	} else {
		fmt.Println("Número convertido:", n)
	}
	// → saída: Número convertido: 42
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// else if encadeado para classificar pedidos por valor.
func classificar(valor float64) string {
	if valor < 50 {
		return "pequeno"
	} else if valor < 200 {
		return "médio"
	} else if valor < 1000 {
		return "grande"
	}
	return "enorme"
}

func main() {
	fmt.Println(classificar(35))    // → pequeno
	fmt.Println(classificar(150))   // → médio
	fmt.Println(classificar(2500))  // → enorme
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Em Go a condição precisa ser bool. Não existe "truthy".
func main() {
	nome := ""

	// if nome { ... }  // ERRO de compilação: non-bool nome
	if nome != "" {
		fmt.Println("Olá,", nome)
	} else {
		fmt.Println("Nome em branco")
	}
}`,
      },
    ],
    points: [
      "Não use parênteses na condição: escreva if x > 0 { ... }, não if (x > 0).",
      "Chaves são obrigatórias mesmo para uma única linha de corpo.",
      "Idiomático: use o short statement (if v, err := f(); err != nil) para limitar escopo.",
      "A condição deve ser booleana; Go não tem valores truthy/falsy.",
      "Go não tem operador ternário; escreva if/else mesmo para expressões curtas.",
      "Armadilha: declarar a variável fora do if quando ela só é usada dentro polui o escopo.",
      "Variáveis declaradas no short statement vivem em todos os else if/else encadeados.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre que uma função devolver (valor, error), prefira tratar o erro no mesmo if usando short statement. É a forma mais limpa e idiomática em Go.",
      },
      {
        type: "warning",
        content: "Esquecer as chaves não é uma opção em Go: o compilador rejeita. Isso elimina bugs comuns em C e JavaScript onde um if sem chaves engole apenas a próxima linha.",
      },
      {
        type: "info",
        content: "Não existe operador ternário em Go por decisão de design. A comunidade considera que else explícito ou uma função auxiliar deixam o código mais fácil de ler.",
      },
    ],
  },
  {
    slug: "switch-case",
    section: "controle",
    title: "Switch e case",
    difficulty: "iniciante",
    subtitle: "Um switch que não te trai: sem break esquecido e com superpoderes que C nunca teve",
    intro: `Se você já sofreu em Java, C ou JavaScript com aquele bug clássico de esquecer o break dentro de um case e ver a execução cair no próximo, vai amar o switch do Go. Aqui, cada case termina sozinho. Você não precisa escrever break, e fallthrough (cair no próximo case) só acontece se você pedir explicitamente com a palavra-chave fallthrough. A escolha foi consciente: na prática, fallthrough quase nunca é o que se quer, então o padrão da linguagem é o oposto do C.

A segunda novidade boa é que cases podem testar várias condições separadas por vírgula. Em vez de empilhar três cases vazios para "segunda, terça, quarta", você escreve case "segunda", "terça", "quarta": e pronto. Isso deixa o código compacto e fácil de ler.

A terceira, e talvez a mais surpreendente para quem vem de outras linguagens, é o switch sem expressão. Quando você escreve apenas switch { ... } seguido de cases com condições booleanas, o Go usa esse switch como uma cadeia elegante de if/else if. É comum ver código Go usar isso quando há muitas faixas de valor para classificar, porque fica visualmente mais organizado que um if/else if gigante.

Como no if, o switch também aceita um short statement: switch dia := time.Now().Weekday(); dia { ... }. A variável dia só vive dentro do switch. E os tipos comparados nos cases precisam casar com o tipo da expressão; o compilador reclama se você tentar comparar uma string com um inteiro. Esse rigor evita aquela bagunça de coerção implícita do JavaScript.

Por fim, vale citar o type switch (que tem capítulo próprio): uma forma especial de switch que descobre o tipo concreto guardado dentro de uma interface. Mas isso fica para depois. Aqui, foque em dominar o switch comum, porque ele aparece em praticamente todo código Go que precisa decidir entre várias opções discretas.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Switch básico: cada case fecha sozinho, sem precisar de break.
func main() {
	metodo := "pix"

	switch metodo {
	case "pix":
		fmt.Println("Pagamento instantâneo")
	case "boleto":
		fmt.Println("Compensação em até 3 dias")
	case "cartao":
		fmt.Println("Aprovação on-line")
	default:
		fmt.Println("Método desconhecido:", metodo)
	}
	// → saída: Pagamento instantâneo
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Vários valores no mesmo case: separados por vírgula.
func ehFimDeSemana(dia string) bool {
	switch dia {
	case "sábado", "domingo":
		return true
	default:
		return false
	}
}

func main() {
	fmt.Println(ehFimDeSemana("sexta"))  // → false
	fmt.Println(ehFimDeSemana("sábado")) // → true
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Switch sem expressão: substitui um if/else if longo de forma elegante.
func faixaEtaria(idade int) string {
	switch {
	case idade < 0:
		return "inválida"
	case idade < 13:
		return "criança"
	case idade < 18:
		return "adolescente"
	case idade < 60:
		return "adulto"
	default:
		return "idoso"
	}
}

func main() {
	fmt.Println(faixaEtaria(8))   // → criança
	fmt.Println(faixaEtaria(35))  // → adulto
	fmt.Println(faixaEtaria(72))  // → idoso
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Switch com short statement: a variável "dia" só existe dentro do switch.
func main() {
	switch dia := time.Now().Weekday(); dia {
	case time.Saturday, time.Sunday:
		fmt.Println("Bom descanso!")
	default:
		fmt.Println("Dia útil, vamos codar.")
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// fallthrough é opt-in e raramente útil.
// Aqui ilustramos só para você reconhecer quando vir.
func main() {
	nivel := 1
	switch nivel {
	case 1:
		fmt.Println("Acesso básico")
		fallthrough
	case 2:
		fmt.Println("Acesso de leitura")
	case 3:
		fmt.Println("Acesso total")
	}
	// → saída:
	// Acesso básico
	// Acesso de leitura
}`,
      },
    ],
    points: [
      "Cada case termina sozinho; não escreva break (o compilador nem deixa fazer sentido).",
      "Use vírgula para múltiplos valores no mesmo case: case 1, 2, 3:.",
      "Idiomático: switch sem expressão substitui if/else if encadeado e fica mais limpo.",
      "A cláusula default é opcional, mas recomendada para tratar valores inesperados.",
      "fallthrough existe, mas é raríssimo; precisa ser explícito.",
      "Armadilha: vir do C/Java e adicionar break em cada case por reflexo (não é erro, mas é ruído).",
      "O short statement (switch x := f(); x) limita o escopo da variável ao próprio switch.",
    ],
    alerts: [
      {
        type: "success",
        content: "O switch de Go elimina por design o bug mais comum de C e Java: esquecer o break e ver a execução vazar para o próximo case.",
      },
      {
        type: "tip",
        content: "Quando seu if/else if tem três ou mais ramos, considere converter para um switch sem expressão. O resultado costuma ficar bem mais legível.",
      },
      {
        type: "info",
        content: "fallthrough só pode aparecer como última instrução do case e força a execução do próximo, sem reavaliar a condição. Use com muita parcimônia.",
      },
    ],
  },
  {
    slug: "type-switch",
    section: "controle",
    title: "Type switch: descobrindo o tipo dinâmico",
    difficulty: "intermediario",
    subtitle: "Quando o valor é uma interface e você precisa decidir o que fazer baseado no tipo concreto",
    intro: `Em Go, interfaces guardam um par "tipo dinâmico + valor". Quando você recebe um any (que é apenas um apelido para interface{}), por trás daquele rótulo genérico pode haver um int, uma string, um struct seu, um ponteiro, qualquer coisa. Para decidir o que fazer baseado no tipo real, existe uma forma especial de switch chamada type switch.

A sintaxe é v := x.(type), só permitida dentro de um switch. Você lê: "olha o tipo dinâmico de x e me dá o valor com esse tipo na variável v". Cada case lista um ou mais tipos, e dentro dele a variável v passa a ter exatamente aquele tipo, com todos os métodos e operações disponíveis. Isso é diferente da type assertion comum (x.(int)), que precisaria ser repetida para cada teste e pode dar panic se você errar.

Type switch é o padrão idiomático para implementar funções que aceitam qualquer coisa, como um Println genérico, um serializador para JSON, um inspetor de configuração. Ele também aparece muito em tratamento de erros quando você usa errors.As ou compara com tipos específicos de erro (por exemplo *os.PathError, *url.Error). Saber type switch desbloqueia muita coisa do mundo real em Go.

Vale lembrar dois detalhes. Primeiro: você pode juntar tipos no mesmo case (case int, int64:) e nesse caso a variável volta a ser do tipo da interface original, porque o Go não saberia escolher entre os dois. Segundo: sempre coloque um default. Se aparecer um tipo que você não esperava, é melhor logar ou retornar erro do que ignorar silenciosamente. Esse cuidado evita bugs misteriosos no futuro.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Inspeciona qualquer valor e descreve seu tipo.
func descrever(x any) {
	switch v := x.(type) {
	case int:
		fmt.Printf("inteiro %d (dobro: %d)\n", v, v*2)
	case string:
		fmt.Printf("string com %d caracteres: %q\n", len(v), v)
	case bool:
		fmt.Printf("booleano: %t\n", v)
	case nil:
		fmt.Println("valor nil")
	default:
		fmt.Printf("tipo desconhecido: %T\n", v)
	}
}

func main() {
	descrever(42)         // → inteiro 42 (dobro: 84)
	descrever("Olá")      // → string com 3 caracteres: "Olá"
	descrever(true)       // → booleano: true
	descrever(3.14)       // → tipo desconhecido: float64
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Caso real: processar diferentes formas de pagamento.
type Pix struct{ Chave string }
type Cartao struct{ Numero string; Bandeira string }
type Boleto struct{ Linha string }

func processar(p any) string {
	switch v := p.(type) {
	case Pix:
		return "Cobrando via Pix na chave " + v.Chave
	case Cartao:
		return "Autorizando " + v.Bandeira + " final " + v.Numero[len(v.Numero)-4:]
	case Boleto:
		return "Emitindo boleto " + v.Linha
	default:
		return fmt.Sprintf("forma de pagamento não suportada: %T", v)
	}
}

func main() {
	fmt.Println(processar(Pix{Chave: "ana@exemplo.com"}))
	fmt.Println(processar(Cartao{Numero: "1234567812345678", Bandeira: "Visa"}))
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Vários tipos no mesmo case: v vira do tipo da interface (any aqui).
func tamanho(x any) int {
	switch v := x.(type) {
	case string:
		return len(v)
	case []byte, []int, []float64:
		// aqui v é any; usamos reflect ou voltamos a fazer type assertion
		// para resolver. Em vez disso, separe em cases diferentes quando puder.
		return -1
	default:
		return 0
	}
}

func main() {
	fmt.Println(tamanho("texto"))         // → 5
	fmt.Println(tamanho([]byte{1, 2, 3})) // → -1
	fmt.Println(tamanho(42))              // → 0
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"errors"
	"fmt"
	"os"
)

// Type switch também aparece em tratamento de erros.
func explicar(err error) {
	switch e := err.(type) {
	case *os.PathError:
		fmt.Printf("Erro de caminho na operação %q em %q\n", e.Op, e.Path)
	case nil:
		fmt.Println("sem erro")
	default:
		fmt.Println("erro genérico:", e.Error())
	}
}

func main() {
	_, err := os.Open("/arquivo/que/nao/existe.txt")
	explicar(err)
	explicar(errors.New("falha simples"))
}`,
      },
    ],
    points: [
      "Use v := x.(type) só dentro de um switch; é a sintaxe oficial do type switch.",
      "Cada case com um único tipo dá a v exatamente aquele tipo, sem assertion extra.",
      "Cases com múltiplos tipos mantêm v como o tipo da interface original.",
      "Idiomático: incluir default para reagir a tipos não previstos em vez de ignorar.",
      "case nil: detecta interface nula sem precisar de comparação explícita.",
      "Armadilha: confundir type switch com switch comum e tentar usar v := x.(type) fora dele.",
      "Para um único tipo, prefira a forma v, ok := x.(T) em vez de um switch só com um case.",
    ],
    alerts: [
      {
        type: "info",
        content: "any é apenas um apelido moderno para interface{}, introduzido em Go 1.18. Os dois são intercambiáveis e funcionam igual em type switches.",
      },
      {
        type: "tip",
        content: "Para inspecionar erros tipados modernos, prefira errors.As(err, &alvo) em vez de type switch. É mais robusto porque desempacota erros embrulhados com fmt.Errorf %w.",
      },
      {
        type: "warning",
        content: "Type switch é poderoso, mas usar muito pode indicar que falta uma interface com métodos no seu desenho. Reflita se polimorfismo via interface não resolveria melhor.",
      },
    ],
  },
  {
    slug: "for-loop",
    section: "controle",
    title: "For: o único laço de Go",
    difficulty: "iniciante",
    subtitle: "Sem while, sem do-while, sem foreach: tudo se faz com for em três variantes",
    intro: `Em Go existe apenas um laço: o for. Não há while, não há do-while, não há repeat-until. Essa decisão minimalista assusta no começo, mas você logo percebe que o for de Go consegue fazer tudo o que essas três palavras-chave fariam, e ainda fica mais consistente para ler.

A forma clássica é parecida com a de C ou Java: for inicialização; condição; pós { ... }. Você inicializa um contador, define uma condição de parada e diz como o contador avança a cada iteração. Esse formato é perfeito para iterar uma quantidade conhecida de vezes, como percorrer índices de um slice ou repetir uma operação N vezes.

A segunda forma usa só a condição: for x < 10 { ... }. É exatamente o que outras linguagens chamam de while. Ótimo para "continue até alguma coisa acontecer" — ler linhas de um arquivo até o fim, processar mensagens enquanto a fila tem itens, tentar reconectar até dar certo.

A terceira é o laço infinito: for { ... } sem cláusulas. Use em servidores que ficam recebendo requisições, em consumidores de canal que rodam até receberem um sinal de parada, ou em qualquer loop de evento. A saída é controlada com break ou return de dentro do corpo. Não tem mistério: é a mesma ideia do while(true) de outras linguagens, só que mais curto.

Existe ainda a forma for k, v := range coleção { ... }, que é tão importante que tem capítulo só para ela no próximo. Por enquanto, foque nas três formas básicas. Uma dica idiomática: nomeie variáveis de contador como i, j, k apenas em laços muito curtos. Em laços que fazem coisa de verdade, use nomes que digam o que está sendo iterado, como pedido, linha, tentativa.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Forma clássica: imprime números de 1 a 5.
func main() {
	for i := 1; i <= 5; i++ {
		fmt.Println("número", i)
	}
	// → saída:
	// número 1
	// número 2
	// ...
	// número 5
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Forma "while": continua enquanto saldo for positivo.
func main() {
	saldo := 1000.0
	mes := 0
	for saldo > 0 {
		saldo -= 250 // saque mensal
		mes++
	}
	fmt.Printf("Conta zerou no mês %d (saldo final: %.2f)\n", mes, saldo)
	// → saída: Conta zerou no mês 4 (saldo final: 0.00)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Laço infinito controlado: imprime hora a cada segundo, para na hora cheia.
func main() {
	for {
		agora := time.Now()
		if agora.Minute() == 0 && agora.Second() == 0 {
			fmt.Println("Bateu a hora cheia, encerrando.")
			break
		}
		fmt.Println("hora atual:", agora.Format("15:04:05"))
		time.Sleep(time.Second)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// for clássico para somar valores de um slice.
func main() {
	precos := []float64{19.90, 5.50, 12.00, 8.75}
	var total float64
	for i := 0; i < len(precos); i++ {
		total += precos[i]
	}
	fmt.Printf("Total do carrinho: R$%.2f\n", total)
	// → saída: Total do carrinho: R$46.15
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Você pode omitir partes do for clássico, conforme a necessidade.
func main() {
	i := 0
	for ; i < 3; i++ { // sem inicialização, com condição e pós
		fmt.Println("fase", i)
	}

	j := 5
	for j > 0 { // só condição: virou um while
		fmt.Println("contagem regressiva:", j)
		j--
	}
}`,
      },
    ],
    points: [
      "Go tem só for. Tudo (while, do-while, infinito) é uma variante dele.",
      "Sem parênteses na condição; chaves obrigatórias.",
      "for { } é o laço infinito; controle a saída com break ou return.",
      "Idiomático: i, j para contadores curtos; nomes descritivos para laços que fazem trabalho real.",
      "Você pode omitir cláusulas: for ; cond ; { } e for cond { } são válidos.",
      "Armadilha: usar laço infinito sem condição de saída clara e travar o programa.",
      "Use len(slice) na condição apenas se o tamanho não muda dentro do laço.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando estiver iterando coleções, prefira a forma for range (próximo capítulo) à forma com índice manual. Ela é mais segura, mais legível e idiomática.",
      },
      {
        type: "warning",
        content: "Cuidado ao modificar a coleção que está sendo iterada num for clássico, especialmente removendo elementos. Você pode pular itens ou estourar o índice sem perceber.",
      },
      {
        type: "info",
        content: "Não existe do-while em Go. Para garantir pelo menos uma execução, use for com break no fim, ou estruture sua função para chamar o corpo uma vez antes do laço.",
      },
    ],
  },
  {
    slug: "for-range",
    section: "controle",
    title: "For range: iterando coleções",
    difficulty: "iniciante",
    subtitle: "A forma idiomática de percorrer slices, maps, strings, canais e até inteiros em Go 1.22+",
    intro: `O for range é o jeito idiomático de percorrer qualquer coisa iterável em Go: arrays, slices, maps, strings, canais e, desde Go 1.22, até números inteiros. Ele é mais seguro que o for clássico com índice manual, porque elimina as duas armadilhas mais comuns: errar o limite (off-by-one) e modificar o índice por engano.

A sintaxe geral é for k, v := range coleção { ... }. O significado de k e v depende do que você está iterando. Em slices e arrays, k é o índice (int) e v é uma cópia do valor naquele índice. Em maps, k é a chave e v é o valor; mas atenção, a ordem de iteração de maps em Go é deliberadamente aleatória — não conte com nenhuma sequência. Em strings, k é o índice em bytes e v é o rune (caractere unicode), o que faz toda a diferença para textos com acentos ou emojis. Em canais, há apenas uma variável, que recebe cada valor enviado até o canal ser fechado.

Você pode descartar valores que não usa colocando um sublinhado: for _, v := range slice { ... } ou for i := range slice { ... }. Se quiser apenas executar o laço N vezes, sem usar o valor, em Go 1.22+ você pode escrever for i := range 10 { ... } — uma das adições mais queridas da versão. Antes disso, era preciso usar for i := 0; i < 10; i++.

Um ponto crucial é que, até Go 1.21, a variável v era reutilizada entre iterações, o que causava bugs sutis quando você capturava ela em closures (por exemplo, em goroutines dentro do laço). A partir de Go 1.22, cada iteração tem sua própria cópia de v, e esse problema clássico foi resolvido. Mesmo assim, vale conhecer o comportamento antigo, porque você ainda vai esbarrar em código legado e até em explicações antigas pela internet.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// for range em slice: recebe índice e cópia do valor.
func main() {
	produtos := []string{"café", "pão", "leite"}
	for i, p := range produtos {
		fmt.Printf("%d: %s\n", i, p)
	}
	// → saída:
	// 0: café
	// 1: pão
	// 2: leite
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// for range em map: ordem é ALEATÓRIA, não confie em sequência.
func main() {
	estoque := map[string]int{
		"camiseta": 12,
		"calça":    5,
		"meia":     30,
	}
	for produto, qtd := range estoque {
		fmt.Printf("%s: %d unidades\n", produto, qtd)
	}
	// A ordem da saída pode mudar a cada execução!
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// for range em string: percorre RUNES, não bytes.
// Isso é fundamental para textos com acentos e emojis.
func main() {
	frase := "Olá 🌎"
	for i, r := range frase {
		fmt.Printf("byte %d: rune %q (código %d)\n", i, r, r)
	}
	// → saída:
	// byte 0: rune 'O' (código 79)
	// byte 1: rune 'l' (código 108)
	// byte 2: rune 'á' (código 225)
	// byte 4: rune ' ' (código 32)
	// byte 5: rune '🌎' (código 127758)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// for range em canal: lê até o canal ser fechado.
func main() {
	pedidos := make(chan string, 3)
	pedidos <- "pizza"
	pedidos <- "refri"
	pedidos <- "sobremesa"
	close(pedidos) // sem o close, o range trava esperando mais valores

	for item := range pedidos {
		fmt.Println("preparando:", item)
	}
	// → saída:
	// preparando: pizza
	// preparando: refri
	// preparando: sobremesa
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Go 1.22+: range sobre int. Repete N vezes sem precisar de contador clássico.
func main() {
	for i := range 5 {
		fmt.Println("tentativa", i+1)
	}
	// → saída:
	// tentativa 1
	// tentativa 2
	// tentativa 3
	// tentativa 4
	// tentativa 5
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Descartando valores: use _ para o que não interessa.
func main() {
	notas := []float64{8.5, 7.0, 9.2, 6.8}

	var soma float64
	for _, nota := range notas { // não preciso do índice
		soma += nota
	}
	fmt.Printf("Média: %.2f\n", soma/float64(len(notas)))
	// → saída: Média: 7.88
}`,
      },
    ],
    points: [
      "for range é a forma idiomática para percorrer qualquer coleção em Go.",
      "Em slice/array: índice + cópia do valor. Em map: chave + valor (ordem aleatória).",
      "Em string: índice em bytes + rune (não byte!). Essencial para Unicode correto.",
      "Em canal: um único valor por iteração; o laço termina quando o canal é fechado.",
      "Idiomático: usar _ para descartar índice ou valor que você não vai usar.",
      "Go 1.22+: for i := range N percorre 0..N-1, ótimo para repetir N vezes.",
      "Armadilha: contar com a ordem de iteração de map. Ela é embaralhada de propósito.",
      "Em Go 1.22+, cada iteração tem sua própria variável; antes era reutilizada (causava bugs com goroutines).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Iterar uma string com índice clássico (s[i]) devolve bytes, não runes. Para texto Unicode, use sempre for range, ou cuidado ao quebrar caracteres multibyte ao meio.",
      },
      {
        type: "tip",
        content: "Quando precisar dos itens em ordem fixa de um map, extraia as chaves para um slice, ordene com slices.Sort e itere o slice. Não tente forçar ordem dentro do range.",
      },
      {
        type: "info",
        content: "Em Go 1.23+, for range também aceita funções iteradoras (range over func). É a base do novo pacote iter e abre caminho para iteração customizada idiomática.",
      },
      {
        type: "success",
        content: "A mudança de escopo das variáveis de range em Go 1.22 eliminou um dos bugs mais comuns da linguagem. Se você usa Go moderno, pode capturar v em goroutines sem medo.",
      },
    ],
  },
  {
    slug: "break-continue-labels",
    section: "controle",
    title: "Break, continue e labels",
    difficulty: "intermediario",
    subtitle: "Saindo cedo, pulando iterações e controlando laços aninhados com rótulos",
    intro: `Dentro de qualquer laço, duas palavras-chave básicas alteram o fluxo: break interrompe imediatamente o laço atual; continue salta para a próxima iteração, pulando o restante do corpo. Elas existem em todas as linguagens populares e funcionam aqui como você já espera. Em Go, valem dentro de for, switch e select.

Onde Go traz algo a mais é nos labels. Quando você tem dois ou mais laços aninhados e quer quebrar o de fora, em outras linguagens você costuma usar uma variável booleana de controle ou refatorar o código para uma função separada que retorna cedo. Em Go, você pode rotular um laço com um nome seguido de dois pontos e usar break nome ou continue nome para apontar exatamente qual laço quer afetar. É um recurso que parece exótico, mas resolve com elegância um problema real.

Labels também são o que dão poder real ao continue dentro de switch. Lembre-se: dentro de um switch, um break sem rótulo sai do switch, não do laço externo. Então, se o switch está dentro de um for e você quer ir para a próxima iteração do for, precisa de continue. Se quer sair do for inteiro de dentro do switch, precisa de break com rótulo. Esse detalhe pega muita gente desprevenida.

Use labels com parcimônia. Eles são a alternativa estruturada ao goto, mas o uso excessivo torna o código difícil de seguir. A regra prática é: se um label deixa claro a intenção e elimina uma flag artificial, use. Se ele aparece para "salvar" uma estrutura mal pensada, refatore para uma função e use return.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// continue: pula valores negativos; break: para no primeiro maior que 100.
func main() {
	valores := []int{-5, 10, -2, 50, 120, 30}
	soma := 0
	for _, v := range valores {
		if v < 0 {
			continue
		}
		if v > 100 {
			break
		}
		soma += v
	}
	fmt.Println("soma:", soma)
	// → saída: soma: 60   (10 + 50, parou ao ver 120)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Labels: encontrar o primeiro par (i, j) cuja soma é 10 em duas slices.
func main() {
	a := []int{1, 3, 5, 7}
	b := []int{2, 4, 6, 8}

OUTER:
	for i, x := range a {
		for j, y := range b {
			if x+y == 10 {
				fmt.Printf("encontrado em a[%d]=%d, b[%d]=%d\n", i, x, j, y)
				break OUTER // sai dos DOIS laços de uma vez
			}
		}
	}
	// → saída: encontrado em a[1]=3, b[2]=6
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// continue com label: pula para a próxima linha quando encontra zero na coluna.
func main() {
	matriz := [][]int{
		{1, 2, 3},
		{4, 0, 6},
		{7, 8, 9},
	}

LINHAS:
	for i, linha := range matriz {
		soma := 0
		for _, n := range linha {
			if n == 0 {
				fmt.Printf("linha %d tem zero, pulando\n", i)
				continue LINHAS
			}
			soma += n
		}
		fmt.Printf("soma da linha %d = %d\n", i, soma)
	}
	// → saída:
	// soma da linha 0 = 6
	// linha 1 tem zero, pulando
	// soma da linha 2 = 24
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Pegadinha clássica: break dentro de switch sai só do switch.
// Para sair do for de fora, precisa de label.
func main() {
	itens := []string{"ok", "ok", "ERRO", "ok"}

LOOP:
	for i, x := range itens {
		switch x {
		case "ok":
			fmt.Println("processando", i)
		case "ERRO":
			fmt.Println("falha em", i, "- abortando")
			break LOOP // sem o label, sairia só do switch
		}
	}
	fmt.Println("fim")
}`,
      },
    ],
    points: [
      "break sai do laço/switch/select mais interno; continue vai para a próxima iteração.",
      "Labels permitem direcionar break ou continue para um laço externo específico.",
      "Idiomático: rotular o laço de fora com nome em MAIÚSCULAS ou descritivo facilita a leitura.",
      "break dentro de switch sai do switch, não do for que o envolve. Cuidado!",
      "continue só faz sentido dentro de for; em switch ele afeta o for que rotularmos.",
      "Armadilha: criar variável booleana 'saiu' para escapar de laços aninhados; use label.",
      "Use labels com moderação; muitos rótulos podem ser sinal para extrair uma função.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando precisar quebrar dois ou mais laços, considere extrair o trabalho para uma função e usar return. Costuma ficar mais legível que vários labels.",
      },
      {
        type: "warning",
        content: "Não confunda break dentro de switch com break do for que o contém. Em Go, break sempre afeta a estrutura mais interna, a não ser que você dê um label.",
      },
      {
        type: "info",
        content: "Labels também valem para select (a estrutura usada com canais). É comum vê-los em loops de servidor que precisam encerrar limpo ao receber um sinal.",
      },
    ],
  },
  {
    slug: "goto",
    section: "controle",
    title: "Goto: o último recurso",
    difficulty: "avancado",
    subtitle: "Existe, sim, em Go — e tem alguns poucos casos legítimos onde ele faz sentido",
    intro: `Sim, Go tem goto. E não, você quase nunca deve usar. Mas é importante entender por que ele existe, em que casos ele aparece em código de verdade e quais são as restrições, porque eventualmente você vai esbarrar com ele lendo a biblioteca padrão ou bases legadas.

Goto pula para um label dentro da mesma função. Ele não pode pular para fora da função, não pode pular para dentro de um bloco que tenha variáveis ainda não declaradas no fluxo natural, e não pode pular sobre uma declaração de variável. Essas regras existem para evitar os pesadelos clássicos do goto em C, onde você acabava com escopos confusos e variáveis em estado indefinido.

Os casos onde goto ainda é defensável em Go geralmente envolvem três situações: máquinas de estado complexas em parsers e compiladores; loops com várias condições de saída e cleanup compartilhado; e geração de código automatizada onde a estrutura natural do programa de origem casa melhor com goto do que com laços de Go. A própria standard library usa goto em alguns parsers para clareza. Se você vê goto em código de aplicação comum, geralmente é cheiro de design ruim.

Por que aprender, então? Porque uma das marcas de um bom programador é conhecer ferramentas que existem para casos específicos, mesmo que use raramente. E porque defer, break com label e funções pequenas resolvem 99% do que goto faria. Saber disso ajuda você a fazer revisão de código com confiança.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Exemplo didático: tentar conectar três vezes; goto faz "retry".
func main() {
	tentativa := 0
RETRY:
	tentativa++
	fmt.Println("tentando conectar... tentativa", tentativa)
	if tentativa < 3 {
		goto RETRY
	}
	fmt.Println("desistindo após", tentativa, "tentativas")
	// → saída:
	// tentando conectar... tentativa 1
	// tentando conectar... tentativa 2
	// tentando conectar... tentativa 3
	// desistindo após 3 tentativas
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// O mesmo problema RESOLVIDO IDIOMATICAMENTE com for.
// Prefira esta versão: é mais clara e sem goto.
func main() {
	for tentativa := 1; tentativa <= 3; tentativa++ {
		fmt.Println("tentando conectar... tentativa", tentativa)
	}
	fmt.Println("desistindo")
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Caso onde goto pode ser legítimo: cleanup centralizado em
// função procedural com várias condições de erro.
// Mesmo aqui, prefira defer.
func processar(x int) error {
	if x < 0 {
		goto erro
	}
	if x > 100 {
		goto erro
	}
	fmt.Println("processou", x)
	return nil

erro:
	fmt.Println("valor inválido:", x)
	return fmt.Errorf("inválido: %d", x)
}

func main() {
	processar(50)   // → processou 50
	processar(-1)   // → valor inválido: -1
}`,
      },
      {
        lang: "go",
        code: `package main

// Restrições do goto: este código NÃO compila.
// O comentário mostra o erro que o compilador retorna.
//
// func main() {
//     goto pular
//     x := 10        // declaração entre goto e label
// pular:
//     fmt.Println(x) // erro: jumps over declaration of x
// }
//
// Lição: goto em Go é restrito justamente para evitar
// problemas clássicos de escopo do C.`,
      },
    ],
    points: [
      "goto existe em Go, mas o uso correto é raro; quase tudo é melhor com for, defer, switch ou função.",
      "Só pode pular para um label da mesma função; não atravessa funções nem pacotes.",
      "Não pode pular sobre declarações de variáveis ou para dentro de blocos novos.",
      "Idiomático: substituir goto por for com break/continue ou por funções pequenas com return.",
      "Casos defensáveis: máquinas de estado em parsers, código gerado, alguns loops complexos.",
      "Armadilha: usar goto para 'simplificar' lógica e na prática deixar o fluxo intratável.",
      "Aprender goto serve mais para reconhecê-lo em código alheio do que para escrever no seu.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Em quase 100% dos casos onde você pensa em usar goto, existe uma solução mais limpa com defer, return cedo ou break com label. Considere refatorar antes.",
      },
      {
        type: "info",
        content: "A própria biblioteca padrão de Go usa goto em alguns parsers de baixo nível. É um sinal de que o recurso tem lugar, mas em situações muito específicas.",
      },
      {
        type: "danger",
        content: "Nunca use goto para criar laços manuais quando um for resolve. Você perde clareza, perde garantias de escopo e ganha um bug em potencial sem retorno.",
      },
    ],
  },
  {
    slug: "defer-fluxo",
    section: "controle",
    title: "Defer: garantindo cleanup no fluxo",
    difficulty: "intermediario",
    subtitle: "Adiando execução até o fim da função, na ordem LIFO, com avaliação imediata dos argumentos",
    intro: `defer é uma das palavras-chave mais geniais de Go. Você marca uma chamada de função para rodar somente quando a função atual terminar, seja por return normal, por panic, ou por chegar ao fim. É a forma idiomática de garantir que recursos sejam liberados mesmo quando algo dá errado no meio do caminho — fechar arquivos, soltar locks, fechar conexões de banco, enviar métricas finais.

A ordem de execução dos defers é LIFO (último a entrar, primeiro a sair). Se você fizer defer A(); defer B(); defer C(), a saída ao terminar a função executará C, depois B, depois A. Pense numa pilha de pratos: você empilha do primeiro para o último, mas tira do último para o primeiro. Isso é importante porque deixa cleanup aninhado funcionar naturalmente: você abre arquivo A, defer fecha A; abre B (que depende de A), defer fecha B. Quando der ruim, B é fechado antes de A, na ordem correta.

Outro ponto fundamental: os argumentos do defer são avaliados na hora em que o defer é declarado, não quando a função é executada. Isso pega muita gente. Se você escreve defer fmt.Println(x) e depois muda x, a chamada vai usar o valor antigo. Se quiser o valor atualizado, embrulhe em uma função anônima: defer func() { fmt.Println(x) }(). Esse detalhe é responsável por muitos bugs sutis em código que loga valores no fim.

defer afeta o fluxo de controle de uma forma marcante: ele se sobrepõe a panic. Mesmo se sua função entrar em pânico, todos os defers ainda rodam. É essa mecânica que permite recover() funcionar — ele só faz sentido dentro de uma função adiada com defer. E como bônus, defer pode até modificar o valor de retorno se você usar named return values, técnica útil para padronizar tratamento de erros em funções grandes.

Use defer logo depois de adquirir o recurso. Esse hábito (abrir arquivo, defer Close imediatamente) elimina a maior parte dos vazamentos. É simples, é seguro e é a marca de código Go bem escrito.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// defer roda no fim da função. Ordem é LIFO.
func main() {
	defer fmt.Println("primeiro defer (rodará por último)")
	defer fmt.Println("segundo defer")
	defer fmt.Println("terceiro defer (rodará primeiro)")
	fmt.Println("corpo da main")
	// → saída:
	// corpo da main
	// terceiro defer (rodará primeiro)
	// segundo defer
	// primeiro defer (rodará por último)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
)

// Padrão clássico: abrir, defer fechar logo em seguida.
// Mesmo se ler() der erro, o arquivo é fechado.
func ler(caminho string) error {
	f, err := os.Open(caminho)
	if err != nil {
		return err
	}
	defer f.Close() // garante fechamento

	buf := make([]byte, 100)
	n, err := f.Read(buf)
	if err != nil {
		return err
	}
	fmt.Printf("li %d bytes: %s\n", n, buf[:n])
	return nil
}

func main() {
	if err := ler("/etc/hostname"); err != nil {
		fmt.Println("erro:", err)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Pegadinha: argumentos do defer são avaliados na hora do defer.
func main() {
	x := 10
	defer fmt.Println("valor congelado:", x) // captura 10 agora

	x = 99
	defer func() {
		fmt.Println("valor atual:", x) // captura por closure: vê 99
	}()

	x = 42
	// → saída:
	// valor atual: 42
	// valor congelado: 10
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// defer + recover: a forma idiomática de proteger uma função de panic.
func executarSeguro() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("recuperado de:", r)
		}
	}()
	panic("algo deu muito errado")
}

func main() {
	executarSeguro()
	fmt.Println("programa continua normalmente")
	// → saída:
	// recuperado de: algo deu muito errado
	// programa continua normalmente
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// defer com named return: pode modificar o valor de retorno.
func dividir(a, b int) (resultado int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("erro recuperado: %v", r)
		}
	}()
	return a / b, nil
}

func main() {
	r, err := dividir(10, 0)
	fmt.Println("resultado:", r, "erro:", err)
	// → saída: resultado: 0 erro: erro recuperado: runtime error: integer divide by zero
}`,
      },
    ],
    points: [
      "defer adia uma chamada para o fim da função, mesmo em caso de panic.",
      "A ordem de execução é LIFO: o último defer registrado roda primeiro.",
      "Argumentos do defer são avaliados imediatamente; embrulhe em closure para valor dinâmico.",
      "Idiomático: declare defer Close() logo depois de abrir o recurso.",
      "Combine defer com recover() para proteger funções de panic em pontos críticos.",
      "Em named return values, defer pode alterar o valor retornado pela função.",
      "Armadilha: colocar defer dentro de loop e acumular milhares pendentes até a função sair.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre que abrir um arquivo, conexão ou lock, escreva o defer de fechamento na linha seguinte. Esse hábito elimina a maioria dos vazamentos de recurso.",
      },
      {
        type: "warning",
        content: "defer dentro de for pode acumular milhares de chamadas pendentes até a função terminar. Se o laço é longo, refatore para uma função interna que possa retornar entre iterações.",
      },
      {
        type: "info",
        content: "defer tem um pequeno custo de runtime (alocação na pilha de defers). Em caminhos extremamente quentes, vale medir; em código normal, o ganho de clareza compensa demais.",
      },
      {
        type: "success",
        content: "A combinação defer + recover + named returns é a forma idiomática de transformar panics inesperados em errors retornáveis, sem deixar a função vazar contexto.",
      },
    ],
  },
  {
    slug: "return-multiplos",
    section: "controle",
    title: "Múltiplos returns e named returns",
    difficulty: "intermediario",
    subtitle: "Devolvendo valor e erro juntos, ignorando com underscore e usando named values com cuidado",
    intro: `Em Go, uma função pode retornar mais de um valor. Esse é um dos pilares do design da linguagem e o que viabiliza o famoso padrão (resultado, erro). Em vez de jogar exceções como Java ou Python, Go espera que você retorne o erro como um segundo valor e que o chamador o trate explicitamente. Isso pode parecer verboso no começo, mas torna o caminho do erro visível em cada chamada.

A sintaxe é direta: func dividir(a, b int) (int, error) { ... }. No corpo, você escreve return resultado, nil em caso de sucesso, ou return 0, erro em caso de falha. No chamador, recebe os dois valores e checa o erro: r, err := dividir(10, 2); if err != nil { ... }. Você pode descartar valores que não interessam usando o sublinhado: _, err := dividir(10, 0). E pode descartar todos os retornos chamando a função sem atribuição, mas isso é raro quando há erro envolvido.

Existe também o named return values: você dá nomes aos retornos na assinatura, e eles funcionam como variáveis pré-declaradas dentro da função, com valor zero do tipo. No final, basta usar return sozinho (chamado naked return) para devolver os valores atuais dessas variáveis. É útil para documentar o significado de cada retorno e para que defers possam modificar o valor retornado, especialmente em padrões com recover. Mas tome cuidado: usar named returns em funções longas torna o fluxo confuso. A regra prática é: use em funções curtas e quando o nome agrega clareza ou quando você precisa do efeito sobre defer.

Não há limite oficial para quantos valores uma função retorna, mas três já é bastante. Se você sente vontade de retornar quatro ou cinco, considere agrupar tudo em um struct. Isso comunica melhor o que você está devolvendo, evita confusão de ordem na hora de ler o chamador e facilita a evolução da API sem quebrar o mundo.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"errors"
	"fmt"
)

// Padrão clássico: (resultado, erro).
func dividir(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("divisão por zero")
	}
	return a / b, nil
}

func main() {
	if r, err := dividir(10, 2); err != nil {
		fmt.Println("erro:", err)
	} else {
		fmt.Println("resultado:", r)
	}
	// → saída: resultado: 5
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Mais de dois retornos: minMaxMedia. Ainda legível.
func estatisticas(valores []float64) (min, max, media float64) {
	if len(valores) == 0 {
		return 0, 0, 0
	}
	min, max = valores[0], valores[0]
	soma := 0.0
	for _, v := range valores {
		if v < min {
			min = v
		}
		if v > max {
			max = v
		}
		soma += v
	}
	media = soma / float64(len(valores))
	return // naked return: usa min, max, media já preenchidos
}

func main() {
	mn, mx, md := estatisticas([]float64{4, 8, 15, 16, 23, 42})
	fmt.Printf("min=%.1f max=%.1f média=%.2f\n", mn, mx, md)
	// → saída: min=4.0 max=42.0 média=18.00
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"strconv"
)

// Descartando valores com _: só me interessa o erro.
func main() {
	_, err := strconv.Atoi("abc")
	if err != nil {
		fmt.Println("não era número:", err)
	}
	// → saída: não era número: strconv.Atoi: parsing "abc": invalid syntax
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Quando os retornos viram muitos, prefira um struct.
type ResumoConta struct {
	Saldo       float64
	Movimentos  int
	UltimoValor float64
	Status      string
}

func resumir(transacoes []float64) ResumoConta {
	r := ResumoConta{Status: "ok"}
	for _, t := range transacoes {
		r.Saldo += t
		r.UltimoValor = t
		r.Movimentos++
	}
	if r.Saldo < 0 {
		r.Status = "negativo"
	}
	return r
}

func main() {
	r := resumir([]float64{100, -30, -80})
	fmt.Printf("%+v\n", r)
	// → saída: {Saldo:-10 Movimentos:3 UltimoValor:-80 Status:negativo}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Named returns + defer para padronizar tratamento.
func calcular(a, b int) (resultado int, err error) {
	defer func() {
		if err != nil {
			fmt.Println("log: operação falhou com", err)
		}
	}()
	if b < 0 {
		err = fmt.Errorf("b negativo: %d", b)
		return
	}
	resultado = a + b
	return
}

func main() {
	calcular(3, 4)   // → silêncio (sucesso)
	calcular(1, -1)  // → log: operação falhou com b negativo: -1
}`,
      },
    ],
    points: [
      "Go retorna múltiplos valores nativamente; o padrão (valor, error) é a base de quase tudo.",
      "Use _ para descartar valores que não interessam, principalmente em conversões e parsers.",
      "Idiomático: tratar o erro logo após a chamada, antes de seguir usando o valor retornado.",
      "Named returns documentam o que cada valor significa e habilitam naked return.",
      "Naked return é seguro em funções curtas; em funções longas confunde mais do que ajuda.",
      "Se aparecem 4+ retornos, prefira agrupar num struct para clareza e evolução.",
      "Armadilha: ignorar o erro com _, err não tratado e descobrir o bug em produção.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Nunca descarte um erro silenciosamente com _. Se realmente não pode tratar, ao menos logue. Erros ignorados são uma das principais fontes de bugs em Go.",
      },
      {
        type: "tip",
        content: "Quando precisar retornar mais de três valores, pare e pergunte se um struct nomeado não comunicaria melhor. A resposta quase sempre é sim.",
      },
      {
        type: "info",
        content: "Em named returns, as variáveis começam com o valor zero do tipo (0, '', nil, struct vazio). Você não precisa inicializar antes de usar dentro do corpo.",
      },
    ],
  },
  {
    slug: "expression-statements",
    section: "controle",
    title: "Statements vs expressions",
    difficulty: "avancado",
    subtitle: "Por que i++ não vale dentro de fmt.Println e outras consequências dessa separação rígida",
    intro: `Algumas linguagens (Python, Ruby, Rust) borram a fronteira entre expressões e statements. Em Rust, por exemplo, um if pode ser usado dentro de uma atribuição (let x = if cond { 1 } else { 2 }). Em Python, list comprehensions usam if expression. Em Go, a separação é clara e deliberada: certas construções são statements (instruções) e não devolvem valor; outras são expressions (expressões) e podem aparecer onde se espera um valor. Misturar os dois mundos não compila, e isso vira fonte de surpresa para quem chega de outras linguagens.

Os exemplos clássicos: i++ e i-- são statements em Go, não expressions. Você não pode escrever a := i++ ou fmt.Println(i++). Tem de incrementar numa linha separada e usar i depois. Atribuição (a = b) também é statement: você não pode encadear x = y = z = 0 como em C. Cada atribuição é uma instrução isolada (mas você pode usar atribuição múltipla: a, b = 1, 2, que é diferente).

if, for e switch são todos statements; nenhum devolve valor. Você não escreve x := if cond { 1 } else { 2 }. Para esse efeito, declare x antes e atribua dentro do if; ou faça uma função pequena que retorna o valor. Funções, por outro lado, são expressions quando chamadas: você usa func() { ... }() dentro de outra expressão tranquilamente, especialmente em defers e em testes.

Essa rigidez tem um lado bom: você sabe sempre, ao bater os olhos, o que é instrução e o que produz valor. Sem efeitos colaterais escondidos em expressões. A leitura do código fica mais previsível, e bugs sutis (como atribuir quando se queria comparar) são caçados pelo compilador. O lado custoso é precisar escrever umas linhas a mais aqui e ali. Para a comunidade Go, é um custo aceitável em troca de clareza.

Saber dessa distinção também ajuda a entender mensagens de erro. Quando o compilador diz "expected expression, found ++", agora você sabe: usou um statement num lugar onde só expressão é aceita. E quando vê uma função anônima imediatamente invocada, lembra que é o jeito clássico de transformar um pequeno bloco de instruções em algo que devolve valor.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// i++ é statement, não expression. Esses NÃO compilam:
//   x := i++
//   fmt.Println(i++)
//
// Forma correta:
func main() {
	i := 0
	i++
	fmt.Println(i) // → 1
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// if não é expression. Use uma variável + atribuição.
func main() {
	idade := 17

	var categoria string
	if idade >= 18 {
		categoria = "adulto"
	} else {
		categoria = "menor"
	}
	fmt.Println(categoria) // → menor
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função anônima imediatamente invocada (IIFE) cria uma "expressão"
// a partir de várias instruções. Útil quando você precisa de um valor.
func main() {
	categoria := func(idade int) string {
		if idade >= 18 {
			return "adulto"
		}
		return "menor"
	}(17)

	fmt.Println(categoria) // → menor
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Atribuição múltipla é uma forma especial de statement,
// mas NÃO é o mesmo que encadear atribuições.
func main() {
	a, b, c := 1, 2, 3                  // múltipla declaração: ok
	a, b = b, a                         // troca elegante: ok
	fmt.Println(a, b, c)                // → 2 1 3

	// Encadear NÃO funciona em Go:
	// x = y = z = 0   // erro de compilação
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Chamadas de função SÃO expressões: podem aparecer onde valor é esperado.
func dobro(n int) int { return n * 2 }

func main() {
	total := dobro(5) + dobro(10)        // expressões compostas
	fmt.Println("total:", total)         // → total: 30

	// E podem ser usadas em defer (a chamada é a expressão).
	defer fmt.Println("até logo")
	fmt.Println("oi")
}`,
      },
      {
        lang: "go",
        code: `package main

// Erros típicos do compilador relacionados à separação statement/expression:
//
//   syntax error: unexpected ++, expecting expression
//     → você usou i++ dentro de uma expressão.
//
//   non-name x on left side of :=
//     → você tentou usar uma expressão complexa onde precisava de um nome.
//
//   cannot use if statement as expression
//     → você tentou x := if ... { ... } else { ... }.
//
// A correção é sempre quebrar em mais de uma linha
// ou embrulhar em uma função que devolva o valor.`,
      },
    ],
    points: [
      "Em Go, statement (instrução) e expression (expressão) são coisas separadas e não se misturam.",
      "i++ e i-- são statements; não use dentro de prints, atribuições ou condições.",
      "if, for, switch e select são statements; nenhum devolve valor diretamente.",
      "Idiomático: para transformar bloco de instruções em valor, use IIFE (função anônima invocada).",
      "Atribuição é statement; encadear x = y = z = 0 não compila. Use múltipla declaração.",
      "Chamadas de função são expressões: podem aparecer dentro de outras expressões livremente.",
      "Armadilha: vir de Rust ou Python esperando que if devolva valor e levar erro de compilação.",
    ],
    alerts: [
      {
        type: "info",
        content: "A separação rígida entre statement e expression é uma escolha de design para evitar efeitos colaterais escondidos e erros sutis como atribuir dentro de comparação por engano.",
      },
      {
        type: "tip",
        content: "Quando precisar do valor de um if grande, extraia para uma função com nome descritivo. Fica mais fácil de testar e de ler do que truques com IIFE.",
      },
      {
        type: "warning",
        content: "Mensagens como 'expected expression, found ++' quase sempre indicam mistura de statement com expression. Identificar isso rapidamente economiza minutos de busca.",
      },
    ],
  },
];
