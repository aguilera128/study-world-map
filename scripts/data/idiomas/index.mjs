// Un fichero por idioma con todo lo que los scripts necesitan de él:
//   locale, intl, nombre       códigos de idioma (Open Graph, Intl) y cómo se llama a sí mismo
//   ruta, zonas, retos, pie, paises, juego   textos de las páginas estáticas (scripts/build-pages.mjs)
//   index                      traducción de los textos de index.html, en el orden de es.mjs
//   y                          conjunción que sustituye al «&» de los nombres de CLDR
//   nombres                    regiones, continentes y, por país: correcciones, alias y notas
//                              (scripts/build-atlas.mjs; el español está en ../paises.mjs)
//
// De dónde sale el nombre de cada país y capital en un idioma:
//   · país     → la base de nombres de Node (Intl.DisplayNames, CLDR), salvo `nombre`
//   · capital  → ../capitales.wikidata.json (scripts/fetch-capitals.mjs), salvo `capital`
// Cada entrada de `nombres.paises` puede llevar:
//   nombre    nombre habitual, si el de CLDR no vale       alias     otros nombres aceptados al escribir
//   capital   capital, si la de Wikidata no vale           capAlias  otros nombres aceptados para la capital
//   capNota   aclaración breve junto a la capital          nota      dato de la ficha (o de un territorio)
//
// Para añadir un idioma: copiar en.mjs, traducirlo y darlo de alta aquí (y ver «Idiomas» en el README).

import en from './en.mjs';
import es from './es.mjs';
import it from './it.mjs';
import de from './de.mjs';
import fr from './fr.mjs';

export const IDIOMAS = { es, en, fr, de, it };
