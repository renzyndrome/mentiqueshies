import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { openDatabase } from './db';

const ADMIN_KEY = 'test-admin-key-0123456789';
const PUBLIC_URL = 'https://mentiqueshies.questlaguna.org';

type JsonBody = Record<string, unknown>;

function setup() {
  let nowMs = Date.parse('2026-10-11T10:00:00.000Z');
  const db = openDatabase(':memory:');
  const app = createApp({
    db,
    adminKey: ADMIN_KEY,
    publicUrl: PUBLIC_URL,
    clock: () => new Date(nowMs),
    broadcastDelayMs: 0,
  });

  const call = async (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) => {
    const init: RequestInit = { method, headers: { ...headers } };
    if (body !== undefined) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
      init.headers = { 'content-type': 'application/json', ...headers };
    }
    const res = await app.request(path, init);
    const text = await res.text();
    const json = text ? (JSON.parse(text) as JsonBody) : {};
    return { status: res.status, json, text };
  };

  const admin = (method: string, path: string, body?: unknown) =>
    call(method, path, body, { 'x-admin-key': ADMIN_KEY });

  const advance = (ms: number) => {
    nowMs += ms;
  };

  const publicState = async () => (await call('GET', '/api/state')).json.data as PublicStateShape;
  const adminState = async () => (await admin('GET', '/api/admin/state')).json.data as AdminStateShape;

  const openQuestion = async (questionText = 'What is one promise you are holding on to?') => {
    const res = await admin('PUT', '/api/admin/session', { questionText, questionStatus: 'open' });
    expect(res.status).toBe(200);
  };

  return { app, call, admin, advance, publicState, adminState, openQuestion };
}

type PublicStateShape = {
  session: { title: string; questionText: string; questionStatus: string; screenView: string };
  answers: Array<{ id: number; text: string }>;
  counts: { joined: number; answers: number };
  publicUrl: string;
};

type AdminStateShape = {
  session: { title: string; questionText: string; questionStatus: string; screenView: string };
  answers: Array<{ id: number; text: string; hidden: boolean }>;
  counts: { joined: number; answers: number; hidden: number };
};

const token = (n: number) => `device-token-${String(n).padStart(4, '0')}-abcdef`;

describe('GET /api/state', () => {
  it('returns the default session, no answers and zero counts', async () => {
    const { call } = setup();
    const res = await call('GET', '/api/state');
    expect(res.status).toBe(200);
    expect(res.json.ok).toBe(true);
    const data = res.json.data as PublicStateShape;
    expect(data.session.questionStatus).toBe('hidden');
    expect(data.session.screenView).toBe('cloud');
    expect(data.session.title.length).toBeGreaterThan(0);
    expect(data.answers).toEqual([]);
    expect(data.counts).toEqual({ joined: 0, answers: 0 });
    expect(data.publicUrl).toBe(PUBLIC_URL);
  });

  it('keeps the question text private until the question opens', async () => {
    const { admin, publicState } = setup();
    await admin('PUT', '/api/admin/session', { questionText: 'Secret question?' });
    expect((await publicState()).session.questionText).toBe('');
    await admin('PUT', '/api/admin/session', { questionStatus: 'open' });
    expect((await publicState()).session.questionText).toBe('Secret question?');
  });

  it('answers unknown API paths with a JSON 404', async () => {
    const { call } = setup();
    const res = await call('GET', '/api/nope');
    expect(res.status).toBe(404);
    expect(res.json.ok).toBe(false);
  });
});

describe('POST /api/join', () => {
  it('records a participant once per device', async () => {
    const { call, publicState } = setup();
    expect((await call('POST', '/api/join', { deviceToken: token(1) })).status).toBe(200);
    expect((await call('POST', '/api/join', { deviceToken: token(1) })).status).toBe(200);
    expect((await publicState()).counts.joined).toBe(1);
    await call('POST', '/api/join', { deviceToken: token(2) });
    expect((await publicState()).counts.joined).toBe(2);
  });

  it('rejects a missing, short or malformed device token', async () => {
    const { call, publicState } = setup();
    expect((await call('POST', '/api/join', {})).status).toBe(400);
    expect((await call('POST', '/api/join', { deviceToken: 'short' })).status).toBe(400);
    expect((await call('POST', '/api/join', { deviceToken: 'has spaces and <tags> in it' })).status).toBe(400);
    expect((await call('POST', '/api/join', { deviceToken: 12345678901234567 })).status).toBe(400);
    expect((await call('POST', '/api/join', { deviceToken: token(1), extra: true })).status).toBe(400);
    expect((await call('POST', '/api/join', 'not json')).status).toBe(400);
    expect((await publicState()).counts.joined).toBe(0);
  });
});

describe('POST /api/answer', () => {
  it('refuses answers while the question is not open', async () => {
    const { call } = setup();
    const res = await call('POST', '/api/answer', { deviceToken: token(1), text: 'Faithful' });
    expect(res.status).toBe(409);
    expect(res.json.ok).toBe(false);
  });

  it('stores a trimmed answer and shows it in the public state', async () => {
    const { call, openQuestion, publicState } = setup();
    await openQuestion();
    const res = await call('POST', '/api/answer', { deviceToken: token(1), text: '   Faithful   ' });
    expect(res.status).toBe(200);
    const state = await publicState();
    expect(state.answers.map((answer) => answer.text)).toEqual(['Faithful']);
    expect(state.counts.answers).toBe(1);
  });

  it('counts a device that answers as joined', async () => {
    const { call, openQuestion, publicState } = setup();
    await openQuestion();
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Hope' });
    expect((await publicState()).counts.joined).toBe(1);
  });

  it('rejects empty, whitespace and over-long text', async () => {
    const { call, openQuestion, advance, publicState } = setup();
    await openQuestion();
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: '' })).status).toBe(400);
    advance(2_000);
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: '   \n ' })).status).toBe(400);
    advance(2_000);
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: 'a'.repeat(81) })).status).toBe(400);
    advance(2_000);
    expect((await call('POST', '/api/answer', { deviceToken: token(1) })).status).toBe(400);
    expect((await publicState()).answers).toEqual([]);
    advance(2_000);
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: 'a'.repeat(80) })).status).toBe(200);
  });

  it('replaces the previous answer from the same device', async () => {
    const { call, openQuestion, advance, publicState } = setup();
    await openQuestion();
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Peace' });
    advance(2_000);
    const res = await call('POST', '/api/answer', { deviceToken: token(1), text: 'Healing' });
    expect(res.status).toBe(200);
    const state = await publicState();
    expect(state.answers.map((answer) => answer.text)).toEqual(['Healing']);
    expect(state.counts.answers).toBe(1);
  });

  it('allows one answer per device every 2 seconds', async () => {
    const { call, openQuestion, advance } = setup();
    await openQuestion();
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: 'One' })).status).toBe(200);
    advance(1_000);
    const limited = await call('POST', '/api/answer', { deviceToken: token(1), text: 'Two' });
    expect(limited.status).toBe(429);
    expect(limited.json.ok).toBe(false);
    expect((await call('POST', '/api/answer', { deviceToken: token(2), text: 'Other device' })).status).toBe(200);
    advance(1_000);
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: 'Three' })).status).toBe(200);
  });

  it('lists the newest answers first', async () => {
    const { call, openQuestion, advance, publicState } = setup();
    await openQuestion();
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'First' });
    advance(100);
    await call('POST', '/api/answer', { deviceToken: token(2), text: 'Second' });
    advance(100);
    await call('POST', '/api/answer', { deviceToken: token(3), text: 'Third' });
    expect((await publicState()).answers.map((answer) => answer.text)).toEqual(['Third', 'Second', 'First']);
  });
});

describe('admin auth', () => {
  it('returns 401 without the admin key', async () => {
    const { call } = setup();
    expect((await call('GET', '/api/admin/state')).status).toBe(401);
    expect((await call('PUT', '/api/admin/session', { title: 'Hacked' })).status).toBe(401);
    expect((await call('PUT', '/api/admin/answers/1', { hidden: true })).status).toBe(401);
    expect((await call('POST', '/api/admin/reset')).status).toBe(401);
  });

  it('returns 401 with a wrong admin key and changes nothing', async () => {
    const { call, publicState } = setup();
    const before = await publicState();
    const res = await call('PUT', '/api/admin/session', { title: 'Hacked' }, { 'x-admin-key': 'wrong-key' });
    expect(res.status).toBe(401);
    expect(res.json.ok).toBe(false);
    expect((await publicState()).session.title).toBe(before.session.title);
  });

  it('blocks a client after 10 wrong keys, then lets it retry after 15 minutes', async () => {
    const { call, advance } = setup();
    const from = (ip: string, key: string) => ({ 'x-admin-key': key, 'x-forwarded-for': `10.0.0.9, ${ip}` });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect((await call('GET', '/api/admin/state', undefined, from('203.0.113.7', 'wrong'))).status).toBe(401);
    }
    const blocked = await call('GET', '/api/admin/state', undefined, from('203.0.113.7', ADMIN_KEY));
    expect(blocked.status).toBe(429);
    expect(blocked.json.ok).toBe(false);

    expect((await call('GET', '/api/admin/state', undefined, from('198.51.100.2', ADMIN_KEY))).status).toBe(200);

    advance(15 * 60 * 1000);
    expect((await call('GET', '/api/admin/state', undefined, from('203.0.113.7', ADMIN_KEY))).status).toBe(200);
  });

  it('clears the failure count after a correct key', async () => {
    const { call } = setup();
    const headers = (key: string) => ({ 'x-admin-key': key, 'x-forwarded-for': '203.0.113.8' });
    for (let attempt = 0; attempt < 9; attempt += 1) {
      await call('GET', '/api/admin/state', undefined, headers('wrong'));
    }
    expect((await call('GET', '/api/admin/state', undefined, headers(ADMIN_KEY))).status).toBe(200);
    expect((await call('GET', '/api/admin/state', undefined, headers('wrong'))).status).toBe(401);
    expect((await call('GET', '/api/admin/state', undefined, headers(ADMIN_KEY))).status).toBe(200);
  });

  it('accepts the right admin key', async () => {
    const { admin } = setup();
    const res = await admin('GET', '/api/admin/state');
    expect(res.status).toBe(200);
    expect(res.json.ok).toBe(true);
  });
});

describe('PUT /api/admin/session', () => {
  it('sets the title and question text, trimmed', async () => {
    const { admin, adminState } = setup();
    const res = await admin('PUT', '/api/admin/session', {
      title: '  Sunday Family Service  ',
      questionText: '  What is one promise from God you are holding on to?  ',
    });
    expect(res.status).toBe(200);
    const state = await adminState();
    expect(state.session.title).toBe('Sunday Family Service');
    expect(state.session.questionText).toBe('What is one promise from God you are holding on to?');
  });

  it('opens and closes the question', async () => {
    const { admin, call, publicState, openQuestion, advance } = setup();
    await openQuestion();
    expect((await publicState()).session.questionStatus).toBe('open');
    await admin('PUT', '/api/admin/session', { questionStatus: 'closed' });
    expect((await publicState()).session.questionStatus).toBe('closed');
    advance(2_000);
    expect((await call('POST', '/api/answer', { deviceToken: token(1), text: 'Late' })).status).toBe(409);
  });

  it('refuses to open a question with no text', async () => {
    const { admin, publicState } = setup();
    const res = await admin('PUT', '/api/admin/session', { questionStatus: 'open' });
    expect(res.status).toBe(400);
    expect((await publicState()).session.questionStatus).toBe('hidden');
  });

  it('switches the screen view', async () => {
    const { admin, publicState } = setup();
    await admin('PUT', '/api/admin/session', { screenView: 'wall' });
    expect((await publicState()).session.screenView).toBe('wall');
    await admin('PUT', '/api/admin/session', { screenView: 'blank' });
    expect((await publicState()).session.screenView).toBe('blank');
  });

  it('rejects invalid bodies', async () => {
    const { admin, publicState } = setup();
    expect((await admin('PUT', '/api/admin/session', {})).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', { screenView: 'bars' })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', { questionStatus: 'live' })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', { title: '' })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', { title: 'x'.repeat(61) })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', { questionText: 'x'.repeat(141) })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', { title: 'Ok', unknown: 1 })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/session', 'not json')).status).toBe(400);
    const state = await publicState();
    expect(state.session.screenView).toBe('cloud');
    expect(state.session.questionStatus).toBe('hidden');
  });
});

describe('PUT /api/admin/answers/:id', () => {
  it('hides an answer from the public state but keeps it for admins', async () => {
    const { call, admin, openQuestion, publicState, adminState } = setup();
    await openQuestion();
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Visible' });
    await call('POST', '/api/answer', { deviceToken: token(2), text: 'Private prayer' });
    const target = (await adminState()).answers.find((answer) => answer.text === 'Private prayer');
    expect(target).toBeDefined();

    const res = await admin('PUT', `/api/admin/answers/${target?.id}`, { hidden: true });
    expect(res.status).toBe(200);

    const pub = await publicState();
    expect(pub.answers.map((answer) => answer.text)).toEqual(['Visible']);
    expect(JSON.stringify(pub)).not.toContain('Private prayer');
    expect(pub.counts.answers).toBe(2);

    const adm = await adminState();
    expect(adm.answers.find((answer) => answer.id === target?.id)?.hidden).toBe(true);
    expect(adm.counts.hidden).toBe(1);

    await admin('PUT', `/api/admin/answers/${target?.id}`, { hidden: false });
    expect((await publicState()).answers).toHaveLength(2);
  });

  it('keeps a hidden answer hidden when the device resubmits', async () => {
    const { call, admin, openQuestion, publicState, adminState, advance } = setup();
    await openQuestion();
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Not for the screen' });
    const id = (await adminState()).answers[0]?.id;
    await admin('PUT', `/api/admin/answers/${id}`, { hidden: true });
    advance(2_000);
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Edited text' });
    expect((await publicState()).answers).toEqual([]);
    expect((await adminState()).answers[0]).toMatchObject({ text: 'Edited text', hidden: true });
  });

  it('returns 404 for an unknown answer and 400 for bad input', async () => {
    const { admin } = setup();
    expect((await admin('PUT', '/api/admin/answers/999', { hidden: true })).status).toBe(404);
    expect((await admin('PUT', '/api/admin/answers/abc', { hidden: true })).status).toBe(400);
    expect((await admin('PUT', '/api/admin/answers/1', { hidden: 'yes' })).status).toBe(400);
  });
});

describe('POST /api/admin/reset', () => {
  it('deletes answers and participants and hides the question', async () => {
    const { call, admin, openQuestion, publicState } = setup();
    await admin('PUT', '/api/admin/session', { title: 'Sunday Family Service' });
    await openQuestion('Keep this question?');
    await call('POST', '/api/join', { deviceToken: token(1) });
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Faithful' });

    const res = await admin('POST', '/api/admin/reset');
    expect(res.status).toBe(200);

    const state = await publicState();
    expect(state.answers).toEqual([]);
    expect(state.counts).toEqual({ joined: 0, answers: 0 });
    expect(state.session.questionStatus).toBe('hidden');
    expect(state.session.title).toBe('Sunday Family Service');
  });
});

describe('privacy', () => {
  it('never exposes device tokens in public or admin state', async () => {
    const { call, openQuestion, publicState, adminState } = setup();
    await openQuestion();
    await call('POST', '/api/join', { deviceToken: token(7) });
    await call('POST', '/api/answer', { deviceToken: token(7), text: 'Joy' });
    expect(JSON.stringify(await publicState())).not.toContain(token(7));
    expect(JSON.stringify(await adminState())).not.toContain(token(7));
  });
});

describe('GET /api/events', () => {
  it('streams the current state, then a new state after a change', async () => {
    const { app, admin } = setup();
    const res = await app.request('/api/events');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    const readUntil = async (needle: string) => {
      let buffer = '';
      while (!buffer.includes(needle)) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }
      return buffer;
    };

    const first = await readUntil('\n\n');
    expect(first).toContain('event: state');

    await admin('PUT', '/api/admin/session', { title: 'Live update title' });
    const next = await readUntil('Live update title');
    expect(next).toContain('Live update title');

    await reader.cancel();
  });

  it('can leave out the answer list for phones', async () => {
    const { app, call, openQuestion } = setup();
    await openQuestion();
    await call('POST', '/api/answer', { deviceToken: token(1), text: 'Faithful' });
    const res = await call('GET', '/api/state?answers=0');
    expect((res.json.data as PublicStateShape).answers).toEqual([]);
    expect((res.json.data as PublicStateShape).counts.answers).toBe(1);

    const stream = await app.request('/api/events?answers=0');
    const reader = (stream.body as ReadableStream<Uint8Array>).getReader();
    const { value } = await reader.read();
    expect(new TextDecoder().decode(value)).not.toContain('Faithful');
    await reader.cancel();
  });
});
