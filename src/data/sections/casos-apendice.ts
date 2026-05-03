import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "projeto-cli-todo",
    section: "casos-apendice",
    title: "Projeto: CLI de tarefas com Cobra",
    difficulty: "intermediario",
    subtitle: "Construindo um gerenciador de tarefas no terminal usando Cobra e persistência em JSON",
    intro: `Quase todo desenvolvedor já sonhou em ter sua própria ferramenta de linha de comando. O bonito do Go é que, diferente de Python (que precisa de interpretador) ou Java (que precisa da JVM), o resultado final é um único binário que roda em qualquer Linux, macOS ou Windows sem dependências. É por isso que ferramentas como kubectl, terraform, docker e o próprio compilador do Go são escritos em Go.

Neste capítulo você vai construir um clone enxuto do clássico "todo" no terminal. Vamos usar a biblioteca Cobra (a mesma que dá vida ao kubectl), que cuida do parsing de subcomandos, flags e geração de help automático. Para guardar as tarefas, vamos usar um arquivo JSON dentro do diretório do usuário. Não é banco de dados, mas para uma ferramenta pessoal serve perfeitamente, é portátil e fácil de inspecionar com um cat.

Antes de cair no código, pense no design. Um bom CLI segue o estilo Unix: faz uma coisa só, lê argumentos previsíveis, retorna códigos de saída coerentes (0 para sucesso, diferente de 0 para erro) e escreve em stderr quando algo dá errado. Não polua a stdout com mensagens de log: a saída padrão deve ser apenas o resultado útil, para que outros programas possam consumir via pipe. Isso é idiomático em Go e em qualquer ferramenta de terminal séria.

O fluxo geral é: 'todo add "comprar pão"' adiciona, 'todo list' mostra, 'todo done 3' marca como concluída, 'todo rm 3' remove. Cada subcomando é um arquivo na pasta cmd/, registrado no comando raiz. Esse padrão escala muito bem: você começa com 4 comandos e em pouco tempo tem uma ferramenta com dezenas, sem virar bagunça.`,
    codes: [
      {
        lang: "bash",
        code: `# Crie o módulo e instale as dependências.
mkdir todo && cd todo
go mod init exemplo/todo
go get github.com/spf13/cobra@latest
# Estrutura mínima do projeto:
# todo/
#   main.go
#   cmd/root.go
#   cmd/add.go
#   cmd/list.go
#   internal/store/store.go`,
      },
      {
        lang: "go",
        code: `// internal/store/store.go - persistência das tarefas em JSON.
package store

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

// Task representa uma tarefa do usuário.
type Task struct {
	ID        int       ` + "`json:\"id\"`" + `
	Title     string    ` + "`json:\"title\"`" + `
	Done      bool      ` + "`json:\"done\"`" + `
	CreatedAt time.Time ` + "`json:\"created_at\"`" + `
}

// caminho para ~/.todo.json (cada usuário tem o seu)
func dbPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".todo.json"), nil
}

func Load() ([]Task, error) {
	path, err := dbPath()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return []Task{}, nil // primeira execução: lista vazia
	}
	if err != nil {
		return nil, err
	}
	var tasks []Task
	return tasks, json.Unmarshal(data, &tasks)
}

func Save(tasks []Task) error {
	path, err := dbPath()
	if err != nil {
		return err
	}
	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return err
	}
	// 0600: só o dono lê e escreve. Boa prática para arquivos pessoais.
	return os.WriteFile(path, data, 0600)
}`,
      },
      {
        lang: "go",
        code: `// cmd/root.go - comando raiz do CLI.
package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "todo",
	Short: "Gerenciador de tarefas no terminal",
	Long:  "Um CLI simples para anotar, listar e concluir tarefas do dia.",
}

// Execute é chamado pelo main.go.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}`,
      },
      {
        lang: "go",
        code: `// cmd/add.go - subcomando "todo add".
package cmd

import (
	"fmt"
	"strings"
	"time"

	"exemplo/todo/internal/store"
	"github.com/spf13/cobra"
)

var addCmd = &cobra.Command{
	Use:   "add [texto]",
	Short: "Adiciona uma nova tarefa",
	Args:  cobra.MinimumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		tasks, err := store.Load()
		if err != nil {
			return err
		}
		// próximo ID = maior atual + 1
		next := 1
		for _, t := range tasks {
			if t.ID >= next {
				next = t.ID + 1
			}
		}
		tasks = append(tasks, store.Task{
			ID:        next,
			Title:     strings.Join(args, " "),
			CreatedAt: time.Now(),
		})
		if err := store.Save(tasks); err != nil {
			return err
		}
		fmt.Printf("Tarefa #%d adicionada.\n", next)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(addCmd)
}`,
      },
      {
        lang: "go",
        code: `// cmd/list.go - subcomando "todo list".
package cmd

import (
	"fmt"

	"exemplo/todo/internal/store"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "Lista todas as tarefas",
	RunE: func(cmd *cobra.Command, args []string) error {
		tasks, err := store.Load()
		if err != nil {
			return err
		}
		if len(tasks) == 0 {
			fmt.Println("Nenhuma tarefa. Use 'todo add ...' para começar.")
			return nil
		}
		for _, t := range tasks {
			marca := "[ ]"
			if t.Done {
				marca = "[x]"
			}
			fmt.Printf("%s #%d  %s\n", marca, t.ID, t.Title)
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}`,
      },
      {
        lang: "go",
        code: `// main.go - ponto de entrada.
package main

import "exemplo/todo/cmd"

func main() {
	cmd.Execute()
}
// Compile e use:
// go build -o todo .
// ./todo add "estudar Go"
// ./todo list
// → [ ] #1  estudar Go`,
      },
    ],
    points: [
      "Cobra é o padrão de fato para CLIs em Go (kubectl, hugo, gh usam ela).",
      "Um arquivo JSON é suficiente para ferramentas pessoais; só vá para SQLite quando precisar de buscas complexas.",
      "Use os.UserHomeDir para guardar config, nunca o diretório atual.",
      "Idiomático: comandos retornam RunE com error em vez de chamar os.Exit dentro do handler.",
      "Sempre escreva mensagens de erro em stderr e o resultado útil em stdout (permite uso em pipes).",
      "Armadilha: salvar arquivo com 0644 e expor tarefas a outros usuários do sistema; prefira 0600.",
      "Use cobra.MinimumNArgs e tipos de Args para validar entrada antes de tocar no disco.",
      "Compile com 'go build -o todo .' e copie o binário para ~/bin para usar de qualquer pasta.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Rode 'cobra-cli init' (depois de instalar github.com/spf13/cobra-cli) para gerar o esqueleto do projeto automaticamente. Economiza minutos e segue exatamente o layout que o time do Cobra recomenda.",
      },
      {
        type: "warning",
        content: "Cuidado com concorrência se um dia quiser rodar dois comandos ao mesmo tempo. JSON em arquivo único não tem trava: dois processos escrevendo simultaneamente podem corromper o arquivo. Para isso existe SQLite.",
      },
      {
        type: "info",
        content: "O time do Kubernetes usa Cobra justamente porque o padrão de subcomandos escala bem. kubectl tem mais de cem subcomandos organizados de forma muito parecida com o que você está construindo aqui.",
      },
    ],
  },
  {
    slug: "projeto-api-rest",
    section: "casos-apendice",
    title: "Projeto: API REST com chi e PostgreSQL",
    difficulty: "intermediario",
    subtitle: "Uma API de pedidos com roteador chi, banco PostgreSQL via pgx e middleware de logging",
    intro: `APIs REST são o pão com manteiga do back-end moderno, e Go é uma escolha excelente para elas. Diferente de Node.js, onde um único loop de eventos serve todas as requisições, em Go cada request roda em sua própria goroutine, tirando proveito de todos os núcleos da máquina. Diferente de Java com Spring, você não precisa de cinco arquivos de XML e um servidor de aplicação para subir um endpoint.

Neste projeto você vai montar uma API de pedidos: criar pedido, listar pedidos, buscar por ID. O roteador é o chi, um irmão mais leve do gorilla/mux que segue exatamente o contrato net/http da biblioteca padrão. Isso significa que qualquer middleware genérico do ecossistema funciona, e você pode trocar o chi por outro roteador no futuro sem reescrever os handlers.

O banco é PostgreSQL acessado via pgx (driver moderno e mais rápido que o database/sql tradicional). Não vamos usar ORM. ORMs em Go costumam pesar mais do que ajudar; SQL puro com prepared statements é claro, rápido e confere bem com a expectativa idiomática do Go de "código óbvio é melhor que código mágico".

Por fim, a estrutura segue um padrão prático: pacote handlers para HTTP, pacote store para banco, pacote model para os tipos compartilhados. Não é Clean Architecture com mil camadas, mas é organizado o suficiente para um time pequeno crescer sem dor.`,
    codes: [
      {
        lang: "bash",
        code: `# Setup do projeto.
mkdir orders-api && cd orders-api
go mod init exemplo/orders
go get github.com/go-chi/chi/v5
go get github.com/jackc/pgx/v5/pgxpool

# Suba um Postgres rápido com Docker para testar:
docker run -d --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16`,
      },
      {
        lang: "sql",
        code: `-- migrations/001_init.sql
CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    customer    TEXT NOT NULL,
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Índice para listagem ordenada por data (consulta mais comum).
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);`,
      },
      {
        lang: "go",
        code: `// internal/store/store.go - acesso ao banco com pgx.
package store

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Order struct {
	ID         int64
	Customer   string
	TotalCents int64
	CreatedAt  time.Time
}

type Store struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

// Create insere um pedido e devolve o ID gerado pelo Postgres.
func (s *Store) Create(ctx context.Context, customer string, total int64) (Order, error) {
	row := s.pool.QueryRow(ctx,
		` + "`INSERT INTO orders (customer, total_cents) VALUES ($1, $2) RETURNING id, created_at`" + `,
		customer, total,
	)
	var o Order
	o.Customer = customer
	o.TotalCents = total
	if err := row.Scan(&o.ID, &o.CreatedAt); err != nil {
		return Order{}, err
	}
	return o, nil
}

// List devolve os últimos n pedidos.
func (s *Store) List(ctx context.Context, n int) ([]Order, error) {
	rows, err := s.pool.Query(ctx,
		` + "`SELECT id, customer, total_cents, created_at FROM orders ORDER BY created_at DESC LIMIT $1`" + `,
		n,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close() // sempre fechar Rows para devolver a conexão ao pool
	var out []Order
	for rows.Next() {
		var o Order
		if err := rows.Scan(&o.ID, &o.Customer, &o.TotalCents, &o.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}`,
      },
      {
        lang: "go",
        code: `// internal/handlers/orders.go - handlers HTTP.
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"exemplo/orders/internal/store"
	"github.com/go-chi/chi/v5"
)

type Orders struct {
	Store *store.Store
}

type createReq struct {
	Customer   string ` + "`json:\"customer\"`" + `
	TotalCents int64  ` + "`json:\"total_cents\"`" + `
}

func (h *Orders) Create(w http.ResponseWriter, r *http.Request) {
	var req createReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if req.Customer == "" || req.TotalCents <= 0 {
		http.Error(w, "customer e total_cents são obrigatórios", http.StatusUnprocessableEntity)
		return
	}
	o, err := h.Store.Create(r.Context(), req.Customer, req.TotalCents)
	if err != nil {
		http.Error(w, "erro ao salvar", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(o)
}

func (h *Orders) List(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(chi.URLParam(r, "limit"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	orders, err := h.Store.List(r.Context(), limit)
	if err != nil {
		http.Error(w, "erro ao listar", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}`,
      },
      {
        lang: "go",
        code: `// main.go - amarra tudo.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"exemplo/orders/internal/handlers"
	"exemplo/orders/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:secret@localhost:5432/postgres?sslmode=disable"
	}
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	h := &handlers.Orders{Store: store.New(pool)}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // captura panics e devolve 500
	r.Use(middleware.Timeout(10 * time.Second))

	r.Post("/orders", h.Create)
	r.Get("/orders/{limit}", h.List)

	log.Println("servindo em :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}`,
      },
      {
        lang: "bash",
        code: `# Teste rápido com curl.
curl -X POST http://localhost:8080/orders \\
  -H "Content-Type: application/json" \\
  -d '{"customer":"Maria","total_cents":12990}'
# → {"ID":1,"Customer":"Maria","TotalCents":12990,"CreatedAt":"2024-..."}

curl http://localhost:8080/orders/10
# → [{"ID":1,...}]`,
      },
    ],
    points: [
      "chi segue o contrato net/http: handlers são funções (w, r), nada de mágica.",
      "pgxpool gerencia conexões automaticamente — não abra/feche conexão por request.",
      "Sempre passe r.Context() para queries: assim a query é cancelada se o cliente desistir.",
      "Idiomático: validar entrada antes de tocar no banco e retornar 422 para dados inválidos.",
      "Use prepared statements ($1, $2) — pgx faz isso por padrão e evita SQL injection.",
      "Armadilha: esquecer rows.Close(); o pool acaba sem conexões disponíveis em produção.",
      "middleware.Recoverer salva sua API se um handler causar panic; nunca rode sem ele.",
      "Para migrations sérias, use golang-migrate ou goose em vez de aplicar SQL manualmente.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Configure o tamanho máximo do pool com pgxpool.Config().MaxConns. Em apps com tráfego alto, deixar o padrão (4) é o suficiente para virar gargalo invisível.",
      },
      {
        type: "warning",
        content: "Não use fmt.Sprintf para montar SQL com valores do usuário. SEMPRE use placeholders $1, $2. SQL injection continua sendo a vulnerabilidade número 1 da OWASP por uma razão.",
      },
      {
        type: "success",
        content: "Esse mesmo template (chi + pgx + middleware) é a base de muitas APIs sérias em produção, inclusive em fintechs brasileiras. É código boring no melhor sentido.",
      },
      {
        type: "info",
        content: "Se o seu projeto cresce e ORM começa a parecer tentador, olhe o sqlc antes: ele gera código Go a partir do SQL que você escreve. Você mantém SQL puro e ganha tipagem forte.",
      },
    ],
  },
  {
    slug: "projeto-bot-discord",
    section: "casos-apendice",
    title: "Projeto: bot do Discord com discordgo",
    difficulty: "intermediario",
    subtitle: "Construindo um bot que responde comandos no Discord usando a biblioteca discordgo",
    intro: `Bots são uma forma divertida e prática de aprender uma stack inteira: você lida com autenticação, conexões persistentes, eventos assíncronos e armazenamento. O Discord é uma plataforma generosa com bots e tem uma API bem documentada. Em Python, a biblioteca discord.py é a mais conhecida; em Go, usamos a discordgo, que é fina, idiomática e mantém a forma como o Go faz concorrência (cada handler roda em sua própria goroutine).

A diferença prática para Python é sentida no consumo de recursos. Um bot Go fica em torno de 15 MB de RAM mesmo conectado a muitos servidores, contra centenas de MB em Python. Para hobby projects isso significa rodar de graça em VPS minúscula ou no plano gratuito de várias plataformas.

Neste capítulo você vai criar um bot que reage ao comando '!ping' (responde 'pong'), '!cep 01310-100' (busca o CEP usando a API do ViaCEP) e registra no log toda mensagem nova. É didático porque mistura: handler de evento, chamada HTTP externa, parsing de resposta JSON e timeout. Tudo coisas que você vai usar em qualquer integração séria, não só em bot.

O fluxo de auth é simples: você cria uma aplicação no portal do Discord, gera um token de bot, exporta como variável de ambiente e pronto. Token NUNCA vai para o Git. Esse hábito vale para qualquer credencial em qualquer linguagem.`,
    codes: [
      {
        lang: "bash",
        code: `# Setup.
mkdir cepbot && cd cepbot
go mod init exemplo/cepbot
go get github.com/bwmarrin/discordgo

# Crie um bot em https://discord.com/developers/applications
# Copie o token e exporte:
export DISCORD_TOKEN="seu-token-aqui"`,
      },
      {
        lang: "go",
        code: `// internal/cep/cep.go - cliente HTTP para o ViaCEP.
package cep

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type Endereco struct {
	CEP        string ` + "`json:\"cep\"`" + `
	Logradouro string ` + "`json:\"logradouro\"`" + `
	Bairro     string ` + "`json:\"bairro\"`" + `
	Localidade string ` + "`json:\"localidade\"`" + `
	UF         string ` + "`json:\"uf\"`" + `
	Erro       bool   ` + "`json:\"erro\"`" + `
}

func Buscar(ctx context.Context, cep string) (*Endereco, error) {
	cep = strings.ReplaceAll(cep, "-", "")
	if len(cep) != 8 {
		return nil, fmt.Errorf("cep deve ter 8 dígitos")
	}
	url := "https://viacep.com.br/ws/" + cep + "/json/"
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var e Endereco
	if err := json.NewDecoder(resp.Body).Decode(&e); err != nil {
		return nil, err
	}
	if e.Erro {
		return nil, fmt.Errorf("cep não encontrado")
	}
	return &e, nil
}`,
      },
      {
        lang: "go",
        code: `// main.go - bot principal.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"exemplo/cepbot/internal/cep"
	"github.com/bwmarrin/discordgo"
)

func main() {
	token := os.Getenv("DISCORD_TOKEN")
	if token == "" {
		log.Fatal("DISCORD_TOKEN não definido")
	}

	dg, err := discordgo.New("Bot " + token)
	if err != nil {
		log.Fatal(err)
	}

	// Quais eventos queremos receber.
	dg.Identify.Intents = discordgo.IntentsGuildMessages | discordgo.IntentsMessageContent

	dg.AddHandler(onMessage)

	if err := dg.Open(); err != nil {
		log.Fatal(err)
	}
	defer dg.Close()

	log.Println("Bot online. Ctrl+C para sair.")
	// Espera sinal do SO para encerrar limpo.
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM)
	<-sc
	log.Println("Encerrando...")
}

func onMessage(s *discordgo.Session, m *discordgo.MessageCreate) {
	// Ignora mensagens do próprio bot (evita loop infinito).
	if m.Author.Bot {
		return
	}
	switch {
	case m.Content == "!ping":
		s.ChannelMessageSend(m.ChannelID, "pong 🏓")

	case strings.HasPrefix(m.Content, "!cep "):
		valor := strings.TrimPrefix(m.Content, "!cep ")
		ctx, cancel := context.WithTimeout(context.Background(), 6*time.Second)
		defer cancel()
		end, err := cep.Buscar(ctx, valor)
		if err != nil {
			s.ChannelMessageSend(m.ChannelID, "erro: "+err.Error())
			return
		}
		resp := fmt.Sprintf("%s, %s - %s/%s",
			end.Logradouro, end.Bairro, end.Localidade, end.UF)
		s.ChannelMessageSend(m.ChannelID, resp)
	}
}`,
      },
      {
        lang: "bash",
        code: `# Rodando.
go run .
# No Discord, mande:
# !ping        → pong 🏓
# !cep 01310-100 → Avenida Paulista, Bela Vista - São Paulo/SP`,
      },
      {
        lang: "go",
        code: `// Bonus: respondendo com embed bonito.
embed := &discordgo.MessageEmbed{
	Title:       "Endereço encontrado",
	Description: end.Logradouro,
	Color:       0x00b894, // verde
	Fields: []*discordgo.MessageEmbedField{
		{Name: "Bairro", Value: end.Bairro, Inline: true},
		{Name: "Cidade", Value: end.Localidade + "/" + end.UF, Inline: true},
		{Name: "CEP", Value: end.CEP, Inline: true},
	},
}
s.ChannelMessageSendEmbed(m.ChannelID, embed)`,
      },
    ],
    points: [
      "discordgo entrega cada evento em uma goroutine separada — você ganha concorrência de graça.",
      "Sempre habilite os Intents corretos no portal do Discord, senão o bot recebe eventos vazios.",
      "Use http.NewRequestWithContext para que o request seja cancelado se o usuário desistir.",
      "Idiomático: usar context.WithTimeout ao chamar APIs externas evita travamento do bot.",
      "Armadilha: esquecer de checar m.Author.Bot e fazer o bot responder a si mesmo em loop.",
      "Tokens vão em variável de ambiente, NUNCA hardcoded no código (e nunca commitados).",
      "signal.Notify garante shutdown limpo: importante para fechar conexões no Discord.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se você commitar um token do Discord no GitHub, o próprio Discord detecta em minutos e revoga automaticamente. É chato mas é proteção. Use .env e adicione ao .gitignore.",
      },
      {
        type: "tip",
        content: "Para bots em produção, prefira slash commands (registrados via API) em vez de prefixos como !comando. Eles aparecem no autocomplete do Discord e são o caminho oficial recomendado.",
      },
      {
        type: "info",
        content: "A biblioteca discordgo tem cobertura de quase toda a API REST e Gateway do Discord. Para casos exóticos (voice, threads), consulte a doc gerada em pkg.go.dev/github.com/bwmarrin/discordgo.",
      },
    ],
  },
  {
    slug: "projeto-scraper",
    section: "casos-apendice",
    title: "Projeto: web scraper com Colly",
    difficulty: "intermediario",
    subtitle: "Coletando dados de páginas web de forma educada e rápida com a biblioteca Colly",
    intro: `Web scraping é a arte de extrair dados de páginas que não oferecem API. Em Python o ecossistema gira em torno de BeautifulSoup e Scrapy. Em Go, a estrela é a Colly: uma biblioteca pequena, rápida e elegante que herda muito do design do Scrapy mas com o desempenho típico de Go. Para você ter ideia, scrapers que em Python levam minutos, em Colly costumam terminar em segundos, principalmente quando se aproveita a concorrência nativa.

Antes de qualquer coisa, vamos falar de ética. Web scraping abusivo é problema sério: derruba servidores alheios, viola termos de serviço e em alguns países pode dar processo. As regras básicas são respeitar o arquivo robots.txt, não fazer mais que algumas requisições por segundo no mesmo domínio, identificar seu bot no User-Agent (com email para contato) e cachear resultados para não bater duas vezes na mesma URL desnecessariamente. A Colly tem suporte nativo para tudo isso.

O exemplo deste capítulo coleta os títulos e preços de uma página fictícia de livros. A estrutura é típica: você define um Collector, registra callbacks para quando um elemento HTML for encontrado (via seletores CSS), inicia uma visita em uma URL e a Colly cuida da fila, dos retries, do User-Agent. Para escalar, basta habilitar o modo assíncrono e definir limites de paralelismo.

O resultado costuma ser exportado para CSV ou JSON. Vamos gerar um CSV ao final, que é o formato que diretores e analistas pedem em 90% dos casos quando você entrega "uma planilha" para eles.`,
    codes: [
      {
        lang: "bash",
        code: `# Setup.
mkdir bookscraper && cd bookscraper
go mod init exemplo/bookscraper
go get github.com/gocolly/colly/v2`,
      },
      {
        lang: "go",
        code: `// main.go - scraper completo.
package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"
)

type Livro struct {
	Titulo string
	Preco  string
	URL    string
}

func main() {
	var livros []Livro

	c := colly.NewCollector(
		colly.AllowedDomains("books.toscrape.com"), // restringe o domínio
		colly.UserAgent("EstudoGo/1.0 (contato@exemplo.com)"),
		colly.Async(true),
	)

	// Limita a 2 requisições simultâneas com 1s de delay para ser educado.
	c.Limit(&colly.LimitRule{
		DomainGlob:  "*toscrape.com*",
		Parallelism: 2,
		Delay:       1 * time.Second,
	})

	// Cada artigo de livro na página.
	c.OnHTML("article.product_pod", func(e *colly.HTMLElement) {
		livros = append(livros, Livro{
			Titulo: strings.TrimSpace(e.ChildAttr("h3 a", "title")),
			Preco:  strings.TrimSpace(e.ChildText(".price_color")),
			URL:    e.Request.AbsoluteURL(e.ChildAttr("h3 a", "href")),
		})
	})

	// Segue para a próxima página de paginação.
	c.OnHTML("li.next a", func(e *colly.HTMLElement) {
		next := e.Request.AbsoluteURL(e.Attr("href"))
		log.Println("→ próxima:", next)
		e.Request.Visit(next)
	})

	c.OnError(func(r *colly.Response, err error) {
		log.Printf("erro em %s: %v", r.Request.URL, err)
	})

	if err := c.Visit("https://books.toscrape.com/"); err != nil {
		log.Fatal(err)
	}
	c.Wait() // espera o modo async terminar

	if err := salvarCSV("livros.csv", livros); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("✓ %d livros salvos em livros.csv\n", len(livros))
}

func salvarCSV(path string, livros []Livro) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	w := csv.NewWriter(f)
	defer w.Flush()

	w.Write([]string{"titulo", "preco", "url"})
	for _, l := range livros {
		w.Write([]string{l.Titulo, l.Preco, l.URL})
	}
	return nil
}`,
      },
      {
        lang: "bash",
        code: `# Executando.
go run .
# saída esperada:
# → próxima: https://books.toscrape.com/catalogue/page-2.html
# → próxima: https://books.toscrape.com/catalogue/page-3.html
# ...
# ✓ 1000 livros salvos em livros.csv`,
      },
      {
        lang: "go",
        code: `// Cache de respostas: evita baixar a mesma URL duas vezes durante desenvolvimento.
c := colly.NewCollector(
	colly.CacheDir("./.colly_cache"),
)
// As páginas baixadas ficam em disco. Repetir o scraper fica instantâneo.
// Apague a pasta quando quiser baixar tudo de novo.`,
      },
      {
        lang: "go",
        code: `// Respeitando o robots.txt.
import "github.com/gocolly/colly/v2/extensions"

c := colly.NewCollector()
extensions.RandomUserAgent(c)        // varia o UA
extensions.Referer(c)                 // adiciona Referer realista
// A Colly já respeita robots.txt por padrão. Para desabilitar (não recomendado):
// c.IgnoreRobotsTxt = true`,
      },
    ],
    points: [
      "Colly herda design do Scrapy (Python) mas com a velocidade do Go.",
      "Sempre identifique seu bot no User-Agent com forma de contato.",
      "Use colly.Limit para não sobrecarregar o servidor alvo (1-2 req/s é educado).",
      "Idiomático: aproveitar Async + Wait para baixar várias páginas em paralelo.",
      "OnHTML usa seletores CSS — exatamente como em jQuery ou BeautifulSoup.",
      "Armadilha: ignorar robots.txt ou usar User-Agent falso para se passar por navegador; pode dar dor de cabeça legal.",
      "Sempre exporte em CSV ou JSON; raramente o destino final é tela.",
      "Para sites com JavaScript pesado, Colly não basta — use chromedp (browser headless).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Scrape apenas dados públicos e respeite os termos de serviço do site. Coletar dados pessoais de forma automatizada pode violar a LGPD no Brasil mesmo se o dado parecer estar 'aberto'.",
      },
      {
        type: "tip",
        content: "Use colly.CacheDir durante desenvolvimento. Cada execução fica instantânea e você não fica martelando o servidor de teste a cada ajuste de seletor.",
      },
      {
        type: "info",
        content: "Para sites que renderizam tudo com JavaScript (SPAs), a Colly não enxerga o conteúdo final. Nesse caso use chromedp, que controla um Chrome headless de verdade.",
      },
    ],
  },
  {
    slug: "projeto-dashboard",
    section: "casos-apendice",
    title: "Projeto: dashboard em tempo real com WebSocket",
    difficulty: "avancado",
    subtitle: "Dashboard que mostra métricas atualizadas ao vivo via templates html e WebSocket",
    intro: `Dashboards em tempo real são um dos cenários onde o Go brilha. A combinação de servidor HTTP nativo, templates html da biblioteca padrão e WebSocket via gorilla/websocket cobre quase todo caso prático sem precisar de framework pesado. Comparado a Node.js (Socket.IO), você ganha consumo de memória menor e latência mais previsível; comparado a Java (Spring + STOMP), você economiza muito ritual.

A ideia deste projeto é simples mas educativa: o servidor mantém um contador de pedidos por minuto. Várias goroutines simulam pedidos chegando. O frontend (uma página HTML enxuta) abre uma conexão WebSocket e recebe atualizações a cada segundo. Você verá o número aumentar ao vivo, sem precisar atualizar a página.

A peça-chave é o conceito de hub. Um hub é uma goroutine central que mantém o conjunto de clientes conectados, recebe mensagens via channel e faz broadcast para todos. Esse padrão é tão comum que praticamente todo exemplo sério de WebSocket em Go segue ele. Channels e goroutines tornam essa coreografia natural — em outras linguagens normalmente precisa de bibliotecas inteiras só para isso.

Templates html da stdlib são suficientes para projetos pequenos e médios e oferecem proteção automática contra XSS. Você não precisa de React/Vue para entregar valor: muita coisa que parece exigir SPA fica perfeitamente bem com server-rendered + um pouco de JS. Inclusive, é a abordagem que o HTMX está popularizando de novo.`,
    codes: [
      {
        lang: "bash",
        code: `# Setup.
mkdir live-dashboard && cd live-dashboard
go mod init exemplo/dashboard
go get github.com/gorilla/websocket`,
      },
      {
        lang: "go",
        code: `// internal/hub/hub.go - centraliza clientes WebSocket.
package hub

import "sync"

type Hub struct {
	mu      sync.RWMutex
	clients map[chan []byte]struct{}
}

func New() *Hub {
	return &Hub{clients: make(map[chan []byte]struct{})}
}

// Subscribe registra um cliente. Devolve um channel onde o cliente vai receber mensagens.
func (h *Hub) Subscribe() chan []byte {
	ch := make(chan []byte, 8) // buffer pequeno para tolerar lentidão
	h.mu.Lock()
	h.clients[ch] = struct{}{}
	h.mu.Unlock()
	return ch
}

func (h *Hub) Unsubscribe(ch chan []byte) {
	h.mu.Lock()
	delete(h.clients, ch)
	close(ch)
	h.mu.Unlock()
}

// Broadcast manda mensagem para todos. Se algum cliente está lento, pulamos para não bloquear.
func (h *Hub) Broadcast(msg []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for ch := range h.clients {
		select {
		case ch <- msg:
		default: // cliente travado: descartamos para não atrapalhar os outros
		}
	}
}`,
      },
      {
        lang: "go",
        code: `// main.go - servidor HTTP + WebSocket + simulação de métricas.
package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"sync/atomic"
	"time"

	"exemplo/dashboard/internal/hub"
	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		// Em produção, valide a origem para evitar abuso.
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	pedidos atomic.Int64
)

const indexHTML = ` + "`" + `<!doctype html>
<html><head><meta charset="utf-8"><title>Dashboard</title></head>
<body>
<h1>Pedidos por minuto</h1>
<div style="font-size:64px" id="contador">{{.Inicial}}</div>
<script>
  const ws = new WebSocket("ws://" + location.host + "/ws");
  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    document.getElementById("contador").textContent = data.pedidos;
  };
</script>
</body></html>` + "`" + `

func main() {
	tmpl := template.Must(template.New("idx").Parse(indexHTML))
	h := hub.New()

	// Goroutine que simula pedidos chegando aleatoriamente.
	go func() {
		for {
			time.Sleep(time.Duration(200+rand.Intn(800)) * time.Millisecond)
			pedidos.Add(1)
		}
	}()

	// Goroutine que faz broadcast a cada segundo.
	go func() {
		t := time.NewTicker(1 * time.Second)
		for range t.C {
			msg, _ := json.Marshal(map[string]int64{"pedidos": pedidos.Load()})
			h.Broadcast(msg)
		}
	}()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl.Execute(w, map[string]any{"Inicial": pedidos.Load()})
	})

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		ch := h.Subscribe()
		defer h.Unsubscribe(ch)

		for msg := range ch {
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return // cliente desconectou
			}
		}
	})

	fmt.Println("Acesse http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}`,
      },
      {
        lang: "bash",
        code: `# Rode e abra no navegador.
go run .
# Acesse http://localhost:8080 — você verá o número subindo a cada segundo.
# Abra duas abas e veja que ambas recebem o mesmo valor sincronizado.`,
      },
      {
        lang: "go",
        code: `// Padrão de heartbeat: detecta clientes mortos.
// Cliente envia ping, servidor responde pong. Se ping falhar, fechamos.
conn.SetReadDeadline(time.Now().Add(60 * time.Second))
conn.SetPongHandler(func(string) error {
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	return nil
})
go func() {
	t := time.NewTicker(30 * time.Second)
	defer t.Stop()
	for range t.C {
		if err := conn.WriteControl(websocket.PingMessage, nil, time.Now().Add(10*time.Second)); err != nil {
			return
		}
	}
}()`,
      },
    ],
    points: [
      "Hub centralizado é o padrão clássico para WebSocket em Go.",
      "atomic.Int64 garante incremento seguro sem mutex em contadores simples.",
      "Sempre faça broadcast com select default para não travar quando um cliente está lento.",
      "Idiomático: usar channels para comunicação entre goroutines, não variáveis compartilhadas com locks.",
      "html/template escapa HTML automaticamente — ele protege contra XSS sem você pedir.",
      "Armadilha: deixar CheckOrigin retornando true em produção; isso permite ataques cross-site.",
      "Heartbeat (ping/pong) é essencial: WebSocket pode 'morrer silenciosamente' atrás de proxies.",
      "Para escala horizontal (múltiplos servidores), use Redis Pub/Sub ou NATS para coordenar broadcast.",
    ],
    alerts: [
      {
        type: "warning",
        content: "CheckOrigin: func(r *http.Request) bool { return true } abre sua API para qualquer site fazer conexão. Em produção valide r.Header.Get('Origin') contra uma allowlist.",
      },
      {
        type: "tip",
        content: "Para HTTPS/WSS use crypto/tls ou um reverse proxy como Caddy/nginx na frente. WebSocket sobre HTTPS é wss:// no cliente, e Go cuida do upgrade transparentemente.",
      },
      {
        type: "info",
        content: "HTMX e o padrão Server-Sent Events (SSE) são alternativas mais simples ao WebSocket quando o tráfego é só do servidor para o cliente. Use SSE quando puder; é menos drama.",
      },
      {
        type: "success",
        content: "Esse padrão (hub + goroutine + channel) é também a base de chats, notificações e qualquer recurso 'ao vivo'. Aprendeu aqui, aprendeu para muitos cenários.",
      },
    ],
  },
  {
    slug: "projeto-microservico",
    section: "casos-apendice",
    title: "Projeto: microsserviço com gRPC e Docker",
    difficulty: "avancado",
    subtitle: "Implementando um serviço de pagamentos com gRPC, protobuf e empacotamento em Docker",
    intro: `Microsserviços precisam de comunicação eficiente entre si. REST/JSON é ótimo na borda (público, integrações com browser), mas dentro do datacenter, JSON pesa demais e parsing de string consome CPU significativa. É aí que entra o gRPC: contratos definidos em Protocol Buffers, serialização binária compacta, código gerado automaticamente, suporte a streaming bidirecional. Empresas como Google, Netflix, Square e Mercado Livre rodam grande parte das suas comunicações internas em gRPC.

Go é um cidadão de primeira classe no gRPC: o time do Google, criador do gRPC, mantém a implementação Go com prioridade. Comparado ao Java/Spring (que precisa de muitas dependências) ou ao Node.js (que tem implementações menos maduras), gRPC em Go é minimalista, rápido e fácil de empacotar.

Neste capítulo você vai modelar um serviço fictício de pagamentos: o cliente envia um pedido (valor, método, identificador), o servidor processa e devolve um status. Vamos definir o contrato em .proto, gerar o código com protoc, implementar servidor e cliente, e por fim empacotar tudo em uma imagem Docker minúscula (binário estático sobre alpine, ~20 MB). Esse é o template de um microsserviço pronto para produção.

A vantagem prática desse setup é enorme: contrato versionado e tipado, validação automática, suporte a múltiplas linguagens (cliente em Python ou Java consumindo o mesmo serviço), código gerado, performance binária. Nenhuma dessas coisas vem 'de graça' em REST/JSON sem ferramental adicional.`,
    codes: [
      {
        lang: "bash",
        code: `# Instale o protoc (compilador de Protocol Buffers).
# macOS: brew install protobuf
# Ubuntu: sudo apt install protobuf-compiler

# Plugins de Go:
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Setup do projeto.
mkdir paygo && cd paygo
go mod init exemplo/paygo
go get google.golang.org/grpc
go get google.golang.org/protobuf`,
      },
      {
        lang: "yaml",
        code: `# proto/payment.proto - contrato do serviço.
syntax = "proto3";

package payment;
option go_package = "exemplo/paygo/proto;paymentpb";

service Payment {
  rpc Charge (ChargeRequest) returns (ChargeResponse);
}

message ChargeRequest {
  string order_id = 1;
  int64  amount_cents = 2;
  string method = 3; // "pix", "credit_card"
}

message ChargeResponse {
  string transaction_id = 1;
  string status = 2; // "approved", "denied"
}`,
      },
      {
        lang: "bash",
        code: `# Gerar código Go a partir do .proto.
protoc \\
  --go_out=. --go_opt=paths=source_relative \\
  --go-grpc_out=. --go-grpc_opt=paths=source_relative \\
  proto/payment.proto

# Isso cria proto/payment.pb.go e proto/payment_grpc.pb.go`,
      },
      {
        lang: "go",
        code: `// server/main.go - implementação do servidor.
package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"net"

	pb "exemplo/paygo/proto"
	"google.golang.org/grpc"
)

type server struct {
	pb.UnimplementedPaymentServer
}

func (s *server) Charge(ctx context.Context, req *pb.ChargeRequest) (*pb.ChargeResponse, error) {
	log.Printf("processando pedido %s: R$ %.2f via %s",
		req.OrderId, float64(req.AmountCents)/100, req.Method)

	// Lógica fictícia: aprovado se valor < 100k (R$ 1.000).
	status := "approved"
	if req.AmountCents > 100_000 {
		status = "denied"
	}

	return &pb.ChargeResponse{
		TransactionId: gerarID(),
		Status:        status,
	}, nil
}

func gerarID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return "tx_" + hex.EncodeToString(b)
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}
	s := grpc.NewServer()
	pb.RegisterPaymentServer(s, &server{})
	log.Println("gRPC servindo em :50051")
	if err := s.Serve(lis); err != nil {
		log.Fatal(err)
	}
}`,
      },
      {
        lang: "go",
        code: `// client/main.go - cliente que chama o servidor.
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	pb "exemplo/paygo/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	conn, err := grpc.NewClient("localhost:50051",
		grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	client := pb.NewPaymentClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	resp, err := client.Charge(ctx, &pb.ChargeRequest{
		OrderId:     "PED-001",
		AmountCents: 12990,
		Method:      "pix",
	})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("→ %s (status: %s)\n", resp.TransactionId, resp.Status)
}`,
      },
      {
        lang: "yaml",
        code: `# Dockerfile.server - imagem mínima para o servidor.
# Multi-stage build: compila num estágio, copia só o binário no estágio final.
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# CGO_ENABLED=0 → binário estático sem libc, roda em scratch/alpine.
RUN CGO_ENABLED=0 go build -o server ./server

FROM alpine:3.19
COPY --from=build /app/server /usr/local/bin/server
EXPOSE 50051
ENTRYPOINT ["server"]
# Build e rode:
# docker build -f Dockerfile.server -t paygo-server .
# docker run -p 50051:50051 paygo-server`,
      },
    ],
    points: [
      "gRPC usa Protocol Buffers: contratos tipados e binários compactos.",
      "Para serviços internos, gRPC é mais rápido e barato que REST/JSON.",
      "Idiomático: o método retorna (*Response, error) — error é parte do contrato gRPC.",
      "Sempre passe context com timeout no cliente para evitar requests pendurados.",
      "Multi-stage Docker build resulta em imagem de ~20 MB para servidor Go.",
      "Armadilha: usar grpc.WithTransportCredentials(insecure...) em produção; sempre TLS entre datacenters diferentes.",
      "Use grpcurl para testar serviços gRPC sem precisar escrever cliente em Go.",
      "Para erros de domínio, use status.Error com códigos canônicos (codes.InvalidArgument, etc.).",
    ],
    alerts: [
      {
        type: "info",
        content: "gRPC suporta 4 modos: unary (request/response), server streaming, client streaming e bidirectional streaming. Comece com unary; os outros são úteis para casos específicos como upload de arquivos grandes ou notificações.",
      },
      {
        type: "warning",
        content: "Browsers não falam gRPC nativamente. Para consumir do front-end use gRPC-Web (com proxy Envoy) ou exponha um gateway REST com grpc-gateway. Em microsserviços internos, gRPC puro é o caminho.",
      },
      {
        type: "tip",
        content: "Versione seu .proto com cuidado: nunca remova ou renumere campos existentes, só adicione novos com tags maiores. Isso garante compatibilidade entre versões antigas e novas do serviço.",
      },
      {
        type: "success",
        content: "Esse mesmo template (proto + servidor + cliente + Dockerfile multi-stage) é o esqueleto que muitas empresas usam para gerar dezenas de microsserviços padronizados.",
      },
    ],
  },
  {
    slug: "empacotando",
    section: "casos-apendice",
    title: "Empacotando: binário único e ldflags",
    difficulty: "intermediario",
    subtitle: "Compilando para várias plataformas, embedando assets e injetando versão via ldflags",
    intro: `Uma das maiores vantagens de Go sobre Python, Node ou Ruby é a entrega final. Em vez de pedir para o usuário instalar runtime, libs e configurar PATH, você entrega um arquivo executável e pronto. Esse binário tem dentro dele o código do seu programa, todas as bibliotecas (incluindo a runtime do Go) e qualquer asset que você embedar. É a diferença entre mandar uma receita de bolo e entregar o bolo pronto.

A compilação cruzada do Go é particularmente boa: do seu Mac M1 você gera um binário Linux x86_64 ou Windows ARM64 sem configurar nada. Basta setar GOOS e GOARCH antes de chamar 'go build'. Isso é uma magia que em C exige toolchains complexos e em Java significa empacotar a JVM junto. Em Go é uma variável de ambiente.

Outra prática essencial é injetar metadados no binário em tempo de compilação: versão do app, hash do commit, data do build. Isso é feito com a flag -ldflags '-X package.Variável=valor'. Quando o usuário rodar 'meuapp version', você mostra exatamente qual commit gerou aquele binário. Isso vale ouro em troubleshooting de produção.

Por fim, desde Go 1.16 existe o //go:embed, que permite empacotar arquivos estáticos (HTML, CSS, JSON, fontes) dentro do binário. Sua aplicação web vira realmente um arquivo único: copiar e rodar, sem 'esqueci de mandar a pasta static'. Em ambientes de container e Kubernetes isso simplifica bastante o deployment.`,
    codes: [
      {
        lang: "bash",
        code: `# Build padrão para a sua plataforma.
go build -o meuapp .

# Build para Linux x86_64 a partir de qualquer SO.
GOOS=linux GOARCH=amd64 go build -o meuapp-linux .

# Build para Windows.
GOOS=windows GOARCH=amd64 go build -o meuapp.exe .

# Build para Raspberry Pi.
GOOS=linux GOARCH=arm GOARM=7 go build -o meuapp-rpi .

# Lista todos os alvos suportados:
go tool dist list | head`,
      },
      {
        lang: "go",
        code: `// internal/version/version.go - vars que serão injetadas pelo build.
package version

// Estes valores são strings vazias por padrão.
// O build script usa -ldflags para preenchê-los.
var (
	Version = "dev"
	Commit  = "unknown"
	Date    = "unknown"
)

func String() string {
	return Version + " (" + Commit + ", " + Date + ")"
}`,
      },
      {
        lang: "bash",
        code: `# Build com versão injetada.
VERSION=$(git describe --tags --always)
COMMIT=$(git rev-parse --short HEAD)
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

go build -ldflags "\\
  -X exemplo/app/internal/version.Version=$VERSION \\
  -X exemplo/app/internal/version.Commit=$COMMIT \\
  -X exemplo/app/internal/version.Date=$DATE \\
" -o meuapp .

./meuapp version
# → meuapp v1.2.3 (a3f2b1d, 2024-01-15T10:00:00Z)`,
      },
      {
        lang: "bash",
        code: `# Reduzindo o tamanho do binário.
# -s: remove tabela de símbolos
# -w: remove informação de debug DWARF
go build -ldflags "-s -w" -o meuapp .

# Compactando com upx (instalável separadamente):
upx --best --lzma meuapp
# Pode reduzir de 10 MB para 2-3 MB. Atenção: alguns antivírus alertam UPX.`,
      },
      {
        lang: "go",
        code: `// embed.go - empacotando assets estáticos no binário.
package main

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed static/*
var staticFiles embed.FS

func main() {
	// Servir arquivos da pasta "static" embedada.
	sub, _ := fs.Sub(staticFiles, "static")
	http.Handle("/", http.FileServer(http.FS(sub)))
	http.ListenAndServe(":8080", nil)
}
// Toda a pasta ./static vai PARA DENTRO do binário no go build.
// Você pode mover o arquivo ./meuapp para qualquer lugar e rodar.`,
      },
      {
        lang: "go",
        code: `// embedando um único template HTML.
package main

import (
	_ "embed"
	"fmt"
)

//go:embed welcome.html
var welcomeHTML string

func main() {
	fmt.Println(welcomeHTML)
}`,
      },
      {
        lang: "bash",
        code: `# Build totalmente estático (sem libc): roda em scratch, alpine, distroless.
CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w" -o meuapp .
file meuapp
# → meuapp: ELF 64-bit LSB executable, x86-64, statically linked
# Esse binário roda em qualquer Linux x86_64 sem instalar nada.`,
      },
    ],
    points: [
      "Um único 'go build' produz binário sem dependências externas.",
      "GOOS e GOARCH habilitam cross-compilation sem ferramentas extras.",
      "Idiomático: usar -ldflags -X para injetar versão, commit e data no binário.",
      "//go:embed é a forma moderna de empacotar HTML, CSS e JSON dentro do binário.",
      "CGO_ENABLED=0 gera binário estático: ideal para rodar em containers minúsculos.",
      "Armadilha: esquecer CGO_ENABLED=0 e descobrir em produção que o binário precisa de libc específica.",
      "-ldflags '-s -w' reduz o tamanho em 20-30% sem afetar o funcionamento.",
      "Para automação completa, use ferramentas como goreleaser que cuidam de tudo isso.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Conheça o goreleaser (goreleaser.com): ele faz cross-compile para várias plataformas, monta arquivos .tar.gz/.zip, gera changelog do git, publica releases no GitHub e atualiza Homebrew tap. Tudo com um YAML.",
      },
      {
        type: "info",
        content: "O binário Go tem alguns MB porque inclui a runtime (garbage collector, scheduler). Não dá para reduzir muito mais que isso sem perder funcionalidade. Aceite e siga em frente.",
      },
      {
        type: "warning",
        content: "Tome cuidado com //go:embed: arquivos sensíveis (credenciais, .env) podem acabar dentro do binário se você não filtrar. Sempre revise o que vai junto.",
      },
    ],
  },
  {
    slug: "docker-go",
    section: "casos-apendice",
    title: "Docker para Go: multi-stage minimalista",
    difficulty: "intermediario",
    subtitle: "Construindo imagens pequenas e seguras com multi-stage build, scratch e distroless",
    intro: `Imagens Docker pesadas demais são um problema comum em times que vêm de Java ou Node. Uma imagem de 800 MB demora para baixar, ocupa registry caro e amplia a superfície de ataque. Em Go, tudo conspira para o oposto: como o binário é estático e auto-contido, dá para colocar dentro de imagens FROM scratch (literalmente vazia) com 5-10 MB no total. Esse é um diferencial real para Kubernetes, edge computing e CI/CD.

A técnica que usamos é o multi-stage build. A ideia é: em um primeiro estágio, partimos de uma imagem com toolchain Go completa (golang:1.22-alpine), baixamos dependências e compilamos. Em um segundo estágio, partimos de uma imagem base mínima (scratch, alpine ou distroless) e copiamos APENAS o binário compilado. O resultado final não tem o compilador, não tem código-fonte, não tem nada além do que o programa precisa para rodar.

Outro detalhe importante é o cache de camadas. Docker reaproveita camadas que não mudaram. Se você fizer COPY do go.mod/go.sum antes de copiar o resto do código, sucessivas mudanças de código não invalidam a camada de download de dependências. Essa simples reordenação economiza horas de CI ao longo de uma sprint.

Por fim, segurança: rode como usuário não-root sempre que puder. A imagem distroless da Google (gcr.io/distroless/static-debian12:nonroot) já vem com um usuário não-privilegiado. Em scratch, você precisa criar e referenciar manualmente. Vale o esforço: muitos exploits param antes de começar quando o processo não tem permissão para nada.`,
    codes: [
      {
        lang: "yaml",
        code: `# Dockerfile - multi-stage clássico com alpine final.
FROM golang:1.22-alpine AS build

WORKDIR /src

# 1) Copiamos go.mod/go.sum primeiro: cache de dependências.
COPY go.mod go.sum ./
RUN go mod download

# 2) Copiamos o resto do código.
COPY . .

# 3) Compilamos: estático, otimizado, sem símbolos.
RUN CGO_ENABLED=0 GOOS=linux go build \\
    -ldflags "-s -w" \\
    -o /out/app .

# Estágio final: base mínima.
FROM alpine:3.19
RUN apk --no-cache add ca-certificates && \\
    adduser -D -g '' appuser
COPY --from=build /out/app /usr/local/bin/app
USER appuser
EXPOSE 8080
ENTRYPOINT ["app"]`,
      },
      {
        lang: "yaml",
        code: `# Dockerfile.scratch - imagem mínima absoluta (~10 MB total).
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags "-s -w" -o /out/app .

FROM scratch
# Certificados (necessário se sua app fizer HTTPS).
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# Timezone (caso uses time.LoadLocation).
COPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=build /out/app /app
ENTRYPOINT ["/app"]`,
      },
      {
        lang: "yaml",
        code: `# Dockerfile.distroless - recomendado para produção.
FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags "-s -w" -o /out/app .

# Distroless: sem shell, sem package manager, com usuário nonroot.
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
USER nonroot
ENTRYPOINT ["/app"]`,
      },
      {
        lang: "bash",
        code: `# Build e teste local.
docker build -t meuapp:dev .
docker run --rm -p 8080:8080 meuapp:dev

# Inspecione o tamanho.
docker images meuapp
# REPOSITORY  TAG   SIZE
# meuapp      dev   12.4MB     (alpine)
# meuapp      sc    8.1MB      (scratch)
# meuapp      ds    6.9MB      (distroless)`,
      },
      {
        lang: "yaml",
        code: `# .dockerignore - evita mandar lixo para o build context.
.git
.github
*.md
Dockerfile*
.dockerignore
.idea
.vscode
node_modules
tmp
*.test
coverage.out`,
      },
      {
        lang: "yaml",
        code: `# docker-compose.yml para desenvolvimento com hot-reload.
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/postgres?sslmode=disable
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
      },
    ],
    points: [
      "Multi-stage build separa a etapa de compilar da etapa de rodar.",
      "Copie go.mod/go.sum antes do código para aproveitar o cache de camadas.",
      "Imagens distroless e scratch são preferíveis em produção pela segurança.",
      "Idiomático: rodar como usuário não-root mesmo quando o app não precisa de muito.",
      "Adicione ca-certificates se sua app fizer chamadas HTTPS, mesmo em scratch.",
      "Armadilha: esquecer CGO_ENABLED=0 e o binário pedir glibc que não existe na imagem final.",
      ".dockerignore é tão importante quanto o Dockerfile: mantém o contexto enxuto.",
      "Use tags semânticas (v1.2.3) em vez de :latest para deploys reproduzíveis.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use 'docker scout cves meuapp:dev' (ou trivy) para escanear vulnerabilidades. Distroless tem zero CVEs na maioria dos meses, alpine tem poucas. Já uma imagem ubuntu padrão pode ter dezenas.",
      },
      {
        type: "warning",
        content: "Não rode containers como root em produção. Mesmo um app aparentemente inofensivo, se comprometido com root no container, abre caminho para escapes mais perigosos. USER nonroot deve ser padrão.",
      },
      {
        type: "info",
        content: "A imagem base scratch não tem shell. Você não consegue dar 'docker exec -it' para entrar e investigar. Por isso muitos preferem distroless: também sem shell mas com tooling para debugging via ferramentas externas.",
      },
      {
        type: "success",
        content: "Imagens menores significam pull mais rápido em Kubernetes, escalabilidade melhor, custo menor de registry. Vale o tempo investido em afinar o Dockerfile.",
      },
    ],
  },
  {
    slug: "ci-github-actions",
    section: "casos-apendice",
    title: "CI/CD com GitHub Actions",
    difficulty: "intermediario",
    subtitle: "Pipeline de testar, compilar e publicar releases automaticamente para projetos Go",
    intro: `Pipeline de CI/CD não é luxo de empresa grande: até um projeto pessoal ganha muito com testes rodando a cada push. GitHub Actions é gratuito para repositórios públicos, e mesmo nos privados o limite mensal é generoso. Para Go, a configuração é especialmente simples: o ecossistema oferece ações prontas (actions/setup-go, golangci-lint, goreleaser) que cobrem praticamente qualquer necessidade.

Um pipeline típico de Go tem três etapas claras: lint (gofmt, vet, golangci-lint), test (com cobertura), e build (compilar binários para várias plataformas). Em projetos com release pública, soma-se uma quarta etapa: ao criar uma tag versionada (v1.0.0), gerar binários, criar uma GitHub Release e anexar os arquivos. Essa última parte é onde o goreleaser brilha — ele faz cross-compile, gera changelog, publica e até atualiza Homebrew tap.

A grande vantagem do GitHub Actions sobre alternativas (Jenkins, CircleCI, GitLab CI) é a integração nativa: o YAML mora no próprio repo, secrets ficam na aba Settings, badges e status checks funcionam sem configuração extra. Para a maioria dos projetos Go, é a escolha óbvia.

Cuidados práticos: cacheie o ~/.cache/go-build e o módulo cache (~/go/pkg/mod), senão cada job baixa e compila tudo do zero, o que pode triplicar o tempo. A actions/setup-go já cuida disso desde a v4. E proteja sua main branch: exija que o CI passe antes de merge, isso evita 'arruma na próxima' que vira technical debt.`,
    codes: [
      {
        lang: "yaml",
        code: `# .github/workflows/ci.yml - lint, test e build a cada push.
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: secret
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true # cacheia módulos automaticamente

      - name: Verificar formatação
        run: |
          if [ -n "$(gofmt -l .)" ]; then
            echo "Arquivos não formatados:"
            gofmt -l .
            exit 1
          fi

      - name: go vet
        run: go vet ./...

      - name: Testes com cobertura
        env:
          DATABASE_URL: postgres://postgres:secret@localhost:5432/postgres?sslmode=disable
        run: go test -race -coverprofile=coverage.out ./...

      - name: Cobertura como comentário
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage.out`,
      },
      {
        lang: "yaml",
        code: `# .github/workflows/lint.yml - linter pesado em separado.
name: Lint

on: [push, pull_request]

jobs:
  golangci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - uses: golangci/golangci-lint-action@v6
        with:
          version: latest
          args: --timeout=5m`,
      },
      {
        lang: "yaml",
        code: `# .golangci.yml - configuração do linter (na raiz do repo).
run:
  timeout: 5m
linters:
  enable:
    - errcheck       # erros não tratados
    - gosimple       # simplificações idiomáticas
    - govet
    - ineffassign    # atribuições inúteis
    - staticcheck    # análise estática avançada
    - unused
    - gofmt
    - goimports
    - misspell       # erros de digitação em comentários
    - gosec          # problemas de segurança
issues:
  exclude-rules:
    - path: _test\\.go
      linters: [gosec]`,
      },
      {
        lang: "yaml",
        code: `# .github/workflows/release.yml - publica binários ao criar tag v*.
name: Release

on:
  push:
    tags: ['v*']

permissions:
  contents: write # para criar GitHub Release

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # para o changelog do goreleaser

      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - uses: goreleaser/goreleaser-action@v6
        with:
          version: latest
          args: release --clean
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
      },
      {
        lang: "yaml",
        code: `# .goreleaser.yml - quais binários gerar e como publicar.
version: 2
before:
  hooks:
    - go mod tidy
builds:
  - env: [CGO_ENABLED=0]
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]
    ldflags:
      - -s -w
      - -X main.version={{.Version}}
      - -X main.commit={{.Commit}}
      - -X main.date={{.Date}}
archives:
  - format: tar.gz
    format_overrides:
      - goos: windows
        format: zip
checksum:
  name_template: 'checksums.txt'
changelog:
  sort: asc
  filters:
    exclude: ['^docs:', '^test:']`,
      },
      {
        lang: "bash",
        code: `# Lançando uma release.
git tag v1.0.0
git push origin v1.0.0
# O Action dispara, compila para Linux/macOS/Windows em amd64 e arm64,
# cria a release no GitHub e anexa os 6 binários + checksums.txt.`,
      },
    ],
    points: [
      "actions/setup-go@v5 com cache: true cuida do cache de módulos automaticamente.",
      "go test -race detecta data races: rode SEMPRE no CI.",
      "golangci-lint agrega muitos linters em uma só ferramenta — habilite no CI.",
      "Idiomático: separar lint, test e build em jobs distintos para identificar falhas rápido.",
      "goreleaser automatiza release multi-plataforma com um único push de tag.",
      "Armadilha: rodar testes que dependem de banco sem o serviço configurado no workflow.",
      "Use secrets do GitHub para tokens — nunca commit credenciais.",
      "Configure branch protection na main exigindo CI passando para fazer merge.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Adicione um job 'matrix' para testar em múltiplas versões de Go (1.21, 1.22, 1.23). Detecta cedo se algo seu depende de comportamento específico de versão.",
      },
      {
        type: "warning",
        content: "Não use \${{ secrets.NOME }} em pull requests vindos de forks — o GitHub não expõe secrets nesse cenário, e tentar fazer pode causar falhas confusas. Configure pipelines separadas se precisar.",
      },
      {
        type: "info",
        content: "Se você publica imagem Docker, adicione um job que faz docker buildx para multi-arquitetura (amd64 + arm64) e push para ghcr.io ou Docker Hub. É um padrão extremamente comum.",
      },
      {
        type: "success",
        content: "Com goreleaser bem configurado, lançar uma versão é literalmente: git tag v1.2.3 && git push --tags. Aproveite essa simplicidade — versionamento frequente e pequeno é melhor que big bangs.",
      },
    ],
  },
  {
    slug: "debugging-delve",
    section: "casos-apendice",
    title: "Debugging com Delve (dlv)",
    difficulty: "intermediario",
    subtitle: "Usando o debugger oficial do Go para inspecionar variáveis, breakpoints e goroutines em tempo real",
    intro: `Print debugging (espalhar fmt.Println pelo código) é o jeito mais comum de investigar problemas em Go, e funciona muito bem para 80% dos casos. Mas quando o bug é cabeludo, está no meio de uma cadeia de chamadas, ou envolve várias goroutines, um debugger de verdade salva horas. O debugger oficial do Go é o Delve, conhecido pelo binário 'dlv'. Ele entende as particularidades da runtime de Go (goroutines, channels, scheduler), coisa que GDB nunca fez tão bem.

A primeira coisa a entender: Delve não é interpretado como Python pdb. Ele anexa-se a um processo já compilado, lê DWARF (informação de debug embutida no binário) e te dá controle: pausar, inspecionar variáveis, mudar valores, dar passo, listar goroutines. É praticamente uma ferramenta de cirurgia.

Você quase nunca usa Delve direto na linha de comando — embora seja útil saber. O fluxo mais comum é via integração com VS Code (extensão Go) ou GoLand. Você define breakpoint clicando ao lado da linha, roda em modo debug e o IDE conversa com o dlv por baixo dos panos. A experiência é bem semelhante a debugar Java no IntelliJ ou C# no Visual Studio.

Uma habilidade crítica em Go é debugar concorrência. Como dezenas de goroutines podem estar rodando, é fácil ficar perdido. O comando 'goroutines' lista todas, e 'goroutine N bt' mostra o stack de uma específica. Combinado com pprof e trace (cobertos em outro capítulo), o Delve te dá a visão completa da execução.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalando o Delve.
go install github.com/go-delve/delve/cmd/dlv@latest

# Confirme que entrou no PATH.
dlv version
# → Delve Debugger
# → Version: 1.22.0`,
      },
      {
        lang: "bash",
        code: `# Modo 1: rodar e debugar um pacote.
dlv debug ./cmd/api -- --port 8080
# Você cai num prompt (dlv) >. Comandos básicos:
#   b main.handleRequest    → breakpoint na função
#   b main.go:42             → breakpoint em linha
#   c                        → continue (rodar até o próximo bp)
#   n                        → next (próxima linha, sem entrar em funções)
#   s                        → step (entra na função)
#   p variavel               → imprime valor
#   locals                   → lista variáveis locais
#   bt                       → backtrace (stack atual)
#   goroutines               → lista todas as goroutines
#   goroutine 5 bt           → stack da goroutine 5
#   q                        → sair`,
      },
      {
        lang: "bash",
        code: `# Modo 2: anexar a um processo já rodando (pid).
ps aux | grep meuapp
# meuapp ... pid 12345
sudo dlv attach 12345
# útil para debugar travamento de produção sem reiniciar o app.`,
      },
      {
        lang: "bash",
        code: `# Modo 3: debugar testes.
dlv test ./internal/store -- -test.run TestCreate
# (dlv) b TestCreate
# (dlv) c`,
      },
      {
        lang: "bash",
        code: `# Modo 4: debug remoto (em container, em servidor).
# No servidor:
dlv exec ./meuapp --listen=:2345 --headless --api-version=2 -- --port 8080

# No seu VS Code, configure launch.json apontando para o servidor:
# (próximo bloco mostra o JSON)`,
      },
      {
        lang: "json",
        code: `// .vscode/launch.json - configurações para debug local e remoto.
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug local",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "\${workspaceFolder}/cmd/api",
      "args": ["--port", "8080"],
      "env": { "DATABASE_URL": "postgres://..." }
    },
    {
      "name": "Debug remoto (dlv)",
      "type": "go",
      "request": "attach",
      "mode": "remote",
      "remotePath": "\${workspaceFolder}",
      "host": "127.0.0.1",
      "port": 2345
    }
  ]
}`,
      },
      {
        lang: "go",
        code: `// Exemplo de bug típico: race condition. O Delve ajuda a flagar.
package main

import (
	"fmt"
	"sync"
)

func main() {
	contador := 0
	var wg sync.WaitGroup
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			contador++ // RACE: vários goroutines escrevem ao mesmo tempo
		}()
	}
	wg.Wait()
	fmt.Println("contador =", contador) // → quase nunca 1000
}
// Compile com -race para o detector reclamar:
// go run -race main.go
// Use Delve para parar antes do incremento e inspecionar:
// (dlv) b main.go:14
// (dlv) goroutines    → veja todas concorrendo
// (dlv) p contador     → valor instável`,
      },
    ],
    points: [
      "Delve é o debugger oficial do Go: entende goroutines, scheduler e channels.",
      "Use 'dlv debug' para sessão interativa e 'dlv test' para debugar testes.",
      "Idiomático: integre com VS Code ou GoLand — usar dlv puro é raro no dia a dia.",
      "Comando 'goroutines' lista todas as goroutines: essencial em apps concorrentes.",
      "'dlv attach <pid>' permite investigar processos vivos sem reiniciar.",
      "Armadilha: tentar debugar binário compilado com -ldflags '-s -w' (sem símbolos); compile sem essas flags para debug.",
      "Sempre rode 'go test -race' antes de subir para produção: detecta data races.",
      "Para debug remoto em container, exponha porta 2345 e use modo headless.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Print debugging continua sendo legítimo. Use Delve quando print não é suficiente — em bugs de concorrência ou em código com muitas camadas. Não é vergonha usar fmt.Println.",
      },
      {
        type: "warning",
        content: "Em produção, expor porta de debug (2345) sem firewall é um risco enorme: qualquer um com acesso pode parar seu app, ler memória e mudar variáveis. Restrinja ao localhost ou use SSH tunnel.",
      },
      {
        type: "info",
        content: "Para análise de performance (não bugs lógicos), o pprof é mais útil que Delve. Para bugs de timing entre goroutines, o tracer (go test -trace) mostra a coreografia visualmente.",
      },
    ],
  },
  {
    slug: "error-handling-patterns",
    section: "casos-apendice",
    title: "Padrões de tratamento de erros",
    difficulty: "intermediario",
    subtitle: "Sentinel errors, wrap/unwrap, errors.Is/As e quando criar tipos próprios de erro",
    intro: `Tratamento de erros em Go gera muita discussão. Vindo de Python ou Java, onde 'try/except' encapsula falhas, ver 'if err != nil' aparecer em quase toda função pode parecer repetitivo. Essa repetição é proposital: Go quer que você decida explicitamente o que fazer quando algo falha, em vez de deixar uma exceção subir silenciosamente até alguma camada genérica que talvez nem entenda o erro.

A linguagem tem três grandes ferramentas: erros sentinela (variáveis exportadas como ErrNotFound), erros tipados (structs que implementam a interface error) e wrapping (envolver um erro em outro adicionando contexto). Desde Go 1.13, errors.Is e errors.As permitem inspeccionar essa cadeia de erros de forma estruturada, sem comparar strings.

A regra prática: adicione contexto ao retornar (fmt.Errorf com %w), preserve o erro original (para que errors.Is funcione), e só invente tipo de erro quando o caller precisa de mais informação que apenas 'algo deu errado'. Para lógica simples, sentinel errors bastam (io.EOF é o exemplo clássico). Para cenários ricos (validação com múltiplos campos), tipos próprios brilham.

Nunca, em hipótese alguma, ignore um erro escrevendo '_ = err' sem comentário. Esse é o caminho mais rápido para bugs em produção. E nunca use panic para fluxo normal de erro: panic é para situações verdadeiramente irrecuperáveis (corrupção de estado, bug crítico). Erros esperados (entrada inválida, conexão recusada) são sempre returns de error.`,
    codes: [
      {
        lang: "go",
        code: `// Padrão 1: erros sentinela. Comparáveis com == ou errors.Is.
package store

import "errors"

// Erros exportados que o usuário do pacote pode comparar.
var (
	ErrNotFound  = errors.New("registro não encontrado")
	ErrDuplicate = errors.New("registro já existe")
)

func GetUser(id int) (User, error) {
	if id <= 0 {
		return User{}, ErrNotFound
	}
	// ... busca no banco ...
	return User{}, nil
}

// No caller:
// u, err := store.GetUser(42)
// if errors.Is(err, store.ErrNotFound) {
//     // tratar como 404
// }`,
      },
      {
        lang: "go",
        code: `// Padrão 2: wrap com %w preserva a cadeia de erros.
package payment

import (
	"fmt"
	"net/http"
)

func Charge(orderID string) error {
	resp, err := http.Get("https://psp.exemplo/charge/" + orderID)
	if err != nil {
		// %w embrulha, %v só formataria como string e perderia a referência.
		return fmt.Errorf("payment.Charge(%s): %w", orderID, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("payment.Charge(%s): status %d", orderID, resp.StatusCode)
	}
	return nil
}

// No caller, errors.Is consegue achar erros de rede mesmo embrulhados:
// if err := payment.Charge("PED-1"); err != nil {
//     var netErr *net.OpError
//     if errors.As(err, &netErr) {
//         // erro de rede específico
//     }
// }`,
      },
      {
        lang: "go",
        code: `// Padrão 3: tipo próprio de erro com dados estruturados.
package validate

import "fmt"

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("campo %q: %s", e.Field, e.Message)
}

func User(email, name string) error {
	if email == "" {
		return &ValidationError{Field: "email", Message: "não pode ser vazio"}
	}
	if len(name) < 2 {
		return &ValidationError{Field: "name", Message: "muito curto"}
	}
	return nil
}

// No caller, errors.As extrai o tipo:
// if err := validate.User("", "Ana"); err != nil {
//     var v *ValidationError
//     if errors.As(err, &v) {
//         fmt.Println("validar:", v.Field)
//     }
// }`,
      },
      {
        lang: "go",
        code: `// Padrão 4: múltiplos erros agrupados (Go 1.20+).
package main

import (
	"errors"
	"fmt"
)

func validar(idade int, nome string) error {
	var errs []error
	if idade < 0 {
		errs = append(errs, errors.New("idade negativa"))
	}
	if nome == "" {
		errs = append(errs, errors.New("nome vazio"))
	}
	return errors.Join(errs...) // une todos em um único error
}

func main() {
	err := validar(-1, "")
	if err != nil {
		fmt.Println(err)
		// → idade negativa
		// → nome vazio
	}
}`,
      },
      {
        lang: "go",
        code: `// Anti-padrão: NÃO faça assim.
package main

import (
	"fmt"
	"strconv"
)

func parsePrice(s string) float64 {
	v, _ := strconv.ParseFloat(s, 64) // engole erro silenciosamente
	return v
}

func main() {
	fmt.Println(parsePrice("abc")) // → 0, sem aviso. Bug invisível.
}
// Forma correta:
// v, err := strconv.ParseFloat(s, 64)
// if err != nil {
//     return 0, fmt.Errorf("parsePrice(%q): %w", s, err)
// }`,
      },
      {
        lang: "go",
        code: `// Quando usar panic? Apenas em estado verdadeiramente impossível.
package main

func mustParseConfig() Config {
	cfg, err := loadConfig()
	if err != nil {
		// Sem config válida o programa NÃO PODE seguir.
		// panic durante init é aceitável.
		panic("config inválida: " + err.Error())
	}
	return cfg
}

// Em handler HTTP, NUNCA panic — use error e retorne 500.`,
      },
    ],
    points: [
      "errors.New cria erros simples; fmt.Errorf com %w embrulha preservando a origem.",
      "errors.Is verifica se um erro (ou seu wrap) é igual a um sentinel.",
      "errors.As extrai um tipo concreto da cadeia de erros, mesmo embrulhada.",
      "Idiomático: adicionar contexto a cada return de erro ('payment.Charge(X): ...').",
      "errors.Join (Go 1.20+) agrupa múltiplos erros em um só — útil para validação.",
      "Armadilha: usar %v ao invés de %w em fmt.Errorf — perde a referência ao erro original.",
      "Erro comum: ignorar erros com '_, _ := f()' e descobrir o bug semanas depois em produção.",
      "Panic é para corrupção/bug irrecuperável; erros esperados sempre voltam como error.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Em handlers HTTP, defina um middleware de recover para converter panics acidentais em respostas 500 limpas. chi.middleware.Recoverer faz isso por você.",
      },
      {
        type: "warning",
        content: "Comparar erros por string com err.Error() == 'arquivo não encontrado' é frágil: a mensagem pode mudar entre versões. Use sempre errors.Is com sentinel.",
      },
      {
        type: "info",
        content: "Para erros de domínio em APIs, mapeie tipos próprios para códigos HTTP em um único lugar. Exemplo: ValidationError → 422, NotFoundError → 404, AuthError → 401. O handler fica simples.",
      },
      {
        type: "success",
        content: "Erros tratados explicitamente são uma das maiores forças de Go em sistemas grandes. Você lê o código e vê exatamente onde cada falha pode acontecer — sem stack traces surpresa em produção.",
      },
    ],
  },
  {
    slug: "go-proverbs",
    section: "casos-apendice",
    title: "Go Proverbs: a filosofia em frases",
    difficulty: "iniciante",
    subtitle: "Os provérbios de Rob Pike que sintetizam o pensamento idiomático de Go",
    intro: `Em 2015, Rob Pike (um dos criadores do Go) deu uma palestra hoje famosa chamada Go Proverbs, onde sintetizou em frases curtas a filosofia da linguagem. São aforismos no estilo do Zen of Python (de Tim Peters): cabem em uma tela, mas escondem decisões profundas de design. Reler esses provérbios de tempos em tempos é uma das melhores formas de calibrar seu senso de 'o que é código idiomático em Go'.

A diferença em relação ao Zen do Python é que os Go Proverbs são mais práticos e menos poéticos. Em vez de 'beautiful is better than ugly', você tem 'don't communicate by sharing memory; share memory by communicating' — uma instrução técnica que muda como você desenha sistemas concorrentes. Em vez de 'simple is better than complex', você tem 'a little copying is better than a little dependency' — uma decisão de engenharia sobre quando criar vs. importar.

Cada provérbio é uma porta para uma discussão. 'Errors are values' não significa apenas que error é um tipo, significa que você pode armazenar, retornar, manipular e compor erros como qualquer outro valor. 'Make the zero value useful' é o que permite que sync.Mutex funcione direto sem inicializar e que slices nil aceitem append.

Vamos passar por cada provérbio com tradução, contexto e exemplo prático. No final, você vai sentir o pulso da linguagem — e vai notar que muito código Go que você admira está, na verdade, seguindo exatamente esses aforismos sem aviso.`,
    codes: [
      {
        lang: "go",
        code: `// "Don't communicate by sharing memory; share memory by communicating."
// Em vez de mutex sobre variável compartilhada, use channels.

package main

import "fmt"

// Errado: variável compartilhada com lock manual.
// var contador int
// var mu sync.Mutex
// mu.Lock(); contador++; mu.Unlock()

// Idiomático: cada goroutine fala via channel.
func main() {
	pedidos := make(chan int)
	go func() {
		for i := 1; i <= 5; i++ {
			pedidos <- i
		}
		close(pedidos)
	}()
	for p := range pedidos {
		fmt.Println("processando pedido", p)
	}
}`,
      },
      {
        lang: "go",
        code: `// "Make the zero value useful."
// Tipos devem funcionar úteis sem inicialização explícita.

package main

import (
	"bytes"
	"fmt"
	"sync"
)

func main() {
	var b bytes.Buffer    // zero value já está pronto
	b.WriteString("ok")
	fmt.Println(b.String())

	var mu sync.Mutex     // zero value já é um mutex destrancado e usável
	mu.Lock()
	defer mu.Unlock()

	var s []int           // slice nil — pode dar append direto!
	s = append(s, 1, 2, 3)
	fmt.Println(s)        // → [1 2 3]
}`,
      },
      {
        lang: "go",
        code: `// "Errors are values."
// Erro é um valor que você pode manipular, compor, retornar.

package main

import (
	"errors"
	"fmt"
)

var ErrTimeout = errors.New("timeout")

// Função que processa lista e devolve erros agregados.
func processar(itens []int) error {
	var errs []error
	for _, n := range itens {
		if n < 0 {
			errs = append(errs, fmt.Errorf("item %d inválido", n))
		}
	}
	return errors.Join(errs...)
}

func main() {
	if err := processar([]int{1, -2, 3, -4}); err != nil {
		fmt.Println(err)
	}
}`,
      },
      {
        lang: "go",
        code: `// "A little copying is better than a little dependency."
// Em vez de importar uma lib enorme por uma função, copie a função.

package strs

// Tirada da stdlib mental — em vez de 'go get'.
func Reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

// Importar uma lib de 200 KB para 8 linhas é desproporcional.
// Copiar com créditos é uma escolha legítima em Go.`,
      },
      {
        lang: "go",
        code: `// "The bigger the interface, the weaker the abstraction."
// Interfaces pequenas (1-2 métodos) são as mais reusáveis.

package main

import "io"

// io.Reader tem UM método: Read([]byte) (int, error).
// Por isso ele aceita arquivo, conexão, gzip, criptografia, mock de teste.

func contar(r io.Reader) (int, error) {
	buf := make([]byte, 1024)
	total := 0
	for {
		n, err := r.Read(buf)
		total += n
		if err == io.EOF {
			return total, nil
		}
		if err != nil {
			return total, err
		}
	}
}`,
      },
      {
        lang: "go",
        code: `// "Don't just check errors, handle them gracefully."
// Não basta ver if err != nil; faça algo útil.

package main

import (
	"fmt"
	"os"
)

func lerConfig(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		// Errado: return data, err — sem contexto.
		// Idiomático: adicionar info para debugar depois.
		return nil, fmt.Errorf("lendo config %s: %w", path, err)
	}
	return data, nil
}`,
      },
      {
        lang: "go",
        code: `// "Concurrency is not parallelism."
// Você pode ter concorrência (estrutura) sem paralelismo (execução simultânea).

// Concorrência: design — várias tarefas que podem rodar em qualquer ordem.
// Paralelismo: execução — várias tarefas rodando AO MESMO TEMPO em CPUs diferentes.

// Um programa concorrente bem desenhado tira proveito de paralelismo
// quando há núcleos disponíveis. Mas concorrência ajuda mesmo num
// processador de núcleo único: I/O não bloqueia o fluxo principal.`,
      },
    ],
    points: [
      "Don't communicate by sharing memory; share memory by communicating — channels primeiro, mutex depois.",
      "Errors are values — manipule erros como qualquer valor, com errors.Is/As/Join.",
      "Make the zero value useful — projete tipos que funcionam sem construtor.",
      "A little copying is better than a little dependency — pondere antes de adicionar import.",
      "The bigger the interface, the weaker the abstraction — interfaces pequenas reusam mais.",
      "Idiomático: aceitar interfaces, retornar tipos concretos.",
      "Don't just check errors, handle them gracefully — adicione contexto, decida o que fazer.",
      "Armadilha: ignorar provérbios e cair em padrões de outras linguagens (herança, factories complexas).",
      "Concurrency is not parallelism — entenda a diferença para desenhar sistemas certos.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Assista à palestra original 'Go Proverbs' do Rob Pike no YouTube — são 30 minutos que vão mudar como você lê código em Go. Há legendas em português em alguns canais da comunidade.",
      },
      {
        type: "info",
        content: "Os Go Proverbs estão listados em go-proverbs.github.io. Bookmark o link e visite quando estiver em dúvida sobre algum design — frequentemente um provérbio responde sua pergunta.",
      },
      {
        type: "success",
        content: "Internalizar esses provérbios é o que separa quem 'escreve Go' de quem 'escreve Java/Python com sintaxe Go'. Vale o esforço de releitura ocasional.",
      },
    ],
  },
  {
    slug: "recursos",
    section: "casos-apendice",
    title: "Recursos para continuar aprendendo",
    difficulty: "iniciante",
    subtitle: "Livros, sites, vídeos, exercícios e comunidades em português para evoluir em Go",
    intro: `Você terminou um livro inteiro sobre Go. Parabéns. Mas a verdade é que livro nenhum cobre tudo, e o jeito mais rápido de evoluir agora é se conectar com a comunidade e praticar em problemas reais. Este capítulo é um mapa de onde encontrar conteúdo de qualidade, dos tutoriais mais oficiais aos exercícios divertidos de fim de semana, com destaque para o que existe em português.

A biblioteca padrão do Go tem documentação primorosa. O Effective Go é leitura obrigatória — um documento curto que ensina o estilo idiomático com exemplos. O Go by Example é uma referência rápida com snippets executáveis para qualquer recurso da linguagem. O blog oficial (go.dev/blog) tem artigos profundos do próprio time da linguagem sobre decisões de design, novos recursos, performance.

Para prática deliberada, três projetos se destacam. Gophercises é uma série de pequenos desafios práticos (CLI, web, serialização) com vídeos resolvendo. Exercism tem trilhas curadas e mentoria gratuita. E Build Your Own X (no GitHub) tem tutoriais completos para construir banco de dados, rede neural, container runtime, em Go.

A comunidade brasileira é viva e generosa. Tem servidor no Discord (Gophers BR), grupo no Telegram, encontros mensais (Go Niterói, Go Floripa, Go SP), conferências (GopherCon Brasil) e canais no YouTube de gente que mostra código de produção. Não fique sozinho aprendendo: pergunte, mostre seu código, contribua para projetos open source. É assim que se vira sênior.`,
    codes: [
      {
        lang: "bash",
        code: `# Recursos oficiais (todos gratuitos, todos em inglês mas digestivos).

# Tour interativo: 1-2 horas, melhor caminho para revisão rápida.
# https://go.dev/tour/

# Effective Go: estilo idiomático.
# https://go.dev/doc/effective_go

# Go by Example: receituário visual.
# https://gobyexample.com/

# Blog oficial.
# https://go.dev/blog/

# Standard library docs.
# https://pkg.go.dev/std`,
      },
      {
        lang: "bash",
        code: `# Prática deliberada: codar problemas reais.

# Gophercises (Jon Calhoun) — 20 desafios em vídeo + código.
# https://gophercises.com/

# Exercism Go track — exercícios + mentoria gratuita.
# https://exercism.org/tracks/go

# Build Your Own X — coleção de tutoriais profundos.
# https://github.com/codecrafters-io/build-your-own-x

# Project-based learning.
# https://github.com/practical-tutorials/project-based-learning#go`,
      },
      {
        lang: "bash",
        code: `# Livros recomendados (alguns têm tradução em português).

# "The Go Programming Language" — Donovan & Kernighan. Bíblia.
# "Learning Go" — Jon Bodner (2ed cobre Go 1.21+).
# "100 Go Mistakes and How to Avoid Them" — Teiva Harsanyi (excelente!).
# "Concurrency in Go" — Katherine Cox-Buday.
# "Black Hat Go" — para quem gosta de segurança/red team.

# Em português:
# "Aprenda Go em Y minutos" (gratuito, online).
# "Go: a linguagem de programação Google" (Casa do Código).`,
      },
      {
        lang: "bash",
        code: `# Canais e podcasts em português.

# YouTube:
# - Akita on Rails (vários vídeos sobre Go)
# - Wesley Williams (Full Cycle, com bastante Go)
# - Ellen Körbes (palestrante, dev na Tailscale, vídeos pt/en)
# - Curso em Vídeo (introdutório)

# Podcasts:
# - HipstersPontoTech (algumas eps sobre Go)
# - Like a Boss
# - DevsNaSpeed`,
      },
      {
        lang: "bash",
        code: `# Comunidade.

# Discord: Gophers BR — https://discord.gg/gophersbr (procure no buscador)
# Telegram: @golangbr (canal e grupo)
# Slack global: gophers.slack.com (#brasil channel)
# Reddit: r/golang
# Hacker News: tag "go" sempre traz coisas interessantes
# Twitter/X: siga @golang, @rob_pike, @bradfitz, @ellenkorbes`,
      },
      {
        lang: "go",
        code: `// Rotina sugerida para os próximos 30 dias.
package estudo

func PlanoTrintaDias() []string {
	return []string{
		"Semana 1: refazer o Tour of Go inteiro, anotando dúvidas.",
		"Semana 2: ler Effective Go duas vezes, marcando trechos para releitura.",
		"Semana 3: escolher um Gophercise e implementar do zero.",
		"Semana 4: contribuir com PR (issue 'good first issue') em projeto open source Go.",
		"Bonus: postar um repo seu no GitHub e pedir code review na comunidade.",
	}
}`,
      },
    ],
    points: [
      "Effective Go e Go by Example são leitura obrigatória, em qualquer ordem.",
      "Gophercises e Exercism dão prática guiada de qualidade — use-os.",
      "Idiomático: leia código de bibliotecas populares (chi, cobra, viper) para absorver estilo.",
      "Discord Gophers BR e Telegram @golangbr são as portas de entrada da comunidade brasileira.",
      "Conferências (GopherCon Brasil, Go Floripa) valem o investimento de tempo e ingresso.",
      "Armadilha: consumir conteúdo passivo demais e nunca codar — assista 1 vídeo, code 3.",
      "Contribuir para open source é a forma mais rápida de receber feedback de seniores.",
      "Para troubleshooting, pkg.go.dev > Stack Overflow > GitHub Issues > Twitter/X.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Bookmarks essenciais: pkg.go.dev (docs), go.dev/play (playground online), gobyexample.com (snippets), go-proverbs.github.io (filosofia). Esses quatro resolvem 80% das suas dúvidas diárias.",
      },
      {
        type: "success",
        content: "A comunidade Go é conhecida por ser acolhedora. Faça perguntas mesmo que pareçam bobas — é assim que se entra. Quase todo gopher experiente lembra de ter sido iniciante e ajuda de bom grado.",
      },
      {
        type: "info",
        content: "Acompanhe as release notes a cada nova versão (go.dev/doc/devel/release). O Go evolui de forma incremental e cuidadosa — você não vai quebrar código antigo, mas pode aprender truques novos.",
      },
      {
        type: "warning",
        content: "Não tente aprender Go assistindo só vídeo no YouTube. Vídeo é ótimo para visão geral; livro e prática deliberada formam a fundação. Misture as duas coisas.",
      },
    ],
  },
  {
    slug: "proximos-passos",
    section: "casos-apendice",
    title: "Próximos passos: além do básico",
    difficulty: "avancado",
    subtitle: "Caminhos avançados em Go: Kubernetes operators, eBPF, WebAssembly e mais",
    intro: `Chegou ao fim da trilha principal. Agora vem a parte mais empolgante: descobrir onde Go te leva. A linguagem é particularmente forte em três frentes que estão moldando o futuro da computação — orquestração nativa em nuvem (Kubernetes), observabilidade em kernel (eBPF) e execução em qualquer lugar (WebAssembly). Esses três campos são, hoje, os destinos mais frequentes de gophers experientes.

Kubernetes é escrito em Go, e a forma mais poderosa de estendê-lo é escrevendo Operators — programas que ensinam o Kubernetes a gerenciar recursos personalizados (bancos de dados, jobs específicos, integrações). Frameworks como Operator SDK e Kubebuilder facilitam o trabalho. Empresas usam isso para automatizar provisionamento e operação de coisas que tradicionalmente exigiam DBA: você descreve um Postgres em YAML e o operator cria, escala, faz backup, atualiza versão.

eBPF é uma das tecnologias mais empolgantes da década. Permite rodar pequenos programas dentro do kernel do Linux com segurança, abrindo portas para observabilidade extrema, segurança e networking. Projetos como Cilium, Pixie, Falco e Tetragon usam Go para a parte de userspace dos seus eBPF. A biblioteca cilium/ebpf é o caminho moderno para começar.

WebAssembly leva código compilado para rodar no navegador (e cada vez mais em servidores via WASI). Go suporta target wasm e wasip1, permitindo compilar suas funções e rodá-las em qualquer lugar com runtime WASM. Isso habilita plugins seguros (sem a complexidade de embed C++), funções edge (Cloudflare Workers, Fastly), e até executar lógica de back-end direto no front-end. É uma fronteira nova e Go está bem posicionado.`,
    codes: [
      {
        lang: "bash",
        code: `# Kubernetes Operator com Kubebuilder.
go install sigs.k8s.io/kubebuilder/v4@latest

mkdir my-operator && cd my-operator
kubebuilder init --domain exemplo.com --repo exemplo.com/my-operator
kubebuilder create api --group app --version v1 --kind Database

# Você ganha esqueleto de:
# - api/v1/database_types.go      → defina campos do CRD
# - internal/controller/database_controller.go → lógica de reconciliação
# - config/crd/...                → manifests do K8s

# Próximos passos:
# - Edite database_types.go com Spec e Status.
# - Implemente Reconcile() que olha o estado e age.
# - Aplique no cluster com 'make install run'.`,
      },
      {
        lang: "go",
        code: `// Esqueleto de um controller (super simplificado).
package controller

import (
	"context"

	appv1 "exemplo.com/my-operator/api/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DatabaseReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// Reconcile é chamado sempre que algo muda no objeto Database.
func (r *DatabaseReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	var db appv1.Database
	if err := r.Get(ctx, req.NamespacedName, &db); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	// Aqui você compara o estado desejado (db.Spec) com o real
	// e cria/atualiza recursos (StatefulSet, Service, Secret) para fechar o gap.
	return ctrl.Result{}, nil
}

func (r *DatabaseReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&appv1.Database{}).
		Complete(r)
}`,
      },
      {
        lang: "bash",
        code: `# eBPF com cilium/ebpf (Linux only).
go get github.com/cilium/ebpf/cmd/bpf2go

# Você escreve o programa eBPF em C, compila para bytecode com clang,
# e o cilium/ebpf gera bindings Go automaticamente.
# Exemplos prontos no repo: github.com/cilium/ebpf/tree/main/examples

# Use cases comuns:
# - Tracing de syscalls em produção sem agente pesado.
# - Observabilidade de tráfego de rede sem libpcap.
# - Bloqueio de pacotes a nível de kernel (XDP).`,
      },
      {
        lang: "bash",
        code: `# WebAssembly com Go: target wasm para navegador.
GOOS=js GOARCH=wasm go build -o app.wasm main.go

# Copie o helper oficial:
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .

# Em uma página HTML:
# <script src="wasm_exec.js"></script>
# <script>
#   const go = new Go();
#   WebAssembly.instantiateStreaming(fetch("app.wasm"), go.importObject)
#     .then(r => go.run(r.instance));
# </script>`,
      },
      {
        lang: "go",
        code: `// main.go - compilado para WASM, expõe função para JavaScript.
//go:build js && wasm

package main

import (
	"strings"
	"syscall/js"
)

// Função que vai ser visível no JS como window.upper(string)
func upper(this js.Value, args []js.Value) any {
	if len(args) == 0 {
		return ""
	}
	return strings.ToUpper(args[0].String())
}

func main() {
	js.Global().Set("upper", js.FuncOf(upper))
	// Mantém o programa vivo enquanto o JS pode chamar nossa função.
	select {}
}
// No console do navegador: upper("oi") → "OI"`,
      },
      {
        lang: "bash",
        code: `# WebAssembly fora do navegador: WASI (Go 1.21+).
GOOS=wasip1 GOARCH=wasm go build -o app.wasm .

# Rode com runtime como wasmtime ou wazero.
wasmtime app.wasm
# Esse mesmo binário pode rodar em edge functions, plugins de Envoy,
# Kubernetes pods, sem precisar recompilar para cada arquitetura.`,
      },
      {
        lang: "bash",
        code: `# Outros caminhos avançados que vale explorar.

# Game engines: Ebiten (2D), simples e divertido.
go get github.com/hajimehoshi/ebiten/v2

# Machine learning: gorgonia (rede neural em Go puro).
go get gorgonia.org/gorgonia

# Distribuído: NATS, Temporal.io (workflows complexos), etcd (consenso Raft).

# IoT: TinyGo compila Go para microcontroladores (Arduino, ESP32, RP2040).
# tinygo.org

# Linguagens implementadas em Go: estude tree-sitter, gopls, ou o próprio compilador Go.`,
      },
    ],
    points: [
      "Kubernetes Operators (Kubebuilder/Operator SDK) automatizam operação de stateful workloads.",
      "eBPF + Go é a stack moderna para observabilidade e segurança em kernel Linux.",
      "WebAssembly (wasm e wasip1) leva Go para navegador, edge e plugins seguros.",
      "Idiomático: aproveitar bibliotecas oficiais do ecossistema (controller-runtime, cilium/ebpf, syscall/js).",
      "TinyGo compila Go para microcontroladores — IoT virou alcance imediato.",
      "Armadilha: tentar aprender as três frentes ao mesmo tempo; escolha uma e vá fundo.",
      "Para distribuído, estude Temporal e NATS antes de inventar coordenação manual.",
      "Comece contribuindo para projetos existentes (Cilium, Vitess, k0s) antes de inventar do zero.",
    ],
    alerts: [
      {
        type: "info",
        content: "Empresas brasileiras como Stone, Nubank, Mercado Livre, Hash, Wellhub e Olist usam Go intensivamente em produção. Há mercado real e crescente para gophers no Brasil.",
      },
      {
        type: "tip",
        content: "Para escolher seu próximo aprofundamento, pergunte: que problema te tira o sono? Operações de cluster te empolgam (operators)? Performance e segurança em baixo nível (eBPF)? Universalidade (WASM)? Siga onde sua curiosidade arde.",
      },
      {
        type: "success",
        content: "Você não precisa virar especialista em todas essas frentes. Domine Go bem, conheça uma área avançada com profundidade, e mantenha leitura ampla das outras. Esse é o perfil mais valorizado e sustentável a longo prazo.",
      },
      {
        type: "warning",
        content: "Cuidado com hype. WebAssembly e eBPF são empolgantes, mas a grande maioria das empresas ainda precisa de gente que escreva APIs sólidas, com bons testes e CI. Domine o básico antes de correr para o exótico.",
      },
    ],
  },
];
