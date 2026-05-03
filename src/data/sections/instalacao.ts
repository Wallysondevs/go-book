import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "instalacao-go",
    section: "instalacao",
    title: "Instalando o Go no seu computador",
    difficulty: "iniciante",
    subtitle: "Como instalar o compilador Go no Linux, macOS e Windows e validar que tudo está funcionando",
    intro: `Antes de escrever qualquer linha de código, você precisa ter o Go instalado. Diferente de Python ou JavaScript, que muitas vezes já vêm pré-instalados no sistema, o Go quase sempre precisa ser baixado manualmente. Isso é até bom: você fica com a versão oficial, mantida pelo time do Google, e sem aquela bagunça de "qual python eu rodei agora?" que assombra iniciantes em outras linguagens.

A instalação do Go é deliberadamente simples. Você baixa um arquivo único do site oficial (golang.org/dl), extrai numa pasta, ajusta uma variável de ambiente para o terminal achar o comando 'go' e pronto. Não tem instalador gigante de IDE, não tem JDK, JRE, SDK separados como em Java. O pacote do Go traz o compilador, a biblioteca padrão, ferramentas de teste, formatador, profiler, tudo numa caixinha só. Essa filosofia "um binário resolve" é uma marca registrada da linguagem.

Em sistemas Linux baseados em Debian/Ubuntu, evite o 'apt install golang' porque ele costuma trazer uma versão antiga (às vezes 1.18 ou 1.20 quando a atual já é 1.23+). Prefira sempre baixar do site oficial ou usar o gerenciador 'gvm'/'asdf' se quiser alternar versões. No macOS, 'brew install go' funciona bem e mantém atualizado. No Windows, o instalador .msi cuida de tudo, inclusive da PATH.

Depois de instalar, você precisa confirmar três coisas: o comando 'go version' funciona em qualquer pasta, a variável GOPATH (que é onde ferramentas instaladas globalmente vão parar) aponta para algo razoável como ~/go, e o GOBIN (subpasta com binários) está no seu PATH. Ao longo deste capítulo, eu te mostro como fazer cada um desses passos sem terror, e explico o que cada variável significa, porque muita gente copia comando da internet sem entender e depois paga o preço quando algo quebra.`,
    codes: [
      {
        lang: "bash",
        code: `# Linux (qualquer distro): baixe o tarball oficial e extraia em /usr/local
# Substitua a versão pela mais recente em https://go.dev/dl/
curl -OL https://go.dev/dl/go1.23.4.linux-amd64.tar.gz

# Remova qualquer instalação antiga e extraia a nova
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz

# Adicione o Go ao PATH (coloque no ~/.bashrc ou ~/.zshrc para ficar permanente)
export PATH=$PATH:/usr/local/go/bin
export PATH=$PATH:$(go env GOPATH)/bin`,
      },
      {
        lang: "bash",
        code: `# macOS: o jeito mais limpo é via Homebrew
brew install go

# Ou baixe o .pkg oficial em https://go.dev/dl/ e clique 2x para instalar.
# O pkg coloca o Go em /usr/local/go automaticamente.

# Confira que ficou tudo certo:
go version
# → go version go1.23.4 darwin/arm64`,
      },
      {
        lang: "bash",
        code: `# Windows: baixe o instalador .msi em https://go.dev/dl/
# Execute, clique avançar até o fim. Ele já configura o PATH sozinho.

# Abra o PowerShell (não o CMD antigo) e teste:
go version
# → go version go1.23.4 windows/amd64

# Se aparecer "comando não reconhecido", feche e abra o PowerShell de novo
# para que ele leia a PATH atualizada pelo instalador.`,
      },
      {
        lang: "bash",
        code: `# Comandos de diagnóstico que você roda DEPOIS de instalar
go version          # versão do compilador
go env GOPATH       # → /home/voce/go (onde mora o cache de módulos e binários)
go env GOROOT       # → /usr/local/go (onde mora o próprio Go)
go env GOBIN        # → vazio ou /home/voce/go/bin (binários instalados)

# Se 'go env GOBIN' estiver vazio, o padrão é $GOPATH/bin.
# Garanta que essa pasta está no PATH para chamar ferramentas instaladas.`,
      },
      {
        lang: "bash",
        code: `# Teste de fogo: instale uma ferramenta oficial e use ela
go install golang.org/x/tools/cmd/goimports@latest

# Se o PATH estiver certo, o comando abaixo funciona em qualquer pasta:
goimports -h
# → mostra o help do goimports

# Se der "command not found", adicione ao seu shell:
# export PATH=$PATH:$(go env GOPATH)/bin`,
      },
    ],
    points: [
      "Sempre baixe Go do site oficial go.dev/dl ou via Homebrew (macOS) — evite apt do Ubuntu que traz versões velhas.",
      "Após instalar, rode 'go version' em qualquer pasta para confirmar que o PATH está certo.",
      "GOROOT é onde o Go foi instalado (você não mexe); GOPATH é onde ficam módulos baixados e binários (você usa).",
      "Adicione $(go env GOPATH)/bin ao PATH para usar ferramentas instaladas com 'go install'.",
      "No Windows, prefira PowerShell ao CMD antigo — é onde o instalador deixa o ambiente mais consistente.",
      "Armadilha: instalar Go via apt no Ubuntu, pegar versão 1.18 e perder horas porque generics e features novas não funcionam.",
      "Idiomático: usar a versão estável mais recente do Go; o time mantém compatibilidade rigorosa, então atualizar raramente quebra código.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Apague qualquer Go antigo antes de instalar uma versão nova no Linux (sudo rm -rf /usr/local/go). Sobrescrever sem apagar costuma deixar arquivos órfãos que confundem o compilador.",
      },
      {
        type: "tip",
        content: "Se você já trabalha com várias linguagens e quer alternar versões do Go entre projetos, use o asdf (asdf-vm.com) com o plugin asdf-golang. Funciona igual ao nvm/pyenv.",
      },
      {
        type: "info",
        content: "O Go segue compatibilidade prometida: código escrito em Go 1.0 (de 2012) ainda compila hoje. Atualizar é seguro e quase sempre traz melhorias de performance grátis.",
      },
    ],
  },
  {
    slug: "go-tool-cli",
    section: "instalacao",
    title: "A ferramenta 'go': um canivete suíço",
    difficulty: "iniciante",
    subtitle: "Conhecendo go run, build, test, fmt, vet, mod, get e install — os comandos que você vai usar todo dia",
    intro: `Em Python você tem 'pip' para pacotes, 'python' para rodar, 'pytest' para testes, 'black' para formatar, 'mypy' para tipos. Em Node, é 'npm' (ou yarn, ou pnpm), 'node' para rodar, 'jest' para testes, 'prettier' para formatar, 'eslint' para lint. Cada ferramenta tem dono diferente, configuração própria, e às vezes brigam entre si. O Go fez uma escolha radical: tudo isso é o mesmo comando, 'go'.

Quando você digita 'go' no terminal, está chamando uma ferramenta que sabe compilar, executar, testar, formatar, baixar dependências, instalar binários, gerar documentação, fazer profiling de performance e até atualizar o próprio Go. Cada ação é um subcomando: 'go run' executa, 'go build' compila, 'go test' roda testes, 'go fmt' formata, 'go vet' analisa código procurando bugs comuns, 'go mod' gerencia dependências, 'go get' baixa pacotes, 'go install' instala binários globalmente.

Essa unificação tem um efeito psicológico interessante: como todo projeto Go usa as mesmas ferramentas, abrir um projeto novo nunca é misterioso. Não tem que ler README pra saber se é npm ou yarn, se usa pytest ou unittest, se formata com black ou autopep8. É sempre 'go test ./...', sempre 'go build', sempre 'go fmt'. Isso reduz drasticamente o atrito de contribuir em código de outras pessoas, e é um dos motivos do Go ser popular em projetos open source de infraestrutura como Docker, Kubernetes e Terraform.

Neste capítulo a gente passa por cada subcomando importante com exemplos práticos. Você não precisa decorar tudo agora; o objetivo é você reconhecer cada um quando esbarrar e saber pra que serve. Os capítulos seguintes vão mergulhar em detalhes de cada um.`,
    codes: [
      {
        lang: "bash",
        code: `# Os subcomandos mais usados no dia a dia
go run main.go        # compila em memória e executa, sem gerar binário
go build              # compila o pacote atual e gera um executável
go build ./...        # compila todos os pacotes do módulo (./... = recursivo)
go test ./...         # roda todos os testes do projeto
go fmt ./...          # reformata todo o código no padrão oficial
go vet ./...          # análise estática: aponta bugs comuns sem compilar
go mod tidy           # adiciona/remove dependências usadas no go.mod
go get pacote@versao  # adiciona uma dependência específica
go install ./cmd/cli  # compila e instala um binário em $GOPATH/bin
go doc fmt.Println    # mostra a documentação direto no terminal`,
      },
      {
        lang: "bash",
        code: `# 'go run' é ótimo pra prototipar — funciona como um script
echo 'package main; import "fmt"; func main(){ fmt.Println("oi") }' > teste.go
go run teste.go
# → oi

# Compilando: gera um binário 'teste' (ou 'teste.exe' no Windows)
go build teste.go
./teste
# → oi

# A diferença? 'go run' é descartável; 'go build' produz algo que você
# pode mandar pro servidor sem precisar do Go instalado lá.`,
      },
      {
        lang: "bash",
        code: `# 'go fmt' é INEGOCIÁVEL no ecossistema Go.
# Não existe debate sobre tabs vs espaços, ponto e vírgula, etc.
# O formatador oficial decide tudo, e o time inteiro segue.

go fmt ./...
# → reformata recursivamente. Sem saída = nada mudou.

# Ferramenta complementar muito popular (mais inteligente, ordena imports):
go install golang.org/x/tools/cmd/goimports@latest
goimports -w .
# → reescreve arquivos no lugar (-w) com imports organizados`,
      },
      {
        lang: "bash",
        code: `# 'go vet' procura erros comuns que compilam mas estão errados
# Exemplo: passar tipo errado para Printf
cat > bug.go <<'EOF'
package main
import "fmt"
func main() {
    nome := "Ana"
    fmt.Printf("idade: %d\n", nome) // %d espera int, mas nome é string
}
EOF

go vet bug.go
# → bug.go:5:2: Printf format %d has arg nome of wrong type string

# O programa COMPILARIA, mas vet pega antes de virar bug em produção.`,
      },
      {
        lang: "bash",
        code: `# 'go help' é o seu melhor amigo
go help              # lista todos os subcomandos
go help build        # detalhes do go build (todas as flags)
go help mod          # explica os subcomandos de módulo
go help testflag     # flags específicas de teste

# Dica: 'go env' mostra TODAS as variáveis que afetam o compilador
go env
# → GOOS=linux GOARCH=amd64 GOPATH=... GOROOT=... GO111MODULE=on ...`,
      },
    ],
    points: [
      "A ferramenta 'go' é um canivete suíço: compilar, testar, formatar, baixar dependências, tudo num comando só.",
      "Use 'go run arquivo.go' para protótipos rápidos; use 'go build' quando quiser um binário pra distribuir.",
      "'go fmt' reformata no padrão oficial — não personalizável de propósito, pra acabar com discussões de estilo.",
      "'go vet' acha bugs sutis antes do runtime; rode antes de cada commit.",
      "'go mod tidy' alinha o arquivo go.mod com o que o código realmente importa, removendo deps fantasma.",
      "'go install pacote@latest' instala binários CLI globais em $GOPATH/bin.",
      "Armadilha: rodar 'go build' achando que vai instalar globalmente — build só gera binário na pasta atual; quem instala é 'go install'.",
      "Idiomático: rodar sempre 'go fmt ./... && go vet ./... && go test ./...' antes de fazer commit.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Acostume-se a digitar 'go help <subcomando>' antes de procurar no Google. A documentação local é completa, atualizada com sua versão e funciona offline.",
      },
      {
        type: "info",
        content: "Diferente de npm, o 'go get' moderno só atualiza o go.mod — ele NÃO instala binários nem cria pasta node_modules. Para binários CLI, use 'go install'.",
      },
      {
        type: "success",
        content: "A consistência da CLI é uma das razões do Go ser tão querido em DevOps. Qualquer projeto Go é familiar de imediato: mesmos comandos, mesma estrutura, mesmo formatador.",
      },
    ],
  },
  {
    slug: "primeiro-programa",
    section: "instalacao",
    title: "Seu primeiro programa em Go",
    difficulty: "iniciante",
    subtitle: "Anatomia de um arquivo .go: package, import, func main e por que cada peça precisa estar lá",
    intro: `Vamos escrever o primeiro programa em Go juntos, mas em vez de só copiar e correr, vamos dissecar cada linha. Diferente de Python — onde você abre um arquivo .py, escreve 'print("oi")' e roda — o Go exige uma estrutura mínima fixa. Pode parecer burocrático no começo, mas existe uma razão sólida pra cada exigência, e depois que você entende, fica natural.

Todo arquivo Go começa com uma declaração de pacote ('package alguma_coisa'). Isso responde à pergunta "este arquivo faz parte de qual unidade lógica?". O pacote 'main' é especial: significa "este código gera um executável". Se você usar qualquer outro nome (como 'utils' ou 'cliente'), está dizendo "este código é uma biblioteca para outros usarem". Essa decisão na primeira linha já comunica a intenção do arquivo.

Em seguida, vêm os imports. O Go é rigoroso aqui: importou e não usou? Erro de compilação. Acabou. Sem warning, sem aviso, é erro. Isso assusta vindo de Python ou JavaScript onde imports não usados são apenas barulho visual, mas economiza muito código morto em projetos grandes. A função 'main' dentro do pacote 'main' é o ponto de entrada — é onde a execução começa, igual em C, Java e Rust.

Por fim, tudo em Go é fortemente tipado e compilado. Quando você roda 'go run', o compilador checa tudo antes de executar. Tipos errados, variáveis não usadas, imports desnecessários — tudo barra a execução. No começo isso parece chato, mas em troca você ganha confiança absurda: se compila, geralmente roda. Bugs de "esqueci de declarar X" simplesmente não existem.`,
    codes: [
      {
        lang: "go",
        code: `// arquivo: hello.go
// Toda primeira linha (depois de comentários) é a declaração do pacote.
// 'main' é especial: gera um executável.
package main

// Importa o pacote 'fmt' (de "format") da biblioteca padrão.
// Ele tem funções de entrada/saída como Println, Printf, Scan.
import "fmt"

// 'main' sem argumentos e sem retorno é o ponto de entrada do programa.
func main() {
    fmt.Println("Olá, mundo do Go!")
    // → Olá, mundo do Go!
}`,
      },
      {
        lang: "bash",
        code: `# Salve o código acima como hello.go e rode:
go run hello.go
# → Olá, mundo do Go!

# Para compilar e gerar um executável:
go build hello.go
./hello              # Linux/macOS
# hello.exe          # Windows`,
      },
      {
        lang: "go",
        code: `// Exemplo um pouquinho mais real: calcular o total de um carrinho
package main

import "fmt"

func main() {
    // ':=' declara e atribui ao mesmo tempo, com tipo inferido.
    precoCafe := 12.50
    quantidadeCafe := 3
    precoLeite := 5.20
    quantidadeLeite := 2

    // Conversão explícita: Go NÃO faz cast automático entre int e float.
    total := precoCafe*float64(quantidadeCafe) + precoLeite*float64(quantidadeLeite)

    // Printf formata a saída; %.2f = float com 2 casas decimais.
    fmt.Printf("Total do carrinho: R$ %.2f\n", total)
    // → Total do carrinho: R$ 47.90
}`,
      },
      {
        lang: "go",
        code: `// O que acontece se você importar e não usar?
package main

import (
    "fmt"
    "strings" // importado mas não usado
)

func main() {
    fmt.Println("oi")
}
// Erro de compilação:
// ./main.go:5:5: "strings" imported and not used
//
// O Go te força a manter imports limpos. Use ou tire.`,
      },
      {
        lang: "go",
        code: `// O mesmo vale para variáveis declaradas e não usadas
package main

import "fmt"

func main() {
    nome := "Ana"
    idade := 30          // declarada e nunca usada
    fmt.Println(nome)
}
// Erro: idade declared and not used
//
// Para "ignorar" intencionalmente, use o blank identifier _:
// _ = idade
// Mas isso é raro; o normal é remover a variável.`,
      },
    ],
    points: [
      "Todo arquivo Go começa com 'package X'. Use 'package main' para programas executáveis.",
      "A função 'main()' do pacote 'main' é o ponto de entrada do programa.",
      "Imports não usados são erro de compilação, não warning. Remova ou use o goimports para ajustar automaticamente.",
      "Variáveis declaradas e não usadas também são erro — incentiva código enxuto.",
      "':=' declara e atribui inferindo o tipo; 'var x int = 10' é a forma explícita.",
      "Go não converte tipos automaticamente: 'int' e 'float64' precisam de conversão explícita com 'float64(x)'.",
      "Armadilha: começar com 'def' como em Python ou 'function' como em JavaScript — em Go é sempre 'func'.",
      "Idiomático: usar fmt.Println para debug rápido e fmt.Printf quando precisar de formatação controlada.",
    ],
    alerts: [
      {
        type: "info",
        content: "O nome do arquivo (hello.go) não importa para a compilação — o que importa é a declaração 'package'. Você pode ter dois arquivos no mesmo diretório, e ambos pertencerem ao mesmo pacote.",
      },
      {
        type: "warning",
        content: "Não confunda 'package main' (executável) com 'package outracoisa' (biblioteca). Tentar rodar uma biblioteca diretamente com 'go run' dá erro porque não tem função main.",
      },
      {
        type: "tip",
        content: "Configure seu editor para rodar goimports ao salvar. Isso elimina 99% dos erros de import e mantém a ordem padrão da comunidade automaticamente.",
      },
    ],
  },
  {
    slug: "editores-gopls",
    section: "instalacao",
    title: "Editor de código e gopls",
    difficulty: "iniciante",
    subtitle: "Por que VSCode com gopls virou padrão da comunidade e como configurar para autocomplete, format-on-save e debug",
    intro: `Você poderia escrever Go no Bloco de Notas, mas seria como cozinhar sem facas: dá pra fazer, mas é sofrido. Um bom editor com suporte ao Language Server Protocol (LSP) transforma o desenvolvimento em algo fluido: autocomplete inteligente, navegação por definição com um clique, refatoração segura, formatação ao salvar e mensagens de erro inline antes de você sequer rodar o código.

A combinação mais popular hoje é VS Code + a extensão oficial do Go (publicada pelo time Google) + o servidor de linguagem 'gopls' (pronuncia "go please"). Outras opções excelentes: GoLand da JetBrains (paga, mas extremamente poderosa), Neovim com nvim-lspconfig + gopls, Zed (editor moderno em Rust com LSP nativo), Sublime Text com plugin LSP. Todas usam o mesmo gopls por baixo, então a experiência de inteligência é praticamente idêntica.

O 'gopls' é mantido pelo próprio time do Go e implementa o LSP — um protocolo padronizado da Microsoft que separa "editor" de "inteligência da linguagem". Isso significa que melhorias no gopls beneficiam todos os editores ao mesmo tempo. Ele faz indexação incremental, entende módulos, resolve imports, sugere correções, faz rename seguro através de pacotes inteiros, e tudo isso rodando localmente, sem mandar seu código pra nuvem nenhuma.

Configurar o ambiente leva 5 minutos. No VS Code: instale a extensão 'Go' da Google; ela vai te oferecer instalar gopls, dlv (debugger), goimports e outras ferramentas; aceite. Configure 'editor.formatOnSave' como true e 'go.useLanguageServer' como true. Pronto, você tem um ambiente comparável ao GoLand pago, de graça. Vamos ver as configurações exatas e os atalhos que mais valem a pena memorizar.`,
    codes: [
      {
        lang: "bash",
        code: `# Instalando o gopls manualmente (a extensão do VS Code faz isso por você)
go install golang.org/x/tools/gopls@latest
go install github.com/go-delve/delve/cmd/dlv@latest          # debugger
go install golang.org/x/tools/cmd/goimports@latest          # imports
go install honnef.co/go/tools/cmd/staticcheck@latest        # linter avançado

# Confirme que estão no PATH:
gopls version
# → golang.org/x/tools/gopls v0.16.2`,
      },
      {
        lang: "json",
        code: `// .vscode/settings.json — configuração recomendada para projetos Go
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "always"
  },
  "[go]": {
    "editor.defaultFormatter": "golang.go",
    "editor.tabSize": 4,
    "editor.insertSpaces": false
  },
  "go.useLanguageServer": true,
  "go.lintTool": "staticcheck",
  "go.lintOnSave": "package",
  "go.formatTool": "goimports",
  "go.testFlags": ["-v", "-race"],
  "gopls": {
    "ui.semanticTokens": true,
    "ui.completion.usePlaceholders": true
  }
}`,
      },
      {
        lang: "json",
        code: `// .vscode/launch.json — debugar um programa Go com Delve
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug arquivo atual",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "\${file}"
    },
    {
      "name": "Debug do projeto (cmd/server)",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "\${workspaceFolder}/cmd/server",
      "args": ["--port=8080"]
    }
  ]
}`,
      },
      {
        lang: "go",
        code: `// Ao salvar este arquivo no VS Code com a config acima,
// o goimports vai ORDENAR e ADICIONAR imports faltantes sozinho.
package main

import (
    "fmt"
    "strings"
)

func main() {
    nome := "  Ana Carolina  "
    // strings.TrimSpace remove espaços nas pontas
    limpo := strings.TrimSpace(nome)
    // strings.ToUpper deixa tudo maiúsculo
    fmt.Println(strings.ToUpper(limpo))
    // → ANA CAROLINA
}`,
      },
      {
        lang: "bash",
        code: `# Atalhos do VS Code que mais economizam tempo no Go
# F12              → ir para definição
# Shift+F12        → ver todos os usos
# F2               → renomear (refator seguro através de pacotes)
# Ctrl+.           → mostrar correções sugeridas (quick fix)
# Ctrl+Shift+P     → "Go: Test Function At Cursor" roda só o teste do cursor
# Ctrl+Shift+P     → "Go: Generate Interface Stubs" cria stubs automáticos`,
      },
    ],
    points: [
      "Use VS Code + extensão 'Go' oficial + gopls como combinação padrão; é gratuita e excelente.",
      "GoLand da JetBrains é a alternativa paga mais robusta, especialmente boa para projetos enterprise.",
      "gopls é o language server oficial — todos os editores modernos consomem ele via LSP.",
      "Configure formatOnSave + organizeImports — você nunca mais vai se preocupar com formatação.",
      "Instale 'staticcheck' para análise estática profunda além do que 'go vet' já faz.",
      "Use Delve (dlv) como debugger; ele integra com VS Code via launch.json.",
      "Armadilha: editar Go sem LSP e ficar perdendo tempo procurando typos que o autocomplete pegaria de cara.",
      "Idiomático: deixar o editor rodar 'goimports' ao salvar — assim seu commit nunca tem imports fora de ordem.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Se o gopls começar a ficar lento, abra o command palette e rode 'Go: Restart Language Server'. Em projetos grandes, ele às vezes precisa reindexar.",
      },
      {
        type: "info",
        content: "Diferente de Python (onde black, ruff, mypy competem), em Go há uma combinação canônica: gofmt + goimports + go vet + staticcheck. Praticamente todo time usa essas quatro.",
      },
      {
        type: "success",
        content: "Como gopls é o mesmo em todos os editores, trocar de VS Code para Neovim ou Zed depois é indolor. Suas habilidades não ficam presas a um IDE.",
      },
    ],
  },
  {
    slug: "go-mod-init",
    section: "instalacao",
    title: "Iniciando um projeto com go mod init",
    difficulty: "iniciante",
    subtitle: "Como criar um módulo Go, entender o arquivo go.mod e por que o caminho do módulo importa tanto",
    intro: `Antes de 2018, gerenciar dependências em Go era um pesadelo: você tinha que botar tudo dentro de uma pasta sagrada chamada GOPATH, e cada projeto compartilhava as mesmas versões de bibliotecas com todos os outros. Não dava pra ter projeto A usando lib X v1 e projeto B usando lib X v2. Foi caótico até a chegada dos Go Modules na versão 1.11, oficializados em 1.16. Hoje, módulos são o padrão absoluto, e GOPATH virou só uma pasta de cache.

Um módulo é simplesmente uma pasta que contém um arquivo 'go.mod'. Esse arquivo declara três coisas: o nome do módulo (que serve como prefixo para todos os imports do projeto), a versão mínima do Go necessária, e a lista de dependências com versões exatas. É o equivalente do package.json em Node ou do requirements.txt em Python — mas com versionamento semântico embutido e checksums criptográficos pra garantir que ninguém alterou o pacote depois.

O nome do módulo é geralmente o caminho do repositório onde ele vai morar: 'github.com/seu-user/projeto'. Isso parece estranho ("mas eu nem subi pro GitHub ainda!"), e é. Mas tem uma razão: o Go usa o caminho do módulo para baixar dependências automaticamente. Se alguém faz 'import "github.com/seu-user/projeto/utils"', o Go sabe exatamente onde procurar. Para projetos pessoais sem repositório, qualquer string única serve, tipo 'exemplo/meuprojeto', mas se um dia você publicar, terá que renomear tudo.

Comandos essenciais: 'go mod init NOME' cria o módulo do zero, 'go mod tidy' sincroniza dependências (adiciona o que o código importa, remove o que não usa), 'go mod download' baixa as deps no cache, 'go mod why pacote' explica por que algo está sendo importado, 'go mod graph' mostra o grafo completo. Vamos ver tudo isso na prática.`,
    codes: [
      {
        lang: "bash",
        code: `# Criando um projeto novo do zero
mkdir minha-loja
cd minha-loja

# Inicia o módulo. Convenção: caminho do repositório futuro.
go mod init github.com/joana/minha-loja
# → go: creating new go.mod: module github.com/joana/minha-loja

ls
# → go.mod

cat go.mod
# module github.com/joana/minha-loja
#
# go 1.23`,
      },
      {
        lang: "go",
        code: `// arquivo: main.go (na raiz do módulo minha-loja)
package main

import (
    "fmt"

    // Lib externa para gerar IDs únicos. Vamos baixar a seguir.
    "github.com/google/uuid"
)

func main() {
    pedidoID := uuid.New().String()
    fmt.Println("Novo pedido:", pedidoID)
    // → Novo pedido: 7c9e6679-7425-40de-944b-e07fc1f90ae7
}`,
      },
      {
        lang: "bash",
        code: `# Antes de rodar, baixe as dependências que o código importa
go mod tidy
# → go: finding module for package github.com/google/uuid
# → go: downloading github.com/google/uuid v1.6.0
# → go: added github.com/google/uuid v1.6.0

# O go.mod agora contém:
cat go.mod
# module github.com/joana/minha-loja
#
# go 1.23
#
# require github.com/google/uuid v1.6.0

# E foi criado um go.sum com checksums:
ls
# → go.mod  go.sum  main.go`,
      },
      {
        lang: "bash",
        code: `# Comandos úteis para gerenciar dependências
go get github.com/google/uuid@v1.5.0    # fixar versão específica
go get -u ./...                          # atualiza tudo (cuidado em prod!)
go get github.com/google/uuid@latest     # pega última versão
go mod why github.com/google/uuid        # explica por que está importado
go mod graph                             # imprime grafo de dependências
go mod download                          # baixa tudo pro cache
go mod verify                            # confere checksums (segurança)`,
      },
      {
        lang: "go",
        code: `// Você pode importar pacotes DENTRO do mesmo módulo usando o caminho completo.
// Exemplo: estrutura
// minha-loja/
//   ├── go.mod          (module github.com/joana/minha-loja)
//   ├── main.go
//   └── descontos/
//       └── descontos.go

// arquivo: descontos/descontos.go
package descontos

func AplicarPercentual(preco float64, pct float64) float64 {
    return preco * (1 - pct/100)
}

// arquivo: main.go
// import "github.com/joana/minha-loja/descontos"
// final := descontos.AplicarPercentual(100.0, 10.0) // → 90.0`,
      },
    ],
    points: [
      "Todo projeto Go moderno começa com 'go mod init <caminho>' — sem isso, você está fora do mundo dos módulos.",
      "O caminho do módulo é o prefixo de todos os imports internos; use 'github.com/usuario/projeto' por convenção.",
      "'go mod tidy' é o comando que você roda toda vez que adiciona ou remove imports.",
      "go.sum guarda checksums criptográficos das deps; ele DEVE ser commitado junto com go.mod.",
      "Para subir versão, use 'go get pacote@v1.2.3' ou 'go get -u' para atualizar tudo.",
      "'go mod why pacote' é ótimo pra investigar por que uma dep transitiva apareceu.",
      "Armadilha: rodar Go fora de um módulo (sem go.mod) e receber erros confusos sobre GOPATH; sempre 'go mod init' primeiro.",
      "Idiomático: nomear o módulo com o caminho de hospedagem futuro mesmo que o projeto seja privado — facilita publicar depois.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Nunca edite go.sum manualmente. Se ele desincronizar, rode 'go mod tidy' que ele se conserta sozinho. Editar à mão pode quebrar verificações de segurança.",
      },
      {
        type: "info",
        content: "O cache de módulos fica em $GOPATH/pkg/mod e é compartilhado entre todos os seus projetos. Você pode ter 50 projetos sem duplicar uma única dependência no disco.",
      },
      {
        type: "tip",
        content: "Em projetos privados de empresa, configure GOPRIVATE=github.com/suaempresa/* para o Go não tentar verificar checksums em proxies públicos.",
      },
    ],
  },
  {
    slug: "pacotes-imports",
    section: "instalacao",
    title: "Pacotes e imports",
    difficulty: "iniciante",
    subtitle: "Como o Go organiza código em pacotes, regras de visibilidade por capitalização e padrões de import",
    intro: `Em Python, qualquer arquivo .py é automaticamente um módulo, e qualquer pasta com __init__.py é um pacote. Em Java, você usa 'package com.empresa.projeto'. Em Go, a regra é mais simples e mais rígida ao mesmo tempo: cada pasta é exatamente um pacote, e todos os arquivos dessa pasta precisam declarar o mesmo nome de pacote no topo. Não tem subpacote dentro de arquivo, não tem namespace aninhado dentro do mesmo diretório.

Essa restrição "uma pasta = um pacote" tem consequências interessantes. Você não pode ter, no mesmo diretório, um arquivo com 'package utils' e outro com 'package helpers' — o compilador recusa. Por outro lado, dois arquivos no mesmo diretório com 'package descontos' são automaticamente parte do mesmo pacote: eles veem todas as funções, tipos e variáveis um do outro, sem precisar importar. É como se fossem um único arquivo grande dividido por conveniência humana.

Visibilidade em Go não usa palavras-chave 'public' ou 'private'. Em vez disso, o critério é a capitalização da primeira letra. Se o nome começa com letra maiúscula (como 'CalcularDesconto'), ele é exportado e pode ser importado por outros pacotes. Se começa com minúscula (como 'calcularDesconto'), é privado ao pacote. Pronto, regra única, sem exceções, sem 'protected', sem 'internal'. Isso é assustador no começo e libertador depois — você bate o olho e sabe imediatamente o que faz parte da API pública.

Imports são literais: você importa pelo caminho completo do módulo + caminho relativo da pasta. Pacotes da biblioteca padrão usam nomes curtos como "fmt", "strings", "net/http". Pacotes externos usam o caminho completo como "github.com/google/uuid". O nome usado dentro do código geralmente é o último segmento do path (uuid.New(), http.Get()), mas você pode renomear com um alias (import myhttp "net/http") em casos raros.`,
    codes: [
      {
        lang: "go",
        code: `// arquivo: banco/conta.go
// Toda a pasta 'banco' é o pacote 'banco'.
package banco

// Saldo começa com maiúscula → exportado, visível de fora do pacote.
type Conta struct {
    Titular string
    Saldo   float64
}

// Função exportada (maiúscula): outros pacotes podem chamar banco.Depositar(...)
func (c *Conta) Depositar(valor float64) {
    if valor <= 0 {
        return
    }
    c.Saldo += valor
    registrarLog("depósito", valor) // chama função privada do mesmo pacote
}

// Função privada (minúscula): só visível dentro do pacote 'banco'.
func registrarLog(tipo string, valor float64) {
    // imagine que aqui escreveria em arquivo
    _ = tipo
    _ = valor
}`,
      },
      {
        lang: "go",
        code: `// arquivo: banco/saque.go
// MESMA pasta, MESMO pacote 'banco' — vê tudo do conta.go automaticamente.
package banco

import "errors"

// ErrSaldoInsuficiente é exportado (maiúscula).
var ErrSaldoInsuficiente = errors.New("saldo insuficiente")

func (c *Conta) Sacar(valor float64) error {
    if valor > c.Saldo {
        return ErrSaldoInsuficiente
    }
    c.Saldo -= valor
    registrarLog("saque", valor) // visível porque é mesmo pacote
    return nil
}`,
      },
      {
        lang: "go",
        code: `// arquivo: main.go (na raiz do módulo)
package main

import (
    "errors"
    "fmt"

    // Caminho completo: módulo + pasta interna
    "github.com/joana/minha-loja/banco"
)

func main() {
    c := &banco.Conta{Titular: "Ana", Saldo: 100}
    c.Depositar(50)
    fmt.Printf("Saldo: R$ %.2f\n", c.Saldo) // → Saldo: R$ 150.00

    if err := c.Sacar(200); err != nil {
        if errors.Is(err, banco.ErrSaldoInsuficiente) {
            fmt.Println("Não tem grana suficiente!")
        }
    }

    // banco.registrarLog("teste", 1) // ERRO: função privada
}`,
      },
      {
        lang: "go",
        code: `// Vários estilos de import
package main

import (
    // Pacote da biblioteca padrão
    "fmt"
    "net/http"

    // Pacote externo: nome do path final é usado como prefixo (uuid.X)
    "github.com/google/uuid"

    // Alias: renomeia para evitar conflito ou abreviar
    json "encoding/json"

    // Import "blank": só executa o init() do pacote, sem usar nada dele.
    // Comum em drivers SQL.
    _ "github.com/lib/pq"

    // Import "dot": traz tudo para o namespace local (DESACONSELHADO).
    . "math"
)

func main() {
    fmt.Println(uuid.New(), Pi) // Pi sem prefixo por causa do dot import
    var _ http.Client
    var _ json.Encoder
}`,
      },
      {
        lang: "go",
        code: `// Convenção: nome do pacote é o nome da pasta, em minúsculas, sem hífens.
// Pasta "minha-lib" → package minhalib (ou melhor, renomeie a pasta)
//
// EVITE pacotes genéricos como 'utils', 'common', 'helpers'.
// Eles tendem a virar lixeira de código.
//
// Bons nomes descrevem O QUE fornecem, não como:
//   user, payment, parser, csvreader
// Maus nomes:
//   utils, common, lib, manager
package payment

func Cobrar(valor float64) error {
    return nil
}`,
      },
    ],
    points: [
      "Cada pasta é exatamente um pacote; todos os arquivos da pasta declaram o mesmo nome.",
      "Capitalização decide visibilidade: 'Função' é exportada, 'função' é privada ao pacote.",
      "Arquivos do mesmo pacote veem tudo um do outro sem precisar importar.",
      "Imports usam o caminho completo: caminho do módulo + subpasta (ex.: github.com/joana/minha-loja/banco).",
      "Use 'import _ \"pacote\"' apenas para invocar init() sem usar a API (drivers de banco).",
      "Nomes de pacote devem ser curtos, em minúsculas, descrevendo o domínio (não 'utils').",
      "Armadilha: tentar nomear duas funções privadas iguais em arquivos diferentes do mesmo pacote — conflita porque é tudo o mesmo namespace.",
      "Idiomático: agrupar arquivos por domínio de negócio (banco, pedido, usuario), não por tipo técnico (models, services, controllers).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando bater dúvida se algo deve ser exportado, comece em minúscula. É muito mais fácil exportar depois (mudar a primeira letra) do que des-exportar e quebrar quem já usa.",
      },
      {
        type: "warning",
        content: "Evite o dot-import (import . \"pacote\"). Ele bagunça quem está lendo o código porque você usa funções sem prefixo, parecendo que são locais. Só vale em alguns testes específicos.",
      },
      {
        type: "info",
        content: "Há uma convenção forte de nomes curtos para pacotes: 'fmt', 'os', 'io', 'net'. Não é preguiça — é porque o nome aparece como prefixo em todo uso (fmt.Println), e nomes longos poluem visualmente.",
      },
    ],
  },
  {
    slug: "gopath-vs-modules",
    section: "instalacao",
    title: "GOPATH legado vs Modules modernos",
    difficulty: "intermediario",
    subtitle: "Por que o velho GOPATH foi substituído por módulos e o que você ainda precisa saber sobre ele hoje",
    intro: `Se você ler tutoriais antigos de Go (de antes de 2019), vai esbarrar em frases como "coloque seu projeto dentro de $GOPATH/src/github.com/usuario/...". Isso é o mundo pré-módulos, e entender essa história te ajuda a não cair em armadilhas quando ler código velho ou usar libs que ainda carregam vícios da era antiga.

No design original (2009 a 2018), o Go assumia que TODO código do mundo morava dentro de uma única pasta chamada GOPATH (geralmente ~/go). Você clonava cada repositório dentro de $GOPATH/src/<caminho>, e o Go usava esse caminho físico como identidade do pacote. As consequências eram dolorosas: você não podia ter dois projetos usando versões diferentes da mesma lib, não tinha controle real de versão, e precisava posicionar cada repo num lugar específico do sistema.

Em 2018, com a versão 1.11, o Go introduziu o sistema de Módulos como experimento, e o tornou padrão em 1.16. A diferença chave: agora cada projeto declara suas próprias dependências num arquivo go.mod, vive em qualquer lugar do sistema de arquivos, e o GOPATH virou apenas um cache global de módulos baixados. Você nem precisa mais ter seus projetos dentro do GOPATH; eles podem estar em ~/codigo, ~/Desktop, qualquer lugar.

Hoje GOPATH ainda existe mas tem papel só de utilitário: $GOPATH/pkg/mod guarda o cache de módulos baixados, $GOPATH/bin é onde 'go install' coloca binários globais. Você raramente vai mexer nele diretamente. A variável GO111MODULE controlava a transição (auto, on, off) e em Go 1.16+ o padrão é 'on' — pode ignorar. Vamos ver como reconhecer e migrar projetos antigos.`,
    codes: [
      {
        lang: "bash",
        code: `# O GOPATH ainda existe, mas hoje tem só dois subdiretórios importantes
go env GOPATH
# → /home/voce/go

ls $(go env GOPATH)
# → bin   (binários instalados via 'go install')
# → pkg   (cache de módulos baixados)

# Em projetos modernos, você NÃO precisa estar dentro do GOPATH.
mkdir ~/projetos/meu-app
cd ~/projetos/meu-app
go mod init exemplo/meu-app
# Funciona perfeitamente fora do GOPATH.`,
      },
      {
        lang: "bash",
        code: `# A variável GO111MODULE controlava a migração. Significados:
# - "on": sempre usa módulos (padrão desde Go 1.16)
# - "off": comportamento legado de GOPATH (NÃO use)
# - "auto": decide baseado em estar ou não dentro do GOPATH

go env GO111MODULE
# → on (provavelmente)

# Se por algum motivo aparecer 'off' ou 'auto', force 'on':
go env -w GO111MODULE=on

# Em Go 1.21+ esta variável foi efetivamente removida — sempre 'on'.`,
      },
      {
        lang: "bash",
        code: `# Reconhecendo um projeto LEGADO (sem módulos)
# Sintomas:
# - NÃO existe arquivo go.mod na raiz
# - O README diz "clone em $GOPATH/src/..."
# - Imports relativos como "./utils" (não funcionam mais)

# Como modernizar:
cd projeto-antigo
go mod init github.com/usuario/projeto-antigo
go mod tidy
# Pronto: deps inferidas pelos imports do código vão pro go.mod`,
      },
      {
        lang: "bash",
        code: `# Limpar cache de módulos quando algo dá errado
go clean -modcache
# → remove tudo de $GOPATH/pkg/mod

# Cuidado: depois disso, todo 'go build' baixa de novo.
# Útil quando suspeita de cache corrompido ou pacote alterado em proxy.

# Para limpar binários instalados em $GOPATH/bin:
ls $(go env GOPATH)/bin
rm $(go env GOPATH)/bin/nome-do-binario`,
      },
      {
        lang: "bash",
        code: `# Compatibilidade: você pode usar 'replace' no go.mod para apontar
# uma dependência para uma versão local — útil em refator ou debug.

# go.mod:
# module github.com/joana/app
#
# go 1.23
#
# require github.com/joana/lib v1.2.3
#
# replace github.com/joana/lib => ../lib-local

# Agora 'go build' usa o código de ../lib-local em vez do publicado.
# Lembre-se de remover o replace antes de publicar uma release.`,
      },
    ],
    points: [
      "GOPATH era o sistema antigo (pré-2019); módulos (go.mod) são o padrão atual e absoluto.",
      "Você NÃO precisa mais colocar seus projetos dentro de $GOPATH; podem estar em qualquer pasta.",
      "$GOPATH/pkg/mod ainda é usado como cache compartilhado de módulos baixados.",
      "$GOPATH/bin recebe binários instalados via 'go install'; mantenha-o no PATH.",
      "GO111MODULE=on é o padrão; em Go 1.21+ foi efetivamente removido.",
      "Projetos sem go.mod são legados; rode 'go mod init <caminho>' + 'go mod tidy' para modernizar.",
      "Use 'replace' no go.mod para apontar dependência a uma cópia local durante desenvolvimento.",
      "Armadilha: seguir tutorial antigo que manda criar pasta $GOPATH/src/... — isso já não funciona desde 2019.",
      "Idiomático: deixar GOPATH no padrão (~/go) e nunca mexer nele a mão; o Go cuida.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se um colega te enviar um projeto Go sem go.mod, NÃO tente compilar copiando para o GOPATH. Crie o go.mod com 'go mod init' e rode 'go mod tidy' — é mais rápido e evita modo legado.",
      },
      {
        type: "info",
        content: "Imports relativos ('./utils', '../lib') NUNCA funcionaram em Go, nem antes nem depois dos módulos. Sempre use o caminho completo do módulo + subpasta.",
      },
      {
        type: "tip",
        content: "Para limpar o cache de módulos ocasionalmente liberando espaço em disco, rode 'go clean -modcache'. Em projetos enterprise pesados, isso libera vários gigas.",
      },
    ],
  },
  {
    slug: "estrutura-projeto",
    section: "instalacao",
    title: "Estrutura idiomática de um projeto Go",
    difficulty: "intermediario",
    subtitle: "Layout de pastas que a comunidade adotou: cmd, internal, pkg, api e quando usar (ou não) cada um",
    intro: `Diferente de Rails, Django ou Spring, o Go não impõe uma estrutura de pastas oficial. O time da linguagem deliberadamente evitou criar um "layout padrão" porque cada projeto tem necessidades diferentes. Mas a comunidade convergiu em um conjunto de convenções, parcialmente capturadas no repositório 'golang-standards/project-layout' (que é não-oficial e até polêmico, mas amplamente usado como referência).

A regra mais importante e essa sim é oficial é a pasta 'internal/'. Qualquer código dentro de 'internal/' só pode ser importado por código que está no mesmo módulo. O compilador faz isso valer. É a forma do Go de dizer "isto é detalhe de implementação, ninguém de fora pode depender". Use 'internal' generosamente: na dúvida, ponha o pacote lá. Se um dia precisar expor, é só mover.

A pasta 'cmd/' é convenção forte: cada subpasta dentro de cmd/ representa um binário diferente. Por exemplo, 'cmd/server/main.go' gera um binário 'server', 'cmd/cli/main.go' gera um binário 'cli'. Isso permite que um único módulo Go produza múltiplos executáveis, compartilhando código via internal/. Já a pasta 'pkg/' (de 'package') é mais controversa: alguns times usam pra código que pode ser importado de fora, outros acham redundante e colocam direto na raiz.

Para projetos pequenos (um único binário, poucos pacotes), não complique: deixe main.go na raiz e crie pastas só quando o módulo crescer. Estrutura excessiva no começo é tão ruim quanto código sem estrutura. Vamos ver dois exemplos: um projeto pequeno (calculadora CLI) e um maior (API REST com múltiplos serviços).`,
    codes: [
      {
        lang: "bash",
        code: `# Layout MÍNIMO — projeto pequeno, um binário
calculadora/
├── go.mod                  # module github.com/joana/calculadora
├── go.sum
├── main.go                 # ponto de entrada
└── operacoes/
    ├── soma.go             # package operacoes
    └── soma_test.go        # testes (sufixo _test.go)

# Não invente pastas só pra parecer profissional.
# O 'main.go' na raiz é perfeitamente idiomático para projetos pequenos.`,
      },
      {
        lang: "bash",
        code: `# Layout MÉDIO — API com vários binários
loja-online/
├── go.mod                  # module github.com/empresa/loja-online
├── go.sum
├── README.md
├── cmd/                    # cada subpasta = um binário diferente
│   ├── api/
│   │   └── main.go         # gera binário 'api' (servidor HTTP)
│   ├── worker/
│   │   └── main.go         # gera binário 'worker' (processa filas)
│   └── migrate/
│       └── main.go         # gera binário 'migrate' (rodar migrations)
├── internal/               # código privado ao módulo (não importável de fora)
│   ├── pedido/
│   │   ├── pedido.go
│   │   └── pedido_test.go
│   ├── pagamento/
│   │   └── pagamento.go
│   └── db/
│       └── postgres.go
├── pkg/                    # código que outros projetos podem importar
│   └── valido/
│       └── cpf.go          # validador de CPF reutilizável
├── api/                    # OpenAPI/protobuf specs (não tem código Go)
│   └── openapi.yaml
└── scripts/
    └── deploy.sh`,
      },
      {
        lang: "go",
        code: `// arquivo: cmd/api/main.go
package main

import (
    "fmt"
    "log"
    "net/http"

    // Imports do MESMO módulo, da pasta internal
    "github.com/empresa/loja-online/internal/pedido"
)

func main() {
    http.HandleFunc("/pedidos", func(w http.ResponseWriter, r *http.Request) {
        novo := pedido.Criar("cafe", 2)
        fmt.Fprintf(w, "Pedido %d criado\n", novo.ID)
    })

    log.Println("API rodando em :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
      },
      {
        lang: "go",
        code: `// arquivo: internal/pedido/pedido.go
// Por estar em internal/, só código deste módulo pode importar.
package pedido

type Pedido struct {
    ID       int
    Produto  string
    Quantidade int
}

var ultimoID int

func Criar(produto string, qtd int) Pedido {
    ultimoID++
    return Pedido{
        ID:         ultimoID,
        Produto:    produto,
        Quantidade: qtd,
    }
}`,
      },
      {
        lang: "bash",
        code: `# Compilando os binários do layout médio
cd loja-online

# Compila e gera ./api
go build -o ./bin/api ./cmd/api

# Compila e gera ./worker
go build -o ./bin/worker ./cmd/worker

# Ou instale tudo de uma vez no $GOPATH/bin
go install ./cmd/...
# Depois disso, 'api', 'worker' e 'migrate' viram comandos globais
# (se $GOPATH/bin está no PATH).`,
      },
    ],
    points: [
      "Não tem layout 'oficial' — a comunidade convergiu em convenções, mas Go não impõe nada.",
      "'internal/' é a única pasta com semântica especial: o compilador bloqueia imports de fora do módulo.",
      "'cmd/<nome>/main.go' é a convenção para múltiplos binários no mesmo módulo.",
      "'pkg/' é controverso: use só se você expõe código pra outros projetos importarem.",
      "Em projetos pequenos, deixe main.go na raiz — não crie pastas só por ritual.",
      "Agrupe pacotes por domínio de negócio (pedido, pagamento) e não por camada técnica (models, services).",
      "Nomes de pasta em minúsculas, sem hífens, descritivos (use 'pedido' não 'PedidoService').",
      "Armadilha: copiar o layout 'enterprise' completo em projeto de fim de semana — você gasta mais tempo organizando que codando.",
      "Idiomático: começar simples (main.go + 1 pacote) e refatorar para internal/cmd só quando a complexidade exigir.",
    ],
    alerts: [
      {
        type: "info",
        content: "O repositório golang-standards/project-layout NÃO é oficial, apesar do nome. O time do Go já se manifestou contra tratá-lo como padrão. Use como inspiração, não como dogma.",
      },
      {
        type: "tip",
        content: "Quando estiver em dúvida se um pacote deve ir em internal/ ou na raiz, ponha em internal/. É mais fácil 'desproteger' depois movendo de pasta do que retirar acesso quando outros já importam.",
      },
      {
        type: "success",
        content: "A flexibilidade de cada cmd/<nome> ser um binário separado é poderosa: você pode publicar uma única release com api+worker+cli compartilhando 90% do código.",
      },
    ],
  },
  {
    slug: "go-run-build",
    section: "instalacao",
    title: "go run, go build e go install — qual usar quando",
    difficulty: "intermediario",
    subtitle: "Diferenças práticas entre executar, compilar e instalar, com flags úteis para cross-compile e binários enxutos",
    intro: `Os três comandos parecem fazer a mesma coisa, mas servem a propósitos bem diferentes. Confundi-los é uma das fontes mais comuns de frustração para quem está começando, então vamos separar bem o que cada um faz e quando usar.

'go run' é para protótipos e scripts. Ele compila tudo em memória, executa e descarta o binário ao terminar. É lento se você roda repetidamente (porque recompila do zero toda vez), mas perfeito para "deixa eu só testar uma coisa". É o equivalente a 'python script.py' ou 'node script.js'. Não deixa rastro de binário no diretório.

'go build' compila o pacote atual e gera um arquivo executável na pasta corrente (ou onde você apontar com -o). O binário fica lá, pronto pra você copiar pro servidor, mandar pro colega, ou rodar quando quiser. Nada é instalado em lugar nenhum do sistema; é um arquivo local. É o que você usa em pipelines de CI/CD para gerar artefatos de release.

'go install' compila E instala o binário em $GOPATH/bin (ou $GOBIN se setado). Se essa pasta está no seu PATH, o binário vira um comando global que você chama de qualquer lugar. É o que ferramentas Go (gopls, dlv, golangci-lint) usam para se distribuir: 'go install ferramenta@latest' e pronto, virou comando do sistema. Não use para projetos finais que vão pra produção; use para utilitários CLI.

Bônus: o Go suporta cross-compile trivialmente. Você pode estar no Mac e gerar um binário Linux ARM64 com duas variáveis de ambiente. Isso é maravilhoso pra distribuir software multi-plataforma sem precisar de Docker nem máquinas virtuais.`,
    codes: [
      {
        lang: "bash",
        code: `# go run: prototipar, testar coisas pequenas
echo 'package main; import "fmt"; func main(){ fmt.Println("oi") }' > t.go
go run t.go
# → oi

# Pode passar argumentos depois do nome do arquivo:
echo 'package main
import (
  "fmt"
  "os"
)
func main(){ fmt.Println("Args:", os.Args[1:]) }' > args.go
go run args.go banana 42
# → Args: [banana 42]

# Para múltiplos arquivos no mesmo pacote:
go run ./cmd/api/        # roda tudo da pasta cmd/api/`,
      },
      {
        lang: "bash",
        code: `# go build: gera um binário local
cd meu-projeto
go build                       # cria binário com nome do diretório
ls
# → meu-projeto  (executável)

go build -o servidor ./cmd/api  # nomeia explicitamente
./servidor

# Flags úteis para binários menores (produção)
go build -ldflags="-s -w" -o app ./cmd/api
# -s: remove tabela de símbolos
# -w: remove informações de DWARF (debug)
# Resultado: binário ~30% menor, mas sem stack trace bonito em panics.`,
      },
      {
        lang: "bash",
        code: `# go install: instala binário globalmente
# Útil para FERRAMENTAS CLI, não para apps de produção.

go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
# Baixa, compila e coloca em $GOPATH/bin/golangci-lint

# Agora chama de qualquer lugar:
golangci-lint --version

# Também funciona dentro do seu próprio módulo:
cd meu-projeto
go install ./cmd/cli
# → instala 'cli' em $GOPATH/bin

# Confira: $(go env GOPATH)/bin precisa estar no PATH
echo $PATH | grep "$(go env GOPATH)/bin"`,
      },
      {
        lang: "bash",
        code: `# Cross-compile: gerar binário pra outro SO/arquitetura
# GOOS = sistema operacional alvo (linux, darwin, windows)
# GOARCH = arquitetura (amd64, arm64, 386, arm)

# Estou no Mac M2, quero gerar binário Linux x86_64:
GOOS=linux GOARCH=amd64 go build -o app-linux ./cmd/api

# Para Raspberry Pi (ARM64):
GOOS=linux GOARCH=arm64 go build -o app-rpi ./cmd/api

# Para Windows:
GOOS=windows GOARCH=amd64 go build -o app.exe ./cmd/api

# Listar todas combinações suportadas:
go tool dist list | head
# → aix/ppc64
# → android/386
# → android/amd64
# → android/arm
# → darwin/amd64
# → darwin/arm64
# → linux/amd64
# → linux/arm64`,
      },
      {
        lang: "bash",
        code: `# Embutindo metadados no binário com -ldflags
# Útil pra rastrear versão, commit, data de build

# arquivo: main.go
# package main
# import "fmt"
# var (
#   Version = "dev"
#   Commit  = "none"
#   Date    = "unknown"
# )
# func main() { fmt.Printf("v%s commit=%s built=%s\n", Version, Commit, Date) }

go build -ldflags="\
  -X main.Version=1.2.3 \
  -X main.Commit=$(git rev-parse --short HEAD) \
  -X main.Date=$(date -u +%Y-%m-%d)" \
  -o app ./cmd/api

./app
# → v1.2.3 commit=a3f9c1d built=2025-01-15`,
      },
    ],
    points: [
      "'go run' = prototipar e descartar; 'go build' = gerar binário local; 'go install' = instalar global em $GOPATH/bin.",
      "Use 'go install pacote@latest' para distribuir e instalar ferramentas CLI.",
      "Use 'go build -o nome ./cmd/api' em pipelines de CI para artefatos de release.",
      "Adicione -ldflags='-s -w' para gerar binários até 30% menores (sem debug info).",
      "Cross-compile com GOOS e GOARCH é trivial: 'GOOS=linux GOARCH=amd64 go build'.",
      "Você pode embutir versão/commit no binário usando -ldflags='-X pacote.Variavel=valor'.",
      "Armadilha: rodar 'go install' dentro do projeto e ficar procurando o binário na pasta atual — ele foi pra $GOPATH/bin.",
      "Idiomático: separar build (CI gera artefato) de install (dev local pega ferramenta) e nunca misturar.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para distribuir uma release multi-plataforma, escreva um shell script que chama 'go build' várias vezes alternando GOOS/GOARCH. Ferramentas como 'goreleaser' automatizam isso lindamente.",
      },
      {
        type: "warning",
        content: "Cuidado com CGO: se o seu código importa 'C' (CGO), cross-compile fica MUITO mais difícil porque exige toolchain do sistema alvo. Evite CGO se quiser binários portáveis.",
      },
      {
        type: "info",
        content: "Binários Go são estáticos por padrão (com exceção de CGO): você gera um único arquivo executável e copia pro servidor. Sem JVM, sem interpretador, sem dependências de runtime.",
      },
    ],
  },
  {
    slug: "hello-world-completo",
    section: "instalacao",
    title: "Hello World completo: input, output e tratamento de erro",
    difficulty: "iniciante",
    subtitle: "Um programa interativo de verdade que lê do teclado, processa dados e trata erros — o seu kit de partida",
    intro: `Chegou a hora de juntar tudo em um programa que faz mais que imprimir 'olá mundo'. Vamos construir uma calculadora interativa de gorjeta: o programa pergunta o valor da conta, o percentual da gorjeta, calcula e mostra o resultado. No caminho a gente vê leitura de teclado, conversão de string para número, tratamento de erro idiomático em Go (com retorno de error em vez de exceção), formatação de saída e organização de funções.

A diferença mais marcante para quem vem de Python ou JavaScript: em Go, erros não são exceções jogadas pra cima da pilha. Funções que podem falhar retornam um valor extra do tipo 'error', e o chamador precisa decidir o que fazer. Isso parece verbose ('if err != nil' em quase toda chamada), mas torna o fluxo de erro explícito no código. Você lê uma função e sabe imediatamente o que pode dar errado, sem precisar adivinhar quais exceptions ela lança.

Vamos também ver o pacote 'bufio' para ler linhas do teclado de forma confiável, 'strconv' para converter texto em número, 'strings' para limpar entrada do usuário (TrimSpace), e os.Args para argumentos de linha de comando. São os blocos básicos que você usa em qualquer ferramenta CLI Go séria.

Por fim, este programa segue convenções idiomáticas: pacote main, função main pequena que delega para funções menores, retornos de erro propagados, formatação de saída com fmt.Printf usando especificadores de tipo. Copie, rode, modifique. Teste o que acontece quando você digita texto onde se esperava número. Veja como o tratamento de erro funciona na prática.`,
    codes: [
      {
        lang: "bash",
        code: `# Crie a estrutura do projeto
mkdir gorjeta && cd gorjeta
go mod init exemplo/gorjeta
touch main.go
# Cole o código do próximo bloco em main.go`,
      },
      {
        lang: "go",
        code: `// arquivo: main.go
package main

import (
    "bufio"   // leitura bufferizada (linha por linha do teclado)
    "fmt"
    "os"
    "strconv" // converte string em número
    "strings" // utilitários de texto (TrimSpace)
)

func main() {
    leitor := bufio.NewReader(os.Stdin)

    valorConta, err := lerFloat(leitor, "Valor da conta (R$): ")
    if err != nil {
        fmt.Fprintln(os.Stderr, "Erro lendo conta:", err)
        os.Exit(1)
    }

    percentual, err := lerFloat(leitor, "Percentual de gorjeta (%): ")
    if err != nil {
        fmt.Fprintln(os.Stderr, "Erro lendo percentual:", err)
        os.Exit(1)
    }

    gorjeta := valorConta * (percentual / 100)
    total := valorConta + gorjeta

    fmt.Println("\\n=== Conta detalhada ===")
    fmt.Printf("Subtotal:  R$ %8.2f\\n", valorConta)
    fmt.Printf("Gorjeta:   R$ %8.2f  (%.0f%%)\\n", gorjeta, percentual)
    fmt.Printf("Total:     R$ %8.2f\\n", total)
}

// lerFloat encapsula: prompt + leitura + limpeza + conversão.
// Retorna o número e um erro (zero-value de error é nil).
func lerFloat(r *bufio.Reader, prompt string) (float64, error) {
    fmt.Print(prompt)
    linha, err := r.ReadString('\\n')
    if err != nil {
        return 0, fmt.Errorf("falha ao ler linha: %w", err)
    }
    linha = strings.TrimSpace(linha)
    // Aceita vírgula como separador decimal (estilo brasileiro)
    linha = strings.ReplaceAll(linha, ",", ".")

    n, err := strconv.ParseFloat(linha, 64)
    if err != nil {
        return 0, fmt.Errorf("valor inválido %q: %w", linha, err)
    }
    return n, nil
}`,
      },
      {
        lang: "bash",
        code: `# Rodando o programa
go run main.go
# Valor da conta (R$): 120,50
# Percentual de gorjeta (%): 10
#
# === Conta detalhada ===
# Subtotal:  R$   120.50
# Gorjeta:   R$    12.05  (10%)
# Total:     R$   132.55

# Testando erro: digite texto onde espera número
go run main.go
# Valor da conta (R$): abc
# Erro lendo conta: valor inválido "abc": strconv.ParseFloat: parsing "abc": invalid syntax
# (e o programa sai com código 1)`,
      },
      {
        lang: "go",
        code: `// Variação: aceitar argumentos de linha de comando em vez de teclado
// arquivo: cmd-args.go
package main

import (
    "fmt"
    "os"
    "strconv"
)

func main() {
    if len(os.Args) != 3 {
        fmt.Fprintln(os.Stderr, "uso: gorjeta <valor> <percentual>")
        os.Exit(2)
    }

    valor, err := strconv.ParseFloat(os.Args[1], 64)
    if err != nil {
        fmt.Fprintln(os.Stderr, "valor inválido:", err)
        os.Exit(1)
    }

    pct, err := strconv.ParseFloat(os.Args[2], 64)
    if err != nil {
        fmt.Fprintln(os.Stderr, "percentual inválido:", err)
        os.Exit(1)
    }

    total := valor * (1 + pct/100)
    fmt.Printf("Total com %g%% de gorjeta: R$ %.2f\\n", pct, total)
}

// Uso:
// go run cmd-args.go 120.50 10
// → Total com 10% de gorjeta: R$ 132.55`,
      },
      {
        lang: "go",
        code: `// Compile, instale e use como comando global
// arquivo: main.go (mesma pasta do go.mod)

// 1. Garante que tudo está bonito
// $ go fmt ./...
// $ go vet ./...

// 2. Instala como binário global
// $ go install .
// → binário 'gorjeta' agora está em $GOPATH/bin

// 3. Use de qualquer pasta
// $ gorjeta
// Valor da conta (R$): 50
// Percentual de gorjeta (%): 15
// ...

// Para distribuir pra um colega (binário Linux):
// $ GOOS=linux GOARCH=amd64 go build -o gorjeta-linux .
// Mande o arquivo gorjeta-linux por e-mail. Ele só precisa rodar:
// $ chmod +x gorjeta-linux
// $ ./gorjeta-linux
// Sem instalar Go, sem dependências.`,
      },
    ],
    points: [
      "Em Go, funções que podem falhar retornam (resultado, error); o chamador trata com 'if err != nil'.",
      "bufio.NewReader(os.Stdin) + ReadString('\\n') é a forma idiomática de ler linhas do teclado.",
      "strings.TrimSpace remove \\n e espaços; sempre limpe entrada do usuário antes de converter.",
      "strconv.ParseFloat e strconv.Atoi são usados para converter texto em número.",
      "fmt.Errorf(\"... %w\", err) embrulha um erro mantendo a cadeia original (errors.Is/As funcionam).",
      "os.Exit(1) sai com código de erro; útil em ferramentas CLI para sinalizar falha.",
      "Use os.Args quando o input vem por linha de comando; bufio quando vem por teclado interativamente.",
      "Armadilha: esquecer de checar 'err' e usar o valor retornado como se estivesse válido — em Go o zero-value passa silencioso.",
      "Idiomático: encapsular ler+limpar+converter em uma função helper para não repetir o tratamento de erro em todo lugar.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para CLIs mais complexas com flags (--port, -v), use o pacote 'flag' da biblioteca padrão ou 'github.com/spf13/cobra'. Os.Args funciona pra coisas simples.",
      },
      {
        type: "info",
        content: "O zero-value de error é nil. Isso significa que 'var err error' começa com nil, que representa 'sem erro'. Por isso o padrão 'if err != nil' é tão central na linguagem.",
      },
      {
        type: "success",
        content: "Você acabou de escrever um programa Go completo: módulo, imports, função main, helpers, leitura de input, tratamento de erro e formatação. A partir daqui, é evolução incremental.",
      },
      {
        type: "warning",
        content: "Não use 'panic' para erros esperados como 'usuário digitou texto inválido'. Reserve panic para situações realmente impossíveis (bug interno). Para o usuário, retorne error e trate.",
      },
    ],
  },
];
