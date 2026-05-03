import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "cobra-cli",
    section: "data-cli",
    title: "Cobra: construindo CLIs estilo kubectl",
    difficulty: "intermediario",
    subtitle: "Subcomandos, flags e ajuda automática com a biblioteca usada por Docker, Kubernetes e Hugo",
    intro: `Quase toda ferramenta moderna de linha de comando que você admira em Go (kubectl, helm, hugo, gh, docker) foi construída em cima da mesma biblioteca: spf13/cobra. O motivo é simples: escrever um CLI de verdade envolve muito mais que ler os.Args. Você precisa de subcomandos aninhados (git commit, git remote add), flags curtas e longas, valores padrão, validação, mensagens de ajuda automáticas, autocompletar para bash e zsh. Refazer tudo isso à mão é trabalho repetitivo que não agrega nada ao seu produto.

Em Python você teria argparse ou click; em Node, commander ou yargs. Em Go, o padrão de fato é o Cobra. Ele é opinativo de um jeito bom: cada comando é uma struct com um Run, um Use (a forma de invocar) e um Short/Long (a descrição). Subcomandos viram filhos via AddCommand. Essa árvore espelha exatamente o que o usuário digita no terminal, então fica fácil raciocinar sobre a estrutura do seu CLI olhando só o código.

Idiomático em Go: cada arquivo de comando vive em cmd/, expõe uma função NewXxxCmd() que devolve o cobra.Command, e o main fica minúsculo, só chamando rootCmd.Execute(). Esse padrão é importante porque te força a desacoplar a lógica de negócio (que vai em internal/) da camada de apresentação (o CLI), o que torna seu código testável sem precisar simular o terminal.

Neste capítulo você vai construir um CLI de exemplo chamado pedidos que tem subcomandos para listar, criar e cancelar pedidos. Esse mesmo esqueleto serve para qualquer ferramenta interna que você precise: um migrador de banco, um deployador, um gerador de relatórios. Aprender Cobra direito é destravar um padrão que vai te acompanhar pelos próximos anos.`,
    codes: [
      {
        lang: "bash",
        code: `# Inicialize o módulo e instale o Cobra.
mkdir pedidos && cd pedidos
go mod init exemplo/pedidos
go get github.com/spf13/cobra@latest`,
      },
      {
        lang: "go",
        code: `// cmd/root.go — o comando raiz do CLI.
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

// rootCmd é o "pedidos" puro, sem subcomando.
var rootCmd = &cobra.Command{
	Use:   "pedidos",
	Short: "Gerencia pedidos da loja pela linha de comando",
	Long:  "Ferramenta para listar, criar e cancelar pedidos da loja XPTO.",
}

// Execute é chamado pelo main.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}`,
      },
      {
        lang: "go",
        code: `// cmd/listar.go — subcomando "pedidos listar".
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var statusFiltro string // valor da flag --status

var listarCmd = &cobra.Command{
	Use:   "listar",
	Short: "Lista pedidos, opcionalmente filtrando por status",
	Run: func(cmd *cobra.Command, args []string) {
		// Aqui você chamaria seu repositório de verdade.
		pedidos := []string{"#101 pago", "#102 pendente", "#103 pago"}
		for _, p := range pedidos {
			if statusFiltro == "" || contemStatus(p, statusFiltro) {
				fmt.Println(p)
			}
		}
	},
}

func contemStatus(linha, status string) bool {
	return len(linha) >= len(status) && linha[len(linha)-len(status):] == status
}

func init() {
	// Flag longa --status e curta -s, com valor padrão vazio.
	listarCmd.Flags().StringVarP(&statusFiltro, "status", "s", "", "filtra por status (pago/pendente)")
	rootCmd.AddCommand(listarCmd)
}`,
      },
      {
        lang: "go",
        code: `// cmd/criar.go — recebe argumento posicional obrigatório.
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var criarCmd = &cobra.Command{
	Use:   "criar [cliente]",
	Short: "Cria um novo pedido para o cliente informado",
	Args:  cobra.ExactArgs(1), // exige exatamente 1 argumento
	Run: func(cmd *cobra.Command, args []string) {
		cliente := args[0]
		fmt.Printf("Pedido criado para %s\\n", cliente)
	},
}

func init() {
	rootCmd.AddCommand(criarCmd)
}`,
      },
      {
        lang: "go",
        code: `// main.go — ponto de entrada minúsculo.
package main

import "exemplo/pedidos/cmd"

func main() {
	cmd.Execute()
}`,
      },
      {
        lang: "bash",
        code: `# Compile e use:
go build -o pedidos
./pedidos --help                 # ajuda gerada automaticamente
./pedidos listar                 # mostra os 3 pedidos
./pedidos listar -s pago         # filtra
./pedidos criar "Maria Silva"    # → Pedido criado para Maria Silva
./pedidos criar                  # erro: requires exactly 1 arg(s)`,
      },
    ],
    points: [
      "Use uma função Execute() no pacote cmd e mantenha o main.go com 3 linhas.",
      "Cada subcomando em seu próprio arquivo, registrado via AddCommand dentro de init().",
      "Prefira Args: cobra.ExactArgs(N) ou MinimumNArgs(N) em vez de validar args na mão.",
      "StringVarP/BoolVarP recebem ponteiro, nome longo, nome curto, padrão e descrição.",
      "Idiomático: separe lógica de negócio em internal/ e deixe Run só fazendo parsing e impressão.",
      "Cobra gera autocompletar para bash, zsh e fish via 'pedidos completion zsh'.",
      "Armadilha: esquecer o init() que chama AddCommand faz o subcomando sumir silenciosamente.",
      "Para ferramentas pequenas demais, considere urfave/cli; Cobra brilha quando há muitos subcomandos.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Rode 'cobra-cli init' (do pacote github.com/spf13/cobra-cli) para gerar o scaffolding inicial. Ele cria cmd/root.go, main.go e até o LICENSE. Economiza 10 minutos.",
      },
      {
        type: "info",
        content: "kubectl, helm, hugo, docker e gh usam Cobra. Quando você aprende Cobra, fica natural ler o código-fonte dessas ferramentas e até contribuir.",
      },
      {
        type: "warning",
        content: "Não coloque chamadas pesadas (banco, HTTP) dentro de init(). Esse código roda no carregamento do pacote, mesmo que o usuário só queira ver o --help. Mantenha init() barato.",
      },
    ],
  },
  {
    slug: "viper-config",
    section: "data-cli",
    title: "Viper: configuração 12-factor sem dor",
    difficulty: "intermediario",
    subtitle: "Lendo configuração de arquivos, variáveis de ambiente e flags com precedência clara",
    intro: `Configurar uma aplicação parece trivial até você precisar suportar três cenários ao mesmo tempo: um arquivo config.yaml em desenvolvimento, variáveis de ambiente em produção (porque é assim que Kubernetes injeta segredos) e flags de linha de comando para testes pontuais. Cada um desses caminhos tem regras próprias e, pior, eles precisam se combinar de forma previsível: flag manda em env, env manda em arquivo, arquivo manda no padrão do código. Esse princípio se chama 12-factor e é praticamente lei em sistemas modernos.

Em Java você usaria Spring Boot com application.properties; em Node, dotenv mais nconf; em Python, pydantic-settings. Em Go, a biblioteca dominante é spf13/viper, escrita pelo mesmo autor do Cobra (e que se integra naturalmente com ele). O Viper lê JSON, YAML, TOML, HCL, .env, busca em múltiplos diretórios, observa mudanças no arquivo em tempo real e mapeia variáveis de ambiente automaticamente.

A grande sacada do Viper é a precedência: você define todas as fontes uma vez, e ao chamar viper.GetString('database.host') ele percorre flag → env → config → default e devolve o primeiro valor encontrado. Isso elimina dezenas de ifs pelo seu código verificando 'a env existe? não? então use o yaml'. Esse trabalho fica centralizado em um lugar só.

Idiomático em Go: defina uma struct Config no início do programa, faça Unmarshal do Viper para ela uma única vez, e passe a struct adiante. Não chame viper.GetString() espalhado pelo código todo, porque isso amarra todos os pacotes à biblioteca de configuração e dificulta testes. Pense no Viper como um leitor que entrega o objeto Config tipado, e depois sai de cena.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação.
go get github.com/spf13/viper@latest`,
      },
      {
        lang: "yaml",
        code: `# config.yaml — arquivo padrão da aplicação.
servidor:
  porta: 8080
  host: "0.0.0.0"
banco:
  url: "postgres://localhost:5432/loja"
  pool: 10
debug: false`,
      },
      {
        lang: "go",
        code: `// main.go — carregando config com precedência completa.
package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/spf13/viper"
)

// Config espelha o YAML usando "mapstructure" (o Viper usa essa lib internamente).
type Config struct {
	Servidor struct {
		Porta int    \`mapstructure:"porta"\`
		Host  string \`mapstructure:"host"\`
	} \`mapstructure:"servidor"\`
	Banco struct {
		URL  string \`mapstructure:"url"\`
		Pool int    \`mapstructure:"pool"\`
	} \`mapstructure:"banco"\`
	Debug bool \`mapstructure:"debug"\`
}

func carregar() (*Config, error) {
	v := viper.New()
	v.SetConfigName("config")        // nome sem extensão
	v.SetConfigType("yaml")
	v.AddConfigPath(".")              // procura no diretório atual
	v.AddConfigPath("/etc/loja/")     // e também em /etc/loja/

	// Defaults: valem se nada mais sobrescrever.
	v.SetDefault("servidor.porta", 3000)
	v.SetDefault("debug", false)

	// Variáveis de ambiente: LOJA_SERVIDOR_PORTA sobrescreve servidor.porta.
	v.SetEnvPrefix("LOJA")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		// Arquivo opcional: se não existir, seguimos com defaults + env.
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func main() {
	cfg, err := carregar()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Subindo em %s:%d (debug=%v)\\n", cfg.Servidor.Host, cfg.Servidor.Porta, cfg.Debug)
	fmt.Printf("Banco: %s pool=%d\\n", cfg.Banco.URL, cfg.Banco.Pool)
}`,
      },
      {
        lang: "bash",
        code: `# Demonstrando precedência:
go run main.go
# → Subindo em 0.0.0.0:8080 (debug=false)

LOJA_SERVIDOR_PORTA=9090 LOJA_DEBUG=true go run main.go
# → Subindo em 0.0.0.0:9090 (debug=true)
# Variáveis de ambiente sobrescreveram o YAML.`,
      },
      {
        lang: "go",
        code: `// Recarga automática quando o arquivo muda — útil em dev.
package main

import (
	"fmt"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigFile("./config.yaml")
	_ = viper.ReadInConfig()

	viper.OnConfigChange(func(e fsnotify.Event) {
		fmt.Println("Config recarregada:", e.Name)
		fmt.Println("Nova porta:", viper.GetInt("servidor.porta"))
	})
	viper.WatchConfig()

	select {} // bloqueia para o programa não morrer
}`,
      },
    ],
    points: [
      "Precedência: flag > env > config > default. Tudo resolvido em um só GetX.",
      "Use Unmarshal para uma struct tipada em vez de viper.GetString espalhado.",
      "SetEnvKeyReplacer com '.' → '_' permite mapear servidor.porta para LOJA_SERVIDOR_PORTA.",
      "ConfigFileNotFoundError não é fatal: trate-o e siga com defaults + env (12-factor).",
      "Idiomático: chame Viper só uma vez no main e passe a struct Config adiante.",
      "WatchConfig + OnConfigChange permitem hot-reload sem reiniciar o processo.",
      "Armadilha: esquecer SetEnvPrefix faz qualquer env do sistema vazar para sua config.",
      "Para CLIs com Cobra, use viper.BindPFlag para integrar flags do Cobra com o Viper.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Em produção, prefira variáveis de ambiente em vez de arquivos. Elas se integram com Kubernetes Secrets, AWS Parameter Store e Doppler sem precisar montar volumes.",
      },
      {
        type: "warning",
        content: "Nunca commit secrets em config.yaml. Use sempre env vars ou um vault. O .gitignore já deve listar config.local.yaml para arquivos pessoais de desenvolvimento.",
      },
      {
        type: "info",
        content: "O Viper depende de mapstructure para decodificar. Se um campo da struct não casar com a chave, ele fica zero silenciosamente. Use ErrorUnused: true em decoder hooks para detectar.",
      },
    ],
  },
  {
    slug: "urfave-cli",
    section: "data-cli",
    title: "urfave/cli: alternativa minimalista ao Cobra",
    difficulty: "iniciante",
    subtitle: "Quando você quer um CLI bonito sem montar uma árvore inteira de subcomandos",
    intro: `Nem todo programa de linha de comando precisa do peso conceitual do Cobra. Se você está fazendo uma ferramenta pequena, com poucos comandos e muitas flags, o urfave/cli oferece uma API mais direta, escrita em estilo declarativo: você descreve o app inteiro como uma única struct literal e roda. Sem registrar comandos em init(), sem espalhar arquivos.

A biblioteca foi originalmente criada pelo Jeremy Saenz como codegangsta/cli e migrou para urfave/cli quando ganhou mantenedores. Hoje está na versão v2 (com v3 em desenvolvimento) e é usada por projetos como geth (cliente Ethereum em Go), drone CI e o próprio gophish. A filosofia é o oposto do Cobra: tudo declarado em um lugar só, comportamento previsível, menos arquivos para navegar.

Compare com o mundo Python: se Cobra é o argparse cheio de boilerplate, urfave/cli é o click — você descreve o que quer e a biblioteca cuida do parsing, da ajuda e até do versionamento. A sintaxe parece JSON estruturado, o que torna fácil ler o app inteiro de cima abaixo e entender quais comandos existem.

Idiomático em Go quando usar urfave/cli: ferramentas internas, scripts maiores, conversores de formato, utilitários de DevOps. Para CLIs grandes voltados ao usuário final (com dezenas de subcomandos aninhados), Cobra ainda é o caminho. Aprender ambos te dá liberdade de escolher a ferramenta certa para o tamanho do problema.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação da v2.
go mod init exemplo/conv
go get github.com/urfave/cli/v2@latest`,
      },
      {
        lang: "go",
        code: `// main.go — um conversor de moedas declarado num bloco só.
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:    "conv",
		Usage:   "converte valores entre moedas",
		Version: "1.0.0",
		Commands: []*cli.Command{
			{
				Name:    "usd",
				Aliases: []string{"u"},
				Usage:   "converte reais para dólares (taxa fixa de exemplo)",
				Flags: []cli.Flag{
					&cli.Float64Flag{
						Name:    "valor",
						Aliases: []string{"v"},
						Usage:   "valor em reais",
						Required: true,
					},
				},
				Action: func(c *cli.Context) error {
					reais := c.Float64("valor")
					taxa := 5.20 // exemplo, normalmente viria de uma API
					fmt.Printf("R$ %.2f = US$ %.2f\\n", reais, reais/taxa)
					return nil
				},
			},
			{
				Name:  "eur",
				Usage: "converte reais para euros",
				Action: func(c *cli.Context) error {
					if c.NArg() == 0 {
						return fmt.Errorf("informe o valor em reais como argumento")
					}
					var reais float64
					fmt.Sscanf(c.Args().First(), "%f", &reais)
					fmt.Printf("R$ %.2f = € %.2f\\n", reais, reais/5.65)
					return nil
				},
			},
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}`,
      },
      {
        lang: "bash",
        code: `# Uso típico:
go run . --help                 # ajuda gerada automaticamente
go run . --version              # → conv version 1.0.0
go run . usd --valor 100        # → R$ 100.00 = US$ 19.23
go run . u -v 50                # alias funciona igual
go run . eur 200                # → R$ 200.00 = € 35.40`,
      },
      {
        lang: "go",
        code: `// Lendo flags globais (valem para qualquer subcomando).
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name: "loja",
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:    "debug",
				Aliases: []string{"d"},
				EnvVars: []string{"LOJA_DEBUG"}, // também lê do ambiente
			},
		},
		Action: func(c *cli.Context) error {
			if c.Bool("debug") {
				fmt.Println("[DEBUG] modo verboso ativo")
			}
			fmt.Println("Loja iniciada")
			return nil
		},
	}
	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
// LOJA_DEBUG=true go run . → [DEBUG] modo verboso ativo`,
      },
    ],
    points: [
      "App, Commands e Flags são structs literais — leitura linear, sem registry global.",
      "EnvVars em qualquer Flag faz a leitura automática de variáveis de ambiente.",
      "Required: true valida que a flag foi passada antes de chamar o Action.",
      "Aliases permitem versão curta (-v) e longa (--valor) sem código extra.",
      "Idiomático: para apps de 1 a 5 subcomandos, urfave/cli rende menos arquivos que Cobra.",
      "c.Args() devolve argumentos posicionais; c.NArg() conta quantos vieram.",
      "Armadilha: misturar v1 e v2 nas importações; sempre use github.com/urfave/cli/v2.",
    ],
    alerts: [
      {
        type: "info",
        content: "A v3 do urfave/cli está em desenvolvimento e muda algumas APIs (Context substituído por context.Context). Para projetos novos hoje, v2 ainda é a aposta segura.",
      },
      {
        type: "tip",
        content: "Use Before e After no App para rodar lógica antes e depois de qualquer comando — ótimo para abrir conexão de banco no início e fechar no fim, garantindo cleanup.",
      },
    ],
  },
  {
    slug: "log-slog",
    section: "data-cli",
    title: "log/slog: logging estruturado nativo do Go",
    difficulty: "intermediario",
    subtitle: "O pacote oficial de logs estruturados que veio no Go 1.21 e aposentou várias bibliotecas",
    intro: `Por anos, fazer logging decente em Go significava escolher entre logrus, zap, zerolog ou uma das outras dez bibliotecas populares. Cada uma com sua API, suas tags, seu formato. Em 2023, com o Go 1.21, a equipe da linguagem incorporou o slog (structured logging) como pacote padrão. Pela primeira vez, você pode fazer logging estruturado de produção sem dependência externa.

A diferença entre log estruturado e log de texto é grande. Quando você loga 'usuário 42 fez login', um humano lê fácil mas uma máquina sofre para extrair que o user_id é 42. Com slog, você loga 'usuário fez login' e adiciona o atributo user_id=42, e a saída sai como JSON pronto para ser indexada no Elasticsearch, Loki ou Datadog. Isso muda tudo na hora de investigar incidentes em produção.

Comparado com Python (logging do stdlib) ou Java (SLF4J), o slog é mais simples por design. Ele tem três conceitos: Logger (o que você usa), Handler (que decide o formato e destino) e Record (uma linha de log com seus atributos). Você pode trocar o Handler para JSONHandler em produção e TextHandler em dev, sem mudar nenhuma linha do código de aplicação.

Idiomático em Go pós-1.21: prefira slog ao invés do log antigo (que ainda existe, mas é simples demais). Use slog.Default() para o logger global e crie loggers filhos com .With() quando quiser amarrar contexto (request_id, user_id) que aparece em toda mensagem. Para libs externas, zap ainda ganha em desempenho extremo, mas para 99 por cento dos casos o slog é mais que suficiente e remove uma dependência do seu go.mod.`,
    codes: [
      {
        lang: "go",
        code: `// Hello slog: logger padrão e atributos estruturados.
package main

import (
	"log/slog"
	"os"
)

func main() {
	// Logger JSON enviando para stdout.
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	slog.Info("usuário autenticado",
		slog.Int("user_id", 42),
		slog.String("metodo", "oauth"),
	)
	// → {"time":"...","level":"INFO","msg":"usuário autenticado","user_id":42,"metodo":"oauth"}

	slog.Warn("tentativa de pagamento falhou",
		slog.String("pedido", "P-101"),
		slog.Float64("valor", 199.90),
	)
}`,
      },
      {
        lang: "go",
        code: `// Trocar handler entre dev (texto colorido) e prod (JSON).
package main

import (
	"log/slog"
	"os"
)

func main() {
	var handler slog.Handler
	if os.Getenv("APP_ENV") == "production" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo, // ignora Debug em prod
		})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug, // tudo em dev
		})
	}
	slog.SetDefault(slog.New(handler))

	slog.Debug("variável interna", slog.Int("contador", 7))
	slog.Info("processado", slog.String("pedido", "P-202"))
}`,
      },
      {
        lang: "go",
        code: `// Logger filho com contexto fixo: ideal para HTTP handlers.
package main

import (
	"log/slog"
	"net/http"
	"os"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	http.HandleFunc("/pedido", func(w http.ResponseWriter, r *http.Request) {
		// .With() devolve um logger novo com atributos amarrados.
		log := slog.With(
			slog.String("request_id", r.Header.Get("X-Request-ID")),
			slog.String("rota", r.URL.Path),
		)
		log.Info("recebida requisição")

		// Toda mensagem deste log vai conter request_id e rota.
		log.Info("buscando no banco", slog.String("tabela", "pedidos"))
		w.Write([]byte("ok"))
	})

	http.ListenAndServe(":8080", nil)
}`,
      },
      {
        lang: "go",
        code: `// Grupos de atributos: organize campos relacionados.
package main

import (
	"log/slog"
	"os"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	logger.Info("compra finalizada",
		slog.Group("cliente",
			slog.Int("id", 42),
			slog.String("email", "ana@exemplo.com"),
		),
		slog.Group("pedido",
			slog.String("codigo", "P-303"),
			slog.Float64("total", 459.80),
		),
	)
	// JSON resultante:
	// {"msg":"compra finalizada","cliente":{"id":42,"email":"..."},"pedido":{"codigo":"P-303","total":459.80}}
}`,
      },
      {
        lang: "go",
        code: `// LogValuer: ocultar campos sensíveis automaticamente.
package main

import (
	"log/slog"
	"os"
)

type Cartao struct {
	Numero string
	CVV    string
}

// LogValue é chamado automaticamente pelo slog ao logar este tipo.
func (c Cartao) LogValue() slog.Value {
	mascarado := "****" + c.Numero[len(c.Numero)-4:]
	return slog.GroupValue(slog.String("numero", mascarado))
}

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	c := Cartao{Numero: "4111111111111234", CVV: "999"}
	slog.Info("pagamento", slog.Any("cartao", c))
	// CVV nunca aparece no log; número fica como ****1234.
}`,
      },
    ],
    points: [
      "slog veio no Go 1.21 e é o padrão recomendado hoje para logs novos.",
      "JSONHandler em produção, TextHandler em desenvolvimento — escolha por env.",
      "Use slog.With() para criar logger com contexto fixo (request_id, user_id).",
      "slog.Group agrupa campos relacionados em um objeto JSON aninhado.",
      "Implemente LogValuer em tipos sensíveis para mascarar dados (PCI, LGPD).",
      "Idiomático: passe o logger via context.Context em handlers, não como global.",
      "Armadilha: log.Println do pacote log antigo não é estruturado e some do JSON.",
      "Níveis padrão: Debug (-4), Info (0), Warn (4), Error (8). Use Level em HandlerOptions.",
    ],
    alerts: [
      {
        type: "success",
        content: "Para projetos novos a partir de 2024, slog é a escolha óbvia. Ele cobre 99% dos casos sem dependência externa, integra com qualquer agregador e tem performance respeitável.",
      },
      {
        type: "info",
        content: "Se você precisa de performance extrema (milhões de logs por segundo), zap (uber-go/zap) e zerolog continuam mais rápidos. Para tudo o resto, slog basta.",
      },
      {
        type: "warning",
        content: "Não logue objetos grandes com slog.Any sem cuidado. Eles são serializados no momento do log e podem custar caro. Logue apenas os campos que você realmente precisa investigar.",
      },
    ],
  },
  {
    slug: "prometheus-metricas",
    section: "data-cli",
    title: "Prometheus em Go: métricas que aguentam produção",
    difficulty: "intermediario",
    subtitle: "Expondo counters, gauges e histograms com prometheus/client_golang em poucos minutos",
    intro: `Logs te contam o que aconteceu em uma requisição específica; métricas te contam o que está acontecendo no sistema inteiro. Quantos pedidos por segundo? Qual o tempo médio de resposta? Quantos erros 500 nas últimas 5 minutos? Para responder isso em produção sem fazer SELECT COUNT(*) em log, você precisa de métricas, e o padrão de fato no mundo Cloud Native é o Prometheus.

A biblioteca oficial em Go é prometheus/client_golang. O modelo é simples: você instrumenta seu código criando contadores, medidores e histogramas, e expõe um endpoint /metrics em HTTP. O Prometheus (servidor) faz scraping periódico, armazena em formato time-series e você consulta via PromQL no Grafana. Esse fluxo virou tão padrão que Kubernetes, etcd, Consul e quase tudo de Cloud Native expõe métricas neste formato.

Existem quatro tipos principais de métrica que você precisa entender. Counter é um número que só sobe (total de requisições, total de erros) — você nunca decrementa, e a derivada dele te dá a taxa por segundo. Gauge é um número que sobe e desce (conexões abertas, fila de jobs). Histogram te dá distribuição (latências p50, p95, p99). Summary é parecido com Histogram, mas calcula percentis no cliente (use Histogram se estiver em dúvida — agrega melhor entre instâncias).

Idiomático em Go: registre as métricas como variáveis de pacote (var requestsTotal = ...), use labels para dimensões (status, método, rota), mas tome cuidado com cardinalidade — labels com valores ilimitados (como user_id) explodem a memória do Prometheus. Pense em métricas como agregados, não como log estruturado.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação do client oficial.
go get github.com/prometheus/client_golang@latest`,
      },
      {
        lang: "go",
        code: `// Servidor HTTP com endpoint /metrics e contador de requisições.
package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Counter: total de requisições, com labels método e rota.
var requestsTotal = promauto.NewCounterVec(
	prometheus.CounterOpts{
		Name: "loja_requests_total",
		Help: "Total de requisições HTTP recebidas.",
	},
	[]string{"metodo", "rota"},
)

func handler(w http.ResponseWriter, r *http.Request) {
	requestsTotal.WithLabelValues(r.Method, r.URL.Path).Inc()
	w.Write([]byte("ok"))
}

func main() {
	http.HandleFunc("/", handler)
	http.Handle("/metrics", promhttp.Handler()) // expõe as métricas
	http.ListenAndServe(":8080", nil)
}
// curl localhost:8080/  e depois  curl localhost:8080/metrics
// → loja_requests_total{metodo="GET",rota="/"} 1`,
      },
      {
        lang: "go",
        code: `// Histogram: medindo latência de uma operação de pagamento.
package main

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var pagamentoDuracao = promauto.NewHistogramVec(
	prometheus.HistogramOpts{
		Name:    "loja_pagamento_segundos",
		Help:    "Tempo de processamento de pagamentos.",
		Buckets: prometheus.DefBuckets, // .005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10
	},
	[]string{"gateway"},
)

func processarPagamento(w http.ResponseWriter, r *http.Request) {
	timer := prometheus.NewTimer(pagamentoDuracao.WithLabelValues("stripe"))
	defer timer.ObserveDuration() // mede do início ao fim do handler

	// Simula trabalho: 50ms a 550ms.
	time.Sleep(time.Duration(50+rand.Intn(500)) * time.Millisecond)
	w.Write([]byte("pago"))
}

func main() {
	http.HandleFunc("/pagar", processarPagamento)
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8080", nil)
}`,
      },
      {
        lang: "go",
        code: `// Gauge: rastreando algo que sobe e desce (conexões ativas).
package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var conexoesAtivas = promauto.NewGauge(prometheus.GaugeOpts{
	Name: "loja_conexoes_websocket",
	Help: "Número atual de conexões WebSocket abertas.",
})

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conexoesAtivas.Inc()         // cliente conectou
	defer conexoesAtivas.Dec()   // cliente desconectou (no fim do handler)

	// Simula uma conexão longa (na vida real, seria upgrade WebSocket).
	<-r.Context().Done()
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":8080", nil)
}`,
      },
      {
        lang: "yaml",
        code: `# prometheus.yml — configuração do servidor Prometheus para coletar suas métricas.
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "loja"
    static_configs:
      - targets: ["localhost:8080"]
# Rode com: prometheus --config.file=prometheus.yml
# Acesse http://localhost:9090 para a UI e queries PromQL.`,
      },
    ],
    points: [
      "promauto evita registrar manualmente cada métrica no DefaultRegisterer.",
      "Counter só sobe (use Inc/Add); Gauge sobe e desce (Inc/Dec/Set).",
      "Histogram coleta distribuição; calcule percentis no servidor com histogram_quantile().",
      "Idiomático: declare métricas como var de pacote no topo do arquivo que as usa.",
      "Labels devem ter cardinalidade BAIXA (status, método, rota) — nunca user_id ou email.",
      "Use prometheus.NewTimer + defer ObserveDuration para medir latência sem boilerplate.",
      "Armadilha: criar label com cardinalidade explosiva derruba o Prometheus em horas.",
      "Endpoints /metrics não devem ser expostos publicamente — proteja com firewall ou auth.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use o pacote promhttp.InstrumentHandlerDuration para instrumentar todos os handlers HTTP automaticamente sem repetir código de timer em cada um.",
      },
      {
        type: "warning",
        content: "Cuidado com cardinalidade. Uma métrica com label user_id e 1 milhão de usuários cria 1 milhão de séries no Prometheus, devorando RAM. Use atributos categóricos.",
      },
      {
        type: "info",
        content: "Para sistemas pequenos sem Prometheus, expor /metrics ainda vale a pena — você pode raspar com Grafana Agent, VictoriaMetrics ou simplesmente curl pra debug.",
      },
    ],
  },
  {
    slug: "json-streaming",
    section: "data-cli",
    title: "JSON streaming com encoding/json",
    difficulty: "intermediario",
    subtitle: "Lendo arquivos gigantes com Decoder sem estourar memória nem perder fôlego",
    intro: `O método mais comum de ler JSON em Go é json.Unmarshal: você passa um []byte e recebe a struct preenchida. Isso funciona maravilhosamente para um payload de API com 5 KB. Mas e quando você precisa processar um arquivo de 2 GB com milhões de registros, ou ler uma resposta NDJSON que vem em streaming pela rede? Carregar tudo em memória é receita para OOM (out-of-memory).

A solução está em json.Decoder, que lê de qualquer io.Reader e te entrega tokens ou valores um por um. Você consome registro a registro, processa, e o coletor de lixo libera o anterior. Isso é o que o jq faz por baixo dos panos, e o que você precisa para qualquer pipeline de dados sério.

Esse padrão é especialmente útil para NDJSON (newline-delimited JSON), formato muito usado em logs, exportações de banco e APIs de streaming como o Twitter (quando ainda existia API pública). Cada linha é um objeto JSON completo, e você pode processar enquanto baixa, sem esperar o fim. Em Python você usaria ijson ou json.loads em loop; em Java, Jackson Streaming. Em Go, é Decoder e pronto.

Idiomático: prefira json.Decoder a json.Unmarshal sempre que você estiver lendo de uma rede, um arquivo grande ou um pipe. Use Decoder.Token() para descer por arrays gigantes mantendo um item de cada vez na memória. Combine com goroutines + channel para criar um pipeline de processamento concorrente: um produtor lendo, vários consumidores processando.`,
    codes: [
      {
        lang: "go",
        code: `// Lendo um arquivo NDJSON enorme registro por registro.
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Pedido struct {
	ID     string  \`json:"id"\`
	Valor  float64 \`json:"valor"\`
	Status string  \`json:"status"\`
}

func main() {
	f, err := os.Open("pedidos.ndjson")
	if err != nil {
		panic(err)
	}
	defer f.Close()

	dec := json.NewDecoder(f)
	total := 0.0
	count := 0
	for {
		var p Pedido
		if err := dec.Decode(&p); err == io.EOF {
			break // chegou ao fim do arquivo
		} else if err != nil {
			panic(err)
		}
		if p.Status == "pago" {
			total += p.Valor
			count++
		}
	}
	fmt.Printf("%d pedidos pagos, total R$ %.2f\\n", count, total)
}
// Funciona tanto para arquivo de 1 KB quanto de 50 GB.
// Uso de memória: ~8 KB constantes (uma struct Pedido por vez).`,
      },
      {
        lang: "go",
        code: `// Lendo um array JSON gigante usando Token() (não NDJSON).
package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type Cliente struct {
	ID   int    \`json:"id"\`
	Nome string \`json:"nome"\`
}

func main() {
	f, _ := os.Open("clientes.json") // arquivo do tipo [{...},{...},...]
	defer f.Close()

	dec := json.NewDecoder(f)

	// Lê o '[' inicial.
	if _, err := dec.Token(); err != nil {
		panic(err)
	}

	for dec.More() {
		var c Cliente
		if err := dec.Decode(&c); err != nil {
			panic(err)
		}
		fmt.Println(c.ID, c.Nome)
	}

	// Lê o ']' final (opcional, mas educado).
	dec.Token()
}`,
      },
      {
        lang: "go",
        code: `// Streaming HTTP: processando enquanto baixa.
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Evento struct {
	Tipo string \`json:"tipo"\`
	Hora string \`json:"hora"\`
}

func main() {
	resp, err := http.Get("https://exemplo.com/api/eventos.ndjson")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	dec := json.NewDecoder(resp.Body)
	for {
		var e Evento
		if err := dec.Decode(&e); err == io.EOF {
			break
		} else if err != nil {
			panic(err)
		}
		fmt.Println(e.Hora, "→", e.Tipo)
	}
}`,
      },
      {
        lang: "go",
        code: `// Pipeline com goroutines: produtor lê, workers processam.
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sync"
)

type Linha struct {
	UserID int    \`json:"user_id"\`
	Acao   string \`json:"acao"\`
}

func main() {
	f, _ := os.Open("eventos.ndjson")
	defer f.Close()

	jobs := make(chan Linha, 100)
	var wg sync.WaitGroup

	// 4 workers consumindo do channel.
	for i := 0; i < 4; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for l := range jobs {
				fmt.Printf("[worker %d] user=%d acao=%s\\n", id, l.UserID, l.Acao)
			}
		}(i)
	}

	// Produtor lendo arquivo e empurrando no channel.
	dec := json.NewDecoder(f)
	for {
		var l Linha
		if err := dec.Decode(&l); err == io.EOF {
			break
		} else if err != nil {
			panic(err)
		}
		jobs <- l
	}
	close(jobs)
	wg.Wait()
}`,
      },
      {
        lang: "go",
        code: `// Escrita em streaming com Encoder: gerar NDJSON sem montar tudo na memória.
package main

import (
	"encoding/json"
	"os"
)

type Linha struct {
	N  int    \`json:"n"\`
	Ok bool   \`json:"ok"\`
}

func main() {
	f, _ := os.Create("saida.ndjson")
	defer f.Close()

	enc := json.NewEncoder(f) // por padrão adiciona '\\n' depois de cada Encode
	for i := 0; i < 1_000_000; i++ {
		enc.Encode(Linha{N: i, Ok: i%2 == 0})
	}
	// Arquivo final tem 1 milhão de linhas, memória do programa fica baixa.
}`,
      },
    ],
    points: [
      "Decoder lê de qualquer io.Reader: arquivo, rede, pipe, gzip.Reader.",
      "Para NDJSON, basta um for com Decode até receber io.EOF.",
      "Para JSON em formato de array, use Token() para consumir '[' e dec.More() no loop.",
      "Encoder.Encode escreve sem buffer infinito, ideal para gerar arquivos grandes.",
      "Idiomático: combine Decoder com goroutines + channel para pipelines paralelos.",
      "Armadilha: usar json.Unmarshal com ioutil.ReadAll em arquivo de GB causa OOM.",
      "Decoder.UseNumber() preserva precisão de números grandes (importante em finanças).",
      "Decoder.DisallowUnknownFields() detecta erros de schema cedo em vez de silenciar.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para JSON realmente massivo, considere encoding/json/v2 (em desenvolvimento na proposta golang/go#71497) ou bibliotecas como goccy/go-json e bytedance/sonic, que são 2-5x mais rápidas.",
      },
      {
        type: "warning",
        content: "json.NewDecoder em uma resposta HTTP NÃO consome o resto do body se você não ler até o fim. Para reaproveitar a conexão TCP (keep-alive), use io.Copy(io.Discard, resp.Body) antes de fechar.",
      },
      {
        type: "info",
        content: "NDJSON é o formato preferido por ferramentas como BigQuery, Snowflake e Loki para ingestão de dados, justamente porque permite leitura linha-a-linha sem parser pesado.",
      },
    ],
  },
  {
    slug: "excel-xlsx",
    section: "data-cli",
    title: "Excel em Go com xuri/excelize",
    difficulty: "intermediario",
    subtitle: "Lendo, escrevendo e estilizando planilhas .xlsx sem precisar do Microsoft Office",
    intro: `Por mais que a gente queira viver num mundo só de bancos de dados e APIs JSON, a realidade é que metade do trabalho corporativo passa por Excel. Time financeiro pede relatório em xlsx, contabilidade exporta extrato em xlsx, RH atualiza folha em xlsx. Saber gerar e consumir esses arquivos do seu serviço Go é um superpoder muito mais útil do que parece.

Em Python o padrão é openpyxl ou pandas; em Java, Apache POI; em Node, exceljs. Em Go, a biblioteca dominante é xuri/excelize (anteriormente 360EntSecGroup-Skylar/excelize), totalmente em Go puro, sem dependência do Excel ou de COM. Ela suporta xlsx, xlsm, xltm, xltx, lê e escreve fórmulas, estilos, gráficos, imagens e até pivot tables. Isso é raríssimo no ecossistema.

A grande sacada do excelize é que ele usa endereçamento estilo planilha mesmo: você lê e escreve em A1, B2, C10. Isso casa bem com como gente de negócio pensa, e te poupa de matemática mental para converter linha 3 coluna 5 para algum índice. Você também pode criar styles uma vez e aplicar a faixas inteiras, gerar sheets dinamicamente e até proteger células.

Idiomático em Go com excelize: feche sempre o arquivo com defer f.Close() (ele deixa um lock em disco), cuide para usar SaveAs ao gerar do zero e Save quando estiver editando, e use os helpers CoordinatesToCellName quando estiver iterando programaticamente — tipo escrever 1000 linhas de pedidos. Para serviços HTTP, gere o arquivo em memória com NewFile() e devolva via WriteTo no ResponseWriter, sem nunca tocar disco.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação.
go get github.com/xuri/excelize/v2@latest`,
      },
      {
        lang: "go",
        code: `// Gerando uma planilha de pedidos com cabeçalho estilizado.
package main

import (
	"fmt"

	"github.com/xuri/excelize/v2"
)

type Pedido struct {
	ID     string
	Cliente string
	Total  float64
}

func main() {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Pedidos"
	f.SetSheetName("Sheet1", sheet)

	// Cabeçalho.
	f.SetCellValue(sheet, "A1", "ID")
	f.SetCellValue(sheet, "B1", "Cliente")
	f.SetCellValue(sheet, "C1", "Total")

	// Estilo: negrito + fundo amarelo.
	estiloHeader, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "#000000"},
		Fill: excelize.Fill{Type: "pattern", Color: []string{"#FFE699"}, Pattern: 1},
	})
	f.SetCellStyle(sheet, "A1", "C1", estiloHeader)

	pedidos := []Pedido{
		{"P-101", "Maria Silva", 159.90},
		{"P-102", "João Souza", 49.50},
		{"P-103", "Ana Costa", 299.00},
	}
	for i, p := range pedidos {
		linha := i + 2 // dados começam na linha 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", linha), p.ID)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", linha), p.Cliente)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", linha), p.Total)
	}

	// Fórmula: soma dos totais.
	f.SetCellFormula(sheet, "C5", "=SUM(C2:C4)")

	if err := f.SaveAs("pedidos.xlsx"); err != nil {
		panic(err)
	}
	fmt.Println("pedidos.xlsx gerado")
}`,
      },
      {
        lang: "go",
        code: `// Lendo uma planilha existente linha por linha.
package main

import (
	"fmt"

	"github.com/xuri/excelize/v2"
)

func main() {
	f, err := excelize.OpenFile("pedidos.xlsx")
	if err != nil {
		panic(err)
	}
	defer f.Close()

	rows, err := f.GetRows("Pedidos")
	if err != nil {
		panic(err)
	}

	for i, row := range rows {
		fmt.Printf("Linha %d: %v\\n", i+1, row)
	}
	// Linha 1: [ID Cliente Total]
	// Linha 2: [P-101 Maria Silva 159.9]
	// ...
}`,
      },
      {
        lang: "go",
        code: `// Streaming writer: para arquivos GIGANTES (centenas de milhares de linhas).
package main

import (
	"github.com/xuri/excelize/v2"
)

func main() {
	f := excelize.NewFile()
	defer f.Close()

	sw, err := f.NewStreamWriter("Sheet1")
	if err != nil {
		panic(err)
	}

	sw.SetRow("A1", []interface{}{"id", "valor"})

	// 100.000 linhas sem estourar memória.
	for i := 2; i <= 100_000; i++ {
		cell, _ := excelize.CoordinatesToCellName(1, i)
		sw.SetRow(cell, []interface{}{i - 1, float64(i) * 1.5})
	}

	if err := sw.Flush(); err != nil {
		panic(err)
	}
	f.SaveAs("grande.xlsx")
}`,
      },
      {
        lang: "go",
        code: `// Servir xlsx por HTTP sem tocar disco.
package main

import (
	"net/http"

	"github.com/xuri/excelize/v2"
)

func main() {
	http.HandleFunc("/relatorio.xlsx", func(w http.ResponseWriter, r *http.Request) {
		f := excelize.NewFile()
		defer f.Close()
		f.SetCellValue("Sheet1", "A1", "Relatório gerado em runtime")
		f.SetCellValue("Sheet1", "A2", 42)

		w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		w.Header().Set("Content-Disposition", \`attachment; filename="relatorio.xlsx"\`)

		// WriteTo escreve direto no ResponseWriter (que é um io.Writer).
		f.Write(w)
	})
	http.ListenAndServe(":8080", nil)
}`,
      },
    ],
    points: [
      "OpenFile lê, NewFile cria do zero, ambos exigem defer Close para liberar lock.",
      "Endereçamento usa notação de planilha: A1, B2, AA10.",
      "SetCellFormula deixa o cálculo para o Excel resolver na hora de abrir.",
      "Estilos são reutilizáveis: crie uma vez com NewStyle e aplique com SetCellStyle.",
      "Idiomático: para arquivos grandes, use StreamWriter — escrita sequencial sem buffer total.",
      "Em HTTP handlers, use f.Write(w) para servir sem tocar disco.",
      "Armadilha: esquecer defer Close deixa arquivo travado e processo segurando memória.",
      "Para CSV simples, encoding/csv do stdlib é melhor — excelize é overkill aí.",
    ],
    alerts: [
      {
        type: "info",
        content: "excelize é totalmente em Go puro: não precisa de Excel instalado, não usa COM, roda em qualquer container Linux. Isso simplifica deploy em Kubernetes drasticamente.",
      },
      {
        type: "tip",
        content: "Para gerar relatórios complexos, mantenha um template.xlsx com macros/estilos prontos e use OpenFile + SetCellValue para preencher os dados. Mais rápido e mais bonito que gerar do zero.",
      },
      {
        type: "warning",
        content: "Não use excelize para xls antigo (binário pré-2007). Esse formato é diferente do xlsx e exige outras bibliotecas como extrame/xls (somente leitura).",
      },
    ],
  },
  {
    slug: "yaml-toml",
    section: "data-cli",
    title: "YAML e TOML em Go",
    difficulty: "iniciante",
    subtitle: "Os dois formatos de configuração que dominam o ecossistema moderno e como ler cada um",
    intro: `JSON é ótimo para API, mas péssimo para humano editar. Sem comentários, exigindo aspas em toda chave, sensível a vírgula sobrando — você cansa rápido. Por isso o mundo de configuração se dividiu em dois grandes formatos: YAML (favorito do mundo Kubernetes, Ansible, GitHub Actions) e TOML (favorito do Rust, Hugo, e cada vez mais do Go).

YAML é poderoso, com suporte a referências, tipos complexos e sintaxe econômica baseada em indentação. Mas essa mesma indentação é a causa de 90 por cento dos bugs: um espaço a mais, um tab no lugar de espaço, e o parser quebra sem avisar onde. TOML evita esse problema sendo mais explícito (chaves entre colchetes, tipos óbvios), em troca de ser um pouco mais verboso.

Em Go, as bibliotecas dominantes são gopkg.in/yaml.v3 (do canonical Kanaka, mantida ativamente) para YAML e github.com/BurntSushi/toml para TOML. Ambas seguem o mesmo padrão da stdlib: você define uma struct com tags, chama Unmarshal, e tem a struct preenchida. Pra quem vem de Python (PyYAML/tomllib) ou Rust (serde), o modelo é familiar.

Idiomático em Go: defina structs explícitas para sua config, com tags yaml:'campo' ou toml:'campo'. Evite map[string]interface{} porque você perde tipagem e tem que fazer type assertions feias. Para projetos novos, considere TOML: a sintaxe é menos sujeita a erros sutis e o desempenho de parsing é melhor. Para integrar com ecossistema Kubernetes, YAML continua sendo padrão.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação.
go get gopkg.in/yaml.v3
go get github.com/BurntSushi/toml`,
      },
      {
        lang: "yaml",
        code: `# config.yaml — configuração de uma loja.
nome: "Loja XPTO"
versao: 2
servidor:
  host: "0.0.0.0"
  porta: 8080
  timeout: 30s
features:
  - pix
  - boleto
  - cartao`,
      },
      {
        lang: "go",
        code: `// Lendo o YAML acima para uma struct tipada.
package main

import (
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Servidor struct {
	Host    string        \`yaml:"host"\`
	Porta   int           \`yaml:"porta"\`
	Timeout time.Duration \`yaml:"timeout"\`
}

type Config struct {
	Nome     string   \`yaml:"nome"\`
	Versao   int      \`yaml:"versao"\`
	Servidor Servidor \`yaml:"servidor"\`
	Features []string \`yaml:"features"\`
}

func main() {
	dados, err := os.ReadFile("config.yaml")
	if err != nil {
		panic(err)
	}

	var cfg Config
	if err := yaml.Unmarshal(dados, &cfg); err != nil {
		panic(err)
	}
	fmt.Printf("%+v\\n", cfg)
	fmt.Println("Timeout em ns:", cfg.Servidor.Timeout)
	// Saída: 30s vira 30000000000 ns automaticamente.
}`,
      },
      {
        lang: "go",
        code: `// Escrevendo YAML para arquivo (gerar config.yaml a partir de struct).
package main

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Tema struct {
	Cor    string \`yaml:"cor"\`
	Fonte  string \`yaml:"fonte"\`
	Tamanho int   \`yaml:"tamanho"\`
}

func main() {
	t := Tema{Cor: "azul", Fonte: "Inter", Tamanho: 14}

	saida, err := yaml.Marshal(&t)
	if err != nil {
		panic(err)
	}
	os.WriteFile("tema.yaml", saida, 0644)
	// Conteúdo:
	// cor: azul
	// fonte: Inter
	// tamanho: 14
}`,
      },
      {
        lang: "toml",
        code: `# app.toml — sintaxe TOML, mais explícita.
nome = "Loja XPTO"
versao = 2

[servidor]
host = "0.0.0.0"
porta = 8080
timeout = "30s"

[banco]
url = "postgres://localhost/loja"
max_conexoes = 25
ssl = true

[[admin]]
email = "ana@loja.com"
nivel = 9

[[admin]]
email = "joao@loja.com"
nivel = 5`,
      },
      {
        lang: "go",
        code: `// Lendo TOML com BurntSushi/toml.
package main

import (
	"fmt"

	"github.com/BurntSushi/toml"
)

type Servidor struct {
	Host    string \`toml:"host"\`
	Porta   int    \`toml:"porta"\`
	Timeout string \`toml:"timeout"\`
}

type Banco struct {
	URL          string \`toml:"url"\`
	MaxConexoes  int    \`toml:"max_conexoes"\`
	SSL          bool   \`toml:"ssl"\`
}

type Admin struct {
	Email string \`toml:"email"\`
	Nivel int    \`toml:"nivel"\`
}

type Config struct {
	Nome     string   \`toml:"nome"\`
	Versao   int      \`toml:"versao"\`
	Servidor Servidor \`toml:"servidor"\`
	Banco    Banco    \`toml:"banco"\`
	Admin    []Admin  \`toml:"admin"\`
}

func main() {
	var cfg Config
	meta, err := toml.DecodeFile("app.toml", &cfg)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%+v\\n", cfg)
	fmt.Println("Chaves não usadas:", meta.Undecoded())
	// Undecoded ajuda a detectar erro de digitação no TOML.
}`,
      },
    ],
    points: [
      "yaml.v3 é a v3 oficial; v2 está deprecada — sempre use a v3 em projetos novos.",
      "BurntSushi/toml retorna metadata.Undecoded() para detectar campos digitados errado.",
      "Use struct com tags em vez de map[string]interface{} para manter tipagem.",
      "time.Duration no YAML aceita strings como '30s', '1h', '500ms' direto.",
      "Idiomático: prefira TOML para config nova; YAML para integração com Kubernetes/Helm.",
      "Para validar campos obrigatórios, use go-playground/validator junto da Unmarshal.",
      "Armadilha em YAML: usar TAB em vez de espaço quebra o parsing silenciosamente.",
      "TOML não suporta nesting profundo nativamente — bom para configs achatadas.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Cuidado com o famoso 'YAML Norway problem': a string 'NO' (código do país) vira boolean false em YAML 1.1. Sempre coloque entre aspas valores que parecem boolean ou número.",
      },
      {
        type: "tip",
        content: "Para configs grandes, separe em múltiplos arquivos (base.yaml + ambiente.yaml) e faça merge no código com mergo (imdario/mergo). Mais sustentável que um arquivo monolítico.",
      },
      {
        type: "info",
        content: "O Go 1.22+ não tem TOML na stdlib (diferente do Python 3.11 com tomllib). BurntSushi/toml é a referência de facto e segue a spec TOML 1.0.0.",
      },
    ],
  },
  {
    slug: "protobuf",
    section: "data-cli",
    title: "Protocol Buffers em Go",
    difficulty: "avancado",
    subtitle: "Serialização binária tipada e compacta, base do gRPC e de muitos sistemas distribuídos",
    intro: `JSON é ótimo para humano e horrível para máquina: cada chave é repetida em texto, números viram strings, e parsing custa caro. Quando você está movendo bilhões de mensagens entre microsserviços, esses bytes e milissegundos somam um custo gigante. É aí que entram os Protocol Buffers (Protobuf), um formato binário criado pelo Google que codifica dados em uma fração do tamanho do JSON e desserializa muito mais rápido.

A ideia central é separar o schema dos dados. Você descreve as mensagens em um arquivo .proto (estilo IDL), roda o compilador protoc, e ele gera código nativo para a sua linguagem. Em Go isso vira structs com métodos Marshal/Unmarshal otimizados. O mesmo .proto gera código para Java, Python, Ruby, Rust, C++ — ideal para sistemas multi-linguagem.

Comparado com JSON, Protobuf tem três grandes vantagens. Tamanho: tipicamente 3 a 10 vezes menor (sem chaves repetidas, números em varint). Velocidade: parsing 5 a 20 vezes mais rápido. Schema: campos opcionais e versionados, com regras claras de evolução (você pode adicionar campos sem quebrar clientes antigos, contanto que respeite os números de tag).

Idiomático em Go: use a v2 do go-protobuf (google.golang.org/protobuf, não github.com/golang/protobuf que está deprecado). Mantenha os arquivos .proto em um diretório proto/ e gere o código Go em internal/pb/. Versione os .proto no Git e regenere o Go quando mudar. Esse é o alicerce do gRPC, que você vai estudar nos próximos capítulos.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar protoc (compilador) e plugin Go.
# macOS: brew install protobuf
# Linux:
sudo apt install -y protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# Garanta que $GOPATH/bin está no PATH.
go get google.golang.org/protobuf`,
      },
      {
        lang: "bash",
        code: `# proto/pedido.proto — definição do schema.
cat > proto/pedido.proto << 'EOF'
syntax = "proto3";

package loja;
option go_package = "exemplo/pedidos/internal/pb;pb";

message Pedido {
  string id = 1;          // tag 1: nunca reuse
  string cliente = 2;
  double valor = 3;
  Status status = 4;
  repeated string itens = 5;  // lista de strings
}

enum Status {
  PENDENTE = 0;   // 0 é o valor padrão
  PAGO = 1;
  CANCELADO = 2;
}
EOF

# Gerar código Go.
protoc --go_out=. --go_opt=paths=source_relative proto/pedido.proto`,
      },
      {
        lang: "go",
        code: `// Usando o tipo gerado: serializar e desserializar.
package main

import (
	"fmt"

	"exemplo/pedidos/internal/pb"
	"google.golang.org/protobuf/proto"
)

func main() {
	p := &pb.Pedido{
		Id:      "P-101",
		Cliente: "Maria Silva",
		Valor:   159.90,
		Status:  pb.Status_PAGO,
		Itens:   []string{"Café", "Pão", "Suco"},
	}

	// Serializar para bytes (binário).
	dados, err := proto.Marshal(p)
	if err != nil {
		panic(err)
	}
	fmt.Printf("Tamanho protobuf: %d bytes\\n", len(dados))
	// → ~50 bytes; o JSON equivalente teria ~140.

	// Desserializar de volta.
	outro := &pb.Pedido{}
	if err := proto.Unmarshal(dados, outro); err != nil {
		panic(err)
	}
	fmt.Printf("%+v\\n", outro)
}`,
      },
      {
        lang: "go",
        code: `// Comparando JSON x Protobuf no mesmo objeto.
package main

import (
	"encoding/json"
	"fmt"

	"exemplo/pedidos/internal/pb"
	"google.golang.org/protobuf/proto"
)

func main() {
	p := &pb.Pedido{
		Id: "P-200", Cliente: "João", Valor: 99.50,
		Status: pb.Status_PENDENTE,
	}

	jsonBytes, _ := json.Marshal(struct {
		ID      string  \`json:"id"\`
		Cliente string  \`json:"cliente"\`
		Valor   float64 \`json:"valor"\`
		Status  string  \`json:"status"\`
	}{p.Id, p.Cliente, p.Valor, "PENDENTE"})

	pbBytes, _ := proto.Marshal(p)

	fmt.Printf("JSON:     %d bytes\\n", len(jsonBytes))
	fmt.Printf("Protobuf: %d bytes\\n", len(pbBytes))
	// JSON:     78 bytes
	// Protobuf: 24 bytes
}`,
      },
      {
        lang: "go",
        code: `// Evolução de schema: adicionando campo sem quebrar clientes antigos.
// proto/pedido.proto atualizado:
//
// message Pedido {
//   string id = 1;
//   string cliente = 2;
//   double valor = 3;
//   Status status = 4;
//   repeated string itens = 5;
//   string moeda = 6;        // NOVO campo, tag 6
// }

package main

import (
	"fmt"

	"exemplo/pedidos/internal/pb"
	"google.golang.org/protobuf/proto"
)

func main() {
	// Cliente novo escreve com Moeda preenchida.
	novo := &pb.Pedido{Id: "P-1", Moeda: "BRL"}
	dados, _ := proto.Marshal(novo)

	// Cliente antigo (sem campo Moeda na struct) faz Unmarshal sem erro.
	// Os bytes do campo desconhecido são preservados internamente.
	antigo := &pb.Pedido{}
	proto.Unmarshal(dados, antigo)
	fmt.Println("Cliente antigo leu:", antigo.Id)
	// Sem panic, sem erro. Foi por isso que o Google escolheu Protobuf.
}`,
      },
    ],
    points: [
      "Sempre numere campos com tags únicas (1, 2, 3...) e NUNCA reuse uma tag deletada.",
      "Use proto3 (não proto2) em código novo — sintaxe mais simples e padrão atual.",
      "google.golang.org/protobuf é a v2 oficial; deprecada: github.com/golang/protobuf.",
      "repeated cria slice; map<K,V> existe para mapas; oneof para união discriminada.",
      "Idiomático: gere código com 'go generate' e commit os .pb.go no repositório.",
      "Adicionar campos é seguro; remover é perigoso — marque como 'reserved' antes de tirar.",
      "Armadilha: trocar tipo de campo (int32 para string) quebra todos os clientes antigos.",
      "Para depurar bytes de uma mensagem, use protoc --decode_raw < arquivo.bin.",
    ],
    alerts: [
      {
        type: "info",
        content: "Protobuf é o formato base de todo gRPC. Aprender protobuf é pré-requisito real para os capítulos seguintes — não pule esta etapa.",
      },
      {
        type: "warning",
        content: "Tags reservadas devem ser declaradas (reserved 4, 7) ao remover campos. Sem isso, alguém um dia reutiliza o número e causa corrupção silenciosa de dados em produção.",
      },
      {
        type: "tip",
        content: "Para projetos pequenos, considere também o Cap'n Proto e o FlatBuffers — formatos parecidos com Protobuf que dispensam parsing (zero-copy). Em Go, capnproto.org/go/capnp é maduro.",
      },
    ],
  },
  {
    slug: "grpc-intro",
    section: "data-cli",
    title: "gRPC: introdução com Go",
    difficulty: "avancado",
    subtitle: "Servidor e cliente unários, contratos via .proto e a alternativa moderna a REST",
    intro: `REST sobre HTTP/JSON resolveu muita coisa, mas tem limites claros: serialização cara, nenhum contrato forte entre cliente e servidor, e nada muito esperto para streaming. O gRPC, criado pelo Google em 2015, ataca exatamente esses pontos. Ele usa HTTP/2 como transporte, Protobuf como serialização e gera stubs tipados em mais de 10 linguagens a partir de um único arquivo .proto.

A vantagem prática é gigante: você define o serviço uma vez (em .proto), gera código para Go (servidor) e para o cliente que pode ser Python, Java, Node, etc. Cliente e servidor SEMPRE concordam no formato — quebra de contrato vira erro de compilação, não erro de runtime no cliente em produção. É o sonho de quem já passou raiva debugando um payload JSON malformado.

Existem quatro modos de chamada em gRPC. Unário (request → response, igual REST), server-streaming (1 request → muitos responses), client-streaming (muitos requests → 1 response) e bidirecional (muitos para muitos, ao mesmo tempo). Este capítulo cobre o unário, que é o mais comum e cobre 80 por cento dos casos. Os outros três vêm no próximo.

Idiomático em Go com gRPC: organize o projeto com proto/ (arquivos .proto), internal/pb/ (código gerado), internal/server/ (implementação). Use interceptors (middleware do gRPC) para logging, autenticação e métricas. Para produção pública, exponha um gateway grpc-gateway que traduz REST→gRPC, mantendo compatibilidade com clientes que ainda só falam HTTP/JSON.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalar plugin do gRPC para Go.
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# No projeto:
go get google.golang.org/grpc
go get google.golang.org/protobuf`,
      },
      {
        lang: "bash",
        code: `# proto/banco.proto — serviço de saldo de conta.
cat > proto/banco.proto << 'EOF'
syntax = "proto3";

package banco;
option go_package = "exemplo/banco/pb;pb";

service Conta {
  rpc Saldo(SaldoReq) returns (SaldoResp);
  rpc Transferir(TransferReq) returns (TransferResp);
}

message SaldoReq  { string conta_id = 1; }
message SaldoResp { double saldo = 1; string moeda = 2; }

message TransferReq  {
  string origem = 1;
  string destino = 2;
  double valor = 3;
}
message TransferResp {
  bool ok = 1;
  string mensagem = 2;
}
EOF

# Gerar código Go (mensagens + stubs gRPC).
protoc --go_out=. --go_opt=paths=source_relative \\
       --go-grpc_out=. --go-grpc_opt=paths=source_relative \\
       proto/banco.proto`,
      },
      {
        lang: "go",
        code: `// internal/server/server.go — implementação do serviço.
package server

import (
	"context"
	"fmt"

	"exemplo/banco/pb"
)

type ContaServer struct {
	pb.UnimplementedContaServer // exigido por compatibilidade futura
	saldos map[string]float64
}

func New() *ContaServer {
	return &ContaServer{
		saldos: map[string]float64{
			"A-1": 1000.00,
			"A-2": 250.00,
		},
	}
}

func (s *ContaServer) Saldo(ctx context.Context, req *pb.SaldoReq) (*pb.SaldoResp, error) {
	v, ok := s.saldos[req.ContaId]
	if !ok {
		return nil, fmt.Errorf("conta %s não existe", req.ContaId)
	}
	return &pb.SaldoResp{Saldo: v, Moeda: "BRL"}, nil
}

func (s *ContaServer) Transferir(ctx context.Context, req *pb.TransferReq) (*pb.TransferResp, error) {
	if s.saldos[req.Origem] < req.Valor {
		return &pb.TransferResp{Ok: false, Mensagem: "saldo insuficiente"}, nil
	}
	s.saldos[req.Origem] -= req.Valor
	s.saldos[req.Destino] += req.Valor
	return &pb.TransferResp{Ok: true, Mensagem: "transferido"}, nil
}`,
      },
      {
        lang: "go",
        code: `// cmd/server/main.go — sobe o servidor gRPC na porta 50051.
package main

import (
	"log"
	"net"

	"exemplo/banco/internal/server"
	"exemplo/banco/pb"

	"google.golang.org/grpc"
)

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}
	s := grpc.NewServer()
	pb.RegisterContaServer(s, server.New())
	log.Println("gRPC ouvindo em :50051")
	if err := s.Serve(lis); err != nil {
		log.Fatal(err)
	}
}`,
      },
      {
        lang: "go",
        code: `// cmd/client/main.go — cliente que chama o servidor.
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"exemplo/banco/pb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, err := grpc.NewClient("localhost:50051",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	cli := pb.NewContaClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Chamada unária 1: ver saldo.
	r1, err := cli.Saldo(ctx, &pb.SaldoReq{ContaId: "A-1"})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Saldo A-1: %.2f %s\\n", r1.Saldo, r1.Moeda)

	// Chamada unária 2: transferir.
	r2, err := cli.Transferir(ctx, &pb.TransferReq{
		Origem: "A-1", Destino: "A-2", Valor: 300,
	})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Transferência:", r2.Mensagem)
}
// Saída esperada:
// Saldo A-1: 1000.00 BRL
// Transferência: transferido`,
      },
      {
        lang: "go",
        code: `// Interceptor: middleware que loga toda chamada.
package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
)

func loggingInterceptor(
	ctx context.Context,
	req interface{},
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (interface{}, error) {
	inicio := time.Now()
	resp, err := handler(ctx, req)
	log.Printf("método=%s duração=%s erro=%v", info.FullMethod, time.Since(inicio), err)
	return resp, err
}

// Usar:
// s := grpc.NewServer(grpc.UnaryInterceptor(loggingInterceptor))`,
      },
    ],
    points: [
      "gRPC = HTTP/2 + Protobuf + stubs gerados em todas as linguagens populares.",
      "Sempre embuta UnimplementedXxxServer na sua struct para compat futura.",
      "Use context.WithTimeout no cliente — chamadas sem deadline ficam pra sempre.",
      "Idiomático: organize em proto/, pb/, internal/server/, cmd/server/, cmd/client/.",
      "grpc.WithTransportCredentials(insecure.NewCredentials()) só em dev; use TLS em prod.",
      "Interceptors são o equivalente a middleware no Express/Gin — uma cadeia de funções.",
      "Armadilha: esquecer 'reserved' em campos deletados do .proto pode corromper dados.",
      "Para expor REST por cima do gRPC, use grpc-ecosystem/grpc-gateway.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use 'grpcurl' (linha de comando) para testar serviços gRPC sem precisar escrever cliente. Ele é o curl do gRPC e suporta autodiscovery via reflection.",
      },
      {
        type: "warning",
        content: "Nunca rode gRPC sem TLS em produção. HTTP/2 não autenticado pelos roteadores é alvo fácil. Use credenciais TLS via grpc.WithTransportCredentials(credentials.NewTLS(...)).",
      },
      {
        type: "info",
        content: "gRPC tem ótima integração com observabilidade: opentelemetry-go-contrib instrumenta automaticamente todas as chamadas com traces, métricas e logs estruturados.",
      },
    ],
  },
  {
    slug: "grpc-streaming",
    section: "data-cli",
    title: "gRPC streaming: server, client e bidirecional",
    difficulty: "avancado",
    subtitle: "Quando uma chamada não basta: enviando e recebendo fluxos contínuos pela mesma conexão",
    intro: `Já vimos no capítulo anterior o gRPC unário, que é como REST: uma pergunta, uma resposta. Mas existem cenários onde isso não basta. Como você manda uma cotação de bolsa em tempo real para um cliente? Como envia 10 mil registros para um servidor sem fazer 10 mil HTTP POSTs? Como faz um chat onde mensagens vão e vêm na mesma conexão? Para isso existem os outros três modos: server-streaming, client-streaming e bidirecional.

Server-streaming é uma chamada que devolve vários valores. O cliente faz uma request, o servidor pode mandar quantas responses quiser pelo mesmo canal. Pense em uma busca de logs onde você quer receber linha por linha conforme aparecem, ou em uma assinatura de eventos de estoque. Em Python equivalente seria um generator HTTP; aqui o gRPC trata isso nativamente sobre HTTP/2.

Client-streaming é o oposto: o cliente envia uma sequência grande, o servidor responde uma única vez ao final. Caso clássico é upload de chunk de arquivo, ingestão de medições de IoT ou processamento em batch. O servidor recebe o stream, processa, e devolve o agregado.

Bidirecional é quando os dois lados mandam ao mesmo tempo, independentemente. O caso mais famoso é chat e telemetria de jogos. Em REST clássico isso é WebSocket; em gRPC é nativo e tipado. Idiomático em Go: combine cada modo com goroutines e channels — o stream do gRPC já implementa Send/Recv como métodos thread-safe, então você lê/escreve em goroutines separadas sem mutex.`,
    codes: [
      {
        lang: "bash",
        code: `# proto/eventos.proto — três tipos de streaming em um arquivo.
cat > proto/eventos.proto << 'EOF'
syntax = "proto3";

package eventos;
option go_package = "exemplo/eventos/pb;pb";

service Telemetria {
  rpc Cotacoes(SubscribeReq) returns (stream Cotacao);     // server-streaming
  rpc Upload(stream Chunk) returns (UploadResp);           // client-streaming
  rpc Chat(stream Mensagem) returns (stream Mensagem);     // bidirecional
}

message SubscribeReq { string ticker = 1; }
message Cotacao      { string ticker = 1; double preco = 2; int64 ts = 3; }

message Chunk        { bytes dados = 1; }
message UploadResp   { int64 total_bytes = 1; }

message Mensagem     { string usuario = 1; string texto = 2; }
EOF

protoc --go_out=. --go_opt=paths=source_relative \\
       --go-grpc_out=. --go-grpc_opt=paths=source_relative \\
       proto/eventos.proto`,
      },
      {
        lang: "go",
        code: `// Server-streaming: envia uma cotação por segundo até o cliente desistir.
package server

import (
	"math/rand"
	"time"

	"exemplo/eventos/pb"
)

type Tele struct {
	pb.UnimplementedTelemetriaServer
}

func (t *Tele) Cotacoes(req *pb.SubscribeReq, stream pb.Telemetria_CotacoesServer) error {
	for i := 0; i < 10; i++ {
		select {
		case <-stream.Context().Done():
			return nil // cliente fechou
		default:
		}
		c := &pb.Cotacao{
			Ticker: req.Ticker,
			Preco:  100 + rand.Float64()*10,
			Ts:     time.Now().Unix(),
		}
		if err := stream.Send(c); err != nil {
			return err
		}
		time.Sleep(time.Second)
	}
	return nil
}`,
      },
      {
        lang: "go",
        code: `// Cliente do server-streaming: recebe cotações em loop.
package main

import (
	"context"
	"fmt"
	"io"
	"log"

	"exemplo/eventos/pb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, _ := grpc.NewClient("localhost:50051",
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	defer conn.Close()
	cli := pb.NewTelemetriaClient(conn)

	stream, err := cli.Cotacoes(context.Background(), &pb.SubscribeReq{Ticker: "PETR4"})
	if err != nil {
		log.Fatal(err)
	}
	for {
		c, err := stream.Recv()
		if err == io.EOF {
			break // servidor fechou normalmente
		}
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s: R$ %.2f\\n", c.Ticker, c.Preco)
	}
}`,
      },
      {
        lang: "go",
        code: `// Client-streaming: cliente manda chunks, servidor soma e responde 1 vez.
package server

import (
	"io"

	"exemplo/eventos/pb"
)

func (t *Tele) Upload(stream pb.Telemetria_UploadServer) error {
	var total int64
	for {
		ch, err := stream.Recv()
		if err == io.EOF {
			// Cliente terminou de mandar; devolve o agregado.
			return stream.SendAndClose(&pb.UploadResp{TotalBytes: total})
		}
		if err != nil {
			return err
		}
		total += int64(len(ch.Dados))
	}
}

// No cliente:
// stream, _ := cli.Upload(ctx)
// for _, parte := range partes {
//   stream.Send(&pb.Chunk{Dados: parte})
// }
// resp, _ := stream.CloseAndRecv()
// fmt.Println("Total:", resp.TotalBytes)`,
      },
      {
        lang: "go",
        code: `// Bidirecional: chat — duas goroutines, uma lê do servidor, outra envia.
package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"exemplo/eventos/pb"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, _ := grpc.NewClient("localhost:50051",
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	defer conn.Close()
	cli := pb.NewTelemetriaClient(conn)
	stream, _ := cli.Chat(context.Background())

	// Goroutine 1: recebe e imprime.
	go func() {
		for {
			m, err := stream.Recv()
			if err == io.EOF {
				return
			}
			if err != nil {
				log.Println("recv:", err)
				return
			}
			fmt.Printf("\\n[%s] %s\\n> ", m.Usuario, m.Texto)
		}
	}()

	// Goroutine principal: lê stdin e envia.
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Print("> ")
	for scanner.Scan() {
		stream.Send(&pb.Mensagem{Usuario: "eu", Texto: scanner.Text()})
		fmt.Print("> ")
	}
	stream.CloseSend()
}`,
      },
      {
        lang: "go",
        code: `// Lado servidor do chat bidirecional: ecoa para todos.
package server

import (
	"io"
	"sync"

	"exemplo/eventos/pb"
)

type Chat struct {
	pb.UnimplementedTelemetriaServer
	mu    sync.Mutex
	conns []pb.Telemetria_ChatServer
}

func (c *Chat) Chat(stream pb.Telemetria_ChatServer) error {
	c.mu.Lock()
	c.conns = append(c.conns, stream)
	c.mu.Unlock()

	for {
		m, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		c.mu.Lock()
		for _, s := range c.conns {
			s.Send(m) // ecoa para todos
		}
		c.mu.Unlock()
	}
}`,
      },
    ],
    points: [
      "Use 'stream' antes do tipo no .proto para marcar streaming.",
      "Server-streaming devolve em loop; cliente faz Recv até io.EOF.",
      "Client-streaming usa SendAndClose no servidor e CloseAndRecv no cliente.",
      "Bidi exige goroutines separadas para Send e Recv (são thread-safe entre si).",
      "Idiomático: sempre cheque stream.Context().Done() para cancelar cedo.",
      "Armadilha: chamar Send concorrentemente da mesma goroutine não é seguro — serialize.",
      "Use deadlines com context.WithTimeout para não vazar streams parados.",
      "Para milhões de mensagens, considere batching (juntar várias em um Chunk maior).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Streams gRPC consomem uma goroutine por chamada no servidor. Sem limite, um cliente abusivo pode esgotar recursos. Use grpc-middleware/ratelimit ou tarpit explicitamente.",
      },
      {
        type: "info",
        content: "HTTP/2 multiplexa vários streams por conexão TCP. Você pode ter milhares de streams gRPC ativos sobre uma mesma conexão sem custo de handshake.",
      },
      {
        type: "tip",
        content: "Para chat e pub/sub em escala, em vez de implementar broadcast à mão, considere NATS ou Redis Streams como backend, com gRPC só na ponta com o cliente.",
      },
    ],
  },
  {
    slug: "ml-inference",
    section: "data-cli",
    title: "Inferência de ML em Go: ONNX runtime",
    difficulty: "avancado",
    subtitle: "Rodando modelos treinados em Python direto no seu serviço Go, sem Python no caminho",
    intro: `Treinar modelos de machine learning é trabalho de Python — quem disser o contrário está vendendo curso. PyTorch, TensorFlow, scikit-learn dominam essa fase, e nada vai mudar isso tão cedo. Mas inferência (rodar o modelo treinado para fazer previsões) é outra história. Em produção, você quer um binário pequeno, sem GIL, sem virtual env, sem Pip, sem 2 GB de dependências. É aí que Go brilha.

A ponte entre os dois mundos se chama ONNX (Open Neural Network Exchange). É um formato aberto que representa qualquer modelo treinado em uma das ferramentas populares (PyTorch, TensorFlow, scikit-learn) de uma forma neutra. Você exporta seu modelo de Python como .onnx, e em Go usa um binding como yalue/onnxruntime_go ou owulveryck/onnx-go para rodar a inferência.

A grande vantagem é deploy: seu serviço Go fica com 30 MB e roda em qualquer lugar, sem precisar empacotar um Python inteiro. Latência também melhora, já que você corta o overhead de RPC entre Go e um servidor Python externo. Para casos onde latência manda (fraud detection, real-time bidding, recomendação inline), é a escolha óbvia.

Esta seção cobre o caminho mais comum: ONNX runtime via CGO. Existe também tensorflow/go (binding oficial do TensorFlow) e gorgonia.org/gorgonia (puro Go, mas mais pra pesquisa). Para a maioria dos casos de inferência em produção, ONNX é o sweet spot: maduro, performático e suportado por todas as ferramentas relevantes.`,
    codes: [
      {
        lang: "bash",
        code: `# 1) No Python, exportar um modelo treinado para ONNX.
# pip install scikit-learn skl2onnx
# python:
#   from sklearn.ensemble import RandomForestClassifier
#   from skl2onnx import to_onnx
#   model = RandomForestClassifier().fit(X, y)
#   onx = to_onnx(model, X[:1].astype('float32'))
#   open('modelo.onnx','wb').write(onx.SerializeToString())

# 2) No Go, instalar binding ONNX runtime.
go get github.com/yalue/onnxruntime_go

# 3) Baixar a lib nativa do ONNX Runtime para sua plataforma.
# https://github.com/microsoft/onnxruntime/releases
# (libonnxruntime.so no Linux, .dylib no macOS, .dll no Windows)`,
      },
      {
        lang: "go",
        code: `// Carregando o modelo .onnx e fazendo uma inferência simples.
package main

import (
	"fmt"

	ort "github.com/yalue/onnxruntime_go"
)

func main() {
	// Aponta para a lib nativa do onnxruntime baixada antes.
	ort.SetSharedLibraryPath("/usr/local/lib/libonnxruntime.so")
	if err := ort.InitializeEnvironment(); err != nil {
		panic(err)
	}
	defer ort.DestroyEnvironment()

	// Cria tensor de entrada com shape [1, 4] (1 amostra, 4 features).
	entrada := []float32{5.1, 3.5, 1.4, 0.2} // ex: medida de uma flor (Iris)
	tensorIn, err := ort.NewTensor(ort.NewShape(1, 4), entrada)
	if err != nil {
		panic(err)
	}
	defer tensorIn.Destroy()

	// Tensor de saída: shape [1] (1 classe prevista).
	tensorOut, err := ort.NewEmptyTensor[int64](ort.NewShape(1))
	if err != nil {
		panic(err)
	}
	defer tensorOut.Destroy()

	// Cria a sessão a partir do arquivo do modelo.
	sess, err := ort.NewAdvancedSession(
		"modelo.onnx",
		[]string{"input"},   // nomes dos inputs no modelo
		[]string{"output"},  // nomes dos outputs
		[]ort.Value{tensorIn},
		[]ort.Value{tensorOut},
		nil,
	)
	if err != nil {
		panic(err)
	}
	defer sess.Destroy()

	if err := sess.Run(); err != nil {
		panic(err)
	}

	previsao := tensorOut.GetData()
	fmt.Printf("Classe prevista: %d\\n", previsao[0])
	// Exemplo: → Classe prevista: 0  (Iris setosa)
}`,
      },
      {
        lang: "go",
        code: `// Inferência batch: classificando muitas amostras de uma vez.
package main

import (
	"fmt"

	ort "github.com/yalue/onnxruntime_go"
)

func main() {
	ort.SetSharedLibraryPath("/usr/local/lib/libonnxruntime.so")
	ort.InitializeEnvironment()
	defer ort.DestroyEnvironment()

	// 3 amostras × 4 features.
	dados := []float32{
		5.1, 3.5, 1.4, 0.2,
		6.7, 3.0, 5.2, 2.3,
		5.9, 3.0, 4.2, 1.5,
	}
	in, _ := ort.NewTensor(ort.NewShape(3, 4), dados)
	defer in.Destroy()

	out, _ := ort.NewEmptyTensor[int64](ort.NewShape(3))
	defer out.Destroy()

	sess, _ := ort.NewAdvancedSession("modelo.onnx",
		[]string{"input"}, []string{"output"},
		[]ort.Value{in}, []ort.Value{out}, nil)
	defer sess.Destroy()

	sess.Run()
	for i, c := range out.GetData() {
		fmt.Printf("Amostra %d → classe %d\\n", i, c)
	}
}`,
      },
      {
        lang: "go",
        code: `// Servidor HTTP que expõe predição como API JSON.
package main

import (
	"encoding/json"
	"net/http"

	ort "github.com/yalue/onnxruntime_go"
)

type Pedido struct {
	Features []float32 \`json:"features"\`
}
type Resposta struct {
	Classe int64 \`json:"classe"\`
}

var sessao *ort.AdvancedSession

func init() {
	ort.SetSharedLibraryPath("/usr/local/lib/libonnxruntime.so")
	ort.InitializeEnvironment()
	// Sessão é cara de criar — abra UMA vez no init e reutilize.
}

func handler(w http.ResponseWriter, r *http.Request) {
	var p Pedido
	json.NewDecoder(r.Body).Decode(&p)

	in, _ := ort.NewTensor(ort.NewShape(1, int64(len(p.Features))), p.Features)
	defer in.Destroy()
	out, _ := ort.NewEmptyTensor[int64](ort.NewShape(1))
	defer out.Destroy()

	sess, _ := ort.NewAdvancedSession("modelo.onnx",
		[]string{"input"}, []string{"output"},
		[]ort.Value{in}, []ort.Value{out}, nil)
	defer sess.Destroy()
	sess.Run()

	json.NewEncoder(w).Encode(Resposta{Classe: out.GetData()[0]})
}

func main() {
	http.HandleFunc("/predict", handler)
	http.ListenAndServe(":8080", nil)
}`,
      },
    ],
    points: [
      "Treine em Python, exporte para .onnx e rode em Go — sem Python no runtime.",
      "ONNX runtime exige a lib nativa C++ instalada no sistema (apt, brew, manual).",
      "Sempre destrua tensores e sessões com defer .Destroy() — são alocados em C.",
      "Sessões são caras: crie uma vez, reuse para milhares de inferências.",
      "Idiomático: encapsule a sessão atrás de uma interface Predictor para testabilidade.",
      "Para imagens, pré-processe (resize, normalize) antes de criar o tensor.",
      "Armadilha: shape errado (esperava [1,4] e mandou [4]) crasha a inferência.",
      "Para deploy em Lambda/Cloud Run, empacote a libonnxruntime no container.",
    ],
    alerts: [
      {
        type: "info",
        content: "ONNX é mantido por uma fundação aberta (Linux Foundation) com participação da Microsoft, Facebook, IBM e outros. É o formato mais portável que existe hoje no mundo de ML.",
      },
      {
        type: "warning",
        content: "Inferência em CPU é OK para modelos clássicos (random forest, regressão). Para modelos transformer grandes (BERT, LLMs pequenos), você quer GPU — habilite o execution provider CUDA do ONNX runtime.",
      },
      {
        type: "tip",
        content: "Se o seu modelo é uma rede grande tipo LLM, considere chamar um serviço dedicado (Triton Inference Server, vLLM) via gRPC em vez de embutir no seu binário. Separação de preocupações.",
      },
    ],
  },
  {
    slug: "pdf-go",
    section: "data-cli",
    title: "Gerando PDFs em Go com gofpdf",
    difficulty: "intermediario",
    subtitle: "Criando relatórios, recibos e contratos PDF nativamente, sem dependência de wkhtmltopdf",
    intro: `Em algum momento da sua carreira você vai precisar gerar PDF: nota fiscal, recibo, contrato, relatório mensal. A solução fácil em outras linguagens é renderizar HTML e converter com headless browser (Puppeteer/Chromium), mas isso traz Chrome inteiro como dependência — pesado, lento e arriscado para deploy em containers pequenos.

Em Go, a abordagem mais leve é gerar o PDF diretamente usando uma biblioteca nativa. As duas mais populares são jung-kurt/gofpdf (port do venerável FPDF do PHP, totalmente em Go puro, sem CGO) e unidoc/unipdf (mais poderosa, com suporte a leitura/edição de PDFs existentes, mas paga para uso comercial). Para 95 por cento dos casos de geração simples, gofpdf é mais que suficiente e zero-dependência.

A API do gofpdf é imperativa: você cria uma página, posiciona o cursor, escreve texto, desenha linhas, insere imagens. É verboso, mas previsível. Nada de magia de layout, nada de CSS — você manda nas coordenadas. Para layouts mais complexos, você compõe funções helper (Cabecalho(), Rodape(), Tabela()) que centralizam o desenho.

Idiomático em Go quando gerar PDF: encapsule a geração em uma função que recebe um io.Writer como destino. Assim você pode salvar em arquivo, mandar pelo HTTP ou jogar em um upload S3 sem mudar nada. Para documentos com layout muito complexo (jornal, livro), considere ferramentas externas; para tudo de back-office, gofpdf é o cavalo de batalha.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalação.
go get github.com/jung-kurt/gofpdf`,
      },
      {
        lang: "go",
        code: `// Recibo simples: cabeçalho, dados, rodapé.
package main

import (
	"github.com/jung-kurt/gofpdf"
)

func main() {
	pdf := gofpdf.New("P", "mm", "A4", "") // P=portrait, A4
	pdf.AddPage()

	// Cabeçalho.
	pdf.SetFont("Arial", "B", 18)
	pdf.Cell(0, 12, "Recibo de Pagamento")
	pdf.Ln(15) // pula 15mm

	// Corpo.
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(0, 8, "Recebi de: Maria Silva")
	pdf.Ln(8)
	pdf.Cell(0, 8, "Valor: R$ 1.500,00")
	pdf.Ln(8)
	pdf.Cell(0, 8, "Referente a: aluguel de janeiro/2025")
	pdf.Ln(20)

	// Rodapé manual.
	pdf.SetFont("Arial", "I", 10)
	pdf.Cell(0, 8, "São Paulo, 5 de janeiro de 2025")
	pdf.Ln(15)
	pdf.Cell(0, 8, "_______________________________")
	pdf.Ln(5)
	pdf.Cell(0, 8, "João Souza")

	if err := pdf.OutputFileAndClose("recibo.pdf"); err != nil {
		panic(err)
	}
}`,
      },
      {
        lang: "go",
        code: `// Tabela de pedidos com linhas alternadas.
package main

import (
	"fmt"

	"github.com/jung-kurt/gofpdf"
)

type Pedido struct {
	ID    string
	Cli   string
	Total float64
}

func main() {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(0, 10, "Relatório de Pedidos - Janeiro/2025")
	pdf.Ln(15)

	// Cabeçalho da tabela.
	pdf.SetFillColor(50, 50, 50)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(40, 8, "ID", "1", 0, "C", true, 0, "")
	pdf.CellFormat(80, 8, "Cliente", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Total (R$)", "1", 0, "C", true, 0, "")
	pdf.Ln(-1)

	// Linhas.
	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Arial", "", 10)
	pedidos := []Pedido{
		{"P-101", "Maria Silva", 159.90},
		{"P-102", "João Souza", 49.50},
		{"P-103", "Ana Costa", 299.00},
	}

	zebra := false
	for _, p := range pedidos {
		if zebra {
			pdf.SetFillColor(240, 240, 240)
		} else {
			pdf.SetFillColor(255, 255, 255)
		}
		pdf.CellFormat(40, 7, p.ID, "1", 0, "C", true, 0, "")
		pdf.CellFormat(80, 7, p.Cli, "1", 0, "L", true, 0, "")
		pdf.CellFormat(40, 7, fmt.Sprintf("%.2f", p.Total), "1", 0, "R", true, 0, "")
		pdf.Ln(-1)
		zebra = !zebra
	}

	pdf.OutputFileAndClose("pedidos.pdf")
}`,
      },
      {
        lang: "go",
        code: `// Servir PDF por HTTP, sem tocar disco.
package main

import (
	"net/http"

	"github.com/jung-kurt/gofpdf"
)

func handler(w http.ResponseWriter, r *http.Request) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "PDF gerado em runtime")

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", \`inline; filename="exemplo.pdf"\`)

	// Output recebe um io.Writer — o ResponseWriter implementa essa interface.
	pdf.Output(w)
}

func main() {
	http.HandleFunc("/exemplo.pdf", handler)
	http.ListenAndServe(":8080", nil)
}`,
      },
      {
        lang: "go",
        code: `// Imagem + auto-página: nota fiscal com logo no topo.
package main

import "github.com/jung-kurt/gofpdf"

func main() {
	pdf := gofpdf.New("P", "mm", "A4", "")
	// Função de cabeçalho chamada automaticamente em cada AddPage.
	pdf.SetHeaderFunc(func() {
		pdf.Image("logo.png", 10, 10, 30, 0, false, "", 0, "")
		pdf.SetFont("Arial", "B", 14)
		pdf.SetXY(50, 15)
		pdf.Cell(0, 10, "Loja XPTO LTDA")
		pdf.Ln(20)
	})
	pdf.SetFooterFunc(func() {
		pdf.SetY(-15)
		pdf.SetFont("Arial", "I", 8)
		pdf.CellFormat(0, 10, fmt.Sprintf("Página %d", pdf.PageNo()),
			"", 0, "C", false, 0, "")
	})

	pdf.AddPage()
	pdf.SetFont("Arial", "", 11)
	for i := 0; i < 50; i++ {
		pdf.Cell(0, 8, "Item número "+fmt.Sprintf("%d", i+1))
		pdf.Ln(6)
	}
	// SetAutoPageBreak está ativo por padrão: novas páginas surgem sozinhas.
	pdf.OutputFileAndClose("nota.pdf")
}

// Lembre de importar "fmt" no topo.`,
      },
    ],
    points: [
      "gofpdf é Go puro: nenhuma dependência de Chrome, sem CGO, deploy fácil.",
      "Coordenadas em mm a partir do canto superior esquerdo.",
      "SetHeaderFunc/SetFooterFunc rodam automaticamente em cada nova página.",
      "Output(io.Writer) permite servir HTTP, gravar S3 ou salvar disco com a mesma função.",
      "Idiomático: encapsule geração em uma função pura(dados) (*bytes.Buffer, error).",
      "CellFormat aceita borda, alinhamento, preenchimento e link em uma chamada só.",
      "Armadilha: usar fontes não embutidas (Calibri) faz o PDF não abrir em alguns leitores.",
      "Para acentuação e UTF-8, use AddUTF8Font ou bibliotecas como wcharczuk/go-chart para gráficos.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para PDFs muito complexos (newsletters, brochuras), considere gerar HTML+CSS e converter via Chromium headless externo (chromedp) — mas só quando layout exigir.",
      },
      {
        type: "warning",
        content: "jung-kurt/gofpdf não recebe atualizações grandes desde 2019, mas é estável. Para projetos novos com necessidades modernas (tabelas complexas), avalie phpdave11/gofpdf2 ou unidoc.",
      },
      {
        type: "info",
        content: "PDF assinado digitalmente (ICP-Brasil para nota fiscal eletrônica) exige libs específicas como github.com/digitorus/pdf — gofpdf sozinho não assina.",
      },
    ],
  },
  {
    slug: "templates-text",
    section: "data-cli",
    title: "text/template: gerando texto e código a partir de dados",
    difficulty: "intermediario",
    subtitle: "O motor de templates do stdlib que serve para e-mails, configs, código gerado e muito mais",
    intro: `Templates não são só para páginas web. Toda vez que você precisa montar um texto a partir de dados (e-mail de boas-vindas, config gerada por scaffolding, query SQL parametrizada, arquivo .env do ambiente), está fazendo geração de texto. Em Go, o pacote text/template do stdlib resolve isso elegantemente, sem dependências externas.

A grande diferença entre text/template (que vamos ver aqui) e html/template é que o segundo escapa automaticamente caracteres HTML para evitar XSS. Para gerar HTML, sempre use html/template. Para gerar qualquer outro texto (e-mail plain, YAML, código Go, scripts shell), text/template é o caminho. As APIs são quase idênticas, então o conhecimento se transfere.

A sintaxe usa chaves duplas {{ }} para inserir valores e estruturas de controle. Tem condicional ({{ if }}), loop ({{ range }}), funções ({{ printf "%.2f" .Total }}) e blocos reutilizáveis ({{ define }}). É menos poderoso que Jinja2 (Python) ou Liquid (Ruby), mas suficiente para a maioria dos casos e blindado contra execução arbitrária — você não consegue rodar código Go dentro do template.

Idiomático em Go: parseie templates uma vez no startup do programa (usando template.Must), guarde o *template.Template em uma var de pacote, e chame Execute em cada uso. Para muitos templates relacionados, use ParseGlob e organize tudo em um diretório templates/. Para templates embutidos no binário (deploy de single-file), use embed.FS — saber isso te dá um superpoder de distribuição.`,
    codes: [
      {
        lang: "go",
        code: `// E-mail de boas-vindas: template inline com variáveis.
package main

import (
	"os"
	"text/template"
)

type Usuario struct {
	Nome  string
	Email string
	Plano string
}

func main() {
	const tmpl = \`Olá, {{.Nome}}!

Sua conta foi criada com sucesso.
- E-mail: {{.Email}}
- Plano: {{.Plano}}

Bem-vindo ao Loja XPTO!
Equipe de Atendimento\`

	t := template.Must(template.New("welcome").Parse(tmpl))
	u := Usuario{Nome: "Maria", Email: "maria@exemplo.com", Plano: "Premium"}
	t.Execute(os.Stdout, u)
}
// Saída:
// Olá, Maria!
//
// Sua conta foi criada com sucesso.
// - E-mail: maria@exemplo.com
// - Plano: Premium
// ...`,
      },
      {
        lang: "go",
        code: `// Range, if e funções: relatório de pedidos formatado.
package main

import (
	"os"
	"text/template"
)

type Pedido struct {
	ID    string
	Cli   string
	Total float64
	Pago  bool
}

func main() {
	const tmpl = \`Relatório de pedidos:
{{range .}}
[{{if .Pago}}PAGO{{else}}PENDENTE{{end}}] {{.ID}} - {{.Cli}} - R$ {{printf "%.2f" .Total}}{{end}}

Total de pedidos: {{len .}}\`

	t := template.Must(template.New("rel").Parse(tmpl))
	pedidos := []Pedido{
		{"P-101", "Maria", 159.90, true},
		{"P-102", "João", 49.50, false},
		{"P-103", "Ana", 299.00, true},
	}
	t.Execute(os.Stdout, pedidos)
}
// Saída:
// Relatório de pedidos:
//
// [PAGO] P-101 - Maria - R$ 159.90
// [PENDENTE] P-102 - João - R$ 49.50
// [PAGO] P-103 - Ana - R$ 299.00
//
// Total de pedidos: 3`,
      },
      {
        lang: "go",
        code: `// Funções customizadas: deixar nomes em maiúscula, formatar data BR.
package main

import (
	"os"
	"strings"
	"text/template"
	"time"
)

func main() {
	funcs := template.FuncMap{
		"upper": strings.ToUpper,
		"dataBR": func(t time.Time) string {
			return t.Format("02/01/2006")
		},
	}

	const tmpl = \`Cliente: {{upper .Nome}}
Cadastrado em: {{dataBR .Quando}}\`

	t := template.Must(
		template.New("c").Funcs(funcs).Parse(tmpl),
	)
	t.Execute(os.Stdout, struct {
		Nome   string
		Quando time.Time
	}{"maria silva", time.Date(2025, 1, 5, 0, 0, 0, 0, time.Local)})
}
// Saída:
// Cliente: MARIA SILVA
// Cadastrado em: 05/01/2025`,
      },
      {
        lang: "go",
        code: `// Embutindo arquivos de template no binário com embed.
package main

import (
	"embed"
	"os"
	"text/template"
)

//go:embed templates/*.tmpl
var tplFS embed.FS

type Dados struct {
	Cliente string
	Total   float64
}

func main() {
	t := template.Must(template.ParseFS(tplFS, "templates/*.tmpl"))
	t.ExecuteTemplate(os.Stdout, "fatura.tmpl", Dados{
		Cliente: "Ana", Total: 1250.00,
	})
}

// Estrutura no disco:
// templates/
//   fatura.tmpl  → "Fatura para {{.Cliente}} - R$ {{printf \\"%.2f\\" .Total}}"
//
// Após go build, o binário contém os templates dentro — deploy de 1 arquivo.`,
      },
      {
        lang: "go",
        code: `// Gerar arquivo Go a partir de schema (uso clássico em geradores de código).
package main

import (
	"os"
	"text/template"
)

type Campo struct {
	Nome string
	Tipo string
}
type Modelo struct {
	Nome   string
	Campos []Campo
}

func main() {
	const tmpl = \`package modelo

type {{.Nome}} struct {
{{range .Campos}}	{{.Nome}} {{.Tipo}}
{{end}}}\`

	t := template.Must(template.New("model").Parse(tmpl))
	m := Modelo{
		Nome: "Cliente",
		Campos: []Campo{
			{"ID", "int"},
			{"Nome", "string"},
			{"Email", "string"},
		},
	}
	f, _ := os.Create("cliente_gen.go")
	defer f.Close()
	t.Execute(f, m)
}
// cliente_gen.go vai conter:
// package modelo
//
// type Cliente struct {
// 	ID int
// 	Nome string
// 	Email string
// }`,
      },
    ],
    points: [
      "text/template para texto puro; html/template (mesma API) escapa HTML automaticamente.",
      "{{.Campo}} acessa campo da struct passada para Execute.",
      "{{range .Lista}}...{{end}} itera; dentro do bloco . muda para o item atual.",
      "FuncMap registra funções customizadas chamáveis no template (formatadores, helpers).",
      "Idiomático: parse com template.Must no init, execute em runtime.",
      "embed.FS + ParseFS embute templates no binário — deploy single-file.",
      "Armadilha: usar text/template para gerar HTML é vetor de XSS; sempre html/template aí.",
      "Para templates complexos com herança, separe em arquivos e use {{define}} + {{block}}.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Nunca passe input do usuário direto como template para Parse. Quem controla o template controla a saída — isso vira vulnerabilidade SSTI (server-side template injection).",
      },
      {
        type: "tip",
        content: "Combine text/template com Cobra para criar geradores de scaffolding estilo 'rails new' — você gera projeto inteiro a partir de poucos arquivos .tmpl.",
      },
      {
        type: "info",
        content: "O Hugo (gerador de site estático em Go) é construído em cima de html/template estendido. Aprender o template engine do Go te abre toda a customização do Hugo.",
      },
    ],
  },
];
