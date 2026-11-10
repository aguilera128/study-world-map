// Datos en español de los 197 países del cuestionario y de los territorios que aparecen en el
// mapa pero no se preguntan. Los 197 son: los 193 miembros de la ONU, sus dos Estados
// observadores (Ciudad del Vaticano y Palestina) y dos Estados de reconocimiento limitado que
// suelen entrar en los temarios escolares (Taiwán y Kosovo).
//
// Se cruzan por código ISO 3166-1 alfa-3 con la geometría de Natural Earth en
// scripts/build-atlas.mjs, que falla si falta o sobra algún país.
//
// Regiones (claves de filtro):
//   europa · asia · africa · am-norte · am-central · am-caribe · am-sur · oceania

/**
 * @param {string} iso3
 * @param {string} nombre     Nombre habitual en español (grafía recomendada por la RAE)
 * @param {string} capital
 * @param {string} region     Región principal
 * @param {{
 *   tambien?: string[],      // otras regiones en las que también se pregunta (países transcontinentales)
 *   continentes?: string[],  // respuestas válidas en el reto de continentes (la primera es la que se
 *                            //   enseña); por defecto, el continente de la región principal. Claves:
 *                            //   europa, asia, africa, america, oceania y europa-asia (entre los dos)
 *   alias?: string[],        // otros nombres aceptados al escribir la respuesta
 *   capAlias?: string[],     // otros nombres aceptados para la capital
 *   capNota?: string,        // aclaración breve que acompaña a la capital
 *   nota?: string,           // dato curioso / aclaración para la ficha
 * }} [extra]
 */
const p = (iso3, nombre, capital, region, extra = {}) => ({ iso3, nombre, capital, region, ...extra });

export const PAISES = [
  // ───────────────────────────── Europa ─────────────────────────────
  p('ALB', 'Albania', 'Tirana', 'europa'),
  p('DEU', 'Alemania', 'Berlín', 'europa'),
  p('AND', 'Andorra', 'Andorra la Vieja', 'europa', { capAlias: ['Andorra la Vella'] }),
  p('AUT', 'Austria', 'Viena', 'europa'),
  p('BEL', 'Bélgica', 'Bruselas', 'europa'),
  p('BLR', 'Bielorrusia', 'Minsk', 'europa', { alias: ['Belarús'] }),
  p('BIH', 'Bosnia y Herzegovina', 'Sarajevo', 'europa', { alias: ['Bosnia', 'Bosnia-Herzegovina', 'Bosnia Herzegovina'] }),
  p('BGR', 'Bulgaria', 'Sofía', 'europa'),
  p('HRV', 'Croacia', 'Zagreb', 'europa'),
  p('DNK', 'Dinamarca', 'Copenhague', 'europa'),
  p('SVK', 'Eslovaquia', 'Bratislava', 'europa'),
  p('SVN', 'Eslovenia', 'Liubliana', 'europa', { capAlias: ['Ljubljana'] }),
  p('ESP', 'España', 'Madrid', 'europa'),
  p('EST', 'Estonia', 'Tallin', 'europa', { capAlias: ['Tallinn'] }),
  p('FIN', 'Finlandia', 'Helsinki', 'europa'),
  p('FRA', 'Francia', 'París', 'europa'),
  p('GRC', 'Grecia', 'Atenas', 'europa'),
  p('HUN', 'Hungría', 'Budapest', 'europa'),
  p('IRL', 'Irlanda', 'Dublín', 'europa'),
  p('ISL', 'Islandia', 'Reikiavik', 'europa', { capAlias: ['Reykjavik'] }),
  p('ITA', 'Italia', 'Roma', 'europa'),
  p('LVA', 'Letonia', 'Riga', 'europa'),
  p('LIE', 'Liechtenstein', 'Vaduz', 'europa'),
  p('LTU', 'Lituania', 'Vilna', 'europa', { capAlias: ['Vilnius'] }),
  p('LUX', 'Luxemburgo', 'Luxemburgo', 'europa', { capAlias: ['Ciudad de Luxemburgo'] }),
  p('MKD', 'Macedonia del Norte', 'Skopie', 'europa', { alias: ['Macedonia'], capAlias: ['Skopje'] }),
  p('MLT', 'Malta', 'La Valeta', 'europa', { capAlias: ['Valeta', 'La Valetta'] }),
  p('MDA', 'Moldavia', 'Chisináu', 'europa', { alias: ['Moldova'], capAlias: ['Chisinau', 'Kishinev'] }),
  p('MCO', 'Mónaco', 'Mónaco', 'europa'),
  p('MNE', 'Montenegro', 'Podgorica', 'europa'),
  p('NOR', 'Noruega', 'Oslo', 'europa'),
  p('NLD', 'Países Bajos', 'Ámsterdam', 'europa', {
    alias: ['Holanda'],
    nota: 'Ámsterdam es la capital, pero el Gobierno y el Parlamento están en La Haya.',
  }),
  p('POL', 'Polonia', 'Varsovia', 'europa'),
  p('PRT', 'Portugal', 'Lisboa', 'europa'),
  p('GBR', 'Reino Unido', 'Londres', 'europa', { alias: ['Gran Bretaña', 'UK'] }),
  p('CZE', 'Chequia', 'Praga', 'europa', { alias: ['República Checa'] }),
  p('ROU', 'Rumanía', 'Bucarest', 'europa', { alias: ['Rumania'] }),
  p('RUS', 'Rusia', 'Moscú', 'europa', {
    tambien: ['asia'],
    continentes: ['europa-asia'],
    alias: ['Federación de Rusia', 'Federación Rusa'],
    nota: 'Es el país más extenso del mundo y se reparte entre Europa y Asia.',
  }),
  p('SMR', 'San Marino', 'San Marino', 'europa', { capAlias: ['Ciudad de San Marino'] }),
  p('SRB', 'Serbia', 'Belgrado', 'europa'),
  p('SWE', 'Suecia', 'Estocolmo', 'europa'),
  p('CHE', 'Suiza', 'Berna', 'europa'),
  p('UKR', 'Ucrania', 'Kiev', 'europa', { capAlias: ['Kyiv'] }),
  p('VAT', 'Ciudad del Vaticano', 'Ciudad del Vaticano', 'europa', {
    alias: ['Vaticano', 'El Vaticano', 'Santa Sede'],
    capAlias: ['Vaticano'],
    nota: 'Es el país más pequeño del mundo: está dentro de la ciudad de Roma.',
  }),
  p('XKX', 'Kosovo', 'Pristina', 'europa', {
    capAlias: ['Prishtina'],
    nota: 'Declaró su independencia de Serbia en 2008. Lo reconoce aproximadamente la mitad de los países del mundo; España no.',
  }),
  p('CYP', 'Chipre', 'Nicosia', 'europa', {
    tambien: ['asia'],
    continentes: ['europa', 'asia'],
    nota: 'Geográficamente está en Asia, pero pertenece a la Unión Europea.',
  }),

  // ────────────────────────────── Asia ──────────────────────────────
  p('AFG', 'Afganistán', 'Kabul', 'asia'),
  p('SAU', 'Arabia Saudita', 'Riad', 'asia', { alias: ['Arabia Saudí'] }),
  p('ARM', 'Armenia', 'Ereván', 'asia', {
    tambien: ['europa'],
    continentes: ['asia', 'europa', 'europa-asia'],
    capAlias: ['Yereván', 'Erevan'],
  }),
  p('AZE', 'Azerbaiyán', 'Bakú', 'asia', {
    tambien: ['europa'],
    continentes: ['asia', 'europa', 'europa-asia'],
    alias: ['Azerbaidzhán'],
  }),
  p('BHR', 'Baréin', 'Manama', 'asia', { alias: ['Bahréin', 'Bahrein', 'Bahrain'] }),
  p('BGD', 'Bangladés', 'Daca', 'asia', { alias: ['Bangladesh'], capAlias: ['Dhaka', 'Dacca'] }),
  p('BRN', 'Brunéi', 'Bandar Seri Begawan', 'asia', { alias: ['Brunei'] }),
  p('BTN', 'Bután', 'Timbu', 'asia', { alias: ['Bhután', 'Bhutan'], capAlias: ['Thimphu', 'Timphu', 'Thimbu'] }),
  p('KHM', 'Camboya', 'Nom Pen', 'asia', { capAlias: ['Phnom Penh', 'Nom Penh'] }),
  p('CHN', 'China', 'Pekín', 'asia', { alias: ['República Popular China'], capAlias: ['Beijing'] }),
  p('PRK', 'Corea del Norte', 'Pionyang', 'asia', { capAlias: ['Pyongyang'] }),
  p('KOR', 'Corea del Sur', 'Seúl', 'asia'),
  p('ARE', 'Emiratos Árabes Unidos', 'Abu Dabi', 'asia', { alias: ['Emiratos Árabes', 'Emiratos', 'EAU'], capAlias: ['Abu Dhabi'] }),
  p('PHL', 'Filipinas', 'Manila', 'asia'),
  p('GEO', 'Georgia', 'Tiflis', 'asia', {
    tambien: ['europa'],
    continentes: ['asia', 'europa', 'europa-asia'],
    capAlias: ['Tbilisi'],
  }),
  p('IND', 'India', 'Nueva Delhi', 'asia', { alias: ['La India'], capAlias: ['Delhi'] }),
  p('IDN', 'Indonesia', 'Yakarta', 'asia', {
    capAlias: ['Jakarta'],
    nota: 'Está construyendo una nueva capital, Nusantara, en la isla de Borneo; de momento sigue siendo Yakarta.',
  }),
  p('IRQ', 'Irak', 'Bagdad', 'asia', { alias: ['Iraq'] }),
  p('IRN', 'Irán', 'Teherán', 'asia'),
  p('ISR', 'Israel', 'Jerusalén', 'asia', {
    capAlias: ['Tel Aviv'],
    nota: 'Israel considera Jerusalén su capital; la mayoría de los países mantiene sus embajadas en Tel Aviv.',
  }),
  p('JPN', 'Japón', 'Tokio', 'asia'),
  p('JOR', 'Jordania', 'Amán', 'asia', { capAlias: ['Ammán'] }),
  p('KAZ', 'Kazajistán', 'Astaná', 'asia', {
    continentes: ['asia', 'europa-asia'],
    alias: ['Kazajstán', 'Kazakstán'],
    capAlias: ['Nursultán', 'Nur-Sultán'],
  }),
  p('KGZ', 'Kirguistán', 'Biskek', 'asia', { alias: ['Kirguizistán', 'Kirguisia'], capAlias: ['Bishkek'] }),
  p('KWT', 'Kuwait', 'Kuwait', 'asia', { capAlias: ['Ciudad de Kuwait'] }),
  p('LAO', 'Laos', 'Vientián', 'asia', { capAlias: ['Vientiane'] }),
  p('LBN', 'Líbano', 'Beirut', 'asia', { alias: ['El Líbano'] }),
  p('MYS', 'Malasia', 'Kuala Lumpur', 'asia', {
    nota: 'Kuala Lumpur es la capital; la sede administrativa del Gobierno está en Putrajaya.',
  }),
  p('MDV', 'Maldivas', 'Malé', 'asia', { alias: ['Islas Maldivas'] }),
  p('MNG', 'Mongolia', 'Ulán Bator', 'asia', { capAlias: ['Ulaanbaatar'] }),
  p('MMR', 'Myanmar', 'Naipyidó', 'asia', { alias: ['Birmania'], capAlias: ['Naypyidaw', 'Naipyidaw', 'Nay Pyi Taw'] }),
  p('NPL', 'Nepal', 'Katmandú', 'asia'),
  p('OMN', 'Omán', 'Mascate', 'asia'),
  p('PAK', 'Pakistán', 'Islamabad', 'asia'),
  p('PSE', 'Palestina', 'Ramala', 'asia', {
    alias: ['Estado de Palestina', 'Territorios Palestinos'],
    capAlias: ['Ramallah', 'Jerusalén Este'],
    nota: 'Estado observador de la ONU. Reclama Jerusalén Este como capital; su Gobierno tiene la sede en Ramala.',
  }),
  p('QAT', 'Catar', 'Doha', 'asia', { alias: ['Qatar'] }),
  p('SGP', 'Singapur', 'Singapur', 'asia', { nota: 'Es una ciudad-Estado: el país y la capital son lo mismo.' }),
  p('SYR', 'Siria', 'Damasco', 'asia'),
  p('LKA', 'Sri Lanka', 'Sri Jayawardenapura Kotte', 'asia', {
    alias: ['Ceilán'],
    capAlias: ['Kotte', 'Colombo'],
    nota: 'La capital oficial es Sri Jayawardenapura Kotte; Colombo es la ciudad más grande y la capital económica.',
  }),
  p('THA', 'Tailandia', 'Bangkok', 'asia'),
  p('TWN', 'Taiwán', 'Taipéi', 'asia', {
    alias: ['Taiwan', 'República de China'],
    capAlias: ['Taipei'],
    nota: 'Tiene Gobierno propio, pero China lo considera parte de su territorio y muy pocos países lo reconocen oficialmente como Estado.',
  }),
  p('TJK', 'Tayikistán', 'Dusambé', 'asia', { capAlias: ['Dushanbé', 'Dushanbe'] }),
  p('TLS', 'Timor Oriental', 'Dili', 'asia', { alias: ['Timor-Leste', 'Timor Leste', 'Timor Este'] }),
  p('TKM', 'Turkmenistán', 'Asjabad', 'asia', { capAlias: ['Ashgabat', 'Asjabat'] }),
  p('TUR', 'Turquía', 'Ankara', 'asia', {
    tambien: ['europa'],
    continentes: ['europa-asia'],
    nota: 'Se reparte entre Asia y Europa. Su ciudad más grande, Estambul, no es la capital.',
  }),
  p('UZB', 'Uzbekistán', 'Taskent', 'asia', { capAlias: ['Tashkent'] }),
  p('VNM', 'Vietnam', 'Hanói', 'asia', { alias: ['Viet Nam'] }),
  p('YEM', 'Yemen', 'Saná', 'asia'),

  // ───────────────────────────── África ─────────────────────────────
  p('DZA', 'Argelia', 'Argel', 'africa'),
  p('AGO', 'Angola', 'Luanda', 'africa'),
  p('BEN', 'Benín', 'Porto Novo', 'africa', {
    capAlias: ['Porto-Novo'],
    nota: 'Porto Novo es la capital oficial; el Gobierno tiene su sede en Cotonú.',
  }),
  p('BWA', 'Botsuana', 'Gaborone', 'africa', { alias: ['Botswana'] }),
  p('BFA', 'Burkina Faso', 'Uagadugú', 'africa', { capAlias: ['Ouagadougou'] }),
  p('BDI', 'Burundi', 'Gitega', 'africa', {
    capAlias: ['Buyumbura', 'Bujumbura'],
    nota: 'Gitega es la capital política desde 2019; Buyumbura sigue siendo la capital económica.',
  }),
  p('CPV', 'Cabo Verde', 'Praia', 'africa'),
  p('CMR', 'Camerún', 'Yaundé', 'africa'),
  p('TCD', 'Chad', 'Yamena', 'africa', { capAlias: ["N'Djamena", 'Ndjamena'] }),
  p('COM', 'Comoras', 'Moroni', 'africa', { alias: ['Islas Comoras'] }),
  p('COG', 'República del Congo', 'Brazzaville', 'africa', { alias: ['Congo', 'Congo Brazzaville', 'Congo-Brazzaville'] }),
  p('COD', 'República Democrática del Congo', 'Kinsasa', 'africa', {
    alias: ['RD del Congo', 'RD Congo', 'RDC', 'Congo Kinsasa', 'Congo-Kinshasa', 'Congo Democrático'],
    capAlias: ['Kinshasa'],
  }),
  p('CIV', 'Costa de Marfil', 'Yamusukro', 'africa', {
    alias: ["Côte d'Ivoire", 'Cote d Ivoire'],
    capAlias: ['Yamoussoukro', 'Abiyán'],
    nota: 'Yamusukro es la capital oficial; Abiyán es la ciudad más grande y la capital económica.',
  }),
  p('EGY', 'Egipto', 'El Cairo', 'africa', { capAlias: ['Cairo'] }),
  p('ERI', 'Eritrea', 'Asmara', 'africa'),
  p('SWZ', 'Esuatini', 'Mbabane', 'africa', {
    alias: ['Suazilandia', 'Eswatini', 'Swazilandia'],
    capAlias: ['Lobamba'],
    nota: 'Hasta 2018 se llamaba Suazilandia. Mbabane es la capital administrativa y Lobamba, la legislativa.',
  }),
  p('ETH', 'Etiopía', 'Adís Abeba', 'africa', { capAlias: ['Addis Abeba'] }),
  p('GAB', 'Gabón', 'Libreville', 'africa'),
  p('GMB', 'Gambia', 'Banjul', 'africa'),
  p('GHA', 'Ghana', 'Acra', 'africa', { capAlias: ['Accra'] }),
  p('GIN', 'Guinea', 'Conakri', 'africa', { alias: ['Guinea Conakri', 'Guinea-Conakri'], capAlias: ['Conakry'] }),
  p('GNB', 'Guinea-Bisáu', 'Bisáu', 'africa', { alias: ['Guinea Bisáu', 'Guinea-Bissau', 'Guinea Bissau'], capAlias: ['Bissau'] }),
  p('GNQ', 'Guinea Ecuatorial', 'Ciudad de la Paz', 'africa', {
    capAlias: ['Malabo'],
    capNota: 'hasta 2026, Malabo',
    nota: 'En enero de 2026 designó oficialmente como capital Ciudad de la Paz, en el continente, en lugar de Malabo (en la isla de Bioko); el traslado se hace poco a poco. Muchos libros todavía indican Malabo.',
  }),
  p('KEN', 'Kenia', 'Nairobi', 'africa', { alias: ['Kenya'] }),
  p('LSO', 'Lesoto', 'Maseru', 'africa', { alias: ['Lesotho'] }),
  p('LBR', 'Liberia', 'Monrovia', 'africa'),
  p('LBY', 'Libia', 'Trípoli', 'africa'),
  p('MDG', 'Madagascar', 'Antananarivo', 'africa'),
  p('MWI', 'Malaui', 'Lilongüe', 'africa', { alias: ['Malawi'], capAlias: ['Lilongwe'] }),
  p('MLI', 'Malí', 'Bamako', 'africa', { alias: ['Mali'] }),
  p('MAR', 'Marruecos', 'Rabat', 'africa'),
  p('MUS', 'Mauricio', 'Port Louis', 'africa', { alias: ['Isla Mauricio', 'Islas Mauricio'] }),
  p('MRT', 'Mauritania', 'Nuakchot', 'africa', { capAlias: ['Nouakchott'] }),
  p('MOZ', 'Mozambique', 'Maputo', 'africa'),
  p('NAM', 'Namibia', 'Windhoek', 'africa', { capAlias: ['Windhuk'] }),
  p('NER', 'Níger', 'Niamey', 'africa'),
  p('NGA', 'Nigeria', 'Abuya', 'africa', { capAlias: ['Abuja'] }),
  p('CAF', 'República Centroafricana', 'Bangui', 'africa', { alias: ['Centroáfrica', 'RCA'] }),
  p('RWA', 'Ruanda', 'Kigali', 'africa', { alias: ['Rwanda'] }),
  p('STP', 'Santo Tomé y Príncipe', 'Santo Tomé', 'africa', { alias: ['São Tomé y Príncipe', 'Sao Tomé y Príncipe'], capAlias: ['São Tomé'] }),
  p('SEN', 'Senegal', 'Dakar', 'africa'),
  p('SYC', 'Seychelles', 'Victoria', 'africa', { alias: ['Islas Seychelles'] }),
  p('SLE', 'Sierra Leona', 'Freetown', 'africa'),
  p('SOM', 'Somalia', 'Mogadiscio', 'africa'),
  p('ZAF', 'Sudáfrica', 'Pretoria', 'africa', {
    alias: ['República Sudafricana', 'África del Sur'],
    capAlias: ['Ciudad del Cabo', 'Bloemfontein'],
    nota: 'Tiene tres capitales: Pretoria (ejecutiva), Ciudad del Cabo (legislativa) y Bloemfontein (judicial).',
  }),
  p('SDN', 'Sudán', 'Jartum', 'africa'),
  p('SSD', 'Sudán del Sur', 'Yuba', 'africa', {
    capAlias: ['Juba'],
    nota: 'Es el país más joven del mundo: se independizó de Sudán en 2011.',
  }),
  p('TZA', 'Tanzania', 'Dodoma', 'africa', {
    capAlias: ['Dar es Salaam'],
    nota: 'Dodoma es la capital oficial; Dar es Salaam es la ciudad más grande.',
  }),
  p('TGO', 'Togo', 'Lomé', 'africa'),
  p('TUN', 'Túnez', 'Túnez', 'africa', { capAlias: ['Ciudad de Túnez'] }),
  p('UGA', 'Uganda', 'Kampala', 'africa'),
  p('DJI', 'Yibuti', 'Yibuti', 'africa', { alias: ['Djibouti'], capAlias: ['Ciudad de Yibuti'] }),
  p('ZMB', 'Zambia', 'Lusaka', 'africa'),
  p('ZWE', 'Zimbabue', 'Harare', 'africa', { alias: ['Zimbabwe'] }),

  // ─────────────────────── América del Norte ────────────────────────
  p('CAN', 'Canadá', 'Ottawa', 'am-norte'),
  p('USA', 'Estados Unidos', 'Washington D. C.', 'am-norte', {
    alias: ['Estados Unidos de América', 'EE. UU.', 'EEUU', 'EE UU', 'USA', 'EUA'],
    capAlias: ['Washington', 'Washington DC'],
  }),
  p('MEX', 'México', 'Ciudad de México', 'am-norte', { alias: ['Méjico'], capAlias: ['México', 'México D. F.', 'CDMX'] }),

  // ───────────────────────── América Central ────────────────────────
  p('BLZ', 'Belice', 'Belmopán', 'am-central'),
  p('CRI', 'Costa Rica', 'San José', 'am-central'),
  p('SLV', 'El Salvador', 'San Salvador', 'am-central', { alias: ['Salvador'] }),
  p('GTM', 'Guatemala', 'Ciudad de Guatemala', 'am-central', { capAlias: ['Guatemala'] }),
  p('HND', 'Honduras', 'Tegucigalpa', 'am-central'),
  p('NIC', 'Nicaragua', 'Managua', 'am-central'),
  p('PAN', 'Panamá', 'Ciudad de Panamá', 'am-central', { capAlias: ['Panamá'] }),

  // ───────────────────────────── Caribe ─────────────────────────────
  p('ATG', 'Antigua y Barbuda', "Saint John's", 'am-caribe', { capAlias: ['Saint Johns', 'St. John’s', 'San Juan'] }),
  p('BHS', 'Bahamas', 'Nasáu', 'am-caribe', { alias: ['Las Bahamas'], capAlias: ['Nassau'] }),
  p('BRB', 'Barbados', 'Bridgetown', 'am-caribe'),
  p('CUB', 'Cuba', 'La Habana', 'am-caribe', { capAlias: ['Habana'] }),
  p('DMA', 'Dominica', 'Roseau', 'am-caribe'),
  p('GRD', 'Granada', "Saint George's", 'am-caribe', { alias: ['Grenada'], capAlias: ['Saint Georges', 'St. George’s'] }),
  p('HTI', 'Haití', 'Puerto Príncipe', 'am-caribe', { capAlias: ['Port-au-Prince'] }),
  p('JAM', 'Jamaica', 'Kingston', 'am-caribe'),
  p('DOM', 'República Dominicana', 'Santo Domingo', 'am-caribe'),
  p('KNA', 'San Cristóbal y Nieves', 'Basseterre', 'am-caribe', { alias: ['Saint Kitts y Nevis', 'San Cristóbal y Nevis'] }),
  p('VCT', 'San Vicente y las Granadinas', 'Kingstown', 'am-caribe', { alias: ['San Vicente y Granadinas', 'San Vicente'] }),
  p('LCA', 'Santa Lucía', 'Castries', 'am-caribe'),
  p('TTO', 'Trinidad y Tobago', 'Puerto España', 'am-caribe', { alias: ['Trinidad y Tabago'], capAlias: ['Port of Spain'] }),

  // ───────────────────────── América del Sur ────────────────────────
  p('ARG', 'Argentina', 'Buenos Aires', 'am-sur'),
  p('BOL', 'Bolivia', 'Sucre', 'am-sur', {
    capAlias: ['La Paz'],
    capNota: 'sede del Gobierno: La Paz',
    nota: 'Sucre es la capital constitucional; el Gobierno y el Parlamento tienen su sede en La Paz.',
  }),
  p('BRA', 'Brasil', 'Brasilia', 'am-sur'),
  p('CHL', 'Chile', 'Santiago', 'am-sur', { capAlias: ['Santiago de Chile'] }),
  p('COL', 'Colombia', 'Bogotá', 'am-sur'),
  p('ECU', 'Ecuador', 'Quito', 'am-sur'),
  p('GUY', 'Guyana', 'Georgetown', 'am-sur'),
  p('PRY', 'Paraguay', 'Asunción', 'am-sur'),
  p('PER', 'Perú', 'Lima', 'am-sur'),
  p('SUR', 'Surinam', 'Paramaribo', 'am-sur', { alias: ['Suriname'] }),
  p('URY', 'Uruguay', 'Montevideo', 'am-sur'),
  p('VEN', 'Venezuela', 'Caracas', 'am-sur'),

  // ───────────────────────────── Oceanía ────────────────────────────
  p('AUS', 'Australia', 'Canberra', 'oceania'),
  p('FJI', 'Fiyi', 'Suva', 'oceania', { alias: ['Fiji', 'Islas Fiyi'] }),
  p('MHL', 'Islas Marshall', 'Majuro', 'oceania', { alias: ['Marshall'] }),
  p('SLB', 'Islas Salomón', 'Honiara', 'oceania', { alias: ['Salomón'] }),
  p('KIR', 'Kiribati', 'Tarawa', 'oceania', { capAlias: ['Tarawa Sur', 'Bairiki'] }),
  p('FSM', 'Micronesia', 'Palikir', 'oceania', { alias: ['Estados Federados de Micronesia'] }),
  p('NRU', 'Nauru', 'Yaren', 'oceania', {
    nota: 'No tiene capital oficial: el Gobierno se reúne en el distrito de Yaren.',
  }),
  p('NZL', 'Nueva Zelanda', 'Wellington', 'oceania', { alias: ['Nueva Zelandia'] }),
  p('PLW', 'Palaos', 'Ngerulmud', 'oceania', { alias: ['Palau'], capAlias: ['Melekeok'] }),
  p('PNG', 'Papúa Nueva Guinea', 'Puerto Moresby', 'oceania', { alias: ['Papúa-Nueva Guinea', 'Papua Nueva Guinea'], capAlias: ['Port Moresby'] }),
  p('WSM', 'Samoa', 'Apia', 'oceania'),
  p('TON', 'Tonga', 'Nukualofa', 'oceania', { capAlias: ["Nuku'alofa", 'Nuku alofa'] }),
  p('TUV', 'Tuvalu', 'Funafuti', 'oceania'),
  p('VUT', 'Vanuatu', 'Port Vila', 'oceania', { capAlias: ['Port-Vila'] }),
];

/**
 * Territorios que se ven en el mapa pero no entran en los cuestionarios.
 * `de`: país del que dependen (ISO3) · `disputa`: reconocimiento limitado o en disputa.
 */
export const TERRITORIOS = {
  GRL: { nombre: 'Groenlandia', de: 'DNK' },
  FRO: { nombre: 'Islas Feroe', de: 'DNK' },
  PRI: { nombre: 'Puerto Rico', de: 'USA' },
  VIR: { nombre: 'Islas Vírgenes de los Estados Unidos', de: 'USA' },
  GUM: { nombre: 'Guam', de: 'USA' },
  MNP: { nombre: 'Islas Marianas del Norte', de: 'USA' },
  ASM: { nombre: 'Samoa Americana', de: 'USA' },
  BMU: { nombre: 'Bermudas', de: 'GBR' },
  CYM: { nombre: 'Islas Caimán', de: 'GBR' },
  TCA: { nombre: 'Islas Turcas y Caicos', de: 'GBR' },
  VGB: { nombre: 'Islas Vírgenes Británicas', de: 'GBR' },
  AIA: { nombre: 'Anguila', de: 'GBR' },
  MSR: { nombre: 'Montserrat', de: 'GBR' },
  FLK: { nombre: 'Islas Malvinas', de: 'GBR', disputa: 'Territorio británico reclamado por Argentina.' },
  SGS: { nombre: 'Islas Georgias del Sur y Sandwich del Sur', de: 'GBR' },
  SHN: { nombre: 'Santa Elena', de: 'GBR' },
  PCN: { nombre: 'Islas Pitcairn', de: 'GBR' },
  IOT: { nombre: 'Territorio Británico del Océano Índico', de: 'GBR' },
  JEY: { nombre: 'Jersey', de: 'GBR' },
  GGY: { nombre: 'Guernsey', de: 'GBR' },
  IMN: { nombre: 'Isla de Man', de: 'GBR' },
  ABW: { nombre: 'Aruba', de: 'NLD' },
  CUW: { nombre: 'Curazao', de: 'NLD' },
  SXM: { nombre: 'Sint Maarten', de: 'NLD' },
  SPM: { nombre: 'San Pedro y Miquelón', de: 'FRA' },
  MAF: { nombre: 'San Martín', de: 'FRA' },
  BLM: { nombre: 'San Bartolomé', de: 'FRA' },
  NCL: { nombre: 'Nueva Caledonia', de: 'FRA' },
  PYF: { nombre: 'Polinesia Francesa', de: 'FRA' },
  WLF: { nombre: 'Wallis y Futuna', de: 'FRA' },
  ATF: { nombre: 'Tierras Australes y Antárticas Francesas', de: 'FRA' },
  ALA: { nombre: 'Islas Åland', de: 'FIN' },
  HKG: { nombre: 'Hong Kong', de: 'CHN' },
  MAC: { nombre: 'Macao', de: 'CHN' },
  COK: { nombre: 'Islas Cook', de: 'NZL' },
  NIU: { nombre: 'Niue', de: 'NZL' },
  NFK: { nombre: 'Isla Norfolk', de: 'AUS' },
  HMD: { nombre: 'Islas Heard y McDonald', de: 'AUS' },
  ATA: { nombre: 'Antártida', disputa: 'Continente sin países: lo regula el Tratado Antártico.' },
  ESH: { nombre: 'Sáhara Occidental', disputa: 'Territorio pendiente de descolonización según la ONU.' },
  XSG: { nombre: 'Glaciar de Siachen', disputa: 'Zona de Cachemira disputada entre la India y Pakistán.' },
};

/** Etiquetas y encuadres de cada región (oeste, sur, este, norte en grados). */
export const REGIONES = {
  europa: { nombre: 'Europa', marco: [-24, 34, 48, 71] },
  asia: { nombre: 'Asia', marco: [28, -10, 148, 74] },
  africa: { nombre: 'África', marco: [-19, -35, 52, 38] },
  'am-norte': { nombre: 'América del Norte', marco: [-165, 14, -52, 72] },
  'am-central': { nombre: 'América Central', marco: [-93, 6, -76, 19] },
  'am-caribe': { nombre: 'Caribe', marco: [-86, 9, -58, 28] },
  'am-sur': { nombre: 'América del Sur', marco: [-82, -56, -34, 13] },
  oceania: { nombre: 'Oceanía', marco: [112, -48, 180, 16] },
};

/** Continentes del reto «¿En qué continente está…?», en el orden en que se ofrecen. */
export const CONTINENTES = {
  europa: 'Europa',
  asia: 'Asia',
  africa: 'África',
  america: 'América',
  oceania: 'Oceanía',
  'europa-asia': 'Europa y Asia',
};

/** Continente al que pertenece cada región. */
export const CONTINENTE_DE = {
  europa: 'europa',
  asia: 'asia',
  africa: 'africa',
  'am-norte': 'america',
  'am-central': 'america',
  'am-caribe': 'america',
  'am-sur': 'america',
  oceania: 'oceania',
};
