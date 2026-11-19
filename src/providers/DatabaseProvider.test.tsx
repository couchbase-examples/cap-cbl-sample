import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const { instances } = vi.hoisted(() => ({ instances: [] as any[] }));

vi.mock('../services/database.service', () => ({
  DatabaseService: vi.fn().mockImplementation(function (this: any) {
    this.initializeDatabase = vi.fn().mockResolvedValue(undefined);
    instances.push(this);
  }),
}));

import DatabaseProvider from './DatabaseProvider';
import DatabaseContext from './DatabaseContext';

const Consumer: React.FC = () => {
  const ctx = useContext(DatabaseContext)!;
  return <div>ready:{instances.indexOf(ctx.databaseService)}</div>;
};

beforeEach(() => {
  instances.length = 0;
});

test('creates and initializes exactly one DatabaseService across re-renders', async () => {
  const { rerender } = render(
    <DatabaseProvider>
      <Consumer />
    </DatabaseProvider>
  );
  await screen.findByText('ready:0');
  rerender(
    <DatabaseProvider>
      <Consumer />
    </DatabaseProvider>
  );
  await screen.findByText('ready:0');

  expect(instances).toHaveLength(1);
  expect(instances[0].initializeDatabase).toHaveBeenCalledTimes(1);
});

test('StrictMode: only the service exposed via context is initialized', async () => {
  render(
    <React.StrictMode>
      <DatabaseProvider>
        <Consumer />
      </DatabaseProvider>
    </React.StrictMode>
  );
  const ready = await screen.findByText(/^ready:\d+$/);
  const used = instances[Number(ready.textContent!.split(':')[1])];
  expect(used).toBeDefined();
  // StrictMode may discard a lazily-created instance, but it is never initialized;
  // the double-invoked effect re-calls initializeDatabase() on the same instance,
  // which DatabaseService makes idempotent (see database.service.test.ts).
  for (const instance of instances) {
    if (instance !== used) expect(instance.initializeDatabase).not.toHaveBeenCalled();
  }
  expect(used.initializeDatabase).toHaveBeenCalled();
});
