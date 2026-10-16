import * as migration_20261016_132509_initial from './20261016_132509_initial';

export const migrations = [
  {
    up: migration_20261016_132509_initial.up,
    down: migration_20261016_132509_initial.down,
    name: '20261016_132509_initial'
  },
];
