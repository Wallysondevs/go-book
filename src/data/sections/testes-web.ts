import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "testing-pkg",
    section: "testes-web",
    title: "O pacote testing: a base de tudo",
    difficulty: "iniciante",
    subtitle: "Como Go traz testes para dentro da linguagem, sem framework, sem instalação extra",
    intro: `Em muitas linguagens, escrever testes envolve escolher um framework (JUnit em Java, pytest em Python, Jest em JavaScript), instalar dependências, configurar arquivos e aprender uma DSL paralela cheia de "describe", "it", "expect". Em Go, testar faz parte da linguagem desde o primeiro dia. Você cria um arquivo terminado em _test.go, escreve uma função começando com Test, e roda go test. Acabou. Não tem assert, não tem mágica, não tem fixture invisível.

Essa decisão é proposital e bem idiomática Go: a comunidade prefere ferramentas simples e padronizadas a frameworks elaborados. O resultado é que qualquer projeto Go, do mais novo ao mais antigo, segue o mesmo formato. Você abre um repositório qualquer no GitHub, encontra um arquivo _test.go e já sabe ler. Compare com Java, onde dependendo do projeto você cai em JUnit 4, JUnit 5, TestNG ou Spock — cada um com sua sintaxe.

A função de teste recebe um único parâmetro, *testing.T, que é o seu controle remoto: você chama t.Error para reportar uma falha sem parar, t.Fatal para falhar e abortar, t.Log para registrar mensagens, t.Skip para pular. Não existe "expected/actual" embutido; você escreve um if comum em Go e chama t.Errorf quando deu errado. Parece primitivo, mas na prática deixa o teste explícito e fácil de debugar.

Os arquivos de teste convivem no mesmo diretório do código que testam, no mesmo package. Isso te dá acesso a funções não exportadas (minúsculas), o que facilita testar detalhes internos. Existe também a convenção do package "_test" externo, usado quando você quer testar como um usuário externo veria, mas isso é assunto para depois. Por enquanto, fixe a regra de ouro: arquivo termina em _test.go, função começa com Test, primeiro parâmetro é *testing.T.`,
    codes: [
      {
        lang: "bash",
        code: `# Crie um módulo novo para acompanhar os exemplos.
mkdir banco && cd banco
go mod init exemplo/banco
# Isso gera um arquivo go.mod que define o nome do módulo.`,
      },
      {
        lang: "go",
        code: `// Arquivo: conta.go — código de produção que vamos testar.
package banco

import "errors"

// ErrSaldoInsuficiente é devolvido quando você tenta sacar mais do que tem.
var ErrSaldoInsuficiente = errors.New("saldo insuficiente")

type Conta struct {
	Saldo float64
}

// Sacar reduz o saldo. Devolve erro se não houver fundos.
func (c *Conta) Sacar(valor float64) error {
	if valor > c.Saldo {
		return ErrSaldoInsuficiente
	}
	c.Saldo -= valor
	return nil
}`,
      },
      {
        lang: "go",
        code: `// Arquivo: conta_test.go — fica no mesmo diretório, mesmo package.
package banco

import (
	"errors"
	"testing"
)

func TestSacarComSaldoSuficiente(t *testing.T) {
	c := &Conta{Saldo: 100}
	err := c.Sacar(30)
	if err != nil {
		// t.Fatalf aborta este teste imediatamente.
		t.Fatalf("não esperava erro, recebi: %v", err)
	}
	if c.Saldo != 70 {
		// t.Errorf registra falha mas continua executando.
		t.Errorf("saldo esperado 70, recebi %v", c.Saldo)
	}
}

func TestSacarSemSaldo(t *testing.T) {
	c := &Conta{Saldo: 10}
	err := c.Sacar(50)
	if !errors.Is(err, ErrSaldoInsuficiente) {
		t.Errorf("esperava ErrSaldoInsuficiente, recebi %v", err)
	}
}`,
      },
      {
        lang: "bash",
        code: `# Rodando os testes do diretório atual:
go test
# → ok      exemplo/banco   0.003s

# Modo verboso, mostra cada teste e o resultado:
go test -v
# === RUN   TestSacarComSaldoSuficiente
# --- PASS: TestSacarComSaldoSuficiente (0.00s)
# === RUN   TestSacarSemSaldo
# --- PASS: TestSacarSemSaldo (0.00s)
# PASS

# Roda só um teste por nome (regex):
go test -run TestSacarSemSaldo -v`,
      },
      {
        lang: "go",
        code: `// Demonstrando a diferença entre Error/Errorf e Fatal/Fatalf.
package banco

import "testing"

func TestDiferencaErrorEFatal(t *testing.T) {
	t.Error("isto vira falha mas o teste continua")
	t.Log("esta linha ainda executa")
	t.Fatal("aqui o teste para de verdade")
	t.Log("esta linha NUNCA executa")
}`,
      },
    ],
    points: [
      "Arquivo de teste deve terminar em _test.go e ficar no mesmo diretório do código.",
      "Funções de teste começam com Test, recebem *testing.T e não retornam nada.",
      "t.Error/Errorf marca falha mas continua; t.Fatal/Fatalf falha e aborta o teste.",
      "Use errors.Is para comparar erros sentinela em vez de igualdade direta.",
      "go test -v mostra cada teste; go test -run NomeRegex roda só o que casar.",
      "Idiomático: sem assert library — escreva if comum e t.Errorf descritivo.",
      "Armadilha: nomear a função como testAlgo (minúsculo). O Go ignora silenciosamente.",
      "Armadilha: esquecer o sufixo _test.go e o teste virar código de produção.",
    ],
    alerts: [
      {
        type: "info",
        content: "O pacote testing faz parte da biblioteca padrão. Não há nada para instalar nem configurar; basta ter Go instalado.",
      },
      {
        type: "tip",
        content: "Mensagens de erro descritivas economizam horas de debug. Inclua o valor esperado e o recebido em todo t.Errorf, jamais escreva apenas 'falhou'.",
      },
      {
        type: "warning",
        content: "Arquivos _test.go nunca entram no binário final compilado com go build. Isso é proposital: testes não vão para produção.",
      },
    ],
  },
  {
    slug: "table-driven-tests",
    section: "testes-web",
    title: "Table-driven tests: o jeito Go de testar muitos casos",
    difficulty: "iniciante",
    subtitle: "Um padrão tão comum em Go que virou cultura: descreva os casos numa tabela e itere",
    intro: `Quando você precisa testar a mesma função com várias entradas diferentes, a tentação é copiar o teste e mudar os valores. Em uma semana você tem trinta funções TestSomaPositivos, TestSomaZero, TestSomaNegativos, todas idênticas. Vira manutenção infernal: descobriu um bug e precisa corrigir em trinta lugares.

Em Python você usaria pytest.mark.parametrize, em JavaScript o test.each do Jest. Go tem uma solução mais simples e mais explícita: você cria um slice de structs onde cada elemento é um caso de teste, e itera com um for. Não precisa de biblioteca, é só Go puro. Esse padrão é tão comum que ganhou um nome próprio na comunidade: table-driven tests.

A estrutura típica tem três partes: um slice de structs anônimos com nome, entrada e saída esperada; um loop for range que percorre os casos; e dentro do loop, t.Run com o nome do caso para criar um subteste. Esse último detalhe é o que diferencia um teste profissional: cada caso vira uma linha separada na saída, fica fácil rodar só um caso problemático com -run, e quando um falha você sabe exatamente qual.

Além de reduzir código duplicado, table-driven tests servem como documentação. Lendo a tabela, qualquer pessoa entende em segundos quais cenários a função cobre: entrada vazia, entrada gigante, valor negativo, caractere especial, etc. Em revisões de código no GitHub é comum ver "faltou um caso na tabela para X" — o formato convida a pensar em casos de borda.`,
    codes: [
      {
        lang: "go",
        code: `// validador.go — função que vamos testar com vários casos.
package validador

import "strings"

// EhEmailValido faz uma checagem ingênua mas ilustrativa.
func EhEmailValido(s string) bool {
	if len(s) < 3 || len(s) > 254 {
		return false
	}
	at := strings.Index(s, "@")
	if at <= 0 || at == len(s)-1 {
		return false
	}
	return strings.Contains(s[at+1:], ".")
}`,
      },
      {
        lang: "go",
        code: `// validador_test.go — table-driven test no formato canônico.
package validador

import "testing"

func TestEhEmailValido(t *testing.T) {
	// Cada linha é um cenário; ler a tabela já documenta a função.
	casos := []struct {
		nome     string
		entrada  string
		esperado bool
	}{
		{"email comum", "ana@empresa.com", true},
		{"sem arroba", "anaempresa.com", false},
		{"arroba no inicio", "@empresa.com", false},
		{"arroba no fim", "ana@", false},
		{"sem ponto no dominio", "ana@empresa", false},
		{"string vazia", "", false},
		{"caractere acentuado", "joão@correio.br", true},
	}

	for _, c := range casos {
		// t.Run cria um subteste nomeado para cada caso.
		t.Run(c.nome, func(t *testing.T) {
			got := EhEmailValido(c.entrada)
			if got != c.esperado {
				t.Errorf("EhEmailValido(%q) = %v; esperava %v",
					c.entrada, got, c.esperado)
			}
		})
	}
}`,
      },
      {
        lang: "bash",
        code: `# Saída em modo verboso mostra cada subteste:
go test -v
# === RUN   TestEhEmailValido
# === RUN   TestEhEmailValido/email_comum
# --- PASS: TestEhEmailValido/email_comum (0.00s)
# === RUN   TestEhEmailValido/sem_arroba
# --- PASS: TestEhEmailValido/sem_arroba (0.00s)
# ...

# Rode apenas um caso específico (note a barra):
go test -run "TestEhEmailValido/sem_arroba" -v`,
      },
      {
        lang: "go",
        code: `// Variação útil: tabela com erros esperados em vez de booleanos.
package calc

import (
	"errors"
	"testing"
)

var ErrDivPorZero = errors.New("divisão por zero")

func Dividir(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrDivPorZero
	}
	return a / b, nil
}

func TestDividir(t *testing.T) {
	casos := []struct {
		nome    string
		a, b    int
		quer    int
		querErr error
	}{
		{"divisão exata", 10, 2, 5, nil},
		{"divisão truncada", 7, 2, 3, nil},
		{"por zero", 1, 0, 0, ErrDivPorZero},
	}
	for _, c := range casos {
		t.Run(c.nome, func(t *testing.T) {
			got, err := Dividir(c.a, c.b)
			if !errors.Is(err, c.querErr) {
				t.Fatalf("erro = %v; queria %v", err, c.querErr)
			}
			if got != c.quer {
				t.Errorf("Dividir(%d,%d) = %d; queria %d",
					c.a, c.b, got, c.quer)
			}
		})
	}
}`,
      },
    ],
    points: [
      "Tabelas de teste centralizam casos em um único slice fácil de ler.",
      "Use t.Run dentro do loop para que cada caso apareça como subteste nomeado.",
      "Inclua um campo nome ou desc para identificar o caso na saída.",
      "Cubra felizes, bordas e erros na mesma tabela; ela vira documentação viva.",
      "%q no Errorf imprime strings com aspas, evitando ambiguidade com espaços.",
      "Idiomático: este é o jeito Go de testar — prefira tabelas a copiar funções.",
      "Armadilha: usar c (variável do loop) sem t.Run; falhas viram um borrão sem nome.",
      "Erro comum: esquecer de testar o caso de entrada vazia, que sempre quebra.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Adicione casos novos toda vez que aparecer um bug. A tabela cresce e a função fica mais robusta a cada bug corrigido.",
      },
      {
        type: "info",
        content: "A partir do Go 1.22 a variável do loop é nova a cada iteração. Em versões anteriores você precisava capturar c numa variável local antes de usá-la dentro de t.Run com t.Parallel.",
      },
      {
        type: "success",
        content: "Esse padrão é tão padronizado que ferramentas como o gotests geram automaticamente a estrutura de tabela a partir da assinatura da sua função.",
      },
    ],
  },
  {
    slug: "subtests-tparallel",
    section: "testes-web",
    title: "Subtests e t.Parallel: organizando e acelerando",
    difficulty: "intermediario",
    subtitle: "Como agrupar testes relacionados e rodar em paralelo para usar todos os núcleos da máquina",
    intro: `Subtests não são só uma curiosidade do table-driven. Eles são uma forma de criar uma hierarquia dentro de um único teste: você pode ter setup que vale para um grupo de checagens, agrupar variações de um mesmo cenário, ou simplesmente dar nomes descritivos a partes de uma verificação maior. A função t.Run cria um subteste com nome próprio que aparece na saída como TestPai/Filho.

Combinado com t.Parallel, isso fica ainda mais interessante. Em Go, o pacote testing executa cada teste de nível superior sequencialmente por padrão. Se você chamar t.Parallel() dentro de um teste, ele entra numa fila e roda em paralelo com outros que também chamaram t.Parallel(). O número máximo de testes em paralelo é controlado por GOMAXPROCS (que por padrão é o número de CPUs) e pode ser ajustado com -parallel.

Por que isso importa? Suítes de teste de projetos médios passam de mil testes facilmente. Rodando em série, demoram minutos. Rodando em paralelo, segundos. Isso muda a sua relação com o teste: quando o feedback vem em segundos, você roda go test ./... a cada save, e bugs morrem cedo. Quando demora dois minutos, você procrastina o teste e vai descobrir o bug muito depois.

Cuidado com paralelismo: testes que compartilham estado global (variáveis de pacote, arquivos no disco, conexões com banco de dados) podem corromper um ao outro. A regra é: testes paralelos precisam ser independentes. Use t.TempDir() para diretórios isolados, abra conexões fake separadas, e nunca dependa de ordem de execução.`,
    codes: [
      {
        lang: "go",
        code: `// Subtests aninhados para organizar cenários relacionados.
package carrinho

import "testing"

type Carrinho struct {
	itens map[string]int
}

func Novo() *Carrinho                  { return &Carrinho{itens: map[string]int{}} }
func (c *Carrinho) Adicionar(p string) { c.itens[p]++ }
func (c *Carrinho) Total() int {
	t := 0
	for _, v := range c.itens {
		t += v
	}
	return t
}

func TestCarrinho(t *testing.T) {
	t.Run("começa vazio", func(t *testing.T) {
		c := Novo()
		if c.Total() != 0 {
			t.Errorf("total = %d; queria 0", c.Total())
		}
	})

	t.Run("adicionar incrementa total", func(t *testing.T) {
		c := Novo()
		c.Adicionar("café")
		c.Adicionar("café")
		c.Adicionar("pão")
		if c.Total() != 3 {
			t.Errorf("total = %d; queria 3", c.Total())
		}
	})
}`,
      },
      {
        lang: "go",
        code: `// Paralelismo simples: cada teste declara t.Parallel().
package lento

import (
	"testing"
	"time"
)

func TestA(t *testing.T) {
	t.Parallel()                  // libera para rodar em paralelo
	time.Sleep(500 * time.Millisecond)
}

func TestB(t *testing.T) {
	t.Parallel()
	time.Sleep(500 * time.Millisecond)
}

func TestC(t *testing.T) {
	t.Parallel()
	time.Sleep(500 * time.Millisecond)
}
// Em série levaria 1.5s; em paralelo, ~0.5s numa máquina com 3+ CPUs.`,
      },
      {
        lang: "go",
        code: `// Table-driven com paralelismo. Cuidado com captura de variáveis em Go < 1.22.
package strutil

import (
	"strings"
	"testing"
)

func TestUpper(t *testing.T) {
	casos := []struct {
		nome string
		in   string
		out  string
	}{
		{"minusculas", "ana", "ANA"},
		{"mistura", "GoLang", "GOLANG"},
		{"vazia", "", ""},
	}
	for _, c := range casos {
		c := c // captura segura para Go anteriores a 1.22
		t.Run(c.nome, func(t *testing.T) {
			t.Parallel() // cada subteste roda em paralelo
			if got := strings.ToUpper(c.in); got != c.out {
				t.Errorf("ToUpper(%q) = %q; queria %q", c.in, got, c.out)
			}
		})
	}
}`,
      },
      {
        lang: "bash",
        code: `# Controla quantos testes paralelos rodam ao mesmo tempo.
go test -parallel 4 -v

# Mostra quanto tempo cada teste levou (útil para achar lentos):
go test -v -count=1
# -count=1 desliga o cache de testes; útil quando código não mudou
# mas você quer rodar de novo (ex: testes que dependem da rede).`,
      },
    ],
    points: [
      "t.Run cria um subteste nomeado e aparece como Pai/Filho na saída.",
      "t.Parallel marca o teste como elegível a rodar em paralelo com outros paralelos.",
      "-parallel N controla o limite de testes paralelos simultâneos (padrão = GOMAXPROCS).",
      "Use t.TempDir() para diretórios temporários isolados que somem ao fim do teste.",
      "Idiomático: combine table-driven com t.Parallel para suítes rápidas e legíveis.",
      "Armadilha: em Go < 1.22, capturar a variável do loop sem 'c := c' deixa todos os subtestes rodarem com o último caso.",
      "Armadilha: dois testes paralelos escrevendo no mesmo arquivo se atropelam silenciosamente.",
      "go test cacheia resultados; -count=1 força reexecução quando você quer.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Variáveis globais e estado compartilhado são inimigos do paralelismo. Se você usa pacotes que mantêm estado interno (singletons, init globals), nem todo teste pode ser paralelo.",
      },
      {
        type: "tip",
        content: "Rode go test -race regularmente. O detector de corrida do Go encontra acessos concorrentes inseguros que só apareceriam em produção sob carga.",
      },
      {
        type: "info",
        content: "Existe também t.Setenv para definir variável de ambiente apenas durante o teste — o pacote testing restaura o valor original automaticamente ao fim.",
      },
    ],
  },
  {
    slug: "helpers-cleanup",
    section: "testes-web",
    title: "t.Helper e t.Cleanup: testes limpos e enxutos",
    difficulty: "intermediario",
    subtitle: "Funções auxiliares que apontam para a linha certa e limpeza automática que sempre roda",
    intro: `Conforme sua suíte cresce, você começa a repetir trechos: criar um usuário válido, abrir um banco temporário, popular um diretório com arquivos de fixture. A solução natural é extrair em funções auxiliares (helpers). O problema é que, quando o teste falha dentro de um helper, o erro aponta para a linha do helper — não para a linha que o chamou. Isso faz você perder tempo descendo no stack trace para entender qual teste real quebrou.

Em Go a solução é elegante: chame t.Helper() na primeira linha do helper. Ao falhar, o framework pula essa função no relatório e mostra a linha do código que invocou o helper. É um detalhe pequeno que faz uma diferença enorme em legibilidade. Compare com Python, onde você precisa de plugins ou stack frames manuais; Go embute isso na linguagem.

A outra ferramenta indispensável é t.Cleanup. Ela registra uma função para rodar quando o teste (ou subteste) terminar — passando ou falhando. Substitui o defer com a vantagem de funcionar dentro de helpers: você cria um arquivo temporário no helper e registra a remoção no t.Cleanup; quem chama o helper não precisa lembrar de limpar nada. As funções registradas rodam em ordem inversa, igual stack de defer.

Junto, helpers + cleanup transformam testes verbosos em testes que parecem documentação. Em vez de quinze linhas de setup repetidas em cada teste, você tem novoUsuario(t) ou novoBanco(t) e o teste foca no que importa: o comportamento que está sendo verificado.`,
    codes: [
      {
        lang: "go",
        code: `// Sem t.Helper: o erro aponta para dentro do helper, não para o teste.
package usuario

import "testing"

type Usuario struct{ Nome string }

func criarUsuario(t *testing.T, nome string) *Usuario {
	if nome == "" {
		// Sem t.Helper: a saída do go test mostra ESTA linha como falha.
		t.Fatal("nome vazio")
	}
	return &Usuario{Nome: nome}
}

func TestSemHelper(t *testing.T) {
	_ = criarUsuario(t, "")
}`,
      },
      {
        lang: "go",
        code: `// Com t.Helper: a falha aponta para a linha do TestComHelper.
package usuario

import "testing"

func criarUsuarioOK(t *testing.T, nome string) *Usuario {
	t.Helper() // primeira linha do helper, sempre.
	if nome == "" {
		t.Fatal("nome vazio")
	}
	return &Usuario{Nome: nome}
}

func TestComHelper(t *testing.T) {
	u := criarUsuarioOK(t, "Ana")
	if u.Nome != "Ana" {
		t.Errorf("nome = %q; queria %q", u.Nome, "Ana")
	}
}`,
      },
      {
        lang: "go",
        code: `// t.Cleanup substitui defer e funciona dentro de helpers.
package arquivos

import (
	"os"
	"path/filepath"
	"testing"
)

// criarArquivoTemp cria um arquivo .txt no diretório temporário do teste.
// Quando o teste acabar, o arquivo é removido automaticamente.
func criarArquivoTemp(t *testing.T, conteudo string) string {
	t.Helper()
	dir := t.TempDir() // o pacote testing apaga este diretório no fim.
	caminho := filepath.Join(dir, "dados.txt")
	if err := os.WriteFile(caminho, []byte(conteudo), 0o644); err != nil {
		t.Fatalf("escrever arquivo: %v", err)
	}
	t.Cleanup(func() {
		// Cleanup extra para algo fora do TempDir (exemplo: registro global).
		t.Logf("limpeza concluída para %s", caminho)
	})
	return caminho
}

func TestLeituraDeArquivo(t *testing.T) {
	caminho := criarArquivoTemp(t, "olá mundo")
	dados, err := os.ReadFile(caminho)
	if err != nil {
		t.Fatalf("ler: %v", err)
	}
	if string(dados) != "olá mundo" {
		t.Errorf("conteúdo errado: %q", dados)
	}
}`,
      },
      {
        lang: "go",
        code: `// Cleanups rodam em ordem inversa, como defer.
package ordem

import "testing"

func TestOrdemDeCleanup(t *testing.T) {
	t.Cleanup(func() { t.Log("primeiro registrado, último a rodar") })
	t.Cleanup(func() { t.Log("segundo registrado") })
	t.Cleanup(func() { t.Log("terceiro registrado, primeiro a rodar") })
	t.Log("corpo do teste")
}
// Saída (com -v):
// corpo do teste
// terceiro registrado, primeiro a rodar
// segundo registrado
// primeiro registrado, último a rodar`,
      },
    ],
    points: [
      "Chame t.Helper() como primeira linha de qualquer função auxiliar de teste.",
      "Sem t.Helper, falhas apontam para dentro do helper e dificultam o debug.",
      "t.Cleanup registra função que roda no fim do teste, mesmo se ele falhar.",
      "Cleanups executam em ordem inversa do registro, como defer.",
      "t.TempDir() cria um diretório isolado que é apagado automaticamente.",
      "Idiomático: helpers que recebem *testing.T e retornam o objeto pronto.",
      "Armadilha: esquecer t.Helper torna o stack trace inútil em projetos grandes.",
      "Armadilha: usar defer no setup e esquecer que defer não roda se a função pai panica antes.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Crie um pacote interno chamado testutil com helpers comuns ao seu projeto: criar usuário válido, abrir banco em memória, fixar relógio. Reduz boilerplate sem virar framework.",
      },
      {
        type: "info",
        content: "t.Cleanup também está disponível em *testing.B (benchmarks) e *testing.F (fuzz). A API é a mesma.",
      },
      {
        type: "success",
        content: "Um teste bem feito com helpers e cleanup vira documentação executável: lendo o corpo do teste, você entende o cenário sem ler o setup.",
      },
    ],
  },
  {
    slug: "benchmarks",
    section: "testes-web",
    title: "Benchmarks: medindo desempenho com confiança",
    difficulty: "intermediario",
    subtitle: "O pacote testing também mede performance e alocações sem ferramenta extra",
    intro: `Otimizar código sem medir é supertição. Você acha que aquela troca de slice por mapa deixou tudo mais rápido, mas na prática talvez tenha ficado mais lento por conta de hashing. A regra de ouro de performance é: meça antes, meça depois, compare. Em Go, o próprio pacote testing tem suporte a benchmarks de primeira classe, no mesmo nível dos testes.

Um benchmark é uma função BenchmarkAlgo(b *testing.B) no arquivo _test.go. Dentro dela existe um campo b.N que o framework ajusta automaticamente: ele roda seu código N vezes, mede o tempo, e ajusta N até ter uma medição estatisticamente útil (geralmente alguns segundos). Você nunca define N à mão; deixa o framework decidir.

A saída do benchmark traz informações preciosas: tempo médio por operação (ns/op), bytes alocados por operação (B/op) e quantas alocações foram feitas (allocs/op). Esses três números são o tripé da otimização em Go. Reduzir alocações costuma ter impacto maior do que microtruques de CPU, porque cada alocação pressiona o garbage collector.

Comparado a Java (JMH) ou Python (timeit), o sistema Go é simples e idiomático: nada para instalar, integrado ao go test, com benchstat para comparar resultados estatisticamente. A combinação típica de uso real é: rode o benchmark antes da mudança, salve em old.txt; faça a otimização; rode de novo, salve em new.txt; rode benchstat old.txt new.txt para ver se o ganho é estatisticamente significativo ou ruído.`,
    codes: [
      {
        lang: "go",
        code: `// concat.go — duas formas de concatenar strings, com performances bem diferentes.
package concat

import "strings"

// ConcatPlus é a forma ingênua: cria uma nova string a cada iteração.
func ConcatPlus(partes []string) string {
	r := ""
	for _, p := range partes {
		r += p
	}
	return r
}

// ConcatBuilder usa strings.Builder, que aloca um buffer e cresce de forma exponencial.
func ConcatBuilder(partes []string) string {
	var b strings.Builder
	for _, p := range partes {
		b.WriteString(p)
	}
	return b.String()
}`,
      },
      {
        lang: "go",
        code: `// concat_test.go — benchmarks comparando as duas implementações.
package concat

import (
	"strings"
	"testing"
)

// dados de entrada criados uma vez fora do loop.
var entrada = strings.Split(strings.Repeat("palavra ", 1000), " ")

func BenchmarkConcatPlus(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = ConcatPlus(entrada)
	}
}

func BenchmarkConcatBuilder(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = ConcatBuilder(entrada)
	}
}`,
      },
      {
        lang: "bash",
        code: `# Rodar benchmarks (testes não rodam por padrão com -bench).
go test -bench=. -benchmem
# -bench=. roda todos benchmarks (regex)
# -benchmem inclui alocações no relatório

# Saída exemplo:
# BenchmarkConcatPlus-8         500   2_345_678 ns/op   1_234_567 B/op   1001 allocs/op
# BenchmarkConcatBuilder-8   100_000      12_345 ns/op       8_192 B/op      4 allocs/op
# Builder é ~190x mais rápido e aloca 250x menos memória.`,
      },
      {
        lang: "go",
        code: `// Use b.ResetTimer quando setup pesado existe antes do que você quer medir.
package busca

import (
	"sort"
	"testing"
)

func BenchmarkBuscaBinaria(b *testing.B) {
	// Setup caro: criar slice ordenado de 1 milhão de itens.
	dados := make([]int, 1_000_000)
	for i := range dados {
		dados[i] = i * 2
	}
	b.ResetTimer() // zera o cronômetro depois do setup.

	for i := 0; i < b.N; i++ {
		_ = sort.SearchInts(dados, 999_998)
	}
}

// b.StopTimer / b.StartTimer permitem isolar trechos pesados em cada iteração.`,
      },
      {
        lang: "bash",
        code: `# Comparando duas execuções estatisticamente com benchstat.
go install golang.org/x/perf/cmd/benchstat@latest

# Antes da otimização:
go test -bench=. -count=10 > old.txt
# Depois da otimização:
go test -bench=. -count=10 > new.txt

benchstat old.txt new.txt
# Mostra média, desvio e se a diferença é significativa (p-value).`,
      },
    ],
    points: [
      "Benchmarks são funções BenchmarkX(b *testing.B) no arquivo _test.go.",
      "b.N é ajustado pelo framework; nunca defina N manualmente.",
      "Rode com go test -bench=. ; -benchmem inclui alocações no relatório.",
      "Use b.ResetTimer após setup caro para não poluir a medição.",
      "Compare execuções com benchstat para saber se o ganho é real ou ruído.",
      "Idiomático: comparar abordagens (slice vs mapa, +  vs Builder) com benchmarks.",
      "Armadilha: medir uma única execução e tirar conclusões — use -count=10.",
      "Erro comum: deixar o resultado da função sumir no nada pode levar o compilador a otimizar tudo; atribua a uma variável global se necessário.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Resultados de benchmark variam com carga da máquina. Rode com a CPU ociosa, no mesmo hardware, para comparações justas. Notebook em bateria mente muito.",
      },
      {
        type: "tip",
        content: "Reduzir alocações geralmente traz mais ganho que microtuning de CPU. Olhe primeiro para B/op e allocs/op antes de ns/op.",
      },
      {
        type: "info",
        content: "O sufixo -8 no nome (BenchmarkX-8) indica GOMAXPROCS, ou seja, quantas CPUs estavam disponíveis para o benchmark.",
      },
    ],
  },
  {
    slug: "fuzz-testing",
    section: "testes-web",
    title: "Fuzz testing: o computador inventando casos de borda",
    difficulty: "avancado",
    subtitle: "Como o Go gera entradas aleatórias para encontrar bugs que você jamais escreveria à mão",
    intro: `Por mais cuidadosos que sejamos, casos de borda escapam. Strings com caracteres invisíveis, números na fronteira do overflow, slices com nil escondido. Fuzz testing é uma técnica que delega ao computador a tarefa de inventar essas entradas: você fornece um corpus inicial (sementes) e diz quais propriedades devem sempre valer; o fuzzer muta as sementes e tenta quebrar seu código.

Go ganhou suporte nativo a fuzz na versão 1.18. Antes era preciso usar libs como go-fuzz com toda uma toolchain separada. Agora você escreve uma função FuzzAlgo(f *testing.F), registra sementes com f.Add e dá ao framework uma função alvo via f.Fuzz. O motor cuida de mutar entradas, persistir falhas em testdata/fuzz e re-rodar como teste comum daí em diante.

A magia do fuzz não é só achar crashes (panics). É verificar invariantes — propriedades que devem sempre valer. Por exemplo, codificar e decodificar deveria devolver o original; reverso de reverso é o original; somar e subtrair zero não muda o valor. Quando uma dessas propriedades quebra para alguma entrada, você descobriu um bug que talvez ninguém pensaria em testar.

Comparado a hypothesis (Python) ou QuickCheck (Haskell, Erlang), o fuzz nativo do Go é menos expressivo (só tipos primitivos como sementes), mas integra perfeitamente ao go test. E quando ele encontra uma entrada problemática, salva no diretório testdata/fuzz/NomeDoFuzz, e a partir daí roda em todos os go test normais como regressão. É feedback loop puro: bug encontrado, bug travado.`,
    codes: [
      {
        lang: "go",
        code: `// reverse.go — função aparentemente simples que esconde uma armadilha.
package reverse

// Reverter inverte os bytes de uma string. (errado para multibyte, vamos ver.)
func Reverter(s string) string {
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}`,
      },
      {
        lang: "go",
        code: `// reverse_test.go — fuzz test que verifica invariante: reverso do reverso = original.
package reverse

import (
	"testing"
	"unicode/utf8"
)

func FuzzReverter(f *testing.F) {
	// Sementes: começamos com casos plausíveis.
	f.Add("olá")
	f.Add("ana")
	f.Add("")
	f.Add("a")

	f.Fuzz(func(t *testing.T, original string) {
		// Pular entradas que não são UTF-8 válido (input pode ser bytes brutos).
		if !utf8.ValidString(original) {
			t.Skip()
		}
		invertido := Reverter(original)
		voltou := Reverter(invertido)
		if original != voltou {
			t.Errorf("Reverter(Reverter(%q)) = %q; queria %q",
				original, voltou, original)
		}
		// Outra invariante: o resultado deve continuar sendo UTF-8 válido.
		if utf8.ValidString(original) && !utf8.ValidString(invertido) {
			t.Errorf("Reverter quebrou UTF-8: %q virou %q", original, invertido)
		}
	})
}`,
      },
      {
        lang: "bash",
        code: `# Rodar o fuzz por 30 segundos.
go test -fuzz=FuzzReverter -fuzztime=30s

# Quando achar uma falha, salva em testdata/fuzz/FuzzReverter/HASH
# e mostra a entrada que quebrou. Exemplo:
# fuzz: elapsed: 1s, gathering baseline coverage: 0/4 completed
# --- FAIL: FuzzReverter (0.06s)
#     --- FAIL: FuzzReverter (0.00s)
#         reverse_test.go:18: Reverter quebrou UTF-8: "é" virou "\\xa9\\xc3"

# A partir daí, "go test" normal já roda essa entrada como regressão.`,
      },
      {
        lang: "go",
        code: `// Versão correta usando []rune, que respeita caracteres multibyte.
package reverse

func ReverterRunes(s string) string {
	r := []rune(s) // []rune trabalha por code point, não por byte.
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}
// Esta versão passa no fuzz porque preserva os limites de UTF-8.`,
      },
      {
        lang: "bash",
        code: `# Tipos suportados como argumentos no Fuzz.Add e na função fuzz:
# string, []byte, int, int8..int64, uint, uint8..uint64, float32, float64, bool, rune.

# Você pode inspecionar o corpus salvo:
ls testdata/fuzz/FuzzReverter/
# cada arquivo contém uma entrada que quebrou em algum momento.`,
      },
    ],
    points: [
      "Fuzz nativo existe no Go desde 1.18, faz parte do testing.",
      "f.Add registra sementes; f.Fuzz recebe a função alvo.",
      "Pense em invariantes: codificar/decodificar, reverso de reverso, idempotência.",
      "Falhas viram arquivos em testdata/fuzz e rodam como regressão depois.",
      "Use t.Skip() para descartar entradas que não fazem sentido (ex: UTF-8 inválido).",
      "Idiomático: rodar fuzz em CI por tempo limitado e versionar o corpus de regressão.",
      "Armadilha: escrever invariantes vagas; precisam ser propriedades verdadeiras sempre.",
      "Erro comum: confundir fuzz com benchmark — fuzz busca bugs, benchmark mede tempo.",
    ],
    alerts: [
      {
        type: "info",
        content: "Por padrão go test não roda fuzz; você precisa passar -fuzz=NomeDoFuzz explicitamente. Sem isso, a função FuzzX só executa as sementes registradas em f.Add.",
      },
      {
        type: "tip",
        content: "Comece pequeno: um fuzz com cinco sementes e uma invariante já encontra bugs surpreendentes. Não é preciso construir uma estrutura elaborada para começar a usar.",
      },
      {
        type: "success",
        content: "O time do Go usou fuzz para encontrar dezenas de bugs de segurança em pacotes da biblioteca padrão (encoding, archive, crypto). É uma técnica madura.",
      },
    ],
  },
  {
    slug: "httptest",
    section: "testes-web",
    title: "httptest: testando HTTP sem subir servidor de verdade",
    difficulty: "intermediario",
    subtitle: "NewServer e NewRecorder para testar handlers e clientes sem precisar abrir porta na rede",
    intro: `Testar código que faz HTTP costumava ser dor de cabeça em qualquer linguagem: subir um servidor mock, escolher uma porta, garantir que ele suba antes do cliente, derrubar no fim. Em Python tem o responses, em JavaScript o nock, em Java o WireMock — todas ferramentas externas que adicionam complexidade.

Go traz tudo na biblioteca padrão, no pacote net/http/httptest. Ele tem dois tipos principais: httptest.NewServer, que sobe um servidor HTTP real em uma porta aleatória do localhost com um handler que você define; e httptest.NewRecorder, que grava em memória o que um handler escreveria na resposta — sem rede nenhuma, instantâneo. Cada um serve a um cenário diferente.

Use NewServer quando você está testando um cliente HTTP. Você cria o servidor com o handler que simula a resposta do serviço externo (sucesso, erro 500, timeout, JSON estranho), pega a URL via servidor.URL e injeta no cliente. Quando o teste acaba, defer servidor.Close() libera tudo. É realista porque passa pela stack de rede de verdade, ainda que em loopback.

Use NewRecorder quando você está testando um handler. Você cria uma requisição com httptest.NewRequest, um recorder com httptest.NewRecorder, e chama handler.ServeHTTP(recorder, req) diretamente. O recorder captura status code, headers e body. Não tem rede, não tem porta, não tem flake. É a forma mais rápida e determinística de testar handlers.`,
    codes: [
      {
        lang: "go",
        code: `// Testando um cliente que consome uma API externa, com NewServer.
package cep

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type Endereco struct {
	CEP        string \`json:"cep"\`
	Logradouro string \`json:"logradouro"\`
}

// BuscarCEP é o cliente que queremos testar.
func BuscarCEP(baseURL, cep string) (*Endereco, error) {
	resp, err := http.Get(baseURL + "/" + cep + "/json/")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var e Endereco
	if err := json.NewDecoder(resp.Body).Decode(&e); err != nil {
		return nil, err
	}
	return &e, nil
}

func TestBuscarCEP(t *testing.T) {
	// Subimos um servidor falso que finge ser o ViaCEP.
	srv := httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			if !strings.Contains(r.URL.Path, "01001000") {
				t.Errorf("path inesperado: %s", r.URL.Path)
			}
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(\`{"cep":"01001-000","logradouro":"Praça da Sé"}\`))
		}))
	defer srv.Close() // libera a porta no fim do teste

	e, err := BuscarCEP(srv.URL, "01001000")
	if err != nil {
		t.Fatalf("erro: %v", err)
	}
	if e.Logradouro != "Praça da Sé" {
		t.Errorf("logradouro = %q", e.Logradouro)
	}
}`,
      },
      {
        lang: "go",
        code: `// Testando um handler com NewRecorder, sem subir servidor.
package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// SaudacaoHandler responde "Olá, NOME" baseado em query param.
func SaudacaoHandler(w http.ResponseWriter, r *http.Request) {
	nome := r.URL.Query().Get("nome")
	if nome == "" {
		http.Error(w, "nome obrigatório", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Olá, " + nome))
}

func TestSaudacaoHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/saudar?nome=Ana", nil)
	rec := httptest.NewRecorder()

	SaudacaoHandler(rec, req)

	res := rec.Result()
	if res.StatusCode != http.StatusOK {
		t.Errorf("status = %d; queria 200", res.StatusCode)
	}
	if !strings.Contains(rec.Body.String(), "Ana") {
		t.Errorf("body = %q", rec.Body.String())
	}
}

func TestSaudacaoSemNome(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/saudar", nil)
	rec := httptest.NewRecorder()
	SaudacaoHandler(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("status = %d; queria 400", rec.Code)
	}
}`,
      },
      {
        lang: "go",
        code: `// NewTLSServer para simular HTTPS, com certificado autoassinado.
package tlsclient

import (
	"crypto/tls"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClienteHTTPS(t *testing.T) {
	srv := httptest.NewTLSServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("seguro"))
		}))
	defer srv.Close()

	// srv.Client() já vem configurado para confiar no certificado falso.
	client := srv.Client()
	resp, err := client.Get(srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if string(body) != "seguro" {
		t.Errorf("body = %q", body)
	}
	// Use tls.VersionName se quiser checar versão negociada:
	_ = tls.VersionName
}`,
      },
      {
        lang: "go",
        code: `// Simulando latência ou falha intermitente.
package timeout

import (
	"net/http"
	"net/http/httptest"
	"time"
)

func ServidorLento(d time.Duration) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(d)
			w.Write([]byte("ok"))
		}))
}

// Use no teste:
// srv := ServidorLento(2 * time.Second)
// defer srv.Close()
// client := &http.Client{Timeout: 500 * time.Millisecond}
// _, err := client.Get(srv.URL)  // deve falhar com timeout`,
      },
    ],
    points: [
      "httptest.NewServer sobe um servidor real em porta aleatória do localhost.",
      "httptest.NewRecorder grava resposta em memória, sem rede; é mais rápido.",
      "Sempre defer srv.Close() para liberar a porta ao fim do teste.",
      "Use NewTLSServer para HTTPS; srv.Client() já confia no certificado.",
      "rec.Result() devolve um *http.Response completo, igual ao real.",
      "Idiomático: NewServer para testar clientes; NewRecorder para testar handlers.",
      "Armadilha: esquecer de fechar resp.Body causa vazamento de conexões.",
      "Erro comum: testar a URL hardcoded em vez de srv.URL — quebra em CI.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Combine httptest.NewServer com table-driven tests para cobrir muitos cenários do servidor (200, 404, 500, JSON malformado) sem repetir código de setup.",
      },
      {
        type: "info",
        content: "httptest.NewRequest difere de http.NewRequest: o primeiro é só para testes e nunca retorna erro, simplificando a chamada.",
      },
      {
        type: "warning",
        content: "Em testes com goroutines de fundo, certifique-se de que toda goroutine terminou antes do srv.Close, ou você pode ver panics estranhos sobre escrever em conexão fechada.",
      },
    ],
  },
  {
    slug: "mocks-stub",
    section: "testes-web",
    title: "Mocks e stubs com interfaces: a injeção de dependência idiomática",
    difficulty: "intermediario",
    subtitle: "Como Go usa interfaces pequenas para isolar dependências sem framework de mock",
    intro: `Testar código que depende de banco de dados, API externa ou relógio do sistema é um desafio universal. Em Java/Python a resposta tradicional é uma biblioteca de mock (Mockito, unittest.mock) que monkey-patcha objetos em runtime. Em Go a abordagem é diferente, mais simples e mais explícita: você define interfaces pequenas para cada dependência e injeta uma implementação fake nos testes.

A regra dourada de Go nesse tema: interfaces pertencem a quem consome, não a quem implementa. Em vez de declarar uma interface gigante UsuarioRepository com vinte métodos, você declara onde precisa: o handler que precisa só de Buscar(id) declara sua própria interface buscador { Buscar(id int) (*Usuario, error) }. O struct concreto não precisa saber dessa interface — ele simplesmente tem o método e satisfaz por estrutura. Isso se chama duck typing estático.

Com isso, criar um stub é trivial: você cria uma struct local no teste que implementa a interface mínima, sem necessidade de framework. Quer que retorne um valor fixo? stub. Quer que conte chamadas? coloca um contador. Quer que devolva erro na terceira invocação? lógica simples no método. Você tem controle total e o código é Go puro, sem mágica.

Algumas equipes usam ferramentas como mockgen (do projeto gomock) ou moq para gerar stubs automaticamente a partir de interfaces. São úteis em projetos grandes, mas não são obrigatórios. Para a maioria dos casos, escrever a struct fake na mão é mais claro e evita uma camada de geração de código que confunde quem está lendo.`,
    codes: [
      {
        lang: "go",
        code: `// pedido.go — service que precisa enviar email; queremos testá-lo sem enviar de verdade.
package pedido

import "fmt"

// Emailer é a interface que o service consome. Pequena e focada.
type Emailer interface {
	Enviar(para, assunto, corpo string) error
}

type Service struct {
	email Emailer // dependência abstrata
}

func NovoService(e Emailer) *Service {
	return &Service{email: e}
}

func (s *Service) Confirmar(idPedido int, emailCliente string) error {
	corpo := fmt.Sprintf("Pedido %d confirmado.", idPedido)
	return s.email.Enviar(emailCliente, "Confirmação", corpo)
}`,
      },
      {
        lang: "go",
        code: `// pedido_test.go — stub manual da interface Emailer.
package pedido

import (
	"errors"
	"testing"
)

// emailerSpy registra chamadas para inspeção depois.
type emailerSpy struct {
	chamadas int
	ultimo   struct {
		para, assunto, corpo string
	}
	erro error // se != nil, retorna esse erro
}

func (e *emailerSpy) Enviar(para, assunto, corpo string) error {
	e.chamadas++
	e.ultimo.para = para
	e.ultimo.assunto = assunto
	e.ultimo.corpo = corpo
	return e.erro
}

func TestConfirmarEnviaEmail(t *testing.T) {
	spy := &emailerSpy{}
	s := NovoService(spy)

	if err := s.Confirmar(42, "ana@empresa.com"); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if spy.chamadas != 1 {
		t.Errorf("chamadas = %d; queria 1", spy.chamadas)
	}
	if spy.ultimo.para != "ana@empresa.com" {
		t.Errorf("para = %q", spy.ultimo.para)
	}
	if spy.ultimo.corpo != "Pedido 42 confirmado." {
		t.Errorf("corpo = %q", spy.ultimo.corpo)
	}
}

func TestConfirmarPropagaErro(t *testing.T) {
	spy := &emailerSpy{erro: errors.New("smtp caiu")}
	s := NovoService(spy)
	err := s.Confirmar(1, "x@y.com")
	if err == nil || err.Error() != "smtp caiu" {
		t.Errorf("erro = %v; queria 'smtp caiu'", err)
	}
}`,
      },
      {
        lang: "go",
        code: `// Stub funcional: implementa a interface usando uma função.
// Útil quando o stub precisa de lógica diferente em cada teste.
package pedido

type EmailerFunc func(para, assunto, corpo string) error

// Enviar deixa EmailerFunc satisfazer Emailer automaticamente.
func (f EmailerFunc) Enviar(para, assunto, corpo string) error {
	return f(para, assunto, corpo)
}

// Uso no teste:
// emailer := EmailerFunc(func(p, a, c string) error {
//     if p == "spam@x.com" { return errors.New("bloqueado") }
//     return nil
// })`,
      },
      {
        lang: "bash",
        code: `# Para projetos maiores, geradores como moq economizam código.
go install github.com/matryer/moq@latest

# Gera um mock para a interface Emailer no arquivo emailer_moq.go:
moq -out emailer_moq.go . Emailer

# O arquivo gerado tem campos como EnviarFunc para você atribuir comportamento.
# Mas: comece sem gerador. Stubs manuais são mais legíveis em projetos pequenos.`,
      },
    ],
    points: [
      "Defina interfaces pequenas no pacote consumidor, não no produtor.",
      "Injete a dependência via construtor ou campo da struct.",
      "Crie stubs como structs locais ao teste; não precisa de biblioteca.",
      "Spy = stub que registra chamadas; útil para verificar o que aconteceu.",
      "Use type funcs (func type satisfazendo interface) para stubs ad-hoc.",
      "Idiomático: interface pertence a quem consome (accept interfaces, return structs).",
      "Armadilha: criar interface enorme (god interface) que ninguém implementa direito.",
      "Erro comum: usar generators (gomock/moq) cedo demais e esconder a estrutura real.",
    ],
    alerts: [
      {
        type: "info",
        content: "O lema 'accept interfaces, return structs' resume: aceite interfaces nos parâmetros para flexibilidade, mas devolva tipos concretos para que quem usa sua API tenha clareza do que recebe.",
      },
      {
        type: "tip",
        content: "Para o relógio do sistema, defina uma interface Clock { Now() time.Time }. Em produção use um struct que chama time.Now; em testes, um struct com hora fixa. Isso elimina flakiness em testes que dependem de tempo.",
      },
      {
        type: "warning",
        content: "Mocks que verificam ordem exata de chamadas são frágeis. Foque em verificar comportamento observável, não em over-specificar como o código interno faz seu trabalho.",
      },
    ],
  },
  {
    slug: "coverage",
    section: "testes-web",
    title: "Cobertura de testes: medindo, mas com critério",
    difficulty: "intermediario",
    subtitle: "Como gerar relatórios de cobertura, ler o HTML colorido e não cair na armadilha de buscar 100%",
    intro: `Cobertura de testes mede qual porcentagem das linhas (ou ramos) do seu código foi executada durante a suíte de testes. É uma métrica útil para identificar áreas esquecidas, mas perigosa quando vira meta arbitrária. Time que persegue 100% sem critério acaba escrevendo testes triviais só para colorir linha de getter, e isso deixa a falsa sensação de segurança.

Em Go, gerar cobertura é trivial: a flag -cover no go test mostra a porcentagem; -coverprofile=arq.out salva um arquivo detalhado linha a linha; e go tool cover -html=arq.out abre um relatório navegável no navegador, com cada arquivo colorido em verde (coberto), vermelho (não coberto) e cinza (sem código testável). Esse HTML é a melhor parte: você vê visualmente onde faltam testes.

Por padrão, a cobertura mede apenas o pacote sendo testado. Para cobertura cruzada (testes do pacote A cobrindo código do pacote B, comum em testes de integração) use -coverpkg. Para projeto inteiro: go test -coverpkg=./... -coverprofile=cover.out ./.... Esse é o número que costuma aparecer no badge do README.

A lição mais importante: 80% de cobertura num código bem testado vale mais que 99% num código com testes superficiais. Olhe para qualidade dos testes (são determinísticos? testam comportamento?), não só para a barra colorida. Use cobertura como mapa de áreas inexploradas, não como objetivo final.`,
    codes: [
      {
        lang: "bash",
        code: `# Cobertura simples no terminal:
go test -cover ./...
# ok  exemplo/banco   0.005s   coverage: 86.4% of statements
# ok  exemplo/util    0.002s   coverage: 100.0% of statements`,
      },
      {
        lang: "bash",
        code: `# Salvar cobertura num arquivo e abrir relatório HTML colorido.
go test -coverprofile=cover.out ./...
go tool cover -html=cover.out
# Abre o navegador com cada arquivo Go colorido:
# verde = linha executada nos testes
# vermelho = linha sem teste
# cinza = não é código executável (declaração, comentário)

# Versão que gera arquivo HTML em vez de abrir navegador:
go tool cover -html=cover.out -o cobertura.html`,
      },
      {
        lang: "bash",
        code: `# Detalhamento por função (útil em CI):
go tool cover -func=cover.out
# exemplo/banco/conta.go:10:    Sacar          100.0%
# exemplo/banco/conta.go:20:    Depositar       80.0%
# exemplo/banco/conta.go:30:    Transferir       0.0%
# total:                         (statements)    73.4%

# Cobertura cruzada: testes que estão num pacote cobrindo outro.
go test -coverpkg=./... -coverprofile=cover.out ./...`,
      },
      {
        lang: "go",
        code: `// Exemplo: função com ramo difícil de cobrir, deliberadamente.
package divisao

import "errors"

var ErrZero = errors.New("divisão por zero")

func Dividir(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrZero // este ramo precisa de teste explícito
	}
	return a / b, nil
}`,
      },
      {
        lang: "go",
        code: `// divisao_test.go — testando ambos os ramos para cobrir 100%.
package divisao

import (
	"errors"
	"testing"
)

func TestDividirOK(t *testing.T) {
	r, err := Dividir(10, 2)
	if err != nil || r != 5 {
		t.Errorf("Dividir(10,2) = %v, %v", r, err)
	}
}

func TestDividirZero(t *testing.T) {
	_, err := Dividir(1, 0)
	if !errors.Is(err, ErrZero) {
		t.Errorf("queria ErrZero, recebi %v", err)
	}
}
// Roda go test -cover e verá 100% de cobertura para este pacote.`,
      },
      {
        lang: "yaml",
        code: `# Em CI (GitHub Actions), uma checagem mínima de cobertura.
# .github/workflows/test.yml
name: tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.22"
      - run: go test -coverprofile=cover.out ./...
      - run: go tool cover -func=cover.out | tail -1
      # Você pode também enviar cover.out para Codecov ou Coveralls.`,
      },
    ],
    points: [
      "go test -cover mostra a porcentagem total no terminal.",
      "-coverprofile=arq.out gera arquivo detalhado para análise.",
      "go tool cover -html=arq.out abre o relatório colorido no navegador.",
      "go tool cover -func=arq.out lista cobertura por função (ótimo em CI).",
      "Use -coverpkg=./... para cobertura cruzada entre pacotes.",
      "Idiomático: encarar cobertura como mapa de áreas esquecidas, não meta absoluta.",
      "Armadilha: perseguir 100% leva a testes triviais que não testam comportamento.",
      "Erro comum: ler porcentagem sem abrir o HTML; o detalhe é onde mora a verdade.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Configure CI para falhar quando a cobertura cair abaixo de um piso (ex: 70%). Isso evita regressão silenciosa, sem virar busca obsessiva por 100%.",
      },
      {
        type: "warning",
        content: "Cobertura alta não significa código correto. Você pode executar uma linha sem nenhum assert e ela conta como coberta. Sempre verifique se os testes têm asserções relevantes.",
      },
      {
        type: "info",
        content: "A partir do Go 1.20 também existe cobertura para binários compilados (-cover em go build), útil para testes de integração de aplicações inteiras.",
      },
    ],
  },
  {
    slug: "net-http-client",
    section: "testes-web",
    title: "net/http como cliente: requisições, headers e timeouts",
    difficulty: "intermediario",
    subtitle: "Como usar http.Client de forma robusta para consumir APIs externas em produção",
    intro: `O pacote net/http não é só para servidores: ele também tem um cliente HTTP poderoso e idiomático. Para consumos rápidos existem helpers como http.Get, http.Post e http.PostForm, mas em código de produção você quase sempre quer um http.Client configurado: com timeout, transport personalizado, controle de redirects, reuso de conexões. Quem ignora isso descobre tarde que requisições penduradas estão derrubando o servidor.

A grande pegadinha: o http.DefaultClient não tem timeout. Sim, é zero, ou seja, infinito. Uma chamada para uma API que trava simplesmente fica pendurada para sempre, segurando uma goroutine, um socket e memória. Numa aplicação web sob carga isso vira um buraco negro. Sempre crie seu próprio client com Timeout definido — segundos, não minutos.

Para requisições mais elaboradas, use http.NewRequestWithContext: ele aceita um context.Context para cancelamento, permite definir headers (Authorization, Content-Type, User-Agent) e suporta qualquer método HTTP. Combine com client.Do(req) e você tem controle total. Sempre feche resp.Body com defer logo depois de checar o erro, ou vai vazar conexão.

JSON é onipresente em APIs. O padrão Go é codificar com json.NewEncoder(buf).Encode(v) ao enviar e decodificar com json.NewDecoder(resp.Body).Decode(&v) ao receber. Tags em campos da struct controlam o nome dos campos no JSON. Um detalhe importante de produção: sempre verifique status code antes de tentar decodificar — APIs costumam devolver HTML em erros, e tentar parsear esse HTML como JSON gera mensagens confusas.`,
    codes: [
      {
        lang: "go",
        code: `// Cliente HTTP configurado para uso em produção.
package httpcli

import (
	"net"
	"net/http"
	"time"
)

// NovoClient devolve um *http.Client com timeouts sensatos.
func NovoClient() *http.Client {
	return &http.Client{
		Timeout: 10 * time.Second, // limite total da requisição
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout:   3 * time.Second, // tempo para abrir TCP
				KeepAlive: 30 * time.Second,
			}).DialContext,
			TLSHandshakeTimeout:   3 * time.Second,
			ResponseHeaderTimeout: 5 * time.Second,
			MaxIdleConns:          100,
			IdleConnTimeout:       90 * time.Second,
		},
	}
}`,
      },
      {
        lang: "go",
        code: `// GET com headers e context para cancelamento.
package httpcli

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Repo struct {
	Nome  string \`json:"name"\`
	Stars int    \`json:"stargazers_count"\`
}

func BuscarRepo(ctx context.Context, client *http.Client, dono, nome string) (*Repo, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s", dono, nome)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "exemplo-go/1.0") // GitHub exige User-Agent
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // SEMPRE fechar para liberar conexão

	if resp.StatusCode != http.StatusOK {
		// Lê corpo para incluir na mensagem de erro (limitando tamanho).
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return nil, fmt.Errorf("status %d: %s", resp.StatusCode, body)
	}

	var r Repo
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return nil, fmt.Errorf("decodificar JSON: %w", err)
	}
	return &r, nil
}`,
      },
      {
        lang: "go",
        code: `// POST com corpo JSON.
package httpcli

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
)

type Pedido struct {
	Item  string \`json:"item"\`
	Qtd   int    \`json:"qtd"\`
}

func CriarPedido(ctx context.Context, client *http.Client, url string, p Pedido) error {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(p); err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, &buf)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer SECRETO")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		return &HTTPError{Status: resp.StatusCode}
	}
	return nil
}

type HTTPError struct{ Status int }

func (e *HTTPError) Error() string { return http.StatusText(e.Status) }`,
      },
      {
        lang: "go",
        code: `// Cancelamento por context: limita uma requisição a 2 segundos.
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel() // sempre liberar recursos do context

	req, _ := http.NewRequestWithContext(ctx, "GET", "https://example.com", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("erro:", err)
		return
	}
	defer resp.Body.Close()
	fmt.Println("status:", resp.Status)
}`,
      },
    ],
    points: [
      "http.DefaultClient não tem timeout — nunca use em produção sem trocar.",
      "Crie seu http.Client com Timeout e configurações explícitas.",
      "Sempre defer resp.Body.Close() logo após checar o erro de Do.",
      "Use http.NewRequestWithContext para suportar cancelamento.",
      "Verifique resp.StatusCode antes de tentar decodificar o body.",
      "Idiomático: aceitar *http.Client como parâmetro nas funções consumidoras (testabilidade).",
      "Armadilha: esquecer de ler/fechar o body causa vazamento de conexão e exhaustão do pool.",
      "Erro comum: usar http.Get sem timeout em produção e descobrir o congelamento só sob carga.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Sem Timeout no http.Client, uma chamada lenta pode segurar goroutines indefinidamente. Em uma API com mil requisições por segundo, isso vira um vazamento massivo em minutos.",
      },
      {
        type: "tip",
        content: "Reuso de http.Client é seguro entre goroutines e desejável: ele mantém um pool interno de conexões. Crie um por aplicação, não um por requisição.",
      },
      {
        type: "info",
        content: "io.LimitReader protege contra respostas gigantescas. Servidor mal-intencionado pode mandar gigabytes de body — sempre limite o que você lê na memória.",
      },
    ],
  },
  {
    slug: "websockets-go",
    section: "testes-web",
    title: "WebSockets em Go: comunicação bidirecional persistente",
    difficulty: "avancado",
    subtitle: "Como manter uma conexão viva para chat, notificações e dados ao vivo usando gorilla/websocket",
    intro: `HTTP funciona bem para requisição-resposta, mas é péssimo quando você precisa que o servidor empurre dados para o cliente em tempo real: chat, notificações, cotações de bolsa, jogos online. WebSocket resolve isso: depois de um handshake HTTP inicial, a conexão é "promovida" para um canal full-duplex onde ambos os lados podem enviar mensagens a qualquer momento, sem polling.

Go não tem WebSocket na biblioteca padrão (existe golang.org/x/net/websocket, mas é desencorajado). A escolha quase universal é o gorilla/websocket — maduro, com API limpa e exemplos abundantes. Uma alternativa mais nova é nhooyr.io/websocket, com API menor e suporte a context.Context em tudo. Para iniciantes, gorilla é a escolha segura.

O fluxo típico: o servidor expõe um handler HTTP comum; quando recebe uma requisição com header Upgrade: websocket, chama upgrader.Upgrade(w, r, nil) que devolve um *websocket.Conn. A partir daí, conn.ReadMessage() e conn.WriteMessage() trocam mensagens (texto ou binário). O cliente faz websocket.DefaultDialer.Dial("ws://host/path", nil) e usa a mesma API.

Cuidados importantes em produção: cada conexão WebSocket é uma goroutine viva no servidor. Mil clientes = mil goroutines + memória + descritores de arquivo. Configure read/write deadlines para detectar conexões zumbis, implemente ping/pong para keepalive, e use buffered channels para desacoplar leitura e escrita. Sem essas práticas, um cliente lento pode travar todo um worker. Pergunta de produção sempre presente: como vou escalar para 10 mil conexões?`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar a biblioteca gorilla/websocket.
go mod init exemplo/chat
go get github.com/gorilla/websocket@latest`,
      },
      {
        lang: "go",
        code: `// servidor.go — eco simples: tudo que recebe, devolve.
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Em produção, valide a Origin para evitar CSWSH.
	CheckOrigin: func(r *http.Request) bool { return true },
}

func eco(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	for {
		tipo, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recebi: %s", msg)
		if err := conn.WriteMessage(tipo, msg); err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func main() {
	http.HandleFunc("/ws", eco)
	log.Println("escutando em :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}`,
      },
      {
        lang: "go",
        code: `// cliente.go — conecta no servidor, manda 3 mensagens, lê as respostas.
package main

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

func main() {
	conn, _, err := websocket.DefaultDialer.Dial("ws://localhost:8080/ws", nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer conn.Close()

	mensagens := []string{"oi", "tudo bem?", "tchau"}
	for _, m := range mensagens {
		if err := conn.WriteMessage(websocket.TextMessage, []byte(m)); err != nil {
			log.Fatal("write:", err)
		}
		_, resp, err := conn.ReadMessage()
		if err != nil {
			log.Fatal("read:", err)
		}
		fmt.Printf("eco: %s\\n", resp)
	}
}`,
      },
      {
        lang: "go",
        code: `// Padrão de produção: leitura e escrita em goroutines separadas com canal.
package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	writeWait  = 10 * time.Second
)

type Cliente struct {
	conn *websocket.Conn
	send chan []byte
}

// escritor consome o canal send e escreve na conexão. Único escritor evita corrida.
func (c *Cliente) escritor() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, nil)
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// leitor lê mensagens e processa. Configura deadline + handler de pong.
func (c *Cliente) leitor() {
	defer c.conn.Close()
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			log.Println("leitor:", err)
			return
		}
		log.Printf("mensagem: %s", msg)
	}
}`,
      },
      {
        lang: "go",
        code: `// Testando WebSocket com httptest.NewServer.
package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/websocket"
)

func TestEco(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(eco))
	defer srv.Close()

	// Converte http://... para ws://...
	wsURL := "ws" + strings.TrimPrefix(srv.URL, "http") + "/"
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close()

	if err := conn.WriteMessage(websocket.TextMessage, []byte("ping")); err != nil {
		t.Fatal(err)
	}
	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatal(err)
	}
	if string(msg) != "ping" {
		t.Errorf("eco = %q; queria %q", msg, "ping")
	}
}`,
      },
    ],
    points: [
      "WebSocket começa como HTTP e é promovido com Upgrade — handshake.",
      "Use github.com/gorilla/websocket; nhooyr.io/websocket é alternativa moderna.",
      "Cada conexão = goroutine viva; planeje memória e descritores para escalar.",
      "Configure SetReadDeadline e use ping/pong para detectar conexões mortas.",
      "Único escritor por conexão (via canal) evita corrida em WriteMessage.",
      "Idiomático: separar leitor e escritor em goroutines distintas com chan []byte.",
      "Armadilha: deixar CheckOrigin sempre true em produção é vulnerabilidade CSWSH.",
      "Erro comum: chamar WriteMessage de várias goroutines sem sincronização — corrompe o stream.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Cross-Site WebSocket Hijacking (CSWSH) é uma classe de ataque real. Configure CheckOrigin para validar a origem em produção, ou use cookies + tokens CSRF.",
      },
      {
        type: "tip",
        content: "Para testar, use websocat (CLI) ou wscat (npm). Permitem abrir uma conexão manualmente e digitar mensagens. Excelente para depurar protocolo.",
      },
      {
        type: "info",
        content: "Para grande escala, considere brokers como Redis Pub/Sub para distribuir mensagens entre múltiplos servidores que mantêm conexões diferentes do mesmo chat.",
      },
    ],
  },
  {
    slug: "chromedp",
    section: "testes-web",
    title: "chromedp: automação de navegador headless em Go",
    difficulty: "avancado",
    subtitle: "Como controlar o Chrome sem janela para fazer scraping, screenshots e testes end-to-end",
    intro: `Quando o site que você precisa raspar (ou testar) carrega o conteúdo via JavaScript, requisições HTTP simples não funcionam: você baixa um esqueleto vazio que só ganha vida no navegador. A solução é controlar um navegador de verdade. Em Python existe Selenium e Playwright; em Go, a opção dominante é o chromedp — uma biblioteca que se comunica com o Chrome via DevTools Protocol, sem precisar de WebDriver.

A grande vantagem do chromedp é não ter dependências extras: contanto que o Chrome (ou Chromium) esteja instalado na máquina, ele cria um processo headless e fala diretamente. Em Docker, a imagem chromedp/headless-shell já vem pronta. Comparado a Selenium em Java/Python, é mais rápido e mais simples de configurar.

A API gira em torno de tasks: você compõe uma sequência de ações (navegar, esperar elemento, clicar, extrair texto, screenshot) e executa com chromedp.Run(ctx, tasks...). Cada task é uma função que recebe o context e devolve erro. O timeout é controlado via context.WithTimeout — sem isso uma página lenta trava sua goroutine para sempre.

Use chromedp para: scraping de SPAs (single-page apps), geração de PDF/screenshot de páginas dinâmicas, testes end-to-end que validam fluxos de UI completos, automatizar tarefas repetitivas em sites internos sem API. Cuidado: navegadores headless consomem memória pesada (centenas de MB cada). Para grande escala, considere serviços como Browserless ou pool de processos.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar chromedp e ter Chrome/Chromium na máquina.
go mod init exemplo/scraper
go get github.com/chromedp/chromedp@latest

# Em Linux:
# sudo apt install chromium-browser
# Em macOS:
# brew install --cask google-chrome`,
      },
      {
        lang: "go",
        code: `// Capturar o título de uma página dinâmica.
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/chromedp/chromedp"
)

func main() {
	// Cria um contexto e navegador headless.
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	// Timeout total da operação. Sem isso, página lenta trava para sempre.
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var titulo string
	err := chromedp.Run(ctx,
		chromedp.Navigate("https://go.dev"),
		chromedp.WaitVisible(\`h1\`, chromedp.ByQuery), // espera carregar
		chromedp.Title(&titulo),
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Título:", titulo)
}`,
      },
      {
        lang: "go",
        code: `// Tirar um screenshot de página inteira.
package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/chromedp/chromedp"
)

func main() {
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var imagem []byte
	err := chromedp.Run(ctx,
		chromedp.Navigate("https://example.com"),
		chromedp.WaitVisible(\`body\`, chromedp.ByQuery),
		chromedp.FullScreenshot(&imagem, 90), // qualidade JPEG 0-100
	)
	if err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile("pagina.png", imagem, 0o644); err != nil {
		log.Fatal(err)
	}
	log.Println("salvei pagina.png")
}`,
      },
      {
        lang: "go",
        code: `// Login automatizado e extração de dados após login.
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/chromedp/chromedp"
)

func main() {
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()
	ctx, cancel = context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	var saudacao string
	err := chromedp.Run(ctx,
		chromedp.Navigate("https://meusite.exemplo/login"),
		chromedp.WaitVisible(\`#email\`, chromedp.ByID),
		chromedp.SendKeys(\`#email\`, "ana@empresa.com", chromedp.ByID),
		chromedp.SendKeys(\`#senha\`, "secreto123", chromedp.ByID),
		chromedp.Click(\`button[type="submit"]\`, chromedp.ByQuery),
		chromedp.WaitVisible(\`.painel\`, chromedp.ByQuery),
		chromedp.Text(\`.saudacao\`, &saudacao, chromedp.ByQuery),
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Saudação:", saudacao)
}`,
      },
      {
        lang: "go",
        code: `// Configurando navegador com opções customizadas (proxy, user-agent, headful).
package main

import (
	"context"
	"log"

	"github.com/chromedp/chromedp"
)

func main() {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", false), // false abre janela visível
		chromedp.Flag("disable-gpu", true),
		chromedp.UserAgent("MeuBot/1.0 (+contato@exemplo.com)"),
		chromedp.WindowSize(1280, 800),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	if err := chromedp.Run(ctx, chromedp.Navigate("https://example.com")); err != nil {
		log.Fatal(err)
	}
	log.Println("navegou com sucesso")
}`,
      },
    ],
    points: [
      "chromedp controla o Chrome via DevTools Protocol, sem WebDriver.",
      "Cada operação é uma task; chromedp.Run executa a sequência.",
      "Sempre use context.WithTimeout para evitar travamento em página lenta.",
      "WaitVisible/WaitReady garantem que o elemento existe antes de interagir.",
      "FullScreenshot, Text, AttributeValue e SendKeys cobrem a maioria dos casos.",
      "Idiomático: configurar opções via ExecAllocator (proxy, user-agent, headless).",
      "Armadilha: tentar interagir com elemento antes do JS terminar de renderizar.",
      "Erro comum: rodar chromedp em servidor sem Chrome instalado e ver erro críptico.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Scraping pode violar termos de uso de sites e leis locais. Sempre verifique robots.txt, respeite rate limits e identifique seu bot via User-Agent com contato.",
      },
      {
        type: "tip",
        content: "Em produção, use a imagem Docker chromedp/headless-shell em vez de instalar Chrome no host. Inclui apenas o necessário para rodar headless e é leve.",
      },
      {
        type: "info",
        content: "Para projetos novos, vale comparar com Playwright (que tem binding Go via playwright-go). Playwright suporta Firefox e WebKit além do Chrome, e a API é mais ergonômica para alguns cenários.",
      },
      {
        type: "danger",
        content: "Cada instância do navegador headless consome 100-300 MB de RAM. Em loops sem cancel, você esgota memória rapidamente. Sempre defer cancel() em todos os contextos criados.",
      },
    ],
  },
];
