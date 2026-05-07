/**
 * @fileoverview Unit tests for the {@link logger} utility.
 *
 * @module tests/unit/utils/logger
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue(new Response('', { status: 200 }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Import logger after stubs are set up. Because the module computes
// activeLevel once at load time (from localStorage/env), we import it
// once at the module level and test behaviour with that fixed level.
// In Vitest test environment MODE is 'test', so the default level is 'warn'.
import logger from '@/utils/logger';

describe('getLevel', () => {
  it('returns the active log level string', () => {
    const level = logger.getLevel();
    expect(['debug', 'info', 'warn', 'error', 'silent']).toContain(level);
  });
});

describe('logger.warn', () => {
  it('calls console.warn with the MuzaLife prefix', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('Test warning message', { module: 'test' });

    expect(consoleSpy).toHaveBeenCalledWith('[MuzaLife]', 'Test warning message', { module: 'test' });
  });

  it('calls console.warn with an empty context object when context is omitted', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('Warning without context');

    expect(consoleSpy).toHaveBeenCalledWith('[MuzaLife]', 'Warning without context', {});
  });
});

describe('logger.error', () => {
  it('calls console.error with the MuzaLife prefix', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Test error message', { errorId: 'err-001' });

    expect(consoleSpy).toHaveBeenCalledWith('[MuzaLife]', 'Test error message', { errorId: 'err-001' });
  });

  it('sends the error to the remote endpoint via fetch', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Remote error test');

    // Give the async fire-and-forget a tick to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/errors/client',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('sends a well-formed JSON payload to the remote endpoint', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Payload test', { module: 'payments' });

    await new Promise((r) => setTimeout(r, 0));

    const [, fetchOptions] = mockFetch.mock.calls[0];
    const payload = JSON.parse(fetchOptions.body as string);
    expect(payload.level).toBe('error');
    expect(payload.message).toBe('Payload test');
    expect(payload.module).toBe('payments');
    expect(payload.sessionId).toBeDefined();
    expect(payload.timestamp).toBeDefined();
  });

  it('includes the keepalive flag for page-unload resilience', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Keepalive test');

    await new Promise((r) => setTimeout(r, 0));

    const [, fetchOptions] = mockFetch.mock.calls[0];
    expect(fetchOptions.keepalive).toBe(true);
  });

  it('fails silently when fetch throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error('Network offline'));

    await expect(async () => {
      logger.error('Silent fail test');
      await new Promise((r) => setTimeout(r, 0));
    }).not.toThrow();
  });
});

describe('logger.exception', () => {
  it('calls console.error with structured Error context including stack and errorId', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Something broke');

    logger.exception('Caught exception', err, { module: 'auth' });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[MuzaLife]',
      'Caught exception',
      expect.objectContaining({
        module: 'auth',
        errorMessage: 'Something broke',
        stack: err.stack,
        errorId: expect.stringMatching(/^fe-\d+-[a-z0-9]+$/),
      })
    );
  });

  it('converts non-Error exceptions to string for errorMessage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.exception('String thrown', 'plain string error');

    expect(consoleSpy).toHaveBeenCalledWith(
      '[MuzaLife]',
      'String thrown',
      expect.objectContaining({
        errorMessage: 'plain string error',
        stack: undefined,
      })
    );
  });

  it('works without optional context parameter', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => logger.exception('No context', new Error('oops'))).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('log level filtering', () => {
  it('does not call console.debug or console.info when level is warn or higher', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const level = logger.getLevel();
    if (level === 'warn' || level === 'error' || level === 'silent') {
      logger.debug('Should be suppressed');
      logger.info('Should be suppressed');
      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
    } else {
      // If level is debug/info, messages pass through — just verify no throw
      expect(() => logger.debug('debug msg')).not.toThrow();
      expect(() => logger.info('info msg')).not.toThrow();
    }
  });

  it('does not send debug or info messages to remote endpoint', async () => {
    const level = logger.getLevel();
    if (level === 'warn' || level === 'error' || level === 'silent') {
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      vi.spyOn(console, 'info').mockImplementation(() => {});

      logger.debug('debug msg');
      logger.info('info msg');

      await new Promise((r) => setTimeout(r, 0));
      expect(mockFetch).not.toHaveBeenCalled();
    }
  });
});

describe('buildEntry shape', () => {
  it('error log entry contains url, userAgent, timestamp, and sessionId fields', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Shape test');
    await new Promise((r) => setTimeout(r, 0));

    const [, fetchOptions] = mockFetch.mock.calls[0];
    const payload = JSON.parse(fetchOptions.body as string);
    expect(typeof payload.url).toBe('string');
    expect(typeof payload.userAgent).toBe('string');
    expect(typeof payload.timestamp).toBe('string');
    expect(typeof payload.sessionId).toBe('string');
  });
});

describe('window error listeners', () => {
  it('captures unhandled JavaScript errors via the window error event', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Global error'),
      filename: 'app.js',
      lineno: 42,
      colno: 7,
    });

    window.dispatchEvent(errorEvent);
    await new Promise((r) => setTimeout(r, 0));

    expect(mockFetch).toHaveBeenCalled();
    // Use the last call since other tests in this suite may have called fetch
    const lastCall = mockFetch.mock.calls.at(-1)!;
    const payload = JSON.parse(lastCall[1].body as string);
    expect(payload.message).toBe('Unhandled JavaScript error');
    expect(payload.module).toBe('window.onerror');
  });

  it('captures unhandled promise rejections via the unhandledrejection event', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Dispatch a synthetic unhandledrejection event manually since
    // PromiseRejectionEvent is not available in all happy-dom versions.
    const event = new Event('unhandledrejection') as Event & { reason: unknown };
    (event as any).reason = new Error('Async error');
    window.dispatchEvent(event);
    await new Promise((r) => setTimeout(r, 0));

    expect(mockFetch).toHaveBeenCalled();
    const lastCall = mockFetch.mock.calls.at(-1)!;
    const payload = JSON.parse(lastCall[1].body as string);
    expect(payload.message).toBe('Unhandled promise rejection');
    expect(payload.module).toBe('window.onunhandledrejection');
  });
});
