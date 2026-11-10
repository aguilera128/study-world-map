// 中文（简体）: textos de las páginas de temas (scripts/build-pages.mjs). Mismas claves que es.mjs.
// Las direcciones van en alfabeto latino, como en ../idiomas/zh.mjs.

export default {
  slug: {
    rios: 'rivers-and-lakes-of-the-world',
    montanas: 'mountain-ranges-and-peaks-of-the-world',
    mares: 'oceans-seas-and-straits',
    tierras: 'deserts-peninsulas-and-islands',
    climas: 'climates-of-the-world',
    poblacion: 'most-populous-countries',
    tierra: 'layers-of-the-earth',
    atmosfera: 'layers-of-the-atmosphere',
  },

  comun: {
    // Miga de pan e índice
    juegos: '游戏',
    todos: '全部游戏和主题',
    indiceFisico: '自然地理、气候和人口',
    indicePlaneta: '地球',
    // Datos estructurados
    recurso: '教育游戏',
    nivel: '中小学教育',
    // Portada: título de la lista de enlaces a estas páginas
    portada: '可以学什么',
    // Tablas
    nombre: '名称',
    altitud: '海拔',
    pais: '国家',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `共 ${n} 个地点，都是自然地理课程中常见的内容。游戏会更多地问你答错的地方，直到你记住为止。`,
    cta: (que) => `开始：找出${que} →`,
    fuente: '位置和海拔数据来自 Natural Earth（公有领域），并经过核对修正。',
    rios: {
      h1: '世界河流和湖泊：地图游戏',
      enlace: '河流和湖泊',
      description: '中小学地理要学的河流和湖泊，配有免费游戏，可在带地形的互动地图上找出它们。无需注册，没有广告。',
      secciones: { rio: '河流', lago: '湖泊' },
    },
    montanas: {
      h1: '世界山脉和山峰：地图游戏',
      enlace: '山脉和山峰',
      description: '中小学地理要学的山脉和山峰，附海拔，配有免费游戏，可在带地形的互动地图上找出它们。',
      secciones: { cordillera: '山脉', pico: '山峰' },
    },
    mares: {
      h1: '大洋、海和海峡：地图游戏',
      enlace: '大洋、海和海峡',
      description: '地理课程中的五大洋以及海、海湾和海峡，配有免费游戏，可在互动地图上找出它们。',
      secciones: { oceano: '大洋', mar: '海', golfo: '海湾', estrecho: '海峡和运河' },
    },
    tierras: {
      h1: '沙漠、平原、半岛和岛屿：地图游戏',
      enlace: '沙漠、半岛和岛屿',
      description: '自然地理课程中的沙漠、高原、平原、半岛和岛屿，配有免费游戏，可在互动地图上找出它们。',
      secciones: { desierto: '沙漠', llanura: '高原和平原', peninsula: '半岛和海角', isla: '岛屿和群岛' },
    },
  },

  // ── climas ──
  climas: {
    h1: '世界各国气候：列表和游戏',
    enlace: '世界气候',
    description: (n) => `每个国家是什么气候：赤道、热带、沙漠、地中海、海洋性、大陆性还是极地气候？${n} 个国家的列表和免费地图游戏。`,
    cta: '开始：它是什么气候？ →',
    intro: '中学地理要学的十种气候，按冷暖分为三组：炎热地区（赤道气候、热带气候、沙漠气候和半干旱气候）、温和地区（地中海气候、海洋性气候、亚热带湿润气候和大陆性气候）和寒冷地区（极地气候和高山气候）。',
    h2: '各国气候',
    cuenta: (n) => `${n} 个国家`,
    nota: '每个国家列出其主要气候，按在国土上的分布范围从大到小排列。',
    columna: '气候',
    fuente: '根据柯本—盖格世界气候分类图（Kottek 等，2006）计算，并将其类型归并为课堂上讲授的气候类型。',
  },

  // ── población ──
  poblacion: {
    h1: '世界人口最多的国家：列表和游戏',
    enlace: '人口最多的国家',
    description: (year) => `世界各国按人口排序（${year} 年），附人口密度（人/km²），还有比一比哪个国家人口更多的免费游戏。`,
    cta: '开始：哪个国家人口最多？ →',
    h2: '各国人口和人口密度',
    cuenta: (n) => `${n} 个国家`,
    nota: '人口密度是每平方千米的人口数：它说明一个国家相对于其面积而言人口是多还是少。',
    habitantes: (year) => `人口（${year} 年）`,
    densidad: '密度',
    unidad: '人/km²',
    fuente: '人口：世界银行（指标 SP.POP.TOTL），CC BY 4.0。面积：mledoze/countries。',
  },

  // ── capas de la Tierra ── (los nombres y datos de cada capa salen del diccionario de la aplicación)
  tierra: {
    h1: '地球内部圈层：地壳、地幔和地核',
    enlace: '地球内部圈层',
    description: '地球内部的各个圈层及其不连续面，附深度、组成和温度，还有一个可以打开来观察内部的 3D 地球仪。',
    cta: '打开地图，点击“地球” →',
    h2: '各圈层，由外到内',
    capa: '圈层',
    como: '特征和深度范围',
    discontinuidades: '不连续面是分隔相邻两个圈层的界面。',
    discontinuidad: '不连续面',
    separa: '分隔什么',
    zona: '区域',
    que: '是什么',
    fuente: '深度：USGS、IGN 和 PREM 模型。温度是根据实验和模型得出的估计值（Katsura 2022；Anzellini 等 2013）：不同研究之间相差数百度。',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: '大气的垂直分层：从对流层到散逸层',
    enlace: '大气的垂直分层',
    description: '大气的五个分层，附高度和各层发生的现象（天气、臭氧层、流星、极光），还有一个 3D 地球仪可以直观查看。',
    cta: '打开地图，点击“地球” →',
    h2: '各层，由地面向上',
    capa: '分层',
    altura: '高度和层内现象',
    nota: '高度为近似值：各层的界限随纬度和季节变化。来源：NASA。',
  },
};
