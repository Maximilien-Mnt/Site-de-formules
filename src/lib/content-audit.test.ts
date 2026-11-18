import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)), '..');
const SCRIPTS = resolve(REPO_ROOT, 'scripts');
const CONTENT_DIR = resolve(REPO_ROOT, 'src', 'content');

type SyncError = { status?: number; stdout?: string | Buffer; stderr?: string | Buffer };

function runScript(script: string, args: string[]): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync('node', [resolve(SCRIPTS, script), ...args], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return { status: 0, stdout: stdout as string, stderr: '' };
  } catch (err) {
    const e = err as SyncError;
    const toString = (v: string | Buffer | undefined): string => {
      if (v === undefined) return '';
      return typeof v === 'string' ? v : Buffer.from(v).toString('utf8');
    };
    return { status: e.status ?? 1, stdout: toString(e.stdout), stderr: toString(e.stderr) };
  }
}

function hashDirectory(dir: string): Map<string, string> {
  const entries = new Map<string, string>();
  function walk(current: string) {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        const digest = createHash('sha256').update(readFileSync(full)).digest('hex');
        entries.set(relative(dir, full), digest);
      }
    }
  }
  walk(dir);
  return entries;
}

describe('content-audit', () => {
  it('audit-content se termine avec le code de sortie 0', () => {
    const result = runScript('audit-content.mjs', []);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  describe('content-status', () => {
    it('un statut invalide renvoie le code de sortie 1', () => {
      const result = runScript('content-status.mjs', ['invalide', 'pythagore']);
      expect(result.status).toBe(1);
    });

    it('un identifiant de formule inconnu renvoie le code de sortie 1', () => {
      const result = runScript('content-status.mjs', ['published', 'n-existe-pas']);
      expect(result.status).toBe(1);
    });

    it('published --all --dry ne modifie aucun fichier de src/content', () => {
      const before = hashDirectory(CONTENT_DIR);
      const result = runScript('content-status.mjs', ['published', '--all', '--dry']);
      const after = hashDirectory(CONTENT_DIR);
      expect(result.status).toBe(0);
      expect(before).toEqual(after);
    });
  });
});
