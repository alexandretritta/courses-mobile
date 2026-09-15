import type { IScannerControls } from '@zxing/browser';

export type StopScan = () => void;

const PRODUCT_LEN = new Set([8, 12, 13, 14]);

export function normalizeBarcode(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isProductBarcode(raw: string): boolean {
  return PRODUCT_LEN.has(normalizeBarcode(raw).length);
}

type NativeDetector = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

async function createNativeDetector(): Promise<NativeDetector | null> {
  const Ctor = (
    globalThis as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => NativeDetector & {
        getSupportedFormats?: () => Promise<string[]>;
      };
    }
  ).BarcodeDetector;
  if (!Ctor) return null;

  const wanted = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
  try {
    const supported = await (
      Ctor as unknown as { getSupportedFormats?: () => Promise<string[]> }
    ).getSupportedFormats?.();
    const formats = supported ? wanted.filter((f) => supported.includes(f)) : wanted;
    if (formats.length === 0) return null;
    return new Ctor({ formats });
  } catch {
    return null;
  }
}

async function startZxing(
  video: HTMLVideoElement,
  emit: (raw: string) => void,
): Promise<IScannerControls> {
  const { BarcodeFormat, BrowserMultiFormatReader } = await import('@zxing/browser');
  const { DecodeHintType } = await import('@zxing/library');
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
  ]);
  const reader = new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 80,
    delayBetweenScanSuccess: 1200,
  });
  return reader.decodeFromVideoDevice(undefined, video, (result) => {
    if (result) emit(result.getText());
  });
}

/**
 * Start camera scan: BarcodeDetector when the browser supports EAN/UPC,
 * otherwise @zxing/browser. Returns a stop() that releases the camera.
 */
export async function startBarcodeScan(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
): Promise<StopScan> {
  let stopped = false;
  let fired = false;
  let raf = 0;
  let stream: MediaStream | null = null;
  let controls: IScannerControls | null = null;

  const emit = (raw: string) => {
    if (stopped || fired) return;
    const code = normalizeBarcode(raw);
    if (!isProductBarcode(code)) return;
    fired = true;
    onCode(code);
  };

  const stop: StopScan = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    controls?.stop();
    controls = null;
    const fromVideo = video.srcObject;
    if (fromVideo instanceof MediaStream) {
      fromVideo.getTracks().forEach((t) => t.stop());
    }
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    video.srcObject = null;
  };

  const native = await createNativeDetector();

  if (native) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    video.setAttribute('playsinline', 'true');
    video.muted = true;
    video.srcObject = stream;
    await video.play();

    const tick = async () => {
      if (stopped || fired) return;
      try {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const codes = await native.detect(video);
          for (const c of codes) {
            emit(c.rawValue);
            if (fired) return;
          }
        }
      } catch {
        /* skip undecodable frame */
      }
      if (!stopped && !fired) {
        raf = requestAnimationFrame(() => {
          void tick();
        });
      }
    };
    raf = requestAnimationFrame(() => {
      void tick();
    });
    return stop;
  }

  controls = await startZxing(video, emit);

  return stop;
}

export function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (!window.isSecureContext) {
    return 'La caméra nécessite HTTPS (ou localhost). Saisis le code-barres à la main.';
  }
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Caméra bloquée — autorise l’accès dans les réglages du navigateur. Sur téléphone, l’app doit être en HTTPS.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'Aucune caméra détectée. Saisis le code-barres à la main.';
  }
  if (name === 'NotReadableError') {
    return 'Caméra déjà utilisée par une autre app. Saisis le code à la main, ou ferme l’autre app.';
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Ce navigateur ne gère pas la caméra. Saisis le code-barres à la main.';
  }
  return 'Impossible d’ouvrir la caméra. Saisis le code-barres à la main.';
}
