import type { AnswerKind, ModeId } from '../game/config';
import type { IconName } from './Icon';

export const MODE_ICONS: Record<ModeId, IconName> = {
  locate: 'pin',
  continent: 'continents',
  name: 'tag',
  capital: 'star',
  flag: 'flag',
  climate: 'thermo',
};

export const ANSWER_ICONS: Record<AnswerKind, IconName> = { map: 'pin', choice: 'options', guided: 'eye', type: 'keyboard' };
