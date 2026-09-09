import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(
  new URL('../public/sw.js', import.meta.url),
  'utf8',
);

function worker({ offline = false, missingGuide = false } = {}) {
  const handlers = {};
  const added = [],
    deleted = [],
    requests = [];
  let skipped = false,
    claimed = false;
  const guide = new Response('City essentials');
  runInNewContext(script, {
    URL,
    Response,
    self: {
      location: { origin: 'https://aisftour.com' },
      addEventListener: (name, handler) => {
        handlers[name] = handler;
      },
      skipWaiting: async () => {
        skipped = true;
      },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
    },
    caches: {
      open: async () => ({
        add: async (path) => added.push(path),
        match: async (path) =>
          !missingGuide && path === '/offline.html' ? guide : undefined,
      }),
      keys: async () => [
        'aisftour-offline-v0',
        'aisftour-offline-v1',
        'other-app-cache',
      ],
      delete: async (key) => {
        deleted.push(key);
        return true;
      },
    },
    fetch: async (request) => {
      requests.push(request);
      if (offline) throw new TypeError('Network unavailable');
      return new Response('Fresh online content');
    },
  });
  return {
    added,
    deleted,
    requests,
    async lifecycle(name) {
      let task;
      handlers[name]({
        waitUntil: (value) => {
          task = value;
        },
      });
      await task;
    },
    fetch(path, { method = 'GET', mode = 'navigate' } = {}) {
      let response;
      handlers.fetch({
        request: {
          url: new URL(path, 'https://aisftour.com').href,
          method,
          mode,
        },
        respondWith: (value) => {
          response = value;
        },
      });
      return response;
    },
    get skipped() {
      return skipped;
    },
    get claimed() {
      return claimed;
    },
  };
}

test('installation saves only the static guide and retires only this app’s old caches', async () => {
  const sw = worker();
  await sw.lifecycle('install');
  assert.deepEqual(sw.added, ['/offline.html']);
  assert.equal(sw.skipped, true);
  await sw.lifecycle('activate');
  assert.deepEqual(sw.deleted, ['aisftour-offline-v0']);
  assert.equal(sw.claimed, true);
});

test('online navigation always reaches the network without caching bookings or receipts', async () => {
  const sw = worker();
  for (const path of [
    '/',
    '/?part=B#book',
    '/confirmation?session_id=example',
  ]) {
    assert.equal(await (await sw.fetch(path)).text(), 'Fresh online content');
  }
  assert.equal(sw.requests.length, 3);
  assert.deepEqual(sw.added, []);
});

test('offline navigation shows the guide and never suggests a cached confirmation', async () => {
  const sw = worker({ offline: true });
  assert.equal(
    await (await sw.fetch('/confirmation?session_id=example')).text(),
    'City essentials',
  );
  const empty = worker({ offline: true, missingGuide: true });
  assert.equal((await empty.fetch('/')).status, 503);
});

test('payments, APIs, external destinations and subresources are never intercepted', () => {
  const sw = worker();
  assert.equal(sw.fetch('/api/checkout', { method: 'POST' }), undefined);
  assert.equal(sw.fetch('/api/availability?date=2026-09-10'), undefined);
  assert.equal(sw.fetch('/api/giants', { mode: 'cors' }), undefined);
  assert.equal(sw.fetch('https://checkout.stripe.com/example'), undefined);
  assert.equal(
    sw.fetch('/photos/san-francisco-640.webp', { mode: 'no-cors' }),
    undefined,
  );
  assert.deepEqual(sw.requests, []);
});

test('home-screen manifest points to real square icons and permits standalone launch', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../public/manifest.webmanifest', import.meta.url)),
  );
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) {
    const png = readFileSync(new URL(`../public${icon.src}`, import.meta.url));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    const [width, height] = icon.sizes.split('x').map(Number);
    assert.equal(png.readUInt32BE(16), width);
    assert.equal(png.readUInt32BE(20), height);
  }
});
