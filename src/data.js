// ─── CONFIGURAÇÃO AMAZON ASSOCIATES ──────────────────────────────────────────
// Flag editorial para habilitar ou desabilitar temporariamente blocos e links de afiliados
export const ENABLE_AMAZON_WIDGETS = false;

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
    excerpt: 'Uma análise de como a vitória de Aníbal Barca e a sobrevivência de Cartago teriam gerado uma Europa mercantil sem o Direito Romano e sem o latim imperial.',
    category: 'História Alternativa',
    categorySlug: 'historia-alternativa',
    editorialType: 'especulacao',
    author: 'Lucas Matos',
    readingTime: '9 min',
    date: '14 de setembro',
    featured: true,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=85',
    sources: [
      'Políbio — Histórias (Livros I-III: A Ascensão de Roma e o Confronto Púnico)',
      'Tito Lívio — Ab Urbe Condita (História de Roma desde a sua Fundação)',
      'Adrian Goldsworthy — The Fall of Carthage: The Punic Wars 265–146 BC (Cassell Military Paperbacks)',
      'Mary Beard — SPQR: Uma História de Roma Antiga (Companhia das Letras)'
    ],
    disclaimer: 'Artigo de história contrafactual baseado em fatos reais sobre a Segunda Guerra Púnica, projetando consequências especulativas a partir de fontes arqueológicas e historiográficas.',
    amazonBooks: [
      {
        asin: '8532647952',
        title: 'A Queda de Cartago: As Guerras Púnicas 265-146 a.C.',
        author: 'Adrian Goldsworthy',
        price: 'R$ 79,90',
        description: 'O relato definitivo das Guerras Púnicas — da ascensão de Cartago ao triunfo final de Roma.'
      },
      {
        asin: '8535928308',
        title: 'SPQR: Uma História de Roma Antiga',
        author: 'Mary Beard',
        price: 'R$ 64,90',
        description: 'Como Roma se tornou Roma? A grande historiadora Mary Beard explora os fundamentos do poder romano.'
      }
    ],
    content: [
      'A história da civilização ocidental é frequentemente ensinada como uma marcha inevitável a partir do fórum de Roma. No entanto, no outono de 216 a.C., após o massacre de Canas — onde o general cartaginês Aníbal Barca aniquilou oito legiões romanas em uma única tarde —, a República de Roma esteve a poucas semanas do colapso militar absoluto.',
      'Roma sobreviveu graças à obstinação fanática de seu Senado e à estratégia de atrito de Fábio Máximo, culminando na vitória decisiva de Cipião Africano na [Batalha de Zama](https://pt.wikipedia.org/wiki/Batalha_de_Zama) em 202 a.C. Mas o que teria acontecido se a cavalaria númida de Aníbal tivesse prevalecido em Zama, forçando a destruição da hegemonia romana?',

      '## O Mundo Sem Império Centralizado: A Talassocracia Púnica',
      'Cartago não era uma potência territorial agrária militarista nos moldes de Roma; era uma **república mercantil fenícia** voltada para as rotas marítimas, o comércio de estanho, prata e especiarias e a manutenção de entrepostos costeiros.',
      'Se Cartago tivesse vencido:',
      'Não haveria uma conquista militar impiedosa do interior europeu. A Hispânia, a Gália e a Germânia teriam permanecido sob o controle de tribos celtas e germânicas soberanas, negociando vinho e metais com mercadores púnicos em feitorias litorâneas, mas preservando suas línguas e estruturas tribais nativas.',
      '> "O Mediterrâneo não teria sido o Mare Nostrum de uma única superpotência armada, mas uma vasta rede de cidades-estado mercantis em perpétuo equilíbrio diplomático."',

      '## O Fim do Latim e do Direito Romano',
      'Sem as legiões de César e sem a administração dos procônsules romanos:',
      'As línguas neolatinas — como o português, o espanhol, o francês e o italiano — jamais teriam nascido. A Europa Ocidental falaria dialetos celtas e germânicos entremeados por vocábulos da língua púnica semítica falada pelos mercadores fenícios.',
      'O **Direito Romano**, que forneceu a estrutura de códigos civis, direitos de propriedade e instituições jurídicas do Ocidente, seria substituído por um direito consuetudinário mercantil baseado em contratos comerciais e arbitragens marítimas corporativas.',

      '## O Destino das Religiões: O Cristianismo Teria Existido?',
      'O impacto mais profundo ocorreria na esfera espiritual. A rápida disseminação do cristianismo primitivo nos primeiros três séculos só foi viável graças à infraestrutura física e jurídica da *Pax Romana*: as estradas pavimentadas romanas, a segurança naval contra piratas no Mediterrâneo e a universalidade do grego koiné e do latim.',
      'Em um mundo fragmentado em reinos tribais e confederações costeiras púnicas voltadas ao culto de Ba\'al Hammon e Tanit, pequenas seitas monoteístas da Judeia teriam permanecido como fenômenos religiosos locais no Levante, sem canais de expansão universal para o coração da Europa.',

      '## Conclusão',
      'Imaginar a derrota de Roma é compreender que o Ocidente que conhecemos não foi o resultado de um destino superior dos deuses, mas o produto de uma série de decisões militares e contingências políticas nas planícies do Norte da África. Sem Roma, o mundo teria sido mais plural, descentralizado e mercantil — mas talvez menos coeso na memória de suas leis.'
    ]
  },
  {
    slug: 'bizancio-sobreviveu',
    title: 'O mapa que nunca foi desenhado: a sobrevivência bizantina e o novo equilíbrio global',
    excerpt: 'Como a Europa e o Oriente Médio teriam sido reorganizados se o Império Bizantino tivesse repelido o cerco de Maomé II em 1453 e resistido como potência intermediária.',
    category: 'Geopolítica Fictícia',
    categorySlug: 'geopolitica-ficticia',
    editorialType: 'geopolitica',
    author: 'Lucas Matos',
    readingTime: '9 min',
    date: '12 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Georgije Ostrogorski — História do Estado Bizantino (Fundações e Diplomacia Oriental)',
      'John Julius Norwich — A Short History of Byzantium (Penguin Books)',
      'Steven Runciman — The Fall of Constantinople 1453 (Cambridge University Press)',
      'Roger Crowley — 1453: A Queda de Constantinopla (L&PM Editores)'
    ],
    disclaimer: 'Simulação geopolítica hipotética analisando equilíbrios de poder territoriais entre potências europeias e orientais a partir do século XV.',
    amazonBooks: [
      {
        asin: '8535919082',
        title: '1453: A Queda de Constantinopla',
        author: 'Roger Crowley',
        price: 'R$ 59,90',
        description: 'A narrativa definitiva dos 53 dias que mudaram o mundo: o cerco otomano e o fim do Império Romano do Oriente.'
      },
      {
        asin: '8578278445',
        title: 'Bizâncio: Uma Biografia',
        author: 'Judith Herrin',
        price: 'R$ 74,90',
        description: 'O Império Bizantino foi muito mais do que a continuação de Roma.'
      }
    ],
    content: [
      'Na manhã de 29 de maio de 1453, após cinquenta e três dias de bombardeio pelos colossais canhões de bronze fundidos pelo húngaro Urbano, as tropas do sultão otomano Maomé II romperam a muralha teodosiana no setor do vale do Lico, matando em combate o último basileu romano, [Constantino XI Paleólogo](https://pt.wikipedia.org/wiki/Constantino_XI_Pale%C3%B3logo).',
      'A queda de Constantinopla marcou o fim formal de mais de 1.100 anos de história imperial cristã oriental e o encerramento simbólico da Idade Média. Mas o cerco foi decidido por margens operacionais mínimas: os defensores bizantinos e genoveses repeliram sucessivos assaltos de janízaros, e o próprio sultão esteve perto de ordenar a retirada naval diante das perdas financeiras e morais.',
      'E se uma tempestade naval no Mar de Mármara ou a chegada precoce de uma esquadra veneziana tivesse forçado o recuo otomano, garantindo a sobrevivência soberana de Bizâncio?',

      '## O Tampão Cristão Entre o Oriente e o Ocidente',
      'A existência contínua de um estado bizantino controlando os estreitos de Bósforo e Dardanelos mudaria o xadrez geopolítico da Europa Renascentista:',
      '1. **O Fim da Ameaça Otomana aos Bálcãs e a Viena:** Na história real, a conquista de Constantinopla serviu de trampolim logístico para o Império Otomano avançar sobre a Grécia, Sérvia, Hungria e sitiar os portões de Viena em 1529. Com a capital bizantina resistindo na retaguarda, as linhas de abastecimento otomanas estariam permanentemente ameaçadas;',
      '2. **O Renascimento da Diplomacia Ortodoxa:** Bizâncio sempre foi a mestre inigualável da espionagem, diplomacia de casamentos e subornos de ouro (a célebre *política bizantina*). O império atuaria como um amortecedor civilizacional entre o mundo islâmico e as monarquias católicas europeias.',
      '> "Constantinopla não era apenas uma fortaleza; era a ponte dourada do comércio da Rota da Seda. Mantê-la como uma cidade cristã independente teria transformado o Mediterrâneo Oriental em um lago de comércio compartilhado."',

      '## As Grandes Navegações Teriam Ocorrido?',
      'O desdobramento mais surpreendente dessa hipótese atinge a história de Portugal e da Espanha:',
      'Foi precisamente a asfixia das rotas terrestres de especiarias pelas pesadas taxas alfandegárias cobradas pelos otomanos que obrigou navegadores como Vasco da Gama e Cristóvão Colombo a buscarem rotas marítimas alternativas para as Índias contornando a África ou cruzando o Oceano Atlântico.',
      'Com portos bizantinos abertos e mercadores genoveses e venezianos importando pimenta, seda e noz-moscada com tarifas previsíveis no Corno de Ouro, a urgência econômica de financiar caravelas arriscadas rumo ao oceano desconhecido teria sido muito menor. A descoberta das Américas e o desembarque de Pedro Álvares Cabral no Brasil poderiam ter sido postergados por décadas.',

      '## Conclusão',
      'A sobrevivência de Bizâncio teria preservado um império onde o grego clássico, a arte sacra de mosaicos dourados e o direito justiniano continuariam vivos como uma terceira via entre o catolicismo romano e o Islã.',
      'Constantinopla não teria sido rebatizada como Istambul, mas permaneceria como a capital cosmopolita que por milênio uniu dois mundos sob a cúpula eterna de Santa Sofia.'
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
    readingTime: '9 min',
    date: '09 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Derek J. de Solla Price — Gears from the Greeks: The Antikythera Mechanism (Transactions of the American Philosophical Society, 1974)',
      'Nature — The Antikythera Mechanism Research Project: Decoding the Ancient Astronomical Calculator (Nature Vol. 444, 2006)',
      'Joseph Needham — Science and Civilisation in China, Volume 3: Mathematics and the Sciences of the Heavens and the Earth (Cambridge University Press)',
      'Jo Marchant — Decoding the Heavens: A 2,000-Year-Old Computer and the Century-Long Search to Discover Its Secrets (Da Capo Press)'
    ],
    disclaimer: 'Fato histórico e arqueológico rigorosamente documentado com base em análises tomográficas tridimensionais, testes de raios X industriais e catálogos de museus internacionais.',
    amazonBooks: [
      {
        asin: '8535929851',
        title: 'O Mecanismo de Anticítera',
        author: 'Jo Marchant',
        price: 'R$ 49,90',
        description: 'A investigação mais completa sobre o computador analógico mais antigo do mundo.'
      }
    ],
    content: [
      'A visão moderna da história humana tende a desenhar o progresso técnico como uma linha reta ininterrupta — uma marcha gradual que parte da rusticidade das ferramentas de pedra até a precisão dos semicondutores. No entanto, o registro arqueológico é salpicado de anomalias fascinantes: artefatos cuja concepção matemática e execução metalúrgica parecem ter surgido séculos, ou até milênios, antes de seu tempo concebível.',

      '## 1. O Mecanismo de Anticítera: O Computador de Bronze Grego',
      'Recuperado em 1901 por mergulhadores de esponjas nos destroços de um navio mercante romano afundado na costa da ilha grega de Anticítera, este fragmento corroído de bronze intrigou os pesquisadores por décadas. Tomografias tridimensionais de alta resolução realizadas nos anos 2000 revelaram um maquinismo composto por mais de **trinta engrenagens dentadas milimétricas** montadas em engastes diferenciais.',
      'Construído entre 150 e 100 a.C., o artefato calculava com perfeição a posição do Sol, as fases da Lua, os eclipses com ciclos saros e até a órbita irregular lunar através de um engenhoso sistema de pino e ranhura que compensava o movimento elíptico — um conceito que a matemática ocidental só redescobriria com Johannes Kepler.',

      '## 2. O Sismoscópio de Dragões de Zhang Heng (132 d.C.)',
      'Na China imperial da dinastia Han, o polímata Zhang Heng apresentou ao imperador o *Houfeng Didong Yi*, o primeiro instrumento do mundo para detecção remota de terremotos. Tratava-se de um vaso de bronze de quase dois metros de largura cercado por oito dragões com a cabeça voltada para baixo segurando esferas de metal nas presas.',
      'Quando um abalo sísmico ocorria a centenas de quilômetros de distância, ondas de choque imperceptíveis aos humanos na capital acionavam um pêndulo invertido interno, liberando a esfera do dragão voltado para a direção de onde vinha o tremor na boca de um sapo de bronze esculpido na base.',

      '## 3. Os Autômatos da Casa da Sabedoria de Bagdá',
      'No século IX, no apogeu da Idade de Ouro Islâmica, os três irmãos Banu Musa escreveram o *Kitab al-Hiyal* (O Livro dos Mecanismos Engenhosos). Entre dezenas de inventos, criaram o primeiro instrumento musical automatizado e programável: uma flauta acionada por pressão de vapor d\'água cujo repertório musical podia ser alterado por pinos inseridos em um cilindro giratório — o ancestral direto do rolo de pianola e dos computadores perfurados modernos.',

      '## 4. O Fogo Grego e os Lança-Chamas Bizantinos',
      'Desenvolvido pelo arquiteto sírio Calínico por volta de 678 d.C., o Fogo Grego salvou Constantinopla de dois cercos árabes devastadores. Tratava-se de um composto incendiário à base de petróleo, resina de pinho e enxofre pressurizado em sifões de bronze aquecidos a bordo de galés de guerra. A substância ardia vigorosamente em contato com a água do mar e não podia ser extinta por métodos convencionais, constituindo uma das primeiras armas químicas napalm da história.',

      '## O Que Essas Descobertas Nos Ensinam?',
      'Essas relíquias desafiam a nossa soberba contemporânea. Elas provam que a perda de conhecimento não é uma ficção distópica, mas um evento recorrente nas cinzas de civilizações colapsadas. A genialidade humana sempre floresceu quando estimulada pela observação rigorosa do cosmos e da matéria.'
    ]
  },
  {
    slug: 'cidades-abandonadas',
    title: 'Cidades fantasmas do mundo antigo: por que metrópoles inteiras sumiram?',
    excerpt: 'Da colossal cidade subterrânea para 20.000 pessoas na Capadócia às pirâmides esquecidas de Teotihuacan: o que acontece quando capitais florescentes são evacuadas sem deixar explicações?',
    category: 'Curiosidades Históricas',
    categorySlug: 'curiosidades-geradas',
    editorialType: 'fato',
    author: 'Lucas Matos',
    readingTime: '9 min',
    date: '04 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Roland Fletcher — Low-Density, Agrarian-Based Urbanism: A World Perspective (University of Sydney)',
      'Linda R. Manzanilla — Teotihuacan: Exceptional City of Mesoamerica (Center for Latin American Studies)',
      'Nevşehir Archaeology Museum — Underground Cities of Cappadocia: Derinkuyu Archaeological Survey',
      'Brian Fagan — The Great Warming: Climate Change and the Rise and Fall of Civilizations (Bloomsbury)'
    ],
    disclaimer: 'Fato histórico e pesquisa arqueológica documentada por levantamentos geológicos, escavações científicas e análises climáticas em sedimentos.',
    amazonBooks: [
      {
        asin: '8535909478',
        title: 'Cidades Perdidas da Antiguidade',
        author: 'Brian Fagan',
        price: 'R$ 67,90',
        description: 'Das ruínas de Petra às pirâmides de Teotihuacan: a arqueologia das grandes metrópoles que desapareceram.'
      }
    ],
    content: [
      'Quando caminhamos pelas avenidas de uma metrópole contemporânea, somos dominados pela sensação de solidez permanente. No entanto, a história da civilização é uma crônica de cidades que pareciam eternas e que, em questão de poucas décadas, transformaram-se em esqueletos de pedra silenciados pela poeira.',
      'O mistério mais inquietante não reside naquelas que foram arrasadas pelo fogo da guerra, mas nas que foram simplesmente abandonadas por suas populações sem sinais evidentes de violência externa.',

      '## Derinkuyu: A Metrópole Subterrânea da Capadócia',
      'Escavada no tufo vulcânico branda da atual Turquia central, [Derinkuyu](https://pt.wikipedia.org/wiki/Derinkuyu) desce a mais de 85 metros de profundidade ao longo de 18 andares subterrâneos interconectados. O complexo tinha capacidade para abrigar simultaneamente **20.000 pessoas** com seus rebanhos de gado.',
      'Possuía poços de ventilação verticais que supriam oxigênio aos níveis mais profundos, prensas de azeite, refeitórios, escolas monásticas e portas circulares de pedra de meia tonelada que só podiam ser trancadas pelo lado de dentro para resistir a exércitos invasores persas e árabes. Foi abandonada e esquecida até ser reencontrada acidentalmente em 1963 durante uma reforma doméstica.',

      '## Teotihuacan: A Cidade Onde os Homens Viravam Deuses',
      'No vale central do México, por volta do ano 400 d.C., erguia-se uma das maiores capitais do planeta: Teotihuacan, com mais de 125.000 habitantes, planejamento em grelha geométrica monumental e as gigantescas Pirâmides do Sol e da Lua.',
      'Por volta de 650 d.C., o centro cerimonial foi incendiado e a metrópole foi evacuada em massa. Quando os astecas a encontraram séculos mais tarde, não havia registros escritos de quem haviam sido seus reis ou que língua falavam, transformando o local em um santuário de mitos de criação.',

      '## A Grande Angkor e o Colapso da Engenharia Hídrica',
      'No Camboja, a capital do Império Khmer foi o maior aglomerado urbano pré-industrial do planeta, cobrindo mais de mil quilômetros quadrados. Seu funcionamento dependia de um maquinário hidráulico gigantesco de diques, canais e represas artificiais (*barays*).',
      'Análises de anéis de árvores comprovaram que décadas de megassecas no século XIV seguidas de monções diluvianas romperam a rede de canais. Sem conseguir consertar o assoreamento das represas, a corte imperial abandonou Angkor à floresta tropical.',

      '## A Vulnerabilidade Urbana',
      'Nenhum império é grande demais para sucumbir à quebra de seu equilíbrio ecológico ou hídrico. Essas cidades perdidas permanecem como monumentos solenes que lembram à nossa própria civilização que o concreto e o asfalto só duram enquanto houver água e estabilidade social para mantê-los de pé.'
    ]
  },
  {
    slug: 'reino-diario-secreto',
    title: 'O manuscrito proibido que desmanchou a reputação de um império',
    excerpt: 'Como a "História Secreta" de Procópio de Cesareia sobreviveu oculta por mais de mil anos nos arquivos do Vaticano para revelar os bastidores chocantes de Justiniano e Teodora.',
    category: 'Curiosidades Históricas',
    categorySlug: 'curiosidades-geradas',
    editorialType: 'fato',
    author: 'Lucas Matos',
    readingTime: '9 min',
    date: '01 de setembro',
    featured: false,
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
    sources: [
      'Procópio de Cesareia — Anekdota / História Secreta (Tradução e comentários de G. A. Williamson, Penguin Classics)',
      'Peter Brown — The World of Late Antiquity: AD 150–750 (W. W. Norton & Company)',
      'Anthony Kaldellis — Procopius of Caesarea: Tyranny, History, and Philosophy at the End of Antiquity (University of Pennsylvania Press)',
      'Peter Sarris — Justinian: Emperor, Soldier, Saint (Basic Books)'
    ],
    disclaimer: 'Análise documental sobre manuscritos bizantinos históricos preservados na Biblioteca Apostólica Vaticana e transcritos desde o Renascimento.',
    amazonBooks: [
      {
        asin: '8537815012',
        title: 'Justiniano: O Grande Imperador Bizantino',
        author: 'Peter Sarris',
        price: 'R$ 58,90',
        description: 'A vida e o reinado do imperador que tentou reunificar Roma — e os escândalos que Procópio registrou.'
      }
    ],
    content: [
      'No século VI da nossa era, o Império Romano do Oriente viveu o ápice de sua ambição sob o reinado de [Justiniano I](https://pt.wikipedia.org/wiki/Justiniano_I). Para consolidar seu legado de reconquista militar da Itália e do Norte da África e celebrar a construção da monumental basílica de Santa Sofia, o trono financiava as crônicas oficiais do mais brilhante historiador da época: **Procópio de Cesareia**.',
      'Em tratados públicos laudatórios amplamente distribuídos, como *As Guerras* e *Sobre as Construções*, Procópio retratou Justiniano como um líder piedoso, incansável e iluminado pela Providência divina. No entanto, por trás dessa fachada de mármore e ouro, Procópio redigia às escondidas o mais virulento libelo de denúncia da Antiguidade Tardia: o *Anekdota* (a "História Secreta").',

      '## O Terror e a Pena Escondida',
      'Procópio sabia com clareza absoluta que, se uma única página de seu manuscrito fosse encontrada pela guarda imperial dos excubitores, ele seria torturado e executado sumariamente sob a acusação de lesa-majestade. No documento secreto, o autor desnudou a voracidade fiscal do regime, os subornos institucionalizados na nomeação de juízes e a destruição de províncias inteiras por guerras ruinosas.',
      'O cronista foi além, acusando Justiniano de ser um governante demoníaco que vagava pelos corredores desertos do palácio imperial durante a madrugada sem cabeça visível — uma metáfora do medo e da loucura tirânica que assolavam a corte de Constantinopla.',

      '## Teodora: A Dançarina Que Virou Imperatriz',
      'As páginas mais venenosas do *Anekdota* foram dedicadas à imperatriz [Teodora](https://pt.wikipedia.org/wiki/Teodora_(esposa_de_Justiniano)). Procópio descreveu com detalhes escandalosos suas origens humildes como atriz circense no hipódromo e a acusou de chefiar uma rede implacável de calabouços e execuções secretas no palácio.',
      'Ainda assim, mesmo seu maior detrator não pôde apagar a coragem de ferro da imperatriz durante a **Revolta de Nika em 532 d.C.**, quando multidões ensanguentadas incendiavam a capital exigindo a deposição de Justiniano. Quando o imperador e seus conselheiros preparavam navios para fugir pelo mar, foi Teodora quem pronunciou as palavras que salvaram a dinastia: *"Para um imperador, a fuga é intolerável; e a púrpura imperial é a mais nobre das mortalhas."*',

      '## A Redescoberta Mil Anos Depois',
      'Concluído por volta de 550 d.C., o texto sobreviveu oculto por séculos nos cofres e bibliotecas secretas até ser redescoberto em 1623 pelo bibliotecário do Vaticano, Nicolò Alemanni. Sua publicação em Roma chocou a intelectualidade europeia, desmascarando a imagem imaculada do imperador cristão ideal.',

      '## O Valor Histórico do Manuscrito',
      'A sobrevivência da *História Secreta* é um dos maiores alertas da historiografia clássica: ela nos lembra que a verdade oficial gravada nos monumentos de pedra é quase sempre a versão encomendada pelo poder. Para entender o passado com honestidade, é preciso escutar não apenas as trombetas dos cortejos de vitória, mas também os sussurros dos homens que escreveram a verdade com medo e à luz de velas.'
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

// ─── LIVROS CURADOS DA AMAZON ASSOCIATES PARA ARTIGOS ────────────────────────
// Cada artigo possui recomendações de livros rigorosamente relevantes ao seu tema.
export const curatedAmazonBooks = {
  // 1. O Império de Obsidiana e Pólvora (Astecas repeliram os Espanhóis)
  '6cac4c2e-e107-44e3-badc-2494a99cc76c': [
    {
      asin: '8501111656',
      title: 'Armas, Germes e Aço: Os Destinos das Sociedades Humanas',
      author: 'Jared Diamond',
      price: 'R$ 74,90',
      description: 'O clássico vencedor do Prêmio Pulitzer que investiga como geografia, tecnologia e biologia determinaram o desfecho das civilizações e o choque entre conquistadores e povos originários.'
    },
    {
      asin: '8535921478',
      title: '1491: Novas Revelações das Américas Antes de Colombo',
      author: 'Charles C. Mann',
      price: 'R$ 69,90',
      description: 'Uma fascinante imersão arqueológica e historiográfica sobre as metrópoles monumentais, a engenharia e a grandiosidade das civilizações mesoamericanas antes da chegada europeia.'
    },
    {
      asin: '8533618824',
      title: 'A Conquista da América: A Questão do Outro',
      author: 'Tzvetan Todorov',
      price: 'R$ 56,90',
      description: 'Análise clássica e profunda sobre o confronto entre Hernán Cortés e Montezuma, o colapso de Tenochtitlán e as visões de mundo em rota de colisão.'
    }
  ],

  // 2. O Fogo que Atrasou a Humanidade (Biblioteca de Alexandria)
  '813fdec6-d047-4caf-b894-1e0911fb5f5b': [
    {
      asin: '8535929177',
      title: 'Cosmos',
      author: 'Carl Sagan',
      price: 'R$ 69,90',
      description: 'A obra-prima de Carl Sagan com capítulos inesquecíveis dedicados aos matemáticos e astrônomos da Biblioteca de Alexandria e à tragédia da perda do conhecimento milenar.'
    },
    {
      asin: '8551007802',
      title: 'O Infinito em um Junco: A Invenção dos Livros no Mundo Antigo',
      author: 'Irene Vallejo',
      price: 'R$ 64,90',
      description: 'A história aclamada mundialmente sobre a criação da Biblioteca de Alexandria, o fascínio pelos pergaminhos e a luta para preservar o saber contra o esquecimento.'
    },
    {
      asin: '852730623X',
      title: 'A Biblioteca de Alexandria: Centro de Aprendizado do Mundo Antigo',
      author: 'Roy MacLeod',
      price: 'R$ 59,90',
      description: 'Estudo acadêmico de ponta reunindo grandes historiadores sobre a ciência helenística, Herão, Eratóstenes e a verdadeira história do incêndio.'
    }
  ],

  // 3. O Super-Império Luso-Brasileiro (E se o 7 de Setembro nunca existisse?)
  '944356ff-7c91-4e69-b7fc-080b679c7e41': [
    {
      asin: '8525061604',
      title: '1822: Como um homem sábio, uma princesa triste e um escocês louco por dinheiro ajudaram D. Pedro a criar o Brasil',
      author: 'Laurentino Gomes',
      price: 'R$ 54,90',
      description: 'O best-seller definitivo sobre as tensões diplomáticas e militares entre Lisboa e o Rio de Janeiro e os bastidores que definiram a separação das coroas.'
    },
    {
      asin: '8577345831',
      title: 'D. Pedro: A História Não Contada',
      author: 'Paulo Rezzutti',
      price: 'R$ 58,90',
      description: 'A aclamada biografia de D. Pedro I com cartas e relatórios de época, mostrando o homem que esteve na encruzilhada de comandar um império transatlântico.'
    },
    {
      asin: '857475143X',
      title: 'O Império Tropical: A Corte no Rio de Janeiro',
      author: 'Kenneth Maxwell',
      price: 'R$ 49,90',
      description: 'Um estudo imperdível sobre como a vinda da corte de D. João VI em 1808 transformou o Brasil na sede do império marítimo português.'
    }
  ]
};

// Livros padrão por categoria para garantir que novos artigos submetidos também tenham recomendações
export const categoryAmazonBooks = {
  'historia-alternativa': [
    {
      asin: '8501111656',
      title: 'Armas, Germes e Aço: Os Destinos das Sociedades Humanas',
      author: 'Jared Diamond',
      price: 'R$ 74,90',
      description: 'Por que o mundo se desenvolveu de forma desigual? Uma leitura indispensável para entender os pontos de inflexão das civilizações.'
    },
    {
      asin: '8535928308',
      title: 'SPQR: Uma História de Roma Antiga',
      author: 'Mary Beard',
      price: 'R$ 64,90',
      description: 'A monumental narrativa da ascensão de Roma e das forças institucionais que moldaram o Ocidente.'
    }
  ],
  'curiosidades-geradas': [
    {
      asin: '8576160285',
      title: 'Colapso: Como as Sociedades Escolhem Fracassar ou Sobreviver',
      author: 'Jared Diamond',
      price: 'R$ 89,90',
      description: 'Uma análise profunda dos mistérios ecológicos e sociais que causaram o desaparecimento de metrópoles do passado.'
    },
    {
      asin: '8551007802',
      title: 'O Infinito em um Junco',
      author: 'Irene Vallejo',
      price: 'R$ 64,90',
      description: 'A fascinante aventura dos manuscritos proibidos, bibliotecas perdidas e invenções ancestrais.'
    }
  ],
  'geopolitica-ficticia': [
    {
      asin: '8535919082',
      title: '1453: A Queda de Constantinopla',
      author: 'Roger Crowley',
      price: 'R$ 59,90',
      description: 'A queda do Império Bizantino e o reordenamento geopolítico que abriu as rotas do mundo moderno.'
    },
    {
      asin: '8578278445',
      title: 'Bizâncio: Uma Biografia',
      author: 'Judith Herrin',
      price: 'R$ 74,90',
      description: 'Mil anos de diplomacia oriental, poder militar e sobrevivência em um mundo fragmentado.'
    }
  ]
};

// Retorna livros perfeitamente temáticos para qualquer artigo
export function getArticleAmazonBooks(article) {
  if (!article) return [];
  if (article.amazonBooks && Array.isArray(article.amazonBooks) && article.amazonBooks.length > 0) {
    return article.amazonBooks;
  }
  const id = article.id;
  if (id && curatedAmazonBooks[id]) {
    return curatedAmazonBooks[id];
  }
  const title = (article.title || '').toLowerCase();
  if (title.includes('asteca') || title.includes('obsidiana') || title.includes('montezuma') || title.includes('cortés') || title.includes('cortes')) {
    return curatedAmazonBooks['6cac4c2e-e107-44e3-badc-2494a99cc76c'];
  }
  if (title.includes('alexandria') || title.includes('biblioteca') || title.includes('papiro')) {
    return curatedAmazonBooks['813fdec6-d047-4caf-b894-1e0911fb5f5b'];
  }
  if (title.includes('luso-brasileiro') || title.includes('7 de setembro') || title.includes('setembro') || title.includes('ipiranga')) {
    return curatedAmazonBooks['944356ff-7c91-4e69-b7fc-080b679c7e41'];
  }
  const cat = article.categorySlug || article.category || 'historia-alternativa';
  return categoryAmazonBooks[cat] || categoryAmazonBooks['historia-alternativa'];
}


