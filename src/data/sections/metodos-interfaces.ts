import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "metodos",
    section: "metodos-interfaces",
    title: "Métodos em Go",
    difficulty: "iniciante",
    subtitle: "Como pendurar comportamento em tipos sem precisar de classes nem herança",
    intro: `Em linguagens como Java, C# ou Python, você costuma juntar dados e comportamento dentro de uma classe. Em Go não existe a palavra class, mas isso não significa que não dá para organizar código orientado a tipos. O que Go faz é separar dois conceitos: o tipo (geralmente uma struct, que carrega os dados) e os métodos (funções que sabem operar sobre aquele tipo). Você define um método quase como uma função normal, mas adiciona um receiver entre o func e o nome.

A sintaxe é func (c Conta) Saldo() float64. Esse "(c Conta)" é o receiver: você está dizendo que essa função pertence ao tipo Conta e que dentro dela "c" é o valor recebido. É equivalente ao "self" do Python ou ao "this" implícito do Java, mas você escolhe o nome (a convenção idiomática é usar uma ou duas letras minúsculas, geralmente a inicial do tipo). Não chame de "this" nem "self" em Go; vai parecer fora de lugar.

Métodos só podem ser definidos no mesmo pacote do tipo. Você não pode chegar e adicionar um método em time.Time, por exemplo, porque ele é definido no pacote time. Essa é uma decisão deliberada: evita o caos do "monkey patching" de Ruby ou Python, onde qualquer um adiciona método em qualquer coisa. Se você quer estender um tipo de outro pacote, embute ele numa struct sua ou cria uma função normal que recebe ele como parâmetro.

Métodos são úteis para deixar a chamada mais legível. Em vez de calcularJurosDaConta(c, taxa) você escreve c.CalcularJuros(taxa). Lê mais bonito, agrupa o que pertence ao tipo e ainda permite que esse tipo satisfaça interfaces (assunto dos próximos capítulos). É a base de quase tudo idiomático em Go: io.Reader, error, http.Handler — todos nascem dessa ideia simples de associar funções a tipos.`,
    codes: [
      {
        lang: "bash",
        code: `# Crie um módulo novo para seguir os exemplos.
mkdir banco && cd banco
go mod init exemplo/banco
# saída: go: creating new go.mod: module exemplo/banco`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Conta é uma struct simples que guarda dados de uma conta corrente.
type Conta struct {
    Titular string
    Saldo   float64
}

// Resumo é um método com receiver de valor.
// "(c Conta)" significa que recebemos uma cópia da Conta dentro de c.
func (c Conta) Resumo() string {
    return fmt.Sprintf("%s tem R$ %.2f", c.Titular, c.Saldo)
}

func main() {
    minha := Conta{Titular: "Ana", Saldo: 1500.50}
    fmt.Println(minha.Resumo())
    // → saída: Ana tem R$ 1500.50
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Métodos não precisam ser só de struct: qualquer tipo definido no seu pacote serve.
type Celsius float64

// Para chamar c.Fahrenheit(), basta ter o método com receiver Celsius.
func (c Celsius) Fahrenheit() float64 {
    return float64(c)*9/5 + 32
}

func main() {
    temp := Celsius(36.5)
    fmt.Printf("%.1f C = %.1f F\n", float64(temp), temp.Fahrenheit())
    // → saída: 36.5 C = 97.7 F
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Você pode ter vários métodos no mesmo tipo, agrupando o comportamento.
type Pedido struct {
    ID    int
    Itens []float64
}

func (p Pedido) Total() float64 {
    var soma float64
    for _, preco := range p.Itens {
        soma += preco
    }
    return soma
}

func (p Pedido) Quantidade() int {
    return len(p.Itens)
}

func main() {
    p := Pedido{ID: 42, Itens: []float64{19.90, 5.50, 39.99}}
    fmt.Printf("Pedido %d: %d itens, total R$ %.2f\n",
        p.ID, p.Quantidade(), p.Total())
    // → saída: Pedido 42: 3 itens, total R$ 65.39
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Função normal x método: as duas coisas fazem o mesmo,
// mas a chamada com método costuma ler melhor.
type Produto struct {
    Nome  string
    Preco float64
}

// Versão como função "solta".
func DescreverProduto(p Produto) string {
    return fmt.Sprintf("%s custa R$ %.2f", p.Nome, p.Preco)
}

// Versão como método. Mesmo corpo, sintaxe diferente para chamar.
func (p Produto) Descrever() string {
    return fmt.Sprintf("%s custa R$ %.2f", p.Nome, p.Preco)
}

func main() {
    cafe := Produto{Nome: "Café", Preco: 12.50}
    fmt.Println(DescreverProduto(cafe)) // chamada como função
    fmt.Println(cafe.Descrever())       // chamada como método (mais idiomático)
}`,
      },
    ],
    points: [
      "Método é função com um receiver entre func e o nome: func (c Conta) Saldo().",
      "O receiver funciona como o self do Python, mas você escolhe o nome.",
      "Idiomático: nome do receiver curto (1 ou 2 letras minúsculas), nunca 'this' nem 'self'.",
      "Métodos só podem ser definidos no mesmo pacote em que o tipo foi declarado.",
      "Qualquer tipo nomeado pode ter métodos, não só structs (até float64 com alias serve).",
      "Armadilha: tentar adicionar método em tipo de outro pacote (não compila).",
      "Use métodos para agrupar comportamento ligado a um tipo e satisfazer interfaces depois.",
    ],
    alerts: [
      {
        type: "info",
        content: "A escolha entre função e método é estética e de design: prefira método quando a operação é uma responsabilidade natural do tipo, e função quando a operação coordena vários tipos sem pertencer a nenhum.",
      },
      {
        type: "tip",
        content: "Mantenha o nome do receiver consistente entre métodos do mesmo tipo. Se você usou (c Conta) em um método, use (c Conta) em todos. O linter golangci-lint reclama quando você varia.",
      },
      {
        type: "warning",
        content: "Não defina métodos em tipos primitivos diretamente (você não pode escrever func (i int) Foo()). É preciso criar um tipo nomeado novo, como type Idade int, e pendurar métodos nele.",
      },
    ],
  },
  {
    slug: "receivers-ponteiro",
    section: "metodos-interfaces",
    title: "Receivers de valor vs ponteiro",
    difficulty: "intermediario",
    subtitle: "Quando usar (c Conta) e quando usar (c *Conta), e por que isso muda tudo",
    intro: `Esse é um daqueles temas que separa quem só sabe a sintaxe de Go de quem entende o modelo de memória. A regra superficial é fácil: receiver de valor recebe uma cópia do tipo, receiver de ponteiro recebe o endereço do original. Mas as consequências são grandes — e errar aqui gera bugs sutis, daqueles que só aparecem quando você pensava que tudo estava funcionando.

Quando você escreve func (c Conta) Depositar(v float64), o Go cria uma cópia da Conta inteira só para essa chamada. Se você fizer c.Saldo += v, está mexendo na cópia, e a Conta original não muda. É como entregar uma fotocópia de um documento e pedir para a pessoa rabiscar — o original continua intacto. Já com func (c *Conta) Depositar(v float64), você recebe um ponteiro: c.Saldo += v altera o objeto verdadeiro. Em Java e Python tudo que é objeto já se comporta como ponteiro implicitamente; em Go a escolha é explícita, e você precisa pensar nela.

A regra prática que a comunidade Go segue é: use ponteiro quando o método precisa modificar o estado do receiver, quando o tipo é grande (cópias caras) ou quando ele contém coisas que não devem ser copiadas (sync.Mutex, por exemplo). Use valor quando o tipo é pequeno e imutável conceitualmente (time.Time, string, structs pequenas como Point). E mantenha consistência: se algum método do tipo precisa de ponteiro, todos devem usar ponteiro. Misturar gera confusão e impede que você use o tipo como interface.

Outra coisa importante: você pode chamar um método de ponteiro a partir de uma variável endereçável (uma variável normal, não um literal). Go automaticamente faz &c quando preciso. Mas se o valor está dentro de um map, por exemplo, ele não é endereçável e o compilador reclama. Esse é um gotcha clássico que a gente vê em todo bootcamp.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

type Conta struct {
    Titular string
    Saldo   float64
}

// Receiver de VALOR: recebe uma cópia. Mudanças NÃO afetam o original.
func (c Conta) DepositarErrado(valor float64) {
    c.Saldo += valor // mexe na cópia local
}

// Receiver de PONTEIRO: recebe o endereço. Mudanças afetam o original.
func (c *Conta) DepositarCerto(valor float64) {
    c.Saldo += valor // mexe na conta original
}

func main() {
    c := Conta{Titular: "Bia", Saldo: 100}

    c.DepositarErrado(50)
    fmt.Println(c.Saldo) // → 100 (não mudou!)

    c.DepositarCerto(50)
    fmt.Println(c.Saldo) // → 150 (alterou de verdade)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Para tipos pequenos e imutáveis, valor é ótimo: barato e seguro.
type Ponto struct {
    X, Y float64
}

func (p Ponto) DistanciaOrigem() float64 {
    return p.X*p.X + p.Y*p.Y // simplificado, sem raiz
}

// Para structs grandes, prefira ponteiro mesmo só para ler:
// evita copiar centenas de bytes a cada chamada.
type RelatorioMensal struct {
    Vendas    [10000]float64
    Devolucao [10000]float64
}

func (r *RelatorioMensal) TotalVendas() float64 {
    var soma float64
    for _, v := range r.Vendas {
        soma += v
    }
    return soma
}

func main() {
    p := Ponto{X: 3, Y: 4}
    fmt.Println(p.DistanciaOrigem()) // → 25

    var r RelatorioMensal
    r.Vendas[0] = 10
    fmt.Println(r.TotalVendas()) // → 10
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "fmt"
    "sync"
)

// Quando o tipo embute algo que não pode ser copiado (sync.Mutex, sync.WaitGroup),
// SEMPRE use receiver de ponteiro. Copiar um Mutex causa bugs silenciosos.

type Cache struct {
    mu    sync.Mutex
    dados map[string]string
}

func NovoCache() *Cache {
    return &Cache{dados: map[string]string{}}
}

// Ponteiro obrigatório: sem isso, cada chamada teria seu próprio Mutex.
func (c *Cache) Set(k, v string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.dados[k] = v
}

func (c *Cache) Get(k string) string {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.dados[k]
}

func main() {
    cache := NovoCache()
    cache.Set("user:1", "Ana")
    fmt.Println(cache.Get("user:1")) // → Ana
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

type Item struct {
    Nome  string
    Preco float64
}

// Método de ponteiro para alterar campos.
func (i *Item) AplicarDesconto(percent float64) {
    i.Preco -= i.Preco * percent / 100
}

func main() {
    // Variável normal: endereçável. Go faz &p automaticamente.
    p := Item{Nome: "Café", Preco: 20}
    p.AplicarDesconto(10)
    fmt.Println(p.Preco) // → 18

    // Em slices, o elemento é endereçável: funciona.
    itens := []Item{{Nome: "Pão", Preco: 5}}
    itens[0].AplicarDesconto(20)
    fmt.Println(itens[0].Preco) // → 4

    // Em maps, o valor NÃO é endereçável. O código abaixo NÃO compila:
    // estoque := map[string]Item{"x": {Preco: 10}}
    // estoque["x"].AplicarDesconto(5) // erro: cannot take address
    // Solução comum: pegar o valor, alterar, devolver.
    estoque := map[string]Item{"x": {Preco: 10}}
    item := estoque["x"]
    item.AplicarDesconto(5)
    estoque["x"] = item
    fmt.Println(estoque["x"].Preco) // → 9.5
}`,
      },
    ],
    points: [
      "Receiver de valor recebe cópia; mudanças não afetam o original.",
      "Receiver de ponteiro recebe endereço; mudanças persistem no objeto real.",
      "Idiomático: use ponteiro quando o método precisa mutar, quando o tipo é grande, ou quando contém Mutex/WaitGroup.",
      "Idiomático: mantenha consistência — se um método precisa de ponteiro, faça todos com ponteiro.",
      "Tipos pequenos e imutáveis (Point, time.Time) costumam usar receiver de valor.",
      "Armadilha: chamar método de ponteiro em valor dentro de map (não compila — map values não são endereçáveis).",
      "Erro comum: definir método com receiver de valor achando que vai modificar o estado e nada acontecer.",
      "Go faz a mágica de &x automaticamente quando você chama método de ponteiro em variável endereçável.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca copie uma struct que contenha sync.Mutex, sync.WaitGroup ou outros tipos de sincronização. Cada cópia tem seu próprio estado de lock e isso gera condições de corrida invisíveis. Use sempre ponteiro.",
      },
      {
        type: "tip",
        content: "Quando estiver na dúvida, use ponteiro. É a escolha mais segura para structs com qualquer comportamento ou crescimento futuro. Valor só compensa quando o tipo é claramente pequeno e imutável.",
      },
      {
        type: "warning",
        content: "Receiver nil de ponteiro é permitido na chamada do método, mas qualquer acesso a campo dele causa panic. Se faz sentido para o seu tipo (alguns iteradores fazem), trate explicitamente o caso nil dentro do método.",
      },
    ],
  },
  {
    slug: "interfaces-basico",
    section: "metodos-interfaces",
    title: "Interfaces: o coração do Go",
    difficulty: "intermediario",
    subtitle: "Contratos de comportamento que tornam seu código flexível e testável",
    intro: `Interface, em Go, é um conjunto de assinaturas de métodos. Você declara: "tudo que tiver esses métodos é do tipo Tal". É um contrato. A interface não diz nada sobre como esses métodos funcionam, apenas que precisam existir, com a mesma assinatura. A partir do momento em que um tipo concreto implementa todos esses métodos, ele pode ser usado em qualquer lugar que espere essa interface.

Se você vem de Java, vai notar uma diferença enorme: lá você precisa escrever class MinhaConta implements ContaBancaria. Em Go não existe a palavra implements. Você simplesmente cria os métodos, e o compilador descobre sozinho que sua struct satisfaz aquela interface. Isso se chama satisfação implícita (vamos detalhar no próximo capítulo). É libertador: dá para criar interfaces depois que os tipos já existem, inclusive interfaces sobre tipos de bibliotecas de terceiros.

Por que isso importa tanto? Porque interfaces são a forma idiomática de Go fazer polimorfismo e inversão de dependência. Em vez de uma função receber uma struct concreta, ela recebe uma interface. Isso desacopla o código: a função funciona com qualquer implementação, inclusive um mock no teste. É a base do "aceite interfaces, retorne structs", uma máxima da comunidade Go que você vai ouvir muito.

A regra de ouro é: interfaces pequenas valem ouro. io.Reader tem um método. io.Writer tem um método. error tem um método. Quanto menor a interface, mais coisas conseguem implementá-la, mais reusável ela fica. Se você está criando uma interface com 10 métodos, provavelmente está fazendo errado. Pense em "o que essa função realmente precisa?" e descreva só isso na interface.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Definindo uma interface: é um contrato de método(s).
type Notificavel interface {
    Notificar(mensagem string) error
}

// Implementação 1: notificar por e-mail.
type Email struct {
    Para string
}

func (e Email) Notificar(msg string) error {
    fmt.Printf("Enviando e-mail para %s: %s\n", e.Para, msg)
    return nil
}

// Implementação 2: notificar por SMS.
type SMS struct {
    Numero string
}

func (s SMS) Notificar(msg string) error {
    fmt.Printf("SMS para %s: %s\n", s.Numero, msg)
    return nil
}

// Função que aceita QUALQUER coisa que saiba notificar.
func Avisar(n Notificavel, mensagem string) {
    if err := n.Notificar(mensagem); err != nil {
        fmt.Println("falhou:", err)
    }
}

func main() {
    Avisar(Email{Para: "ana@exemplo.com"}, "Pedido aprovado")
    Avisar(SMS{Numero: "11999999999"}, "Código: 1234")
    // → saída:
    // Enviando e-mail para ana@exemplo.com: Pedido aprovado
    // SMS para 11999999999: Código: 1234
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Interface pequena: a função só precisa de uma coisa.
// "Aceite interfaces, retorne structs" — máxima idiomática.
type Logger interface {
    Log(linha string)
}

// Implementação simples que escreve no console.
type ConsoleLogger struct{}

func (ConsoleLogger) Log(linha string) {
    fmt.Println("[log]", linha)
}

// Implementação que junta linhas em memória — útil para testes.
type MemoryLogger struct {
    Linhas []string
}

func (m *MemoryLogger) Log(linha string) {
    m.Linhas = append(m.Linhas, linha)
}

// Função do "domínio": não sabe se grava no console ou em memória.
func ProcessarPedido(id int, log Logger) {
    log.Log(fmt.Sprintf("processando pedido %d", id))
}

func main() {
    ProcessarPedido(1, ConsoleLogger{}) // log de verdade
    mem := &MemoryLogger{}
    ProcessarPedido(2, mem)             // log capturado em slice
    fmt.Println(mem.Linhas)             // → [processando pedido 2]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Uma interface também pode ser usada como tipo de variável e slice.
type Forma interface {
    Area() float64
}

type Retangulo struct{ L, A float64 }
type Circulo struct{ R float64 }

func (r Retangulo) Area() float64 { return r.L * r.A }
func (c Circulo) Area() float64   { return 3.14159 * c.R * c.R }

func main() {
    formas := []Forma{
        Retangulo{L: 3, A: 4},
        Circulo{R: 5},
    }
    var soma float64
    for _, f := range formas {
        soma += f.Area()
    }
    fmt.Printf("Área total: %.2f\n", soma)
    // → saída: Área total: 90.54
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Interfaces são a base para mockar dependências em testes.
// Aqui, a função salvar precisa de um "Repositorio". No teste,
// passamos um repositório falso que apenas guarda em memória.

type Pedido struct {
    ID    int
    Total float64
}

type Repositorio interface {
    Salvar(p Pedido) error
}

type RepoFake struct {
    Salvos []Pedido
}

func (r *RepoFake) Salvar(p Pedido) error {
    r.Salvos = append(r.Salvos, p)
    return nil
}

func RegistrarPedido(p Pedido, repo Repositorio) error {
    if p.Total <= 0 {
        return fmt.Errorf("pedido inválido: total %.2f", p.Total)
    }
    return repo.Salvar(p)
}

func main() {
    fake := &RepoFake{}
    if err := RegistrarPedido(Pedido{ID: 1, Total: 99.9}, fake); err != nil {
        fmt.Println("erro:", err)
    }
    fmt.Println("registrados:", fake.Salvos)
    // → saída: registrados: [{1 99.9}]
}`,
      },
    ],
    points: [
      "Interface é um conjunto de assinaturas de métodos — um contrato.",
      "Em Go, não existe palavra-chave implements: a satisfação é descoberta pelo compilador.",
      "Idiomático: 'aceite interfaces, retorne structs' — funções recebem interfaces para serem flexíveis.",
      "Interfaces pequenas (1 a 3 métodos) são as mais reusáveis e a marca registrada do Go.",
      "Use interfaces para desacoplar código e tornar testes triviais com mocks/fakes.",
      "Armadilha: criar interface gigante para 'organizar tudo' — vira contrato impossível de implementar.",
      "Você pode ter slices de interface ([]Forma) e iterar polimorficamente sobre tipos diferentes.",
      "Defina a interface no pacote que a CONSOME, não no que a implementa (idiomático).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Antes de criar uma interface nova, pergunte: alguma função realmente precisa polimorfismo aqui? Interface por interface é um anti-padrão. Crie interfaces quando há ao menos uma necessidade real de troca de implementação ou de mock.",
      },
      {
        type: "info",
        content: "io.Reader, io.Writer, fmt.Stringer e error são as interfaces mais comuns do Go padrão. Estude-as: quase todo código real implementa uma delas em algum momento.",
      },
      {
        type: "success",
        content: "Como Go descobre satisfação automaticamente, você pode criar uma interface no SEU pacote e fazer um tipo de outra biblioteca encaixar nela sem mudar o código original. Isso é poderoso para adaptar bibliotecas legadas.",
      },
    ],
  },
  {
    slug: "interfaces-implicitas",
    section: "metodos-interfaces",
    title: "Satisfação implícita de interfaces",
    difficulty: "intermediario",
    subtitle: "Por que Go não tem 'implements' e como esse detalhe muda toda a arquitetura",
    intro: `Em Java, C# ou TypeScript você precisa declarar explicitamente que sua classe implementa uma interface: class Pedido implements Salvavel. Em Go, isso simplesmente não existe. Você cria o tipo, cria os métodos com as assinaturas certas e pronto — o compilador, sozinho, sabe que aquele tipo satisfaz a interface. Esse mecanismo é chamado de structural typing ou duck typing estático: se anda como pato e quaca como pato, é pato.

A consequência prática é enorme: você consegue criar uma interface depois que os tipos já existem, inclusive sobre tipos de bibliotecas de terceiros que você não pode modificar. É possível pegar um *sql.DB padrão, um *http.Client e um struct seu e dizer "todos satisfazem essa interface minha que tem o método Get(string)". Em Java, isso seria impossível sem wrappers ou adaptadores explícitos.

Outro efeito é que o acoplamento entre quem define e quem implementa a interface fica frouxo. O pacote que precisa do contrato (geralmente o consumidor) define a interface; os pacotes que produzem os tipos nem sabem que essa interface existe. Isso vai contra o instinto de quem vem de Java, mas é a forma idiomática em Go: defina interfaces perto de quem as usa, não perto de quem as implementa.

Há um truque útil para garantir em tempo de compilação que um tipo realmente satisfaz uma interface: a linha var _ MinhaInterface = (*MinhaStruct)(nil). Ela não faz nada em runtime, mas se você esquecer de implementar um método ou errar a assinatura, o compilador grita imediatamente. Use isso em pacotes onde a relação tipo/interface é importante.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Definimos a interface DEPOIS de já existir um tipo.
// Não precisamos modificar Saudacao para que ela "implemente" Falante.
type Saudacao struct {
    Texto string
}

func (s Saudacao) Falar() string {
    return s.Texto + "!"
}

// Interface criada depois — Saudacao já a satisfaz por ter Falar() string.
type Falante interface {
    Falar() string
}

func main() {
    var f Falante = Saudacao{Texto: "Oi"}
    fmt.Println(f.Falar()) // → Oi!
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Mesmo um tipo da biblioteca padrão pode "ganhar" interfaces nossas.
// Aqui criamos uma interface que time.Time satisfaz sem alterar o pacote time.
import "time"

type Datavel interface {
    Format(layout string) string
}

func ImprimirData(d Datavel) {
    fmt.Println(d.Format("02/01/2006"))
}

func main() {
    agora := time.Now() // *time.Time já tem método Format(layout string) string
    ImprimirData(agora)
    // → saída: data atual no formato dd/mm/aaaa
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Truque idiomático: garantir em tempo de compilação que um tipo
// satisfaz uma interface. Se faltar método, o build quebra na hora.

type Repositorio interface {
    Buscar(id int) (string, error)
    Apagar(id int) error
}

type RepoMemoria struct {
    dados map[int]string
}

func (r *RepoMemoria) Buscar(id int) (string, error) {
    v, ok := r.dados[id]
    if !ok {
        return "", fmt.Errorf("id %d não encontrado", id)
    }
    return v, nil
}

func (r *RepoMemoria) Apagar(id int) error {
    delete(r.dados, id)
    return nil
}

// Linha "guarda": força o compilador a checar que *RepoMemoria implementa Repositorio.
var _ Repositorio = (*RepoMemoria)(nil)

func main() {
    r := &RepoMemoria{dados: map[int]string{1: "Ana"}}
    nome, _ := r.Buscar(1)
    fmt.Println(nome) // → Ana
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Erro comum: assinatura quase igual, mas não exatamente igual.
// Isso faz o tipo NÃO satisfazer a interface, e a mensagem de erro confunde.

type Salvavel interface {
    Salvar() error
}

type Documento struct {
    Conteudo string
}

// ATENÇÃO: a assinatura está diferente! Retorna string, não error.
// Documento NÃO implementa Salvavel por causa disso.
func (d Documento) Salvar() string {
    return "ok"
}

func main() {
    // var s Salvavel = Documento{} // erro: Salvar tem assinatura errada
    fmt.Println(Documento{}.Salvar())

    // Mensagem do compilador (em código real):
    // cannot use Documento{} (value of type Documento) as Salvavel value
    // in variable declaration: Documento does not implement Salvavel
    // (wrong type for method Salvar)
}`,
      },
    ],
    points: [
      "Em Go, satisfazer uma interface é automático: basta ter os métodos com assinatura idêntica.",
      "Não existe 'implements' — esse acoplamento explícito de Java/C# é desnecessário.",
      "Idiomático: defina a interface no pacote que a CONSOME, não no que a implementa.",
      "Você pode criar interfaces sobre tipos de bibliotecas que não controla.",
      "Use var _ Interface = (*Tipo)(nil) para checar satisfação em tempo de compilação.",
      "Armadilha: assinatura quase igual (string vs error, ponteiro vs valor) faz o tipo não satisfazer.",
      "Erro comum: copiar de Java e criar interfaces gigantes só para 'documentar'. Faça interfaces pequenas, perto do uso.",
    ],
    alerts: [
      {
        type: "info",
        content: "A satisfação implícita é também chamada de 'structural typing'. TypeScript adota algo parecido em alguns contextos, mas em Go é a regra fundamental e está embutida no compilador desde o dia zero.",
      },
      {
        type: "tip",
        content: "Quando uma struct deveria implementar uma interface mas o compilador reclama, a causa quase sempre é um receiver de ponteiro vs valor mal escolhido, ou um detalhe da assinatura que difere. Compare letra a letra.",
      },
      {
        type: "warning",
        content: "Não confunda satisfação implícita com tipagem dinâmica. Tudo é checado em tempo de compilação. Se faltar um método, o programa nem builda — não há erro silencioso em runtime como em Python.",
      },
    ],
  },
  {
    slug: "interface-vazia-any",
    section: "metodos-interfaces",
    title: "interface{} e any",
    difficulty: "intermediario",
    subtitle: "Quando aceitar 'qualquer coisa' faz sentido e quando é um cheiro de design ruim",
    intro: `A interface vazia, escrita interface{}, é a interface que não exige método nenhum. Como todo tipo tem zero ou mais métodos, todo tipo satisfaz a interface vazia. Em Go 1.18 ganhamos um apelido oficial para ela: any. As duas formas são equivalentes — interface{} e any significam exatamente a mesma coisa, mas any é mais curto e a comunidade migrou rapidamente para essa grafia.

Para quem vem do Python, isso parece familiar: é como aceitar object em qualquer lugar. Em Java, equivale a Object. Em TypeScript, é o any. A diferença é que em Go o sistema de tipos é estritíssimo, então usar any é abrir mão das checagens estáticas que tornam a linguagem segura. Você ganha flexibilidade, mas paga em type safety. É uma ferramenta válida — mas, como faca afiada, deve ser usada com cuidado.

Onde any aparece de verdade no Go idiomático? Em fmt.Println, que aceita qualquer coisa para imprimir. Em encoding/json para decodificar JSON com formato desconhecido. Em containers genéricos antes do Go 1.18 (hoje, generics resolvem melhor isso). E em chamadas que precisam serializar tipos diferentes para um logger estruturado, por exemplo. Fora desses casos, se você está usando any em código novo, pare e pense: provavelmente uma interface mais específica ou um type parameter genérico resolveria melhor.

Quando você guarda algo dentro de um any, perde acesso aos métodos e campos do tipo original. Para "tirar" o valor lá de dentro, você precisa de type assertion (assunto do próximo capítulo) ou de um type switch. É exatamente como pegar uma caixa fechada e ter que abrir para descobrir o que tem dentro.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// any e interface{} são literalmente a mesma coisa.
// any foi adicionado em Go 1.18 como apelido idiomático.

func main() {
    var a any = 42
    var b interface{} = "texto"
    var c any = []int{1, 2, 3}

    fmt.Println(a, b, c)
    // → saída: 42 texto [1 2 3]

    // Você não pode fazer a + 1, porque o compilador não sabe o tipo.
    // Para isso, precisa de type assertion (próximo capítulo).
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Caso de uso real: função de log que aceita pares chave-valor variados.
// É comum em loggers estruturados como zap ou slog.
func Log(mensagem string, campos ...any) {
    fmt.Printf("[%s] ", mensagem)
    for i := 0; i < len(campos); i += 2 {
        fmt.Printf("%v=%v ", campos[i], campos[i+1])
    }
    fmt.Println()
}

func main() {
    Log("login ok", "usuario", "ana", "tentativas", 3, "ip", "10.0.0.1")
    // → saída: [login ok] usuario=ana tentativas=3 ip=10.0.0.1
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "encoding/json"
    "fmt"
)

// JSON sem schema fixo é o lugar clássico de any em Go.
// O decodificador devolve map[string]any para objetos.
func main() {
    bruto := []byte(\`{"nome":"Ana","idade":30,"ativo":true}\`)
    var dados map[string]any

    if err := json.Unmarshal(bruto, &dados); err != nil {
        fmt.Println("erro:", err)
        return
    }

    fmt.Println(dados["nome"])  // → Ana
    fmt.Println(dados["idade"]) // → 30 (mas como float64 internamente)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Quando você puder, prefira uma interface MAIS específica em vez de any.
// Em vez disso:
func ImprimirRuim(coisa any) {
    fmt.Println(coisa)
}

// Faça isso: aceite Stringer, que pelo menos garante o método String().
type ImpressaoAmigavel interface {
    String() string
}

func ImprimirBom(c ImpressaoAmigavel) {
    fmt.Println(c.String())
}

type Usuario struct {
    Nome  string
    Email string
}

func (u Usuario) String() string {
    return fmt.Sprintf("Usuario(%s <%s>)", u.Nome, u.Email)
}

func main() {
    u := Usuario{"Ana", "ana@x.com"}
    ImprimirRuim(u) // funciona, mas qualquer coisa entra aqui
    ImprimirBom(u)  // só aceita quem se compromete a ter String()
    // → saída:
    // {Ana ana@x.com}
    // Usuario(Ana <ana@x.com>)
}`,
      },
    ],
    points: [
      "any é apelido oficial para interface{} desde Go 1.18 — preferira any em código novo.",
      "Todo tipo satisfaz any, porque a interface vazia não exige método nenhum.",
      "Use any quando o domínio realmente é dinâmico: JSON sem schema, loggers, fmt.Println.",
      "Idiomático: prefira a interface mais específica possível em vez de any.",
      "Para acessar o valor real dentro de um any, use type assertion ou type switch.",
      "Armadilha: usar any em todo lugar 'para flexibilizar' — é abrir mão da segurança de tipos.",
      "Erro comum: tentar somar ou comparar valores any diretamente — o compilador não permite.",
      "Generics (Go 1.18+) costumam ser a resposta moderna quando você pensaria em any.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Toda vez que você escreve any, está dizendo ao compilador que abre mão da checagem estática. O bug que era pego em compilação vai aparecer em runtime, com panic se você fizer assertion errada.",
      },
      {
        type: "info",
        content: "Em encoding/json, números viram float64 ao decodificar para any, mesmo que o JSON contenha um inteiro como 42. Esse é um pega-ratão clássico para quem espera int.",
      },
      {
        type: "tip",
        content: "Se você está em Go 1.18 ou superior e pensou em criar uma função 'Container[any]', considere usar generics em vez disso. O código fica tão flexível quanto e mantém a segurança de tipos.",
      },
    ],
  },
  {
    slug: "type-assertion",
    section: "metodos-interfaces",
    title: "Type assertion e type switch",
    difficulty: "intermediario",
    subtitle: "Como abrir a 'caixa' de uma interface e descobrir qual tipo concreto está lá dentro",
    intro: `Quando você guarda algo num valor de interface — seja any ou uma interface mais específica — perde acesso direto aos métodos e campos do tipo original. Para recuperar o tipo concreto, Go oferece duas ferramentas: a type assertion (v, ok := x.(T)) e o type switch. As duas perguntam, em runtime, "esse valor de interface é, na verdade, um T?". Se sim, dão acesso ao valor concreto.

A forma com vírgula-ok é a segura: v recebe o valor (zero do tipo T se a checagem falhar), e ok recebe true ou false. A forma sem o ok, como x.(T), faz a mesma checagem, mas se errar, dispara panic. Use a forma segura quase sempre. A não-segura só faz sentido quando você tem certeza absoluta do tipo (e mesmo assim, é arriscado em código que vai para produção).

O type switch é uma versão multibranch da type assertion. Você escreve switch v := x.(type) e dentro coloca cases por tipo: case int, case string, case Pedido, etc. Em cada case, v já tem o tipo certo, sem precisar fazer assertion de novo. É muito útil quando você está processando algo que pode ser um de N tipos diferentes — exatamente o caso do encoding/json com map[string]any, ou de um event bus que carrega eventos heterogêneos.

Um detalhe importante: type assertion serve não só para tipos concretos, mas também para outras interfaces. Se você tem um io.Reader, pode perguntar "esse Reader também é um io.Closer?" com c, ok := r.(io.Closer). Esse padrão é a base de muito código avançado em Go: detecção de capacidades adicionais sem quebrar a API base.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

func main() {
    var x any = "olá mundo"

    // Forma SEGURA com vírgula-ok: nunca dá panic.
    s, ok := x.(string)
    fmt.Println(s, ok) // → olá mundo true

    n, ok := x.(int)
    fmt.Println(n, ok) // → 0 false (zero do tipo + false)

    // Forma INSEGURA: panica se errar.
    s2 := x.(string) // ok, x é string mesmo
    fmt.Println(s2)

    // n2 := x.(int) // ← isso causaria panic em runtime!
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// type switch: lida com vários tipos de uma vez.
// Caso de uso clássico: processar valores vindos de JSON ou de canais.
func descrever(valor any) string {
    switch v := valor.(type) {
    case nil:
        return "é nil"
    case int:
        return fmt.Sprintf("inteiro: %d (dobro %d)", v, v*2)
    case string:
        return fmt.Sprintf("texto com %d letras: %q", len(v), v)
    case []int:
        soma := 0
        for _, x := range v {
            soma += x
        }
        return fmt.Sprintf("slice de %d ints, soma %d", len(v), soma)
    default:
        return fmt.Sprintf("tipo desconhecido: %T", v)
    }
}

func main() {
    fmt.Println(descrever(42))
    fmt.Println(descrever("oi"))
    fmt.Println(descrever([]int{1, 2, 3}))
    fmt.Println(descrever(3.14))
    // → saída:
    // inteiro: 42 (dobro 84)
    // texto com 2 letras: "oi"
    // slice de 3 ints, soma 6
    // tipo desconhecido: float64
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

// Padrão idiomático: detectar capacidades extras de uma interface.
// Recebemos um io.Reader genérico, mas se ele também for io.Closer,
// fechamos no final. Caso contrário, simplesmente ignoramos.
func ConsumirEContagem(r io.Reader) (int, error) {
    if c, ok := r.(io.Closer); ok {
        defer c.Close() // só fecha se faz sentido
        fmt.Println("ele também é Closer, vou fechar no fim")
    }
    dados, err := io.ReadAll(r)
    return len(dados), err
}

func main() {
    // strings.Reader é io.Reader, mas NÃO é io.Closer.
    n, _ := ConsumirEContagem(strings.NewReader("alô"))
    fmt.Println("bytes:", n) // → bytes: 3
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// type switch sobre interfaces, não só tipos concretos.
// Útil em handlers que aceitam vários "tipos de erro".

type ErroValidacao struct{ Campo string }
type ErroAutenticacao struct{ Motivo string }

func (e ErroValidacao) Error() string   { return "validação: " + e.Campo }
func (e ErroAutenticacao) Error() string { return "auth: " + e.Motivo }

func tratar(err error) string {
    switch e := err.(type) {
    case ErroValidacao:
        return fmt.Sprintf("400 - campo inválido: %s", e.Campo)
    case ErroAutenticacao:
        return fmt.Sprintf("401 - %s", e.Motivo)
    case nil:
        return "200 OK"
    default:
        return "500 - erro inesperado: " + e.Error()
    }
}

func main() {
    fmt.Println(tratar(ErroValidacao{Campo: "email"}))
    fmt.Println(tratar(ErroAutenticacao{Motivo: "token expirado"}))
    fmt.Println(tratar(fmt.Errorf("conexão caiu")))
    // → saída:
    // 400 - campo inválido: email
    // 401 - token expirado
    // 500 - erro inesperado: conexão caiu
}`,
      },
    ],
    points: [
      "Use sempre v, ok := x.(T) — a forma segura que nunca dá panic.",
      "x.(T) sem o ok dispara panic se o tipo for diferente.",
      "type switch agrupa várias type assertions e dá v já tipado em cada case.",
      "Idiomático: detecte capacidades opcionais com r.(io.Closer) e similares.",
      "Em case nil: do type switch, você cobre o caso de a interface não ter valor.",
      "Armadilha: usar a forma sem ok em produção achando que 'sempre vai dar certo'.",
      "Erro comum: esquecer que números em map[string]any vindos de JSON são float64, não int.",
      "Use %T no fmt para descobrir o tipo dinâmico durante depuração.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Type assertion sem vírgula-ok em um valor de tipo errado dispara panic. Em servidor HTTP, isso derruba a goroutine inteira (e às vezes leva o processo junto). Sempre use a forma com ok em código de produção.",
      },
      {
        type: "tip",
        content: "Quando precisar fazer várias assertions seguidas no mesmo valor, use type switch — fica mais legível, mais rápido e menos sujeito a erro do que vários ifs encadeados.",
      },
      {
        type: "info",
        content: "Type assertion funciona tanto para tipos concretos (int, string, MinhaStruct) quanto para interfaces (io.Closer, error). Essa simetria é a base de padrões avançados como errors.As, que veremos no capítulo de erros customizados.",
      },
    ],
  },
  {
    slug: "composicao-interfaces",
    section: "metodos-interfaces",
    title: "Composição de interfaces",
    difficulty: "intermediario",
    subtitle: "Como interfaces pequenas se combinam em contratos maiores como io.ReadWriter",
    intro: `Em Go, interfaces se compõem por embedding. Você escreve uma interface nova listando outras interfaces dentro dela, e o resultado exige todos os métodos de todas as interfaces embutidas. O exemplo canônico está na biblioteca padrão: io.ReadWriter é simplesmente uma interface composta por io.Reader e io.Writer. Não há mágica — é açúcar sintático para "tem o método Read e o método Write".

Esse padrão é o oposto cultural de Java, onde a tendência é criar interfaces grandes e fazer várias classes implementarem todas elas. Em Go, a comunidade construiu sua biblioteca padrão com interfaces minúsculas (io.Reader tem um método, io.Writer tem um método, io.Closer tem um método) e depois compõe as combinações que aparecem com frequência. O resultado é flexibilidade enorme: cada tipo implementa só o que faz sentido, e pode satisfazer várias combinações diferentes ao mesmo tempo.

A composição também serve para refinar contratos por camada de uso. Em um sistema, você pode ter uma interface UsuarioRepositorio com métodos básicos, e outra interface UsuarioRepositorioAdmin que estende a primeira com métodos de manutenção. Funções "comuns" recebem só a interface básica; o painel administrativo recebe a estendida. Quem implementa decide se faz parte só do círculo interno ou do externo.

Há também a composição com tipos concretos via embedding em structs (que veremos com mais detalhe na trilha de structs e composição). A diferença chave é: interface embutida em interface continua sendo só assinaturas. Já struct embutida em struct realmente promove campos e métodos. Não confunda os dois conceitos — eles têm a mesma sintaxe, mas comportamentos bem diferentes.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Duas interfaces pequenas e independentes.
type Leitor interface {
    Ler() (string, error)
}

type Escritor interface {
    Escrever(s string) error
}

// Interface composta: exige TODOS os métodos das duas.
type LeitorEscritor interface {
    Leitor
    Escritor
}

// Implementação concreta que satisfaz as duas.
type Buffer struct {
    conteudo string
}

func (b *Buffer) Ler() (string, error)     { return b.conteudo, nil }
func (b *Buffer) Escrever(s string) error  { b.conteudo += s; return nil }

func main() {
    var rw LeitorEscritor = &Buffer{}
    rw.Escrever("oi ")
    rw.Escrever("mundo")
    s, _ := rw.Ler()
    fmt.Println(s) // → oi mundo
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

// Exemplo real: io.ReadWriter, que existe na biblioteca padrão.
// Sua definição é literalmente "Reader + Writer".
//
// type ReadWriter interface {
//     Reader
//     Writer
// }

func copiar(rw io.ReadWriter, conteudo string) error {
    if _, err := io.WriteString(rw, conteudo); err != nil {
        return err
    }
    bytes, err := io.ReadAll(rw)
    if err != nil {
        return err
    }
    fmt.Println("lido:", string(bytes))
    return nil
}

func main() {
    var sb strings.Builder
    // strings.Builder NÃO é Reader, então este código abaixo não compila:
    // copiar(&sb, "teste")
    _ = sb

    // Mas bytes.Buffer satisfaz ambos.
    // Veja o próximo exemplo.
    fmt.Println("rode o próximo exemplo para ver bytes.Buffer em ação")
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

// bytes.Buffer implementa Read e Write: portanto satisfaz io.ReadWriter.
func processar(rw io.ReadWriter) {
    io.WriteString(rw, "log de venda: 99.90\n")
    io.WriteString(rw, "log de venda: 12.50\n")

    saida, _ := io.ReadAll(rw)
    fmt.Print(string(saida))
}

func main() {
    var buf bytes.Buffer
    processar(&buf)
    // → saída:
    // log de venda: 99.90
    // log de venda: 12.50
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Composição em camadas: interface básica + estendida.
type UsuarioRepo interface {
    Buscar(id int) (string, error)
}

type UsuarioRepoAdmin interface {
    UsuarioRepo // herda a obrigação de ter Buscar
    Apagar(id int) error
    Promover(id int) error
}

type RepoMemoria struct {
    dados map[int]string
}

func (r *RepoMemoria) Buscar(id int) (string, error) {
    v, ok := r.dados[id]
    if !ok {
        return "", fmt.Errorf("id %d não encontrado", id)
    }
    return v, nil
}

func (r *RepoMemoria) Apagar(id int) error {
    delete(r.dados, id)
    return nil
}

func (r *RepoMemoria) Promover(id int) error {
    fmt.Println("promoveu", id)
    return nil
}

// Garantia em compilação.
var _ UsuarioRepoAdmin = (*RepoMemoria)(nil)

func main() {
    repo := &RepoMemoria{dados: map[int]string{1: "Ana"}}
    var leitura UsuarioRepo = repo
    nome, _ := leitura.Buscar(1)
    fmt.Println(nome) // → Ana

    var admin UsuarioRepoAdmin = repo
    admin.Apagar(1)
    // → saída: Ana (e operação de apagar é silenciosa)
}`,
      },
    ],
    points: [
      "Composição de interfaces se faz embutindo uma interface dentro de outra.",
      "io.ReadWriter é o exemplo canônico: Reader + Writer combinados.",
      "Idiomático: comece com interfaces pequenas (1 método) e componha quando necessário.",
      "Quem implementa precisa ter os métodos de TODAS as interfaces embutidas.",
      "Use camadas (Repo + RepoAdmin) para separar permissões e responsabilidades.",
      "Armadilha: confundir embedding de interface com embedding de struct — sintaxe igual, comportamento diferente.",
      "Composição mantém o princípio 'aceite interfaces pequenas, retorne structs concretas'.",
    ],
    alerts: [
      {
        type: "info",
        content: "A biblioteca padrão é a melhor referência viva de composição de interfaces. Olhe os tipos do pacote io: Reader, Writer, Closer, Seeker são todos pequenos e se combinam em ReadWriter, ReadCloser, WriteCloser, ReadWriteSeeker, etc.",
      },
      {
        type: "tip",
        content: "Antes de criar uma nova interface composta, verifique se a combinação já existe na biblioteca padrão. Reuso é melhor do que reinventar.",
      },
      {
        type: "warning",
        content: "Evite explosão combinatória de interfaces compostas. Se você tem 5 métodos e cria todas as combinações 2 a 2, vira 10 interfaces. Componha apenas as combinações que realmente aparecem em assinaturas de função.",
      },
    ],
  },
  {
    slug: "generics-intro",
    section: "metodos-interfaces",
    title: "Generics: introdução",
    difficulty: "avancado",
    subtitle: "Type parameters chegaram em Go 1.18 e mudaram para sempre como escrevemos código reutilizável",
    intro: `Por mais de uma década, Go viveu sem generics. O motivo oficial era simplicidade: a equipe não queria entrar no buraco coelho de Java, C# ou C++ template. A consequência é que para escrever uma função genérica como "max", você fazia uma versão para int, outra para float64, outra para string. Ou então usava interface{} e perdia toda checagem estática. Em Go 1.18, lançado em março de 2022, finalmente chegaram os type parameters.

A sintaxe é direta: depois do nome da função (ou tipo), abre colchetes e lista os parâmetros de tipo: func Max[T int | float64](a, b T) T. O T é um nome qualquer (convenção é T, K, V, E para casos comuns), e o que aparece depois dele (int | float64) é uma constraint, ou seja, "T pode ser qualquer um desses tipos". Vamos detalhar constraints no próximo capítulo.

Na chamada, você pode escrever Max[int](2, 3) explicitando o tipo, ou simplesmente Max(2, 3) — o compilador costuma inferir T pelo argumento. Por trás dos panos, Go 1.18+ usa uma técnica chamada GC shape stenciling: o compilador gera código compartilhado entre tipos com o mesmo "formato" de memória, gerando binários mais enxutos do que os templates do C++.

Generics não substituem interfaces. A regra prática é: se você precisa polimorfismo de comportamento (várias implementações concretas atendendo um mesmo contrato), use interface. Se você precisa polimorfismo de tipo (a mesma operação válida para vários tipos sem precisar de método específico), use generics. Funções como Map, Filter, Reduce em coleções, ou estruturas como Set[T], Cache[K, V], são casos clássicos onde generics brilham.`,
    codes: [
      {
        lang: "bash",
        code: `# Generics exigem Go 1.18 ou superior. Verifique antes:
go version
# saída esperada algo como: go version go1.22.0 linux/amd64`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Antes do Go 1.18, você teria que escrever Max para cada tipo.
// Agora basta um só, com type parameter T.
func Max[T int | float64 | string](a, b T) T {
    if a > b {
        return a
    }
    return b
}

func main() {
    fmt.Println(Max(3, 7))           // → 7 (T inferido como int)
    fmt.Println(Max(2.5, 1.9))       // → 2.5 (T inferido como float64)
    fmt.Println(Max("ana", "bia"))   // → bia (T inferido como string)
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Funções clássicas de coleções: Map, Filter.
func Map[T, U any](slice []T, fn func(T) U) []U {
    saida := make([]U, len(slice))
    for i, v := range slice {
        saida[i] = fn(v)
    }
    return saida
}

func Filter[T any](slice []T, ok func(T) bool) []T {
    var saida []T
    for _, v := range slice {
        if ok(v) {
            saida = append(saida, v)
        }
    }
    return saida
}

func main() {
    precos := []float64{10.0, 25.5, 7.0, 99.9}
    comImposto := Map(precos, func(p float64) float64 { return p * 1.1 })
    fmt.Println(comImposto)
    // → [11 28.05 7.7 109.89000000000001]

    caros := Filter(precos, func(p float64) bool { return p > 20 })
    fmt.Println(caros)
    // → [25.5 99.9]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Tipos genéricos: você pode parametrizar uma struct.
type Pilha[T any] struct {
    itens []T
}

func (p *Pilha[T]) Empilhar(v T) {
    p.itens = append(p.itens, v)
}

func (p *Pilha[T]) Desempilhar() (T, bool) {
    var zero T
    if len(p.itens) == 0 {
        return zero, false
    }
    n := len(p.itens) - 1
    v := p.itens[n]
    p.itens = p.itens[:n]
    return v, true
}

func main() {
    var p Pilha[string]
    p.Empilhar("primeiro")
    p.Empilhar("segundo")
    fmt.Println(p.Desempilhar()) // → segundo true
    fmt.Println(p.Desempilhar()) // → primeiro true
    fmt.Println(p.Desempilhar()) // → "" false
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Quando há ambiguidade na inferência, você pode passar o tipo manualmente.
func Zero[T any]() T {
    var z T
    return z
}

func main() {
    // Aqui não há argumento que ajude a inferir T, então passamos explícito.
    fmt.Printf("%T %v\n", Zero[int](), Zero[int]())       // int 0
    fmt.Printf("%T %v\n", Zero[string](), Zero[string]()) // string ""
    fmt.Printf("%T %v\n", Zero[bool](), Zero[bool]())     // bool false
}`,
      },
    ],
    points: [
      "Generics chegaram em Go 1.18 (março de 2022) — exija essa versão ou superior.",
      "Sintaxe: func Nome[T constraint](args) returnType — type parameter entre colchetes.",
      "Idiomático: T, K, V, E são nomes convencionais para type parameters comuns.",
      "Use generics para polimorfismo de tipo (mesma operação para vários tipos).",
      "Use interface para polimorfismo de comportamento (várias implementações de um contrato).",
      "Inferência geralmente descobre o tipo pelo argumento; passe explícito quando ambíguo.",
      "Armadilha: usar generics para tudo só porque é novo — interfaces continuam mais simples na maioria dos casos.",
      "Erro comum: tentar usar operador (+, <, ==) sem garantir que a constraint permite.",
    ],
    alerts: [
      {
        type: "info",
        content: "Generics em Go usam uma técnica chamada GC shape stenciling. O compilador gera código compartilhado para tipos com o mesmo formato de memória, evitando o code bloat dos templates do C++.",
      },
      {
        type: "tip",
        content: "Antes de generificar uma função, escreva-a primeiro para um tipo específico. Só promova a generics quando aparecer a segunda ou terceira variação. Generificar cedo demais costuma resultar em assinaturas obscuras.",
      },
      {
        type: "warning",
        content: "Métodos de tipo genérico não podem ter type parameters próprios. Você não pode escrever func (p Pilha[T]) Mapear[U any](fn func(T) U) Pilha[U]. Para isso, transforme em função top-level que recebe Pilha[T].",
      },
    ],
  },
  {
    slug: "generics-constraints",
    section: "metodos-interfaces",
    title: "Constraints em generics",
    difficulty: "avancado",
    subtitle: "Como restringir os tipos aceitos em type parameters usando comparable, ~int e interfaces customizadas",
    intro: `Constraint, em Go, é a interface que descreve o que um type parameter pode ser e o que ele pode fazer. Sem constraint adequada, o compilador não deixa você somar valores, comparar com <, ou usar como chave de map. A constraint mais permissiva é any (sinônimo de interface{}), que aceita qualquer tipo mas não permite operações específicas. As mais úteis vêm com regras claras de operadores e comportamento.

Existem três grandes formas de escrever constraints. A primeira é uma união simples de tipos: int | float64 | string. Isso restringe T a esses três tipos exatos. A segunda é o operador til (~), como ~int, que significa "qualquer tipo cujo subjacente seja int". Isso inclui aliases como type Idade int. A terceira é definir uma interface com métodos: type Stringer interface { String() string }, e usar essa interface como constraint para garantir comportamento.

A linguagem traz duas constraints fundamentais embutidas: any (qualquer coisa) e comparable (qualquer coisa que possa usar == e !=). comparable é essencial para chaves de map genérico, por exemplo. O pacote golang.org/x/exp/constraints (que entrou na biblioteca padrão como parte de slices/maps no Go 1.21) oferece Ordered (numéricos e strings), Integer, Float, Signed, Unsigned, etc. Use esses pacotes em vez de reinventar a roda.

Constraints customizadas podem combinar tipos e métodos. Você pode exigir "qualquer tipo que seja int OU float64 E que tenha o método String()". Isso é poderoso, mas use com moderação — constraints muito complexas viram quebra-cabeça para quem lê. A regra de ouro continua: prefira a constraint mais simples que resolva o caso real.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Constraint embutida: comparable.
// Permite usar == e !=. Indispensável para chaves de map genéricas.
func ContarOcorrencias[T comparable](slice []T) map[T]int {
    contagem := map[T]int{}
    for _, v := range slice {
        contagem[v]++
    }
    return contagem
}

func main() {
    palavras := []string{"go", "rust", "go", "python", "go"}
    fmt.Println(ContarOcorrencias(palavras))
    // → map[go:3 python:1 rust:1]

    numeros := []int{1, 2, 1, 3, 2, 1}
    fmt.Println(ContarOcorrencias(numeros))
    // → map[1:3 2:2 3:1]
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Constraint com união de tipos: T pode ser int, int64 ou float64.
type Numero interface {
    int | int64 | float64
}

func Soma[T Numero](valores []T) T {
    var total T
    for _, v := range valores {
        total += v
    }
    return total
}

func main() {
    fmt.Println(Soma([]int{1, 2, 3, 4}))           // → 10
    fmt.Println(Soma([]float64{1.5, 2.5, 3.0}))    // → 7
    // Soma([]string{"a","b"}) // erro de compilação: string não está em Numero
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// O operador ~ aceita qualquer tipo cujo "tipo subjacente" seja o citado.
// Sem o ~, type Reais float64 NÃO seria aceito por float64 puro.

type Numerico interface {
    ~int | ~float64
}

type Reais float64
type Centavos int

func Dobro[T Numerico](v T) T {
    return v * 2
}

func main() {
    fmt.Println(Dobro(Reais(10.5)))    // → 21
    fmt.Println(Dobro(Centavos(150)))  // → 300
    fmt.Println(Dobro(7))              // → 14
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "cmp"
    "fmt"
)

// Constraint pelo pacote padrão (Go 1.21+):
// cmp.Ordered permite usar < > <= >= em type parameter.

func MenorMaior[T cmp.Ordered](valores []T) (T, T) {
    menor, maior := valores[0], valores[0]
    for _, v := range valores[1:] {
        if v < menor {
            menor = v
        }
        if v > maior {
            maior = v
        }
    }
    return menor, maior
}

func main() {
    fmt.Println(MenorMaior([]int{4, 1, 9, 3, 7}))             // → 1 9
    fmt.Println(MenorMaior([]string{"laranja", "abacaxi", "uva"})) // → abacaxi uva
    fmt.Println(MenorMaior([]float64{2.7, 1.1, 9.9, 0.5}))    // → 0.5 9.9
}`,
      },
      {
        lang: "go",
        code: `package main

import "fmt"

// Constraint por método: T precisa ter String() string.
type ImprimivelComID interface {
    fmt.Stringer
    GetID() int
}

type Produto struct {
    ID   int
    Nome string
}

func (p Produto) String() string { return p.Nome }
func (p Produto) GetID() int     { return p.ID }

func ImprimirTodos[T ImprimivelComID](itens []T) {
    for _, item := range itens {
        fmt.Printf("[%d] %s\n", item.GetID(), item)
    }
}

func main() {
    estoque := []Produto{
        {ID: 1, Nome: "Café"},
        {ID: 2, Nome: "Pão"},
    }
    ImprimirTodos(estoque)
    // → saída:
    // [1] Café
    // [2] Pão
}`,
      },
    ],
    points: [
      "any aceita qualquer tipo mas impede operações específicas.",
      "comparable habilita == e !=, indispensável para chaves de map genéricas.",
      "Idiomático: use cmp.Ordered (Go 1.21+) para algoritmos que precisam de < e >.",
      "O operador ~ inclui tipos que tenham determinado tipo subjacente (~int aceita type Idade int).",
      "Constraints customizadas podem misturar união de tipos e exigência de métodos.",
      "Armadilha: usar int como constraint sem ~ — type aliases não passam.",
      "Erro comum: tentar usar < em T any, sem constraint que permita ordenação.",
      "Quanto mais restrita a constraint, mais coisas você pode fazer com T dentro da função.",
    ],
    alerts: [
      {
        type: "info",
        content: "Os pacotes cmp, slices e maps (todos da biblioteca padrão desde Go 1.21) já trazem implementações genéricas para a maioria dos algoritmos comuns. Antes de escrever sua versão, veja se já não existe lá.",
      },
      {
        type: "tip",
        content: "Crie suas próprias constraints só quando precisar. Para a maioria dos casos, any, comparable, cmp.Ordered e as constraints de constraints/integer.go cobrem 95% das necessidades.",
      },
      {
        type: "warning",
        content: "Você não pode usar tipos paramétricos como constraint diretamente em métodos. Generics em Go têm limitações intencionais para manter o sistema simples — não tente forçar padrões de C++ ou Haskell aqui.",
      },
    ],
  },
  {
    slug: "erros-customizados",
    section: "metodos-interfaces",
    title: "Erros customizados",
    difficulty: "avancado",
    subtitle: "Crie tipos de erro com contexto rico, navegue na cadeia com errors.Is e errors.As",
    intro: `O tipo error em Go é simplesmente uma interface com um método: Error() string. Tudo que tem esse método é um error. Isso significa que você pode criar tipos de erro próprios, ricos em contexto, e o restante do código continua tratando como o error genérico que conhece. É a mesma flexibilidade que vimos em interfaces, aplicada ao tema mais central de Go: tratamento de erros explícito.

Erros simples como fmt.Errorf("usuário %d não encontrado", id) servem para muita coisa, mas têm uma limitação: tudo que sobra é uma string. Se quem chama precisa decidir o que fazer com base no tipo do erro (mostrar mensagem amigável, repetir, alertar admin), comparar strings é frágil e quebra fácil. A solução idiomática é criar um tipo de erro: uma struct que carrega os campos relevantes e implementa o método Error() string.

A partir do Go 1.13, ganhamos errors.Is e errors.As para navegar nessas cadeias. errors.Is(err, alvo) percorre a cadeia procurando um erro igual ao alvo (útil para sentinelas como io.EOF, sql.ErrNoRows). errors.As(err, &alvo) procura um erro que possa ser convertido para o tipo concreto que você passou — é como type assertion, mas funciona mesmo se o erro estiver embrulhado em outro com fmt.Errorf("falha: %w", err).

O verbo %w no fmt.Errorf é a chave do empilhamento (wrapping). Ele cria um erro novo que "embrulha" o original, mantendo a cadeia. Quem recebe pode usar errors.Unwrap, errors.Is e errors.As para navegar. Esse mecanismo evita que você precise inventar campos manuais de "causa" como em outras linguagens — a biblioteca padrão já cuida.`,
    codes: [
      {
        lang: "go",
        code: `package main

import "fmt"

// Tipo de erro customizado: struct com método Error() string.
type ErroValidacao struct {
    Campo   string
    Mensagem string
}

func (e *ErroValidacao) Error() string {
    return fmt.Sprintf("validação falhou em %q: %s", e.Campo, e.Mensagem)
}

func validarIdade(i int) error {
    if i < 0 {
        return &ErroValidacao{Campo: "idade", Mensagem: "não pode ser negativa"}
    }
    if i > 130 {
        return &ErroValidacao{Campo: "idade", Mensagem: "valor irreal"}
    }
    return nil
}

func main() {
    if err := validarIdade(-3); err != nil {
        fmt.Println(err)
        // → validação falhou em "idade": não pode ser negativa
    }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "errors"
    "fmt"
)

// Erros sentinela: variáveis exportadas para comparação direta.
// Padrão usado por io.EOF, sql.ErrNoRows, etc.
var (
    ErrNaoEncontrado = errors.New("registro não encontrado")
    ErrSemPermissao  = errors.New("operação não permitida")
)

func buscarUsuario(id int) error {
    if id == 0 {
        return ErrSemPermissao
    }
    return ErrNaoEncontrado
}

func main() {
    err := buscarUsuario(42)

    // errors.Is percorre a cadeia comparando.
    if errors.Is(err, ErrNaoEncontrado) {
        fmt.Println("404 - dá uma resposta amigável")
    } else if errors.Is(err, ErrSemPermissao) {
        fmt.Println("403 - sem permissão")
    } else {
        fmt.Println("500 -", err)
    }
    // → saída: 404 - dá uma resposta amigável
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "errors"
    "fmt"
)

// Wrapping com %w mantém a cadeia: quem chama pode usar errors.Is/As.
type ErroBancoDados struct {
    Operacao string
    Causa    error
}

func (e *ErroBancoDados) Error() string {
    return fmt.Sprintf("banco: operação %s falhou: %v", e.Operacao, e.Causa)
}

// Implementar Unwrap permite que errors.Is/As mergulhem na causa.
func (e *ErroBancoDados) Unwrap() error { return e.Causa }

var ErrConexao = errors.New("conexão recusada")

func consultar() error {
    causaBaixoNivel := ErrConexao
    return &ErroBancoDados{Operacao: "SELECT", Causa: causaBaixoNivel}
}

func main() {
    err := consultar()
    fmt.Println(err)
    // → banco: operação SELECT falhou: conexão recusada

    if errors.Is(err, ErrConexao) {
        fmt.Println("retry: a causa raiz é problema de conexão")
    }

    var dbErr *ErroBancoDados
    if errors.As(err, &dbErr) {
        fmt.Println("operação afetada:", dbErr.Operacao)
        // → operação afetada: SELECT
    }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "errors"
    "fmt"
)

// Wrap idiomático com fmt.Errorf e %w.
// É o jeito mais comum de empilhar contexto sem criar struct nova.

var ErrSaldoInsuficiente = errors.New("saldo insuficiente")

type Conta struct {
    Titular string
    Saldo   float64
}

func (c *Conta) Sacar(valor float64) error {
    if valor > c.Saldo {
        return fmt.Errorf("conta %s: %w (tentou %.2f, tem %.2f)",
            c.Titular, ErrSaldoInsuficiente, valor, c.Saldo)
    }
    c.Saldo -= valor
    return nil
}

func main() {
    c := &Conta{Titular: "Ana", Saldo: 100}
    err := c.Sacar(500)
    fmt.Println(err)
    // → conta Ana: saldo insuficiente (tentou 500.00, tem 100.00)

    if errors.Is(err, ErrSaldoInsuficiente) {
        fmt.Println("UI: mostrar tela de recarga")
    }
}`,
      },
      {
        lang: "go",
        code: `package main

import (
    "errors"
    "fmt"
)

// errors.Join (Go 1.20+) junta múltiplos erros em um só.
// Útil em validações que querem reportar todos os problemas de uma vez.

func validar(nome string, idade int) error {
    var erros []error
    if nome == "" {
        erros = append(erros, errors.New("nome é obrigatório"))
    }
    if idade < 0 {
        erros = append(erros, errors.New("idade negativa"))
    }
    if idade > 130 {
        erros = append(erros, errors.New("idade absurda"))
    }
    return errors.Join(erros...) // devolve nil se erros estiver vazio
}

func main() {
    err := validar("", 200)
    if err != nil {
        fmt.Println(err)
        // → saída (uma por linha):
        // nome é obrigatório
        // idade absurda
    }
}`,
      },
    ],
    points: [
      "error é uma interface com um único método: Error() string.",
      "Erros customizados são structs que implementam Error() — carregam contexto rico.",
      "Erros sentinela (var ErrAlgo = errors.New(...)) são comparáveis com errors.Is.",
      "Idiomático: use fmt.Errorf com %w para empilhar contexto e manter a cadeia.",
      "errors.Is percorre a cadeia procurando um erro igual ao alvo.",
      "errors.As preenche um ponteiro com o erro do tipo concreto encontrado.",
      "errors.Join (Go 1.20+) combina vários erros em um só, ótimo para validações.",
      "Armadilha: comparar erros por string (err.Error() == 'foo') — quebra com qualquer mudança de mensagem.",
      "Erro comum: esquecer Unwrap() em erro customizado e errors.Is não conseguir navegar.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca compare erros por mensagem (string). Use errors.Is com sentinelas ou errors.As com tipos concretos. Mensagens podem mudar, ser traduzidas ou ganhar contexto, e seu código quebra silenciosamente.",
      },
      {
        type: "tip",
        content: "Sempre que envolver um erro vindo de outra camada, adicione contexto com fmt.Errorf usando %w. Você ajuda quem for diagnosticar o problema sem perder o erro original.",
      },
      {
        type: "info",
        content: "A partir de Go 1.20, errors.Join torna trivial reportar várias falhas de uma vez. Antes disso, projetos grandes usavam pacotes como hashicorp/go-multierror para o mesmo objetivo.",
      },
      {
        type: "success",
        content: "Erros como valores (em vez de exceções) parecem verbosos no início, mas geram código mais previsível. Você sempre vê onde algo pode falhar e decide explicitamente o que fazer. Não é menos elegante — é mais honesto.",
      },
    ],
  },
];
