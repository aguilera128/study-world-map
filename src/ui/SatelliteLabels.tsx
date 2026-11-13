import { useStations, type StationId } from '../app/satellites';
import type { MapEngine } from '../engine/MapEngine';
import { SAT_COLORS } from '../satellites/format';
import { t } from '../i18n';
import { Tracked } from './RealTime';

const NAMES: Record<StationId, string> = {
  iss: t('Estación Espacial Internacional'),
  tiangong: t('Estación espacial Tiangong'),
};

/** Rótulos de las estaciones espaciales, sobre su punto: el motor los mueve con el mapa y ellos siguen a la estación. */
export function SatelliteLabels({ engine }: { engine: MapEngine }) {
  const stations = useStations();
  return (
    <>
      {(Object.keys(NAMES) as StationId[]).map((id) => {
        const at = stations[id];
        return (
          at && (
            <Tracked key={id} engine={engine} lon={at.lon} lat={at.lat} alt={at.alt}>
              <span
                className="block -translate-y-3.5 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-semibold text-ink shadow-[0_4px_10px_-6px_rgb(var(--shadow)/0.7)]"
                style={{ background: 'color-mix(in srgb, var(--surface) 88%, transparent)', borderLeft: `3px solid ${SAT_COLORS.estaciones}` }}
              >
                {NAMES[id]}
              </span>
            </Tracked>
          )
        );
      })}
    </>
  );
}
