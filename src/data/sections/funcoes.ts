import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "funcoes-declaracao",
    section: "funcoes",
    title: "Declaração de funções",
    difficulty: "iniciante",
    subtitle: "A unidade básica de organização do código em Go: como declarar, nomear e chamar funções",
    intro: `Funções são caixas pretas: você entrega ingredientes (parâmetros), elas executam um trabalho e, se quiserem, devolvem um resultado. Em Go, toda lógica do seu programa vai morar dentro de funções, começando pela mais especial de todas, a func main, que é o ponto de entrada do programa executável.

A sintaxe é deliberadamente curta e previsível. Em vez do padrão de C ('int soma(int a, int b)'), Go inverte: a palavra-chave func vem primeiro, depois o nome, depois os parâmetros entre parênteses e, por último, o tipo de retorno. Essa ordem foi escolhida para que ler código fique mais fácil da esquerda para a direita, como se você lesse uma frase em inglês: "function soma takes two ints and returns int".

Uma diferença importante de linguagens como Python e JavaScript: em Go, todo parâmetro é fortemente tipado e isso é checado em tempo de compilação. Você nunca vai descobrir, em produção, que estava passando uma string onde esperava um int — o compilador grita antes. Isso parece chato no começo mas vira uma rede de segurança gigantesca quando o projeto cresce.

Outra característica idiomática: nomes de funções que começam com letra maiúscula são exportados (visíveis fora do pacote), e os que começam com minúscula são privados ao pacote. Não existe public, private ou protected. A capitalização é a regra de visibilidade. Simples e brutal — você nunca esquece.

Por fim, em Go uma função é um cidadão completo da linguagem: ela tem tipo, pode ser passada como argumento, retornada de outra função e armazenada em variáveis. Mas vamos chegar lá. Comece dominando a forma básica e os exemplos abaixo.`,
    codes: [
      {
        lang: "bash",
        code: `# Crie um módulo novo para acompanhar os exemplos.
mkdir mercearia && cd mercearia
go mod init exemplo/mercearia
# A versão de Go vai aparecer no go.mod (use Go 1.22+).`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// soma recebe dois inteiros e devolve a soma deles.
// A assinatura é: func nome(parametros) tipoRetorno
func soma(a int, b int) int {
	return a + b
}

func main() {
	resultado := soma(7, 3)
	fmt.Println("7 + 3 =", resultado)
	// → saída: 7 + 3 = 10
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Quando dois parâmetros consecutivos têm o mesmo tipo,
// você pode declarar o tipo apenas uma vez no fim. É idiomático.
func multiplica(a, b int) int {
	return a * b
}

// Função sem retorno: nada após a lista de parâmetros.
func saudacao(nome string) {
	fmt.Println("Olá,", nome)
}

func main() {
	fmt.Println(multiplica(4, 5)) // → 20
	saudacao("Marina")            // → Olá, Marina
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Funções com nome iniciando em maiúscula são exportadas (visíveis
// fora do pacote). Em minúscula, ficam privadas ao pacote.
// Aqui ambas estão no main, então o efeito de exportação não muda nada,
// mas a convenção de nomes vale do mesmo jeito.
func PrecoComDesconto(preco float64, descontoPercentual float64) float64 {
	return preco - (preco * descontoPercentual / 100)
}

func main() {
	final := PrecoComDesconto(199.90, 10)
	fmt.Printf("Preço final: R$ %.2f\n", final)
	// → saída: Preço final: R$ 179.91
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Uma função pode ser chamada de dentro de outra função.
// Aqui calcularImposto e calcularTotal cooperam.
func calcularImposto(valor float64) float64 {
	return valor * 0.10 // 10% de imposto fictício
}

func calcularTotal(valor float64) float64 {
	return valor + calcularImposto(valor)
}

func main() {
	total := calcularTotal(50.0)
	fmt.Println("Total com imposto:", total)
	// → saída: Total com imposto: 55
}`,
      },
    ],
    points: [
      "A sintaxe é: func nome(parametros) tipoRetorno { corpo }.",
      "Parâmetros consecutivos do mesmo tipo podem compartilhar a declaração: func soma(a, b int).",
      "Função sem retorno omite o tipo após a lista de parâmetros.",
      "Nome com letra maiúscula = exportado; minúscula = privado ao pacote.",
      "func main() é o ponto de entrada obrigatório de qualquer programa executável (package main).",
      "Idiomático: nomes curtos, em camelCase, sem prefixos como get/set quando não fazem sentido.",
      "Armadilha: esquecer de declarar package main e func main em programas executáveis (vira erro de build).",
      "Erro comum: tentar chamar uma função privada de outro pacote — o compilador rejeita por causa da capitalização.",
    ],
    alerts: [
      {
        type: "info",
        content: "Go não tem sobrecarga de funções como Java ou C++. Você não pode declarar duas funções com o mesmo nome e assinaturas diferentes no mesmo pacote. Se precisar variar, use nomes diferentes ou parâmetros variádicos.",
      },
      {
        type: "tip",
        content: "Mantenha funções curtas e com um único propósito. Se uma função passa de 40 ou 50 linhas, geralmente é sinal de que ela precisa ser quebrada em funções auxiliares menores.",
      },
      {
        type: "warning",
        content: "Funções declaradas e não usadas dentro do código não causam erro, mas variáveis locais não usadas sim. Esse comportamento é proposital para forçar você a escrever código limpo.",
      },
    ],
  },
  {
    slug: "valores-retorno",
    section: "funcoes",
    title: "Valores de retorno",
    difficulty: "iniciante",
    subtitle: "Como devolver resultados de uma função e por que Go é tão explícito sobre tipos",
    intro: `Toda função que produz uma resposta precisa devolvê-la com a palavra-chave return. Em Go, o tipo do que será devolvido é declarado depois dos parênteses, antes da chave de abertura. Essa explicitude existe por um motivo: o compilador checa cada return e garante que você está entregando exatamente o que prometeu na assinatura.

Em Python ou JavaScript, você pode declarar uma função que às vezes devolve um número e às vezes devolve uma string sem que ninguém reclame até o programa quebrar em produção. Em Go isso é impossível. Se a função declara que retorna float64, todo caminho de execução precisa devolver um float64. Caminhos sem return causam erro de compilação. Esse rigor parece chato no começo, mas elimina classes inteiras de bugs.

Outro detalhe importante: em Go, quando você não devolve nada, simplesmente não escreve o tipo de retorno. Não existe void como em Java/C, nem precisa escrever return None como em Python. A ausência é a ausência. E quando precisa interromper a função no meio sem devolver valor, basta um return solitário.

Existe ainda o conceito de zero values: se uma função declara retorno mas você não atribuiu nada antes do return, Go devolve o valor zero do tipo (0 para números, "" para strings, false para bool, nil para slices, maps, ponteiros e interfaces). Esse comportamento é uma das características mais idiomáticas de Go: nunca há "lixo de memória" indefinido.

Compare com C, onde uma variável local não inicializada pode conter qualquer valor da memória. Em Go, isso simplesmente não acontece. Tudo nasce em um estado conhecido e seguro.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Retorno simples de um valor.
// O tipo float64 após os parênteses indica o que vai voltar.
func areaCirculo(raio float64) float64 {
	return 3.14159 * raio * raio
}

func main() {
	a := areaCirculo(5)
	fmt.Printf("Área: %.2f\n", a)
	// → saída: Área: 78.54
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função sem retorno: nenhum tipo após os parâmetros.
// Útil para ações como imprimir, registrar log, salvar em arquivo.
func registrarPedido(id int, cliente string) {
	fmt.Printf("Pedido %d registrado para %s\n", id, cliente)
}

func main() {
	registrarPedido(1042, "João")
	// → saída: Pedido 1042 registrado para João
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// return pode interromper a função antes do fim.
// Aqui devolvemos cedo se o saldo for insuficiente.
func sacar(saldo, valor float64) float64 {
	if valor > saldo {
		fmt.Println("Saldo insuficiente!")
		return saldo // não saca nada, devolve o saldo original
	}
	return saldo - valor
}

func main() {
	fmt.Println(sacar(100, 30))  // → 70
	fmt.Println(sacar(100, 150)) // → Saldo insuficiente! e depois 100
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Quando o tipo tem zero value, você pode confiar nele.
// Aqui se a string estiver vazia, devolvemos zero (não "lixo").
func tamanhoDoNome(nome string) int {
	return len(nome)
}

func main() {
	fmt.Println(tamanhoDoNome(""))      // → 0
	fmt.Println(tamanhoDoNome("Maria")) // → 5
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Ilustração de zero value: variável bool não inicializada vira false.
// Função que devolve bool sem precisar pensar em "padrão".
func ehMaiorDeIdade(idade int) bool {
	return idade >= 18
}

func main() {
	fmt.Println(ehMaiorDeIdade(20)) // → true
	fmt.Println(ehMaiorDeIdade(15)) // → false
}`,
      },
    ],
    points: [
      "Toda função que declara tipo de retorno precisa devolver esse tipo em todos os caminhos.",
      "Para não devolver nada, omita o tipo após a lista de parâmetros — não use void.",
      "return sozinho (sem valor) interrompe uma função void no meio.",
      "Zero values garantem que retornos não inicializados tenham valor seguro: 0, \"\", false, nil.",
      "Idiomático: usar early return (retorno antecipado) para tratar casos de borda no topo da função.",
      "O compilador rejeita código com caminhos que não retornam valor quando a assinatura exige.",
      "Armadilha: esquecer return em uma branch do if e ver o erro 'missing return' do compilador.",
      "Erro comum: confundir return com break — return sai da função inteira, break só do laço.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Adote o estilo 'early return': trate erros e casos especiais no início da função e deixe o caminho feliz claro no fim. Isso reduz aninhamento de if e melhora a legibilidade absurdamente.",
      },
      {
        type: "info",
        content: "Em Go, o tipo do retorno faz parte da assinatura da função. Funções com tipos de retorno diferentes são consideradas tipos completamente diferentes para o compilador.",
      },
      {
        type: "warning",
        content: "Se você criar uma variável só para guardar o retorno e nunca a usar, o compilador vai recusar. Em vez de var x = funcao(), prefira chamar diretamente ou usar o identificador em branco _ = funcao().",
      },
    ],
  },
  {
    slug: "multiplos-retornos",
    section: "funcoes",
    title: "Múltiplos retornos",
    difficulty: "iniciante",
    subtitle: "A marca registrada de Go: devolver vários valores de uma vez, especialmente o par (resultado, erro)",
    intro: `Aqui chegamos em um dos recursos mais característicos da linguagem. Em Go, uma função pode devolver vários valores ao mesmo tempo, separados por vírgula. Isso parece pequeno, mas mudou completamente o jeito como tratamento de erros é feito na linguagem.

Em Java ou Python, quando algo dá errado, você joga (lança) uma exceção que viaja para cima na pilha até alguém capturar. Em Go, a convenção é diferente: a função devolve dois valores, normalmente o resultado esperado e um erro. Se o erro for nil, deu tudo certo. Se não, algo aconteceu e você precisa tratar. Esse padrão é tão comum que se tornou idiomático: praticamente toda função que pode falhar tem assinatura func algo() (Resultado, error).

Por que esse modelo? Porque ele torna o tratamento de erro visível. Você não consegue ignorar um erro acidentalmente — precisa explicitamente capturá-lo numa variável (ou descartá-lo com _, o que é considerado feio). Em linguagens com exceções, é fácil esquecer um try/catch e o erro silencia. Em Go, o erro fica ali, na sua cara, esperando ser tratado.

Múltiplos retornos também servem para coisas além de erro: devolver um par de coordenadas, mínimo e máximo de uma lista, valor e índice, conta e total, e por aí vai. Você não precisa mais criar uma struct só para empacotar duas coisas que vão juntas.

Quando recebe múltiplos valores, você usa atribuição múltipla: a, b := funcao(). Se quiser ignorar algum dos retornos, use o identificador em branco: _, b := funcao(). Isso é uma forma idiomática de dizer ao compilador "sei que isso existe, mas não vou usar".`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Função que devolve dois valores: divisão inteira e resto.
func divmod(a, b int) (int, int) {
	return a / b, a % b
}

func main() {
	quoc, resto := divmod(17, 5)
	fmt.Println("17 / 5 =", quoc, "resto", resto)
	// → saída: 17 / 5 = 3 resto 2
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"errors"
	"fmt"
)

// O padrão idiomático de Go: (resultado, error).
// Se algo der errado, devolva um erro descritivo.
func dividir(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("divisão por zero não é permitida")
	}
	return a / b, nil
}

func main() {
	resultado, err := dividir(10, 0)
	if err != nil {
		fmt.Println("Erro:", err)
		return
	}
	fmt.Println("Resultado:", resultado)
	// → saída: Erro: divisão por zero não é permitida
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"strconv"
)

// strconv.Atoi devolve (int, error). Vamos consumir os dois.
func main() {
	idade, err := strconv.Atoi("trinta")
	if err != nil {
		fmt.Println("Não consegui converter:", err)
		return
	}
	fmt.Println("Idade convertida:", idade)
	// → saída: Não consegui converter: strconv.Atoi: parsing "trinta": invalid syntax
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Use _ para ignorar um retorno que não te interessa.
func minMax(numeros []int) (int, int) {
	min, max := numeros[0], numeros[0]
	for _, n := range numeros {
		if n < min {
			min = n
		}
		if n > max {
			max = n
		}
	}
	return min, max
}

func main() {
	// Só interessa o máximo agora; descartamos o mínimo com _.
	_, maior := minMax([]int{4, 9, 1, 7, 3})
	fmt.Println("Maior:", maior)
	// → saída: Maior: 9
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"strings"
)

// Cenário real: separar nome e sobrenome de uma string.
// Devolve nome, sobrenome e um indicador se conseguiu separar.
func separarNome(completo string) (string, string, bool) {
	partes := strings.SplitN(completo, " ", 2)
	if len(partes) < 2 {
		return completo, "", false
	}
	return partes[0], partes[1], true
}

func main() {
	nome, sobrenome, ok := separarNome("Ana Souza Lima")
	fmt.Println(nome, "|", sobrenome, "| ok =", ok)
	// → saída: Ana | Souza Lima | ok = true
}`,
      },
    ],
    points: [
      "Funções podem devolver múltiplos valores separando-os por vírgula no return.",
      "O tipo de retorno múltiplo é declarado entre parênteses: (int, int) ou (float64, error).",
      "Idiomático: (Resultado, error) é o padrão para qualquer função que possa falhar.",
      "Use atribuição múltipla para receber: a, b := funcao().",
      "Use _ (identificador em branco) para descartar valores que não te interessam.",
      "Sempre cheque erros logo após a chamada — não acumule lógica antes de tratar.",
      "Idiomático: tratar erros com if err != nil { return ... } imediatamente após a chamada.",
      "Armadilha: ignorar erros com _, val := func() — quase sempre é sinal de bug futuro.",
    ],
    alerts: [
      {
        type: "success",
        content: "O par (valor, error) é tão comum em Go que virou parte da identidade da linguagem. Adotar esse padrão nas suas próprias funções deixa seu código familiar para qualquer dev Go que for ler depois.",
      },
      {
        type: "warning",
        content: "Nunca silencie erros com _ a menos que você saiba exatamente por quê. A maior parte dos bugs difíceis de Go vem justamente de erros que foram ignorados sem querer.",
      },
      {
        type: "tip",
        content: "Ao ler documentação de pacotes da biblioteca padrão, repare quase todas as funções de leitura, conversão e parsing devolvem o par (resultado, error). Aprenda a esperar isso.",
      },
      {
        type: "info",
        content: "O tipo error em Go é uma interface simples com apenas o método Error() string. Isso permite que você crie seus próprios tipos de erro com contexto rico, como veremos no capítulo de Erros.",
      },
    ],
  },
  {
    slug: "retornos-nomeados",
    section: "funcoes",
    title: "Retornos nomeados",
    difficulty: "intermediario",
    subtitle: "Quando dar nomes aos valores de retorno e usar o naked return faz seu código ficar mais ou menos legível",
    intro: `Em Go, você pode dar nomes aos valores que uma função vai retornar, declarando esses nomes na própria assinatura. Quando faz isso, esses nomes viram variáveis locais inicializadas com o zero value do tipo, e você pode usá-las normalmente dentro do corpo da função. No final, basta um return sem argumentos — o famoso naked return — e os valores atuais dessas variáveis são devolvidos.

À primeira vista pode parecer só um açúcar sintático, mas tem implicações importantes. Primeiro: documentação. Quando você declara func parsearCEP(cep string) (rua string, cidade string, err error), quem lê a assinatura entende imediatamente o que cada retorno representa. Sem nomes, ficaria (string, string, error) — você precisa adivinhar a ordem.

Segundo: integração com defer. Como os retornos nomeados são variáveis comuns, uma função executada via defer pode modificá-los antes da função realmente retornar. Esse é um truque idiomático para anexar contexto a erros ou ajustar valores no último momento, especialmente em wrappers de funções complexas.

Mas existe um lado escuro. O naked return em funções longas é uma fonte gigantesca de bugs. Você lê o cabeçalho, lê o corpo, e quando chega num return sozinho precisa rolar de volta para entender o que está sendo devolvido. A regra prática da comunidade Go é: use retornos nomeados em funções pequenas (até 10–15 linhas) ou quando os nomes documentam algo importante. Em funções grandes, prefira retornos explícitos, ou seja, return a, b, err — eles deixam claro o que está sendo devolvido em cada ponto.

Compare com Python, onde docstrings são opcionais e a tipagem é dinâmica: muitas vezes você precisa ler todo o corpo para descobrir o que volta. Em Go, retornos nomeados aproximam a assinatura de uma documentação executável, o que é especialmente útil em bibliotecas públicas.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Retornos nomeados: rua, cidade e err já existem como variáveis locais.
func parsearEndereco(cep string) (rua string, cidade string, err error) {
	if len(cep) != 8 {
		err = fmt.Errorf("CEP deve ter 8 dígitos, recebeu %d", len(cep))
		return // naked return: devolve "", "" e err preenchido
	}
	rua = "Rua Exemplo"
	cidade = "São Paulo"
	return // devolve "Rua Exemplo", "São Paulo", nil
}

func main() {
	rua, cidade, err := parsearEndereco("01310100")
	fmt.Println(rua, "-", cidade, "- err:", err)
	// → saída: Rua Exemplo - São Paulo - err: <nil>
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função pequena onde o naked return brilha.
// Calcula área e perímetro de um retângulo.
func dimensoes(largura, altura float64) (area, perimetro float64) {
	area = largura * altura
	perimetro = 2 * (largura + altura)
	return
}

func main() {
	a, p := dimensoes(4, 3)
	fmt.Println("Área:", a, "Perímetro:", p)
	// → saída: Área: 12 Perímetro: 14
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"errors"
	"fmt"
)

// Truque idiomático: usar defer para enriquecer o erro retornado.
// Como err é nomeado, o defer pode modificá-lo antes da função retornar.
func processarPedido(id int) (err error) {
	defer func() {
		if err != nil {
			err = fmt.Errorf("processarPedido(%d): %w", id, err)
		}
	}()

	if id <= 0 {
		return errors.New("id inválido")
	}
	// ... outra lógica ...
	return nil
}

func main() {
	err := processarPedido(-1)
	fmt.Println(err)
	// → saída: processarPedido(-1): id inválido
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Caso onde retorno explícito é preferível: lógica longa,
// múltiplos pontos de retorno. Naked return aqui só atrapalharia.
func classificarNota(nota float64) (conceito string, aprovado bool) {
	if nota < 0 || nota > 10 {
		return "INVÁLIDO", false
	}
	if nota >= 9 {
		return "A", true
	}
	if nota >= 7 {
		return "B", true
	}
	if nota >= 5 {
		return "C", true
	}
	return "D", false
}

func main() {
	c, ap := classificarNota(8.2)
	fmt.Println("Conceito:", c, "Aprovado:", ap)
	// → saída: Conceito: B Aprovado: true
}`,
      },
    ],
    points: [
      "Retornos nomeados ficam declarados na assinatura: (nome tipo, outro tipo).",
      "Eles funcionam como variáveis locais inicializadas com zero value.",
      "naked return (return sem argumentos) devolve o estado atual dessas variáveis.",
      "Idiomático: usar nomes que documentam o significado, não letras genéricas.",
      "Funções com defer que modifica o retorno só funcionam com retornos nomeados.",
      "Em funções pequenas (até 10–15 linhas), naked return é elegante e claro.",
      "Em funções longas, retornos explícitos (return a, b, err) são mais legíveis.",
      "Armadilha: usar naked return em função de 50 linhas — quem lê precisa rolar de volta para entender o que volta.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use retornos nomeados quando os nomes adicionarem informação à assinatura. Se você ia chamar de 'a, b string', melhor não nomear e deixar (string, string) mesmo.",
      },
      {
        type: "warning",
        content: "Cuidado com sombreamento (shadowing): se dentro da função você declarar uma variável com := de mesmo nome do retorno nomeado, criou uma nova variável local. O retorno nomeado ficará com o zero value e o naked return vai devolver isso.",
      },
      {
        type: "info",
        content: "O efeito do defer modificar retornos nomeados é a base de muitos wrappers de tratamento de erro em libs grandes como o database/sql e o net/http. Vale entender bem para ler código profissional.",
      },
    ],
  },
  {
    slug: "variadic",
    section: "funcoes",
    title: "Funções variádicas",
    difficulty: "intermediario",
    subtitle: "Quando você não sabe quantos argumentos vão chegar: o operador ... e como Go monta um slice por baixo",
    intro: `Funções variádicas são aquelas que aceitam um número variável de argumentos do mesmo tipo. Em Go, você marca o último parâmetro com ... antes do tipo, e por baixo dos panos a linguagem coleta todos os argumentos passados nesse ponto e empacota em um slice.

Você já usou funções variádicas sem perceber: fmt.Println, fmt.Printf, append — todas aceitam quantos argumentos você quiser. Esse padrão é útil quando o número de itens é genuinamente variável: somar uma lista de números, concatenar várias strings, registrar múltiplos campos de log, etc.

A sintaxe é elegante: func somar(numeros ...int) int. Por dentro, numeros é um []int. Você itera com range, mede com len, faz tudo que faria com um slice. A diferença é só na hora de chamar: quem invoca pode passar zero, um, dois ou mil argumentos diretamente: somar(), somar(1), somar(1, 2, 3, 4, 5).

Existe um detalhe importante: se você já tem um slice e quer passar seus elementos como argumentos variádicos, use o operador de spread, que em Go é também os três pontinhos depois do nome do slice: somar(numeros...). Sem isso, o compilador reclama porque você está tentando passar um slice onde se espera múltiplos ints.

Comparado com Python, onde *args produz uma tupla, ou JavaScript, onde ...rest produz um array, em Go o resultado é um slice — e essa simetria é confortável: o que entra como variádico você manipula como slice qualquer. Cuidado porém: o slice criado por uma chamada variádica pode ser nil se nenhum argumento foi passado, então len() é seu amigo para checar.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// somar aceita zero ou mais inteiros.
func somar(numeros ...int) int {
	total := 0
	for _, n := range numeros {
		total += n
	}
	return total
}

func main() {
	fmt.Println(somar())              // → 0
	fmt.Println(somar(10))            // → 10
	fmt.Println(somar(1, 2, 3, 4, 5)) // → 15
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"strings"
)

// Junta vários trechos de log em uma única linha.
func registrarLog(nivel string, partes ...string) {
	mensagem := strings.Join(partes, " ")
	fmt.Printf("[%s] %s\n", nivel, mensagem)
}

func main() {
	registrarLog("INFO", "usuário", "joao", "fez", "login")
	// → saída: [INFO] usuário joao fez login
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Spread: passando um slice existente como argumentos variádicos.
func somar(numeros ...int) int {
	total := 0
	for _, n := range numeros {
		total += n
	}
	return total
}

func main() {
	valores := []int{4, 8, 15, 16, 23, 42}
	// Os três pontos no fim "espalham" o slice nos argumentos.
	total := somar(valores...)
	fmt.Println("Total:", total)
	// → saída: Total: 108
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Cenário real: calcular média de notas variáveis.
func media(notas ...float64) float64 {
	if len(notas) == 0 {
		return 0
	}
	soma := 0.0
	for _, n := range notas {
		soma += n
	}
	return soma / float64(len(notas))
}

func main() {
	fmt.Printf("Média: %.2f\n", media(7.5, 8.0, 9.2))
	// → saída: Média: 8.23

	notasAluno := []float64{6.5, 7.0, 8.5, 9.0}
	fmt.Printf("Média: %.2f\n", media(notasAluno...))
	// → saída: Média: 7.75
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// O parâmetro variádico precisa ser SEMPRE o último.
// Você pode combinar com parâmetros fixos antes.
func montarPedido(cliente string, itens ...string) {
	fmt.Println("Pedido de", cliente, "contém:")
	for i, item := range itens {
		fmt.Printf("  %d. %s\n", i+1, item)
	}
}

func main() {
	montarPedido("Carla", "café", "pão de queijo", "suco")
	// → saída:
	// Pedido de Carla contém:
	//   1. café
	//   2. pão de queijo
	//   3. suco
}`,
      },
    ],
    points: [
      "Marque o último parâmetro com ...tipo para tornar a função variádica.",
      "Por dentro, o parâmetro variádico é um slice do tipo declarado.",
      "Use o operador de spread (slice...) para passar um slice existente como argumentos.",
      "O parâmetro variádico tem que ser sempre o último; só pode haver um por função.",
      "Idiomático: cheque len(args) == 0 antes de assumir que há ao menos um elemento.",
      "Funções como fmt.Println e append já são variádicas; você pode imitar o padrão.",
      "Armadilha: esquecer os ... ao passar um slice e ver erro 'cannot use ... as ...'.",
      "Erro comum: tentar declarar variádico no meio: func(a ...int, b string) — não compila.",
    ],
    alerts: [
      {
        type: "info",
        content: "O slice criado por uma chamada variádica é alocado por chamada; isso tem custo. Em código de altíssima performance, prefira receber um slice diretamente em vez de variádico.",
      },
      {
        type: "tip",
        content: "Funções variádicas são ótimas para construir APIs ergonômicas. fmt.Printf, log.Printf e errors.Join são exemplos perfeitos de como elas tornam o código de quem chama mais limpo.",
      },
      {
        type: "warning",
        content: "Quando passar slice... para uma função variádica, lembre que o slice é compartilhado por referência. Se a função modificar o slice, ela está modificando o seu original também.",
      },
    ],
  },
  {
    slug: "funcoes-anonimas",
    section: "funcoes",
    title: "Funções anônimas",
    difficulty: "intermediario",
    subtitle: "Funções sem nome, declaradas e usadas no mesmo lugar — flexibilidade para callbacks e código local",
    intro: `Uma função anônima é exatamente o que o nome diz: uma função sem nome. Você declara ela inline, no mesmo ponto onde quer usá-la. A sintaxe é a mesma de uma função normal, só que você omite o nome e, geralmente, atribui a função a uma variável ou a invoca imediatamente.

Por que existir? Por três motivos práticos. Primeiro, para criar lógica local que não merece um nome global no pacote — algo usado uma vez só, num lugar só. Segundo, para passar comportamento como argumento (callbacks): em vez de declarar uma função separada lá no topo do arquivo, você escreve direto onde ela é necessária. Terceiro, para ser usada com goroutines, onde frequentemente você quer disparar um pedaço de código em paralelo sem dar nome a ele.

A sintaxe básica é func(parametros) tipoRetorno { corpo }. Para chamar imediatamente (o famoso IIFE de JavaScript, immediately invoked function expression), basta colocar (argumentos) logo depois: func() { fmt.Println("oi") }(). Esse padrão é menos comum em Go do que em JavaScript, mas aparece, especialmente para criar escopos locais limitados ou rodar inicialização única.

Comparando com outras linguagens: Python tem lambda, mas é limitado a uma expressão única. JavaScript tem arrow functions e function expressions com recursos completos. Java tem lambdas desde a versão 8, mas com limitações de variáveis efetivamente finais. Em Go, funções anônimas são funções de primeira classe completas — fazem tudo que uma função nomeada faz, e sem restrições estranhas.

Cuidado importante: funções anônimas combinadas com goroutines têm uma armadilha clássica de captura de variável de loop. Vamos ver isso direito no capítulo de closures, mas já guarde no radar.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Função anônima atribuída a uma variável.
	dobrar := func(x int) int {
		return x * 2
	}
	fmt.Println(dobrar(7)) // → 14
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Invocação imediata: declara e chama na mesma linha.
	resultado := func(a, b int) int {
		return a + b
	}(10, 5)
	fmt.Println("Soma:", resultado)
	// → saída: Soma: 15
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sort"
)

// Função anônima usada como callback de comparação no sort.
func main() {
	pessoas := []struct {
		Nome  string
		Idade int
	}{
		{"Ana", 30},
		{"Bruno", 25},
		{"Clara", 35},
	}

	// Ordena por idade crescente passando função anônima.
	sort.Slice(pessoas, func(i, j int) bool {
		return pessoas[i].Idade < pessoas[j].Idade
	})

	for _, p := range pessoas {
		fmt.Println(p.Nome, p.Idade)
	}
	// → saída:
	// Bruno 25
	// Ana 30
	// Clara 35
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função que recebe uma função anônima e aplica em cada item.
func paraCada(itens []int, acao func(int)) {
	for _, item := range itens {
		acao(item)
	}
}

func main() {
	numeros := []int{1, 2, 3}
	paraCada(numeros, func(n int) {
		fmt.Println("Item:", n*10)
	})
	// → saída:
	// Item: 10
	// Item: 20
	// Item: 30
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função anônima rodando em uma goroutine.
// Cuidado: o programa termina antes da goroutine executar
// se você não esperar (tema do capítulo de Goroutines).
func main() {
	done := make(chan bool)

	go func() {
		fmt.Println("Executando em paralelo!")
		done <- true
	}()

	<-done // espera a goroutine sinalizar
	// → saída: Executando em paralelo!
}`,
      },
    ],
    points: [
      "Funções anônimas são declaradas com func(...) {...} sem nome.",
      "Podem ser atribuídas a variáveis, passadas como argumentos ou invocadas imediatamente.",
      "Idiomático: usar funções anônimas em callbacks curtos, especialmente em sort.Slice.",
      "Combinam muito bem com goroutines para disparar trabalho paralelo curto.",
      "Não precisam de tipo declarado quando atribuídas: usar := infere o tipo da função.",
      "Para invocar imediatamente, adicione (argumentos) logo após o corpo.",
      "Armadilha: capturar variável de loop dentro de função anônima em loop antigo (até Go 1.21) — gera bug clássico.",
      "Erro comum: confundir definição com invocação — esquecer os parênteses finais quando quer rodar na hora.",
    ],
    alerts: [
      {
        type: "info",
        content: "A partir de Go 1.22, a semântica de captura de variável de loop mudou: cada iteração tem sua própria cópia da variável, eliminando a armadilha histórica que afetava goroutines dentro de loops.",
      },
      {
        type: "tip",
        content: "Use funções anônimas para manter lógica local junto do contexto. Se você se pega declarando uma função no topo do arquivo só para usar uma vez bem ali embaixo, ela provavelmente quer ser anônima.",
      },
      {
        type: "warning",
        content: "Funções anônimas grandes (mais de 15 linhas) viram um pesadelo de leitura. Quando começar a ficar longa, extraia para uma função nomeada e ganhe nome, documentação e testabilidade.",
      },
    ],
  },
  {
    slug: "closures",
    section: "funcoes",
    title: "Closures",
    difficulty: "avancado",
    subtitle: "Funções que se lembram do ambiente onde nasceram: o conceito mais poderoso e mais traiçoeiro deste capítulo",
    intro: `Uma closure é uma função que captura e mantém referência a variáveis do escopo onde ela foi criada, mesmo depois que esse escopo terminou de executar. Em Go, toda função anônima que usa uma variável externa vira uma closure automaticamente — não tem palavra-chave especial, é o comportamento padrão.

Para entender por que isso é poderoso, pense numa fábrica de funções. Você cria uma função que devolve outra função, e a função devolvida lembra dos parâmetros da função externa. Isso permite construir coisas como contadores independentes, geradores de IDs únicos, configuradores parciais (currying), middlewares HTTP, etc. É uma das ferramentas mais elegantes da programação funcional, e Go suporta tudo isso de forma natural.

A pegadinha — e ela existe — é que closures capturam variáveis por referência, não por valor. Isso significa que se a variável capturada muda depois, a closure vê a mudança. Isso é uma fonte clássica de bugs em loops, especialmente quando combinado com goroutines. Em Go até a versão 1.21, era preciso fazer um truque (criar uma variável local dentro do loop) para evitar que todas as closures vissem o mesmo valor final. A partir do Go 1.22, a semântica mudou: cada iteração de loop ganha uma cópia nova da variável, resolvendo o problema na raiz.

Comparado a Python, onde closures também capturam por referência (e geram a mesma confusão em loops), ou JavaScript, onde let e const dão escopo de bloco, Go agora se comporta de forma intuitiva. Mas se você está mantendo código antigo de Go 1.21 ou inferior, esteja atento.

Closures são a base de muitos padrões idiomáticos: handlers HTTP que precisam de contexto, funções de inicialização lazy, callbacks que carregam estado, factory functions de validação. Dominar esse conceito é dominar uma das partes mais ricas da linguagem.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Fábrica de contadores: cada chamada cria um contador independente.
func criarContador() func() int {
	count := 0 // capturada pela closure abaixo
	return func() int {
		count++
		return count
	}
}

func main() {
	c1 := criarContador()
	c2 := criarContador()

	fmt.Println(c1()) // → 1
	fmt.Println(c1()) // → 2
	fmt.Println(c1()) // → 3
	fmt.Println(c2()) // → 1 (independente!)
	fmt.Println(c1()) // → 4
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Currying: configurar parcialmente uma função.
// Aqui, multiplicadorDe devolve uma função que multiplica por n.
func multiplicadorDe(n int) func(int) int {
	return func(x int) int {
		return x * n
	}
}

func main() {
	dobro := multiplicadorDe(2)
	triplo := multiplicadorDe(3)

	fmt.Println(dobro(7))  // → 14
	fmt.Println(triplo(7)) // → 21
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Closure mantendo estado: saldo bancário simples.
func criarConta(saldoInicial float64) (func(float64), func(float64), func() float64) {
	saldo := saldoInicial

	depositar := func(valor float64) { saldo += valor }
	sacar := func(valor float64) {
		if valor <= saldo {
			saldo -= valor
		}
	}
	consultar := func() float64 { return saldo }

	return depositar, sacar, consultar
}

func main() {
	dep, saq, ver := criarConta(100)
	dep(50)
	saq(30)
	fmt.Println("Saldo final:", ver())
	// → saída: Saldo final: 120
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Cuidado clássico: closures dentro de loop (Go 1.22+).
// Em versões anteriores a 1.22, todas imprimiriam o último valor (3).
// Em Go 1.22+, cada iteração tem seu próprio i, então funciona como esperado.
func main() {
	funcoes := []func(){}
	for i := 0; i < 3; i++ {
		funcoes = append(funcoes, func() {
			fmt.Println("i =", i)
		})
	}
	for _, f := range funcoes {
		f()
	}
	// → saída em Go 1.22+:
	// i = 0
	// i = 1
	// i = 2
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Padrão idiomático: middleware com closure.
// Recebe uma função, devolve uma versão "decorada".
func comLog(nome string, f func(int) int) func(int) int {
	return func(x int) int {
		fmt.Printf("[LOG] chamando %s com %d\n", nome, x)
		r := f(x)
		fmt.Printf("[LOG] %s devolveu %d\n", nome, r)
		return r
	}
}

func main() {
	quadrado := func(x int) int { return x * x }
	quadradoLogado := comLog("quadrado", quadrado)
	quadradoLogado(5)
	// → saída:
	// [LOG] chamando quadrado com 5
	// [LOG] quadrado devolveu 25
}`,
      },
    ],
    points: [
      "Closures capturam variáveis do escopo onde foram criadas, por referência.",
      "Em Go, qualquer função anônima que usa variável externa já é uma closure.",
      "Permitem criar fábricas de funções, contadores privados e currying parcial.",
      "Idiomático: usar closures para construir middleware, handlers HTTP com contexto e validators configuráveis.",
      "Em Go 1.22+, variáveis de loop ganham nova instância por iteração — bug clássico ressolvido.",
      "Variáveis capturadas continuam vivas na memória enquanto a closure existir (cuidado com leaks).",
      "Armadilha: em Go ≤ 1.21, capturar variável de loop em goroutine causava todas verem o último valor.",
      "Erro comum: assumir que closure copia a variável — ela referencia, então mudanças externas são vistas.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Se você mantém código Go 1.21 ou anterior, revise loops com closures e goroutines. O bug de captura é silencioso: o programa roda, mas com valores inesperados. Atualize o Go ou use a técnica i := i no início do loop.",
      },
      {
        type: "tip",
        content: "Closures são uma forma natural de simular 'estado privado' sem usar struct + método. Para coisas pequenas, é mais expressivo do que criar tipo só para guardar uma variável.",
      },
      {
        type: "info",
        content: "Internamente, Go aloca as variáveis capturadas no heap em vez do stack quando detecta uma closure. Isso é seguro e gerenciado pelo garbage collector, mas tem custo — em hot paths de altíssima performance, prefira passar valores explicitamente.",
      },
    ],
  },
  {
    slug: "recursao",
    section: "funcoes",
    title: "Recursão",
    difficulty: "intermediario",
    subtitle: "Quando uma função se chama a si mesma: elegância matemática e o limite de pilha que você precisa respeitar",
    intro: `Recursão é o ato de uma função chamar a si mesma para resolver uma versão menor do mesmo problema. É uma técnica clássica em ciência da computação, e em algumas situações ela leva a código tão elegante quanto curto. Em Go, recursão funciona como em qualquer linguagem: você simplesmente chama a função pelo nome dentro do próprio corpo.

Toda função recursiva precisa de duas partes: o caso base, que diz quando parar de recorrer, e o passo recursivo, que reduz o problema e chama a si mesma. Esquecer o caso base resulta em recursão infinita e, eventualmente, estouro de pilha (stack overflow). Em Go, isso se manifesta como um runtime error: stack overflow, e o programa morre.

Os exemplos canônicos são fatorial e Fibonacci. Fatorial de n é n vezes fatorial de n-1, com caso base de 0 ou 1 retornando 1. Fibonacci é a soma dos dois Fibonaccis anteriores, com casos base de 0 e 1. São bons exemplos didáticos, mas raramente são a melhor solução em produção: Fibonacci recursivo ingênuo tem complexidade exponencial, enquanto a versão iterativa é linear. Use os exemplos para aprender a forma, não como modelo de performance.

Onde recursão brilha é em estruturas naturalmente recursivas: árvores (DOM, JSON aninhado, sistemas de arquivos), grafos, parsers, problemas de divisão e conquista (merge sort, quick sort). Tentar resolver navegação em árvore com loops vira código complicado; com recursão, fica direto e legível.

Diferentemente de linguagens funcionais como Haskell ou Erlang, Go não otimiza tail call (chamada em posição final) — então mesmo recursões "limpas" consomem pilha proporcional à profundidade. A pilha padrão de uma goroutine começa pequena (8KB) mas cresce até 1GB conforme necessário, então recursões moderadas funcionam, mas profundidades muito grandes (milhões de chamadas) vão estourar.

Quando recursão começa a doer, o caminho idiomático em Go é converter para iteração com um stack/queue explícito, ou usar memoização para cachear resultados intermediários. Vamos ver os dois caminhos.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Fatorial clássico. n! = n * (n-1)!
// Caso base: 0! = 1.
func fatorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * fatorial(n-1)
}

func main() {
	fmt.Println(fatorial(5)) // → 120
	fmt.Println(fatorial(7)) // → 5040
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Fibonacci recursivo ingênuo. Fácil de escrever, mas exponencial.
// Para n grande, demora muito (cada chamada gera duas).
func fib(n int) int {
	if n < 2 {
		return n
	}
	return fib(n-1) + fib(n-2)
}

func main() {
	for i := 0; i < 10; i++ {
		fmt.Print(fib(i), " ")
	}
	// → saída: 0 1 1 2 3 5 8 13 21 34
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Fibonacci com memoização: guardamos resultados em um map.
// Reduz de exponencial para linear no tempo.
func fibMemo(n int, cache map[int]int) int {
	if n < 2 {
		return n
	}
	if v, ok := cache[n]; ok {
		return v
	}
	r := fibMemo(n-1, cache) + fibMemo(n-2, cache)
	cache[n] = r
	return r
}

func main() {
	cache := map[int]int{}
	fmt.Println(fibMemo(50, cache))
	// → saída: 12586269025 (instantâneo)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Recursão em árvore: somar todos os valores de uma árvore binária.
type No struct {
	Valor    int
	Esquerda *No
	Direita  *No
}

func somarArvore(n *No) int {
	if n == nil {
		return 0 // caso base
	}
	return n.Valor + somarArvore(n.Esquerda) + somarArvore(n.Direita)
}

func main() {
	raiz := &No{
		Valor: 10,
		Esquerda: &No{Valor: 5,
			Esquerda: &No{Valor: 3},
		},
		Direita: &No{Valor: 7},
	}
	fmt.Println("Soma:", somarArvore(raiz))
	// → saída: Soma: 25
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Versão iterativa de fatorial: sem usar pilha.
// Para problemas simples, costuma ser mais eficiente.
func fatorialIterativo(n int) int {
	resultado := 1
	for i := 2; i <= n; i++ {
		resultado *= i
	}
	return resultado
}

func main() {
	fmt.Println(fatorialIterativo(10))
	// → saída: 3628800
}`,
      },
    ],
    points: [
      "Toda função recursiva precisa de pelo menos um caso base que não chama a si mesma.",
      "O passo recursivo deve reduzir o problema, aproximando-o do caso base.",
      "Sem caso base, a função roda até estourar a pilha (runtime error: stack overflow).",
      "Idiomático: usar recursão para estruturas naturalmente recursivas (árvores, grafos, parsers).",
      "Memoização (cachear resultados em map) transforma recursões exponenciais em lineares.",
      "Go não tem otimização de tail call; profundidades muito grandes vão estourar a pilha.",
      "Pilha de goroutine começa em 8KB e cresce dinamicamente até 1GB por padrão.",
      "Armadilha: usar Fibonacci recursivo ingênuo para n>40 — fica lento absurdamente sem memoização.",
      "Erro comum: esquecer o caso base ou colocá-lo errado, causando recursão infinita.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Recursão é elegante para aprender, mas em produção avalie sempre se a versão iterativa não seria mais rápida e segura. Loops têm custo constante; recursão tem custo de pilha por nível.",
      },
      {
        type: "tip",
        content: "Quando a recursão precisar guardar resultados intermediários, use map para memoização. É um padrão que resolve uma família enorme de problemas (programação dinâmica top-down).",
      },
      {
        type: "info",
        content: "Em Go, você pode controlar o tamanho máximo da pilha com runtime/debug.SetMaxStack, mas isso quase nunca é a resposta certa — refatorar para iteração ou memoização costuma ser melhor.",
      },
    ],
  },
  {
    slug: "funcoes-primeira-classe",
    section: "funcoes",
    title: "Funções como cidadãs de primeira classe",
    difficulty: "avancado",
    subtitle: "Funções que viajam como dados: passar como argumento, retornar de outras funções e armazenar em coleções",
    intro: `Em Go, funções não são apenas blocos de código — elas são valores completos. Isso significa que uma função pode ser atribuída a uma variável, passada como argumento para outra função, devolvida de uma função e até guardada em slices ou maps. Esse conceito tem nome: funções de primeira classe (first-class functions). É a base de toda programação funcional, mas você não precisa ser fanático por paradigma para tirar proveito disso no dia a dia.

A consequência prática é enorme. Você pode escrever funções genéricas que recebem comportamento como parâmetro: ordenar com critério dinâmico, filtrar listas com condição arbitrária, mapear coleções aplicando transformações, montar pipelines de processamento. Isso é exatamente o que linguagens como JavaScript fazem com arrays.map e arrays.filter, ou Python com map() e filter(). Em Go, você implementa esses padrões à mão (ou usa generics desde Go 1.18 para criar versões reutilizáveis).

A sintaxe é direta. Uma função tem um tipo, escrito como func(parametros) tipoRetorno. Esse tipo pode ser usado como qualquer outro: na declaração de uma variável (var f func(int) int), em parâmetros (func aplicar(f func(int) int)), em retorno (func criar() func() int), em campos de struct, em slices ([]func() error), em maps (map[string]func()).

Compare com Java pré-versão 8, onde para passar comportamento você precisava criar uma classe anônima implementando uma interface. Era verboso. Em Go, isso é nativo: você passa a função direto, sem cerimônia.

Esse poder vem com responsabilidade. Funções armazenadas em estruturas precisam ser pensadas como qualquer dependência: testabilidade, ciclo de vida, captura de variáveis. Mas dominar funções como valores é um divisor de águas — abre a porta para padrões idiomáticos como o pattern de opções funcionais, handlers HTTP, middleware encadeado e muito mais.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Tipo função: nomeie um tipo função para reusar a assinatura.
type Operacao func(int, int) int

func aplicar(a, b int, op Operacao) int {
	return op(a, b)
}

func main() {
	soma := func(x, y int) int { return x + y }
	multiplica := func(x, y int) int { return x * y }

	fmt.Println(aplicar(3, 4, soma))       // → 7
	fmt.Println(aplicar(3, 4, multiplica)) // → 12
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Filtrar slice usando função como critério.
// Recebe slice e função predicado, devolve novo slice.
func filtrar(itens []int, ok func(int) bool) []int {
	resultado := []int{}
	for _, x := range itens {
		if ok(x) {
			resultado = append(resultado, x)
		}
	}
	return resultado
}

func main() {
	numeros := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	pares := filtrar(numeros, func(n int) bool {
		return n%2 == 0
	})
	fmt.Println(pares)
	// → saída: [2 4 6 8 10]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Map de funções: dispatch dinâmico baseado em string.
// Útil para command-line tools ou roteamento simples.
func main() {
	comandos := map[string]func(){
		"oi":     func() { fmt.Println("Olá!") },
		"tchau":  func() { fmt.Println("Até logo!") },
		"ajuda":  func() { fmt.Println("Comandos: oi, tchau, ajuda") },
	}

	entrada := "oi"
	if cmd, ok := comandos[entrada]; ok {
		cmd()
	} else {
		fmt.Println("Comando desconhecido")
	}
	// → saída: Olá!
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Padrão de opções funcionais: muito idiomático em libs Go.
// Cada "opção" é uma função que modifica um config.
type Config struct {
	Host    string
	Port    int
	Verbose bool
}

type Opcao func(*Config)

func ComHost(h string) Opcao  { return func(c *Config) { c.Host = h } }
func ComPort(p int) Opcao     { return func(c *Config) { c.Port = p } }
func ComVerbose() Opcao       { return func(c *Config) { c.Verbose = true } }

func NovoServidor(opcoes ...Opcao) *Config {
	c := &Config{Host: "localhost", Port: 8080}
	for _, opt := range opcoes {
		opt(c)
	}
	return c
}

func main() {
	srv := NovoServidor(ComHost("0.0.0.0"), ComPort(9090), ComVerbose())
	fmt.Printf("%+v\n", srv)
	// → saída: &{Host:0.0.0.0 Port:9090 Verbose:true}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função que retorna função: gerador de validadores.
func validadorMinimo(min int) func(int) error {
	return func(n int) error {
		if n < min {
			return fmt.Errorf("valor %d abaixo do mínimo %d", n, min)
		}
		return nil
	}
}

func main() {
	idadeOk := validadorMinimo(18)
	fmt.Println(idadeOk(20)) // → <nil>
	fmt.Println(idadeOk(15)) // → valor 15 abaixo do mínimo 18
}`,
      },
    ],
    points: [
      "Funções em Go têm tipo: func(parametros) tipoRetorno. Use type para nomear assinaturas reutilizáveis.",
      "Funções podem ser atribuídas a variáveis, passadas como argumentos e retornadas de outras funções.",
      "Slices e maps de funções permitem dispatch dinâmico (roteamento, comandos, callbacks).",
      "Idiomático: padrão de opções funcionais (functional options) para construtores configuráveis.",
      "Generics (Go 1.18+) permitem escrever filter/map/reduce reutilizáveis para qualquer tipo.",
      "Closures combinam-se naturalmente com funções de primeira classe para fábricas de comportamento.",
      "Armadilha: armazenar funções em map sem entender que cada uma carrega seu próprio estado capturado.",
      "Erro comum: confundir o tipo da função com o resultado da chamada — func() int é tipo, int é resultado.",
    ],
    alerts: [
      {
        type: "success",
        content: "O padrão de opções funcionais (functional options) é amplamente usado em bibliotecas profissionais de Go, como gRPC e o cliente do AWS SDK. Aprender ele é entender boa parte do estilo idiomático moderno.",
      },
      {
        type: "tip",
        content: "Quando uma assinatura de função aparecer em vários lugares, defina um tipo nomeado com type. Além de reduzir repetição, fica óbvio para quem lê qual é o contrato esperado.",
      },
      {
        type: "info",
        content: "Funções em Go são valores comparáveis apenas com nil. Você não pode comparar duas funções entre si com == para ver se são 'a mesma'. O compilador rejeita isso para evitar ambiguidades.",
      },
    ],
  },
  {
    slug: "defer-recover",
    section: "funcoes",
    title: "defer, panic e recover",
    difficulty: "avancado",
    subtitle: "O mecanismo idiomático de Go para limpeza garantida e o tratamento controlado de panics catastróficos",
    intro: `Defer é uma das construções mais elegantes de Go. Quando você prefixa uma chamada de função com defer, ela não executa naquele momento — fica agendada para rodar imediatamente antes da função atual retornar, não importa por qual caminho. Isso resolve um problema universal de programação: garantir limpeza de recursos. Abriu arquivo? Defer Close. Pegou um lock? Defer Unlock. Iniciou uma transação? Defer Rollback (ou Commit condicional).

Antes de defer, em linguagens como C, você precisava lembrar de fechar o arquivo em cada caminho de saída da função (e era fácil esquecer um). Em Java/C# usa-se try/finally ou using/with. Em Python, o context manager (with) faz papel parecido. Mas defer em Go é mais flexível: você pode adicionar quantos defers quiser, e eles executam em ordem inversa de declaração (LIFO, último a entrar, primeiro a sair) — perfeito para desfazer ações em ordem segura.

Panic é o irmão violento de defer. Quando algo realmente catastrófico acontece — acesso a índice fora dos limites, divisão por zero em inteiro, null pointer dereference — Go dispara um panic. O panic interrompe a execução normal, sobe pela pilha executando todos os defers que encontrar pelo caminho, e por padrão derruba o programa com um stack trace.

Recover é a chance de capturar um panic. Chamado de dentro de uma função deferida, ele intercepta o panic, devolve o valor associado e permite que a goroutine continue normalmente. Mas atenção: recover só funciona dentro de defer. Fora de defer, ele é um no-op.

O uso filosófico desses três é importante de entender. Em Go, panic NÃO é o substituto de exceções de Java. Você não usa panic para erros esperados, como arquivo não encontrado ou input inválido — para isso, devolve error. Panic é reservado para situações realmente excepcionais: bugs de programação, invariantes violados, falhas que mostram que algo está fundamentalmente errado. E recover é usado em fronteiras: handlers HTTP que não podem deixar o servidor cair, workers que precisam continuar mesmo se uma tarefa explodir. Usar essas ferramentas no dia a dia em vez de errors é considerado anti-idiomático e dificulta a vida de quem mantém o código depois.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
)

// defer garante que o arquivo será fechado, mesmo se algo falhar depois.
func lerArquivo(caminho string) error {
	f, err := os.Open(caminho)
	if err != nil {
		return err
	}
	defer f.Close() // executa quando lerArquivo terminar

	buf := make([]byte, 100)
	_, err = f.Read(buf)
	if err != nil {
		return err
	}
	fmt.Println(string(buf))
	return nil
}

func main() {
	if err := lerArquivo("/etc/hostname"); err != nil {
		fmt.Println("Erro:", err)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// defers executam em ordem LIFO: último declarado, primeiro a rodar.
func main() {
	fmt.Println("início")
	defer fmt.Println("primeiro defer (último a rodar)")
	defer fmt.Println("segundo defer (penúltimo)")
	defer fmt.Println("terceiro defer (primeiro a rodar)")
	fmt.Println("fim do corpo")
	// → saída:
	// início
	// fim do corpo
	// terceiro defer (primeiro a rodar)
	// segundo defer (penúltimo)
	// primeiro defer (último a rodar)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// panic interrompe a execução. Sem recover, o programa morre.
func dividir(a, b int) int {
	if b == 0 {
		panic("divisão por zero!")
	}
	return a / b
}

func main() {
	fmt.Println(dividir(10, 2)) // → 5
	fmt.Println(dividir(10, 0)) // panic e fim
	fmt.Println("não chega aqui")
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// recover dentro de um defer captura o panic.
// Permite a função (ou goroutine) continuar.
func divisaoSegura(a, b int) (resultado int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("recuperado de panic: %v", r)
		}
	}()
	resultado = a / b // se b == 0, panic
	return
}

func main() {
	r, err := divisaoSegura(10, 0)
	fmt.Println("resultado:", r, "err:", err)
	// → saída: resultado: 0 err: recuperado de panic: runtime error: integer divide by zero

	r, err = divisaoSegura(10, 2)
	fmt.Println("resultado:", r, "err:", err)
	// → saída: resultado: 5 err: <nil>
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Padrão real: middleware de recover em servidor HTTP simulado.
// Em handlers reais, você usa isso para impedir que um panic
// derrube a goroutine que atende a requisição.
func atenderComProtecao(handler func()) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("[ERRO] requisição falhou:", r)
		}
	}()
	handler()
}

func main() {
	atenderComProtecao(func() {
		fmt.Println("processando requisição A...")
	})
	atenderComProtecao(func() {
		var s []int
		_ = s[10] // panic: index out of range
	})
	atenderComProtecao(func() {
		fmt.Println("processando requisição C...")
	})
	// → saída:
	// processando requisição A...
	// [ERRO] requisição falhou: runtime error: index out of range [10] with length 0
	// processando requisição C...
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Cuidado: argumentos do defer são avaliados na hora do defer,
// não na hora da execução.
func main() {
	x := 10
	defer fmt.Println("x no momento do defer =", x) // captura 10
	x = 99
	fmt.Println("x antes de retornar =", x)
	// → saída:
	// x antes de retornar = 99
	// x no momento do defer = 10
}`,
      },
    ],
    points: [
      "defer agenda uma chamada para rodar imediatamente antes da função retornar.",
      "Defers executam em ordem LIFO: último declarado é o primeiro a rodar.",
      "Use defer para garantir limpeza: fechar arquivos, soltar locks, encerrar conexões.",
      "Argumentos do defer são avaliados no momento da declaração, não da execução.",
      "panic interrompe execução, sobe a pilha executando defers até o programa morrer (ou ser recuperado).",
      "recover só funciona se chamado de dentro de uma função deferida; fora disso é no-op.",
      "Idiomático: use error para falhas esperadas; reserve panic para bugs e invariantes violados.",
      "Armadilha: usar panic/recover como try/catch de Java — totalmente anti-idiomático em Go.",
      "Erro comum: chamar defer dentro de loop achando que executa ao fim de cada iteração — só executa ao fim da função.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Recover não recupera de panics em outras goroutines. Cada goroutine precisa do seu próprio defer+recover. Um panic não tratado em qualquer goroutine derruba o programa inteiro.",
      },
      {
        type: "warning",
        content: "Não abuse de defer em loops apertados. Cada defer tem um pequeno custo de alocação. Em hot paths processando milhões de itens, isso vira gargalo. Mova o defer para fora do loop ou faça cleanup explícito.",
      },
      {
        type: "tip",
        content: "Em servidores HTTP de produção, sempre embrulhe os handlers com middleware de recover. Um panic em uma única requisição não pode derrubar todo o servidor que está atendendo milhares de outras.",
      },
      {
        type: "info",
        content: "A função recover devolve o valor passado para panic (que pode ser qualquer coisa: string, error, struct). É comum usar uma type assertion para extrair tipos específicos quando você panica com algo estruturado.",
      },
    ],
  },
];
