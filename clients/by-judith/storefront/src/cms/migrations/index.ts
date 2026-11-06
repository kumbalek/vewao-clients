import * as migration_20261016_132509_initial from './20261016_132509_initial';
import * as migration_20261022_144915_magazin from './20261022_144915_magazin';
import * as migration_20261104_225908_procedures from './20261104_225908_procedures';

export const migrations = [
  {
    up: migration_20261016_132509_initial.up,
    down: migration_20261016_132509_initial.down,
    name: '20261016_132509_initial',
  },
  {
    up: migration_20261022_144915_magazin.up,
    down: migration_20261022_144915_magazin.down,
    name: '20261022_144915_magazin',
  },
  {
    up: migration_20261104_225908_procedures.up,
    down: migration_20261104_225908_procedures.down,
    name: '20261104_225908_procedures'
  },
];
