// Textos legales y de donaciones en portugués de Brasil: traducción de ./es.mjs, con la misma
// estructura. Las tres páginas legales avisan de que en caso de discrepancia manda el original.
// Los nombres de botones y secciones citados son los de src/i18n/pt.ts.

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'aviso-legal', privacidad: 'privacidade', cookies: 'cookies', donar: 'doar' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Última revisão: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">configuração de cookies</a>`;

  const titularBlock = () => `    <ul>
        <li><strong>Titular:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF:</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Domicílio:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>E-mail:</strong> ${email()}</li>
        <li><strong>Site:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;

  const traduccion = (id, titulo) =>
    `    <p><em>Esta é uma tradução a título informativo. Em caso de divergência, prevalece a versão original em espanhol: <a href="${original(id)}" hreflang="es" lang="es">${titulo}</a>.</em></p>`;

  return [
    {
      id: 'aviso',
      title: 'Aviso legal · Study World Map',
      description: 'Dados do titular, condições de uso e propriedade intelectual do Study World Map.',
      body: `    <h1>Aviso legal</h1>
${traduccion('aviso', 'Aviso legal')}
    <h2>Titular do site</h2>
    <p>Em cumprimento do artigo 10 da Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE, a lei espanhola de serviços da sociedade da informação e de comércio eletrônico), estes são os dados do titular:</p>
${titularBlock()}

    <h2>Objeto</h2>
    <p>O Study World Map é um projeto educativo pessoal: um atlas interativo para estudar geografia jogando. Ensina os países do mundo, seus continentes, suas capitais e suas bandeiras; as províncias, os estados ou as regiões de mais de trinta países; a geografia física, os climas e a população; o interior da Terra e as camadas da atmosfera; e, ao vivo, o dia e a noite, o tempo e os satélites. É gratuito, não tem publicidade, não vende nada e não exige cadastro. É mantido com o tempo do seu autor e com as <a href="${ruta('donar')}">doações voluntárias</a> de quem quiser apoiá-lo.</p>

    <h2>Condições de uso</h2>
    <p>O uso do site é livre e gratuito. Ao usá-lo, você se compromete a fazê-lo de forma lícita, sem danificar o site nem impedir que outras pessoas o usem. Você pode compartilhar os links e as listas de estudo com quem quiser, por exemplo com a sua turma.</p>

    <h2>Exatidão dos conteúdos</h2>
    <p>Os dados geográficos têm fins educativos e são revisados com cuidado, mas podem conter erros ou ficar desatualizados. As fronteiras vêm do Natural Earth e algumas decisões (por exemplo, quais territórios são contados como países) são explicadas no próprio aplicativo; não expressam nenhuma posição política. Se você encontrar um erro, escreva para ${email()} e nós o corrigiremos.</p>

    <h2>Propriedade intelectual</h2>
    <p>O design, o código e os textos do Study World Map são obra do seu titular e, se for o caso, das pessoas que contribuem com o projeto, que publicam suas contribuições sob a mesma licença.</p>
    <p>O Study World Map é software livre: seu código-fonte está publicado no <a href="https://github.com/aguilera128/study-world-map">GitHub</a> sob a licença <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, versão 3 (AGPL-3.0)</a>. Qualquer pessoa pode usá-lo, estudá-lo, modificá-lo e redistribuí-lo nas condições dessa licença; quem publicar uma versão modificada em um site tem que oferecer também o seu código-fonte. A licença não cobre o nome “Study World Map”, o domínio nem o ícone.</p>
    <p>Os dados de terceiros são usados conforme as suas licenças:</p>
    <ul>
      <li>Cartografia: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (domínio público).</li>
      <li>Nomes de países, subdivisões, capitais e acidentes geográficos em outros idiomas: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>População: Banco Mundial, indicador “População, total” (SP.POP.TOTL), licença CC BY 4.0; a dos países que não estão nessa série, Wikidata.</li>
      <li>Regiões dos Estados Unidos: as quatro regiões do Escritório do Censo (U.S. Census Bureau).</li>
      <li>Regiões da Finlândia: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, unidades estatísticas por municípios de 2026 (licença CC BY 4.0), simplificadas.</li>
      <li>Condados da Noruega: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, “Administrative enheter fylker” de 2026 (licença CC BY 4.0), recortados pela costa e simplificados.</li>
      <li>Condados da Estônia: divisão administrativa da Estônia (EHAK), Conselho de Terras e Ordenamento do Território da Estônia (Republic of Estonia Land and Spatial Development Board), dados de 01.11.2026, simplificados, com a sua <a href="https://geoportaal.maaruum.ee/opendata-licence">licença de dados abertos</a>.</li>
      <li>Distritos de Chipre: Departamento de Terras e Cadastro da República de Chipre (Department of Lands and Surveys), unidades administrativas INSPIRE, simplificados.</li>
      <li>Distritos da Moldávia: ACNUR e OCHA, limites administrativos da Moldávia de 2020 (licença CC BY 3.0 IGO), via <a href="https://www.geoboundaries.org/">geoBoundaries</a>, recortados e simplificados.</li>
      <li>Temperatura, nuvens e vento de agora: modelo GFS (Global Forecast System) da NOAA/NCEP (domínio público), do programa de dados abertos da NOAA. É uma previsão, não uma medição.</li>
      <li>Chuva e neve de agora: IMERG, da missão GPM da NASA, servido pelos Global Imagery Browse Services (GIBS) do sistema ESDIS da NASA.</li>
      <li>Satélites: elementos orbitais GP do <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), a partir dos dados da U.S. Space Force; a posição de cada satélite é calculada no navegador com o modelo SGP4 (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, licença MIT).</li>
      <li>Códigos ISO e áreas: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Bandeiras: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (licença MIT).</li>
      <li>Luzes noturnas das cidades: Black Marble 2016, NASA Earth Observatory (domínio público).</li>
      <li>Imagem de satélite: Blue Marble Next Generation, NASA Earth Observatory (julho de 2004, domínio público).</li>
      <li>Relevo do fundo do mar: ETOPO2v2, NOAA National Geophysical Data Center (domínio público).</li>
      <li>Correntes oceânicas: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), média de dezembro de 2011 a setembro de 2014, do servidor ERDDAP do NOAA CoastWatch; o rumo geral de cada corrente, do seu artigo na Wikipédia em inglês.</li>
      <li>Placas tectônicas: modelo PB2002 de Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, na conversão de Hugo Ahlenius (Nordpil), licença <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Vulcões: base de dados de vulcões da NOAA NCEI (domínio público).</li>
      <li>Estrelas: Yale Bright Star Catalogue, 5.ª edição (domínio público), e catálogo Hipparcos da Agência Espacial Europeia (ESA, 1997).</li>
      <li>Via Láctea: “Deep Star Maps 2020”, NASA/Goddard Space Flight Center Scientific Visualization Studio, com dados do Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Fusos horários: base de dados de fusos horários da IANA, via <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (licença MIT).</li>
      <li>Ilustrações da camada “Planeta de desenho animado”: desenhos originais gerados com inteligência artificial a partir de uma descrição própria.</li>
      <li>Climas: mapa-múndi de Köppen-Geiger de Kottek, Grieser, Beck, Rudolf e Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, agrupado nos climas estudados na escola (ensino fundamental e médio).</li>
      <li>Tipografias: Besley e Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Links externos</h2>
    <p>O site tem links para páginas de terceiros, como o PayPal para as doações, o GitHub para o código-fonte e os sites das fontes dos dados. O titular não controla essas páginas nem responde pelo conteúdo nem pelas políticas delas.</p>

    <h2>Responsabilidade</h2>
    <p>O titular não garante que o site esteja disponível a todo momento nem livre de erros, e não responde pelos danos que possam decorrer do seu uso, salvo nos casos em que a lei o exija.</p>

    <h2>Legislação aplicável</h2>
    <p>Este aviso legal é regido pela legislação espanhola. As informações sobre o tratamento de dados pessoais estão na <a href="${ruta('privacidad')}">política de privacidade</a> e as de cookies, na <a href="${ruta('cookies')}">política de cookies</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Política de privacidade · Study World Map',
      description: 'Quais dados o Study World Map trata, para quê e como exercer os seus direitos. O aplicativo não tem contas e guarda o seu progresso no seu dispositivo; só se você pedir, ele também é guardado com um código para usá-lo em outro.',
      body: `    <h1>Política de privacidade</h1>
${traduccion('privacidad', 'Política de privacidad')}
    <p class="lead">Resumo: não há contas nem formulários. O seu progresso fica no seu dispositivo, a menos que você crie um código para levá-lo a outro. Só se você aceitar os cookies de análise são enviados dados de uso ao Google Analytics.</p>

    <h2>Responsável pelo tratamento</h2>
${titularBlock()}

    <h2>Quais dados são tratados e para quê</h2>

    <h3>Progresso, configurações e listas de estudo</h3>
    <p>São guardados apenas no armazenamento local do seu navegador, para que você não perca o que aprendeu. Não são enviados a nenhum servidor e o titular não tem acesso a eles, a menos que você use a sincronização explicada a seguir. Você pode apagá-los no próprio aplicativo (“Progresso”) ou apagando os dados do site no seu navegador.</p>
    <h3>Continuar em outro dispositivo (opcional)</h3>
    <p>Se em “Progresso” você tocar em “Criar meu código”, o seu progresso é guardado também em um banco de dados para que você possa continuar em outro dispositivo. Guarda-se unicamente um código de doze letras e números gerado aleatoriamente, o progresso (quais países ou acidentes geográficos você sabe, as suas melhores notas e o resultado do desafio do dia) e a data. No banco de dados não são guardados o seu nome, o seu e-mail nem o seu endereço IP, e o código não está associado a nenhuma pessoa. As listas de estudo e as configurações não são enviadas.</p>
    <p>O banco de dados fica na União Europeia (Frankfurt), no serviço Neon, e as requisições passam pela hospedagem do site (Vercel), que, como em qualquer site, registra durante um tempo limitado dados técnicos de cada requisição, entre eles o endereço IP e o endereço solicitado. Quem conhecer o código pode ver e alterar esse progresso, então compartilhe-o só com quem você quiser. Se você abrir um link que contém o código (o do código QR), esse código faz parte do endereço dessa visita e, portanto, do que a hospedagem registra. O aplicativo o retira do endereço assim que é aberto, antes de carregar a análise, para que não chegue ao Google.</p>
    <p>Você pode apagar o que foi guardado a qualquer momento com “Apagar o que foi salvo com este código”. “Parar de sincronizar” só desconecta o dispositivo em que você toca nesse botão: o que foi guardado continua lá para os seus outros dispositivos. O que ficar mais de um ano sem uso é apagado.</p>
    <p><strong>Base legal:</strong> o seu consentimento, que você dá ao tocar em “Criar meu código” (art. 6.1.a do RGPD). Você pode retirá-lo quando quiser, apagando o que foi guardado.</p>
    <p><strong>Fornecedor:</strong> Neon, o serviço de banco de dados, que atua como subcontratante (o “operador” da LGPD brasileira). Os dados são guardados no data center do Neon em Frankfurt. O Neon pertence a uma empresa dos Estados Unidos: se ela acessasse esses dados de fora do Espaço Econômico Europeu, o faria com as garantias que o RGPD exige para as transferências internacionais.</p>

    <h3>Ranking de resultados (opcional)</h3>
    <p>Ao terminar uma partida, você pode publicar o seu resultado no ranking desse desafio. Nada é enviado se você não tocar em “Publicar”. No banco de dados são guardados (e qualquer pessoa que consultar esse ranking pode vê-los) o apelido que você escrever, a sua nota, o seu tempo, a data e o país de onde você se conecta (só a sigla de duas letras, para mostrar a bandeira). O país é indicado pela hospedagem a partir do seu endereço IP no momento de publicar; o endereço IP não é guardado no banco de dados.</p>
    <p>O apelido não deve conter o seu nome, o seu sobrenome nem outros dados pessoais: o aplicativo propõe um e lembra você disso ao escrevê-lo. Ele não está associado a nenhuma conta nem a nenhuma pessoa, e qualquer um pode usar o mesmo. Só se conservam os dez melhores resultados de cada ranking: os demais são apagados ao serem superados, e os do desafio do dia, após 45 dias. Se você quiser que seja apagado um resultado que publicou, ou vir um apelido que não deveria estar lá, escreva para ${email()} indicando o apelido e o desafio.</p>
    <p><strong>Base legal:</strong> o seu consentimento, que você dá ao tocar em “Publicar” (art. 6.1.a do RGPD).</p>

    <h3>Localização</h3>
    <p>A função “Tempo real” situa a sua posição no mapa a partir do fuso horário do seu dispositivo, sem pedir nada a você. Se você tocar no botão de localização exata, o seu navegador pedirá permissão e o aplicativo usará a sua posição arredondada (cerca de 1 km). Nos dois casos a localização só é usada na tela: não é guardada nem enviada a lugar nenhum.</p>

    <h3>Meteorologia</h3>
    <p>Se você ligar alguma das camadas de meteorologia (temperatura, nuvens, chuva ou vento), o aplicativo pede esses dados a este mesmo site, que por sua vez os obtém da NOAA e da NASA. A esses órgãos não chega nada seu, nem sequer o seu endereço IP, e nada é guardado.</p>

    <h3>Satélites</h3>
    <p>Se você ligar a camada de satélites, o aplicativo pede as órbitas deles a este mesmo site, que por sua vez as obtém do CelesTrak. Ao CelesTrak não chega nada seu, nem sequer o seu endereço IP, e nada é guardado. A posição de cada satélite é calculada no seu navegador.</p>

    <h3>Análise (somente com o seu consentimento)</h3>
    <p>Se você aceitar os cookies de análise, são carregados o Google Tag Manager e o Google Analytics 4 para contar as visitas e saber quais partes do site são usadas, com a única finalidade de melhorá-lo. São tratados dados técnicos e de uso: identificadores de cookie, páginas vistas, tipo de dispositivo e navegador, idioma, e país ou cidade aproximados. Não são usados para publicidade nem para criar perfis comerciais.</p>
    <ul>
      <li><strong>Base legal:</strong> o seu consentimento (art. 6.1.a do RGPD). Você pode retirá-lo quando quiser na ${consentLink}, sem que isso afete o que foi tratado antes.</li>
      <li><strong>Fornecedor:</strong> Google Ireland Limited, que atua como subcontratante (o “operador” da LGPD brasileira). O Google pode transferir dados para os Estados Unidos, amparado pelo Quadro de Privacidade de Dados UE-EUA e por cláusulas contratuais-tipo.</li>
      <li><strong>Conservação:</strong> a que estiver configurada na propriedade do Google Analytics, no máximo 14 meses.</li>
    </ul>
    <p>Se você recusar ou não responder, o site não carrega nada do Google.</p>

    <h3>E-mail</h3>
    <p>Se você escrever para ${email()}, o seu endereço e a sua mensagem são usados para responder a você, com base no seu próprio pedido. São conservados enquanto durar a conversa e apagados depois, salvo se for preciso guardá-los por obrigação legal.</p>

    <h3>Doações</h3>
    <p>As doações são feitas no PayPal, que trata os dados do pagamento como responsável independente, de acordo com a sua própria política de privacidade. O titular recebe do PayPal o nome, o e-mail e o valor de quem doa, e os usa apenas para gerenciar a doação, agradecê-la e cumprir as suas obrigações fiscais, durante o prazo que a lei exigir.</p>

    <h3>Hospedagem</h3>
    <p>O site é hospedado na Vercel Inc. Como qualquer servidor web, ela registra dados técnicos de cada visita (como o endereço IP) durante um tempo limitado, para servir o site e protegê-lo de abusos. A Vercel atua como subcontratante (o “operador” da LGPD brasileira), com as garantias do RGPD para as transferências internacionais.</p>
    <p><strong>Base legal:</strong> o interesse legítimo do titular em poder servir o site e mantê-lo seguro (art. 6.1.f do RGPD).</p>

    <h2>Menores de idade</h2>
    <p>O Study World Map foi pensado para estudantes. Não pede dados pessoais para ser usado. Se você tem menos de 14 anos, peça à sua mãe, ao seu pai ou à pessoa que cuida de você que decida se os cookies de análise são aceitos e se você pode publicar os seus resultados no ranking (art. 7 da Ley Orgánica 3/2018, a lei orgânica espanhola de proteção de dados).</p>

    <h2>Os seus direitos</h2>
    <p>Você pode pedir o acesso, a retificação ou a eliminação dos seus dados, a limitação do seu tratamento, opor-se a ele ou pedir a sua portabilidade, escrevendo para ${email()}. Como não sabemos de quem é cada código de sincronização, para atender a um pedido sobre um progresso guardado precisamos que você nos indique o código. Se você achar que os seus direitos não foram respeitados, pode apresentar uma reclamação à <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a> (a autoridade espanhola de proteção de dados).</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Política de cookies · Study World Map',
      description: 'Quais cookies e qual armazenamento local o Study World Map usa e como mudar a sua escolha.',
      body: `    <h1>Política de cookies</h1>
${traduccion('cookies', 'Política de cookies')}
    <p class="lead">Os únicos cookies são os do Google Analytics, e só são instalados se você os aceitar. O resto é armazenamento local de que o aplicativo precisa para funcionar.</p>
    <p><a class="cta" href="#cookies">Mudar a minha escolha</a></p>

    <h2>Cookies de análise (exigem consentimento)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nome</th><th scope="col">Fornecedor</th><th scope="col">Para que serve</th><th scope="col">Duração</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguir visitantes de forma anônima.</td><td>2 anos</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Manter o estado da sessão.</td><td>2 anos</td></tr>
      </tbody>
    </table></div>
    <p>São cookies próprios do domínio, mas quem os gerencia é o Google. Mais informações na <a href="${ruta('privacidad')}">política de privacidade</a> e na <a href="https://policies.google.com/technologies/cookies?hl=es">explicação do Google</a>.</p>

    <h2>Armazenamento técnico (não exige consentimento)</h2>
    <p>Não são cookies: ficam guardados apenas no seu navegador, não são enviados a nenhum servidor (salvo o progresso, se você criar um código para levá-lo a outro dispositivo, e o apelido, se você publicar um resultado no ranking) e são necessários para que o aplicativo funcione como você pede.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nome</th><th scope="col">Para que serve</th><th scope="col">Duração</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Tema, visualização, desafio escolhido, listas de estudo e se você fechou o aviso de idioma.</td><td>Até você apagar</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>O que você já sabe e as suas melhores notas.</td><td>Até você apagar</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>O seu código para continuar em outro dispositivo, se você o criou.</td><td>Até você parar de sincronizar</td></tr>
        <tr><td><code>swm:apodo</code></td><td>O último apelido com que você publicou no ranking, para propô-lo a você na próxima vez.</td><td>Até você apagar</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Lembrar que você disse “Agora não” quando lhe é oferecido criar um código ao terminar uma partida.</td><td>Até você apagar</td></tr>
        <tr><td><code>swm:consent</code></td><td>Lembrar se você aceitou ou recusou os cookies, e quando.</td><td>Dois anos; depois a pergunta é feita de novo</td></tr>
        <tr><td>Cache <code>swm-*</code></td><td>Cópia do aplicativo para usá-lo sem conexão.</td><td>Até a versão seguinte</td></tr>
      </tbody>
    </table></div>

    <h2>Como mudar ou retirar o seu consentimento</h2>
    <p>A qualquer momento, na ${consentLink} (também no rodapé de cada página). Ao recusar, o site deixa de carregar o Google Analytics e apaga os cookies dele. A sua escolha, seja qual for, vale dois anos: passado esse tempo, a pergunta é feita de novo. Além disso, você pode apagar os cookies e os dados do site nas configurações do seu navegador; se fizer isso, o seu progresso também será apagado.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Apoie o Study World Map com uma doação',
      description: 'O Study World Map é grátis, sem anúncios e sem cadastro. Se ele ajuda você a estudar, você pode apoiá-lo com uma doação.',
      body: `    <h1>Apoie o Study World Map</h1>
    <p class="lead">O Study World Map é grátis para todos os estudantes e vai continuar sendo: sem anúncios, sem contas e sem vender os seus dados. Se ele ajudou você ou a sua turma, uma doação ajuda a mantê-lo vivo.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Doar com PayPal →</a></p>

    <h2>A que se destina</h2>
    <ul>
      <li>Manter o domínio e a hospedagem.</li>
      <li>Revisar e corrigir os dados: países, capitais, fronteiras, bandeiras, geografia física e traduções.</li>
      <li>Adicionar novos desafios e melhorar a acessibilidade.</li>
    </ul>

    <h2>Antes de doar</h2>
    <ul>
      <li>A doação é voluntária e não dá acesso a nada extra: o aplicativo é igual para todos.</li>
      <li>O pagamento é feito no PayPal; o Study World Map não vê nem guarda os dados do seu cartão.</li>
      <li>O Study World Map é um projeto pessoal, não uma fundação nem uma associação, portanto a doação não é dedutível na declaração do imposto de renda.</li>
    </ul>
    <p>Prefere ajudar de outra forma? Compartilhe-o com a sua turma ou escreva para ${email()} se encontrar um erro.</p>`,
    },
  ];
}
