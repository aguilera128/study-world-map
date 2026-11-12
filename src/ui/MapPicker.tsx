import { useApp } from '../app/store';
import type { MapId } from '../atlas/types';
import { COUNTRY_IDS } from '../game/countryMaps';
import { isCountryMap, MAPS } from '../game/maps';
import { LOCALE, t } from '../i18n';
import { Icon } from './Icon';
import { Segmented } from './primitives';

// Los países, por orden alfabético en el idioma de la página.
const COUNTRIES = [...COUNTRY_IDS].sort((a, b) => MAPS[a].title.localeCompare(MAPS[b].title, LOCALE));

/**
 * Elegir mapa: el mundo, un país por sus subdivisiones o la geografía física. Los países no caben
 * en una fila: se enseña uno (el último que se abrió o el del visitante; si no se sabe, «País» a
 * secas, que abre el primero) y, con él abierto, un desplegable para cambiar.
 */
export function MapPicker({ className = '', onChange }: { className?: string; onChange: (map: MapId) => void }) {
  const map = useApp((s) => s.atlas!.map);
  const country = useApp((s) => s.country);
  const option = (id: MapId, title = MAPS[id].title) => ({
    value: id,
    label: (
      <>
        <Icon name={id === 'world' ? 'globe' : 'map'} size={16} />
        {title}
      </>
    ),
  });
  return (
    <div className={className}>
      <Segmented
        label={t('Mapa')}
        // en el móvil, los tres mapas en una fila que se desliza, no en dos
        className="flex-nowrap! overflow-x-auto wide:flex-wrap! wide:overflow-visible [scrollbar-width:none] [&>*]:shrink-0"
        value={map}
        onChange={onChange}
        options={[option('world'), country ? option(country) : option(COUNTRIES[0], t('País')), option('fisico')]}
      />
      {isCountryMap(map) && COUNTRIES.length > 1 && (
        <label className="mt-2 flex max-w-[26rem] items-center gap-2.5 text-sm font-semibold text-ink-soft">
          {t('País')}
          <select
            value={map}
            onChange={(e) => onChange(e.target.value as MapId)}
            className="min-h-9 min-w-0 flex-1 rounded-[10px] border border-rule-strong bg-surface px-2.5 font-semibold text-ink outline-none focus:border-ink"
          >
            {COUNTRIES.map((id) => (
              <option key={id} value={id}>
                {MAPS[id].title}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
