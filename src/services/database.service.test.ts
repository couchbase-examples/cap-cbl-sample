import { vi } from 'vitest';

const { calls } = vi.hoisted(() => ({
  calls: { open: 0, replicatorStart: 0, failOpen: false },
}));

vi.mock('cbl-ionic', () => {
  class Database {
    static setLogLevel = vi.fn().mockResolvedValue(undefined);
    constructor(_name: string, _config: unknown) {}
    async open() {
      calls.open++;
      if (calls.failOpen) throw new Error('open failed');
    }
    async collections() { return [{}, {}]; }
    async collection() { return {}; }
    async getPath() { return '/tmp/travel'; }
  }
  class Replicator {
    static create = vi.fn(async () => new Replicator());
    async start() { calls.replicatorStart++; }
  }
  class ReplicatorConfiguration {
    addCollection() {}
    setAuthenticator() {}
    setContinuous() {}
    setAcceptOnlySelfSignedCerts() {}
  }
  return {
    CapacitorEngine: class {},
    Database,
    DatabaseConfiguration: class { setDirectory() {} setEncryptionKey() {} },
    FileSystem: class { async getDefaultPath() { return '/tmp'; } },
    LogDomain: { ALL: 'ALL' },
    LogLevel: { DEBUG: 0 },
    MutableDocument: class {},
    Query: class {},
    URLEndpoint: class {},
    BasicAuthenticator: class {},
    ReplicatorConfiguration,
    Replicator,
  };
});

import { DatabaseService } from './database.service';

beforeEach(() => {
  calls.open = 0;
  calls.replicatorStart = 0;
  calls.failOpen = false;
});

test('initializeDatabase opens the database and starts replication once for concurrent and repeated calls', async () => {
  const service = new DatabaseService();
  const first = service.initializeDatabase();
  const second = service.initializeDatabase();
  expect(second).toBe(first);
  await Promise.all([first, second]);
  await service.initializeDatabase();

  expect(calls.open).toBe(1);
  expect(calls.replicatorStart).toBe(1);
});

test('a failed initialization is not cached, so a retry runs again', async () => {
  const service = new DatabaseService();
  calls.failOpen = true;
  await expect(service.initializeDatabase()).rejects.toThrow('open failed');

  calls.failOpen = false;
  await service.initializeDatabase();
  expect(calls.open).toBe(2);
  expect(calls.replicatorStart).toBe(1);
});
