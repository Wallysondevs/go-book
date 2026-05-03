import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "bem-vindo",
    section: "boas-vindas",
    title: "Bem-vindo ao Go",
    difficulty: "iniciante",
    subtitle: "O que esperar deste livro, como ele está organizado e a melhor forma de aproveitá-lo",
    intro: `Seja muito bem-vindo. Se este é o seu primeiro contato com Go, ou se você já programa em outra linguagem e quer adicionar Go ao seu cinto de utilidades, você está no lugar certo. Este livro foi pensado como uma conversa: vamos do "abrir o terminal" até temas avançados como concorrência, testes, web e ferramentas de performance. Sem pular etapas, sem assumir que você já sabe coisas que ninguém te ensinou.

Go é uma linguagem criada para resolver problemas reais de quem escreve software de servidor: serviços que precisam aguentar tráfego, ferramentas de linha de comando que rodam rápido e código que mais de uma pessoa precisa entender. Ela é pequena de propósito. Você consegue ler a especificação inteira em uma tarde e ainda sobra tempo para um café. Esse minimalismo, que à primeira vista parece pouco, é justamente o que faz times inteiros conseguirem manter projetos enormes sem virar uma babel de estilos.

A pedagogia aqui é simples: cada capítulo abre com o porquê, mostra o como com código que realmente compila, oferece pontos práticos e termina com alertas para você não cair em armadilhas conhecidas. Você vai ver comparações com Python, Java, C e JavaScript ao longo do caminho, porque entender como Go é diferente ajuda muito mais do que decorar regras isoladas.

A trilha começa motivacional e contextual. Por que Go existe? Como ele se compara? Onde ele roda? Depois mergulhamos em instalação, sintaxe, controle de fluxo, funções, structs, interfaces, concorrência, web, testes e tooling. Não é necessário saber tudo de cabeça. Tenha o livro aberto, copie os exemplos, mude valores, quebre coisas. É quebrando que se aprende.

Por fim, um conselho que vale ouro: não tente entender Go pela lente de Python ou Java. Go tem decisões próprias, às vezes incômodas para quem vem de outras linguagens, mas que fazem sentido depois que você usa por algumas semanas. Dê uma chance ao jeito Go de fazer as coisas e você vai começar a sentir saudade dele em outras linguagens.`,
    codes: [
      {
        lang: "go",
        code: `// Seu primeiro arquivo Go. Salve como ola.go.
package main // todo programa executável vive no pacote "main"

import "fmt" // pacote padrão para entrada/saída formatada

func main() {
	// fmt.Println escreve no terminal e quebra a linha no fim
	fmt.Println("Bem-vindo ao Go!")
}
// → saída: Bem-vindo ao Go!`,
      },
      {
        lang: "bash",
        code: `# Compilar e rodar em um único passo, sem gerar binário no disco.
go run ola.go
# → saída: Bem-vindo ao Go!

# Ou compilar para um executável nativo do seu sistema:
go build ola.go
./ola              # no Linux/macOS
# ola.exe          # no Windows`,
      },
      {
        lang: "go",
        code: `// Um programa um pouquinho mais real: total de um carrinho de compras.
package main

import "fmt"

func main() {
	preco := 19.90        // := declara e infere o tipo (float64)
	quantidade := 3       // tipo inferido como int
	total := preco * float64(quantidade) // conversão explícita: Go não converte por você
	fmt.Printf("Total: R$ %.2f\n", total)
}
// → saída: Total: R$ 59.70`,
      },
      {
        lang: "bash",
        code: `# Estrutura típica de um projeto novo em Go (módulo).
mkdir meu-app && cd meu-app
go mod init exemplo/meu-app   # cria o arquivo go.mod (gerenciador de dependências)
# Crie um arquivo main.go com um package main e func main(),
# e depois rode:
go run .`,
      },
      {
        lang: "go",
        code: `// Erros são parte da rotina. Veja como Go te avisa:
package main

import "fmt"

func main() {
	x := 10
	// Em Go, variável declarada e não usada é erro de compilação.
	fmt.Println("oi")
}
// → erro: x declared and not used
// Diferente de Python ou JavaScript, Go é rigoroso por design para evitar lixo no código.`,
      },
    ],
    points: [
      "Comece copiando, rodando e quebrando os exemplos; ler sem digitar não fixa.",
      "Cada capítulo segue o ritmo: porquê → como → exemplos → armadilhas.",
      "Use go run para experimentar e go build quando quiser um executável nativo.",
      "Não traduza Go para Python/Java na sua cabeça; aprenda o jeito Go primeiro.",
      "Idiomático: nomes curtos e claros (i, ctx, err) em escopo curto, descritivos em escopo grande.",
      "Armadilha: ignorar avisos do compilador como variável não usada — em Go, isso não compila.",
      "Tenha um arquivo de anotações com erros que você cometeu e como resolveu.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre que terminar um capítulo, tente reescrever o exemplo principal sem olhar. Esse pequeno exercício revela exatamente o que você ainda não internalizou.",
      },
      {
        type: "info",
        content: "Todos os exemplos deste livro foram pensados para Go 1.22 ou superior. Versões mais antigas podem não ter recursos como o novo for-range sobre inteiros.",
      },
      {
        type: "warning",
        content: "Não pule a seção de instalação achando que já tem Go funcionando. Versões antigas instaladas pelo sistema podem confundir caminhos e quebrar tutoriais.",
      },
    ],
  },
  {
    slug: "por-que-go",
    section: "boas-vindas",
    title: "Por que aprender Go?",
    difficulty: "iniciante",
    subtitle: "Vantagens reais, casos de uso onde Go brilha e oportunidades de carreira",
    intro: `Existem dezenas de linguagens populares hoje. Por que investir tempo em Go especificamente? A resposta vem em três camadas: produtividade, performance e carreira.

Na camada de produtividade, Go entrega algo raro: uma linguagem compilada, com tipagem estática, que parece quase tão simples de escrever quanto Python. Você não precisa configurar build tools complicadas como em Java, nem se preocupar com gerenciamento manual de memória como em C, nem decifrar mensagens de erro de cinco páginas como em alguns ecossistemas TypeScript. O compilador é rápido, as ferramentas vêm na caixa (formatador, testador, profiler, gerador de documentação) e o ciclo de feedback é curtíssimo. Em projetos reais, isso significa entregar mais funcionalidade no mesmo prazo.

Na camada de performance, Go gera binários nativos que rodam direto no sistema operacional, sem máquina virtual. Um servidor escrito em Go consome muito menos memória que o equivalente em Java ou Node.js, e responde mais rápido em latências de cauda. A concorrência baseada em goroutines e channels foi projetada para tirar proveito de máquinas com muitos núcleos, sem o terror de threads tradicionais. Você consegue subir milhares de operações simultâneas em um único processo sem suar.

Na camada de carreira, Go aparece em vagas de back-end, plataforma, DevOps, infraestrutura e SRE em empresas grandes e em startups que escalam. Docker, Kubernetes, Terraform, Prometheus, Grafana, etcd e a maior parte da infraestrutura moderna de nuvem é escrita em Go. Aprender a linguagem te abre as portas dessas comunidades. No Brasil, vagas de Go costumam pagar acima da média justamente porque a oferta de profissionais ainda é menor que a demanda.

E tem o benefício menos óbvio: Go te ensina disciplina. A linguagem força você a tratar erros explicitamente, a manter o código formatado e a escrever de um jeito que outras pessoas entendem. Isso forma um programador melhor mesmo que você acabe trabalhando em outras stacks depois.`,
    codes: [
      {
        lang: "go",
        code: `// Servidor HTTP em poucas linhas, sem framework, usando só a biblioteca padrão.
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/ola", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Olá, mundo via HTTP!")
	})
	// Sobe na porta 8080. Em Python/Node você precisaria de Flask/Express.
	http.ListenAndServe(":8080", nil)
}
// Acesse http://localhost:8080/ola no navegador.`,
      },
      {
        lang: "go",
        code: `// Concorrência simples: três tarefas rodando em paralelo com goroutines.
package main

import (
	"fmt"
	"sync"
	"time"
)

func tarefa(nome string, wg *sync.WaitGroup) {
	defer wg.Done() // garante que o WaitGroup decrementa ao sair
	time.Sleep(500 * time.Millisecond)
	fmt.Println("terminei:", nome)
}

func main() {
	var wg sync.WaitGroup
	for _, n := range []string{"pedido-1", "pedido-2", "pedido-3"} {
		wg.Add(1)
		go tarefa(n, &wg) // a palavra "go" dispara em paralelo
	}
	wg.Wait() // espera todas terminarem
}
// → saída (ordem pode variar): terminei: pedido-2 / terminei: pedido-1 / terminei: pedido-3`,
      },
      {
        lang: "bash",
        code: `# Compilar para outro sistema sem precisar dele instalado (cross-compilation nativa).
GOOS=linux GOARCH=amd64 go build -o app-linux ./
GOOS=windows GOARCH=amd64 go build -o app.exe ./
GOOS=darwin GOARCH=arm64 go build -o app-mac ./
# Três binários estáticos, prontos para rodar, sem JVM nem interpretador junto.`,
      },
      {
        lang: "go",
        code: `// Tipagem estática forte: o compilador pega bobagens antes do programa rodar.
package main

import "fmt"

func somar(a int, b int) int {
	return a + b
}

func main() {
	fmt.Println(somar(2, 3))      // → 5
	// fmt.Println(somar(2, "x")) // não compila: cannot use "x" (string) as int
}
// Em Python, só veria esse erro em produção, na primeira chamada com string.`,
      },
      {
        lang: "go",
        code: `// Tratamento de erro explícito: nada de exceções escondidas pelo caminho.
package main

import (
	"fmt"
	"strconv"
)

func main() {
	idade, err := strconv.Atoi("trinta") // tenta converter texto em int
	if err != nil {
		fmt.Println("entrada inválida:", err)
		return
	}
	fmt.Println("idade:", idade)
}
// → saída: entrada inválida: strconv.Atoi: parsing "trinta": invalid syntax`,
      },
    ],
    points: [
      "Compila para binário nativo único, sem dependência de runtime no servidor.",
      "Concorrência de primeira classe com goroutines e channels, baratos e simples.",
      "Biblioteca padrão riquíssima: HTTP, JSON, criptografia, testes, profiling vêm prontos.",
      "Ferramentas oficiais incluídas: gofmt, go test, go vet, go doc, sem configurar nada.",
      "Mercado forte em DevOps, plataforma, back-end e infraestrutura de nuvem.",
      "Idiomático: tratar erro explicitamente com if err != nil em vez de esconder em try/catch.",
      "Armadilha: tentar escrever Go como se fosse Java, criando hierarquias enormes de classes.",
      "Armadilha: ignorar o valor de erro retornado e descobrir o problema só em produção.",
    ],
    alerts: [
      {
        type: "success",
        content: "Docker, Kubernetes, Terraform, Prometheus e boa parte da infraestrutura moderna de nuvem são escritos em Go. Aprender a linguagem te coloca dentro dessas comunidades.",
      },
      {
        type: "info",
        content: "Go não é a linguagem mais expressiva nem tem os recursos mais novos da academia. Ela é, de propósito, conservadora e estável, o que ajuda muito em projetos de longa vida.",
      },
      {
        type: "tip",
        content: "Se você trabalha com DevOps, microsserviços ou ferramentas de linha de comando, Go é uma das melhores apostas de retorno por hora investida hoje.",
      },
      {
        type: "warning",
        content: "Go não é bala de prata. Para front-end, ciência de dados pesada ou aplicações desktop ricas, outras stacks ainda fazem mais sentido.",
      },
    ],
  },
  {
    slug: "historia-go",
    section: "boas-vindas",
    title: "A história do Go",
    difficulty: "iniciante",
    subtitle: "Da frustração de três engenheiros do Google até virar a linguagem da nuvem",
    intro: `Toda ferramenta carrega marcas das dores que motivaram sua criação. Com Go não é diferente. A linguagem nasceu em 2007 dentro do Google, num momento em que três engenheiros bastante experientes estavam particularmente irritados com o estado das linguagens de servidor da época.

Os três eram Robert Griesemer, Rob Pike e Ken Thompson. Pesos pesados. Thompson é um dos criadores do Unix e da linguagem B, antecessora do C. Pike trabalhou no Plan 9 e em UTF-8. Griesemer havia trabalhado na máquina virtual V8 do JavaScript e no compilador Java HotSpot. Eles estavam cansados de esperar builds de C++ que demoravam meia hora, de hierarquias intermináveis em Java e da dificuldade de escrever código concorrente correto. Numa tarde, esboçaram em um quadro branco como seria uma linguagem que resolvesse essas dores. Era o embrião de Go.

O lançamento público veio em novembro de 2009 como projeto de código aberto. A versão 1.0, com promessa formal de compatibilidade, saiu em 2012. Essa promessa é importante: programas escritos em Go 1.0 ainda compilam hoje, mais de uma década depois. Pouquíssimas linguagens modernas levam compatibilidade tão a sério, e isso é deliberado, porque empresas precisam confiar que código escrito hoje vai sobreviver.

A partir de 2014, com o Docker conquistando o mundo, Go virou meio que a linguagem padrão da nuvem. Kubernetes, Terraform, Prometheus, etcd, Consul, InfluxDB e muitos outros projetos críticos vieram em seguida. Em 2022, Go ganhou suporte oficial a generics na versão 1.18, depois de uma década de discussões muito cuidadosas sobre como adicionar o recurso sem destruir a simplicidade da linguagem.

Hoje Go é mantido pelo time oficial no Google, mas com governança aberta e milhares de contribuidores externos. Os lançamentos seguem um ritmo previsível de duas versões por ano. Conhecer essa história ajuda você a entender certas escolhas que parecem teimosas (como ausência de exceções) e a apreciar que muitas delas vêm de décadas de experiência em sistemas reais.`,
    codes: [
      {
        lang: "go",
        code: `// Descobrir a versão de Go a partir de um programa.
package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("Versão de Go:", runtime.Version())
	fmt.Println("Sistema:", runtime.GOOS, "/", runtime.GOARCH)
}
// → saída de exemplo:
// Versão de Go: go1.22.0
// Sistema: linux / amd64`,
      },
      {
        lang: "bash",
        code: `# No terminal, a mesma informação fica a um comando de distância.
go version
# → saída esperada: go version go1.22.0 linux/amd64

# Para ver tudo que vem na caixa:
go help`,
      },
      {
        lang: "go",
        code: `// Marcos da linguagem em forma de programa, só para visualizar.
package main

import "fmt"

func main() {
	historia := []struct {
		ano  int
		fato string
	}{
		{2007, "Griesemer, Pike e Thompson começam o projeto no Google"},
		{2009, "Anúncio público como software livre"},
		{2012, "Go 1.0 com promessa formal de compatibilidade"},
		{2015, "Docker e Kubernetes consolidam Go como linguagem da nuvem"},
		{2018, "Modules estáveis (go mod) substituem o GOPATH antigo"},
		{2022, "Go 1.18 introduz generics depois de uma década de debate"},
		{2024, "Go 1.22 melhora roteamento HTTP e for-range sobre inteiros"},
	}
	for _, m := range historia {
		fmt.Printf("%d → %s\n", m.ano, m.fato)
	}
}`,
      },
      {
        lang: "go",
        code: `// Curiosidade: o gopher é o mascote oficial, criado pela artista Renee French.
// O nome "Go" às vezes aparece como "Golang" porque "go" sozinho é difícil de buscar
// em mecanismos de pesquisa, mas o nome oficial da linguagem é apenas Go.
package main

import "fmt"

func main() {
	// Pequena homenagem em ASCII ao gopher:
	fmt.Println("  ʕ◔ϖ◔ʔ  Olá do gopher!")
}`,
      },
      {
        lang: "bash",
        code: `# A documentação oficial vem com a instalação. Sem internet, você ainda consegue ler.
go doc fmt.Println
# Mostra a assinatura e a explicação direto no terminal.

# Para abrir a documentação completa de um pacote:
go doc -all net/http`,
      },
    ],
    points: [
      "Criada em 2007 no Google por Griesemer, Pike e Thompson, lançada em 2009.",
      "A versão 1.0 veio em 2012 com uma promessa de compatibilidade que ainda é mantida.",
      "Docker, Kubernetes e Terraform popularizaram Go como linguagem da nuvem.",
      "Generics chegaram só em 2022 (Go 1.18), de propósito, depois de muito debate.",
      "Releases acontecem duas vezes por ano, em fevereiro e agosto, de forma previsível.",
      "Idiomático: confie na biblioteca padrão antes de instalar pacotes externos.",
      "Armadilha: estudar tutoriais antigos com GOPATH em vez de go modules.",
      "Armadilha: confundir Go (linguagem) com Go! (uma outra linguagem antiga e quase morta).",
    ],
    alerts: [
      {
        type: "info",
        content: "O nome oficial é Go. 'Golang' virou apelido apenas por causa de mecanismos de busca, já que pesquisar só por 'go' retorna milhões de resultados irrelevantes.",
      },
      {
        type: "tip",
        content: "Sempre que tiver dúvida sobre uma função padrão, rode go doc nome.Funcao no terminal antes de pesquisar no Google. Costuma ser mais rápido e mais correto.",
      },
      {
        type: "success",
        content: "A promessa de compatibilidade do Go 1 é levada tão a sério que código escrito em 2012 ainda compila e roda em Go 1.22 sem alterações na maioria dos casos.",
      },
    ],
  },
  {
    slug: "go-vs-outras",
    section: "boas-vindas",
    title: "Go vs outras linguagens",
    difficulty: "iniciante",
    subtitle: "Comparações honestas com Python, Java, C e JavaScript para você situar o Go",
    intro: `Toda linguagem é boa em algumas coisas e ruim em outras. Comparar Go com Python, Java, C e JavaScript ajuda a entender quando ele é a melhor escolha e quando você deveria usar outra ferramenta.

Comparado a Python, Go é mais verboso na superfície, mas muito mais previsível. Python te entrega produtividade rápida com tipagem dinâmica, mas você paga em performance e em bugs que só aparecem em runtime. Go te obriga a declarar tipos, e o compilador pega bobagens antes do código rodar. Quando o serviço cresce e mais gente entra no time, essa rigidez vira economia de horas de debug. Por outro lado, para um script que vai rodar três vezes na vida, Python costuma ser mais prático.

Comparado a Java, Go é absurdamente mais simples. Não há classes nem herança, não há AbstractFactoryBuilderImpl, não há JVM para configurar. Em Java você normalmente abre uma IDE pesada e configura Maven; em Go você abre um editor qualquer e roda go run. Em compensação, Java tem um ecossistema corporativo gigantesco, ferramentas maduras de profiling e bibliotecas para problemas muito específicos que Go ainda não cobre.

Comparado a C, Go é uma linguagem moderna com garbage collector e segurança de memória. Você não precisa lembrar de free() nem de calcular tamanhos de buffer. Mas C ainda manda em situações onde cada microssegundo conta, em sistemas embarcados restritos e em código que precisa rodar onde nem sequer existe um runtime. Go cobre 95% dos casos onde C era usado para serviços de rede, sem a dor.

Comparado a JavaScript e Node.js, Go entrega muito mais throughput por servidor com muito menos memória. Não há event loop bloqueado por uma operação pesada, porque goroutines se distribuem entre os núcleos da CPU. Por outro lado, JavaScript domina o front-end e tem um ecossistema npm gigantesco. Para muitos times, manter JavaScript no back-end faz sentido só por compartilhar conhecimento entre front e back.

A regra geral é boa: se você precisa de back-end concorrente, ferramentas de linha de comando ou software de infraestrutura, Go é uma escolha excelente. Se você precisa de ciência de dados pesada, scripts rápidos ou desktop ricos, outras stacks ainda vencem. Conhecer essas diferenças torna você um profissional melhor, capaz de escolher a ferramenta certa em vez de defender a sua linguagem favorita.`,
    codes: [
      {
        lang: "go",
        code: `// Em Go, somar uma fatia de inteiros precisa de um loop explícito.
package main

import "fmt"

func main() {
	numeros := []int{1, 2, 3, 4, 5}
	total := 0
	for _, n := range numeros {
		total += n
	}
	fmt.Println(total) // → 15
}
// Em Python seria: sum([1,2,3,4,5]). Mais curto, mas Go expõe o que está acontecendo.`,
      },
      {
        lang: "go",
        code: `// Tratamento de erro idiomático em Go: nada de try/catch escondendo a verdade.
package main

import (
	"fmt"
	"os"
)

func main() {
	conteudo, err := os.ReadFile("notas.txt")
	if err != nil {
		fmt.Println("não consegui ler:", err)
		return
	}
	fmt.Printf("%d bytes lidos\n", len(conteudo))
}
// Em Java seria try { ... } catch (IOException e) { ... }, mais cerimonial.`,
      },
      {
        lang: "go",
        code: `// Concorrência: 1000 requisições falsas em paralelo, sem dor.
package main

import (
	"fmt"
	"sync"
	"time"
)

func chamada(id int, wg *sync.WaitGroup) {
	defer wg.Done()
	time.Sleep(10 * time.Millisecond) // simula latência de rede
	_ = id                            // ignora propositalmente
}

func main() {
	var wg sync.WaitGroup
	inicio := time.Now()
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go chamada(i, &wg)
	}
	wg.Wait()
	fmt.Println("tudo em", time.Since(inicio))
}
// → saída típica: tudo em ~15ms (não 10s, porque rodam concorrentes)`,
      },
      {
        lang: "go",
        code: `// Sem classes, sem herança. Composição de struct + método é o caminho idiomático.
package main

import "fmt"

type Conta struct {
	Titular string
	Saldo   float64
}

// Método com receptor de ponteiro: altera o estado da conta.
func (c *Conta) Depositar(valor float64) {
	c.Saldo += valor
}

func main() {
	c := Conta{Titular: "Marina", Saldo: 100}
	c.Depositar(50)
	fmt.Printf("%s tem R$ %.2f\n", c.Titular, c.Saldo)
	// → Marina tem R$ 150.00
}`,
      },
      {
        lang: "bash",
        code: `# Tamanho de binário: Go vs Java vs Node, comparação informal.
# Um servidor HTTP simples compilado em Go gera ~6 a 10 MB, estático,
# pronto para subir num container "FROM scratch".
go build -ldflags "-s -w" -o servidor ./
ls -lh servidor
# → exemplo: -rwxr-xr-x 1 user user 6.2M servidor
# Para subir esse binário não precisa instalar JVM nem Node no servidor.`,
      },
    ],
    points: [
      "Comparado a Python: mais rígido, mais rápido, menos mágico, mais previsível.",
      "Comparado a Java: drasticamente mais simples e sem JVM para configurar.",
      "Comparado a C: tem garbage collector e segurança de memória, sem perder performance.",
      "Comparado a Node.js: melhor throughput por servidor e concorrência real entre núcleos.",
      "Sem classes nem herança: prefira composição com structs e interfaces pequenas.",
      "Idiomático: sempre lidar com err logo após chamar a função que pode falhar.",
      "Armadilha: tentar replicar padrões pesados de Java (factories, abstract base classes) em Go.",
      "Armadilha: descartar Go por ser verboso sem testar; a previsibilidade compensa em projetos longos.",
    ],
    alerts: [
      {
        type: "info",
        content: "Não existe linguagem melhor em absoluto. Existe linguagem mais adequada para um problema, num time, num momento. Aprenda a escolher pela necessidade.",
      },
      {
        type: "warning",
        content: "Forçar paradigmas de outra linguagem em Go é a fonte número um de código feio. Se um colega só faz interfaces gigantes e hierarquias profundas, ele provavelmente está com saudade do Java.",
      },
      {
        type: "tip",
        content: "Se você já programa em outra linguagem, faça em Go um pequeno projeto que você já tem em outra stack. A comparação direta ensina mais que qualquer livro.",
      },
      {
        type: "success",
        content: "Saber Go te torna mais empregável até em times que não usam Go, porque demonstra que você consegue pensar em concorrência, performance e simplicidade ao mesmo tempo.",
      },
    ],
  },
  {
    slug: "onde-go-roda",
    section: "boas-vindas",
    title: "Onde o Go roda",
    difficulty: "iniciante",
    subtitle: "Sistemas, arquiteturas, contêineres, navegador via WebAssembly e até dispositivos pequenos",
    intro: `Uma das características mais subestimadas de Go é onde ele consegue rodar. O mesmo código-fonte compila para Windows, macOS, Linux, FreeBSD, Android, e para arquiteturas que vão de Intel x86 até ARM de 64 bits e RISC-V. Isso não é detalhe técnico, é vantagem prática gigante: você desenvolve no seu notebook macOS e gera, sem sair da sua cadeira, um binário pronto para o servidor Linux ARM lá na nuvem.

Diferente de Python ou Node, em Go não existe interpretador rodando junto. O compilador gera um binário estático, autocontido, que basta copiar para a máquina de destino e executar. Esse modelo casa perfeitamente com containers Docker. Imagens de produção em Go costumam usar a base FROM scratch, um container literalmente vazio, com 6 a 15 MB de tamanho total. Compare com imagens de Node ou Python que facilmente passam dos 200 MB.

A cross-compilation é primeira classe. Você define duas variáveis de ambiente, GOOS (sistema operacional) e GOARCH (arquitetura), e o compilador faz o resto. Não precisa de máquina virtual, nem de toolchain externa, nem de container builder. É a mesma compilação de sempre, só apontando para outro alvo. Isso permite, por exemplo, gerar binários para Raspberry Pi sem nunca ligar o Raspberry.

Go também roda no navegador via WebAssembly. Você compila com GOOS=js GOARCH=wasm e carrega o .wasm dentro de uma página HTML. É útil para portar lógica de negócio do back-end para o front-end sem reescrever em JavaScript. E para dispositivos com recursos restritos, projetos como TinyGo permitem escrever Go que roda em microcontroladores de poucos kilobytes de RAM, como Arduino e ESP32.

No mundo de servidores, Go é a base de boa parte da infraestrutura moderna: Kubernetes, Docker, Terraform, Prometheus, Grafana, Caddy, Hugo, etcd, Vault. Se você trabalha com nuvem, está rodando Go o tempo todo, mesmo sem perceber. Saber que ele cabe em todo lugar amplia o que você consegue construir, do servidor de bilhões de requisições por dia até o sensor IoT na sua estufa de tomate.`,
    codes: [
      {
        lang: "go",
        code: `// Descobrir em qual sistema e arquitetura o programa está rodando.
package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("SO:", runtime.GOOS)         // linux, darwin, windows, freebsd...
	fmt.Println("Arquitetura:", runtime.GOARCH) // amd64, arm64, 386, riscv64...
	fmt.Println("CPUs disponíveis:", runtime.NumCPU())
}
// → saída típica em um Mac M2:
// SO: darwin
// Arquitetura: arm64
// CPUs disponíveis: 8`,
      },
      {
        lang: "bash",
        code: `# Cross-compilation: gerar binários para várias plataformas a partir do mesmo código.
# Servidor Linux 64 bits (o mais comum em produção).
GOOS=linux   GOARCH=amd64 go build -o app-linux   ./

# Raspberry Pi 4 (ARM 64 bits).
GOOS=linux   GOARCH=arm64 go build -o app-rpi     ./

# Windows 64 bits.
GOOS=windows GOARCH=amd64 go build -o app.exe     ./

# macOS Apple Silicon.
GOOS=darwin  GOARCH=arm64 go build -o app-mac     ./

# Lista todos os alvos suportados:
go tool dist list | head -10`,
      },
      {
        lang: "go",
        code: `// Escrever caminhos de arquivo de jeito portável, funciona em Linux, Mac e Windows.
package main

import (
	"fmt"
	"path/filepath"
)

func main() {
	caminho := filepath.Join("dados", "clientes", "marina.json")
	fmt.Println(caminho)
	// No Linux/Mac: dados/clientes/marina.json
	// No Windows:   dados\clientes\marina.json
}
// Use filepath.Join em vez de juntar strings com "/" na unha.`,
      },
      {
        lang: "bash",
        code: `# Dockerfile minimalista para um serviço Go: imagem final de poucos megabytes.
# Etapa 1: build dentro de um container com Go.
# FROM golang:1.22 AS build
# WORKDIR /src
# COPY . .
# RUN CGO_ENABLED=0 go build -o /app ./

# Etapa 2: imagem final completamente vazia, só com o binário.
# FROM scratch
# COPY --from=build /app /app
# EXPOSE 8080
# ENTRYPOINT ["/app"]

# Construir e rodar:
docker build -t meu-servico .
docker images meu-servico
# → exemplo: meu-servico  latest  9MB
docker run -p 8080:8080 meu-servico`,
      },
      {
        lang: "go",
        code: `// Comportamento condicional por sistema, sem hacks.
package main

import (
	"fmt"
	"runtime"
)

func main() {
	switch runtime.GOOS {
	case "windows":
		fmt.Println("No Windows usaríamos: dir")
	case "linux", "darwin":
		fmt.Println("No Linux/macOS usaríamos: ls")
	default:
		fmt.Println("Sistema não tratado:", runtime.GOOS)
	}
}
// Para casos mais complexos, Go tem build tags como //go:build linux para arquivos inteiros.`,
      },
      {
        lang: "bash",
        code: `# Compilar para WebAssembly: rodar Go dentro do navegador.
GOOS=js GOARCH=wasm go build -o app.wasm ./
# O arquivo wasm é carregado por um pequeno glue JS que vem na instalação do Go:
# cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
# Depois é só servir uma página HTML que carrega o app.wasm.`,
      },
    ],
    points: [
      "Go compila para Linux, macOS, Windows, FreeBSD, Android e várias arquiteturas.",
      "Cross-compilation nativa: defina GOOS e GOARCH e pronto, sem toolchain externa.",
      "Binário estático, sem dependências de runtime no servidor; ótimo para containers.",
      "Imagens Docker FROM scratch ficam minúsculas, com superfície de ataque mínima.",
      "Roda no navegador via WebAssembly e em microcontroladores via TinyGo.",
      "Use path/filepath para caminhos portáveis, nunca concatene strings com / na unha.",
      "Idiomático: usar runtime.GOOS dentro do código e build tags para isolar arquivos por SO.",
      "Armadilha: assumir que / sempre funciona como separador; em Windows é \\.",
      "Armadilha: depender de comandos do sistema (ls, dir) sem checar o SO antes.",
    ],
    alerts: [
      {
        type: "info",
        content: "O valor 'darwin' que aparece em runtime.GOOS é o nome interno do macOS, herdado do projeto Darwin que forma o núcleo do sistema da Apple. Não é erro.",
      },
      {
        type: "tip",
        content: "Antes de subir um binário Go em produção, gere com -ldflags '-s -w' para remover símbolos de debug. O binário fica bem menor sem perder funcionalidade.",
      },
      {
        type: "success",
        content: "Conseguir gerar binários para qualquer sistema sem precisar dele instalado é um superpoder de produtividade. Times pequenos entregam para várias plataformas com pouquíssimo esforço.",
      },
      {
        type: "warning",
        content: "Cuidado ao usar pacotes que dependem de C via cgo: você perde parte da portabilidade fácil e da imagem FROM scratch. Prefira pacotes Go puro sempre que der.",
      },
    ],
  },
];
