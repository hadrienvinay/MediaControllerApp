import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/** Re-check at most this often; a stale yt-dlp doesn't go stale again within a request burst. */
const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
/** yt-dlp releases roughly monthly; flag anything older as likely to hit YouTube 403s. */
const STALE_AFTER_DAYS = 45;

let cachedResult: YtdlpHealth | null = null;
let cachedAt = 0;

export interface YtdlpHealth {
  ok: boolean;
  /** Set when yt-dlp is missing or fails to run at all — should block the request. */
  blockingError?: string;
  /** Set when yt-dlp runs but looks outdated — should be surfaced as a warning, not a block. */
  warning?: string;
  version?: string;
}

/** yt-dlp versions are date-stamped: YYYY.MM.DD. */
function parseVersionDate(version: string): Date | null {
  const match = version.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

/**
 * Pre-flight check for yt-dlp: confirms the binary is installed and runnable,
 * and warns when it's old enough that YouTube has likely drifted out from
 * under it (the usual cause of "HTTP Error 403: Forbidden" on download).
 * Cached briefly so it doesn't add a subprocess call to every request.
 */
export async function checkYtdlpHealth(): Promise<YtdlpHealth> {
  const now = Date.now();
  if (cachedResult && now - cachedAt < CHECK_INTERVAL_MS) {
    return cachedResult;
  }

  let result: YtdlpHealth;
  try {
    const { stdout } = await execAsync('yt-dlp --version', { timeout: 5000 });
    const version = stdout.trim();
    const versionDate = parseVersionDate(version);
    const ageDays = versionDate ? (now - versionDate.getTime()) / (1000 * 60 * 60 * 24) : null;

    if (ageDays !== null && ageDays > STALE_AFTER_DAYS) {
      result = {
        ok: true,
        version,
        warning: `yt-dlp date du ${version} (${Math.round(ageDays)} jours). YouTube change régulièrement son système anti-bot ; si les téléchargements échouent avec une erreur 403, lancez : brew upgrade yt-dlp (ou pip install -U yt-dlp).`,
      };
    } else {
      result = { ok: true, version };
    }
  } catch (error) {
    const message = (error as Error).message || '';
    const notFound = message.includes('not found') || message.includes('No such') || (error as { code?: string }).code === 'ENOENT';
    result = {
      ok: false,
      blockingError: notFound
        ? 'yt-dlp n\'est pas installé ou introuvable dans le PATH. Installez-le avec : brew install yt-dlp (ou pip install yt-dlp)'
        : `yt-dlp ne répond pas correctement : ${message.split('\n')[0]}`,
    };
  }

  cachedResult = result;
  cachedAt = now;
  return result;
}
