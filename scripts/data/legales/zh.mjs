// Textos legales y de donaciones en chino simplificado (中文): traducción de ./es.mjs, con la misma
// estructura. En caso de discrepancia manda el original en español, y cada página legal lo dice.
// Traducción sin revisar por un hablante nativo: conviene que alguien la repase.

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'legal-notice', privacidad: 'privacy', cookies: 'cookies', donar: 'donate' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>最近修订：${fecha}。</small></p>`;
  const consentLink = `<a href="#cookies">Cookie 设置</a>`;
  const traduccion = (id) =>
    `    <p><em>本文为译文，仅供参考。如有任何不一致之处，以<a href="${original(id)}" hreflang="es" lang="es">西班牙语原文</a>为准。</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>所有者：</strong>${dato(TITULAR.nombre)}</li>
        <li><strong>NIF（西班牙税务识别号）：</strong>${dato(TITULAR.nif)}</li>
        <li><strong>地址：</strong>${dato(TITULAR.domicilio)}</li>
        <li><strong>电子邮箱：</strong>${email()}</li>
        <li><strong>网站：</strong><a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: '法律声明 · Study World Map',
      description: 'Study World Map 的所有者信息、使用条件和知识产权。',
      body: `    <h1>法律声明</h1>
${traduccion('aviso')}
    <h2>网站所有者</h2>
    <p>根据西班牙第 34/2002 号法律《信息社会服务与电子商务法》（Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico，LSSI-CE）第 10 条的规定，所有者信息如下：</p>
${titularBlock()}

    <h2>宗旨</h2>
    <p>Study World Map 是一个个人教育项目：一本通过游戏学习地理的互动地图集。它讲授世界各国及其所属大洲、首都和国旗；三十多个国家的省、州或大区；自然地理、气候和人口；地球内部和大气层的各层；以及实时的昼夜、天气和人造卫星。它免费，没有广告，不出售任何东西，也不需要注册。它靠作者投入的时间以及愿意支持它的人的<a href="${ruta('donar')}">自愿捐助</a>来维持。</p>

    <h2>使用条件</h2>
    <p>本网站可自由、免费使用。使用本网站即表示你承诺以合法方式使用，不损害网站，也不妨碍他人使用。你可以把链接和学习列表分享给任何人，例如你的班级。</p>

    <h2>内容的准确性</h2>
    <p>地理数据用于教育目的，并经过认真核对，但仍可能存在错误或已经过时。国界来自 Natural Earth，某些决定（例如哪些地区算作国家）在应用内有说明；它们不表达任何政治立场。如果你发现错误，请写信至 ${email()}，我们会予以更正。</p>

    <h2>知识产权</h2>
    <p>Study World Map 的设计、代码和文字是其所有者的作品，在适用的情况下也是为本项目作出贡献的人的作品，他们以相同的许可证发布自己的贡献。</p>
    <p>Study World Map 是自由软件：其源代码发布在 <a href="https://github.com/aguilera128/study-world-map">GitHub</a> 上，采用 <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License 第 3 版（AGPL-3.0）</a>许可证。任何人都可以按照该许可证的条件使用、研究、修改和再分发它；在网站上发布修改版本的人也必须提供其源代码。该许可证不涵盖“Study World Map”这一名称、域名和图标。</p>
    <p>第三方数据按照各自的许可证使用：</p>
    <ul>
      <li>地图数据：<a href="https://www.naturalearthdata.com/">Natural Earth</a>（公有领域）。</li>
      <li>国家、行政区划、首都和地理事物的其他语言名称：<a href="https://www.wikidata.org/">Wikidata</a>（CC0）。</li>
      <li>人口：世界银行（World Bank）“人口，总数”指标（SP.POP.TOTL），CC BY 4.0 许可证；该数据系列中没有的国家，采用 Wikidata 的数据。</li>
      <li>美国的地区：美国人口普查局（U.S. Census Bureau）的四个地区。</li>
      <li>芬兰的大区：<a href="https://stat.fi/en/services/statistical-data-services/geographic-data">芬兰统计局（Statistics Finland）</a>，2026 年按市镇划分的统计单元（CC BY 4.0 许可证），经过简化。</li>
      <li>挪威的郡：<a href="https://kartkatalog.geonorge.no/">挪威测绘局（Kartverket）</a>，2026 年的“Administrative enheter fylker”（CC BY 4.0 许可证），沿海岸线裁剪并经过简化。</li>
      <li>爱沙尼亚的县：爱沙尼亚行政区划（EHAK），爱沙尼亚共和国土地与空间发展局（Republic of Estonia Land and Spatial Development Board），2026 年 11 月 1 日的数据，经过简化，采用其<a href="https://geoportaal.maaruum.ee/opendata-licence">开放数据许可证</a>。</li>
      <li>塞浦路斯的区：塞浦路斯共和国土地与测量局（Department of Lands and Surveys），INSPIRE 行政单元，经过简化。</li>
      <li>摩尔多瓦的区：联合国难民署（UNHCR）和联合国人道主义事务协调厅（OCHA），2020 年摩尔多瓦行政边界（CC BY 3.0 IGO 许可证），经由 <a href="https://www.geoboundaries.org/">geoBoundaries</a> 获取，经过裁剪和简化。</li>
      <li>当前的温度、云和风：美国国家海洋和大气管理局及美国国家环境预报中心（NOAA/NCEP）的 GFS（Global Forecast System）模式（公有领域），来自 NOAA 的开放数据计划。这是预报，不是实测。</li>
      <li>当前的雨和雪：IMERG，来自美国国家航空航天局（NASA）的 GPM 任务，由 NASA ESDIS 系统的 Global Imagery Browse Services（GIBS）提供。</li>
      <li>人造卫星：<a href="https://celestrak.org/">CelesTrak</a>（T. S. Kelso）的 GP 轨道根数，依据美国太空军（U.S. Space Force）的数据；每颗卫星的位置在浏览器中用 SGP4 模型计算（<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>，MIT 许可证）。</li>
      <li>ISO 代码和面积：<a href="https://github.com/mledoze/countries">mledoze/countries</a>（Open Database License）。</li>
      <li>国旗：<a href="https://github.com/lipis/flag-icons">flag-icons</a>（MIT 许可证）。</li>
      <li>城市夜间灯光：Black Marble 2016，NASA Earth Observatory（公有领域）。</li>
      <li>卫星影像：Blue Marble Next Generation，NASA Earth Observatory（2004 年 7 月，公有领域）。</li>
      <li>海底地形：ETOPO2v2，NOAA National Geophysical Data Center（公有领域）。</li>
      <li>洋流：OSCAR（Ocean Surface Current Analyses Real-time，Earth &amp; Space Research），2011 年 12 月至 2014 年 9 月的平均值，来自 NOAA CoastWatch 的 ERDDAP 服务器；每条洋流的大致流向，来自英文维基百科中的相应条目。</li>
      <li>板块构造：Peter Bird（2003）的 PB2002 模型，<em>Geochemistry, Geophysics, Geosystems</em>，采用 Hugo Ahlenius（Nordpil）的转换版本，<a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a> 许可证。火山：NOAA NCEI 的火山数据库（公有领域）。</li>
      <li>恒星：Yale Bright Star Catalogue 第 5 版（公有领域），以及欧洲空间局（European Space Agency，ESA，1997）的 Hipparcos 星表。</li>
      <li>银河：“Deep Star Maps 2020”，NASA/Goddard Space Flight Center Scientific Visualization Studio，使用 Gaia DR2 的数据（ESA/Gaia/DPAC）。</li>
      <li>时区：互联网号码分配局（IANA）的时区数据库，经由 <a href="https://github.com/moment/moment-timezone">moment-timezone</a> 获取（MIT 许可证）。</li>
      <li>“卡通星球”图层的插图：根据自行撰写的描述，用人工智能生成的原创设计。</li>
      <li>气候：Kottek、Grieser、Beck、Rudolf 和 Rubel（2006）的柯本—盖格（Köppen-Geiger）世界气候图，<em>Meteorologische Zeitschrift</em> 15, 259-263，归并为中学阶段学习的气候类型。</li>
      <li>字体：Besley 和 Atkinson Hyperlegible Next（SIL Open Font License）。</li>
    </ul>

    <h2>外部链接</h2>
    <p>本网站链接到第三方页面，例如用于捐助的 PayPal、存放源代码的 GitHub，以及各数据来源的网站。所有者不控制这些页面，也不对其内容或政策负责。</p>

    <h2>责任</h2>
    <p>所有者不保证本网站随时可用或没有错误，也不对因使用本网站而可能产生的损害负责，但法律要求承担责任的情形除外。</p>

    <h2>适用法律</h2>
    <p>本法律声明受西班牙法律管辖。有关个人数据处理的信息见<a href="${ruta('privacidad')}">隐私政策</a>，有关 Cookie 的信息见 <a href="${ruta('cookies')}">Cookie 政策</a>。</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: '隐私政策 · Study World Map',
      description: 'Study World Map 处理哪些数据、用于什么目的，以及如何行使你的权利。本应用没有账号，进度保存在你的设备上；只有在你提出要求时，才会另外用一个同步码保存，以便在另一台设备上使用。',
      body: `    <h1>隐私政策</h1>
${traduccion('privacidad')}
    <p class="lead">摘要：没有账号，也没有表单。你的进度留在你的设备上，除非你创建同步码把它带到另一台设备。只有在你接受分析 Cookie 的情况下，才会向 Google Analytics 发送使用数据。</p>

    <h2>数据控制者</h2>
${titularBlock()}

    <h2>处理哪些数据以及用于什么目的</h2>

    <h3>进度、设置和学习列表</h3>
    <p>它们只保存在你浏览器的本地存储中，以免你丢失已经学会的内容。它们不会发送到任何服务器，所有者也无法访问，除非你使用下文说明的同步功能。你可以在应用内（“进度”）删除它们，也可以在浏览器中清除本网站的数据来删除。</p>
    <h3>在另一台设备上继续（可选）</h3>
    <p>如果你在“进度”中点击“创建我的同步码”，你的进度还会保存到一个数据库中，以便你在另一台设备上继续。保存的只有一个随机生成的 12 位字母和数字的同步码、进度（你已掌握哪些国家或地理事物、你的最高分和每日挑战的结果）以及日期。数据库中不保存你的姓名、电子邮箱或 IP 地址，同步码也不与任何人相关联。学习列表和设置不会发送。</p>
    <p>数据库位于欧盟（法兰克福），使用 Neon 服务，请求经由网站的托管服务（Vercel）传递；与任何网站一样，该托管服务会在有限的时间内记录每次请求的技术数据，其中包括 IP 地址和所请求的地址。知道同步码的人可以查看和更改该进度，因此请只把它分享给你愿意分享的人。如果你打开带有同步码的链接（二维码中的链接），该同步码就是那次访问地址的一部分，因而也是托管服务所记录内容的一部分。应用一打开就会把它从地址中移除，这发生在加载分析工具之前，以免它传到 Google。</p>
    <p>你可以随时用“删除用此同步码保存的内容”删除已保存的内容。“停止同步”只会断开你点击它的那台设备：已保存的内容仍然保留，供你的其他设备使用。超过一年未使用的内容会被删除。</p>
    <p><strong>法律依据：</strong>你的同意，你在点击“创建我的同步码”时给予该同意（《通用数据保护条例》(GDPR) 第 6.1.a 条）。你可以随时通过删除已保存的内容撤回同意。</p>
    <p><strong>服务提供方：</strong>Neon，即数据库服务，它作为数据处理者行事。数据保存在其法兰克福的数据中心。Neon 隶属于一家美国公司：如果它从欧洲经济区以外访问这些数据，将按照 GDPR 对国际传输所要求的保障措施进行。</p>

    <h3>成绩排行榜（可选）</h3>
    <p>一局结束后，你可以把成绩发布到该挑战的排行榜上。如果你不点击“发布”，就不会发送任何内容。保存到数据库中、且任何查看该排行榜的人都能看到的内容有：你填写的昵称、你的分数、你的用时、日期，以及你上网所在的国家（只有其两个字母的代码，用于显示国旗）。国家由托管服务在发布时根据你的 IP 地址给出；IP 地址不会保存到数据库中。</p>
    <p>昵称不应包含你的名字、姓氏或其他个人数据：应用会为你推荐一个昵称，并在你填写时提醒你这一点。昵称不与任何账号或任何人相关联，任何人都可以使用同一个昵称。每个排行榜只保留前十名的成绩：其余成绩在被超过时删除，每日挑战的成绩在 45 天后删除。如果你希望删除自己发布的某个成绩，或者看到不应出现的昵称，请写信至 ${email()}，并注明昵称和挑战。</p>
    <p><strong>法律依据：</strong>你的同意，你在点击“发布”时给予该同意（GDPR 第 6.1.a 条）。</p>

    <h3>位置</h3>
    <p>“实时”功能根据你设备的时区在地图上标出你的位置，不需要向你询问任何信息。如果你点击精确位置按钮，浏览器会请求你的许可，应用将使用经过取整的位置（约 1 km）。在这两种情况下，位置都只在屏幕上使用：不会被保存，也不会发送到任何地方。</p>

    <h3>气象</h3>
    <p>如果你打开任何一个气象图层（温度、云、雨或风），应用会向本网站自身请求这些数据，本网站再从美国国家海洋和大气管理局（NOAA）和美国国家航空航天局（NASA）获取。你的任何信息都不会传到这些机构，连你的 IP 地址也不会，并且不保存任何内容。</p>

    <h3>人造卫星</h3>
    <p>如果你打开人造卫星图层，应用会向本网站自身请求卫星的轨道，本网站再从 CelesTrak 获取。你的任何信息都不会传到 CelesTrak，连你的 IP 地址也不会，并且不保存任何内容。每颗卫星的位置在你的浏览器中计算。</p>

    <h3>分析（仅在你同意的情况下）</h3>
    <p>如果你接受分析 Cookie，就会加载 Google Tag Manager 和 Google Analytics 4，用来统计访问量并了解网站的哪些部分被使用，唯一目的是改进网站。处理的是技术数据和使用数据：Cookie 标识符、浏览的页面、设备和浏览器类型、语言，以及大致的国家或城市。这些数据不用于广告，也不用于建立商业画像。</p>
    <ul>
      <li><strong>法律依据：</strong>你的同意（GDPR 第 6.1.a 条）。你可以随时在 ${consentLink}中撤回同意，这不影响此前已进行的处理。</li>
      <li><strong>服务提供方：</strong>Google Ireland Limited，它作为数据处理者行事。Google 可能将数据传输至美国，其依据是欧盟—美国数据隐私框架（EU-U.S. Data Privacy Framework）和标准合同条款。</li>
      <li><strong>保存期限：</strong>以 Google Analytics 媒体资源中配置的期限为准，最长 14 个月。</li>
    </ul>
    <p>如果你拒绝或不作答复，网站不会加载 Google 的任何内容。</p>

    <h3>电子邮件</h3>
    <p>如果你写信至 ${email()}，你的地址和你的邮件内容将用于答复你，其依据是你本人的请求。它们在对话持续期间保留，之后删除，除非因法律义务而必须保存。</p>

    <h3>捐助</h3>
    <p>捐助在 PayPal 上进行，PayPal 作为独立的数据控制者，按照其自身的隐私政策处理付款数据。所有者从 PayPal 收到捐助者的姓名、电子邮箱和金额，并且只将其用于管理捐助、表示感谢和履行其税务义务，保存期限为法律要求的期限。</p>

    <h3>托管</h3>
    <p>本网站托管于 Vercel Inc.。与任何网络服务器一样，它会在有限的时间内记录每次访问的技术数据（例如 IP 地址），以便提供网站并防止其被滥用。Vercel 作为数据处理者行事，并具备 GDPR 对国际传输所要求的保障措施。</p>
    <p><strong>法律依据：</strong>所有者在能够提供网站并保持其安全方面的正当利益（GDPR 第 6.1.f 条）。</p>

    <h2>未成年人</h2>
    <p>Study World Map 是为学生设计的。使用它不需要提供个人数据。如果你未满 14 岁，请让你的母亲、父亲或照顾你的人决定是否接受分析 Cookie，以及你是否可以把成绩发布到排行榜上（西班牙第 3/2018 号组织法（Ley Orgánica 3/2018）第 7 条）。</p>

    <h2>你的权利</h2>
    <p>你可以写信至 ${email()}，请求访问、更正或删除你的数据，请求限制对其的处理，反对该处理，或请求数据可携带。由于我们不知道每个同步码属于谁，要处理有关某项已保存进度的请求，我们需要你告知同步码。如果你认为自己的权利没有得到尊重，可以向<a href="https://www.aepd.es/">西班牙数据保护局（Agencia Española de Protección de Datos）</a>提出申诉。</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Cookie 政策 · Study World Map',
      description: 'Study World Map 使用哪些 Cookie 和本地存储，以及如何更改你的选择。',
      body: `    <h1>Cookie 政策</h1>
${traduccion('cookies')}
    <p class="lead">仅有的 Cookie 是 Google Analytics 的 Cookie，并且只有在你接受时才会安装。其余的是应用运行所需的本地存储。</p>
    <p><a class="cta" href="#cookies">更改我的选择</a></p>

    <h2>分析 Cookie（需要同意）</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">名称</th><th scope="col">提供方</th><th scope="col">用途</th><th scope="col">期限</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>以匿名方式区分访问者。</td><td>2 年</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>保持会话状态。</td><td>2 年</td></tr>
      </tbody>
    </table></div>
    <p>它们是本域名的第一方 Cookie，但由 Google 管理。更多信息见<a href="${ruta('privacidad')}">隐私政策</a>和 <a href="https://policies.google.com/technologies/cookies?hl=es">Google 的说明</a>。</p>

    <h2>技术性存储（不需要同意）</h2>
    <p>它们不是 Cookie：只保存在你的浏览器中，不会发送到任何服务器（但进度除外，如果你创建同步码把它带到另一台设备；昵称也除外，如果你在排行榜上发布成绩），并且是应用按你的要求运行所必需的。</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">名称</th><th scope="col">用途</th><th scope="col">期限</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>主题、视图、所选的挑战、学习列表，以及你是否已关闭语言提示。</td><td>直到你将其删除</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>你已经掌握的内容和你的最高分。</td><td>直到你将其删除</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>你用于在另一台设备上继续的同步码（如果你已创建）。</td><td>直到你停止同步</td></tr>
        <tr><td><code>swm:apodo</code></td><td>你上一次在排行榜上发布时使用的昵称，以便下次向你推荐。</td><td>直到你将其删除</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>记住你在一局结束后被询问是否创建同步码时选择了“暂时不要”。</td><td>直到你将其删除</td></tr>
        <tr><td><code>swm:consent</code></td><td>记住你是接受还是拒绝了 Cookie，以及何时作出的选择。</td><td>两年；之后会再次询问你</td></tr>
        <tr><td>缓存 <code>swm-*</code></td><td>应用的副本，用于离线使用。</td><td>直到下一个版本</td></tr>
      </tbody>
    </table></div>

    <h2>如何更改或撤回你的同意</h2>
    <p>你可以随时在 ${consentLink}中操作（每个页面的页脚也有）。拒绝后，网站将停止加载 Google Analytics 并删除其 Cookie。无论你作何选择，该选择的有效期为两年：期满后会再次询问你。此外，你还可以在浏览器的设置中删除本网站的 Cookie 和数据；如果这样做，你的进度也会被删除。</p>
${revision}`,
    },

    {
      id: 'donar',
      title: '捐助支持 Study World Map',
      description: 'Study World Map 免费，没有广告，无需注册。如果它对你的学习有帮助，你可以通过捐助来支持它。',
      body: `    <h1>支持 Study World Map</h1>
    <p class="lead">Study World Map 对所有学生免费，并将继续免费：没有广告，没有账号，也不出售你的数据。如果它帮助了你或你的班级，一笔捐助有助于让它继续存在下去。</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">通过 PayPal 捐助 →</a></p>

    <h2>捐助的用途</h2>
    <ul>
      <li>维持域名和托管。</li>
      <li>核对和更正数据：国家、首都、国界、国旗、自然地理和翻译。</li>
      <li>增加新的挑战并改进无障碍性。</li>
    </ul>

    <h2>捐助之前</h2>
    <ul>
      <li>捐助是自愿的，不会带来任何额外的功能：应用对所有人都一样。</li>
      <li>付款在 PayPal 上进行；Study World Map 看不到也不保存你的银行卡数据。</li>
      <li>Study World Map 是个人项目，不是基金会，也不是协会，因此捐助不能在个人所得税申报中抵扣。</li>
    </ul>
    <p>想用别的方式帮忙？把它分享给你的班级，或者在发现错误时写信至 ${email()}。</p>`,
    },
  ];
}
