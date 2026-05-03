import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "arrays",
    section: "estruturas",
    title: "Arrays: tamanho fixo e cópia por valor",
    difficulty: "iniciante",
    subtitle: "O bloco de memória mais primitivo do Go, com tamanho que faz parte do tipo",
    intro: `Quando você ouve a palavra array em outras linguagens, costuma pensar em algo flexível: a list do Python, o array do JavaScript ou o ArrayList do Java aceitam crescer e diminuir à vontade. Em Go, o array é o oposto disso. Ele é uma sequência de elementos do mesmo tipo, com tamanho fixo definido em tempo de compilação. Pense em uma cartela de remédio: cada espaço já vem moldado, você não consegue arrancar um e enfiar outro do nada.

O detalhe que confunde muito iniciante é que, em Go, o tamanho faz parte do tipo. Um [3]int é um tipo diferente de [4]int. Você não pode atribuir um ao outro nem passar como se fossem a mesma coisa. Isso parece chato, mas tem uma motivação: arrays em Go são valores, não ponteiros. Quando você passa um array para uma função, o Go copia o array inteiro. Se ele tem 1000 elementos, são 1000 cópias. Isso é diferente de C (onde array decai para ponteiro) e de Java (onde array é referência).

Por causa dessa rigidez, na prática você quase nunca usa arrays diretamente no código do dia a dia. O que você usa o tempo todo é slice, que é uma estrutura mais flexível construída por cima de array. Mas entender o array é fundamental, porque o slice é só uma janela apontando para um array por baixo dos panos. Se você não entende o esqueleto, vai ficar perdido quando começar a falar de capacidade, compartilhamento de memória e copy.

Use array de propósito quando o tamanho é genuinamente fixo e você quer comparação por valor (sim, arrays do mesmo tipo se comparam com ==), uso como chave de map ou desempenho cravado sem alocação no heap. Para o resto da vida, slice resolve.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Declaração explícita: array de 3 inteiros, todos zerados.
	var notas [3]float64
	fmt.Println(notas) // → [0 0 0]

	// Atribuindo por índice (começa em 0).
	notas[0] = 8.5
	notas[1] = 7.0
	notas[2] = 9.2
	fmt.Println(notas) // → [8.5 7 9.2]

	// len devolve o tamanho fixo do array.
	fmt.Println("quantidade:", len(notas)) // → quantidade: 3
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Literal de array com valores já definidos.
	dias := [7]string{"seg", "ter", "qua", "qui", "sex", "sab", "dom"}

	// O ... pede para o compilador contar quantos elementos existem.
	cores := [...]string{"vermelho", "verde", "azul"}

	fmt.Println(dias[0], dias[6]) // → seg dom
	fmt.Printf("cores tem tipo %T\n", cores) // → cores tem tipo [3]string
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Atenção: o tamanho FAZ PARTE do tipo.
// Esta função só aceita array de exatamente 3 inteiros.
func somar(v [3]int) int {
	total := 0
	for _, n := range v {
		total += n
	}
	return total
}

func main() {
	pequeno := [3]int{10, 20, 30}
	fmt.Println(somar(pequeno)) // → 60

	// grande := [4]int{1, 2, 3, 4}
	// somar(grande) // ERRO de compilação: cannot use grande (type [4]int) as [3]int
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Array é VALOR. Atribuir copia tudo.
	a := [3]int{1, 2, 3}
	b := a // cópia completa
	b[0] = 999

	fmt.Println("a:", a) // → a: [1 2 3]   (não mudou!)
	fmt.Println("b:", b) // → b: [999 2 3]

	// Arrays do mesmo tipo se comparam com ==
	x := [2]string{"go", "lang"}
	y := [2]string{"go", "lang"}
	fmt.Println(x == y) // → true
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Caso real: matriz 3x3 (array de arrays) representando um tabuleiro.
	var tabuleiro [3][3]string
	tabuleiro[0][0] = "X"
	tabuleiro[1][1] = "O"
	tabuleiro[2][2] = "X"

	for _, linha := range tabuleiro {
		for _, c := range linha {
			if c == "" {
				fmt.Print(". ")
			} else {
				fmt.Print(c + " ")
			}
		}
		fmt.Println()
	}
	// saída:
	// X . .
	// . O .
	// . . X
}`,
      },
    ],
    points: [
      "Array em Go tem tamanho fixo definido em tempo de compilação.",
      "O tamanho faz parte do tipo: [3]int e [4]int são tipos diferentes.",
      "Atribuição e passagem por argumento copiam o array inteiro (semântica de valor).",
      "Use [...]T{...} quando quiser que o compilador conte o tamanho para você.",
      "Arrays comparáveis (cujos elementos são comparáveis) podem ser comparados com ==.",
      "Armadilha: tentar dar append em array; append só funciona em slice.",
      "Idiomático: na prática quase nunca declare arrays diretamente, prefira slices, exceto quando o tamanho é genuinamente fixo.",
    ],
    alerts: [
      {
        type: "info",
        content: "Em C, arrays decaem para ponteiros quando passados a funções. Em Go isso não acontece: o array é copiado de verdade. Esse é um dos motivos para preferir slices em código real.",
      },
      {
        type: "warning",
        content: "Acessar índice fora do intervalo, como notas[10] em um [3]int, gera panic em tempo de execução. Não há retorno de undefined nem extensão automática.",
      },
      {
        type: "tip",
        content: "Se você precisa de uma coleção que cresce, comece direto com slice. Use array literal somente quando quiser uma chave de map de tamanho fixo ou um buffer estático.",
      },
    ],
  },
  {
    slug: "slices-intro",
    section: "estruturas",
    title: "Slices: a coleção que você vai usar todo dia",
    difficulty: "iniciante",
    subtitle: "Uma janela flexível sobre um array, com tamanho dinâmico e semântica de referência",
    intro: `Se você vem do Python ou do JavaScript, slice é o mais próximo de uma list ou Array que Go te oferece. É a estrutura sequencial que você vai usar em quase todo programa: lista de pedidos, linhas lidas de um arquivo, resultados de uma query, registros de log. Diferente do array, o slice tem tamanho dinâmico: ele cresce conforme você adiciona elementos. E diferente do array, passar um slice para uma função não copia os dados, apenas a referência.

Por baixo dos panos, um slice é uma estrutura pequena com três campos: um ponteiro para o início de um array, um comprimento (len) e uma capacidade (cap). Esse trio é chamado de slice header. O array por baixo é alocado uma vez e o slice é uma janela apontando para um pedaço dele. Esse desenho é o que permite ao Go ter slices baratos de criar e ainda assim seguros (com checagem de limites em runtime).

Você cria um slice de várias formas: literal direto, com a função make ou cortando outro slice/array com a sintaxe [a:b]. Os índices funcionam como Python: a partir de zero, [a:b] vai do índice a (inclusive) ao b (exclusivo). O tamanho atual você pega com len, e a capacidade com cap. Não confunda os dois: len é quanto tem usado, cap é quanto cabe antes de precisar realocar.

Neste capítulo você aprende a criar, ler e iterar slices. Nos próximos a gente aprofunda em append, make, cópia, compartilhamento de memória e os truques que todo gopher experiente usa.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Forma mais comum: literal de slice (sem o tamanho entre colchetes).
	frutas := []string{"maçã", "banana", "uva", "manga"}

	fmt.Println(frutas)        // → [maçã banana uva manga]
	fmt.Println(len(frutas))   // → 4 (quantos elementos)
	fmt.Println(frutas[0])     // → maçã
	fmt.Println(frutas[len(frutas)-1]) // → manga (último elemento)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	numeros := []int{10, 20, 30, 40, 50, 60}

	// Fatiamento [a:b] vai de a (inclusive) até b (exclusivo).
	primeiros := numeros[0:3] // [10 20 30]
	meio      := numeros[2:5] // [30 40 50]
	ultimos   := numeros[3:]  // [40 50 60]  (até o fim)
	tudo      := numeros[:]   // cópia da janela inteira

	fmt.Println(primeiros, meio, ultimos, tudo)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Iterando com range: índice e valor.
	produtos := []string{"café", "leite", "pão"}
	for i, nome := range produtos {
		fmt.Printf("%d: %s\n", i, nome)
	}
	// saída:
	// 0: café
	// 1: leite
	// 2: pão

	// Se o índice não interessa, use _ para descartar.
	total := 0.0
	precos := []float64{4.50, 8.90, 1.75}
	for _, p := range precos {
		total += p
	}
	fmt.Printf("total: %.2f\n", total) // → total: 15.15
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Slices passam por "referência": a função enxerga os mesmos dados.
func zerarPrimeiro(s []int) {
	if len(s) > 0 {
		s[0] = 0
	}
}

func main() {
	v := []int{7, 8, 9}
	zerarPrimeiro(v)
	fmt.Println(v) // → [0 8 9]   (mudou de fora)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Slice nil: declarado mas não inicializado.
	var pendentes []string

	fmt.Println(pendentes == nil) // → true
	fmt.Println(len(pendentes))   // → 0

	// Ainda assim, range e len funcionam normalmente em slice nil.
	for _, p := range pendentes {
		fmt.Println("não vai imprimir:", p)
	}
	fmt.Println("loop terminou sem panic")
}`,
      },
    ],
    points: [
      "Slice é a coleção sequencial padrão de Go: dinâmica, indexada, leve.",
      "Internamente é um header com ponteiro, len e cap; o array fica por baixo.",
      "Crie com literal []T{...}, com make([]T, n) ou fatiando outro slice/array.",
      "len(s) é o tamanho atual; cap(s) é quanto cabe antes de realocar.",
      "Passar slice para função compartilha o mesmo array por baixo.",
      "Slice nil tem len 0 e funciona em range/len sem dar panic.",
      "Armadilha: confundir slice com array fixo e tentar atribuir entre tipos diferentes.",
      "Idiomático: escreva []T{...} para criar literal e use range para percorrer.",
    ],
    alerts: [
      {
        type: "info",
        content: "Slice é parecido com a list do Python na ergonomia, mas mais perto de um struct C com ponteiro, comprimento e capacidade na implementação.",
      },
      {
        type: "tip",
        content: "Use o operador _ no range para ignorar o índice. Isso é o jeito idiomático de iterar quando você só quer os valores.",
      },
      {
        type: "warning",
        content: "Como slice compartilha o array por baixo, modificar um índice dentro de uma função altera o slice original. Se quiser isolamento, copie antes com copy.",
      },
    ],
  },
  {
    slug: "slices-append-make",
    section: "estruturas",
    title: "append, make e copy: crescendo slices na prática",
    difficulty: "iniciante",
    subtitle: "Como adicionar elementos, pré-alocar capacidade e copiar slices com segurança",
    intro: `Toda vez que você quer adicionar um item ao final de um slice, a ferramenta é a função embutida append. Ela não modifica o slice original sempre: o que ela faz é devolver um novo slice. Se a capacidade do array por baixo aguentar mais um elemento, ela escreve nesse espaço e devolve um header com len incrementado. Se não aguentar, ela aloca um array novo, maior, copia tudo e devolve um header apontando para esse novo array. Esse detalhe é a fonte de muita confusão para quem está começando.

A função make é a forma de você dizer ao Go quantos elementos pretende ter, ajudando a evitar várias realocações. make([]int, 5) cria um slice com 5 elementos zerados. make([]int, 0, 100) cria um slice vazio com capacidade pré-reservada para 100. Pré-alocar é importante quando você sabe o tamanho final aproximado: economiza alocações e cópias, deixando o programa mais rápido.

Por fim, copy é a função para duplicar elementos entre slices sem compartilhar o array por baixo. Ela copia o mínimo entre len(destino) e len(origem). É essencial quando você precisa de um snapshot independente, ou quando quer manipular um slice sem afetar quem o passou para você.

Esses três (append, make, copy) são as ferramentas básicas para quase todo manuseio de slice. Quem domina o trio escreve código Go elegante e sem surpresas de memória.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// append devolve um NOVO slice. Quase sempre você reatribui.
	var carrinho []string
	carrinho = append(carrinho, "café")
	carrinho = append(carrinho, "açúcar", "filtro") // pode anexar vários
	fmt.Println(carrinho) // → [café açúcar filtro]

	// Anexar um slice inteiro ao outro: use ... para "explodir".
	extras := []string{"leite", "pão"}
	carrinho = append(carrinho, extras...)
	fmt.Println(carrinho) // → [café açúcar filtro leite pão]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// make([]T, n): cria um slice com n elementos zerados.
	zeros := make([]int, 5)
	fmt.Println(zeros, len(zeros), cap(zeros)) // → [0 0 0 0 0] 5 5

	// make([]T, n, c): cria um slice com tamanho n e capacidade c.
	// Útil quando você sabe que vai crescer até c.
	pedidos := make([]string, 0, 100)
	fmt.Println(len(pedidos), cap(pedidos)) // → 0 100

	for i := 0; i < 3; i++ {
		pedidos = append(pedidos, fmt.Sprintf("pedido-%d", i))
	}
	fmt.Println(pedidos) // → [pedido-0 pedido-1 pedido-2]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Demonstra: append PODE realocar o array por baixo.
func main() {
	a := make([]int, 0, 2) // capacidade 2
	fmt.Println("antes :", len(a), cap(a)) // → antes : 0 2

	a = append(a, 1)
	a = append(a, 2)
	fmt.Println("cheio :", len(a), cap(a)) // → cheio : 2 2

	a = append(a, 3) // estoura: aloca array novo, maior
	fmt.Println("após  :", len(a), cap(a)) // → após  : 3 4 (cap dobra)

	// Por isso o padrão é SEMPRE reatribuir: x = append(x, v).
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// copy(dst, src) copia o mínimo entre len(dst) e len(src).
	original := []int{10, 20, 30, 40, 50}

	// Snapshot independente: aloque um slice do mesmo tamanho e copie.
	snapshot := make([]int, len(original))
	n := copy(snapshot, original)
	fmt.Println("copiados:", n)        // → copiados: 5
	fmt.Println("snapshot:", snapshot) // → [10 20 30 40 50]

	// Mexer no original não afeta o snapshot.
	original[0] = 999
	fmt.Println("original:", original) // → [999 20 30 40 50]
	fmt.Println("snapshot:", snapshot) // → [10 20 30 40 50]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Caso real: ler nomes de uma fonte qualquer e devolver
// uma cópia normalizada (independente).
func normalizar(nomes []string) []string {
	out := make([]string, len(nomes))
	for i, n := range nomes {
		out[i] = "Sr(a). " + n
	}
	return out
}

func main() {
	clientes := []string{"Ana", "Bruno", "Carla"}
	formal := normalizar(clientes)
	fmt.Println(formal) // → [Sr(a). Ana Sr(a). Bruno Sr(a). Carla]
}`,
      },
    ],
    points: [
      "append devolve um novo slice header; sempre reatribua: s = append(s, x).",
      "Use ... para anexar um slice inteiro a outro: append(a, b...).",
      "make([]T, n) cria slice de tamanho n; make([]T, 0, c) pré-aloca capacidade.",
      "Pré-alocar com cap correto economiza realocações e cópias.",
      "copy(dst, src) duplica elementos sem compartilhar memória.",
      "Sem copy, dois slices podem apontar para o mesmo array e se contaminar.",
      "Armadilha: chamar append(s, x) sem reatribuir e achar que s mudou; nem sempre muda.",
      "Idiomático: escreva s = append(s, v) como reflexo, mesmo quando você acha que cap aguenta.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer de reatribuir o resultado de append é o erro mais comum em código Go iniciante. O slice antigo pode ainda apontar para o array antigo enquanto o novo header sumiu.",
      },
      {
        type: "tip",
        content: "Quando você sabe que vai inserir N itens, use make([]T, 0, N) e dê append. Você terá uma única alocação em vez de várias dobradas conforme cresce.",
      },
      {
        type: "info",
        content: "A política de crescimento do append não é fixa em lei: dobra até certo tamanho e depois cresce em frações menores. Trate como detalhe interno e foque em pré-alocar quando der.",
      },
    ],
  },
  {
    slug: "slices-internas",
    section: "estruturas",
    title: "Por dentro do slice: header, ptr/len/cap e compartilhamento",
    difficulty: "intermediario",
    subtitle: "O que acontece quando você fatia, atribui e altera slices que apontam para o mesmo array",
    intro: `Slice em Go é uma das estruturas mais elegantes da linguagem, mas também uma das que mais surpreende quando você não conhece os detalhes internos. O segredo é entender que slice não é a memória dos dados; ele é só uma janela. A estrutura interna, chamada de slice header, tem três campos: um ponteiro para o início do array por baixo, o comprimento atual (len) e a capacidade total disponível a partir desse ponteiro (cap).

Quando você faz s2 := s1[1:4], você não está copiando dados. Você está criando um novo header que aponta para o mesmo array, com o ponteiro deslocado em uma posição e com len e cap calculados em cima do que sobrou. Isso significa que escrever em s2[0] muda também s1[1]. Os dois slices estão olhando para o mesmo pedaço de memória.

Esse design tem um lado bom (fatiamento é barato, sem alocação) e um lado perigoso (modificações vazam entre slices, e segurar um slice pequeno pode segurar um array grande na memória). Esse último ponto é a famosa pegadinha de memória: se você guarda um slice de 10 elementos cortado de um array de 1 milhão, o garbage collector não pode liberar o array, porque seu slice ainda aponta para ele.

Entender o slice header é o que separa quem brinca com Go de quem programa Go a sério. Neste capítulo você vai ver com lentes de microscópio o que cada operação faz e como evitar os tropeços clássicos.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Vamos demonstrar que fatiar NÃO copia.
	original := []int{10, 20, 30, 40, 50}
	janela := original[1:4] // aponta para o mesmo array, índices 1..3

	fmt.Println("original:", original) // → [10 20 30 40 50]
	fmt.Println("janela  :", janela)   // → [20 30 40]

	// Mexer na janela muda o original (mesmo array por baixo).
	janela[0] = 999
	fmt.Println("original:", original) // → [10 999 30 40 50]
	fmt.Println("janela  :", janela)   // → [999 30 40]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// len é quantos itens; cap é quantos cabem a partir do ponteiro do header.
	base := []int{1, 2, 3, 4, 5, 6, 7, 8}

	a := base[2:5]
	fmt.Println(a, "len=", len(a), "cap=", cap(a))
	// → [3 4 5] len= 3 cap= 6   (cap conta até o fim do array)

	// Forma de 3 índices: base[low:high:max] limita a capacidade.
	b := base[2:5:5] // cap fica exatamente em high - low = 3
	fmt.Println(b, "len=", len(b), "cap=", cap(b))
	// → [3 4 5] len= 3 cap= 3
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Pegadinha clássica: append em slice fatiado pode reescrever o original.
func main() {
	dados := []int{1, 2, 3, 4, 5}
	parte := dados[1:3] // [2 3], len 2, cap 4

	// append cabe no array por baixo (cap=4), então sobrescreve a posição 3 do original!
	parte = append(parte, 99)

	fmt.Println("parte :", parte)  // → [2 3 99]
	fmt.Println("dados :", dados)  // → [1 2 3 99 5]   (índice 3 mudou!)

	// Para evitar: use slice de 3 índices que limita cap.
	seguro := dados[1:3:3]
	seguro = append(seguro, 77) // cap esgotada, aloca array novo
	fmt.Println("dados :", dados) // → [1 2 3 99 5] (intacto)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Vazamento de memória: segurar um slice pequeno mantém o array grande vivo.
func ultimosTres(grande []int) []int {
	// PROBLEMA: este slice aponta para o array original.
	// O array de N posições não é coletado enquanto ultimosTres for usado.
	return grande[len(grande)-3:]
}

func ultimosTresSeguro(grande []int) []int {
	// CORRETO: copiar para um novo array desliga a referência ao grande.
	out := make([]int, 3)
	copy(out, grande[len(grande)-3:])
	return out
}

func main() {
	enorme := make([]int, 1_000_000)
	for i := range enorme {
		enorme[i] = i
	}
	a := ultimosTres(enorme)        // segura o array de 1 milhão
	b := ultimosTresSeguro(enorme)  // libera o array original quando enorme sair de escopo
	fmt.Println(a[0], b[0])
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Observando ponteiros do array por baixo com %p.
func main() {
	s := []int{1, 2, 3}
	fmt.Printf("ponteiro: %p len=%d cap=%d\n", s, len(s), cap(s))

	for i := 0; i < 5; i++ {
		s = append(s, i)
		fmt.Printf("após append: ponteiro=%p len=%d cap=%d\n", s, len(s), cap(s))
	}
	// Você verá o endereço mudar quando o cap for estourado e o array for reasignado.
}`,
      },
    ],
    points: [
      "Slice header tem ponteiro para o array, len atual e cap disponível.",
      "Fatiar com [a:b] é barato: cria header novo apontando para o mesmo array.",
      "Modificar um slice afeta todos os outros que olham para o mesmo trecho.",
      "A forma [low:high:max] limita a capacidade e evita surpresas com append.",
      "Segurar um slice pequeno cortado de um array grande impede o GC de liberar a memória do array.",
      "Use copy para snapshot independente quando precisa cortar a referência.",
      "Armadilha: dar append em um subslice e reescrever, sem querer, o array original.",
      "Idiomático: para devolver subslice de função sem segurar o array, copie com make+copy.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Quando você passa um slice para uma função e ela faz append, dois cenários ocorrem: ou o array por baixo aguenta (e o original é alterado) ou ele é realocado (e só a função vê a mudança). Sempre reatribua o retorno.",
      },
      {
        type: "info",
        content: "Use fmt.Printf com %p para ver o endereço do array por baixo do slice. É uma das melhores formas didáticas de provar que append realocou ou não.",
      },
      {
        type: "tip",
        content: "Em código de biblioteca, ao devolver subfatias derivadas de um buffer maior, considere copiar antes para evitar vazamento de memória do buffer original.",
      },
    ],
  },
  {
    slug: "slices-truques",
    section: "estruturas",
    title: "Truques com slices: remover, inverter, filtrar",
    difficulty: "intermediario",
    subtitle: "Padrões idiomáticos para operações comuns que Go não traz prontas como Python ou JavaScript",
    intro: `Go tem uma biblioteca padrão enxuta. Diferente de Python (com list.remove, list.reverse, list.sort embutidos) ou JavaScript (com map, filter, reduce em qualquer Array), em Go você costuma escrever esses helpers à mão, ou usar o pacote slices (introduzido em Go 1.21). Isso parece um retrocesso, mas tem propósito: forçar você a ver o custo de cada operação e escolher conscientemente.

Existem três padrões que todo gopher precisa saber de cor: remover um elemento mantendo a ordem, remover sem manter a ordem (mais barato), inverter o slice no lugar e filtrar mantendo apenas elementos que passam por um teste. Esses padrões usam append, copy e a sintaxe de fatiamento de formas inteligentes.

Em Go 1.21 e acima, o pacote slices da biblioteca padrão te dá funções genéricas como slices.Index, slices.Contains, slices.Reverse, slices.Sort. Isso é um avanço enorme: você ganha eficiência, código curto e tipagem forte através dos generics. Mas conhecer os truques manuais ainda vale ouro: muito código existente usa esses padrões e em casos especiais você ainda precisa deles.

Este capítulo apresenta os clássicos, mostra a versão moderna com o pacote slices e te dá um repertório que cobre 90 por cento das tarefas do dia a dia com slices.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Remover mantendo a ordem: junta o que vem antes com o que vem depois.
func removerOrdenado[T any](s []T, i int) []T {
	return append(s[:i], s[i+1:]...)
}

func main() {
	nomes := []string{"Ana", "Bruno", "Carla", "Diego"}
	nomes = removerOrdenado(nomes, 1) // remove "Bruno"
	fmt.Println(nomes) // → [Ana Carla Diego]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Remover sem manter a ordem: troca com o último e corta. Mais barato (O(1)).
func removerRapido[T any](s []T, i int) []T {
	s[i] = s[len(s)-1]
	return s[:len(s)-1]
}

func main() {
	itens := []int{10, 20, 30, 40, 50}
	itens = removerRapido(itens, 1) // 20 sai, 50 toma o lugar
	fmt.Println(itens) // → [10 50 30 40]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Inverter no lugar (in-place) sem alocar memória nova.
func inverter[T any](s []T) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}

func main() {
	pilha := []string{"a", "b", "c", "d"}
	inverter(pilha)
	fmt.Println(pilha) // → [d c b a]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Filtrar reaproveitando o mesmo slice (alocação zero adicional).
// Mantém apenas elementos para os quais manter(x) é true.
func filtrar[T any](s []T, manter func(T) bool) []T {
	out := s[:0] // mesmo array por baixo, len = 0
	for _, v := range s {
		if manter(v) {
			out = append(out, v)
		}
	}
	return out
}

func main() {
	idades := []int{12, 17, 18, 25, 33, 60}
	adultos := filtrar(idades, func(x int) bool { return x >= 18 })
	fmt.Println(adultos) // → [18 25 33 60]
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"slices" // disponível a partir de Go 1.21
)

func main() {
	// O pacote slices tem funções genéricas prontas.
	xs := []int{40, 10, 30, 20}

	slices.Sort(xs)
	fmt.Println(xs) // → [10 20 30 40]

	idx := slices.Index(xs, 30)
	fmt.Println("posição do 30:", idx) // → posição do 30: 2

	tem := slices.Contains(xs, 99)
	fmt.Println("contém 99?", tem) // → contém 99? false

	slices.Reverse(xs)
	fmt.Println(xs) // → [40 30 20 10]
}`,
      },
      {
        lang: "bash",
        code: `# Antes de rodar os exemplos, garanta um módulo Go moderno.
go mod init exemplo/slices
go version
# saída esperada: go version go1.22.x ou superior`,
      },
    ],
    points: [
      "Remover mantendo ordem usa append(s[:i], s[i+1:]...) e custa O(n).",
      "Remover sem ordem é O(1): troque com o último e corte com s[:len(s)-1].",
      "Inverter no lugar com dois índices que avançam em sentidos opostos.",
      "Filtrar reaproveitando o array por baixo usa s[:0] como acumulador.",
      "Em Go 1.21+, prefira o pacote slices para Sort, Reverse, Index, Contains.",
      "Use generics ([T any]) para escrever helpers reutilizáveis com qualquer tipo.",
      "Armadilha: usar removerOrdenado em loop sem reatribuir o resultado.",
      "Idiomático: para conjuntos ordenados pequenos, slice + slices.Sort costuma ser melhor que map ou árvore.",
    ],
    alerts: [
      {
        type: "info",
        content: "O pacote slices só existe a partir de Go 1.21. Em projetos mais antigos você ainda verá os truques manuais. Vale conhecer os dois caminhos.",
      },
      {
        type: "warning",
        content: "Filtrar com s[:0] é eficiente, mas como reescreve o slice original, qualquer outro slice que apontava para o mesmo array vai enxergar lixo. Use só quando você for o dono daquele slice.",
      },
      {
        type: "tip",
        content: "Antes de escrever um truque com índices, dê uma olhada no pacote slices. Talvez já exista a função pronta, testada e otimizada para você.",
      },
    ],
  },
  {
    slug: "maps",
    section: "estruturas",
    title: "Maps: dicionários nativos do Go",
    difficulty: "iniciante",
    subtitle: "Como criar, ler e modificar a estrutura chave-valor mais usada da linguagem",
    intro: `Map é a versão Go do dict do Python, do object usado como dicionário no JavaScript ou do HashMap do Java. É uma estrutura que associa chaves a valores, com busca, inserção e remoção em tempo médio constante. Você usa map sempre que precisa olhar algo por nome, identificador ou qualquer chave única: cache de respostas, contagem de ocorrências, índice de usuários, configuração lida de arquivo.

Diferente de slice, map sempre é construído. Você precisa usar make ou o literal map[K]V{...} para ter um map utilizável. Um map declarado com var sem inicializar é nil, e tentar escrever em map nil gera panic. Já leitura em map nil é segura: devolve o valor zero do tipo. Esse detalhe pega muito iniciante desprevenido.

Outra característica fundamental: maps são tipos de referência. Quando você passa um map para uma função, ela enxerga o mesmo map. Não há cópia automática. Se quiser uma cópia independente, precisa percorrer e copiar manualmente. Isso é diferente de Python (onde dict também é referência) mas você pode achar surpreendente vindo de C.

Por fim, a iteração com range em um map em Go não tem ordem garantida. A ordem muda entre execuções, deliberadamente, para que você não escreva código dependente de algo que poderia mudar. Se você precisa de ordem, percorra com base nas chaves ordenadas em um slice à parte.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Forma 1: literal já com valores.
	idades := map[string]int{
		"Ana":   30,
		"Bruno": 25,
		"Carla": 41,
	}
	fmt.Println(idades["Ana"]) // → 30

	// Forma 2: make para começar vazio.
	estoque := make(map[string]int)
	estoque["café"] = 12
	estoque["leite"] = 5
	fmt.Println(estoque) // → map[café:12 leite:5]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Ler chave que NÃO existe devolve o valor zero do tipo, sem erro.
	pontos := map[string]int{"Ana": 100}
	fmt.Println(pontos["Bruno"]) // → 0  (int zero)

	// Para distinguir "não existe" de "existe com zero": comma ok.
	v, ok := pontos["Bruno"]
	fmt.Println(v, ok) // → 0 false

	v, ok = pontos["Ana"]
	fmt.Println(v, ok) // → 100 true
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	cesta := map[string]int{"maçã": 3, "uva": 5, "kiwi": 2}

	// delete remove uma chave (sem erro se não existir).
	delete(cesta, "uva")
	delete(cesta, "inexistente") // ok, ignora silenciosamente
	fmt.Println(cesta) // → map[kiwi:2 maçã:3]   (ordem pode variar)

	// len conta quantas chaves.
	fmt.Println("itens:", len(cesta)) // → itens: 2
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// CUIDADO: map nil aceita LEITURA mas não aceita ESCRITA.
	var cache map[string]string
	fmt.Println(cache == nil) // → true
	fmt.Println(cache["x"])   // → ""  (leitura ok)

	// cache["x"] = "y" // panic: assignment to entry in nil map

	// Sempre inicialize com make antes de escrever.
	cache = make(map[string]string)
	cache["x"] = "y"
	fmt.Println(cache) // → map[x:y]
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sort"
)

func main() {
	// Iteração em map NÃO tem ordem fixa. Para ordenar, extraia chaves.
	frutas := map[string]int{"banana": 12, "abacaxi": 4, "caqui": 7}

	chaves := make([]string, 0, len(frutas))
	for k := range frutas {
		chaves = append(chaves, k)
	}
	sort.Strings(chaves)

	for _, k := range chaves {
		fmt.Printf("%s: %d\n", k, frutas[k])
	}
	// saída:
	// abacaxi: 4
	// banana: 12
	// caqui: 7
}`,
      },
    ],
    points: [
      "Map associa chave a valor com lookup médio O(1).",
      "Crie com make(map[K]V) ou literal map[K]V{...}; var sozinho deixa nil.",
      "Ler chave inexistente devolve o zero value, sem erro.",
      "Use comma-ok (v, ok := m[k]) para distinguir ausência de zero legítimo.",
      "delete(m, k) remove sem reclamar de chave que não existe.",
      "Iteração com range não garante ordem; extraia chaves para um slice e ordene.",
      "Map é tipo de referência: passar para função compartilha o mesmo map.",
      "Armadilha: escrever em map nil gera panic; sempre inicialize antes.",
      "Idiomático: use comma-ok sempre que precisar saber se a chave estava presente.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Escrever em um map nil sempre causa panic em runtime. Esse erro é comum quando você declara var m map[string]int e esquece o make antes de atribuir.",
      },
      {
        type: "info",
        content: "Go embaralha a ordem de iteração de map de propósito, para evitar que você escreva código dependente de uma ordem que não é parte do contrato.",
      },
      {
        type: "tip",
        content: "Quando você sabe o tamanho aproximado, use make(map[K]V, n) para reservar buckets desde o início. Isso evita várias realocações conforme o map cresce.",
      },
    ],
  },
  {
    slug: "maps-padroes",
    section: "estruturas",
    title: "Padrões com maps: contagem, set e cache",
    difficulty: "intermediario",
    subtitle: "Receitas idiomáticas que aparecem em todo código Go: contar, agrupar, virar conjunto",
    intro: `Map é uma estrutura tão flexível que vira a base para vários padrões clássicos: contar ocorrências de cada item em uma sequência, agrupar registros por uma chave, transformar uma lista em conjunto (sem repetição), implementar um cache simples em memória. Esses padrões aparecem em códigos de qualquer área: análise de logs, processamento de pedidos, indexação de busca, controle de visitas únicas em um site.

Em Go, o padrão set merece atenção. A linguagem não tem tipo set nativo como Python, mas você obtém o mesmo comportamento usando map[T]struct{}. O struct vazio struct{} ocupa zero bytes, então você usa o map só pelas chaves. Isso é mais econômico que map[T]bool e é o jeito idiomático de representar conjunto.

Para contagem, o padrão é também simples: m[chave]++. O Go inicializa a chave com zero antes de incrementar, então você não precisa checar se a chave já existe. Esse é um pequeno milagre de ergonomia que economiza muitas linhas comparado a outras linguagens.

Para cache simples, o map é o ponto de partida natural. Mas atenção: maps em Go não são seguros para acesso concorrente. Se múltiplas goroutines vão ler e escrever, você precisa de sync.Mutex ou de sync.Map. Vamos tocar nesse cuidado para você não cair em corrida de dados quando seu programa virar paralelo.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"strings"
)

func main() {
	// Contagem de palavras em um texto.
	texto := "go é simples go é rápido go é divertido"
	contagem := map[string]int{}

	for _, palavra := range strings.Fields(texto) {
		contagem[palavra]++ // chave nova começa em 0 e é incrementada para 1
	}

	fmt.Println(contagem)
	// → map[divertido:1 go:3 rápido:1 simples:1 é:3]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Set usando map[T]struct{} (zero bytes por entrada).
	visto := map[string]struct{}{}

	emails := []string{
		"a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com",
	}
	for _, e := range emails {
		visto[e] = struct{}{} // valor é o struct vazio
	}

	fmt.Println("únicos:", len(visto)) // → únicos: 3

	// Pertence ao conjunto?
	_, existe := visto["a@x.com"]
	fmt.Println("a existe?", existe) // → true
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Pedido struct {
	ID     int
	Cliente string
	Valor  float64
}

func main() {
	pedidos := []Pedido{
		{1, "Ana", 50},
		{2, "Bruno", 30},
		{3, "Ana", 80},
		{4, "Carla", 20},
		{5, "Ana", 10},
	}

	// Agrupar pedidos por cliente.
	porCliente := map[string][]Pedido{}
	for _, p := range pedidos {
		porCliente[p.Cliente] = append(porCliente[p.Cliente], p)
	}

	for nome, lista := range porCliente {
		total := 0.0
		for _, p := range lista {
			total += p.Valor
		}
		fmt.Printf("%s: %d pedido(s), total R$ %.2f\n", nome, len(lista), total)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Cache simples seguro para múltiplas goroutines.
type Cache struct {
	mu    sync.RWMutex
	dados map[string]string
}

func NovoCache() *Cache {
	return &Cache{dados: make(map[string]string)}
}

func (c *Cache) Get(k string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	v, ok := c.dados[k]
	return v, ok
}

func (c *Cache) Set(k, v string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.dados[k] = v
}

func main() {
	c := NovoCache()
	c.Set("user:1", "Ana")
	v, ok := c.Get("user:1")
	fmt.Println(v, ok) // → Ana true
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Helpers úteis para set: união e interseção.
func uniao[T comparable](a, b map[T]struct{}) map[T]struct{} {
	out := make(map[T]struct{}, len(a)+len(b))
	for k := range a {
		out[k] = struct{}{}
	}
	for k := range b {
		out[k] = struct{}{}
	}
	return out
}

func intersec[T comparable](a, b map[T]struct{}) map[T]struct{} {
	out := map[T]struct{}{}
	for k := range a {
		if _, ok := b[k]; ok {
			out[k] = struct{}{}
		}
	}
	return out
}

func main() {
	a := map[int]struct{}{1: {}, 2: {}, 3: {}}
	b := map[int]struct{}{2: {}, 3: {}, 4: {}}
	fmt.Println(uniao(a, b))    // → {1,2,3,4} (ordem varia)
	fmt.Println(intersec(a, b)) // → {2,3}
}`,
      },
    ],
    points: [
      "Contagem: m[chave]++ aproveita o zero value para inicializar.",
      "Set idiomático em Go: map[T]struct{}; struct vazio ocupa zero bytes.",
      "Para agrupar registros, use map[K][]V e dê append na chave correspondente.",
      "Cache simples começa como map; vire seguro com sync.Mutex ou sync.RWMutex.",
      "Map não é seguro para concorrência: leituras e escritas paralelas dão data race.",
      "Para chaves struct, o tipo precisa ser comparable (sem slice/map dentro).",
      "Armadilha: usar map[T]bool para set; gasta mais memória sem vantagem.",
      "Idiomático: prefira map[T]struct{} e teste presença com _, ok := m[k].",
    ],
    alerts: [
      {
        type: "warning",
        content: "Acessar o mesmo map de várias goroutines, mesmo que só uma escreva, gera data race detectado pelo go run -race. Sempre proteja com mutex ou use sync.Map.",
      },
      {
        type: "tip",
        content: "Quando o conjunto de chaves vai crescer muito, faça make(map[K]V, n) com uma estimativa. Reduz alocações e melhora a velocidade de inserção.",
      },
      {
        type: "info",
        content: "sync.Map é especializado para casos com muitas leituras e poucas escritas, ou onde chaves são definidas uma vez e nunca atualizadas. Para uso geral, mutex + map normal costuma ser mais rápido.",
      },
    ],
  },
  {
    slug: "structs",
    section: "estruturas",
    title: "Structs: agrupando dados em um único tipo",
    difficulty: "iniciante",
    subtitle: "A forma de Go criar tipos próprios com vários campos nomeados",
    intro: `Struct é como Go te permite agrupar várias informações relacionadas dentro de um único valor. É equivalente ao struct do C, à classe sem métodos do Java, ao dataclass do Python ou ao objeto literal tipado do TypeScript. Quando você quer modelar um cliente, um produto, uma requisição HTTP, um evento de log, é struct que você usa.

A grande diferença para classes em linguagens orientadas a objeto tradicionais é que struct em Go não tem herança. Não existe pai e filho. Para reaproveitar comportamento, Go usa embedding (composição), que veremos em outro capítulo. Para definir comportamento, você anexa métodos a tipos. E para abstrair, você usa interfaces. Esses três conceitos juntos substituem orientação a objetos clássica com um modelo mais simples e explícito.

Você cria struct de duas formas: tipo nomeado, com type Nome struct {...}, que vira reutilizável e idiomático; e struct anônimo, que serve para casos pontuais como decodificar um JSON específico de uma vez só. Os campos têm nome e tipo, e seguem a regra de visibilidade de Go: campo com inicial maiúscula é exportado (acessível de outros pacotes), com inicial minúscula é privado ao pacote.

Trabalhar bem com struct é trabalhar bem com Go. Saiba criar com literal, com new, acessar campos, comparar, copiar e usar dentro de slices e maps. Tudo isso vem nas próximas páginas.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Tipo nomeado: a base do dia a dia.
type Cliente struct {
	ID    int
	Nome  string
	Email string
	Ativo bool
}

func main() {
	// Literal nomeado (recomendado: não depende da ordem dos campos).
	a := Cliente{
		ID:    1,
		Nome:  "Ana",
		Email: "ana@exemplo.com",
		Ativo: true,
	}

	// Literal posicional (frágil: se a struct mudar, quebra).
	b := Cliente{2, "Bruno", "bruno@exemplo.com", false}

	fmt.Println(a) // → {1 Ana ana@exemplo.com true}
	fmt.Println(b)
	fmt.Println(a.Nome, a.Email) // → Ana ana@exemplo.com
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Produto struct {
	SKU   string
	Preco float64
}

func main() {
	// Zero value: campos vão para o zero do tipo.
	var p Produto
	fmt.Println(p) // → { 0}    (string vazio, float zero)

	// new(T) devolve *T já com zero value.
	pp := new(Produto)
	pp.SKU = "ABC-123"
	pp.Preco = 99.90
	fmt.Println(*pp) // → {ABC-123 99.9}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Endereco struct {
	Rua    string
	Numero int
	Cidade string
}

// Atualizar a struct dentro de uma função:
// Como struct é VALOR, passar por valor copia. Use ponteiro para alterar.
func mudarCidade(e *Endereco, nova string) {
	e.Cidade = nova
}

func main() {
	e := Endereco{"Rua das Palmeiras", 123, "Curitiba"}
	mudarCidade(&e, "São Paulo")
	fmt.Println(e) // → {Rua das Palmeiras 123 São Paulo}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Struct ANÔNIMO: definido inline, sem dar nome ao tipo.
// Bom para casos pontuais (ex.: agrupar resultado de função).
func main() {
	resp := struct {
		Status int
		Msg    string
	}{
		Status: 200,
		Msg:    "ok",
	}
	fmt.Println(resp.Status, resp.Msg) // → 200 ok
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Ponto struct {
	X, Y int
}

func main() {
	// Structs comparáveis: campos comparáveis -> struct é comparável.
	p1 := Ponto{1, 2}
	p2 := Ponto{1, 2}
	p3 := Ponto{3, 4}

	fmt.Println(p1 == p2) // → true
	fmt.Println(p1 == p3) // → false

	// Slices de struct funcionam como esperado.
	pontos := []Ponto{{0, 0}, {1, 1}, {2, 4}}
	for _, p := range pontos {
		fmt.Printf("(%d, %d)\n", p.X, p.Y)
	}
}`,
      },
    ],
    points: [
      "Struct agrupa vários campos nomeados em um único tipo.",
      "Use type Nome struct {...} para criar tipos reutilizáveis.",
      "Campos com inicial maiúscula são exportados; com minúscula, privados.",
      "Crie com literal nomeado (Nome: valor) — preferido pela legibilidade.",
      "Struct é valor: atribuição copia, passagem por argumento copia também.",
      "Para alterar struct dentro de função, passe ponteiro: *Tipo.",
      "Struct anônimo serve para casos pontuais, sem nome no pacote.",
      "Armadilha: literal posicional quebra silenciosamente quando você adiciona campo.",
      "Idiomático: sempre prefira literal nomeado, mesmo em structs com poucos campos.",
    ],
    alerts: [
      {
        type: "info",
        content: "Em Go não existe herança entre structs. Para reaproveitar comportamento, você embute outro tipo dentro (composição). Esse modelo é mais simples e veremos em capítulo dedicado.",
      },
      {
        type: "tip",
        content: "Construa structs grandes com fábricas (funções como NovoCliente) que validam campos obrigatórios. Isso evita estados inválidos espalhados pelo código.",
      },
      {
        type: "warning",
        content: "Structs com slices, maps ou outros tipos não comparáveis dentro NÃO podem ser comparados com ==. O compilador reclama no caso de igualdade direta.",
      },
    ],
  },
  {
    slug: "structs-tags",
    section: "estruturas",
    title: "Struct tags: metadados para JSON, banco e validação",
    difficulty: "intermediario",
    subtitle: "Strings entre crases que ensinam bibliotecas como mapear seus campos para o mundo externo",
    intro: `Quando você define uma struct em Go, pode anexar uma string especial logo após o tipo de cada campo. Essa string, escrita entre crases, é a chamada struct tag. Ela não muda o comportamento do campo no programa: serve como metadado lido por bibliotecas via reflexão. Os usos mais comuns são serialização para JSON, mapeamento para colunas de banco de dados, validação de entrada, configuração de formulários web e várias outras integrações.

A tag mais famosa é a do encoding/json. Sem nenhuma tag, o pacote json marshaliza usando o nome exato do campo (que precisa ser exportado). Com a tag, você pode renomear o campo na saída, omitir quando estiver vazio com omitempty, ou ignorar completamente com -. Isso te dá controle total da forma do JSON sem mudar o nome do seu campo no código Go.

Outras bibliotecas seguem o mesmo padrão. O sqlx usa tag db para mapear coluna; o gorm usa gorm para configurar coluna, índice, valor padrão; o validator (de go-playground) usa validate para regras como required, email, min, max. Várias tags coexistem na mesma string, separadas por espaço. A sintaxe é sempre nome:"valor1,valor2,...".

Esse capítulo mostra os usos mais comuns de tags, a sintaxe correta (incluindo armadilhas com aspas e escape) e exemplos reais de leitura e escrita de JSON, que é o caso prático número um onde struct tags aparecem.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"encoding/json"
	"fmt"
)

type Usuario struct {
	ID    int    \`json:"id"\`
	Nome  string \`json:"nome"\`
	Email string \`json:"email,omitempty"\`
	Senha string \`json:"-"\` // nunca aparece no JSON
}

func main() {
	u := Usuario{ID: 1, Nome: "Ana", Senha: "segredo"}
	bytes, _ := json.Marshal(u)
	fmt.Println(string(bytes))
	// → {"id":1,"nome":"Ana"}
	// note: email foi omitido (vazio), senha nunca sai
}`,
      },
      {
        lang: "go",
        code: `package main

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
	// Decodificando JSON em struct.
	entrada := []byte(\`{"rua":"Av. Paulista","numero":1000,"cep":"01310-100"}\`)

	var e Endereco
	if err := json.Unmarshal(entrada, &e); err != nil {
		panic(err)
	}
	fmt.Printf("%+v\n", e)
	// → {Rua:Av. Paulista Numero:1000 CEP:01310-100}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"encoding/json"
	"fmt"
)

// Múltiplas tags no mesmo campo (json + outra fictícia "db").
type Produto struct {
	SKU   string  \`json:"sku" db:"sku_codigo"\`
	Nome  string  \`json:"nome" db:"nome_produto"\`
	Preco float64 \`json:"preco" db:"valor"\`
}

func main() {
	p := Produto{SKU: "X1", Nome: "Café", Preco: 19.90}
	b, _ := json.MarshalIndent(p, "", "  ")
	fmt.Println(string(b))
	// → {
	//     "sku": "X1",
	//     "nome": "Café",
	//     "preco": 19.9
	//   }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"encoding/json"
	"fmt"
)

// Caso real: API de CEP devolve cep, logradouro, bairro, localidade, uf.
type CEP struct {
	CEP        string \`json:"cep"\`
	Logradouro string \`json:"logradouro"\`
	Bairro     string \`json:"bairro"\`
	Cidade     string \`json:"localidade"\` // mapeia "localidade" -> Cidade
	UF         string \`json:"uf"\`
}

func main() {
	resposta := []byte(\`{
		"cep": "01310-100",
		"logradouro": "Av. Paulista",
		"bairro": "Bela Vista",
		"localidade": "São Paulo",
		"uf": "SP"
	}\`)

	var c CEP
	json.Unmarshal(resposta, &c)
	fmt.Printf("%s, %s - %s/%s\n", c.Logradouro, c.Bairro, c.Cidade, c.UF)
	// → Av. Paulista, Bela Vista - São Paulo/SP
}`,
      },
      {
        lang: "bash",
        code: `# Para usar libs como validator, primeiro adicione com go get.
go mod init exemplo/tags
go get github.com/go-playground/validator/v10
# isso baixa o pacote e ajusta seu go.mod`,
      },
    ],
    points: [
      "Struct tag é uma string entre crases logo após o tipo do campo.",
      "Bibliotecas leem tags por reflexão; o programa em si ignora.",
      "encoding/json usa tag json para renomear, omitir e ocultar.",
      "omitempty omite o campo no JSON quando for o zero value.",
      "- como nome de tag json esconde o campo da serialização.",
      "Multiple tags coexistem no mesmo campo, separadas por espaço.",
      "Use literal nomeado nas tags: nome:\"valor1,valor2\" sem espaços extras.",
      "Armadilha: errar a sintaxe da tag (espaço errado, aspas erradas) faz a lib ignorar silenciosamente.",
      "Idiomático: padronize nomes em snake_case ou camelCase no JSON e mantenha os campos Go com inicial maiúscula.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Erros em struct tag não são detectados pelo compilador. Se você escreve json:\"nome\" com aspas erradas ou espaço a mais, o pacote json simplesmente ignora a tag e usa o nome do campo Go.",
      },
      {
        type: "tip",
        content: "Sempre teste a serialização e deserialização com json.Marshal e json.Unmarshal antes de subir para produção. Ferramentas como go vet também ajudam a flagrar tags malformadas.",
      },
      {
        type: "info",
        content: "Campos não exportados (com inicial minúscula) são ignorados pelo encoding/json mesmo com tag. A tag só funciona em campos exportados.",
      },
    ],
  },
  {
    slug: "ponteiros",
    section: "estruturas",
    title: "Ponteiros: endereço, valor e quando usar cada um",
    difficulty: "intermediario",
    subtitle: "O recurso que dá controle de memória sem a complexidade de C, com regras claras e poucas pegadinhas",
    intro: `Ponteiro é uma variável que, em vez de guardar um valor, guarda o endereço onde aquele valor mora na memória. Em Go, você usa o operador & para pegar o endereço de uma variável e o operador * para acessar o valor apontado por um ponteiro. A sintaxe é parecida com C, mas Go tira da sua mão as duas partes mais perigosas dessa história: aritmética de ponteiros não existe, e o garbage collector cuida da liberação de memória.

Para que servem ponteiros em Go? Basicamente para dois cenários principais. Primeiro: permitir que uma função altere o valor recebido. Como vimos com structs, passar por valor copia; se você quer modificar, passe ponteiro. Segundo: evitar cópia desnecessária de structs grandes. Passar um ponteiro para uma struct de 1 KB é um endereço de 8 bytes; passar a struct é copiar 1 KB. Em hot paths, isso pesa.

Há também o uso para diferenciar ausência de zero. Quando você tem um campo opcional, *string permite distinguir nil (não setado) de string vazia. É comum em mapeamentos de banco e JSON onde você quer dizer claramente que algo não foi enviado, em vez de assumir o zero.

Diferente de C, em Go não existe ponteiro inválido por aritmética: você não pode fazer p+1 nem comparar ponteiros que não vieram de um & ou de new. Não existe void*. Tudo é tipado. Isso reduz drasticamente bugs comuns. Vamos ver como ler e escrever passando ponteiros, quando preferir valor, e cuidados com nil.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	x := 10

	// & devolve o endereço de x.
	p := &x
	fmt.Println(p)  // → 0xc0000140a8 (algum endereço)
	fmt.Println(*p) // → 10  (* devolve o valor apontado)

	// Atribuir via ponteiro altera a variável original.
	*p = 99
	fmt.Println(x) // → 99
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Sem ponteiro: a função recebe CÓPIA, não muda o original.
func dobrar(n int) {
	n = n * 2
}

// Com ponteiro: a função altera o valor original.
func dobrarPtr(n *int) {
	*n = *n * 2
}

func main() {
	v := 5
	dobrar(v)
	fmt.Println(v) // → 5  (não mudou)

	dobrarPtr(&v)
	fmt.Println(v) // → 10
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Conta struct {
	Titular string
	Saldo   float64
}

// Receber *Conta evita copiar a struct e permite alterar.
func depositar(c *Conta, valor float64) {
	c.Saldo += valor
}

func main() {
	c := Conta{Titular: "Ana", Saldo: 100}
	depositar(&c, 50)
	fmt.Println(c) // → {Ana 150}

	// new(T) devolve *T já zerado.
	c2 := new(Conta)
	c2.Titular = "Bruno"
	depositar(c2, 200)
	fmt.Println(*c2) // → {Bruno 200}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Distinguindo "não informado" de "zero" com *string.
type Cadastro struct {
	Nome      string
	Apelido   *string // pode ser nil
}

func main() {
	apelido := "Aninha"
	c1 := Cadastro{Nome: "Ana", Apelido: &apelido}
	c2 := Cadastro{Nome: "Bruno"} // sem apelido

	for _, c := range []Cadastro{c1, c2} {
		if c.Apelido != nil {
			fmt.Printf("%s tem apelido: %s\n", c.Nome, *c.Apelido)
		} else {
			fmt.Printf("%s sem apelido\n", c.Nome)
		}
	}
	// saída:
	// Ana tem apelido: Aninha
	// Bruno sem apelido
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Cuidado: desreferenciar ponteiro nil gera panic.
func main() {
	var p *int
	fmt.Println(p == nil) // → true

	// fmt.Println(*p) // panic: invalid memory address or nil pointer dereference

	// Sempre teste antes:
	if p != nil {
		fmt.Println(*p)
	} else {
		fmt.Println("ponteiro nil, nada para ler")
	}
}`,
      },
    ],
    points: [
      "& devolve o endereço de uma variável; * acessa ou escreve no valor apontado.",
      "Em Go não existe aritmética de ponteiros; só atribuição e desreferência.",
      "Passe ponteiro para função quando quiser modificar o valor original.",
      "Passe ponteiro para evitar cópia de structs grandes em chamadas frequentes.",
      "Use *T quando precisa diferenciar ausência (nil) de zero value.",
      "new(T) é equivalente a &T{}; devolve *T já zerado.",
      "Garbage collector cuida da memória; você não precisa de free.",
      "Armadilha: desreferenciar ponteiro nil sempre gera panic em runtime.",
      "Idiomático: receivers de método em structs costumam ser ponteiro quando alteram estado.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Acessar *p quando p é nil gera panic imediato. Sempre verifique p != nil antes de desreferenciar quando o valor pode legitimamente ser ausente.",
      },
      {
        type: "info",
        content: "Diferente de C, ponteiros em Go são tipados e seguros. Não existe void*. O GC libera o que não tem mais referências, então não há free nem delete.",
      },
      {
        type: "tip",
        content: "Para structs pequenas (poucos campos), passar por valor pode ser mais rápido por evitar indireção. Faça benchmark com testing.B antes de assumir que ponteiro é sempre melhor.",
      },
    ],
  },
  {
    slug: "composicao-embedding",
    section: "estruturas",
    title: "Composição e embedding: reutilizar sem herdar",
    difficulty: "avancado",
    subtitle: "A forma de Go reaproveitar campos e métodos sem ter classes nem hierarquia",
    intro: `Em linguagens como Java ou Python, quando você quer que um tipo aproveite o que outro já oferece, costuma usar herança: class Cachorro extends Animal. Em Go, herança simplesmente não existe. Em vez disso, a linguagem oferece um mecanismo chamado embedding (incorporação), que é uma forma de composição. Você embute um tipo dentro de outro, e os campos e métodos do tipo embutido ficam acessíveis como se fossem do tipo externo. É composição com um açúcar sintático que parece herança, mas tem semântica diferente.

A regra é simples: dentro de uma struct, em vez de declarar um campo com nome, você declara apenas o tipo. Esse tipo vira um campo anônimo (com nome igual ao tipo). Você pode acessar campos e métodos do tipo embutido sem ter que escrever o nome do campo. Isso permite construir tipos novos a partir de tipos existentes sem cópia mecânica de código.

A grande vantagem desse modelo é que não cria a fragilidade que herança traz: super, métodos sobrescritos, ordem de inicialização, hierarquias profundas que ninguém entende mais. Em Go, a relação é horizontal: você compõe peças, e cada peça tem sua responsabilidade. Quando precisa de polimorfismo, usa interface, que é satisfeita implicitamente.

Use embedding quando faz sentido dizer que um tipo é uma extensão de outro com mesmo conjunto de operações; e use campo nomeado quando o tipo embutido é mais um detalhe de implementação. Vamos ver isso na prática.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

type Endereco struct {
	Rua    string
	Cidade string
}

// Pessoa EMBUTE Endereco como campo anônimo.
type Pessoa struct {
	Nome string
	Endereco // sem nome de campo: vira "embedded"
}

func main() {
	p := Pessoa{
		Nome: "Ana",
		Endereco: Endereco{
			Rua:    "Av. das Flores",
			Cidade: "Curitiba",
		},
	}

	// Acesso direto, como se fosse campo da Pessoa.
	fmt.Println(p.Nome, p.Rua, p.Cidade)
	// → Ana Av. das Flores Curitiba

	// Também é possível acessar pelo nome do tipo embutido.
	fmt.Println(p.Endereco.Rua) // → Av. das Flores
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Logger struct {
	Prefixo string
}

func (l *Logger) Log(msg string) {
	fmt.Printf("[%s] %s\n", l.Prefixo, msg)
}

// Servidor compõe um Logger por embedding e ganha o método Log de graça.
type Servidor struct {
	*Logger
	Porta int
}

func main() {
	s := Servidor{
		Logger: &Logger{Prefixo: "API"},
		Porta:  8080,
	}

	s.Log("subindo na porta 8080") // método veio do Logger embutido
	// → [API] subindo na porta 8080
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Embedding NÃO é herança: o método embutido pode ser
// "sobrescrito" só por SHADOWING (definindo método de mesmo nome no tipo externo).
type Base struct{}

func (Base) Cumprimentar() string {
	return "olá da Base"
}

type Especial struct {
	Base
}

// Especial define seu próprio método com mesmo nome.
func (Especial) Cumprimentar() string {
	return "olá da Especial"
}

func main() {
	e := Especial{}
	fmt.Println(e.Cumprimentar())      // → olá da Especial
	fmt.Println(e.Base.Cumprimentar()) // → olá da Base (acesso explícito)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Caso real: ContaBancaria + ContaPoupanca.
type ContaBancaria struct {
	Titular string
	Saldo   float64
}

func (c *ContaBancaria) Depositar(v float64) {
	c.Saldo += v
}

type ContaPoupanca struct {
	ContaBancaria // ganha Titular, Saldo, Depositar
	Rendimento    float64
}

func (c *ContaPoupanca) Render() {
	c.Saldo += c.Saldo * c.Rendimento
}

func main() {
	p := ContaPoupanca{
		ContaBancaria: ContaBancaria{Titular: "Ana", Saldo: 1000},
		Rendimento:    0.10,
	}
	p.Depositar(500) // método herdado por embedding
	p.Render()       // método próprio
	fmt.Printf("%s tem R$ %.2f\n", p.Titular, p.Saldo)
	// → Ana tem R$ 1650.00
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Embedding também funciona com interfaces para compor contratos.
type Lerdor interface {
	Ler() string
}

type Escritor interface {
	Escrever(s string)
}

// Composição de duas interfaces em uma terceira.
type LeitorEscritor interface {
	Lerdor
	Escritor
}

type Memoria struct {
	dados string
}

func (m *Memoria) Ler() string         { return m.dados }
func (m *Memoria) Escrever(s string)   { m.dados = s }

func main() {
	var le LeitorEscritor = &Memoria{}
	le.Escrever("oi")
	fmt.Println(le.Ler()) // → oi
}`,
      },
    ],
    points: [
      "Embedding é declarar um tipo dentro de uma struct sem dar nome ao campo.",
      "Campos e métodos do tipo embutido ficam acessíveis no tipo externo.",
      "Não é herança: não existe super, não existe upcasting automático.",
      "Você pode 'sobrescrever' um método embutido apenas por shadowing.",
      "Você pode embutir tipos por valor ou por ponteiro (*Tipo); ponteiro evita cópia.",
      "Interfaces também podem ser compostas via embedding.",
      "Use composição como ferramenta principal; não tente reproduzir herança Java em Go.",
      "Armadilha: campos com mesmo nome em vários tipos embutidos exigem qualificação explícita.",
      "Idiomático: prefira embedding por ponteiro quando o tipo embutido tem métodos de mutação.",
    ],
    alerts: [
      {
        type: "info",
        content: "A frase mantra da comunidade Go é prefer composition over inheritance. Embedding existe exatamente para que você consiga reaproveitar comportamento sem cair nas armadilhas de hierarquias rígidas.",
      },
      {
        type: "warning",
        content: "Se dois tipos embutidos têm método ou campo com o mesmo nome, o compilador exige que você qualifique qual quer (p.ex. p.Tipo1.Foo). Sem qualificação, dá erro.",
      },
      {
        type: "tip",
        content: "Quando fizer embedding de um tipo grande, prefira embutir por ponteiro (*Tipo) para evitar cópias caras quando passar a struct externa por valor.",
      },
    ],
  },
  {
    slug: "estruturas-aninhadas",
    section: "estruturas",
    title: "Structs aninhadas e modelagem realista",
    difficulty: "avancado",
    subtitle: "Como modelar entidades complexas combinando structs, slices, maps e ponteiros sem virar bagunça",
    intro: `Em programas reais, raramente uma única struct resolve. Você modela entidades que se conectam: um pedido tem cliente, vários itens, endereço de entrega; um post tem autor, comentários, tags; um relatório tem cabeçalho e várias linhas. A combinação de structs aninhadas, slices, maps e ponteiros é a forma como Go expressa esses domínios. Saber compor essas peças com clareza é o que separa código profissional de código amador.

A primeira decisão de modelagem é se um campo deve ser uma struct embutida (anônima), uma struct nomeada como campo ou um ponteiro para struct. Cada uma dá um efeito diferente. Embutida agrega comportamento; nomeada é um agrupamento explícito; ponteiro permite ausência (nil) e evita cópias caras. Não existe regra única: você escolhe pela semântica do domínio.

A segunda decisão é como representar coleções dependentes. Itens de um pedido normalmente são um slice de struct. Comentários de um post podem ser slice ou, se a quantidade pode ser enorme, podem ficar em uma estrutura separada e referenciada por ID. Mapas entram quando você precisa de lookup eficiente por uma chave: índice de produtos por SKU, sessão por token.

A terceira decisão é sobre identidade e referência. Em estruturas profundamente aninhadas, é comum ter uma fonte de verdade central (um map por ID) e referências entre objetos via ID em vez de ponteiro. Isso evita ciclos, simplifica serialização e funciona bem com bancos de dados.

Vamos modelar um caso real de pedido de e-commerce e ver na prática como essas peças se encaixam.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Modelagem de um sistema de pedidos.
type Endereco struct {
	Rua    string
	Numero int
	Cidade string
	UF     string
	CEP    string
}

type Cliente struct {
	ID    int
	Nome  string
	Email string
	// Cliente tem um endereço principal aninhado por valor.
	Principal Endereco
}

type Item struct {
	SKU      string
	Nome     string
	Preco    float64
	Quantidade int
}

type Pedido struct {
	ID        int
	Cliente   Cliente   // copia o snapshot do cliente no momento do pedido
	Itens     []Item    // coleção dependente
	Entrega   Endereco  // pode ser diferente do principal
	Criado    time.Time
}

func (p Pedido) Total() float64 {
	var soma float64
	for _, it := range p.Itens {
		soma += float64(it.Quantidade) * it.Preco
	}
	return soma
}

func main() {
	c := Cliente{
		ID: 1, Nome: "Ana", Email: "ana@ex.com",
		Principal: Endereco{Rua: "Rua A", Numero: 10, Cidade: "Curitiba", UF: "PR", CEP: "80000-000"},
	}

	p := Pedido{
		ID: 1001, Cliente: c, Criado: time.Now(),
		Entrega: c.Principal,
		Itens: []Item{
			{SKU: "CAF", Nome: "Café 500g", Preco: 22.90, Quantidade: 2},
			{SKU: "LEI", Nome: "Leite 1L", Preco: 5.50, Quantidade: 3},
		},
	}

	fmt.Printf("Pedido %d - Cliente %s - Total R$ %.2f\n",
		p.ID, p.Cliente.Nome, p.Total())
	// → Pedido 1001 - Cliente Ana - Total R$ 62.30
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Quando muitos pedidos referem o mesmo cliente, vale separar e
// usar IDs (em vez de copiar a struct inteira em cada pedido).
type Cliente struct {
	ID   int
	Nome string
}

type Pedido struct {
	ID         int
	ClienteID  int     // referência por ID, não ponteiro
	Total      float64
}

type Loja struct {
	Clientes map[int]Cliente
	Pedidos  []Pedido
}

func (l *Loja) NomeDoCliente(p Pedido) string {
	c, ok := l.Clientes[p.ClienteID]
	if !ok {
		return "(desconhecido)"
	}
	return c.Nome
}

func main() {
	l := &Loja{
		Clientes: map[int]Cliente{
			1: {ID: 1, Nome: "Ana"},
			2: {ID: 2, Nome: "Bruno"},
		},
		Pedidos: []Pedido{
			{ID: 100, ClienteID: 1, Total: 80},
			{ID: 101, ClienteID: 2, Total: 30},
			{ID: 102, ClienteID: 1, Total: 50},
		},
	}

	for _, p := range l.Pedidos {
		fmt.Printf("Pedido %d (%s): R$ %.2f\n", p.ID, l.NomeDoCliente(p), p.Total)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"encoding/json"
	"fmt"
)

// Estruturas aninhadas + JSON: um caso muito comum em APIs.
type Comentario struct {
	Autor string \`json:"autor"\`
	Texto string \`json:"texto"\`
}

type Post struct {
	ID          int          \`json:"id"\`
	Titulo      string       \`json:"titulo"\`
	Tags        []string     \`json:"tags,omitempty"\`
	Comentarios []Comentario \`json:"comentarios,omitempty"\`
}

func main() {
	p := Post{
		ID: 1, Titulo: "Aprendendo Go",
		Tags: []string{"go", "iniciante"},
		Comentarios: []Comentario{
			{Autor: "Ana", Texto: "Excelente!"},
			{Autor: "Bruno", Texto: "Mandou bem."},
		},
	}
	b, _ := json.MarshalIndent(p, "", "  ")
	fmt.Println(string(b))
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Modelando uma árvore (estrutura recursiva): um Nó referencia filhos.
// Atenção: o tipo recursivo precisa usar PONTEIRO, senão o tamanho
// seria infinito e o compilador reclama.
type No struct {
	Valor  string
	Filhos []*No
}

func andar(n *No, nivel int) {
	for i := 0; i < nivel; i++ {
		fmt.Print("  ")
	}
	fmt.Println(n.Valor)
	for _, f := range n.Filhos {
		andar(f, nivel+1)
	}
}

func main() {
	raiz := &No{Valor: "raiz", Filhos: []*No{
		{Valor: "a", Filhos: []*No{
			{Valor: "a1"},
			{Valor: "a2"},
		}},
		{Valor: "b"},
	}}
	andar(raiz, 0)
	// saída:
	// raiz
	//   a
	//     a1
	//     a2
	//   b
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Padrão "agregação por map": índice rápido de produtos por SKU.
type Produto struct {
	SKU   string
	Nome  string
	Preco float64
}

type Catalogo struct {
	porSKU map[string]*Produto
}

func NovoCatalogo(itens []Produto) *Catalogo {
	c := &Catalogo{porSKU: make(map[string]*Produto, len(itens))}
	for i := range itens {
		c.porSKU[itens[i].SKU] = &itens[i]
	}
	return c
}

func (c *Catalogo) Buscar(sku string) (*Produto, bool) {
	p, ok := c.porSKU[sku]
	return p, ok
}

func main() {
	cat := NovoCatalogo([]Produto{
		{SKU: "A1", Nome: "Café", Preco: 20},
		{SKU: "B2", Nome: "Pão", Preco: 5},
	})
	if p, ok := cat.Buscar("A1"); ok {
		fmt.Printf("%s custa R$ %.2f\n", p.Nome, p.Preco)
	}
	// → Café custa R$ 20.00
}`,
      },
    ],
    points: [
      "Combine struct aninhada, slice, map e ponteiro conforme a semântica do domínio.",
      "Embedded por valor agrega comportamento; campo nomeado é agrupamento explícito.",
      "Use ponteiro quando precisar de ausência (nil), mutação ou economia de cópia.",
      "Para muitos objetos referenciando o mesmo, prefira ID em vez de ponteiro direto.",
      "Map por ID é o índice natural para lookup rápido em coleções grandes.",
      "Estruturas recursivas (árvores) exigem ponteiro: []*No, não []No.",
      "Encapsule construção em funções fábrica (Novo...) para garantir invariantes.",
      "Armadilha: aninhar struct por valor em vez de ponteiro em árvores gera erro de compilação.",
      "Idiomático: snapshots de dados (cópia no momento) evitam efeitos colaterais difíceis de rastrear.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Antes de modelar com ponteiros entre objetos, considere se uma referência por ID resolve. ID é mais simples de serializar, persistir e debugar do que um grafo de ponteiros.",
      },
      {
        type: "warning",
        content: "Estruturas recursivas com ponteiros podem virar ciclos. Cuidado ao serializar para JSON: o encoding/json não trata ciclos e entra em recursão infinita.",
      },
      {
        type: "info",
        content: "Quando você tem um snapshot do cliente dentro do pedido, está abraçando o conceito de eventos imutáveis. Mesmo que o cliente mude depois, o pedido preserva o estado do momento. Esse padrão é comum em sistemas que precisam de auditoria.",
      },
      {
        type: "success",
        content: "Dominar a combinação de structs aninhadas, slices e maps é ter na mão 90 por cento do que se usa em modelagem de domínio em Go. As próximas trilhas (interfaces, pacotes, IO) vão construir em cima dessa base.",
      },
    ],
  },
];
