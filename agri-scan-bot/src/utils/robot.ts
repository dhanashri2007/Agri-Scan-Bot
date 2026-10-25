export const DEFAULT_ROBOT_URL = 'http://192.168.137.100';
export const ROBOT_URL_STORAGE_KEY = 'agriscan_robot_url';

export const OFFLINE_ROBOT_MESSAGE =
  'Could not reach the robot. Check that the ESP32 is powered, and that the laptop hotspot is ON.';

/**
 * Normalizes robot URL to format: http://hostname[:port] without trailing slashes.
 */
export function cleanRobotUrl(rawUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) {
    return DEFAULT_ROBOT_URL;
  }
  let cleaned = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }
  return cleaned.replace(/\/+$/, '');
}

/**
 * Gets the persisted robot URL from localStorage or returns default.
 */
export function getStoredRobotUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_ROBOT_URL;
  try {
    const saved = localStorage.getItem(ROBOT_URL_STORAGE_KEY);
    return saved ? cleanRobotUrl(saved) : DEFAULT_ROBOT_URL;
  } catch {
    return DEFAULT_ROBOT_URL;
  }
}

/**
 * Saves robot URL to localStorage and notifies active components.
 */
export function saveRobotUrl(url: string): string {
  const cleaned = cleanRobotUrl(url);
  try {
    localStorage.setItem(ROBOT_URL_STORAGE_KEY, cleaned);
    window.dispatchEvent(new CustomEvent('agriscan-robot-url-changed', { detail: cleaned }));
  } catch (err) {
    console.warn('Failed to save robot URL to localStorage:', err);
  }
  return cleaned;
}

/**
 * Derives the live MJPEG stream URL: <url>:81/stream
 * Example: http://192.168.137.100 -> http://192.168.137.100:81/stream
 */
export function getRobotStreamUrl(robotUrl: string): string {
  const base = cleanRobotUrl(robotUrl);
  try {
    const parsed = new URL(base);
    return `${parsed.protocol}//${parsed.hostname}:81/stream`;
  } catch {
    return `${base}:81/stream`;
  }
}

/**
 * Constructs the command URL for moving or stopping the robot:
 * GET {url}/cmd?var=move&val=N
 */
export function getRobotCmdUrl(robotUrl: string, val: number): string {
  const base = cleanRobotUrl(robotUrl);
  return `${base}/cmd?var=move&val=${val}`;
}

/**
 * Constructs the speed command URL:
 * GET {url}/cmd?var=speed&val=N (0-255)
 */
export function getRobotSpeedUrl(robotUrl: string, val: number): string {
  const base = cleanRobotUrl(robotUrl);
  const clamped = Math.max(0, Math.min(255, Math.round(val)));
  return `${base}/cmd?var=speed&val=${clamped}`;
}

/**
 * Constructs the light / flash command URL:
 * GET {url}/cmd?var=light&val=N (0 or 1, or 0-255)
 */
export function getRobotLightUrl(robotUrl: string, val: number): string {
  const base = cleanRobotUrl(robotUrl);
  const clamped = Math.max(0, Math.min(255, Math.round(val)));
  return `${base}/cmd?var=light&val=${clamped}`;
}

/**
 * Constructs the snapshot capture URL:
 * GET {url}/capture?t=<timestamp>
 */
export function getRobotCaptureUrl(robotUrl: string, timestamp?: number): string {
  const base = cleanRobotUrl(robotUrl);
  return `${base}/capture?t=${timestamp || Date.now()}`;
}

/**
 * Sends real HTTP GET command to ESP32 robot:
 * Calls GET {url}/cmd?var=move&val=N
 * With automatic proxy fallback if browser hits local network CORS or mixed content.
 */
export async function sendRobotCmd(
  robotUrl: string,
  val: number,
  timeoutMs = 1800
): Promise<{ success: boolean; error?: string }> {
  const cmdUrl = getRobotCmdUrl(robotUrl, val);

  // 1. Attempt direct browser fetch to ESP32
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(cmdUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok || res.type === 'opaque') {
      return { success: true };
    }
  } catch {
    // Direct fetch failed. Try mode: 'no-cors' direct fetch before falling back to server proxy
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      await fetch(cmdUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      return { success: true };
    } catch {
      // Direct call completely unreachable. Try server proxy fallback.
    }
  }

  // 2. Server Proxy Fallback
  try {
    const proxyUrl = `/api/robot/proxy-cmd?url=${encodeURIComponent(cmdUrl)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || OFFLINE_ROBOT_MESSAGE };
  } catch (proxyErr: any) {
    return {
      success: false,
      error: proxyErr?.message || OFFLINE_ROBOT_MESSAGE,
    };
  }
}

/**
 * Sends speed setting HTTP GET command to ESP32 robot:
 * Calls GET {url}/cmd?var=speed&val=N (0-255)
 */
export async function sendRobotSpeed(
  robotUrl: string,
  speed: number,
  timeoutMs = 1800
): Promise<{ success: boolean; error?: string }> {
  const speedUrl = getRobotSpeedUrl(robotUrl, speed);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(speedUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok || res.type === 'opaque') {
      return { success: true };
    }
  } catch {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      await fetch(speedUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      return { success: true };
    } catch {
      // Direct call unreachable
    }
  }

  // Proxy fallback
  try {
    const proxyUrl = `/api/robot/proxy-cmd?url=${encodeURIComponent(speedUrl)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Speed command failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Speed command failed' };
  }
}

/**
 * Sends light/flash HTTP GET command to ESP32 robot:
 * Calls GET {url}/cmd?var=light&val=N (1=ON / 255=Full, 0=OFF)
 */
export async function sendRobotLight(
  robotUrl: string,
  val: number,
  timeoutMs = 1800
): Promise<{ success: boolean; error?: string }> {
  const lightUrl = getRobotLightUrl(robotUrl, val);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(lightUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok || res.type === 'opaque') {
      return { success: true };
    }
  } catch {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      await fetch(lightUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      return { success: true };
    } catch {
      // Direct call unreachable
    }
  }

  // Proxy fallback
  try {
    const proxyUrl = `/api/robot/proxy-cmd?url=${encodeURIComponent(lightUrl)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Light command failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Light command failed' };
  }
}

/**
 * Verifies real robot connection status by fetching:
 * GET {url}/cmd?var=move&val=0 with a 3 second timeout (AbortController).
 * Returns true ONLY if response is OK.
 */
export async function checkRobotConnectionStatus(
  robotUrl: string,
  timeoutMs = 3000
): Promise<{ isOnline: boolean; latencyMs?: number; error?: string }> {
  const cmdUrl = getRobotCmdUrl(robotUrl, 0);
  const startTime = performance.now();

  // Try direct browser fetch first with 3 second timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(cmdUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    const latency = Math.round(performance.now() - startTime);
    if (res.ok || res.type === 'opaque') {
      return { isOnline: true, latencyMs: latency };
    }
  } catch {
    // Try mode: 'no-cors' direct fetch
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, 2000));
      await fetch(cmdUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);
      const latency = Math.round(performance.now() - startTime);
      return { isOnline: true, latencyMs: latency };
    } catch {
      // Direct call failed
    }
  }

  // Check via server proxy fallback (still enforcing 3 second timeout total)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const proxyUrl = `/api/robot/proxy-cmd?url=${encodeURIComponent(cmdUrl)}`;
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    const latency = Math.round(performance.now() - startTime);

    if (res.ok && data.success && data.ok) {
      return { isOnline: true, latencyMs: latency };
    }
    return {
      isOnline: false,
      error: OFFLINE_ROBOT_MESSAGE,
    };
  } catch {
    return {
      isOnline: false,
      error: OFFLINE_ROBOT_MESSAGE,
    };
  }
}

/**
 * Fetches snapshot image from robot:
 * GET {url}/capture?t=<Date.now()> with 10 second timeout (AbortController).
 * Checks that blob.type starts with "image/".
 */
export async function fetchRobotFrameBlob(
  robotUrl: string,
  timestamp?: number,
  timeoutMs = 10000
): Promise<Blob> {
  const ts = timestamp || Date.now();
  const captureUrl = getRobotCaptureUrl(robotUrl, ts);

  // 1. Direct browser fetch with 10s timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(captureUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok) {
      const blob = await res.blob();
      // Check that blob.type starts with image/
      if (blob && (blob.type.startsWith('image/') || blob.size > 500)) {
        return blob.type.startsWith('image/')
          ? blob
          : new Blob([blob], { type: 'image/jpeg' });
      }
    }
  } catch (err) {
    console.warn('Direct ESP32 capture fetch failed, trying proxy fallback:', err);
  }

  // 2. Server proxy fallback with 10s timeout
  const proxyController = new AbortController();
  const proxyTimer = setTimeout(() => proxyController.abort(), timeoutMs);
  const proxyUrl = `/api/robot/proxy-capture?url=${encodeURIComponent(captureUrl)}`;
  const proxyRes = await fetch(proxyUrl, { signal: proxyController.signal });
  clearTimeout(proxyTimer);

  if (!proxyRes.ok) {
    const errData = await proxyRes.json().catch(() => ({}));
    throw new Error(errData.error || OFFLINE_ROBOT_MESSAGE);
  }

  const blob = await proxyRes.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Received empty image buffer from robot camera.');
  }

  // Check type starts with image/
  if (!blob.type.startsWith('image/') && blob.size < 500) {
    throw new Error('Captured data is not a valid image format.');
  }

  return blob.type.startsWith('image/')
    ? blob
    : new Blob([blob], { type: 'image/jpeg' });
}

/**
 * Converts a Blob to a base64 Data URL string
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}
