import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "arquivos-leitura",
    section: "io-concorrencia",
    title: "Lendo arquivos com o pacote os",
    difficulty: "iniciante",
    subtitle: "Como abrir e ler arquivos de texto e binários do disco usando a biblioteca padrão",
    intro: `Mais cedo ou mais tarde todo programa precisa ler algo do disco: um arquivo de configuração, uma planilha CSV exportada do sistema, um log para investigar bug, uma imagem para subir num storage. Em Go, a porta de entrada para essas tarefas é o pacote os, que oferece funções de baixo nível para mexer com o sistema de arquivos, mais alguns atalhos confortáveis para o dia a dia.

Se você vem do Python, lembra do open("arquivo.txt").read() — uma linha e pronto. Em Go existe equivalente: os.ReadFile devolve todo o conteúdo num slice de bytes, e em duas linhas você tem o arquivo na memória. A diferença filosófica é que Go te força a tratar o erro logo ali, na hora, em vez de deixar uma exceção subir silenciosamente. Isso parece chato no começo, mas quando o disco encher ou faltar permissão, seu programa vai falhar de forma controlada em vez de explodir no usuário.

Para arquivos pequenos (até alguns megabytes), os.ReadFile é o caminho mais simples. Para arquivos grandes — pense num log de 2 GB ou um vídeo — você não quer carregar tudo de uma vez na memória. Aí entram os.Open, que devolve um *os.File implementando io.Reader, e padrões como io.Copy ou bufio.Scanner que veremos nos próximos capítulos. A regra prática: se o arquivo cabe folgado na RAM, ReadFile resolve; se não cabe, leia em pedaços.

Em qualquer caso, sempre feche o que você abriu. O idiomático em Go é usar defer logo após o Open: defer file.Close(). Isso garante que o arquivo será fechado quando a função retornar, mesmo que aconteça um erro no meio. Esquecer Close é como esquecer a torneira aberta: parece inofensivo até o sistema ficar sem file descriptors disponíveis.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
)

func main() {
	// os.ReadFile devolve []byte com todo o conteúdo do arquivo.
	dados, err := os.ReadFile("config.txt")
	if err != nil {
		// Se o arquivo não existe ou não temos permissão, paramos aqui.
		fmt.Println("erro ao ler:", err)
		return
	}
	// Convertendo []byte para string para imprimir como texto.
	fmt.Println(string(dados))
	// → saída: o conteúdo cru do arquivo config.txt
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"io"
	"os"
)

func main() {
	// os.Open abre o arquivo em modo leitura e devolve um *os.File.
	f, err := os.Open("pedidos.csv")
	if err != nil {
		fmt.Println("não consegui abrir:", err)
		return
	}
	// defer garante que Close vai rodar ao final, mesmo com erro.
	defer f.Close()

	// Lemos tudo via io.ReadAll quando o tamanho é razoável.
	conteudo, err := io.ReadAll(f)
	if err != nil {
		fmt.Println("erro lendo:", err)
		return
	}
	fmt.Printf("li %d bytes do arquivo\\n", len(conteudo))
	// → saída: li 1234 bytes do arquivo
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

func main() {
	// Tratando o caso específico de "arquivo não encontrado".
	_, err := os.ReadFile("nao-existe.txt")
	if errors.Is(err, os.ErrNotExist) {
		fmt.Println("arquivo ainda não foi criado, seguindo com padrão")
		return
	}
	if err != nil {
		fmt.Println("outro erro:", err)
		return
	}
	fmt.Println("leu com sucesso")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
)

func main() {
	// os.Stat devolve metadados do arquivo (tamanho, data, permissões).
	info, err := os.Stat("relatorio.pdf")
	if err != nil {
		fmt.Println("não achei:", err)
		return
	}
	fmt.Println("nome:", info.Name())
	fmt.Println("tamanho em bytes:", info.Size())
	fmt.Println("é diretório?", info.IsDir())
	fmt.Println("modificado em:", info.ModTime())
}`,
      },
      {
        lang: "bash",
        code: `# Crie um arquivo simples para testar os exemplos:
echo "linha 1" > config.txt
echo "linha 2" >> config.txt

# Rode o programa Go:
go run main.go
# → saída: linha 1\\nlinha 2`,
      },
    ],
    points: [
      "os.ReadFile é o atalho ideal para arquivos pequenos: uma chamada e você tem []byte.",
      "Para arquivos grandes, use os.Open + leitura em pedaços para não estourar a memória.",
      "Idiomático: sempre que abrir com os.Open, escreva imediatamente defer f.Close().",
      "Use errors.Is(err, os.ErrNotExist) para distinguir 'não existe' de outros erros.",
      "os.Stat te dá tamanho, data e permissões sem precisar abrir o arquivo de verdade.",
      "Armadilha: esquecer de tratar o err e tentar usar dados; em Go isso pode dar panic depois.",
      "Armadilha: assumir UTF-8 sem checar — arquivos podem vir com encoding diferente (latin1, etc.).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando estiver em dúvida entre os.ReadFile e os.Open, pergunte: o arquivo cabe folgado na memória? Se sim, ReadFile economiza linhas. Se não, abra e leia em pedaços com bufio.",
      },
      {
        type: "warning",
        content: "Caminhos relativos (config.txt) dependem de onde você roda o binário, não de onde está o código fonte. Para evitar surpresas, use caminhos absolutos ou resolva via filepath.Abs.",
      },
      {
        type: "info",
        content: "Em sistemas Unix existe um limite de file descriptors abertos por processo (ulimit -n). Esquecer Close em loop é a causa clássica do erro 'too many open files'.",
      },
    ],
  },
  {
    slug: "arquivos-escrita",
    section: "io-concorrencia",
    title: "Escrevendo arquivos no disco",
    difficulty: "iniciante",
    subtitle: "Criar, sobrescrever, anexar e gerenciar permissões ao gravar arquivos em Go",
    intro: `Ler é só metade da história. Gravar é onde acontece a mágica de salvar o estado do seu programa: relatórios gerados, logs estruturados, exportações de dados, arquivos de configuração que o usuário edita. Em Go, gravar arquivo é tão simples quanto ler — e ao mesmo tempo te obriga a pensar em coisas que outras linguagens escondem, como permissões, modo de abertura e tratamento atômico.

A função-atalho é os.WriteFile. Você passa caminho, conteúdo em []byte e um modo de permissão (tipicamente 0644, que significa 'dono lê e escreve, todo mundo só lê'). Se o arquivo não existir, é criado. Se existir, é sobrescrito por completo. Compare com Python (open('x', 'w').write(...)) ou Node (fs.writeFileSync) — a ideia é a mesma, com a diferença de que em Go você passa permissões explicitamente, sem confiar em padrões obscuros do sistema.

Quando você quer mais controle, entra os.OpenFile com flags. É aqui que mora a flexibilidade: O_APPEND para adicionar no final (ideal para logs), O_CREATE para criar se não existir, O_TRUNC para zerar o conteúdo antes, O_EXCL para falhar se já existir. Combinando essas flags você cobre 95 por cento dos cenários reais sem depender de biblioteca externa.

Um ponto delicado é a chamada gravação atômica: você não quer que outro processo leia um arquivo pela metade enquanto você ainda está escrevendo. O padrão idiomático é gravar primeiro num arquivo temporário no mesmo diretório e depois usar os.Rename para mover por cima do alvo. Como rename no mesmo filesystem é atômico, ou o leitor vê a versão antiga inteira, ou a nova inteira, nunca um meio-termo corrompido.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
)

func main() {
	conteudo := []byte("nome,preco\\ncafe,12.50\\npao,0.75\\n")
	// 0644 = dono lê/escreve (rw-), grupo e outros só leem (r--).
	err := os.WriteFile("produtos.csv", conteudo, 0644)
	if err != nil {
		fmt.Println("falhou ao gravar:", err)
		return
	}
	fmt.Println("arquivo gravado com sucesso")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
	"time"
)

func main() {
	// Abrindo em modo "append": cria se não existir, escreve no fim sempre.
	f, err := os.OpenFile("app.log",
		os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("não abri o log:", err)
		return
	}
	defer f.Close()

	linha := fmt.Sprintf("[%s] usuário fez login\\n", time.Now().Format(time.RFC3339))
	if _, err := f.WriteString(linha); err != nil {
		fmt.Println("falhei ao escrever:", err)
	}
	// Cada execução adiciona uma nova linha em vez de sobrescrever.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// gravarAtomico evita que leitores vejam um arquivo pela metade.
func gravarAtomico(destino string, dados []byte) error {
	dir := filepath.Dir(destino)
	// Criamos um temporário no mesmo diretório (mesmo filesystem).
	tmp, err := os.CreateTemp(dir, "tmp-*.dat")
	if err != nil {
		return err
	}
	tmpNome := tmp.Name()

	if _, err := tmp.Write(dados); err != nil {
		tmp.Close()
		os.Remove(tmpNome)
		return err
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmpNome)
		return err
	}
	// Rename é atômico no mesmo filesystem.
	return os.Rename(tmpNome, destino)
}

func main() {
	if err := gravarAtomico("config.json", []byte(\`{"debug":true}\`)); err != nil {
		fmt.Println("erro:", err)
		return
	}
	fmt.Println("gravado de forma atômica")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
)

func main() {
	// O_EXCL faz Open falhar se o arquivo já existir. Útil para "criar uma vez".
	f, err := os.OpenFile("lock.pid",
		os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		fmt.Println("já existe outro processo rodando")
		return
	}
	defer f.Close()
	fmt.Fprintln(f, os.Getpid())
	fmt.Println("lock criado, pid gravado")
}`,
      },
      {
        lang: "bash",
        code: `# Após rodar o exemplo de log algumas vezes:
cat app.log
# → algo como:
# [2024-05-12T10:00:01-03:00] usuário fez login
# [2024-05-12T10:00:09-03:00] usuário fez login

# Ver permissões do arquivo:
ls -l produtos.csv
# → -rw-r--r-- 1 voce voce 32 mai 12 10:00 produtos.csv`,
      },
    ],
    points: [
      "os.WriteFile cria ou sobrescreve em uma chamada — perfeito para casos simples.",
      "Use os.OpenFile com O_APPEND|O_CREATE|O_WRONLY para anexar a logs sem perder histórico.",
      "Permissão 0644 é o padrão sensato para dados; 0600 quando o arquivo tem segredo.",
      "Idiomático: gravação atômica = arquivo temporário + os.Rename para o nome final.",
      "O_EXCL te dá uma 'criação exclusiva' útil para arquivos de lock entre processos.",
      "Armadilha: gravar no mesmo arquivo aberto em modo W sem O_APPEND zera o conteúdo anterior.",
      "Armadilha: criar tmp em /tmp e mover para outro disco quebra a atomicidade do rename.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Sobrescrever direto o arquivo final é arriscado: se o programa morrer no meio, você fica com dados corrompidos. Sempre que o arquivo importa, prefira o padrão temp + rename.",
      },
      {
        type: "tip",
        content: "Para garantir que os bytes realmente foram para o disco antes de seguir, chame f.Sync() antes do Close. Isso força o sistema operacional a descer o cache para a mídia física.",
      },
      {
        type: "danger",
        content: "Permissões 0777 ou 0666 deixam qualquer usuário do sistema mexer no arquivo. Em servidores compartilhados, isso pode virar buraco de segurança sério.",
      },
    ],
  },
  {
    slug: "bufio",
    section: "io-concorrencia",
    title: "bufio: leitura e escrita com buffer",
    difficulty: "iniciante",
    subtitle: "Leia linha por linha, escreva em lotes e ganhe performance com o pacote bufio",
    intro: `Quando você lê ou escreve arquivos byte a byte, cada operação vira uma syscall — uma viagem caríssima até o kernel do sistema operacional. Para arquivos grandes, isso destrói a performance. A solução é simples: agrupar as operações em pedaços maiores, reduzindo a quantidade de viagens. Esse trabalho de juntar pedaços é exatamente o que o pacote bufio faz, e ele é uma das ferramentas mais usadas no dia a dia em Go.

O bufio.Scanner é o equivalente ao for line in arquivo do Python. Você passa qualquer io.Reader (um arquivo, uma conexão de rede, stdin) e ele te entrega o conteúdo em pedaços lógicos: por padrão, uma linha por vez. Isso resolve elegantemente o problema de processar um log de 50 GB sem encher a memória — o Scanner só mantém uma linha de cada vez. Você pode trocar o critério de divisão (palavras, runas, blocos customizados) com SplitFunc, e ainda tem buffer interno configurável.

Para escrita, o bufio.Writer acumula bytes num buffer interno (4 KB por padrão) e só faz a chamada de verdade quando enche ou quando você manda Flush. Em vez de mil syscalls de 1 byte, você faz uma syscall de 1000 bytes. Em escrita de logs, exportações grandes ou geração de CSVs, a diferença pode ser de 10x ou mais em throughput.

A pegadinha clássica é esquecer de chamar Flush no final. O programa termina, o buffer ainda tem dados não gravados, e você abre o arquivo achando que está tudo lá — só para descobrir que faltam linhas. O hábito idiomático é defer w.Flush() logo após criar o Writer, ou então usar uma função fechada para garantir o flush antes do close. Vamos ver isso na prática.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	// Lendo um arquivo de log linha por linha sem carregar tudo na RAM.
	f, err := os.Open("acessos.log")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	linhas := 0
	for scanner.Scan() {
		// scanner.Text() devolve a linha atual (sem o \\n).
		linha := scanner.Text()
		linhas++
		if linhas <= 3 {
			fmt.Println("ex:", linha)
		}
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("erro de leitura:", err)
	}
	fmt.Println("total de linhas:", linhas)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	// Gravando 100 mil linhas com buffer = muito mais rápido.
	f, err := os.Create("saida.txt")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer f.Close()

	w := bufio.NewWriter(f)
	// IMPORTANTE: garantir o flush antes de fechar.
	defer w.Flush()

	for i := 1; i <= 100000; i++ {
		fmt.Fprintf(w, "linha %d\\n", i)
	}
	// O defer acima escreve qualquer resto do buffer no arquivo.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	// Lendo input do teclado com bufio.NewReader.
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Qual seu nome? ")
	// ReadString lê até encontrar o caractere passado (incluído no resultado).
	nome, err := reader.ReadString('\\n')
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Printf("Olá, %s", nome)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"bufio"
	"fmt"
	"strings"
)

func main() {
	// Scanner com divisão por palavras em vez de linhas.
	texto := "Go é uma linguagem rápida e simples"
	scanner := bufio.NewScanner(strings.NewReader(texto))
	scanner.Split(bufio.ScanWords)

	for scanner.Scan() {
		fmt.Println("palavra:", scanner.Text())
	}
	// → saída:
	// palavra: Go
	// palavra: é
	// palavra: uma
	// palavra: linguagem
	// palavra: rápida
	// palavra: e
	// palavra: simples
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	// Linhas muito longas estouram o buffer padrão (64 KB).
	// Para CSVs largos, aumente o buffer manualmente.
	f, _ := os.Open("dados-largos.csv")
	defer f.Close()

	scanner := bufio.NewScanner(f)
	buf := make([]byte, 0, 1024*1024)   // 1 MB
	scanner.Buffer(buf, 10*1024*1024)   // limite de 10 MB por linha

	for scanner.Scan() {
		_ = scanner.Text()
	}
	if err := scanner.Err(); err != nil {
		fmt.Println("ainda assim estourou:", err)
	}
}`,
      },
    ],
    points: [
      "bufio.Scanner é o jeito idiomático de ler arquivos linha a linha sem carregar tudo na memória.",
      "bufio.Writer transforma muitas escritas pequenas numa única syscall grande, ganhando velocidade.",
      "Idiomático: sempre chamar w.Flush() (ou defer w.Flush()) antes de fechar um bufio.Writer.",
      "scanner.Err() depois do loop revela erros que o for não mostra (token grande demais, I/O quebrado).",
      "Use bufio.ScanWords ou SplitFunc customizado para mudar como o conteúdo é dividido.",
      "Armadilha: linhas maiores que 64 KB fazem o Scanner parar silenciosamente; aumente o buffer.",
      "Erro comum: esquecer Flush e perceber arquivo incompleto só em produção.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para entrada interativa de teclado em apps de linha de comando, bufio.NewReader(os.Stdin) com ReadString('\\n') é o padrão clássico. Lembre-se de remover o '\\n' final com strings.TrimSpace.",
      },
      {
        type: "warning",
        content: "bufio.Scanner pula erros silenciosamente quando o token excede o buffer. Sempre cheque scanner.Err() depois do loop para não perder problemas reais.",
      },
      {
        type: "success",
        content: "Em benchmarks, trocar uma escrita direta em arquivo por bufio.Writer costuma render entre 5x e 50x de melhoria, dependendo do tamanho dos pedaços.",
      },
    ],
  },
  {
    slug: "io-reader-writer",
    section: "io-concorrencia",
    title: "io.Reader e io.Writer: as interfaces que costuram tudo",
    difficulty: "intermediario",
    subtitle: "Entenda por que duas interfaces de uma função cada conseguem unir arquivos, rede, memória e compressão",
    intro: `Se existe uma ideia genial em Go, é a forma como o pacote io define duas interfaces minúsculas que viram a cola do ecossistema inteiro: io.Reader e io.Writer. Cada uma exige um único método. Read(p []byte) (n int, err error) e Write(p []byte) (n int, err error). Pronto. Mas é justamente essa simplicidade brutal que permite plugar arquivos, conexões TCP, buffers em memória, compressores gzip, criptografia, hashes — todos no mesmo pipeline, sem adaptador.

Compare com Java, onde existe InputStream, OutputStream, Reader, Writer, BufferedReader, FileReader, e cada um tem hierarquia diferente. Ou com Python, onde file objects, BytesIO, sockets e streams gzip funcionam parecido mas não compartilham uma interface única bem definida. Em Go, você escreve uma função que recebe io.Reader e ela aceita literalmente qualquer fonte de bytes. Isso é o famoso 'a interface mais útil do Go é a menor'.

Na prática isso significa que você pode fazer, em uma linha, copiar de um arquivo gzipado em disco para uma conexão HTTP de saída, calculando o hash SHA-256 no caminho — tudo plugando Readers e Writers como se fossem peças de Lego. A função io.Copy(dst, src) move bytes do reader para o writer até o fim, sem você precisar gerenciar buffer manualmente.

Há também io.MultiWriter (escreve no mesmo dado em vários writers ao mesmo tempo, ótimo para logar em arquivo e tela), io.TeeReader (lê de uma fonte e copia para um writer no caminho, ideal para inspecionar streams), io.LimitReader (corta a leitura num número de bytes, para evitar uploads infinitos). Conhecer essas peças muda o jeito que você escreve código de I/O em Go: mais composição, menos código.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"io"
	"os"
)

func main() {
	// io.Copy aceita qualquer Reader e qualquer Writer.
	// Aqui copiamos um arquivo para outro, sem alocar buffer manualmente.
	origem, err := os.Open("backup.tar")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer origem.Close()

	destino, err := os.Create("backup-copia.tar")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer destino.Close()

	n, err := io.Copy(destino, origem)
	if err != nil {
		fmt.Println("erro copiando:", err)
		return
	}
	fmt.Printf("copiei %d bytes\\n", n)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

func main() {
	// Calcular SHA-256 de um arquivo enorme sem carregar tudo na RAM.
	f, err := os.Open("imagem-iso.iso")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer f.Close()

	h := sha256.New()        // sha256.New() devolve algo que implementa io.Writer
	if _, err := io.Copy(h, f); err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("sha256:", hex.EncodeToString(h.Sum(nil)))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"io"
	"os"
)

func main() {
	// MultiWriter escreve a mesma coisa em vários destinos.
	// Útil para mostrar log na tela e gravar em arquivo ao mesmo tempo.
	logFile, _ := os.Create("execucao.log")
	defer logFile.Close()

	saida := io.MultiWriter(os.Stdout, logFile)
	fmt.Fprintln(saida, "iniciando processo de exportação")
	fmt.Fprintln(saida, "lendo registros do banco...")
	// As duas linhas aparecem no terminal E no arquivo.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"io"
	"strings"
)

// Função genérica: aceita qualquer fonte de bytes.
func contarBytes(r io.Reader) (int64, error) {
	return io.Copy(io.Discard, r)
}

func main() {
	// Funciona com string em memória...
	n1, _ := contarBytes(strings.NewReader("olá mundo"))
	fmt.Println("string:", n1) // → 10

	// ...e funciona com qualquer outro Reader também.
	// Poderíamos passar um *os.File, conexão de rede, etc.
	n2, _ := contarBytes(strings.NewReader("conta os bytes desta frase"))
	fmt.Println("outra:", n2)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"bytes"
	"fmt"
	"io"
)

func main() {
	// LimitReader impede leitura além de N bytes.
	// Use para cortar uploads abusivos e evitar OOM.
	fonte := bytes.NewReader([]byte("este texto tem mais que dez bytes"))
	limitado := io.LimitReader(fonte, 10)

	dados, _ := io.ReadAll(limitado)
	fmt.Printf("li %q (%d bytes)\\n", dados, len(dados))
	// → saída: li "este texto" (10 bytes)
}`,
      },
    ],
    points: [
      "io.Reader tem 1 método; io.Writer tem 1 método. Toda a biblioteca padrão é construída sobre eles.",
      "Funções devem aceitar io.Reader/io.Writer em vez de *os.File para virarem reutilizáveis.",
      "io.Copy(dst, src) move bytes sem você se preocupar com tamanho de buffer.",
      "io.MultiWriter, io.TeeReader e io.LimitReader são peças que compõem comportamentos complexos.",
      "Idiomático: aceitar interfaces, devolver structs concretos (princípio Postel para Go).",
      "Armadilha: ignorar o n int devolvido por Read; ele pode ser menor que len(p) mesmo sem erro.",
      "Erro comum: comparar err com io.EOF usando ==; prefira errors.Is(err, io.EOF).",
    ],
    alerts: [
      {
        type: "info",
        content: "Quando uma função recebe io.Reader, você pode passar *os.File, *bytes.Buffer, *strings.Reader, http.Response.Body, gzip.Reader e centenas de outros. Esse é o superpoder do Go.",
      },
      {
        type: "tip",
        content: "Use io.Discard como destino quando só interessa contar bytes ou exaurir um Reader (por exemplo, para liberar uma conexão HTTP). Ele é otimizado para isso.",
      },
      {
        type: "warning",
        content: "Read pode devolver dados E io.EOF na mesma chamada. Sempre processe os n bytes antes de checar o erro, senão você descarta o último pedaço.",
      },
    ],
  },
  {
    slug: "embed-arquivos",
    section: "io-concorrencia",
    title: "//go:embed: empacotando arquivos no binário",
    difficulty: "intermediario",
    subtitle: "Embuta HTML, templates, migrations e configs no executável Go para deploy de arquivo único",
    intro: `Uma das características mais elogiadas do Go é o deploy: você compila e tem um único binário sem dependências. Mas e os arquivos estáticos do seu projeto — templates HTML, CSS, imagens, migrations SQL, certificados? Tradicionalmente você precisava distribuir uma pasta junto, ou complicar com bibliotecas de bundling. Desde a versão 1.16, Go resolveu isso de forma elegante com a diretiva //go:embed.

A ideia é simples: você adiciona um comentário mágico antes de uma variável e o compilador cola o conteúdo do arquivo (ou pasta inteira) dentro do binário em tempo de build. Em runtime, você acessa esse conteúdo como se fosse um arquivo normal — através de string, []byte ou um embed.FS, que implementa fs.FS e funciona com qualquer função que aceite um filesystem virtual.

Isso muda o jogo para vários cenários reais. Servidor HTTP que serve frontend? Embuta a pasta dist/ inteira e sirva direto. CLI que precisa de templates? Embuta. Migrations de banco? Embuta. Mensagens de help, certificados de dev, dados de seed? Embuta. O resultado é um único arquivo .exe ou ELF que você copia para o servidor, dá chmod +x e roda — sem se preocupar se aquele template HTML foi para o lugar certo.

Comparado a outras linguagens: Python tem que distribuir o .py junto ou usar PyInstaller; Java empacota em .jar mas precisa da JVM no destino; Node distribui node_modules; Rust tem include_str! e include_bytes! parecidos com //go:embed mas mais limitados. A combinação 'binário estático + assets embutidos' é uma das razões pelas quais Go domina o nicho de ferramentas CLI e serviços containerizados.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	_ "embed"
	"fmt"
)

// O comentário //go:embed precisa estar IMEDIATAMENTE acima da variável.
// Note que importamos _ "embed" só para ativar a diretiva.
//
//go:embed VERSION.txt
var versao string

func main() {
	fmt.Printf("Rodando versão %s\\n", versao)
	// Conteúdo do arquivo VERSION.txt vira o valor da string em build time.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	_ "embed"
	"fmt"
)

//go:embed logo.png
var logo []byte

func main() {
	// Para arquivos binários, use []byte em vez de string.
	fmt.Printf("logo tem %d bytes embutidos no binário\\n", len(logo))
	// Você pode escrever em disco, servir via HTTP, qualquer coisa.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"embed"
	"io/fs"
	"net/http"
)

// Embute uma pasta inteira como filesystem virtual.
//
//go:embed assets/*
var assets embed.FS

func main() {
	// Removemos o prefixo "assets" para servir como raiz.
	sub, err := fs.Sub(assets, "assets")
	if err != nil {
		panic(err)
	}
	http.Handle("/", http.FileServer(http.FS(sub)))
	// Acesse http://localhost:8080/style.css e o conteúdo
	// vem direto do binário, sem ler do disco.
	http.ListenAndServe(":8080", nil)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"embed"
	"fmt"
	"html/template"
	"os"
)

// Embutindo múltiplos templates HTML.
//
//go:embed templates/*.html
var tmplFS embed.FS

func main() {
	tmpl, err := template.ParseFS(tmplFS, "templates/*.html")
	if err != nil {
		fmt.Println(err)
		return
	}
	dados := struct{ Nome string }{Nome: "Marina"}
	// Renderiza usando o template "saudacao.html" embutido.
	if err := tmpl.ExecuteTemplate(os.Stdout, "saudacao.html", dados); err != nil {
		fmt.Println(err)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"embed"
	"fmt"
	"io/fs"
)

//go:embed migrations/*.sql
var migrations embed.FS

func main() {
	// Listar tudo que foi embutido para aplicar em ordem.
	entries, _ := fs.ReadDir(migrations, "migrations")
	for _, e := range entries {
		fmt.Println("migration disponível:", e.Name())
		dados, _ := fs.ReadFile(migrations, "migrations/"+e.Name())
		fmt.Printf("  %d bytes de SQL\\n", len(dados))
	}
}`,
      },
      {
        lang: "bash",
        code: `# Estrutura de pastas esperada:
# main.go
# VERSION.txt
# assets/
#   style.css
#   logo.png
# templates/
#   saudacao.html
# migrations/
#   001_init.sql
#   002_users.sql

# Compile como sempre:
go build -o app .

# Agora app é um binário único com tudo dentro:
ls -lh app
./app
# Funciona em qualquer servidor sem precisar copiar nenhum arquivo extra.`,
      },
    ],
    points: [
      "//go:embed precisa estar imediatamente acima da declaração da variável, sem linha em branco.",
      "Use string para texto, []byte para binário, embed.FS para pastas inteiras ou múltiplos arquivos.",
      "embed.FS implementa fs.FS, então funciona com http.FileServer, template.ParseFS e similares.",
      "Idiomático: importar _ \"embed\" mesmo que você só use a diretiva, para deixar o intent claro.",
      "Caminhos no //go:embed são relativos ao arquivo .go, não ao diretório de execução.",
      "Armadilha: padrões não pegam arquivos que começam com . ou _ por padrão; use all: para incluir.",
      "Erro comum: //go:embed funciona só em arquivos do mesmo módulo, não em vendored ou externos.",
    ],
    alerts: [
      {
        type: "success",
        content: "Combinar //go:embed com cross-compilation (GOOS/GOARCH) te dá binários auto-contidos para qualquer plataforma. Distribuir uma CLI vira um único arquivo de download.",
      },
      {
        type: "warning",
        content: "Tudo que você embute aumenta o tamanho do binário e fica na memória durante a execução. Não embuta gigabytes de vídeo — para isso, mantenha em storage externo.",
      },
      {
        type: "tip",
        content: "Para incluir arquivos que começam com ponto (como .env.example) ou underscore, use o prefixo all: na diretiva, exemplo //go:embed all:templates.",
      },
    ],
  },
  {
    slug: "goroutines-intro",
    section: "io-concorrencia",
    title: "Goroutines: a base da concorrência em Go",
    difficulty: "iniciante",
    subtitle: "Como uma palavrinha (go) transforma qualquer função numa tarefa concorrente leve e barata",
    intro: `Concorrência em Go começa com uma palavra: go. Você prefixa qualquer chamada de função com go e ela passa a rodar em paralelo lógico ao restante do programa, sem bloquear quem chamou. Esse 'fluxo paralelo' se chama goroutine, e não é uma thread do sistema operacional — é uma estrutura muito mais leve gerida pelo runtime do Go, que multiplica milhares de goroutines em poucas threads reais.

Para colocar em escala: uma thread do SO consome tipicamente 1 a 8 MB de pilha; uma goroutine começa com 2 KB e cresce sob demanda. Em Go é comum rodar 100 mil ou até 1 milhão de goroutines numa máquina modesta, algo impensável com threads em Java ou C. Esse modelo barato muda a forma de pensar: em vez de 'tenho que reusar 8 threads de pool', você pensa 'cada conexão pode ter sua própria goroutine, sem medo'.

Mas atenção: chamar go func() não significa magicamente paralelo verdadeiro. Significa concorrente — pode rodar simultaneamente em múltiplos núcleos se houver, mas a função main não espera por ele. Se main termina, todas as goroutines morrem juntas, sem aviso. Esse é o erro número um do iniciante: dispara goroutine, programa encerra antes dela rodar, e você fica sem entender por que nada apareceu na tela.

Para coordenar (esperar terminar, comunicar resultado, cancelar), Go oferece dois mecanismos que vamos ver nos próximos capítulos: channels (a forma idiomática) e o pacote sync (mutexes, WaitGroup). A filosofia oficial, citada com frequência em apresentações da equipe Go, é 'não comunique compartilhando memória; compartilhe memória comunicando' — ou seja, prefira channels quando puder.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

func saudar(nome string) {
	for i := 1; i <= 3; i++ {
		fmt.Printf("oi %s (%d)\\n", nome, i)
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	// Sem "go", roda sequencial: termina Ana, depois Bruno.
	// Com "go", as duas goroutines rodam intercaladas.
	go saudar("Ana")
	go saudar("Bruno")

	// Sleep no main para dar tempo das goroutines completarem.
	// (Forma rudimentar — em código real usamos WaitGroup ou channels.)
	time.Sleep(500 * time.Millisecond)
	fmt.Println("fim do main")
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Goroutine sem nada para esperar: morre junto com main.
	go fmt.Println("essa goroutine raramente aparece")

	fmt.Println("main terminou")
	// → saída: main terminou
	// (a goroutine não teve tempo de imprimir)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

func main() {
	// Armadilha clássica: capturar variável de loop.
	// Em Go 1.22+, cada iteração tem sua cópia de i, então funciona certo.
	for i := 1; i <= 3; i++ {
		go func() {
			fmt.Println("i é", i)
		}()
	}
	time.Sleep(100 * time.Millisecond)
	// Em Go < 1.22, todas imprimiriam o mesmo i (provavelmente 4).
	// Em Go 1.22+, cada goroutine vê seu próprio i: 1, 2, 3 (em ordem qualquer).
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"runtime"
)

func main() {
	// Quantas goroutines rodam paralelas de fato depende dos núcleos da CPU.
	fmt.Println("núcleos disponíveis:", runtime.NumCPU())
	fmt.Println("GOMAXPROCS atual:", runtime.GOMAXPROCS(0))
	// Por padrão, Go usa todos os núcleos.
	// Em testes vale forçar 1 com runtime.GOMAXPROCS(1) para
	// achar bugs de concorrência mais rápido.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// processoComLog simula trabalho real (uma chamada HTTP, por exemplo).
func processoComLog(id int) {
	fmt.Printf("[%d] iniciando\\n", id)
	time.Sleep(time.Duration(id*100) * time.Millisecond)
	fmt.Printf("[%d] terminou\\n", id)
}

func main() {
	for id := 1; id <= 5; id++ {
		go processoComLog(id)
	}
	// Esperando todas terminarem (forma simples).
	time.Sleep(700 * time.Millisecond)
	fmt.Println("todos os processos despachados")
}`,
      },
    ],
    points: [
      "Goroutines são leves: 2 KB iniciais e podem ser milhões num único processo.",
      "Prefixar qualquer chamada com 'go' transforma em goroutine; não há sintaxe nova além disso.",
      "Quando main termina, todas as goroutines morrem instantaneamente, sem aviso.",
      "Idiomático: nunca dispare goroutine sem ter um plano de como esperar/cancelar (channel, WaitGroup, context).",
      "runtime.GOMAXPROCS controla quantos núcleos o runtime usa em paralelo.",
      "Armadilha: usar time.Sleep para 'esperar goroutines' em produção; é frágil e lento.",
      "Erro comum: vazar goroutine deixando ela bloqueada para sempre num channel sem leitor.",
    ],
    alerts: [
      {
        type: "info",
        content: "O scheduler de goroutines é cooperativo, mas o runtime intercepta operações de I/O e chamadas longas para revezar a CPU. Você raramente precisa pensar nisso.",
      },
      {
        type: "warning",
        content: "Goroutine não é 'paralelismo grátis'. Acessar a mesma variável de várias goroutines sem sincronização é race condition garantida — e race conditions causam bugs que só aparecem em produção.",
      },
      {
        type: "tip",
        content: "Sempre que escrever 'go func()', pergunte: como vou saber que ela acabou? Como vou cancelar se demorar? Se não souber responder, está vazando goroutine.",
      },
    ],
  },
  {
    slug: "channels-intro",
    section: "io-concorrencia",
    title: "Channels: comunicação entre goroutines",
    difficulty: "intermediario",
    subtitle: "Tubos tipados que carregam valores entre goroutines com sincronização embutida",
    intro: `Se goroutines são as tarefas, channels são a forma como elas conversam. Pense num channel como uma esteira de fábrica entre dois operários: um coloca peças de um lado (send), o outro pega do outro (receive). A esteira é tipada — você cria um chan int e por ela só passa int. E o mais importante: ela serializa o acesso, então duas goroutines nunca pegam a mesma peça por engano.

Channels foram inspirados no modelo CSP (Communicating Sequential Processes) de Tony Hoare, e são a coisa mais distintiva da concorrência em Go. Em Java, você usaria BlockingQueue mais sincronização manual. Em Python, asyncio.Queue ou multiprocessing.Queue, com bem mais cerimônia. Em Go, é literalmente: c := make(chan int); c <- 42; v := <-c. Três operadores e você tem comunicação concorrente segura.

A semântica básica é bloqueante: quando uma goroutine faz c <- valor num channel sem buffer, ela fica parada esperando alguém ler. Quando alguém faz v := <-c, fica parada esperando alguém enviar. Esse encontro forçado (chamado rendezvous) é o que sincroniza naturalmente as duas pontas — você não precisa de mutex para coordenar quem chega primeiro.

Channels também têm um superpoder: podem ser fechados com close(c) para sinalizar 'não vai mais vir nada'. Receivers detectam isso com a forma v, ok := <-c (ok vira false quando o canal fecha e está vazio), ou usam for v := range c para iterar até fechar. Esse padrão é como você coordena 'eu acabei de produzir, pode parar de esperar'. Vamos ver na prática.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// make(chan T) cria um channel sem buffer (capacidade 0).
	c := make(chan string)

	go func() {
		// Esta goroutine envia uma mensagem.
		c <- "olá do outro lado"
	}()

	// Receive bloqueia até que alguém envie.
	mensagem := <-c
	fmt.Println(mensagem)
	// → saída: olá do outro lado
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Trabalhador faz uma conta lenta e devolve pelo channel.
func calcular(n int, resultado chan<- int) {
	time.Sleep(200 * time.Millisecond)
	resultado <- n * n
}

func main() {
	res := make(chan int)

	// Disparamos 3 cálculos em paralelo.
	go calcular(3, res)
	go calcular(7, res)
	go calcular(10, res)

	// Lemos os 3 resultados (ordem depende de quem chegar primeiro).
	for i := 0; i < 3; i++ {
		fmt.Println("resultado:", <-res)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Produtor envia números e fecha o channel quando termina.
func produtor(c chan<- int) {
	for i := 1; i <= 5; i++ {
		c <- i
	}
	close(c) // sinaliza "acabou"
}

func main() {
	c := make(chan int)
	go produtor(c)

	// for-range em channel itera até o canal ser fechado.
	for v := range c {
		fmt.Println("recebi:", v)
	}
	fmt.Println("canal fechado, saí do loop")
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	c := make(chan int, 2) // buffer de 2
	c <- 10
	c <- 20
	close(c)

	// A forma "v, ok" diz se o canal ainda está aberto.
	for {
		v, ok := <-c
		if !ok {
			fmt.Println("canal vazio e fechado, parando")
			break
		}
		fmt.Println("li", v)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Padrão "sinal de feito": channel struct{} usado só para avisar.
func tarefaLonga(feito chan<- struct{}) {
	time.Sleep(300 * time.Millisecond)
	fmt.Println("tarefa concluída")
	feito <- struct{}{} // struct{} não ocupa memória extra
}

func main() {
	feito := make(chan struct{})
	go tarefaLonga(feito)

	<-feito // bloqueia até receber o sinal
	fmt.Println("main pode seguir agora")
}`,
      },
    ],
    points: [
      "make(chan T) cria channel sem buffer; envio e recebimento sincronizam (rendezvous).",
      "Send (c <- v) e receive (v := <-c) bloqueiam até existir a contraparte do outro lado.",
      "close(c) é responsabilidade do produtor; receiver nunca deve fechar.",
      "Idiomático: usar for v := range c para consumir até o canal fechar.",
      "chan struct{} é o canal de sinal sem dado — útil para avisar 'feito' sem alocar memória.",
      "Armadilha: enviar para canal já fechado causa panic; só feche quando tiver certeza de que terminou de produzir.",
      "Erro comum: deadlock por main ler de canal e ninguém escrever (ou vice-versa).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre desenhe quem produz e quem consome antes de codar. Saber o sentido do tráfego em cada channel evita 90 por cento dos deadlocks.",
      },
      {
        type: "danger",
        content: "Nunca feche um channel a partir do receiver, nem feche duas vezes — ambos causam panic em runtime. Quem cria e produz é dono do close.",
      },
      {
        type: "info",
        content: "O slogan 'don't communicate by sharing memory; share memory by communicating' resume a filosofia: prefira channels quando puder, e mutex apenas quando channels ficariam complicados.",
      },
    ],
  },
  {
    slug: "channels-direcao-buffer",
    section: "io-concorrencia",
    title: "Direção e buffer em channels",
    difficulty: "intermediario",
    subtitle: "Tipagem por direção (chan<- e <-chan) e channels com buffer para desacoplar produtor e consumidor",
    intro: `Quando você escreve uma função que recebe um channel como parâmetro, Go te deixa restringir a direção: chan<- T significa 'só posso enviar', e <-chan T significa 'só posso receber'. Isso parece detalhe estético, mas é um tipo de contrato que o compilador faz cumprir. Se uma função declara que é produtora (chan<- int) e por engano você tenta ler dela, o build falha — em vez de descobrir o bug em produção numa terça à meia-noite.

Esse tipo de tipagem documenta o papel de cada lado e protege a arquitetura. Em revisões de código, basta olhar a assinatura para saber se aquela função é produtora, consumidora ou ambas. Em equipes grandes, faz diferença.

A outra dimensão é o buffer. make(chan T) cria um channel com capacidade zero (rendezvous obrigatório). make(chan T, n) cria um channel com buffer de n posições: o produtor pode enviar n vezes sem bloquear, mesmo que ninguém esteja lendo. É o equivalente a uma fila com tamanho fixo. Quando enche, o produtor bloqueia. Quando esvazia, o consumidor bloqueia.

Quando usar buffer? A regra prática é: se produtor e consumidor têm velocidade parecida e raramente esperam um pelo outro, buffer pequeno (ex: 10) reduz contenção. Se você tem rajadas (1000 eventos chegam de uma vez, mas processa devagar), buffer maior absorve a rajada. Mas atenção: buffer não resolve produtor mais rápido que consumidor — só adia o bloqueio. Se eventualmente o consumo não acompanha, você só vai usar mais memória antes de travar.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Esta função SÓ pode enviar no canal — receba virou erro de compilação.
func produzir(saida chan<- int) {
	for i := 1; i <= 3; i++ {
		saida <- i * 10
	}
	close(saida)
}

// Esta função SÓ pode ler — tentar enviar é erro de compilação.
func consumir(entrada <-chan int) {
	for v := range entrada {
		fmt.Println("processei:", v)
	}
}

func main() {
	c := make(chan int) // bidirecional aqui
	go produzir(c)      // converte automático para chan<- int
	consumir(c)         // converte automático para <-chan int
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	// Buffer de 3: podemos enviar até 3 sem bloquear.
	c := make(chan string, 3)

	c <- "primeiro"
	c <- "segundo"
	c <- "terceiro"
	// Se enviarmos um 4º agora sem ninguém ler, deadlock.
	close(c)

	for v := range c {
		fmt.Println(v)
	}
	// → saída:
	// primeiro
	// segundo
	// terceiro
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Simulando uma fila de pedidos com produtor rápido e consumidor lento.
func main() {
	pedidos := make(chan int, 5) // buffer absorve rajadas

	// Produtor manda 10 pedidos rapidamente.
	go func() {
		for i := 1; i <= 10; i++ {
			pedidos <- i
			fmt.Println("colocou pedido", i)
		}
		close(pedidos)
	}()

	// Consumidor processa cada um devagar.
	for p := range pedidos {
		time.Sleep(100 * time.Millisecond)
		fmt.Println("  -> processou", p)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// len e cap em channel mostram quanto está cheio e a capacidade total.
func main() {
	c := make(chan int, 5)
	c <- 1
	c <- 2
	c <- 3
	fmt.Printf("len=%d cap=%d\\n", len(c), cap(c))
	// → saída: len=3 cap=5
	// 3 itens dentro, capacidade total 5.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Padrão "fan-out": vários consumidores lendo do mesmo channel.
func worker(id int, jobs <-chan int) {
	for j := range jobs {
		fmt.Printf("worker %d pegou job %d\\n", id, j)
		time.Sleep(50 * time.Millisecond)
	}
}

func main() {
	jobs := make(chan int, 10)

	// Iniciamos 3 workers concorrentes.
	for w := 1; w <= 3; w++ {
		go worker(w, jobs)
	}

	// Enfileiramos 8 jobs.
	for j := 1; j <= 8; j++ {
		jobs <- j
	}
	close(jobs)

	// Pequena espera para todos terminarem (em código real, use WaitGroup).
	time.Sleep(500 * time.Millisecond)
}`,
      },
    ],
    points: [
      "chan<- T = só envia; <-chan T = só recebe; chan T = bidirecional.",
      "Tipos direcionais protegem arquitetura: erros viram falha de compilação.",
      "make(chan T, n) cria buffer de n; envios não bloqueiam até encher.",
      "len(c) e cap(c) funcionam em channels — útil para monitorar fila.",
      "Idiomático: parâmetros de função usam direção restrita; main mantém bidirecional.",
      "Buffer ajuda contra rajadas, mas não resolve consumidor crônico mais lento que produtor.",
      "Armadilha: usar buffer enorme para 'esconder' problema de performance; só adia o travamento.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Comece sempre com canal sem buffer. Se o profile/benchmark mostrar contenção significativa, aí adicione buffer pequeno e meça de novo. Otimização cega geralmente piora.",
      },
      {
        type: "warning",
        content: "Channel com buffer dá ilusão de 'fire and forget' — você envia, pensa que tudo certo, mas o trabalho ainda nem foi processado. Para confirmar processamento, use channel de retorno.",
      },
      {
        type: "info",
        content: "Channels nil bloqueiam para sempre tanto em send quanto em receive. Esse comportamento é intencional e útil em select para 'desligar' um caso temporariamente.",
      },
    ],
  },
  {
    slug: "select",
    section: "io-concorrencia",
    title: "select: multiplexando channels",
    difficulty: "intermediario",
    subtitle: "Espere por múltiplas operações de channel ao mesmo tempo, com timeout, default e cancelamento",
    intro: `Receber de um channel só atende uma fonte. Mas e quando você precisa esperar por várias coisas ao mesmo tempo: 'me dá o que vier primeiro entre o resultado da API, o timeout de 5 segundos, ou o sinal de cancelamento do usuário'? Para isso existe o select, uma construção que, à primeira vista, parece um switch — mas é completamente diferente em natureza.

O select avalia todos os cases simultaneamente. Cada case é uma operação de channel (send ou receive). O runtime escolhe o que estiver pronto. Se nenhum estiver pronto, o select bloqueia até que algum fique. Se múltiplos estão prontos ao mesmo tempo, o Go escolhe um aleatoriamente — propositalmente, para evitar starvation injusto entre channels.

Esse é o canivete suíço da concorrência em Go. Com select você implementa timeout (combinando com time.After), cancelamento (com context.Done), graceful shutdown (esperando sinais do SO), heartbeats em loops, multiplexagem de inputs de várias fontes. Nenhuma dessas coisas exige bibliotecas externas — está tudo na linguagem.

O case default é o coringa: se for incluído, o select nunca bloqueia. Se nenhum outro case está pronto, executa o default imediatamente. Isso permite implementar 'tenta receber, mas se não tiver nada agora, segue em frente' (non-blocking receive). Sem default, select é bloqueante. Com default, vira polling. Saber quando usar cada forma é parte do que distingue código de Go ingênuo de código sólido.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

func main() {
	c1 := make(chan string)
	c2 := make(chan string)

	go func() { time.Sleep(100 * time.Millisecond); c1 <- "rápido" }()
	go func() { time.Sleep(300 * time.Millisecond); c2 <- "lento" }()

	// select pega o que chegar primeiro.
	for i := 0; i < 2; i++ {
		select {
		case msg := <-c1:
			fmt.Println("c1:", msg)
		case msg := <-c2:
			fmt.Println("c2:", msg)
		}
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Implementando timeout em uma operação que pode demorar.
func chamadaAPI() <-chan string {
	r := make(chan string)
	go func() {
		time.Sleep(3 * time.Second)
		r <- "resposta da API"
	}()
	return r
}

func main() {
	select {
	case res := <-chamadaAPI():
		fmt.Println("recebi:", res)
	case <-time.After(1 * time.Second):
		fmt.Println("timeout: API demorou demais")
	}
	// Como API leva 3s e timeout é 1s, vai imprimir "timeout".
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
	c := make(chan int, 1)

	// "Tenta enviar, se cheio, descarta."
	select {
	case c <- 42:
		fmt.Println("enviei 42")
	default:
		fmt.Println("canal cheio, descartei")
	}

	// "Tenta receber, se vazio, segue."
	select {
	case v := <-c:
		fmt.Println("li", v)
	default:
		fmt.Println("nada para ler agora")
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"time"
)

// Padrão de heartbeat: a cada N segundos, faz algo.
func main() {
	tick := time.Tick(500 * time.Millisecond)
	limite := time.After(2 * time.Second)

	for {
		select {
		case t := <-tick:
			fmt.Println("tick em", t.Format("15:04:05.000"))
		case <-limite:
			fmt.Println("acabou o tempo, saindo")
			return
		}
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// Graceful shutdown: encerra com calma ao receber Ctrl+C.
func main() {
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fmt.Println("trabalhando...")
		case s := <-sigs:
			fmt.Println("recebi sinal:", s, "- encerrando")
			return
		}
	}
}`,
      },
    ],
    points: [
      "select bloqueia até algum case estar pronto; se vários estão, escolhe aleatório.",
      "case default torna o select não-bloqueante (tenta uma vez, segue se nada pronto).",
      "time.After(d) devolve channel que recebe valor depois de d — perfeito para timeout.",
      "Idiomático: combinar select com context.Done() para cancelamento limpo de operações.",
      "signal.Notify + select é a receita padrão de graceful shutdown em servidores Go.",
      "Armadilha: time.Tick em loops curtos vaza memória; use time.NewTicker e Stop quando terminar.",
      "Erro comum: usar select sem default num lugar onde precisa polling, causando bloqueio inesperado.",
    ],
    alerts: [
      {
        type: "info",
        content: "Quando dois cases ficam prontos ao mesmo tempo, Go escolhe aleatoriamente. Isso é proposital — evita que um channel sempre 'ganhe' e deixe os outros sem atendimento.",
      },
      {
        type: "tip",
        content: "Em loops infinitos de select, sempre tenha um case de saída (context.Done() ou um sinal). Goroutine sem saída clara é vazamento de memória disfarçado.",
      },
      {
        type: "warning",
        content: "Atribuir nil a uma variável de channel desabilita aquele case do select para sempre. É um truque idiomático para 'desligar' fontes que já fecharam, mas é sutil — comente bem.",
      },
    ],
  },
  {
    slug: "sync-mutex",
    section: "io-concorrencia",
    title: "sync.Mutex e RWMutex",
    difficulty: "intermediario",
    subtitle: "Quando channels não cabem, use mutex para proteger leitura e escrita compartilhada",
    intro: `Channels são a primeira escolha em Go, mas nem tudo cabe bem em forma de mensagem. Quando você tem uma estrutura compartilhada (um cache em memória, um contador de métricas, um mapa de sessões) que várias goroutines precisam ler e escrever, o que você quer é um cadeado clássico: 'enquanto eu estou mexendo, ninguém entra'. Esse cadeado é o sync.Mutex.

Mutex tem uma API minimalista: dois métodos, Lock e Unlock. Você chama Lock antes de tocar nos dados protegidos e Unlock quando termina. Se outra goroutine tentar Lock enquanto você segura, ela bloqueia até você liberar. Simples, mas devastador quando esquecido — daí o hábito quase automático em Go de escrever defer mu.Unlock() na linha imediatamente seguinte ao Lock, garantindo liberação mesmo se acontecer panic.

Tem um irmão mais especializado: sync.RWMutex, ou 'mutex de leitura/escrita'. Ele permite múltiplos leitores simultâneos (RLock/RUnlock) ou um único escritor exclusivo (Lock/Unlock). Quando o seu padrão de acesso é tipo 'ler 1000 vezes para cada escrita' (pense em cache de configuração), RWMutex desbloqueia muita performance porque os leitores não se atrapalham. Quando leituras e escritas são parecidas, Mutex simples costuma ser igual ou melhor — RWMutex tem overhead próprio.

Comparado a outras linguagens: em Java você tem synchronized e ReentrantLock; em Python o threading.Lock; em C usa pthread_mutex_t. A diferença em Go é que o tipo zero de sync.Mutex já está pronto para uso (não precisa New), e a comunidade insiste que mutex seja sempre usado como campo não-exportado dentro do struct que ele protege, junto com os dados — não como variável global solta.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Conta bancária com proteção mutex.
type Conta struct {
	mu      sync.Mutex
	saldo   int
}

func (c *Conta) Depositar(v int) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.saldo += v
}

func (c *Conta) Saldo() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.saldo
}

func main() {
	c := &Conta{}
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Depositar(1)
		}()
	}
	wg.Wait()
	fmt.Println("saldo final:", c.Saldo()) // → saldo final: 1000
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Sem mutex, contagem dá errado por race condition.
func main() {
	contador := 0
	var wg sync.WaitGroup

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			contador++ // PERIGO: leitura+escrita não atômica
		}()
	}
	wg.Wait()
	fmt.Println("resultado:", contador)
	// → quase nunca dá 1000; vai dar algo tipo 873, 941... aleatório.
	// Rode com "go run -race" para o detector apontar o problema.
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Cache de configuração: muita leitura, pouca escrita.
// RWMutex deixa N leitores em paralelo.
type Config struct {
	mu     sync.RWMutex
	dados  map[string]string
}

func NewConfig() *Config {
	return &Config{dados: map[string]string{}}
}

func (c *Config) Get(chave string) string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.dados[chave]
}

func (c *Config) Set(chave, valor string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.dados[chave] = valor
}

func main() {
	cfg := NewConfig()
	cfg.Set("env", "prod")
	cfg.Set("debug", "false")
	fmt.Println(cfg.Get("env")) // → prod
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Carrinho de compras compartilhado entre threads de uma sessão web.
type Carrinho struct {
	mu    sync.Mutex
	items []string
}

func (c *Carrinho) Adicionar(item string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = append(c.items, item)
}

func (c *Carrinho) Listar() []string {
	c.mu.Lock()
	defer c.mu.Unlock()
	// Devolve uma CÓPIA para o chamador não mexer no slice interno
	// sem segurar o lock.
	out := make([]string, len(c.items))
	copy(out, c.items)
	return out
}

func main() {
	c := &Carrinho{}
	c.Adicionar("livro")
	c.Adicionar("café")
	fmt.Println(c.Listar()) // → [livro café]
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Padrão Once: garante execução única, mesmo com várias goroutines chamando.
var (
	conexao  string
	once     sync.Once
)

func conectar() {
	fmt.Println("estabelecendo conexão...")
	conexao = "postgres://..."
}

func GetConn() string {
	once.Do(conectar) // só roda na primeira chamada, threadsafe
	return conexao
}

func main() {
	for i := 0; i < 3; i++ {
		go func() { fmt.Println(GetConn()) }()
	}
	var wg sync.WaitGroup
	wg.Add(0)
	wg.Wait() // (placeholder; em código real coordene o fim)
}`,
      },
    ],
    points: [
      "sync.Mutex protege estado compartilhado: Lock antes, Unlock depois (com defer).",
      "Idiomático: deixar o mutex como campo do struct que ele protege, não global solto.",
      "RWMutex permite muitos leitores simultâneos ou um escritor exclusivo.",
      "sync.Once garante execução única de inicialização, mesmo com chamadas concorrentes.",
      "Mutex zero-value já está pronto; nunca copie um mutex (vai virar dois separados).",
      "Armadilha: chamar Lock dentro de um método já com Lock segurado causa deadlock (mutex não é reentrante).",
      "Erro comum: ler estado fora do lock 'só pra dar uma olhada'; isso é race condition.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Mutex em Go NÃO é reentrante. Se uma função com Lock chama outra função que também faz Lock no mesmo mutex, você tem deadlock garantido. Cuidado com encadeamento.",
      },
      {
        type: "tip",
        content: "Sempre que adicionar um sync.Mutex num struct, escreva defer mu.Unlock() na próxima linha do Lock. O hábito reflexo previne incontáveis bugs.",
      },
      {
        type: "warning",
        content: "Copiar um struct que contém sync.Mutex (passando por valor em vez de ponteiro) cria DOIS mutexes independentes. Use *Tipo em métodos e parâmetros.",
      },
    ],
  },
  {
    slug: "sync-waitgroup",
    section: "io-concorrencia",
    title: "sync.WaitGroup: esperando goroutines terminarem",
    difficulty: "intermediario",
    subtitle: "O contador thread-safe que substitui time.Sleep para sincronizar o fim de várias goroutines",
    intro: `Quando você dispara várias goroutines e precisa esperar todas acabarem, time.Sleep é uma gambiarra perigosa: chuta um tempo, torce para ser suficiente, e quase sempre erra. Em produção, isso vira bug intermitente. A ferramenta certa é sync.WaitGroup, que funciona como um contador thread-safe: você incrementa antes de cada goroutine, decrementa quando ela termina, e Wait() bloqueia até o contador zerar.

A API tem três métodos: Add(n) soma n ao contador; Done() subtrai 1 (equivale a Add(-1)); Wait() bloqueia até chegar a zero. A receita idiomática é sempre a mesma: chame Add antes do go, e dentro da goroutine coloque defer wg.Done() como primeiríssima linha. Esse pattern garante que mesmo se a goroutine der panic, o contador é decrementado e o Wait não fica preso para sempre.

WaitGroup substitui o uso de channel só para sinalização de 'terminei' — para múltiplas goroutines independentes, é mais limpo que coordenar com channel buffer. Mas ele NÃO substitui channel para coleta de resultados: WaitGroup só conta, não transporta valor. O padrão clássico é combinar: WaitGroup para esperar, channel para coletar dados.

Cuidados clássicos: Add deve ser chamado ANTES de disparar a goroutine, nunca dentro dela (se a goroutine demora a iniciar e Wait roda antes do Add interno, pulamos a contagem). E nunca reuse um WaitGroup enquanto Wait está em andamento — espere zerar antes de adicionar mais. Quebras dessas regras causam panics ou bloqueios eternos difíceis de diagnosticar.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
	"time"
)

func processar(id int, wg *sync.WaitGroup) {
	defer wg.Done() // sempre primeira linha, mesmo se panic
	time.Sleep(time.Duration(id*100) * time.Millisecond)
	fmt.Printf("tarefa %d feita\\n", id)
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)         // Add antes do go
		go processar(i, &wg)
	}

	wg.Wait() // bloqueia até as 5 chamarem Done
	fmt.Println("tudo pronto, saindo")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Combinando WaitGroup (espera) + channel (resultados).
func quadrado(n int, out chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	out <- n * n
}

func main() {
	var wg sync.WaitGroup
	out := make(chan int, 5) // buffer = total de tarefas

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go quadrado(i, out, &wg)
	}

	// Goroutine separada espera todos terminarem e fecha o channel.
	go func() {
		wg.Wait()
		close(out)
	}()

	// Main consome resultados até o channel fechar.
	for v := range out {
		fmt.Println("quadrado:", v)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Verificar saúde de várias URLs em paralelo.
func ping(url string, wg *sync.WaitGroup) {
	defer wg.Done()
	inicio := time.Now()
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("[ERRO] %s: %v\\n", url, err)
		return
	}
	defer resp.Body.Close()
	fmt.Printf("[%d] %s em %v\\n", resp.StatusCode, url, time.Since(inicio))
}

func main() {
	urls := []string{
		"https://example.com",
		"https://golang.org",
		"https://httpbin.org/status/200",
	}

	var wg sync.WaitGroup
	for _, u := range urls {
		wg.Add(1)
		go ping(u, &wg)
	}
	wg.Wait()
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Add em lote: equivalente a chamar Add(1) num loop.
func main() {
	var wg sync.WaitGroup
	tarefas := []string{"a", "b", "c", "d"}

	wg.Add(len(tarefas)) // adiciona tudo de uma vez
	for _, t := range tarefas {
		go func(nome string) {
			defer wg.Done()
			fmt.Println("processei", nome)
		}(t)
	}
	wg.Wait()
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Erro clássico: Add dentro da goroutine.
// Wait pode rodar antes do Add e devolver imediatamente.
func main() {
	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		go func(n int) {
			wg.Add(1) // ❌ ERRADO: pode rodar depois do Wait
			defer wg.Done()
			fmt.Println("rodei", n)
		}(i)
	}

	wg.Wait()
	fmt.Println("main vai sair, talvez sem ver as goroutines")
	// O correto: wg.Add(1) ANTES de "go func".
}`,
      },
    ],
    points: [
      "Add(n) incrementa o contador, Done() decrementa, Wait() bloqueia até zerar.",
      "Idiomático: defer wg.Done() é a primeira linha dentro da goroutine.",
      "Chame Add ANTES de disparar a goroutine, nunca dentro dela.",
      "Combine WaitGroup com channel para coletar resultados (WG espera, channel transporta).",
      "Para fechar channel após todas terminarem: goroutine que faz wg.Wait() + close(ch).",
      "Armadilha: passar WaitGroup por valor cria cópia; sempre passe ponteiro (*sync.WaitGroup).",
      "Erro comum: Done a mais zera o contador e Wait retorna cedo — bug sutil de race.",
    ],
    alerts: [
      {
        type: "warning",
        content: "WaitGroup com Add chamado depois de Wait causa panic 'sync: WaitGroup misuse'. A regra é simples: planeje quantas goroutines vai disparar antes de chamar Wait.",
      },
      {
        type: "tip",
        content: "Em Go 1.21+, sync.WaitGroup ganhou método Go que combina Add(1) e a goroutine numa chamada. Se usar versão recente, ela elimina a chance de esquecer o Add.",
      },
      {
        type: "info",
        content: "WaitGroup é sobre 'esperar' apenas. Para passar resultados, use channel. Para cancelar antes de acabar, use context. Ferramenta certa para cada propósito mantém o código claro.",
      },
    ],
  },
  {
    slug: "context-pkg",
    section: "io-concorrencia",
    title: "context.Context: cancelamento, deadline e valores",
    difficulty: "avancado",
    subtitle: "O parâmetro padrão de toda chamada que pode demorar — propaga timeout, cancelamento e dados de requisição",
    intro: `Quando você chama uma API externa, faz uma query no banco ou inicia uma operação longa, três perguntas surgem cedo ou tarde: como cancelo se o usuário desistir? Como aborto se demorar mais que X segundos? Como passo informações de rastreamento (request ID, usuário autenticado) sem poluir cada assinatura de função? A resposta padrão em Go para tudo isso é o pacote context.

Um context.Context é um valor imutável que carrega três coisas: um sinal de cancelamento (Done), uma deadline opcional, e um conjunto chave-valor (Value). Toda função que pode demorar deve, por convenção idiomática, receber ctx context.Context como primeiro parâmetro. Quando o ctx é cancelado, a função deve abortar o que está fazendo o quanto antes. Esse 'contrato cooperativo' permite cancelar cadeias inteiras de chamadas com uma única linha.

A construção é em árvore. Você começa com context.Background() (raiz) ou context.TODO() (placeholder durante desenvolvimento), e cria filhos com WithCancel, WithTimeout, WithDeadline ou WithValue. Cada filho herda o cancelamento dos pais e adiciona o seu. Se o avô cancela, todos os netos cancelam junto. Esse padrão modela perfeitamente uma requisição HTTP que dispara várias chamadas paralelas: cancelar a request raiz cancela tudo embaixo.

Comparando com outras linguagens: Java tem CompletableFuture com cancel; Python tem asyncio com cancel e timeout; mas em ambos é menos uniforme. Em Go, a convenção é tão forte que praticamente toda biblioteca padrão moderna (database/sql, net/http, os/exec, runtime/trace) aceita ctx no primeiro parâmetro. Aprender a usar bem context é o que separa código Go intermediário de código Go de produção.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"context"
	"fmt"
	"time"
)

// Operação longa que respeita cancelamento via ctx.
func operacao(ctx context.Context) error {
	select {
	case <-time.After(2 * time.Second):
		fmt.Println("operação concluída normalmente")
		return nil
	case <-ctx.Done():
		// ctx.Err() diz por quê: cancelado, deadline, etc.
		return ctx.Err()
	}
}

func main() {
	// Cria contexto com timeout de 1 segundo.
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel() // libera recursos do contexto

	if err := operacao(ctx); err != nil {
		fmt.Println("falhou:", err)
		// → falhou: context deadline exceeded
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"context"
	"fmt"
	"time"
)

// Cancelamento manual: usuário aperta Ctrl+C, por exemplo.
func main() {
	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		// Simula um sinal externo após 500ms.
		time.Sleep(500 * time.Millisecond)
		fmt.Println("usuário cancelou")
		cancel()
	}()

	select {
	case <-time.After(5 * time.Second):
		fmt.Println("nunca deveria chegar aqui")
	case <-ctx.Done():
		fmt.Println("operação cancelada:", ctx.Err())
		// → operação cancelada: context canceled
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"context"
	"fmt"
)

// Chave fortemente tipada para evitar colisão com outros pacotes.
type chaveCtx string

const chaveUsuario chaveCtx = "usuario"

func handler(ctx context.Context) {
	if u, ok := ctx.Value(chaveUsuario).(string); ok {
		fmt.Println("processando para:", u)
	} else {
		fmt.Println("sem usuário no contexto")
	}
}

func main() {
	ctx := context.WithValue(context.Background(), chaveUsuario, "marina@exemplo.com")
	handler(ctx)
	// → processando para: marina@exemplo.com
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3" // go get github.com/mattn/go-sqlite3
)

// Query com timeout — a melhor prática moderna.
func buscarUsuario(ctx context.Context, db *sql.DB, id int) (string, error) {
	var nome string
	// QueryRowContext aborta a query se ctx for cancelado.
	err := db.QueryRowContext(ctx, "SELECT nome FROM usuarios WHERE id = ?", id).Scan(&nome)
	return nome, err
}

func main() {
	db, _ := sql.Open("sqlite3", ":memory:")
	defer db.Close()
	db.Exec(\`CREATE TABLE usuarios(id INTEGER PRIMARY KEY, nome TEXT)\`)
	db.Exec(\`INSERT INTO usuarios(id,nome) VALUES (1,'Marina')\`)

	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	nome, err := buscarUsuario(ctx, db, 1)
	if err != nil {
		fmt.Println("erro:", err)
		return
	}
	fmt.Println("usuário:", nome) // → usuário: Marina
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

// Chamada HTTP com cancelamento.
func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	req, _ := http.NewRequestWithContext(ctx, "GET", "https://httpbin.org/delay/5", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("falhou:", err)
		return
	}
	defer resp.Body.Close()
	fmt.Println("status:", resp.StatusCode)
	// Como /delay/5 demora 5s e timeout é 2s, vai dar erro de timeout.
}`,
      },
    ],
    points: [
      "Toda função que pode demorar aceita ctx context.Context como PRIMEIRO parâmetro.",
      "context.WithTimeout, WithDeadline, WithCancel criam filhos canceláveis.",
      "Sempre defer cancel() após criar contexto cancelável — evita vazamento de recursos.",
      "ctx.Done() devolve channel; combine com select para cancelar operações longas.",
      "Idiomático: NUNCA armazene context.Context dentro de struct; passe sempre como argumento.",
      "context.Value é para dados de requisição (request ID, user), não para parâmetros normais.",
      "Armadilha: ignorar ctx.Err() em loops longos; sua função vira inquebrável.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Esquecer defer cancel() em context.WithTimeout/WithCancel vaza um goroutine de timer e impede liberação de recursos. O linter govet costuma alertar quando isso acontece.",
      },
      {
        type: "tip",
        content: "Use context.TODO() em vez de context.Background() quando você sabe que precisa de contexto mas ainda não sabe qual. É um marcador para você revisitar depois.",
      },
      {
        type: "warning",
        content: "context.Value não substitui parâmetros tipados. Use só para dados que atravessam camadas (trace ID, auth, locale), não para passar dependências comuns.",
      },
    ],
  },
  {
    slug: "race-detector",
    section: "io-concorrencia",
    title: "Race detector: caçando data races",
    difficulty: "avancado",
    subtitle: "A flag -race do Go encontra bugs de concorrência que demorariam meses para aparecer em produção",
    intro: `Data race é o pesadelo de qualquer código concorrente: duas goroutines acessam a mesma memória ao mesmo tempo, pelo menos uma escrevendo, sem sincronização. O resultado é não-determinístico — às vezes funciona, às vezes corrompe estado, às vezes dá panic. Pior: em testes locais o bug pode nunca aparecer, e estourar só em produção sob carga, num cliente importante, na sexta à noite.

A boa notícia é que Go vem de fábrica com uma ferramenta absurdamente poderosa para isso: o race detector. Você adiciona uma única flag no comando e o runtime instrumenta cada acesso a memória, registrando ordem e sincronização. Quando detecta dois acessos potencialmente conflitantes sem happens-before claro, te entrega um relatório detalhado: quais goroutines, em quais linhas, qual a pilha de chamadas. Esse nível de informação é raríssimo em outras linguagens.

A flag funciona em três comandos principais: go run -race main.go (durante desenvolvimento), go test -race ./... (no CI, fortemente recomendado em todo projeto Go sério) e go build -race (para gerar binário instrumentado, útil em ambiente de staging). O custo é real: o programa fica 5 a 10x mais lento e usa mais memória, então não rode em produção. Mas em CI, é praticamente obrigatório.

A regra prática: se sua suíte de testes não passa com -race, você tem bugs de concorrência. Não 'em potencial' — bugs reais que vão te morder. Nenhum outro debug substitui o que essa ferramenta faz, e equipes que adotam o hábito de rodar testes com -race encontram problemas anos antes do que descobririam pelo modo tradicional. É uma das melhores ferramentas que Go te dá de graça.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Código clássico com race condition.
func main() {
	contador := 0
	var wg sync.WaitGroup

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			contador++ // duas goroutines podem fazer isso ao mesmo tempo
		}()
	}
	wg.Wait()
	fmt.Println("contador:", contador)
	// Sem -race: imprime algum número (geralmente entre 70 e 100).
	// Com -race: aponta exatamente onde está a race.
}`,
      },
      {
        lang: "bash",
        code: `# Rode o programa acima com a flag -race:
go run -race main.go

# Saída típica:
# ==================
# WARNING: DATA RACE
# Read at 0x00c0000180b8 by goroutine 8:
#   main.main.func1()
#       main.go:12 +0x44
#
# Previous write at 0x00c0000180b8 by goroutine 7:
#   main.main.func1()
#       main.go:12 +0x5e
# ==================
# Found 1 data race(s)
# exit status 66`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
)

// Versão correta usando mutex.
func main() {
	contador := 0
	var mu sync.Mutex
	var wg sync.WaitGroup

	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()
			contador++
			mu.Unlock()
		}()
	}
	wg.Wait()
	fmt.Println("contador:", contador) // → 100, sempre
	// Rodar com -race agora não acusa nada.
}`,
      },
      {
        lang: "bash",
        code: `# No CI/CD, rode os testes sempre com -race.
# É comum colocar no Makefile ou no workflow do GitHub Actions:

go test -race -timeout 60s ./...

# Em projetos grandes, também é comum rodar com -count=10
# para repetir e pegar races que não aparecem em uma execução só.
go test -race -count=5 ./...`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync/atomic"
)

// Para casos simples (incremento, flag), atomic é mais leve que mutex.
func main() {
	var contador int64
	done := make(chan struct{})

	for i := 0; i < 100; i++ {
		go func() {
			atomic.AddInt64(&contador, 1) // operação atômica de hardware
			done <- struct{}{}
		}()
	}
	for i := 0; i < 100; i++ {
		<-done
	}
	fmt.Println("contador:", atomic.LoadInt64(&contador)) // → 100
	// Esta versão também passa limpa no -race.
}`,
      },
    ],
    points: [
      "go run -race, go test -race e go build -race ativam o detector de race.",
      "Race detector custa 5 a 10x mais lento e dobra memória — não rode em produção.",
      "Idiomático: rodar go test -race no CI de todo projeto Go que use concorrência.",
      "O relatório mostra ambas as goroutines, linhas e stacks — leia com calma.",
      "sync/atomic resolve casos simples (contador, flag bool) com menos overhead que Mutex.",
      "Armadilha: 'rodou uma vez sem race, está limpo' — races dependem de timing, repita testes.",
      "Erro comum: ignorar warning de race achando que 'não deu problema' — é bug latente garantido.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Data race em Go é comportamento indefinido. Pode parecer funcionar por meses e quebrar exatamente quando você atualizar o Go, mudar a CPU ou aumentar o tráfego. Trate como bug sério.",
      },
      {
        type: "success",
        content: "O race detector do Go é considerado um dos melhores do mercado. Linguagens como Rust eliminam races no compilador, mas para o resto do mundo, -race é o padrão ouro.",
      },
      {
        type: "tip",
        content: "Quando você adiciona -race no CI pela primeira vez num projeto antigo, espere encontrar dezenas de issues. Resolva uma por uma — cada fix é um bug que não vai mais aparecer no cliente.",
      },
    ],
  },
  {
    slug: "pool-workers",
    section: "io-concorrencia",
    title: "Worker pool: padrão para limitar concorrência",
    difficulty: "avancado",
    subtitle: "Combine channels, goroutines e WaitGroup para processar muitos jobs sem explodir recursos",
    intro: `Goroutines são baratas, mas recursos externos não. Se você tem 10 mil URLs para baixar e dispara 10 mil goroutines de uma vez, vai estourar o limite de file descriptors, sobrecarregar o servidor remoto, derrubar sua conexão. A solução clássica é o padrão worker pool: você cria um número fixo de goroutines (workers) que pegam tarefas de uma fila comum (channel de jobs) e devolvem resultados em outra fila (channel de results).

A beleza do padrão é que ele combina três conceitos que vimos: channels para distribuir trabalho, goroutines para processar em paralelo, e WaitGroup para esperar todo mundo terminar. Não precisa de framework, biblioteca externa ou container especializado — é tudo construído com peças da biblioteca padrão. E o número de workers vira um parâmetro de tuning: 5 para uma API que aguenta pouco, 100 para processamento puro de CPU em máquina parruda, ajustado por benchmark.

Esse padrão aparece com frequência em código real: processamento de fila de e-mails, ingestão de eventos, scraping web, geração de relatórios em lote, transcodificação de vídeo. Sempre que você tem um conjunto de tarefas independentes e quer paralelizar com limite, worker pool é a resposta. É também o ponto onde você junta tudo: select para cancelamento via context, mutex se houver estado compartilhado, race detector durante desenvolvimento.

Comparado a outras linguagens: Java tem ThreadPoolExecutor; Python tem ThreadPoolExecutor e ProcessPoolExecutor; Node tem worker_threads; mas todos com mais cerimônia. Em Go o pool inteiro cabe em 30 linhas legíveis, e é tão comum que vira receita reutilizável. Vamos construí-lo passo a passo.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
	"time"
)

// Worker simples que processa jobs e manda para results.
func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		fmt.Printf("worker %d pegou job %d\\n", id, j)
		time.Sleep(100 * time.Millisecond) // simulando trabalho real
		results <- j * 2
	}
}

func main() {
	const numWorkers = 3
	const numJobs = 8

	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	// Sobe os 3 workers.
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// Enfileira jobs.
	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs) // sinaliza fim dos jobs

	// Goroutine que fecha results quando todos workers terminam.
	go func() {
		wg.Wait()
		close(results)
	}()

	// Coleta resultados.
	for r := range results {
		fmt.Println("resultado:", r)
	}
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Pool para baixar URLs com limite de concorrência e timeout global.
type Job struct{ URL string }
type Result struct {
	URL    string
	Status int
	Erro   error
}

func downloader(ctx context.Context, jobs <-chan Job, out chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	client := &http.Client{Timeout: 5 * time.Second}
	for j := range jobs {
		select {
		case <-ctx.Done():
			return
		default:
		}
		resp, err := client.Get(j.URL)
		r := Result{URL: j.URL, Erro: err}
		if err == nil {
			r.Status = resp.StatusCode
			resp.Body.Close()
		}
		out <- r
	}
}

func main() {
	urls := []string{
		"https://example.com",
		"https://golang.org",
		"https://httpbin.org/status/200",
		"https://httpbin.org/status/404",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	jobs := make(chan Job, len(urls))
	out := make(chan Result, len(urls))
	var wg sync.WaitGroup

	const workers = 2
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go downloader(ctx, jobs, out, &wg)
	}

	for _, u := range urls {
		jobs <- Job{URL: u}
	}
	close(jobs)

	go func() { wg.Wait(); close(out) }()

	for r := range out {
		if r.Erro != nil {
			fmt.Printf("[ERR] %s: %v\\n", r.URL, r.Erro)
			continue
		}
		fmt.Printf("[%d] %s\\n", r.Status, r.URL)
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

// Pool genérico com Go 1.18+ generics.
func Pool[T any, R any](workers int, items []T, fn func(T) R) []R {
	jobs := make(chan T, len(items))
	results := make(chan R, len(items))
	var wg sync.WaitGroup

	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := range jobs {
				results <- fn(j)
			}
		}()
	}

	for _, it := range items {
		jobs <- it
	}
	close(jobs)

	go func() { wg.Wait(); close(results) }()

	out := make([]R, 0, len(items))
	for r := range results {
		out = append(out, r)
	}
	return out
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8}
	quadrados := Pool(3, nums, func(n int) int { return n * n })
	fmt.Println(quadrados) // ordem pode variar
}`,
      },
      {
        lang: "go",
        code: `package main

import (
	"fmt"
	"sync"
	"time"
)

// Pool com tratamento de panic em workers (não deixa o processo cair).
func workerSeguro(id int, jobs <-chan int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		func() {
			defer func() {
				if r := recover(); r != nil {
					fmt.Printf("worker %d recuperou de panic no job %d: %v\\n", id, j, r)
				}
			}()
			if j == 3 {
				panic("simulando erro inesperado")
			}
			fmt.Printf("worker %d processou %d\\n", id, j)
			time.Sleep(50 * time.Millisecond)
		}()
	}
}

func main() {
	jobs := make(chan int, 5)
	var wg sync.WaitGroup
	for w := 1; w <= 2; w++ {
		wg.Add(1)
		go workerSeguro(w, jobs, &wg)
	}
	for j := 1; j <= 5; j++ {
		jobs <- j
	}
	close(jobs)
	wg.Wait()
	fmt.Println("todos os workers encerraram")
}`,
      },
      {
        lang: "bash",
        code: `# Inicialize um módulo para testar os exemplos:
go mod init exemplo/pool

# Rode o exemplo principal:
go run main.go

# Para o pool de downloads, sempre rode com -race no desenvolvimento:
go run -race main.go

# Quando quiser ajustar o número de workers, perfile com pprof:
go test -bench=. -cpuprofile=cpu.out
go tool pprof cpu.out`,
      },
    ],
    points: [
      "Worker pool = N goroutines fixas + canal de jobs + canal de resultados + WaitGroup.",
      "Closing jobs avisa workers para terminar; closing results avisa main para parar de ler.",
      "Idiomático: goroutine separada que faz wg.Wait() e fecha results no fim.",
      "Combine context para cancelar todo o pool ao sinal externo (timeout, Ctrl+C).",
      "Use generics (Go 1.18+) para escrever pool reutilizável para qualquer tipo de job.",
      "Sempre proteja workers com recover() se um job pode dar panic — evita matar o pool todo.",
      "Armadilha: número de workers fixo demais; meça com benchmark e ajuste por carga real.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para tarefas IO-bound (HTTP, banco), comece com workers = 2 a 4 vezes o número de CPUs. Para CPU-bound, use exatamente runtime.NumCPU(). Depois ajuste medindo.",
      },
      {
        type: "warning",
        content: "Sem fechar o channel de jobs, o for range nos workers fica preso para sempre. Sempre planeje quem fecha cada channel — produtor fecha jobs, código de coordenação fecha results.",
      },
      {
        type: "info",
        content: "Bibliotecas como golang.org/x/sync/errgroup oferecem worker pool pronto com cancelamento e propagação de erro. Vale conhecer quando seu pool fica sofisticado demais.",
      },
    ],
  },
];
