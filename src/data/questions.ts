import type { ExamMeta, Question, StudentProfile } from "../types/question";

export const examMeta: ExamMeta = {
  title: "Simulado ENADE",
  course: "Sistemas de Computação",
  year: 2023,
  totalQuestions: 5,
  durationMinutes: 60,
};

export const student: StudentProfile = {
  name: "Ana Beatriz Moraes",
  registration: "2021.1.04512",
  initials: "AM",
  course: "Sistemas de Computação",
};

/**
 * Banco mockado de questões no padrão ENADE.
 * Cada item contém texto-base, comando, cinco alternativas,
 * índice da correta e resolução comentada.
 */
export const questions: readonly Question[] = [
  {
    id: "enade-2021-q12",
    year: 2021,
    subject: "Algoritmos e Estruturas de Dados",
    courseArea: "Sistemas de Computação",
    difficulty: "Média",
    statement: [
      "Um sistema de consulta precisa localizar registros em um vetor ordenado que armazena 1.048.576 chaves distintas. A equipe optou pela busca binária, que a cada passo compara a chave procurada com o elemento central da faixa de busca e descarta metade dos candidatos.",
      "Considere que o vetor esteja perfeitamente balanceado e que cada comparação tenha custo constante. Uma análise assintótica do algoritmo mostra que o número de comparações cresce de forma logarítmica em relação ao tamanho da entrada.",
    ],
    command:
      "Qual é o número máximo de comparações realizadas pela busca binária no pior caso para esse vetor?",
    alternatives: [
      { letter: "A", text: "20 comparações, pois 2²⁰ = 1.048.576." },
      { letter: "B", text: "1.048.576 comparações, pois o pior caso percorre todo o vetor." },
      { letter: "C", text: "10 comparações, pois o vetor é dividido em dez faixas fixas." },
      { letter: "D", text: "40 comparações, pois cada nível da árvore exige duas comparações." },
      { letter: "E", text: "524.288 comparações, pois apenas metade do vetor é examinada." },
    ],
    correctIndex: 0,
    explanation:
      "A busca binária reduz o espaço de busca à metade a cada comparação. O número máximo de comparações é ⌈log₂ n⌉. Como n = 2²⁰ = 1.048.576, o pior caso realiza 20 comparações — exatamente a altura da árvore de decisão balanceada que representa o algoritmo. A busca é O(log n), portanto nunca percorre o vetor inteiro (alternativa B) nem apenas metade de forma linear (alternativa E). As alternativas C e D apresentam valores arbitrários, sem relação com a base 2 da divisão sucessiva.",
  },
  {
    id: "enade-2019-q08",
    year: 2019,
    subject: "Banco de Dados",
    courseArea: "Sistemas de Computação",
    difficulty: "Média",
    statement: [
      "Uma instituição de ensino mantém a relação R(Matrícula, NomeAluno, CódDisciplina, NomeDisciplina, Nota), cuja chave primária é composta por (Matrícula, CódDisciplina). Ao auditar o esquema, o analista identificou as seguintes dependências funcionais:",
    ],
    supportBlock: {
      title: "Dependências funcionais identificadas",
      language: "Texto",
      content: `Matrícula, CódDisciplina  →  Nota
Matrícula                  →  NomeAluno
CódDisciplina              →  NomeDisciplina`,
    },
    command:
      "A relação R, no estado atual, viola qual forma normal e qual é a decomposição que a corrige?",
    alternatives: [
      {
        letter: "A",
        text: "Viola a 1FN, pois há atributos multivalorados; a correção exige uma tabela separada para as notas.",
      },
      {
        letter: "B",
        text: "Viola a 2FN apenas, pois NomeAluno e NomeDisciplina dependem de parte da chave; a decomposição em três relações elimina o problema.",
      },
      {
        letter: "C",
        text: "Viola a 3FN, pois NomeDisciplina depende transitivamente de CódDisciplina; a correção é separar Disciplina(CódDisciplina, NomeDisciplina) de Aluno(Matrícula, NomeAluno) e manter Nota(Matrícula, CódDisciplina, Nota).",
      },
      {
        letter: "D",
        text: "Não viola forma normal alguma, pois toda relação com chave composta está automaticamente na 3FN.",
      },
      {
        letter: "E",
        text: "Viola a BCNF, mas nenhuma decomposição é possível sem perda de informação, logo o esquema deve ser mantido.",
      },
    ],
    correctIndex: 2,
    explanation:
      "A relação já está na 1FN (atributos atômicos) e na 2FN, pois Nota depende da chave completa (Matrícula, CódDisciplina). O problema está na 3FN: NomeDisciplina depende de CódDisciplina, que não é chave, caracterizando uma dependência transitiva (CódDisciplina → NomeDisciplina). A decomposição em Aluno(Matrícula, NomeAluno), Disciplina(CódDisciplina, NomeDisciplina) e Nota(Matrícula, CódDisciplina, Nota) elimina a redundância e as anomalias de inserção, atualização e exclusão sem perda de informação. A alternativa B ignora a dependência transitiva, e a D é falsa: chave composta não garante 3FN.",
  },
  {
    id: "enade-2022-q21",
    year: 2022,
    subject: "Redes de Computadores",
    courseArea: "Sistemas de Computação",
    difficulty: "Difícil",
    statement: [
      "Em uma conexão TCP estabelecida entre dois hospitais, o congestion window (cwnd) inicia em 1 MSS e opera em slow start. Suponha que não haja perda de pacotes, que o receptor não limite a janela e que cada RTT complete a transmissão e o reconhecimento dos segmentos enviados.",
      "O mecanismo de slow start dobra o valor de cwnd a cada RTT até que seja atingido o limiar de slow start (ssthresh).",
    ],
    command:
      "Após 4 RTTs completos a partir do início da conexão, qual é o tamanho da janela de congestionamento em MSS?",
    alternatives: [
      { letter: "A", text: "8 MSS" },
      { letter: "B", text: "16 MSS" },
      { letter: "C", text: "4 MSS" },
      { letter: "D", text: "32 MSS" },
      { letter: "E", text: "9 MSS" },
    ],
    correctIndex: 1,
    explanation:
      "No slow start, cwnd dobra a cada RTT: 1 MSS (início) → 2 MSS (1 RTT) → 4 MSS (2 RTTs) → 8 MSS (3 RTTs) → 16 MSS (4 RTTs). O valor cresce exponencialmente, e não de forma linear (8 MSS corresponderia a três RTTs). A alternativa D (32 MSS) só seria atingida após 5 RTTs, e a E confunde o crescimento exponencial com uma soma linear.",
  },
  {
    id: "enade-2017-q15",
    year: 2017,
    subject: "Engenharia de Software",
    courseArea: "Sistemas de Computação",
    difficulty: "Fácil",
    statement: [
      "Uma equipe de desenvolvimento de um sistema de vendas possui um método que calcula o valor final de um pedido e hoje contém uma cadeia de condicionais que cresce a cada nova regra de desconto: desconto para clientes premium, cupom promocional, frete gratuito por região e, recentemente, desconto progressivo por volume.",
      "Cada alteração obriga a reabrir e retestar o método original, o que tem gerado regressões frequentes. A equipe busca um padrão que permita encapsular cada regra em uma classe própria, trocável em tempo de execução, sem alterar o contexto que as utiliza.",
    ],
    command: "O padrão de projeto mais adequado para resolver esse problema é o",
    alternatives: [
      { letter: "A", text: "Singleton, que garante uma única instância da calculadora de descontos." },
      { letter: "B", text: "Factory Method, que centraliza a criação dos objetos de pedido." },
      { letter: "C", text: "Strategy, que encapsula cada algoritmo de desconto em uma classe e permite alterná-los em tempo de execução." },
      { letter: "D", text: "Observer, que notifica os módulos interessados quando o valor do pedido muda." },
      { letter: "E", text: "Decorator, que adiciona responsabilidades a um objeto por meio de herança múltipla." },
    ],
    correctIndex: 2,
    explanation:
      "O Strategy encapsula uma família de algoritmos intercambiáveis (cada regra de desconto em sua própria classe) e permite selecioná-los em tempo de execução, eliminando a cadeia de condicionais e favorecendo o princípio Aberto/Fechado: novas regras entram sem modificar o contexto. Singleton trata de instância única, não de variação de algoritmo; Factory Method trata de criação; Observer trata de notificação de eventos; e Decorator compõe comportamentos por delegação — não por herança múltipla, como afirma (incorretamente) a alternativa E.",
  },
  {
    id: "enade-2023-q09",
    year: 2023,
    subject: "Arquitetura de Computadores",
    courseArea: "Sistemas de Computação",
    difficulty: "Média",
    statement: [
      "Um processador possui uma cache L1 com tempo de acerto (hit time) de 1 ns e taxa de acerto de 95%. Em caso de falta, a penalidade média para buscar o bloco na memória principal é de 40 ns, e a cache é acessada antes de qualquer outro nível da hierarquia.",
    ],
    command:
      "Qual é o tempo médio de acesso à memória (AMAT) dessa configuração?",
    alternatives: [
      { letter: "A", text: "3,0 ns" },
      { letter: "B", text: "2,0 ns" },
      { letter: "C", text: "2,9 ns" },
      { letter: "D", text: "41,0 ns" },
      { letter: "E", text: "1,05 ns" },
    ],
    correctIndex: 0,
    explanation:
      "O tempo médio de acesso é AMAT = hit time + (taxa de falta × penalidade). Com 5% de faltas, AMAT = 1 ns + (0,05 × 40 ns) = 1 + 2 = 3,0 ns. A alternativa B consideraria 2,5% de faltas; a E somaria a penalidade sem ponderar pela taxa de falta; a C confunde o cálculo. A D corresponde ao pior caso (todos os acessos com falta), não à média.",
  },
];
