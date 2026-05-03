import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "net-http-server",
    section: "frameworks-web",
    title: "net/http: servidor HTTP da biblioteca padrão",
    difficulty: "iniciante",
    subtitle: "Como Go entrega um servidor web pronto para produção sem instalar nada externo",
    intro: `Em Python você precisa de Flask ou FastAPI. Em Java, alguém vai te dizer para baixar o Tomcat. Em Node, você instala o Express. Em Go, você abre o editor, escreve seis linhas usando o pacote net/http e já tem um servidor web rodando, com timeouts, TLS, suporte a HTTP/2 e milhares de conexões simultâneas. Essa é uma das primeiras coisas que choca quem chega de outras linguagens: a biblioteca padrão de Go é absurdamente competente para web.

A peça central é o tipo http.ServeMux, um roteador simples que mapeia padrões de URL para funções (chamadas handlers). Cada handler recebe dois argumentos: um http.ResponseWriter para escrever a resposta e um ponteiro para http.Request com tudo que veio do cliente. É um modelo direto, sem mágica de decorator e sem reflexão escondida, parecido com Servlet do Java, mas muito mais leve.

A partir de Go 1.22 o ServeMux ganhou superpoderes: você pode declarar verbo HTTP no padrão (\`GET /usuarios/{id}\`) e capturar variáveis de caminho com r.PathValue("id"). Antes disso o pessoal corria para frameworks só por causa de roteamento. Hoje, para muitos projetos pequenos e médios, o pacote padrão resolve sozinho.

Idiomático em Go é configurar um http.Server explicitamente, definindo ReadTimeout, WriteTimeout e IdleTimeout. O http.ListenAndServe que aparece em tutoriais é prático para brincar, mas em produção um servidor sem timeouts é uma porta aberta para ataques de slowloris e vazamento de goroutines. Vamos construir tudo do zero, sem framework, e você vai ver que dá pé.`,
    codes: [
      {
        lang: "bash",
        code: `# Crie o módulo do projeto. Em Go, todo projeto vive dentro de um módulo.
mkdir api-pedidos && cd api-pedidos
go mod init exemplo/api-pedidos
# Sem dependências externas: net/http já vem na linguagem.`,
      },
      {
        lang: "go",
        code: `package main

import (
        "fmt"
        "log"
        "net/http"
)

// handler é uma função que recebe ResponseWriter e *Request.
// Em Go, qualquer func com essa assinatura vira um handler HTTP.
func ola(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Olá, mundo dos pedidos!")
}

func main() {
        mux := http.NewServeMux()
        mux.HandleFunc("/", ola)
        log.Println("servidor ouvindo em :8080")
        // ListenAndServe bloqueia até dar erro; aqui só para começar.
        log.Fatal(http.ListenAndServe(":8080", mux))
}
// curl http://localhost:8080/  → Olá, mundo dos pedidos!`,
      },
      {
        lang: "go",
        code: `package main

import (
        "encoding/json"
        "log"
        "net/http"
        "time"
)

type Pedido struct {
        ID     int     ` + "`json:\"id\"`" + `
        Cliente string ` + "`json:\"cliente\"`" + `
        Total  float64 ` + "`json:\"total\"`" + `
}

// Padrão Go 1.22: verbo + caminho + variável {id}.
func buscarPedido(w http.ResponseWriter, r *http.Request) {
        id := r.PathValue("id") // pega o trecho da URL
        p := Pedido{ID: 1, Cliente: "Ana", Total: 199.90}
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]any{"pedido": p, "echo_id": id})
}

func main() {
        mux := http.NewServeMux()
        mux.HandleFunc("GET /pedidos/{id}", buscarPedido)

        srv := &http.Server{
                Addr:         ":8080",
                Handler:      mux,
                ReadTimeout:  5 * time.Second,  // evita slowloris
                WriteTimeout: 10 * time.Second, // resposta tem que sair rápido
                IdleTimeout:  60 * time.Second, // conexões keep-alive expiram
        }
        log.Fatal(srv.ListenAndServe())
}
// curl http://localhost:8080/pedidos/42
// → {"echo_id":"42","pedido":{"id":1,"cliente":"Ana","total":199.9}}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "encoding/json"
        "net/http"
)

// Receber JSON do cliente e responder com confirmação.
type Item struct {
        Nome      string ` + "`json:\"nome\"`" + `
        Quantidade int   ` + "`json:\"quantidade\"`" + `
}

func criarItem(w http.ResponseWriter, r *http.Request) {
        var it Item
        // Decode lê o corpo da requisição e preenche a struct.
        if err := json.NewDecoder(r.Body).Decode(&it); err != nil {
                http.Error(w, "json inválido: "+err.Error(), http.StatusBadRequest)
                return
        }
        w.WriteHeader(http.StatusCreated)
        _ = json.NewEncoder(w).Encode(map[string]string{
                "mensagem": "item " + it.Nome + " criado",
        })
}

func main() {
        mux := http.NewServeMux()
        mux.HandleFunc("POST /itens", criarItem)
        _ = http.ListenAndServe(":8080", mux)
}
// curl -X POST -d '{"nome":"café","quantidade":2}' http://localhost:8080/itens`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"
        "net/http"
        "time"
)

// Middleware: função que recebe um handler e devolve outro "embrulhado".
// Padrão idiomático em Go para logging, auth, métricas, etc.
func logRequisicao(prox http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                inicio := time.Now()
                prox.ServeHTTP(w, r) // chama o handler real
                log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(inicio))
        })
}

func main() {
        mux := http.NewServeMux()
        mux.HandleFunc("GET /saude", func(w http.ResponseWriter, r *http.Request) {
                _, _ = w.Write([]byte("ok"))
        })
        // Embrulha o mux inteiro com o middleware.
        _ = http.ListenAndServe(":8080", logRequisicao(mux))
}`,
      },
    ],
    points: [
      "net/http já vem em Go: nada para instalar para subir um servidor.",
      "Idiomático: configure http.Server com timeouts em vez de http.ListenAndServe direto.",
      "A partir de Go 1.22 o ServeMux entende verbo HTTP e variáveis no padrão.",
      "Use r.PathValue(\"id\") para ler parâmetros declarados no padrão da rota.",
      "Sempre defina Content-Type antes de escrever o corpo da resposta.",
      "Middlewares são funções que recebem e retornam http.Handler — sem framework necessário.",
      "Armadilha: esquecer de retornar após http.Error e continuar processando a requisição.",
      "Erro comum: usar http.DefaultServeMux por preguiça; ele é global e qualquer pacote pode injetar rotas nele.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Antes de instalar um framework, pergunte se o net/http resolve. Para a maioria das APIs internas e microserviços, ele basta e tem zero risco de abandono.",
      },
      {
        type: "warning",
        content: "Servidor sem ReadTimeout e WriteTimeout pode ser derrubado por um cliente lento que abre conexões e nunca termina de mandar bytes. Sempre configure timeouts em produção.",
      },
      {
        type: "info",
        content: "O http.ResponseWriter só pode ter o status definido uma vez via WriteHeader. Depois do primeiro Write, qualquer tentativa de mudar o status será ignorada e logada.",
      },
    ],
  },
  {
    slug: "gin",
    section: "frameworks-web",
    title: "Gin: o framework web mais popular do Go",
    difficulty: "iniciante",
    subtitle: "Roteamento rápido, binding automático de JSON e sintaxe enxuta para APIs REST",
    intro: `Quando você precisa de algo mais ergonômico que o net/http puro — agrupamento de rotas, binding de JSON com validação, helpers para responder, contexto rico — o Gin é a primeira parada da maioria dos times Go. Ele é o equivalente do Express no Node ou do Flask no Python: pequeno, rápido, opinativo o suficiente para te ajudar e flexível o bastante para não atrapalhar.

Por baixo, o Gin usa um roteador baseado em radix tree (httprouter) que faz o casamento de rotas em tempo praticamente constante, mesmo com centenas de endpoints. A diferença sentida em relação ao net/http é a praticidade: c.JSON(200, obj) substitui três linhas de manipulação de header e encoder, c.ShouldBindJSON(&dto) lê o corpo e valida tags de struct, c.Param("id") pega variáveis de rota, e tudo é tipado.

Compare com o Spring Boot do Java: o Gin entrega 80% da produtividade com 5% do peso e do tempo de inicialização. Comparado ao Flask, ele é compilado, sem GIL, e aguenta concorrência pesada de fábrica porque cada requisição já roda em sua própria goroutine via net/http. Você não precisa pensar em workers, gunicorn ou ASGI; o runtime do Go cuida disso.

Idiomático ao usar Gin é definir DTOs como structs com tags \`json\` e \`binding\`, agrupar rotas por versão (v1 := r.Group("/api/v1")) e centralizar erros num middleware. Neste capítulo vamos subir uma API de cadastro de clientes com validação automática e tratamento de erro consistente.`,
    codes: [
      {
        lang: "bash",
        code: `# Instale o Gin no seu módulo.
go mod init exemplo/api-clientes
go get github.com/gin-gonic/gin
# Isso baixa o pacote e adiciona em go.mod / go.sum automaticamente.`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"

        "github.com/gin-gonic/gin"
)

func main() {
        r := gin.Default() // já vem com Logger e Recovery (panics viram 500).

        r.GET("/ping", func(c *gin.Context) {
                // c.JSON serializa a struct/map e seta Content-Type sozinho.
                c.JSON(http.StatusOK, gin.H{"mensagem": "pong"})
        })

        _ = r.Run(":8080") // atalho para http.ListenAndServe(":8080", r)
}
// curl http://localhost:8080/ping → {"mensagem":"pong"}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"

        "github.com/gin-gonic/gin"
)

// Tags binding fazem validação automática.
// "required" = obrigatório, "email" = formato e-mail, "min/max" = tamanho.
type Cliente struct {
        Nome  string ` + "`json:\"nome\" binding:\"required,min=3\"`" + `
        Email string ` + "`json:\"email\" binding:\"required,email\"`" + `
        Idade int    ` + "`json:\"idade\" binding:\"required,gte=18\"`" + `
}

func main() {
        r := gin.Default()

        r.POST("/clientes", func(c *gin.Context) {
                var dto Cliente
                // ShouldBindJSON valida e devolve erro pronto se algo falhar.
                if err := c.ShouldBindJSON(&dto); err != nil {
                        c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
                        return
                }
                c.JSON(http.StatusCreated, gin.H{"criado": dto})
        })

        _ = r.Run(":8080")
}
// curl -X POST -d '{"nome":"Ana","email":"ana@x.com","idade":25}' \\
//      http://localhost:8080/clientes`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"
        "strconv"

        "github.com/gin-gonic/gin"
)

// Agrupamento de rotas por versão é o padrão idiomático no Gin.
func main() {
        r := gin.Default()

        v1 := r.Group("/api/v1")
        {
                v1.GET("/produtos/:id", func(c *gin.Context) {
                        // c.Param lê variáveis de rota (sempre string).
                        id, err := strconv.Atoi(c.Param("id"))
                        if err != nil {
                                c.JSON(http.StatusBadRequest, gin.H{"erro": "id inválido"})
                                return
                        }
                        // c.Query lê query string ?busca=cafe
                        termo := c.DefaultQuery("busca", "")
                        c.JSON(http.StatusOK, gin.H{"id": id, "busca": termo})
                })
        }

        _ = r.Run(":8080")
}
// curl "http://localhost:8080/api/v1/produtos/7?busca=cafe"`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"

        "github.com/gin-gonic/gin"
)

// Upload de arquivo: o Gin abstrai multipart/form-data.
func main() {
        r := gin.Default()
        r.MaxMultipartMemory = 8 << 20 // 8 MiB

        r.POST("/upload", func(c *gin.Context) {
                arq, err := c.FormFile("arquivo")
                if err != nil {
                        c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
                        return
                }
                // Salva no disco. Em produção, use um bucket (S3, etc.).
                if err := c.SaveUploadedFile(arq, "./uploads/"+arq.Filename); err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
                        return
                }
                c.JSON(http.StatusOK, gin.H{"salvo": arq.Filename, "bytes": arq.Size})
        })

        _ = r.Run(":8080")
}`,
      },
    ],
    points: [
      "Gin é o framework web mais usado em Go: roteamento rápido e API ergonômica.",
      "gin.Default() já vem com middlewares de logging e recuperação de panics.",
      "Idiomático: declare DTOs como structs com tags json e binding.",
      "Use c.ShouldBindJSON para parsear e validar em uma única chamada.",
      "Agrupe rotas por versão com r.Group(\"/api/v1\") para manter a casa em ordem.",
      "c.Param lê variáveis de rota; c.Query lê query string; c.GetHeader lê cabeçalhos.",
      "Armadilha: usar c.BindJSON em vez de c.ShouldBindJSON — o primeiro escreve 400 sozinho e atrapalha o controle de erro.",
      "Erro comum: esquecer return depois de c.JSON com erro e continuar executando o handler.",
    ],
    alerts: [
      {
        type: "info",
        content: "O Gin processa cada requisição em uma goroutine, herdada do net/http. Você não cria threads manualmente; o runtime cuida disso de fábrica.",
      },
      {
        type: "tip",
        content: "Sempre que sua API crescer, separe handlers em pacotes (controllers/) e injete dependências por construtor. Isso facilita testes unitários sem precisar subir o servidor inteiro.",
      },
      {
        type: "warning",
        content: "gin.Default() em produção pode logar dados sensíveis no console. Em ambientes reais, configure um middleware de log estruturado (zap ou slog) e desligue o logger padrão.",
      },
    ],
  },
  {
    slug: "gin-rotas-middleware",
    section: "frameworks-web",
    title: "Gin: rotas avançadas e middlewares (JWT, CORS, recovery)",
    difficulty: "intermediario",
    subtitle: "Como organizar middlewares por escopo, autenticar com JWT e proteger contra panics",
    intro: `Construir um endpoint solto é fácil. O desafio começa quando você precisa exigir autenticação só em algumas rotas, liberar CORS para o frontend, registrar request-id em logs, capturar panics sem derrubar o processo e medir latência por endpoint. Essas preocupações transversais são feitas com middlewares — funções que se enfileiram e executam antes (e depois) do handler principal.

No Gin, um middleware é qualquer função com a assinatura func(c *gin.Context). Você decide se a requisição segue chamando c.Next() ou se aborta com c.AbortWithStatusJSON(). Esse modelo é parecido com o do Express (Node) e o do Koa, e bem mais simples que o de filtros do Spring. A ordem importa: middlewares registrados antes rodam antes; depois do c.Next, qualquer linha roda na volta, permitindo medir tempo total.

Para autenticação real, JWT (JSON Web Token) é o padrão de fato em APIs stateless. Você assina um token no login com uma chave secreta, o cliente o envia no cabeçalho Authorization: Bearer ..., e cada requisição valida a assinatura. A biblioteca github.com/golang-jwt/jwt/v5 é a escolha mais madura. CORS é resolvido por github.com/gin-contrib/cors. Tudo plugável.

Idiomático em Go é não esconder dependências em variáveis globais; passe a chave secreta, o pool de conexões e os clientes externos como parâmetros para o construtor do router. Isso facilita testes e evita aquele "porque diabos esse middleware está rodando aqui?" quando o time cresce.`,
    codes: [
      {
        lang: "bash",
        code: `# Instale dependências para JWT, CORS e Gin.
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
go get github.com/golang-jwt/jwt/v5`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"
        "time"

        "github.com/gin-gonic/gin"
)

// Middleware customizado: mede o tempo da requisição e loga.
func medirTempo() gin.HandlerFunc {
        return func(c *gin.Context) {
                inicio := time.Now()
                c.Next() // executa o resto da cadeia (handlers + middlewares depois)
                dur := time.Since(inicio)
                log.Printf("%s %s -> %d em %s",
                        c.Request.Method, c.Request.URL.Path, c.Writer.Status(), dur)
        }
}

func main() {
        r := gin.New()           // sem middlewares padrão
        r.Use(gin.Recovery())    // captura panics e devolve 500
        r.Use(medirTempo())      // o nosso, logo na frente

        r.GET("/ola", func(c *gin.Context) {
                c.JSON(200, gin.H{"oi": "mundo"})
        })
        _ = r.Run(":8080")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"
        "strings"
        "time"

        "github.com/gin-gonic/gin"
        "github.com/golang-jwt/jwt/v5"
)

var chaveSecreta = []byte("troque-isto-por-um-segredo-de-32-bytes!")

// Login fictício: gera um JWT válido por 1 hora.
func login(c *gin.Context) {
        claims := jwt.MapClaims{
                "sub": "usuario-42",
                "exp": time.Now().Add(time.Hour).Unix(),
        }
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
        assinado, err := token.SignedString(chaveSecreta)
        if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
                return
        }
        c.JSON(http.StatusOK, gin.H{"token": assinado})
}

// Middleware de autenticação: lê Bearer, valida e injeta o sub no contexto.
func autenticar() gin.HandlerFunc {
        return func(c *gin.Context) {
                h := c.GetHeader("Authorization")
                raw := strings.TrimPrefix(h, "Bearer ")
                if raw == "" || raw == h {
                        c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"erro": "sem token"})
                        return
                }
                tok, err := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
                        return chaveSecreta, nil // sempre confira o algoritmo em prod
                })
                if err != nil || !tok.Valid {
                        c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"erro": "token inválido"})
                        return
                }
                claims := tok.Claims.(jwt.MapClaims)
                c.Set("usuario", claims["sub"]) // disponível nos handlers
                c.Next()
        }
}

func main() {
        r := gin.Default()
        r.POST("/login", login)

        priv := r.Group("/api", autenticar())
        priv.GET("/perfil", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{"usuario": c.MustGet("usuario")})
        })
        _ = r.Run(":8080")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "time"

        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
)

// CORS permite que o navegador chame sua API de outro domínio.
// Sem isso, o frontend em localhost:3000 não consegue falar com :8080.
func main() {
        r := gin.Default()
        r.Use(cors.New(cors.Config{
                AllowOrigins:     []string{"https://meusite.com.br", "http://localhost:3000"},
                AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
                AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
                AllowCredentials: true,
                MaxAge:           12 * time.Hour,
        }))

        r.GET("/produtos", func(c *gin.Context) {
                c.JSON(200, []string{"café", "pão", "leite"})
        })
        _ = r.Run(":8080")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "github.com/gin-gonic/gin"
)

// gin.Recovery devolve 500 em caso de panic e loga o stack trace.
// Sem ele, um panic em uma goroutine derruba o processo inteiro.
func explode(c *gin.Context) {
        var p *int
        _ = *p // dereferência de nil → panic
}

func main() {
        r := gin.New()
        r.Use(gin.Recovery())
        r.GET("/bomba", explode)
        _ = r.Run(":8080")
}
// curl /bomba → 500, mas o processo continua vivo`,
      },
    ],
    points: [
      "Middleware é função (c *gin.Context); use c.Next() para seguir e c.Abort... para parar.",
      "Idiomático: aplicar middlewares por grupo (r.Group(\"/api\", auth())) em vez de globais quando dá.",
      "Sempre cheque o método de assinatura no jwt.Parse para evitar ataque de algoritmo \"none\".",
      "Use c.Set/c.Get para passar dados entre middleware e handler (ex.: id do usuário).",
      "CORS exige cabeçalhos exatos: AllowOrigins não aceita \"*\" se AllowCredentials for true.",
      "gin.Recovery evita que um panic derrube o processo inteiro do servidor.",
      "Armadilha: registrar middleware depois do handler — só vale quem foi registrado antes.",
      "Erro comum: deixar a chave JWT hardcoded no código; leia de variável de ambiente sempre.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca aceite tokens JWT sem validar o algoritmo dentro da função de chave. Existe um ataque clássico em que o cliente força \"alg\":\"none\" e passa sem assinatura.",
      },
      {
        type: "tip",
        content: "Padronize um middleware de erro que captura erros adicionados via c.Error e responde JSON consistente. Isso evita ter que repetir tratamento de erro em cada handler.",
      },
      {
        type: "info",
        content: "JWT é stateless: o servidor não guarda sessão. Para invalidar um token antes da expiração, mantenha uma blocklist em Redis ou troque a chave de assinatura.",
      },
    ],
  },
  {
    slug: "echo",
    section: "frameworks-web",
    title: "Echo: alternativa minimalista ao Gin",
    difficulty: "intermediario",
    subtitle: "Mesma proposta do Gin com API mais limpa, validação plugável e excelente desempenho",
    intro: `O Echo é o segundo framework web mais popular do mundo Go. Ele resolve o mesmo problema do Gin — roteamento, middlewares, helpers de resposta — com algumas diferenças de filosofia que fazem muita gente preferir. O contexto (echo.Context) é uma interface, e cada handler retorna error em vez de chamar abort. Esse pequeno ajuste deixa o fluxo de erro mais natural para quem vem do mundo Java/Spring ou do próprio Go idiomático, onde erros viajam pelo retorno.

Por baixo, o Echo usa um router próprio, também baseado em radix tree, com performance equivalente ao Gin em benchmarks reais. A diferença prática: a API do Echo é um pouco mais consistente, com nomes mais previsíveis (c.JSON, c.String, c.Bind, c.Validate), e o framework já vem com integração para validador externo (geralmente go-playground/validator), o que separa bem responsabilidades.

Para quem está começando, a recomendação honesta é: escolha Gin se está montando um time pequeno e quer a comunidade maior; escolha Echo se prefere um design mais limpo e menos surpresas. Ambos rodam em produção pesada — Uber, Cloudflare e muitas fintechs brasileiras usam um ou outro.

Idiomático no Echo é registrar um Validator no startup, devolver error nos handlers (o middleware HTTPErrorHandler converte para JSON) e usar grupos com middlewares específicos. Vamos montar uma API de carrinho de compras para ver tudo isso na prática.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/carrinho
go get github.com/labstack/echo/v4
go get github.com/go-playground/validator/v10`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"

        "github.com/labstack/echo/v4"
        "github.com/labstack/echo/v4/middleware"
)

func main() {
        e := echo.New()
        e.Use(middleware.Logger())   // log estruturado
        e.Use(middleware.Recover())  // captura panics

        e.GET("/saude", func(c echo.Context) error {
                // Note o return error — padrão Echo.
                return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
        })
        e.Logger.Fatal(e.Start(":8080"))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"

        "github.com/go-playground/validator/v10"
        "github.com/labstack/echo/v4"
)

type Item struct {
        Produto    string  ` + "`json:\"produto\" validate:\"required\"`" + `
        Quantidade int     ` + "`json:\"quantidade\" validate:\"required,gt=0\"`" + `
        Preco      float64 ` + "`json:\"preco\" validate:\"required,gt=0\"`" + `
}

// Adapter para o Echo conhecer nosso validador.
type ValidadorCustom struct{ v *validator.Validate }

func (vc *ValidadorCustom) Validate(i any) error { return vc.v.Struct(i) }

func main() {
        e := echo.New()
        e.Validator = &ValidadorCustom{v: validator.New()}

        e.POST("/carrinho", func(c echo.Context) error {
                var it Item
                if err := c.Bind(&it); err != nil {
                        return echo.NewHTTPError(http.StatusBadRequest, err.Error())
                }
                if err := c.Validate(&it); err != nil {
                        return echo.NewHTTPError(http.StatusUnprocessableEntity, err.Error())
                }
                return c.JSON(http.StatusCreated, it)
        })
        e.Logger.Fatal(e.Start(":8080"))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"

        "github.com/labstack/echo/v4"
        "github.com/labstack/echo/v4/middleware"
)

// Grupos com middleware específico, igual ao Gin mas com sintaxe mais direta.
func main() {
        e := echo.New()

        // /admin exige autenticação básica.
        admin := e.Group("/admin", middleware.BasicAuth(func(u, p string, c echo.Context) (bool, error) {
                return u == "admin" && p == "trocar-em-prod", nil
        }))
        admin.GET("/metricas", func(c echo.Context) error {
                return c.JSON(http.StatusOK, map[string]int{"pedidos_hoje": 1234})
        })

        // público
        e.GET("/produtos", func(c echo.Context) error {
                return c.JSON(http.StatusOK, []string{"café", "pão"})
        })
        e.Logger.Fatal(e.Start(":8080"))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "errors"
        "net/http"

        "github.com/labstack/echo/v4"
)

// Tratamento de erro centralizado: tudo cai aqui, resposta padronizada.
type ErroAPI struct {
        Codigo  string ` + "`json:\"codigo\"`" + `
        Mensagem string ` + "`json:\"mensagem\"`" + `
}

func main() {
        e := echo.New()
        e.HTTPErrorHandler = func(err error, c echo.Context) {
                var he *echo.HTTPError
                if errors.As(err, &he) {
                        _ = c.JSON(he.Code, ErroAPI{Codigo: "http", Mensagem: he.Message.(string)})
                        return
                }
                _ = c.JSON(http.StatusInternalServerError, ErroAPI{Codigo: "interno", Mensagem: err.Error()})
        }

        e.GET("/falhar", func(c echo.Context) error {
                return errors.New("simulação de erro de banco")
        })
        e.Logger.Fatal(e.Start(":8080"))
}`,
      },
    ],
    points: [
      "Echo é o segundo framework web mais popular do Go, com performance equivalente ao Gin.",
      "Handlers retornam error — combina com o estilo idiomático de Go.",
      "echo.Context é uma interface, mais fácil de mockar em testes.",
      "Idiomático: configure e.HTTPErrorHandler para padronizar respostas de erro em JSON.",
      "Validação é plugável via interface Validator (geralmente com go-playground/validator).",
      "Grupos (e.Group) recebem middlewares específicos sem afetar rotas públicas.",
      "Armadilha: esquecer de registrar e.Validator e chamar c.Validate — vai dar nil pointer.",
      "Erro comum: usar middleware.Logger() em produção sem configurar — gera log enorme demais.",
    ],
    alerts: [
      {
        type: "info",
        content: "Echo e Gin são funcionalmente equivalentes. A escolha costuma ser por preferência de API e tamanho da comunidade local. Conheça os dois e decida com base no time.",
      },
      {
        type: "tip",
        content: "Aproveite o retorno error dos handlers do Echo para criar erros tipados (errors.New, custom types) e tratá-los todos no HTTPErrorHandler central.",
      },
      {
        type: "warning",
        content: "BasicAuth é simples mas envia credenciais em base64 a cada request. Use somente atrás de TLS e prefira JWT ou OAuth para APIs voltadas ao público.",
      },
    ],
  },
  {
    slug: "fiber",
    section: "frameworks-web",
    title: "Fiber: framework inspirado no Express usando fasthttp",
    difficulty: "intermediario",
    subtitle: "Performance extrema com API familiar para quem vem de Node.js",
    intro: `O Fiber é o queridinho de quem migra do Node.js. A API foi desenhada para ser quase pixel-perfect com o Express: app.Get, app.Post, c.SendString, c.JSON, app.Use. Quem leu um livro de Express se sente em casa em meia hora. Mas a coisa mais importante para entender é o que está por baixo: o Fiber não usa o net/http padrão. Ele roda sobre fasthttp, uma reimplementação de servidor HTTP que troca compatibilidade total por velocidade pura.

Isso traz ganhos reais: em benchmarks sintéticos, fasthttp chega a 10x mais requisições por segundo que net/http em alguns cenários, com menos alocações. Mas traz custos: bibliotecas que esperam um http.ResponseWriter padrão (como middlewares de OpenTelemetry, integração com http.Handler de terceiros) não funcionam direto. Você precisa de adapters ou de equivalentes Fiber-específicos.

Quando o Fiber faz sentido? Cargas de altíssimo tráfego onde cada microssegundo conta — gateways, edge proxies, APIs públicas com milhões de RPS. Quando não faz? Projetos onde você se beneficia do ecossistema gigantesco do net/http (qualquer lib de tracing, métrica, ORM web, autenticação social). Para a maioria dos times, Gin ou Echo são escolhas mais seguras.

Idiomático no Fiber é abraçar o estilo Express: middlewares pequenos e encadeados, rotas agrupadas com app.Group, handlers curtos. Vamos montar um pequeno serviço de URL shortener para você sentir o gosto.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/encurtador
go get github.com/gofiber/fiber/v2
# Fiber baixa o fasthttp como dependência transitiva.`,
      },
      {
        lang: "go",
        code: `package main

import "github.com/gofiber/fiber/v2"

func main() {
        app := fiber.New(fiber.Config{
                AppName:      "Encurtador v1",
                ErrorHandler: func(c *fiber.Ctx, err error) error {
                        return c.Status(500).JSON(fiber.Map{"erro": err.Error()})
                },
        })

        app.Get("/saude", func(c *fiber.Ctx) error {
                return c.JSON(fiber.Map{"status": "ok"})
        })

        _ = app.Listen(":8080")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "sync"

        "github.com/gofiber/fiber/v2"
)

// Encurtador simples em memória. Em produção, troque por Redis ou Postgres.
var (
        mu     sync.RWMutex
        mapa   = map[string]string{}
)

type Entrada struct {
        URL string ` + "`json:\"url\"`" + `
}

func main() {
        app := fiber.New()

        app.Post("/encurtar", func(c *fiber.Ctx) error {
                var dto Entrada
                if err := c.BodyParser(&dto); err != nil {
                        return fiber.NewError(400, "json inválido")
                }
                codigo := gerar()
                mu.Lock()
                mapa[codigo] = dto.URL
                mu.Unlock()
                return c.JSON(fiber.Map{"codigo": codigo})
        })

        app.Get("/r/:codigo", func(c *fiber.Ctx) error {
                mu.RLock()
                destino, ok := mapa[c.Params("codigo")]
                mu.RUnlock()
                if !ok {
                        return fiber.ErrNotFound
                }
                return c.Redirect(destino, 302)
        })

        _ = app.Listen(":8080")
}

// Geração ingênua. Em produção use crypto/rand + base62.
func gerar() string {
        const letras = "abcdefghijklmnopqrstuvwxyz"
        b := make([]byte, 6)
        for i := range b {
                b[i] = letras[i%len(letras)]
        }
        return string(b)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "github.com/gofiber/fiber/v2"
        "github.com/gofiber/fiber/v2/middleware/logger"
        "github.com/gofiber/fiber/v2/middleware/recover"
)

// Middlewares oficiais do Fiber: logger, recover, cors, limiter, etc.
func main() {
        app := fiber.New()
        app.Use(logger.New())   // [info] GET /produtos 200 1.2ms
        app.Use(recover.New())  // captura panic

        api := app.Group("/api")
        v1 := api.Group("/v1")

        v1.Get("/produtos/:id", func(c *fiber.Ctx) error {
                return c.JSON(fiber.Map{
                        "id":   c.Params("id"),
                        "nome": "Café Especial",
                })
        })

        _ = app.Listen(":8080")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "time"

        "github.com/gofiber/fiber/v2"
        "github.com/gofiber/fiber/v2/middleware/limiter"
)

// Rate limit: protege endpoints contra abuso.
// 5 requisições por IP por minuto.
func main() {
        app := fiber.New()

        app.Use("/login", limiter.New(limiter.Config{
                Max:        5,
                Expiration: 1 * time.Minute,
                LimitReached: func(c *fiber.Ctx) error {
                        return c.Status(429).JSON(fiber.Map{"erro": "tente de novo em 1 minuto"})
                },
        }))

        app.Post("/login", func(c *fiber.Ctx) error {
                return c.JSON(fiber.Map{"token": "fake-jwt"})
        })

        _ = app.Listen(":8080")
}`,
      },
    ],
    points: [
      "Fiber é inspirado no Express e roda sobre fasthttp em vez de net/http.",
      "Performance bruta é maior que Gin/Echo em benchmarks, mas o ecossistema é menor.",
      "Idiomático no Fiber: usar middlewares oficiais (logger, recover, limiter, cors).",
      "c.BodyParser lê JSON, form e query baseado no Content-Type — versátil.",
      "fiber.NewError(status, msg) padroniza erros que caem no ErrorHandler global.",
      "Armadilha: tentar usar middleware http.Handler do net/http direto — incompatível.",
      "Erro comum: escolher Fiber sem precisar e perder bibliotecas maduras de observabilidade.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Como o Fiber não usa net/http, integrações com OpenTelemetry, Prometheus ou bibliotecas de auth tradicionais podem exigir adaptadores específicos (fiberzap, fiberprometheus, etc).",
      },
      {
        type: "tip",
        content: "Se você não tem requisito de performance extrema (acima de 50k RPS por instância), Gin ou Echo entregam mais ecossistema com performance mais que suficiente.",
      },
      {
        type: "info",
        content: "fasthttp reusa objetos de request/response por baixo dos panos. Não guarde referências ao c (*fiber.Ctx) fora do handler — elas serão sobrescritas.",
      },
    ],
  },
  {
    slug: "chi-router",
    section: "frameworks-web",
    title: "chi: roteador idiomático sobre net/http",
    difficulty: "intermediario",
    subtitle: "Compatibilidade total com a stdlib, sub-rotas elegantes e middlewares 100% padrão",
    intro: `Se Gin, Echo e Fiber parecem framework demais para você, o chi é a resposta. Ele é apenas um roteador — só isso — construído inteiramente sobre o net/http. Os handlers continuam sendo http.Handler padrão. Os middlewares continuam sendo func(http.Handler) http.Handler. Você não aprende uma API nova; você aprende um superpoder do que já existe.

A vantagem? Compatibilidade total. Qualquer coisa do ecossistema net/http (handlers de pprof, prometheus, ServeMux original, autenticação OAuth com bibliotecas padrão) pluga sem esforço. Não tem context novo, não tem helper proprietário, não tem mágica. É Go puro com roteamento melhor.

A desvantagem? Você escreve um pouco mais. json.NewEncoder(w).Encode(obj) em vez de c.JSON. Mas para times que valorizam não ficar amarrados a um framework, e que sabem que frameworks somem (lembre do Negroni, do Goji), o chi é a escolha racional. Aliás, os autores do chi também escreveram o roteador interno do Twitch e do Heroku.

Idiomático com chi é abraçar sub-routers para isolar contextos: r.Route("/admin", func(r chi.Router) { ... }). Vamos construir uma API de notas fiscais para você ver como esse padrão fica claro mesmo com dezenas de endpoints.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/notas
go get github.com/go-chi/chi/v5
go get github.com/go-chi/chi/v5/middleware`,
      },
      {
        lang: "go",
        code: `package main

import (
        "encoding/json"
        "net/http"

        "github.com/go-chi/chi/v5"
        "github.com/go-chi/chi/v5/middleware"
)

func main() {
        r := chi.NewRouter()
        r.Use(middleware.Logger)         // log padrão chi
        r.Use(middleware.Recoverer)      // recupera panics
        r.Use(middleware.RequestID)      // X-Request-ID em cada req

        r.Get("/saude", func(w http.ResponseWriter, req *http.Request) {
                w.Header().Set("Content-Type", "application/json")
                _ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
        })

        _ = http.ListenAndServe(":8080", r)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "encoding/json"
        "net/http"

        "github.com/go-chi/chi/v5"
)

// Sub-routers: forma idiomática de separar áreas da API.
func main() {
        r := chi.NewRouter()

        r.Route("/api/v1", func(r chi.Router) {
                r.Route("/notas", func(r chi.Router) {
                        r.Get("/", listarNotas)
                        r.Post("/", criarNota)
                        r.Route("/{id}", func(r chi.Router) {
                                r.Get("/", obterNota)
                                r.Delete("/", excluirNota)
                        })
                })
        })

        _ = http.ListenAndServe(":8080", r)
}

func listarNotas(w http.ResponseWriter, r *http.Request) {
        _ = json.NewEncoder(w).Encode([]string{"NF-1", "NF-2"})
}
func criarNota(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(201)
        _ = json.NewEncoder(w).Encode(map[string]string{"criada": "NF-3"})
}
func obterNota(w http.ResponseWriter, r *http.Request) {
        id := chi.URLParam(r, "id") // pega {id}
        _ = json.NewEncoder(w).Encode(map[string]string{"nota": id})
}
func excluirNota(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(204)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "net/http"
        "strings"

        "github.com/go-chi/chi/v5"
)

// Middleware de autenticação 100% net/http puro.
type ctxChave string

const usuarioChave ctxChave = "usuario"

func autenticar(prox http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
                if token == "" {
                        http.Error(w, "sem token", http.StatusUnauthorized)
                        return
                }
                // Em prod: valide o JWT. Aqui, simplificamos.
                ctx := context.WithValue(r.Context(), usuarioChave, "ana@exemplo.com")
                prox.ServeHTTP(w, r.WithContext(ctx))
        })
}

func main() {
        r := chi.NewRouter()

        r.Group(func(r chi.Router) {
                r.Use(autenticar)
                r.Get("/perfil", func(w http.ResponseWriter, r *http.Request) {
                        u := r.Context().Value(usuarioChave).(string)
                        _, _ = w.Write([]byte("oi " + u))
                })
        })

        _ = http.ListenAndServe(":8080", r)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "net/http"
        "net/http/pprof"

        "github.com/go-chi/chi/v5"
)

// Bônus: como chi é net/http puro, pluga pprof direto para profiling.
func main() {
        r := chi.NewRouter()

        r.Mount("/debug", debugRouter())
        r.Get("/", func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write([]byte("ok")) })

        _ = http.ListenAndServe(":8080", r)
}

func debugRouter() http.Handler {
        r := chi.NewRouter()
        r.HandleFunc("/pprof/*", pprof.Index)
        r.HandleFunc("/pprof/profile", pprof.Profile)
        return r
}
// Acesse http://localhost:8080/debug/pprof/ para inspecionar goroutines, heap, etc.`,
      },
    ],
    points: [
      "chi é apenas um roteador sobre net/http: zero novas APIs para aprender.",
      "Compatível com qualquer http.Handler e qualquer middleware do ecossistema padrão.",
      "Idiomático: use r.Route para criar sub-routers que isolam contexto e middlewares.",
      "chi.URLParam(r, \"nome\") lê variáveis declaradas como {nome} na rota.",
      "r.Group permite aplicar middleware a um conjunto de rotas sem mudar prefixo.",
      "Excelente para times que querem evitar lock-in com framework de longo prazo.",
      "Armadilha: misturar chi com handlers que esperam gin.Context — incompatível, é outra arquitetura.",
      "Erro comum: esquecer de chamar middleware.Recoverer e deixar panic derrubar o servidor.",
    ],
    alerts: [
      {
        type: "success",
        content: "chi é mantido pelos engenheiros do antigo Pressly e foi usado em produção em sistemas críticos como Twitch e Heroku. É código maduro e estável há anos.",
      },
      {
        type: "tip",
        content: "Se você está em dúvida entre Gin e chi, pense em quem mantém o serviço. Chi exige um pouco mais de digitação mas mantém você dentro do net/http padrão para sempre.",
      },
      {
        type: "info",
        content: "chi suporta wildcards (*), validação de regex em parâmetros e sub-routers ilimitados. Tudo isso sem sair da assinatura padrão http.Handler.",
      },
    ],
  },
  {
    slug: "gorm",
    section: "frameworks-web",
    title: "GORM: ORM completo para Go",
    difficulty: "intermediario",
    subtitle: "Mapear structs para tabelas, gerenciar relacionamentos e migrações sem escrever SQL",
    intro: `GORM é o ORM (Object-Relational Mapper) mais usado em Go. Ele faz o que você espera de um ORM: mapeia structs em tabelas, gera SELECTs e INSERTs automaticamente, lida com relacionamentos (HasOne, HasMany, ManyToMany), aplica migrações e te dá hooks para validação. Comparado a SQLAlchemy do Python ou Hibernate do Java, ele é mais leve em termos de mágica, mas oferece muito mais ergonomia que escrever SQL puro.

A filosofia do GORM é: comece simples, escape para SQL quando precisar. Você define uma struct com tags, chama db.AutoMigrate(&Usuario{}) e a tabela é criada. Para buscar, db.First(&user, id). Para criar, db.Create(&novoUsuario). Para querys complexas, ainda dá para fazer db.Raw("SELECT ...").Scan(&result). Você não fica preso.

Vale uma honestidade aqui: muito desenvolvedor Go experiente prefere sqlx ou pgx puro porque acha o GORM "mágico demais" para o estilo da linguagem. Não há resposta universal. Para projetos com muitas entidades e relacionamentos clássicos (CRUD de admin, ERP), GORM economiza muita digitação. Para projetos com queries pesadas e otimizações específicas, SQL puro vence.

Idiomático com GORM: defina seus modelos com gorm.Model embutido para ganhar ID, CreatedAt, UpdatedAt, DeletedAt automaticamente; use Preload para carregar relacionamentos explicitamente (cuidado com N+1!); e isole o GORM em uma camada de repositório, nunca espalhe pelos handlers.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/loja
go get gorm.io/gorm
go get gorm.io/driver/sqlite   # sem CGO: troque por modernc.org/sqlite se precisar
go get gorm.io/driver/postgres # ou postgres em produção`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "gorm.io/driver/sqlite"
        "gorm.io/gorm"
)

// gorm.Model embute ID uint, CreatedAt, UpdatedAt, DeletedAt.
type Produto struct {
        gorm.Model
        Nome  string  ` + "`gorm:\"size:120;not null\"`" + `
        Preco float64 ` + "`gorm:\"not null\"`" + `
}

func main() {
        db, err := gorm.Open(sqlite.Open("loja.db"), &gorm.Config{})
        if err != nil {
                log.Fatal(err)
        }
        // AutoMigrate cria/atualiza a tabela conforme a struct.
        _ = db.AutoMigrate(&Produto{})

        db.Create(&Produto{Nome: "Café", Preco: 18.50})

        var p Produto
        db.First(&p, "nome = ?", "Café")
        log.Println("achei:", p.ID, p.Nome, p.Preco)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "gorm.io/driver/sqlite"
        "gorm.io/gorm"
)

// Relacionamento 1-N: um Cliente tem muitos Pedidos.
type Cliente struct {
        gorm.Model
        Nome    string
        Pedidos []Pedido // GORM detecta o nome ClienteID em Pedido como FK
}

type Pedido struct {
        gorm.Model
        Total     float64
        ClienteID uint // chave estrangeira
}

func main() {
        db, _ := gorm.Open(sqlite.Open("loja.db"), &gorm.Config{})
        _ = db.AutoMigrate(&Cliente{}, &Pedido{})

        c := Cliente{Nome: "Bruno", Pedidos: []Pedido{
                {Total: 199.90}, {Total: 49.00},
        }}
        db.Create(&c) // GORM insere cliente E pedidos em uma transação

        var visivel Cliente
        // Preload: carrega o relacionamento explicitamente. Sem ele, Pedidos vem vazio.
        db.Preload("Pedidos").First(&visivel, c.ID)
        log.Printf("cliente %s tem %d pedidos\\n", visivel.Nome, len(visivel.Pedidos))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "gorm.io/driver/sqlite"
        "gorm.io/gorm"
)

type Produto struct {
        gorm.Model
        Nome  string
        Preco float64
}

func main() {
        db, _ := gorm.Open(sqlite.Open("loja.db"), &gorm.Config{})
        _ = db.AutoMigrate(&Produto{})

        // Where, Order, Limit encadeados.
        var caros []Produto
        db.Where("preco > ?", 50).Order("preco desc").Limit(10).Find(&caros)
        log.Println("produtos caros:", len(caros))

        // Update parcial só dos campos especificados.
        db.Model(&Produto{}).Where("nome = ?", "Café").Update("preco", 22.00)

        // Soft delete: GORM não apaga; preenche DeletedAt.
        db.Where("nome = ?", "Café").Delete(&Produto{})

        // Para incluir registros soft-deletados, use Unscoped.
        var todos []Produto
        db.Unscoped().Find(&todos)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "errors"
        "log"

        "gorm.io/driver/sqlite"
        "gorm.io/gorm"
)

type Conta struct {
        ID      uint
        Titular string
        Saldo   float64
}

// Transação: tudo ou nada. Padrão clássico de transferência bancária.
func transferir(db *gorm.DB, deID, paraID uint, valor float64) error {
        return db.Transaction(func(tx *gorm.DB) error {
                var origem, destino Conta
                if err := tx.First(&origem, deID).Error; err != nil {
                        return err
                }
                if err := tx.First(&destino, paraID).Error; err != nil {
                        return err
                }
                if origem.Saldo < valor {
                        return errors.New("saldo insuficiente")
                }
                if err := tx.Model(&origem).Update("saldo", origem.Saldo-valor).Error; err != nil {
                        return err
                }
                return tx.Model(&destino).Update("saldo", destino.Saldo+valor).Error
        })
}

func main() {
        db, _ := gorm.Open(sqlite.Open("banco.db"), &gorm.Config{})
        _ = db.AutoMigrate(&Conta{})
        if err := transferir(db, 1, 2, 100.00); err != nil {
                log.Println("falhou:", err)
        }
}`,
      },
    ],
    points: [
      "GORM é o ORM mais popular do Go: mapeamento, migrations, relacionamentos.",
      "gorm.Model embute ID, CreatedAt, UpdatedAt, DeletedAt automaticamente.",
      "Idiomático: isole GORM em camada de repositório, não use direto nos handlers.",
      "Preload é obrigatório para carregar relacionamentos — sem ele vem vazio.",
      "Use db.Transaction(func(tx *gorm.DB) error {...}) para operações atômicas.",
      "Soft delete é padrão (preenche DeletedAt); use Unscoped para incluir apagados.",
      "Armadilha: chamar Find sem Preload e fazer N+1 queries no relacionamento.",
      "Erro comum: AutoMigrate em produção sem revisar — pode dropar índice ou recriar coluna.",
    ],
    alerts: [
      {
        type: "warning",
        content: "AutoMigrate é cômodo em desenvolvimento mas perigoso em produção. Para sistemas reais, use ferramentas como golang-migrate ou Atlas para versionar mudanças de schema.",
      },
      {
        type: "tip",
        content: "Sempre que escrever uma query com GORM, ative db.Debug().Find(...) durante o desenvolvimento. Você verá o SQL gerado e vai pegar N+1 e queries gordas rapidinho.",
      },
      {
        type: "info",
        content: "GORM tem fama de mágico, mas dá para fugir para SQL puro com db.Raw e db.Exec quando precisar de performance ou queries complexas. Não é tudo ou nada.",
      },
    ],
  },
  {
    slug: "sqlx",
    section: "frameworks-web",
    title: "sqlx: SQL puro com escaneamento direto em structs",
    difficulty: "intermediario",
    subtitle: "Meio termo entre database/sql cru e ORM completo, sem mágica",
    intro: `O sqlx é uma extensão minimalista do pacote padrão database/sql. Ele não é um ORM. Não cria tabelas para você. Não inventa um DSL de query. Ele apenas adiciona dois superpoderes que faltam no padrão: escanear linhas direto em structs e fazer parâmetros nomeados em queries. Para muito desenvolvedor Go sênior, esse é o ponto doce — você escreve o SQL que quer, mas não precisa repetir Scan(&u.ID, &u.Nome, &u.Email) trinta vezes.

A filosofia é totalmente alinhada ao Go: dependência fina, zero geração de código, zero reflection magic. As structs usam tags db:"nome_da_coluna" para mapear, e pronto. Você usa todos os recursos que já conhece de database/sql (transações, prepared statements, contexto), com um pequeno polimento.

Quando preferir sqlx em vez de GORM? Quando a equipe tem afinidade com SQL e quer controle preciso sobre cada query, sem surpresas de N+1 ou over-fetching. Quando preferir em vez de pgx puro? Quando você quer ficar agnóstico de banco (sqlx funciona com Postgres, MySQL, SQLite, SQL Server) e quer suporte direto para bind por nome.

Idiomático com sqlx: defina structs com tags db; use NamedQuery para queries grandes; sempre passe context.Context (sqlx.QueryxContext, etc.) para suportar cancelamento; e mantenha as queries em arquivos .sql ou constantes nomeadas em vez de espalhar string por todo lado.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/cadastro
go get github.com/jmoiron/sqlx
go get github.com/lib/pq          # driver postgres
# ou para sqlite:
# go get modernc.org/sqlite`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "github.com/jmoiron/sqlx"
        _ "github.com/lib/pq"
)

// Tags db mapeiam coluna para campo.
type Usuario struct {
        ID    int    ` + "`db:\"id\"`" + `
        Nome  string ` + "`db:\"nome\"`" + `
        Email string ` + "`db:\"email\"`" + `
}

func main() {
        db, err := sqlx.Connect("postgres", "host=localhost user=app dbname=app sslmode=disable")
        if err != nil {
                log.Fatal(err)
        }

        var u Usuario
        // Get popula uma única struct. Ele faz query + scan numa chamada.
        err = db.Get(&u, "SELECT id, nome, email FROM usuarios WHERE id=$1", 1)
        if err != nil {
                log.Fatal(err)
        }
        log.Println(u)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "github.com/jmoiron/sqlx"
        _ "github.com/lib/pq"
)

type Pedido struct {
        ID    int     ` + "`db:\"id\"`" + `
        Total float64 ` + "`db:\"total\"`" + `
}

func main() {
        db := sqlx.MustConnect("postgres", "...")

        // Select popula um slice. Sem reflection mágica de relacionamento.
        var pedidos []Pedido
        err := db.Select(&pedidos, "SELECT id, total FROM pedidos WHERE total > $1", 100.0)
        if err != nil {
                log.Fatal(err)
        }
        for _, p := range pedidos {
                log.Printf("pedido %d -> R$ %.2f\\n", p.ID, p.Total)
        }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "github.com/jmoiron/sqlx"
        _ "github.com/lib/pq"
)

// Parâmetros nomeados: muito mais legível que $1, $2, $3...
type Cliente struct {
        Nome  string ` + "`db:\"nome\"`" + `
        Email string ` + "`db:\"email\"`" + `
        Idade int    ` + "`db:\"idade\"`" + `
}

func main() {
        db := sqlx.MustConnect("postgres", "...")

        c := Cliente{Nome: "Carla", Email: "carla@x.com", Idade: 30}

        // NamedExec usa :nome, :email, :idade — mapeia direto da struct.
        _, err := db.NamedExec(
                "INSERT INTO clientes (nome, email, idade) VALUES (:nome, :email, :idade)", c)
        if err != nil {
                log.Fatal(err)
        }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "log"

        "github.com/jmoiron/sqlx"
        _ "github.com/lib/pq"
)

type Conta struct {
        ID    int     ` + "`db:\"id\"`" + `
        Saldo float64 ` + "`db:\"saldo\"`" + `
}

// Transação clássica usando sqlx, igual ao database/sql padrão.
func sacar(db *sqlx.DB, contaID int, valor float64) error {
        tx, err := db.Beginx()
        if err != nil {
                return err
        }
        defer tx.Rollback() // rollback é seguro mesmo após Commit (vira no-op)

        var c Conta
        if err := tx.Get(&c, "SELECT id, saldo FROM contas WHERE id=$1 FOR UPDATE", contaID); err != nil {
                return err
        }
        if c.Saldo < valor {
                return log.Output(1, "saldo insuficiente")
        }
        if _, err := tx.Exec("UPDATE contas SET saldo = saldo - $1 WHERE id = $2", valor, contaID); err != nil {
                return err
        }
        return tx.Commit()
}

func main() {
        db := sqlx.MustConnect("postgres", "...")
        if err := sacar(db, 1, 50); err != nil {
                log.Println("erro:", err)
        }
}`,
      },
    ],
    points: [
      "sqlx é uma camada fina sobre database/sql: SQL puro + scan direto em structs.",
      "Não é ORM: sem migration, sem mapeamento de relacionamento mágico.",
      "Use Get para uma linha, Select para várias — ambos populam structs com tag db.",
      "Idiomático: prefira NamedExec/NamedQuery em queries com vários parâmetros.",
      "Funciona com qualquer banco que tenha driver database/sql (Postgres, MySQL, SQLite).",
      "Compatível com sqlx.Tx para transações, semelhante ao database/sql padrão.",
      "Armadilha: esquecer a tag db numa coluna com nome diferente do campo — vira NULL silencioso.",
      "Erro comum: passar valor por valor em vez de ponteiro para Get/Select — não preenche.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Mantenha suas queries em constantes ou arquivos .sql separados. Strings de SQL espalhadas pelos handlers viram um inferno para revisar e migrar de banco depois.",
      },
      {
        type: "info",
        content: "sqlx é mantido pelo mesmo autor do gorilla/mux e tem API estável há quase uma década. Excelente escolha para times que valorizam SQL explícito.",
      },
      {
        type: "warning",
        content: "sqlx.MustConnect dá panic em caso de falha, ótimo para main, péssimo dentro de handlers. Use sqlx.Connect e trate o erro normalmente em código de runtime.",
      },
    ],
  },
  {
    slug: "database-sql",
    section: "frameworks-web",
    title: "database/sql: a base de tudo",
    difficulty: "intermediario",
    subtitle: "O pacote padrão que abstrai bancos relacionais com pool de conexões e transações",
    intro: `Antes de qualquer ORM ou helper, todos os caminhos no Go passam pelo pacote database/sql da biblioteca padrão. Ele é o que define a interface que drivers (postgres, mysql, sqlite) implementam. Quando você usa GORM, sqlx ou pgx em modo compatibilidade, está usando database/sql por baixo. Entender esse pacote te dá superpoder para depurar qualquer camada acima.

O modelo é simples: você abre um *sql.DB que representa um pool de conexões (não uma conexão única — repare, isso pega muita gente de surpresa vinda do Java/JDBC). O pool é gerenciado para você: ele abre, reutiliza e fecha conexões conforme a demanda. Você só configura limites: SetMaxOpenConns, SetMaxIdleConns, SetConnMaxLifetime.

As operações principais são db.QueryContext (várias linhas), db.QueryRowContext (uma linha), db.ExecContext (INSERT/UPDATE/DELETE). Todos aceitam context.Context, o que permite cancelar queries lentas ou aplicar timeouts. Para cada *sql.Rows que você abrir, é obrigatório chamar rows.Close() — esquecer isso vaza conexão do pool e seu serviço cai em produção.

Idiomático em Go é sempre usar Context, sempre fechar Rows com defer, e configurar limites do pool conforme o tamanho do banco. database/sql parece verboso comparado a Python ou Ruby, mas ele te força a tomar decisões explícitas sobre alocação e ciclo de vida — o que evita problemas chatos lá na frente.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/raw-sql
go get github.com/lib/pq          # driver Postgres clássico
# ou go get github.com/jackc/pgx/v5/stdlib  para usar pgx em modo compat`,
      },
      {
        lang: "go",
        code: `package main

import (
        "database/sql"
        "log"
        "time"

        _ "github.com/lib/pq" // import com _ só para registrar o driver
)

func main() {
        db, err := sql.Open("postgres",
                "host=localhost user=app password=secret dbname=app sslmode=disable")
        if err != nil {
                log.Fatal(err)
        }
        defer db.Close()

        // Configurar o pool é parte do trabalho, não opcional.
        db.SetMaxOpenConns(25)
        db.SetMaxIdleConns(5)
        db.SetConnMaxLifetime(5 * time.Minute)

        if err := db.Ping(); err != nil {
                log.Fatal("não conectou:", err)
        }
        log.Println("conectado!")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "database/sql"
        "log"
        "time"

        _ "github.com/lib/pq"
)

// QueryRowContext: uma única linha de resultado.
func buscarEmail(db *sql.DB, id int) (string, error) {
        ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
        defer cancel()

        var email string
        err := db.QueryRowContext(ctx,
                "SELECT email FROM usuarios WHERE id = $1", id).Scan(&email)
        if err == sql.ErrNoRows {
                return "", nil // não achou — não é erro fatal
        }
        return email, err
}

func main() {
        db, _ := sql.Open("postgres", "...")
        defer db.Close()
        email, err := buscarEmail(db, 1)
        if err != nil {
                log.Fatal(err)
        }
        log.Println("email:", email)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "database/sql"
        "log"

        _ "github.com/lib/pq"
)

type Produto struct {
        ID    int
        Nome  string
        Preco float64
}

// QueryContext: várias linhas. Cuidado para fechar Rows!
func listarProdutos(ctx context.Context, db *sql.DB) ([]Produto, error) {
        rows, err := db.QueryContext(ctx,
                "SELECT id, nome, preco FROM produtos WHERE preco > $1", 0.0)
        if err != nil {
                return nil, err
        }
        defer rows.Close() // OBRIGATÓRIO — vaza conexão do pool sem isso

        var out []Produto
        for rows.Next() {
                var p Produto
                if err := rows.Scan(&p.ID, &p.Nome, &p.Preco); err != nil {
                        return nil, err
                }
                out = append(out, p)
        }
        // rows.Err captura erro que aconteceu durante a iteração.
        return out, rows.Err()
}

func main() {
        db, _ := sql.Open("postgres", "...")
        defer db.Close()
        produtos, err := listarProdutos(context.Background(), db)
        if err != nil {
                log.Fatal(err)
        }
        log.Println("total:", len(produtos))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "database/sql"
        "errors"
        "log"

        _ "github.com/lib/pq"
)

// Transação: BeginTx + Commit/Rollback. Padrão direto e sem mágica.
func transferir(ctx context.Context, db *sql.DB, de, para int, valor float64) error {
        tx, err := db.BeginTx(ctx, nil)
        if err != nil {
                return err
        }
        // Rollback após Commit é no-op, então usar defer aqui é seguro.
        defer tx.Rollback()

        var saldo float64
        if err := tx.QueryRowContext(ctx,
                "SELECT saldo FROM contas WHERE id=$1 FOR UPDATE", de).Scan(&saldo); err != nil {
                return err
        }
        if saldo < valor {
                return errors.New("saldo insuficiente")
        }
        if _, err := tx.ExecContext(ctx,
                "UPDATE contas SET saldo = saldo - $1 WHERE id = $2", valor, de); err != nil {
                return err
        }
        if _, err := tx.ExecContext(ctx,
                "UPDATE contas SET saldo = saldo + $1 WHERE id = $2", valor, para); err != nil {
                return err
        }
        return tx.Commit()
}

func main() {
        db, _ := sql.Open("postgres", "...")
        defer db.Close()
        if err := transferir(context.Background(), db, 1, 2, 50); err != nil {
                log.Println("falhou:", err)
        }
}`,
      },
    ],
    points: [
      "*sql.DB é um pool de conexões, não uma conexão única — abra uma vez e reuse.",
      "Configure SetMaxOpenConns, SetMaxIdleConns, SetConnMaxLifetime sempre.",
      "Idiomático: passe context.Context para todas as queries (QueryContext, ExecContext).",
      "Sempre defer rows.Close() — esquecer vaza conexão do pool e mata o serviço.",
      "sql.ErrNoRows distingue \"não achou\" de erro real; trate explicitamente.",
      "Use BeginTx + Commit/Rollback para operações atômicas; defer Rollback é seguro.",
      "Armadilha: usar sql.Open dentro de cada handler. Abra db uma vez no main e injete.",
      "Erro comum: confiar que sql.Open conecta — ele só prepara o pool. Use Ping para validar.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer rows.Close() é o vazamento mais comum em código Go com banco. Os pools não fazem mágica: a conexão fica presa até GC ou timeout do banco.",
      },
      {
        type: "info",
        content: "sql.Open não abre conexão de fato — ele só prepara o pool. A primeira conexão acontece na primeira query ou quando você chamar db.Ping().",
      },
      {
        type: "tip",
        content: "Use sempre placeholders ($1, $2 para Postgres; ? para MySQL/SQLite) em vez de concatenar strings. Isso protege contra SQL injection sem precisar pensar.",
      },
    ],
  },
  {
    slug: "postgres-pgx",
    section: "frameworks-web",
    title: "pgx: driver moderno para PostgreSQL",
    difficulty: "avancado",
    subtitle: "Performance superior, suporte nativo a tipos do Postgres e API enxuta",
    intro: `O pgx é o driver Postgres mais avançado do ecossistema Go. Ele tem dois modos: como driver para database/sql (jackc/pgx/v5/stdlib) ou usando sua API nativa (jackc/pgx/v5). No modo nativo, você ganha desempenho consideravelmente maior, suporte direto aos tipos exclusivos do Postgres (jsonb, arrays, hstore, intervalos, tipos compostos), batch queries, COPY de alta performance e LISTEN/NOTIFY para mensageria leve.

A diferença prática? Um benchmark típico mostra pgx nativo com latência 30-50% menor que lib/pq em consultas simples e diferença ainda maior em inserções em lote. Para sistemas com volume alto, isso é dinheiro real economizado em servidores.

A API nativa é parecida mas não igual ao database/sql. Você usa pgxpool.Pool em vez de sql.DB, conn.Query devolve pgx.Rows com método Scan compatível, e há helpers para lidar com tipos Postgres-específicos sem precisar de codecs externos. Para jsonb, por exemplo, você passa map[string]any direto e ele serializa por baixo.

Idiomático com pgx é usar pgxpool no startup, sempre passar context, escapar para SQL puro quando possível e aproveitar features avançadas (CopyFrom para inserção em massa, SendBatch para enviar várias queries em uma round-trip). Se seu projeto roda só em Postgres, vale a pena usar a API nativa.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/postgres-app
go get github.com/jackc/pgx/v5
go get github.com/jackc/pgx/v5/pgxpool`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"

        "github.com/jackc/pgx/v5/pgxpool"
)

func main() {
        ctx := context.Background()

        // pgxpool gerencia o pool nativamente, sem passar por database/sql.
        pool, err := pgxpool.New(ctx, "postgres://app:secret@localhost:5432/app")
        if err != nil {
                log.Fatal(err)
        }
        defer pool.Close()

        var versao string
        err = pool.QueryRow(ctx, "SELECT version()").Scan(&versao)
        if err != nil {
                log.Fatal(err)
        }
        log.Println(versao)
        // → PostgreSQL 16.2 on x86_64-pc-linux-gnu, ...
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"

        "github.com/jackc/pgx/v5"
        "github.com/jackc/pgx/v5/pgxpool"
)

type Pedido struct {
        ID     int
        Cliente string
        Itens  []string  // pgx serializa array do Postgres direto.
        Total  float64
}

func main() {
        ctx := context.Background()
        pool, _ := pgxpool.New(ctx, "postgres://...")
        defer pool.Close()

        rows, err := pool.Query(ctx, ` + "`SELECT id, cliente, itens, total FROM pedidos WHERE total > $1`" + `, 50.0)
        if err != nil {
                log.Fatal(err)
        }
        defer rows.Close()

        // CollectRows com função de mapeamento — ergonômico e seguro.
        pedidos, err := pgx.CollectRows(rows, func(r pgx.CollectableRow) (Pedido, error) {
                var p Pedido
                err := r.Scan(&p.ID, &p.Cliente, &p.Itens, &p.Total)
                return p, err
        })
        if err != nil {
                log.Fatal(err)
        }
        log.Println("achei", len(pedidos), "pedidos")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"

        "github.com/jackc/pgx/v5"
        "github.com/jackc/pgx/v5/pgxpool"
)

// CopyFrom: inserção em massa muito mais rápida que INSERTs em loop.
// Para milhões de linhas, é a diferença entre minutos e segundos.
func main() {
        ctx := context.Background()
        pool, _ := pgxpool.New(ctx, "postgres://...")
        defer pool.Close()

        linhas := [][]any{
                {"Café", 18.50},
                {"Pão", 0.80},
                {"Leite", 5.20},
        }

        n, err := pool.CopyFrom(ctx,
                pgx.Identifier{"produtos"},
                []string{"nome", "preco"},
                pgx.CopyFromRows(linhas),
        )
        if err != nil {
                log.Fatal(err)
        }
        log.Printf("inseri %d linhas em modo COPY\\n", n)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "encoding/json"
        "log"

        "github.com/jackc/pgx/v5/pgxpool"
)

// jsonb nativo: passe map[string]any direto, pgx serializa.
type Evento struct {
        ID    int
        Tipo  string
        Dados map[string]any
}

func main() {
        ctx := context.Background()
        pool, _ := pgxpool.New(ctx, "postgres://...")
        defer pool.Close()

        dados := map[string]any{"ip": "10.0.0.1", "user_agent": "curl/8.0"}
        _, err := pool.Exec(ctx,
                "INSERT INTO eventos (tipo, dados) VALUES ($1, $2)",
                "login", dados)
        if err != nil {
                log.Fatal(err)
        }

        var ev Evento
        err = pool.QueryRow(ctx,
                "SELECT id, tipo, dados FROM eventos ORDER BY id DESC LIMIT 1").
                Scan(&ev.ID, &ev.Tipo, &ev.Dados)
        if err != nil {
                log.Fatal(err)
        }
        b, _ := json.Marshal(ev)
        log.Println(string(b))
}`,
      },
    ],
    points: [
      "pgx é o driver Postgres mais performático do Go, com modo nativo e modo database/sql.",
      "Use pgxpool.Pool no startup; ele gerencia conexões e statements preparados.",
      "Idiomático: prefira a API nativa quando seu projeto for exclusivo do Postgres.",
      "CopyFrom é dramaticamente mais rápido que INSERTs em loop para cargas grandes.",
      "Suporta jsonb, arrays, hstore, intervals nativamente sem codec extra.",
      "pgx.CollectRows com função de mapeamento moderniza o velho for rows.Next().",
      "Armadilha: misturar API nativa e database/sql na mesma aplicação — confunde mantenedores.",
      "Erro comum: usar pgxpool.New sem fechar com defer pool.Close() — vaza conexões ao reiniciar.",
    ],
    alerts: [
      {
        type: "success",
        content: "pgx é mantido por Jack Christensen e usado em produção em sistemas como Cloudflare e CockroachDB. É a escolha técnica certa para qualquer projeto Postgres-only em Go.",
      },
      {
        type: "tip",
        content: "Para LISTEN/NOTIFY (mensageria leve usando Postgres), pgx tem suporte direto via conn.WaitForNotification. Substitui muito caso de uso simples sem precisar de Redis ou RabbitMQ.",
      },
      {
        type: "warning",
        content: "A versão v5 do pgx mudou várias APIs em relação à v4. Ao seguir tutoriais, confira sempre a versão; código antigo de v4 quebra silenciosamente em alguns pontos.",
      },
    ],
  },
  {
    slug: "sqlite-go",
    section: "frameworks-web",
    title: "SQLite no Go: leveza para apps locais e testes",
    difficulty: "iniciante",
    subtitle: "Banco embarcado em arquivo, ideal para CLI, testes e protótipos",
    intro: `SQLite é o banco mais usado do mundo. Está dentro de praticamente todo navegador, todo celular, todo aplicativo de mensageria. Como é um banco embarcado em arquivo (sem servidor separado, sem rede), ele é perfeito para aplicações desktop, CLIs, testes automatizados e prototipagem rápida. Em Go, você tem duas escolhas principais de driver: mattn/go-sqlite3 (mais popular, exige CGO) ou modernc.org/sqlite (Go puro, sem CGO).

A diferença é prática. mattn/go-sqlite3 é o driver mais maduro, com performance levemente superior, mas exige CGO ativado e um compilador C disponível durante o build. Isso atrapalha cross-compilation (compilar Linux a partir de Mac vira problema) e atrapalha imagens Docker minimalistas (alpine, scratch). modernc.org/sqlite é uma transpilação automática do código C do SQLite para Go puro. Funciona em qualquer lugar onde Go funciona, sem CGO, com performance ligeiramente menor.

Para a maioria dos projetos modernos, modernc.org/sqlite é a escolha pragmática. Você compila um binário Linux estático, joga em qualquer container, e tudo funciona. Para benchmarks pesados ou apps desktop, mattn ainda vale.

Idiomático em Go: SQLite é ótimo para testes de integração de código que normalmente roda em Postgres. Você sobe um arquivo temporário, roda os testes, descarta. Não precisa de docker-compose, não precisa de container de banco em CI. Apenas cuidado: SQLite tem dialeto próprio em alguns pontos (sem ALTER COLUMN, tipos preguiçosos), então testes de migração podem enganar.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/notas-cli
# Sem CGO (recomendado para portabilidade):
go get modernc.org/sqlite
# Com CGO (mais maduro, exige compilador C):
# go get github.com/mattn/go-sqlite3`,
      },
      {
        lang: "go",
        code: `package main

import (
        "database/sql"
        "log"

        _ "modernc.org/sqlite" // registra o driver "sqlite"
)

func main() {
        // O arquivo é criado se não existir.
        db, err := sql.Open("sqlite", "./notas.db")
        if err != nil {
                log.Fatal(err)
        }
        defer db.Close()

        // Cria tabela se não existir. SQLite suporta IF NOT EXISTS.
        _, err = db.Exec(` + "`" + `CREATE TABLE IF NOT EXISTS notas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                texto TEXT NOT NULL
        )` + "`" + `)
        if err != nil {
                log.Fatal(err)
        }
        log.Println("banco pronto em notas.db")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "database/sql"
        "log"

        _ "modernc.org/sqlite"
)

type Nota struct {
        ID     int64
        Titulo string
        Texto  string
}

func main() {
        db, _ := sql.Open("sqlite", "./notas.db")
        defer db.Close()

        // INSERT e capturar o ID gerado pelo AUTOINCREMENT.
        res, err := db.Exec("INSERT INTO notas (titulo, texto) VALUES (?, ?)",
                "Compras", "café, pão, leite")
        if err != nil {
                log.Fatal(err)
        }
        id, _ := res.LastInsertId()
        log.Println("nota criada com id:", id)

        // Listar notas.
        rows, _ := db.Query("SELECT id, titulo, texto FROM notas")
        defer rows.Close()
        for rows.Next() {
                var n Nota
                _ = rows.Scan(&n.ID, &n.Titulo, &n.Texto)
                log.Printf("[%d] %s -> %s\\n", n.ID, n.Titulo, n.Texto)
        }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "database/sql"
        "log"

        _ "modernc.org/sqlite"
)

// Truque clássico: SQLite em memória. Perfeito para testes.
// O ":memory:" cria um banco efêmero, descartado quando o processo morre.
func main() {
        db, err := sql.Open("sqlite", ":memory:")
        if err != nil {
                log.Fatal(err)
        }
        defer db.Close()

        _, _ = db.Exec("CREATE TABLE produtos (id INTEGER, nome TEXT)")
        _, _ = db.Exec("INSERT INTO produtos VALUES (1, 'café')")

        var nome string
        _ = db.QueryRow("SELECT nome FROM produtos WHERE id = 1").Scan(&nome)
        log.Println(nome) // → café
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "database/sql"
        "log"

        _ "modernc.org/sqlite"
)

// SQLite tem suporte robusto a transações, igual aos bancos grandes.
func main() {
        db, _ := sql.Open("sqlite", "./loja.db")
        defer db.Close()

        _, _ = db.Exec(` + "`" + `CREATE TABLE IF NOT EXISTS contas (
                id INTEGER PRIMARY KEY,
                saldo REAL NOT NULL
        )` + "`" + `)

        tx, err := db.Begin()
        if err != nil {
                log.Fatal(err)
        }
        defer tx.Rollback()

        _, _ = tx.Exec("INSERT OR IGNORE INTO contas VALUES (1, 1000), (2, 0)")
        _, err = tx.Exec("UPDATE contas SET saldo = saldo - 100 WHERE id = 1")
        if err != nil {
                return
        }
        _, err = tx.Exec("UPDATE contas SET saldo = saldo + 100 WHERE id = 2")
        if err != nil {
                return
        }
        if err := tx.Commit(); err != nil {
                log.Fatal(err)
        }
        log.Println("transferência concluída")
}`,
      },
    ],
    points: [
      "SQLite é embarcado: sem servidor, sem rede, tudo dentro de um arquivo .db.",
      "modernc.org/sqlite é Go puro (sem CGO); mattn/go-sqlite3 é mais rápido mas exige compilador C.",
      "Idiomático: use ':memory:' para testes de integração rapidíssimos e descartáveis.",
      "Placeholders no SQLite são ? (não $1 como no Postgres).",
      "AUTOINCREMENT + LastInsertId() para capturar o ID gerado.",
      "Transações funcionam normalmente, com Begin/Commit/Rollback.",
      "Armadilha: assumir que toda feature do Postgres funciona — SQLite tem dialeto próprio (sem ALTER COLUMN completo).",
      "Erro comum: testar em SQLite e produzir em Postgres sem rodar testes contra Postgres no CI.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para CLIs e ferramentas que precisam de persistência local, SQLite é praticamente sempre a resposta certa. Zero configuração, ótima performance, formato portável.",
      },
      {
        type: "warning",
        content: "SQLite só permite uma escrita por vez no banco inteiro (não por linha). Para cargas de escrita concorrente alta, ele não é a escolha — use Postgres ou MySQL.",
      },
      {
        type: "info",
        content: "SQLite tem tipos dinâmicos: você pode declarar uma coluna como INTEGER e inserir um TEXT, e ele aceita. Isso surpreende quem vem de Postgres — não é bug, é comportamento documentado.",
      },
    ],
  },
  {
    slug: "redis-go",
    section: "frameworks-web",
    title: "Redis com go-redis/v9",
    difficulty: "intermediario",
    subtitle: "Cache, fila, contador atômico e pub/sub usando o cliente mais popular do Go",
    intro: `Redis é uma daquelas ferramentas que, quando você aprende, começa a ver casos de uso em todo lugar: cache de respostas de API, contador de visitas, sessões de usuário, fila de jobs, pub/sub de eventos, rate limiter, lock distribuído. Tudo isso com latência sub-milissegundo porque os dados ficam na RAM, com persistência opcional em disco.

Em Go, o cliente padrão de fato é o github.com/redis/go-redis/v9 (antigo go-redis/v8 e antes ainda redigo). Ele cobre todo o protocolo Redis, incluindo Streams (a fila moderna), Cluster, Sentinel e Pub/Sub. A API é fluente e cada comando do Redis vira um método: client.Set, client.Get, client.LPush, client.HSet.

A grande sacada do Redis no Go é combinar com goroutines: você pode ter um pool de workers consumindo uma fila Redis, cada um em sua goroutine, sem precisar de framework de fila externo. Para muitos casos, Redis Streams substitui Kafka com 1% da complexidade.

Idiomático: sempre defina TTL em chaves de cache (SET ... EX); use pipeline para reduzir round-trips quando enviar várias operações em sequência; trate redis.Nil como caso de "não tem" (não como erro fatal); e separe o cliente Redis em uma camada (Cache, Queue) em vez de espalhar pelos handlers.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/api-com-cache
go get github.com/redis/go-redis/v9
# Suba um Redis local:
# docker run -p 6379:6379 redis:7-alpine`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"
        "time"

        "github.com/redis/go-redis/v9"
)

func main() {
        ctx := context.Background()

        rdb := redis.NewClient(&redis.Options{
                Addr:     "localhost:6379",
                Password: "", // sem senha em dev
                DB:       0,
        })
        defer rdb.Close()

        if err := rdb.Ping(ctx).Err(); err != nil {
                log.Fatal("redis fora:", err)
        }

        // SET com TTL: chave expira em 5 minutos.
        err := rdb.Set(ctx, "produto:1", "Café Especial", 5*time.Minute).Err()
        if err != nil {
                log.Fatal(err)
        }

        val, err := rdb.Get(ctx, "produto:1").Result()
        if err == redis.Nil {
                log.Println("chave não existe")
        } else if err != nil {
                log.Fatal(err)
        } else {
                log.Println("valor:", val)
        }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "encoding/json"
        "log"
        "time"

        "github.com/redis/go-redis/v9"
)

// Padrão clássico: cache-aside.
// Busca no cache; se não tem, busca no banco e popula.
type Produto struct {
        ID    int     ` + "`json:\"id\"`" + `
        Nome  string  ` + "`json:\"nome\"`" + `
        Preco float64 ` + "`json:\"preco\"`" + `
}

func buscarComCache(ctx context.Context, rdb *redis.Client, id int) (*Produto, error) {
        chave := "produto:" + intToStr(id)
        cached, err := rdb.Get(ctx, chave).Bytes()
        if err == nil {
                var p Produto
                _ = json.Unmarshal(cached, &p)
                log.Println("cache HIT")
                return &p, nil
        }
        if err != redis.Nil {
                return nil, err // erro real do Redis
        }
        // Cache MISS: simula busca no banco.
        log.Println("cache MISS, buscando no banco")
        p := &Produto{ID: id, Nome: "Café", Preco: 18.50}
        b, _ := json.Marshal(p)
        _ = rdb.Set(ctx, chave, b, 10*time.Minute).Err()
        return p, nil
}

func intToStr(i int) string { return string(rune('0' + i)) } // só para o exemplo

func main() {
        rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
        defer rdb.Close()
        ctx := context.Background()
        _, _ = buscarComCache(ctx, rdb, 1)
        _, _ = buscarComCache(ctx, rdb, 1) // segunda chamada: HIT
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"
        "time"

        "github.com/redis/go-redis/v9"
)

// Contador atômico: visitas em uma página.
// INCR é atômico no Redis — sem race condition mesmo com mil clientes.
func main() {
        ctx := context.Background()
        rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
        defer rdb.Close()

        chave := "visitas:home"
        novo, err := rdb.Incr(ctx, chave).Result()
        if err != nil {
                log.Fatal(err)
        }
        log.Println("visitas até agora:", novo)

        // EXPIRE: zerar contador automaticamente em 1 dia.
        _ = rdb.Expire(ctx, chave, 24*time.Hour).Err()
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"

        "github.com/redis/go-redis/v9"
)

// Pipeline: várias operações em uma round-trip de rede.
// Para muitos comandos, isso é a diferença entre 50ms e 5ms total.
func main() {
        ctx := context.Background()
        rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
        defer rdb.Close()

        pipe := rdb.Pipeline()
        pipe.Set(ctx, "u:1:nome", "Ana", 0)
        pipe.Set(ctx, "u:1:idade", "30", 0)
        pipe.Incr(ctx, "u:1:logins")

        // Exec dispara todos os comandos juntos.
        cmds, err := pipe.Exec(ctx)
        if err != nil {
                log.Fatal(err)
        }
        log.Printf("executei %d comandos em pipeline\\n", len(cmds))
}`,
      },
    ],
    points: [
      "go-redis/v9 é o cliente Redis padrão de fato em Go.",
      "Sempre defina TTL em chaves de cache via parâmetro do Set ou Expire separado.",
      "Trate redis.Nil como \"não achou\" — não é erro fatal.",
      "Idiomático: use Pipeline para enviar múltiplas operações em uma round-trip.",
      "Comandos atômicos como INCR/DECR resolvem contadores sem race condition.",
      "Redis Streams (XADD/XREADGROUP) substitui Kafka em casos de uso simples.",
      "Armadilha: cache sem TTL vira leak de memória — chaves crescem para sempre.",
      "Erro comum: usar Redis como banco principal sem persistência configurada — perde tudo no restart.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para distributed lock simples, use SET key value NX EX 30. Funciona como mutex distribuído entre instâncias do seu serviço sem precisar de Zookeeper.",
      },
      {
        type: "warning",
        content: "Redis é single-threaded para comandos. Não envie comando que processa milhões de chaves (KEYS * é proibido em produção). Use SCAN, paginação e estruturas adequadas.",
      },
      {
        type: "info",
        content: "go-redis suporta Cluster, Sentinel e modos transacionais (MULTI/EXEC) com a mesma API. Comece simples com NewClient e migre para NewClusterClient quando precisar.",
      },
    ],
  },
  {
    slug: "mongo-go",
    section: "frameworks-web",
    title: "MongoDB com mongo-driver",
    difficulty: "avancado",
    subtitle: "Banco de documentos com schema flexível e agregações poderosas",
    intro: `MongoDB é um banco orientado a documentos JSON-like (BSON, internamente). Em vez de tabelas com colunas fixas, você guarda documentos com qualquer estrutura, e cada coleção pode ter documentos com campos diferentes. Isso troca o rigor do esquema por flexibilidade — bom para dados heterogêneos (catálogos de produto, eventos de auditoria, configurações), ruim quando você precisa de joins complexos ou consistência transacional forte.

Em Go, o cliente oficial é o go.mongodb.org/mongo-driver. Ele é maduro, mantido pela própria MongoDB Inc., e segue o estilo idiomático: ponteiros para client, contexto em todas as operações, opções funcionais. A API mapeia muito bem para Go: você define structs com tags bson e o driver serializa para você.

Quando MongoDB faz sentido? Para dados onde o esquema realmente muda (CMS, e-commerce com produtos muito variáveis), para casos com altos volumes de inserção e leitura sem joins, e para times que valorizam a velocidade de iteração de schema. Quando não faz? Para dados altamente relacionais (financeiro tradicional), onde Postgres com jsonb resolve com mais maturidade.

Idiomático com mongo-driver: configure context com timeout em toda operação; use bson.D para queries quando a ordem importa, bson.M quando não; defina structs com tags bson:"campo,omitempty"; e separe o cliente em um repositório, nunca chame coll.FindOne dentro de handler diretamente.`,
    codes: [
      {
        lang: "bash",
        code: `go mod init exemplo/catalogo
go get go.mongodb.org/mongo-driver/mongo
# Suba um MongoDB local:
# docker run -p 27017:27017 mongo:7`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"
        "time"

        "go.mongodb.org/mongo-driver/mongo"
        "go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()

        client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
        if err != nil {
                log.Fatal(err)
        }
        defer client.Disconnect(context.Background())

        if err := client.Ping(ctx, nil); err != nil {
                log.Fatal("mongo fora:", err)
        }
        log.Println("conectado ao mongo!")
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"
        "time"

        "go.mongodb.org/mongo-driver/bson"
        "go.mongodb.org/mongo-driver/bson/primitive"
        "go.mongodb.org/mongo-driver/mongo"
        "go.mongodb.org/mongo-driver/mongo/options"
)

// Tags bson definem como cada campo é serializado no Mongo.
type Produto struct {
        ID    primitive.ObjectID ` + "`bson:\"_id,omitempty\"`" + `
        Nome  string             ` + "`bson:\"nome\"`" + `
        Preco float64            ` + "`bson:\"preco\"`" + `
        Tags  []string           ` + "`bson:\"tags,omitempty\"`" + `
}

func main() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        client, _ := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
        defer client.Disconnect(ctx)

        coll := client.Database("loja").Collection("produtos")

        // Inserir.
        res, err := coll.InsertOne(ctx, Produto{
                Nome: "Café Especial", Preco: 28.90, Tags: []string{"bebida", "premium"},
        })
        if err != nil {
                log.Fatal(err)
        }
        log.Println("inserido:", res.InsertedID)

        // Buscar.
        var achado Produto
        err = coll.FindOne(ctx, bson.M{"nome": "Café Especial"}).Decode(&achado)
        if err != nil {
                log.Fatal(err)
        }
        log.Printf("achei %+v\\n", achado)
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"
        "time"

        "go.mongodb.org/mongo-driver/bson"
        "go.mongodb.org/mongo-driver/mongo"
        "go.mongodb.org/mongo-driver/mongo/options"
)

// Find com filtro, projeção, ordenação e limite.
func main() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        client, _ := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
        defer client.Disconnect(ctx)

        coll := client.Database("loja").Collection("produtos")

        opts := options.Find().
                SetSort(bson.D{{Key: "preco", Value: -1}}). // mais caro primeiro
                SetLimit(10).
                SetProjection(bson.M{"nome": 1, "preco": 1}) // só essas duas colunas

        cur, err := coll.Find(ctx, bson.M{"preco": bson.M{"$gt": 20}}, opts)
        if err != nil {
                log.Fatal(err)
        }
        defer cur.Close(ctx)

        var resultados []bson.M
        if err := cur.All(ctx, &resultados); err != nil {
                log.Fatal(err)
        }
        for _, r := range resultados {
                log.Println(r["nome"], "->", r["preco"])
        }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "context"
        "log"
        "time"

        "go.mongodb.org/mongo-driver/bson"
        "go.mongodb.org/mongo-driver/mongo"
        "go.mongodb.org/mongo-driver/mongo/options"
)

// Aggregation pipeline: agrupar vendas por produto e somar.
func main() {
        ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()

        client, _ := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
        defer client.Disconnect(ctx)

        coll := client.Database("loja").Collection("vendas")

        pipeline := mongo.Pipeline{
                bson.D{{Key: "$group", Value: bson.D{
                        {Key: "_id", Value: "$produto"},
                        {Key: "total", Value: bson.D{{Key: "$sum", Value: "$valor"}}},
                }}},
                bson.D{{Key: "$sort", Value: bson.D{{Key: "total", Value: -1}}}},
        }

        cur, err := coll.Aggregate(ctx, pipeline)
        if err != nil {
                log.Fatal(err)
        }
        defer cur.Close(ctx)

        var saida []bson.M
        _ = cur.All(ctx, &saida)
        for _, r := range saida {
                log.Printf("%v vendeu R$ %.2f\\n", r["_id"], r["total"])
        }
}`,
      },
    ],
    points: [
      "MongoDB armazena documentos BSON (similar a JSON) sem esquema fixo.",
      "Cliente oficial: go.mongodb.org/mongo-driver — maduro e mantido pela MongoDB Inc.",
      "Tags bson:\"campo,omitempty\" definem serialização e omissão de zero-values.",
      "Idiomático: sempre passe context com timeout em toda operação.",
      "Use bson.D quando a ordem importa (queries com $and ordenado, agregações).",
      "Cursor.All carrega tudo na memória — para resultados grandes, itere com cur.Next.",
      "Armadilha: esquecer cur.Close(ctx) — vaza recurso no driver e no servidor.",
      "Erro comum: confundir Mongo com banco transacional — transações funcionam mas têm trade-offs.",
    ],
    alerts: [
      {
        type: "info",
        content: "MongoDB suporta transações multi-document desde a versão 4.0, mas o overhead é maior que num banco relacional. Use com parcimônia e desenhe seu schema para evitá-las.",
      },
      {
        type: "tip",
        content: "Se você está em dúvida entre MongoDB e Postgres, considere Postgres com colunas jsonb. Você ganha flexibilidade de schema sem perder o poder do SQL e das transações.",
      },
      {
        type: "warning",
        content: "Sem índices, queries em coleções grandes ficam catastroficamente lentas. Sempre rode coll.Indexes().CreateOne nos campos que você filtra com frequência.",
      },
    ],
  },
  {
    slug: "templates-html",
    section: "frameworks-web",
    title: "html/template: SSR com a biblioteca padrão",
    difficulty: "intermediario",
    subtitle: "Renderização server-side segura por padrão, sem precisar de framework",
    intro: `Antes de SPAs, frameworks frontend e APIs JSON, a web foi construída sobre HTML gerado no servidor. Esse padrão (SSR — Server-Side Rendering) voltou à moda com Hotwire, HTMX, Astro e companhia. E em Go, você não precisa instalar nada para fazer isso bem feito: o pacote html/template da biblioteca padrão é poderoso, rápido e — o ponto mais importante — seguro contra XSS por padrão.

A diferença para text/template (também na stdlib) é justamente essa: html/template entende o contexto onde uma variável aparece (dentro de atributo, dentro de tag script, dentro de URL) e aplica o escape correto automaticamente. Em Python você teria que confiar no autoescape do Jinja2; aqui é nativo e impossível desligar por engano.

A sintaxe usa {{ ... }} para imprimir variáveis, {{ if }}, {{ range }} para controle de fluxo, {{ define "nome" }} para sub-templates e {{ template "nome" . }} para incluir. Você pode registrar funções customizadas (FuncMap) para formatar moeda, data, etc. e organizar tudo em arquivos .html parsados na inicialização.

Idiomático: parsear todos os templates uma vez no startup (template.ParseGlob) e guardar o *Template como dependência; passar dados como struct em vez de map quando der; usar layouts via {{ define "content" }}{{ end }} dentro de cada página e {{ template "content" . }} num arquivo base. Combine com chi ou net/http para um stack SSR enxuto, sem framework.`,
    codes: [
      {
        lang: "go",
        code: `package main

import (
        "html/template"
        "log"
        "net/http"
)

const tpl = ` + "`" + `<!DOCTYPE html>
<html>
<head><title>Olá {{.Nome}}</title></head>
<body>
<h1>Bem-vindo, {{.Nome}}!</h1>
<p>Você tem {{.Idade}} anos.</p>
</body>
</html>` + "`" + `

type Pagina struct {
        Nome  string
        Idade int
}

func main() {
        t := template.Must(template.New("home").Parse(tpl))

        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                // Execute escreve o HTML pronto no ResponseWriter.
                _ = t.Execute(w, Pagina{Nome: "Ana", Idade: 30})
        })
        log.Fatal(http.ListenAndServe(":8080", nil))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "html/template"
        "log"
        "net/http"
)

// Demonstrando o escape automático de XSS.
// Mesmo que o usuário tente injetar <script>, o template escapa.
const tpl = ` + "`" + `<p>Comentário: {{.}}</p>` + "`" + `

func main() {
        t := template.Must(template.New("c").Parse(tpl))
        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                entrada := r.URL.Query().Get("texto")
                // Mesmo que entrada seja "<script>alert(1)</script>",
                // o resultado vira "&lt;script&gt;alert(1)&lt;/script&gt;".
                _ = t.Execute(w, entrada)
        })
        log.Fatal(http.ListenAndServe(":8080", nil))
}
// Acesse /?texto=<script>alert(1)</script> e inspecione o HTML.`,
      },
      {
        lang: "go",
        code: `package main

import (
        "html/template"
        "log"
        "net/http"
)

// Loop e condicional clássicos com range e if.
const tpl = ` + "`" + `
<h1>Carrinho de {{.Cliente}}</h1>
{{if .Itens}}
<ul>
{{range .Itens}}
  <li>{{.Nome}} - R$ {{.Preco}}</li>
{{end}}
</ul>
<p>Total: R$ {{.Total}}</p>
{{else}}
<p>Carrinho vazio.</p>
{{end}}
` + "`" + `

type Item struct {
        Nome  string
        Preco float64
}

type Carrinho struct {
        Cliente string
        Itens   []Item
        Total   float64
}

func main() {
        t := template.Must(template.New("c").Parse(tpl))
        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                c := Carrinho{
                        Cliente: "Bruno",
                        Itens:   []Item{{"Café", 18.5}, {"Pão", 0.8}},
                        Total:   19.3,
                }
                _ = t.Execute(w, c)
        })
        log.Fatal(http.ListenAndServe(":8080", nil))
}`,
      },
      {
        lang: "go",
        code: `package main

import (
        "fmt"
        "html/template"
        "log"
        "net/http"
        "time"
)

// FuncMap: registra funções para usar dentro do template.
var funcs = template.FuncMap{
        "reais": func(v float64) string { return fmt.Sprintf("R$ %.2f", v) },
        "data": func(t time.Time) string { return t.Format("02/01/2006") },
}

const tpl = ` + "`" + `
<p>Hoje é {{data .Agora}}</p>
<p>Preço: {{reais .Preco}}</p>
` + "`" + `

func main() {
        t := template.Must(template.New("p").Funcs(funcs).Parse(tpl))
        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                _ = t.Execute(w, map[string]any{
                        "Agora": time.Now(),
                        "Preco": 99.90,
                })
        })
        log.Fatal(http.ListenAndServe(":8080", nil))
}
// Resposta: <p>Hoje é 24/05/2025</p> <p>Preço: R$ 99.90</p>`,
      },
      {
        lang: "go",
        code: `package main

import (
        "html/template"
        "log"
        "net/http"
)

// Layout + páginas: define base e cada página preenche "content".
const base = ` + "`" + `<!DOCTYPE html>
<html><head><title>{{.Titulo}}</title></head>
<body>
<header>Loja Teste</header>
<main>{{template "content" .}}</main>
<footer>2025</footer>
</body></html>` + "`" + `

const home = ` + "`" + `{{define "content"}}<h1>Olá!</h1>{{end}}` + "`" + `

func main() {
        t := template.Must(template.New("base").Parse(base))
        template.Must(t.Parse(home))

        http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
                _ = t.ExecuteTemplate(w, "base", map[string]string{"Titulo": "Início"})
        })
        log.Fatal(http.ListenAndServe(":8080", nil))
}`,
      },
    ],
    points: [
      "html/template é parte da stdlib: zero dependências para fazer SSR seguro em Go.",
      "Escape de XSS é automático e contextual (atributo, script, URL) — não dá para esquecer.",
      "Idiomático: parseie templates uma vez no startup com ParseGlob/ParseFiles.",
      "Use FuncMap para registrar formatadores (moeda, data, pluralização).",
      "Combine define/template para criar layouts reutilizáveis com herança simples.",
      "Passe structs em vez de maps quando puder — você ganha checagem de campo no compilador.",
      "Armadilha: usar text/template em HTML — perde o escape de XSS e abre vulnerabilidade.",
      "Erro comum: parsear template dentro do handler — recompila a cada requisição e mata desempenho.",
    ],
    alerts: [
      {
        type: "success",
        content: "html/template é o motor por trás de muitos sites em produção, incluindo o próprio site oficial do Go. É maduro, rápido e seguro — não precisa de Pug, Handlebars ou Mustache.",
      },
      {
        type: "tip",
        content: "Combine html/template com HTMX para criar interfaces reativas sem precisar de SPA. Você ganha velocidade de SSR com interatividade quase de SPA, com 1% do JavaScript.",
      },
      {
        type: "warning",
        content: "Se você precisa marcar um conteúdo como HTML confiável (vindo de um Markdown sanitizado, por exemplo), use template.HTML em vez de string. Mas tome muito cuidado — é a única porta para XSS.",
      },
    ],
  },
];
