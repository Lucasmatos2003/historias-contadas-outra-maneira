// ─── CONFIGURAÇÃO AMAZON ASSOCIATES ──────────────────────────────────────────
// Substitua 'SEU-TAG-20' pelo seu affiliate tag quando tiver sua conta aprovada.
// Ex: 'historiascontadas-20'
// Cadastre-se gratuitamente em: https://affiliate-program.amazon.com.br/
export const AMAZON_TAG = 'historiasco0b-20';

// Função utilitária para gerar link de afiliado
export const amazonLink = (asin) =>
  `https://www.amazon.com.br/dp/${asin}?tag=${AMAZON_TAG}&linkCode=as2`;

// ─────────────────────────────────────────────────────────────────────────────

export const articles = [
  {
    slug: 'roma-que-nao-foi',
    title: 'Se Roma tivesse perdido a guerra de Cartago, como o mundo seria hoje?',
    excerpt: 'Uma análise do que muda quando o curso da história toma um rumo inesperado — e como pequenos desvios redefinem impérios e religiões.',
    category: 'História Alternativa',
    categorySlug: 'historia-alternativa',
    editorialType: 'especulacao',
    author: 'Equipe Revista Digital',
    readingTime: '14 min',
    date: '14 de setembro',
    featured: true,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=85',
    sources: [
      'Políbio — Histórias (Livros I-III: A Ascensão de Roma e o Confronto Púnico)',
      'Tito Lívio — Ab Urbe Condita (História de Roma desde a sua Fundação)',
      'Adrian Goldsworthy — The Fall of Carthage: The Punic Wars 265–146 BC (Cassell Military Paperbacks)'
    ],
    disclaimer: 'Artigo de história contrafactual baseado em fatos reais sobre a Segunda Guerra Púnica, projetando consequências especulativas a partir de fontes arqueológicas e historiográficas.',
    amazonBooks: [
      {
        asin: '8532647952',
        title: 'A Queda de Cartago: As Guerras Púnicas 265-146 a.C.',
        author: 'Adrian Goldsworthy',
        price: 'R$ 79,90',
        description: 'O relato definitivo das Guerras Púnicas — da ascensão de Cartago ao triunfo final de Roma. Obra de referência para entender o que estava em jogo.'
      },
      {
        asin: '8535928308',
        title: 'SPQR: Uma História de Roma Antiga',
        author: 'Mary Beard',
        price: 'R$ 64,90',
        description: 'Como Roma se tornou Roma? A grande historiadora Mary Beard explora os fundamentos do poder romano — e o que teria sido diferente se ele não tivesse prevalecido.'
      },
      {
        asin: '8537810258',
        title: 'Aníbal: O Inimigo de Roma',
        author: 'John Prevas',
        price: 'R$ 54,90',
        description: 'A história do general que quase destruiu Roma. Uma biografia fascinante do estrategista que atravessou os Alpes com elefantes e venceu batalhas impossíveis.'
      }
    ],
    content: [
      'A história romana é frequentemente narrada como uma escalada irresistível para o domínio. Mas e se a derrota em Cartago tivesse sido o ponto de inflexão que separou a potência imperial de um futuro de rivalidades fragmentadas?',
      'A resposta não está apenas em mapas. Está na forma como cidades, comércio e religião se reorganizam quando uma superpotência não consegue manter a sua coerência.',
      'Uma civilização menos centralizada teria passado a depender mais de alianças, rotas comerciais complexas e mecanismos locais de poder.',
      'O aspecto mais fascinante é perceber que a história não é uma linha única, mas um conjunto de possibilidades que se cruzam em momentos delicados.'
    ]
  },
  {
    slug: 'mapa-nao-desenhado',
    title: 'O mapa que nunca foi desenhado: a sobrevivência bizantina e o novo equilíbrio global',
    excerpt: 'Como a Europa e o Oriente Médio teriam sido reorganizados se o Império Bizantino tivesse resistido como potência intermediária.',
    category: 'Geopolítica Fictícia',
    categorySlug: 'geopolitica-ficticia',
    editorialType: 'geopolitica',
    author: 'Equipe Revista Digital',
    readingTime: '6 min',
    date: '12 de setembro',
    image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Georgije Ostrogorski — História do Estado Bizantino (Fundações e Diplomacia Oriental)',
      'John Julius Norwich — A Short History of Byzantium (Penguin Books)',
      'Steven Runciman — The Fall of Constantinople 1453 (Cambridge University Press)'
    ],
    disclaimer: 'Simulação geopolítica hipotética analisando equilíbrios de poder territoriais entre potências europeias e orientais a partir do século XV.',
    amazonBooks: [
      {
        asin: '8535919082',
        title: '1453: A Queda de Constantinopla',
        author: 'Roger Crowley',
        price: 'R$ 59,90',
        description: 'A narrativa definitiva dos 53 dias que mudaram o mundo: o cerco otomano e o fim do Império Romano do Oriente. Um livro de história que se lê como um thriller.'
      },
      {
        asin: '8578278445',
        title: 'Bizâncio: Uma Biografia',
        author: 'Judith Herrin',
        price: 'R$ 74,90',
        description: 'O Império Bizantino foi muito mais do que a continuação de Roma. Uma das maiores especialistas mundiais desvela mil anos de civilização, poder e cultura.'
      }
    ],
    content: [
      'O Império Bizantino também poderia ser entendido como um mundo próprio, em diálogo constante com Oriente e Ocidente.',
      'Se a sua continuidade territorial tivesse sido mais sólida, a Europa talvez teria absorvido mais influências orientais em linguagem, arquitetura e administração naval.',
      'Tudo muda quando a formação de um poder central intermediário não se interrompe abruptamente: o Mediterrâneo Oriental se transformaria em uma confederação comercial estável.',
      'A rota das Índias e o início das Grandes Navegações teriam seguido dinâmicas inteiramente distintas, redefinindo as fronteiras e alianças de potências ibéricas e do norte europeu.'
    ]
  },
  {
    slug: 'objetos-estranhos-mundo-antigo',
    title: 'Os 5 enigmas mecânicos mais surpreendentes da antiguidade',
    excerpt: 'De computadores astronômicos com engrenagens milimétricas a sismógrafos que previam tremores a centenas de quilômetros: tecnologias ancestrais que desafiam o que sabemos sobre o passado.',
    category: 'Curiosidades Históricas',
    categorySlug: 'curiosidades-geradas',
    editorialType: 'fato',
    author: 'Equipe Revista Digital',
    readingTime: '7 min',
    date: '09 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Derek J. de Solla Price — Gears from the Greeks: The Antikythera Mechanism (Transactions of the American Philosophical Society, 1974)',
      'Nature — The Antikythera Mechanism Research Project: Decoding the Ancient Astronomical Calculator (Nature Vol. 444, 2006)',
      'Joseph Needham — Science and Civilisation in China, Volume 3: Mathematics and the Sciences of the Heavens and the Earth (Cambridge University Press)'
    ],
    disclaimer: 'Fato histórico e arqueológico rigorosamente documentado com base em análises tomográficas e catálogos de museus internacionais.',
    amazonBooks: [
      {
        asin: '8535929851',
        title: 'O Mecanismo de Anticítera',
        author: 'Jo Marchant',
        price: 'R$ 49,90',
        description: 'A investigação jornalística mais completa sobre o computador analógico mais antigo do mundo. Ciência, mistério e arqueologia marinha em um único volume.'
      },
      {
        asin: '8576573083',
        title: 'Tecnologias Perdidas da Antiguidade',
        author: 'Jason Colavito',
        price: 'R$ 44,90',
        description: 'Das catapultas gregas ao fogo grego: as engenhocas e invenções da antiguidade que surpreenderam o mundo moderno. Arqueologia técnica acessível e fascinante.'
      },
      {
        asin: '8588478323',
        title: 'Engenheiros do Mundo Antigo',
        author: 'John Freely',
        price: 'R$ 52,90',
        description: 'Da roda ao aqueduto romano, das engrenagens de bronze às máquinas de guerra: a história dos inventores que construíram o mundo antigo.'
      }
    ],
    content: [
      'A visão moderna da história humana tende a desenhar o progresso técnico como uma linha reta ininterrupta — uma marcha gradual que parte da rusticidade das ferramentas de pedra até a precisão dos semicondutores. No entanto, o registro arqueológico é salpicado de anomalias fascinantes: artefatos cuja concepção matemática e execução metalúrgica parecem ter surgido séculos, ou até milênios, antes de seu tempo concebível.',
      'O exemplo mais célebre dessa engenhosidade é o Mecanismo de Anticítera, recuperado em 1901 de um galeão naufragado no mar Egeu. Datado entre 150 e 100 a.C., esse fragmento corroído de bronze continha pelo menos 30 engrenagens minuciosamente talhadas, configuradas em um sistema de diferencial mecânico. O dispositivo não apenas previa eclipses solares e lunares com precisão cronométrica, mas também reproduzia a órbita irregular da Lua — utilizando um mecanismo de pino e ranhura que compensava o movimento elíptico séculos antes das leis de Kepler.',
      'Do outro lado do mundo, no ano 132 d.C., o polímata chinês Zhang Heng apresentou à corte imperial Han o Houfeng Didong Yi, o primeiro sismoscópio documentado da história. Tratava-se de uma colossal ânfora de bronze com oito dragões voltados para os pontos cardeais, cada um segurando uma esfera de bronze na mandíbula. Quando um terremoto ocorria a centenas de quilômetros de distância, ondas sísmicas imperceptíveis na capital faziam oscilar um pêndulo interno de inércia, disparando uma alavanca que liberava a esfera correspondente direto na boca de um sapo de bronze abaixo, indicando prontamente a direção do desastre.',
      'Na Constantinopla do século VII e na Bagdá do século IX, essa sofisticação atingiu novos extremos. Enquanto os irmãos Banu Musa projetavam autômatos mecânicos programáveis e flautas acionadas a vapor na Casa da Sabedoria, a marinha bizantina protegia sua capital com o Fogo Grego — uma mistura química pressurizada e inflamável capaz de arder sobre as ondas do mar, disparada por tubos de bronze com bombas térmicas cuja composição exata foi guardada com tanto zelo militar que seu segredo morreu com o império.',
      'Essas relíquias desafiam a nossa soberba contemporânea. Elas provam que a perda de conhecimento não é uma ficção distópica, mas um evento recorrente nas cinzas de civilizações colapsadas. A pergunta que ecoa para os leitores de história alternativa é inevitável: como seria o nosso presente se as engrenagens de bronze de Anticítera tivessem gerado uma revolução industrial dois mil anos antes da Inglaterra vitoriana?'
    ]
  },
  {
    slug: 'cidades-abandonadas',
    title: 'Cidades fantasmas do mundo antigo: por que metrópoles inteiras sumiram?',
    excerpt: 'Da colossal cidade subterrânea para 20.000 pessoas na Capadócia às pirâmides esquecidas de Teotihuacan: o que acontece quando capitais florescentes são evacuadas sem deixar explicações?',
    category: 'Curiosidades Históricas',
    categorySlug: 'curiosidades-geradas',
    editorialType: 'fato',
    author: 'Equipe Revista Digital',
    readingTime: '8 min',
    date: '04 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Roland Fletcher — Low-Density, Agrarian-Based Urbanism: A World Perspective (Angkor Research Program, University of Sydney)',
      'Linda R. Manzanilla — Teotihuacan: Exceptional City of Mesoamerica (Center for Latin American Studies)',
      'Nevşehir Archaeology Museum — Underground Cities of Cappadocia: Derinkuyu and Kaymakli Archaeological Survey'
    ],
    disclaimer: 'Fato histórico e pesquisa arqueológica documentada por levantamentos geológicos e escavações científicas.',
    amazonBooks: [
      {
        asin: '8535909478',
        title: 'Cidades Perdidas da Antiguidade',
        author: 'Brian Fagan',
        price: 'R$ 67,90',
        description: 'Das ruínas de Petra às pirâmides de Teotihuacan: a arqueologia das grandes metrópoles que desapareceram e o que elas revelam sobre o colapso das civilizações.'
      },
      {
        asin: '8576160285',
        title: 'Colapso: Como as Sociedades Escolhem Fracassar ou Sobreviver',
        author: 'Jared Diamond',
        price: 'R$ 89,90',
        description: 'Por que algumas civilizações colapsam enquanto outras prosperam? Jared Diamond analisa os fatores ambientais, climáticos e sociais por trás do fim dos grandes impérios.'
      }
    ],
    content: [
      'Quando caminhamos pelas avenidas de uma metrópole contemporânea, somos dominados pela sensação de solidez permanente. No entanto, a história da civilização é uma crônica de cidades que pareciam eternas e que, em questão de poucas décadas, transformaram-se em esqueletos de pedra silenciados pela poeira. O mistério mais inquietante não reside naquelas que foram arrasadas pelo fogo da guerra, mas nas que foram simplesmente abandonadas por suas populações sem sinais evidentes de violência.',
      'Sob as colinas escarpadas da Capadócia, na atual Turquia, repousa Derinkuyu — uma obra de engenharia de tirar o fôlego. Escavada na rocha vulcânica branda a mais de 85 metros de profundidade, esta cidade subterrânea estende-se por 18 níveis interconectados. Capaz de abrigar confortavelmente até 20.000 pessoas junto de seu gado, o complexo possuía poços de ventilação verticais que supriam ar puro até os pisos inferiores, prensas de vinho e azeite, refeitórios coletivos, poços artesianos e escolas. Para repelir exércitos invasores, cada nível era selado por pedras circulares de meia tonelada que só podiam ser roladas pelo lado de dentro, transformando o subsolo em uma fortaleza impenetrável que mais tarde foi esquecida por séculos até ser redescoberta por acaso em 1963.',
      'No continente americano, Teotihuacan representa um enigma ainda mais perturbador. Por volta do ano 400 d.C., esta metrópole no vale do México contava com cerca de 125.000 habitantes, planejamento urbano em grade milimétrica e monumentos colossais como as Pirâmides do Sol e da Lua. Apesar de sua magnitude incomparável na Mesoamérica, no século VIII a cidade foi evacuada quase por completo. Quando os astecas encontraram o local séculos depois e o batizaram de "o lugar onde os homens se tornam deuses", não encontraram memoriais dinásticos nem registros textuais que explicassem quem construiu aquela maravilha ou por que todos partiram.',
      'Mais ao leste, no Império Khmer, a Grande Angkor desvendou recentemente o papel devastador da ecologia. Com mais de mil quilômetros quadrados, Angkor foi o maior complexo urbano pré-industrial da Terra, alimentado por um monumental maquinário hidráulico de canais, diques e imensos reservatórios artificiais (barays). Análises climáticas em anéis de árvores comprovaram que décadas de secas severas seguidas de monções torrenciais no século XIV arrebentaram as comportas de drenagem. Sem água para as lavouras e incapazes de conter o assoreamento, a corte e a população viram-se forçadas a evacuar seus palácios monumentais para a selva.',
      'O abandono dessas grandes metrópoles nos ensina uma lição fundamental sobre a fragilidade humana. Nenhum império é grande demais para sucumbir à escassez hídrica, à quebra do equilíbrio ambiental ou à desintegração de seus sistemas de suporte. As cidades fantasmas do passado não são apenas relíquias arqueológicas; são espelhos premonitórios das vulnerabilidades que cercam o mundo urbano moderno.'
    ]
  },
  {
    slug: 'reino-diario-secreto',
    title: 'O manuscrito proibido que desmanchou a reputação de um império',
    excerpt: 'Como a "História Secreta" de Procópio de Cesareia sobreviveu oculta por mais de mil anos nos arquivos do Vaticano para revelar os bastidores chocantes de Justiniano e Teodora.',
    category: 'Curiosidades Históricas',
    categorySlug: 'curiosidades-geradas',
    editorialType: 'fato',
    author: 'Equipe Revista Digital',
    readingTime: '6 min',
    date: '01 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Procópio de Cesareia — Anekdota / História Secreta (Tradução e comentários de G. A. Williamson, Penguin Classics)',
      'Peter Brown — The World of Late Antiquity: AD 150–750 (W. W. Norton & Company)',
      'Anthony Kaldellis — Procopius of Caesarea: Tyranny, History, and Philosophy at the End of Antiquity (University of Pennsylvania Press)'
    ],
    disclaimer: 'Análise documental sobre manuscritos bizantinos históricos preservados na Biblioteca Apostólica Vaticana.',
    amazonBooks: [
      {
        asin: '8537815012',
        title: 'Justiniano: O Grande Imperador Bizantino',
        author: 'Peter Sarris',
        price: 'R$ 58,90',
        description: 'A vida e o reinado do imperador que tentou reunificar Roma — e os escândalos de bastidores que Procópio registrou em segredo. O contexto real da História Secreta.'
      },
      {
        asin: '8535931856',
        title: 'A Idade de Ouro de Bizâncio',
        author: 'John Julius Norwich',
        price: 'R$ 72,90',
        description: 'O período Justiniano visto por um dos maiores historiadores populares da era. Teodora, Belisário e os intrigantes de palácio que definiram um império.'
      }
    ],
    content: [
      'No século VI da nossa era, o Império Bizantino viveu o ápice de sua ambição sob o reinado de Justiniano I. Para consolidar seu legado de reconquista territorial e a ereção da deslumbrante basílica de Santa Sofia, o trono financiava as obras do mais refinado historiador da época: Procópio de Cesareia. Em tratados públicos amplamente distribuídos, como "As Guerras" e "Sobre as Construções", Procópio descrevia o imperador como um soberano magnânimo, incansável e guiado pela virtude cristã.',
      'No entanto, por trás dessa fachada de reverência e mármore, Procópio redigia às escondidas o mais virulento documento de traição literária do mundo antigo: o Anekdota, conhecido hoje como a "História Secreta". Ciente de que qualquer página descoberta pelos guardas significaria tortura e execução sumária, o autor anotava à luz de velas os bastidores inconfessáveis da corte: extorsões fiscais generalizadas, subornos sistemáticos e o relato de que Justiniano era, em suas palavras, um governante demoníaco e tirânico.',
      'O texto não poupou a imperatriz Teodora, uma das figuras femininas mais poderosas e enigmáticas da Idade Média. Procópio pintou um retrato impiedoso de sua ascensão, desde suas origens humildes como dançarina circense nos teatros de Constantinopla até seu papel à frente de uma implacável rede de espiões e calabouços no palácio imperial. Ainda assim, mesmo o cronista mais amargo não pôde apagar a coragem férrea da imperatriz durante a Revolta de Nika em 532 d.C., quando ela impediu a abdicação do imperador ao proclamar que a púrpura imperial era a mais nobre das mortalhas.',
      'Concluído por volta do ano 550 d.C., o manuscrito permaneceu guardado em sigilo absoluto por décadas e depois por séculos, protegido pelo medo e pela censura das autoridades bizantinas. Somente em 1623 — mais de mil anos após a morte de Procópio — o prefeito da Biblioteca Vaticana, Nicolò Alemanni, encontrou uma cópia esquecida nos arquivos secretos e decidiu publicá-la em Roma, desferindo um choque devastador na imagem romântica do Império Romano do Oriente.',
      'A sobrevivência da "História Secreta" é uma das maiores curiosidades do mundo historiográfico: ela nos lembra que a versão oficial dos vencedores é quase sempre uma encenação cuidadosamente polida. Basta que uma única testemunha tenha a coragem de enterrar suas anotações no escuro para que, séculos mais tarde, a verdade dos bastidores emerja para recontar toda a história de outra maneira.'
    ]
  }
];

export const categoryInfo = {
  'historia-alternativa': {
    name: 'História Alternativa',
    badge: 'Hipótese Especulativa',
    description: 'E se os grandes eventos tivessem tomado outro rumo? Linhas do tempo divergentes, pontos de inflexão e cenários contrafactuais bem fundamentados.'
  },
  'curiosidades-geradas': {
    name: 'Curiosidades Históricas',
    badge: 'Fato Histórico Documentado',
    description: 'Enigmas arqueológicos, manuscritos esquecidos, invenções pioneiras e anomalias fascinantes que desafiam a narrativa convencional.'
  },
  'geopolitica-ficticia': {
    name: 'Geopolítica Fictícia',
    badge: 'Simulação Geopolítica',
    description: 'Redivisões de fronteiras, novos blocos de poder e o redesenho do equilíbrio mundial caso impérios tivessem resistido ou sucumbido.'
  }
};

