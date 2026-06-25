/**
 * Browser-only QR decoding: native BarcodeDetector, ZXing, jsQR (multi-scale / preprocess), html5-qrcode.
 */

import jsQR from 'jsqr';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Html5Qrcode } from 'html5-qrcode';

const MAX_SIDE = 2000;

function tryJsQrOnImageData(imageData: ImageData): string | null {
  const r = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });
  return r?.data?.trim() || null;
}

function grayscaleCopy(src: ImageData): ImageData {
  const d = new ImageData(src.width, src.height);
  for (let i = 0; i < src.data.length; i += 4) {
    const y = 0.299 * src.data[i] + 0.587 * src.data[i + 1] + 0.114 * src.data[i + 2];
    d.data[i] = d.data[i + 1] = d.data[i + 2] = y;
    d.data[i + 3] = 255;
  }
  return d;
}

function thresholdImageData(src: ImageData, thresh: number): ImageData {
  const d = new ImageData(src.width, src.height);
  for (let i = 0; i < src.data.length; i += 4) {
    const v = src.data[i] > thresh ? 255 : 0;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  return d;
}

function drawScaled(file: File, scale: number, rotationDeg = 0): Promise<ImageData | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = Math.round(img.naturalWidth * scale);
      let h = Math.round(img.naturalHeight * scale);
      if (w < 1 || h < 1) {
        resolve(null);
        return;
      }
      if (w > MAX_SIDE || h > MAX_SIDE) {
        const r = Math.min(MAX_SIDE / w, MAX_SIDE / h);
        w = Math.max(40, Math.round(w * r));
        h = Math.max(40, Math.round(h * r));
      }
      const canvas = document.createElement('canvas');
      const normalizedRotation = ((rotationDeg % 360) + 360) % 360;
      const quarterTurns = Math.round(normalizedRotation / 90) % 4;
      const rotated = quarterTurns % 2 === 1;
      canvas.width = rotated ? h : w;
      canvas.height = rotated ? w : h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      if (quarterTurns === 0) {
        ctx.drawImage(img, 0, 0, w, h);
      } else {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((quarterTurns * Math.PI) / 2);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      resolve(ctx.getImageData(0, 0, w, h));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function centerCropImageData(file: File, frac: number): Promise<ImageData | null> {
  const bitmap = await createImageBitmap(file);
  const cw = Math.round(bitmap.width * frac);
  const ch = Math.round(bitmap.height * frac);
  const sx = Math.round((bitmap.width - cw) / 2);
  const sy = Math.round((bitmap.height - ch) / 2);
  const w = Math.min(cw, MAX_SIDE);
  const h = Math.min(ch, MAX_SIDE);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return null;
  }
  ctx.drawImage(bitmap, sx, sy, cw, ch, 0, 0, w, h);
  bitmap.close();
  return ctx.getImageData(0, 0, w, h);
}

export async function decodeQrWithBarcodeDetector(file: File): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  type BD = new (o: { formats: string[] }) => {
    detect: (bmp: ImageBitmap) => Promise<{ rawValue?: string }[]>;
  };
  const Ctor = (window as unknown as { BarcodeDetector?: BD }).BarcodeDetector;
  if (!Ctor) return null;
  try {
    const bmp = await createImageBitmap(file);
    const detector = new Ctor({ formats: ['qr_code'] });
    const codes = await detector.detect(bmp);
    bmp.close?.();
    for (const c of codes) {
      if (c.rawValue?.trim()) return c.rawValue.trim();
    }
  } catch {
    return null;
  }
  return null;
}

export async function decodeQrWithZxingFile(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);
    const result = await reader.decodeFromImageUrl(url);
    return result.getText()?.trim() || null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function decodeQrWithJsQrExhaustive(file: File): Promise<string | null> {
  const scales = [0.75, 0.9, 1, 1.2, 1.5, 2, 2.5, 3];
  const rotations = [0, 90, 180, 270];
  const thresholds = [90, 110, 128, 145, 170];

  for (const s of scales) {
    for (const r of rotations) {
      const id = await drawScaled(file, s, r);
      if (!id) continue;
      const gray = grayscaleCopy(id);
      const variants = [id, gray, ...thresholds.map((t) => thresholdImageData(gray, t))];
      for (const v of variants) {
        const t = tryJsQrOnImageData(v);
        if (t) return t;
      }
    }
  }
  for (const frac of [0.9, 0.72]) {
    const c = await centerCropImageData(file, frac);
    if (!c) continue;
    for (const v of [c, grayscaleCopy(c), thresholdImageData(grayscaleCopy(c), 128)]) {
      const t = tryJsQrOnImageData(v);
      if (t) return t;
    }
  }
  return null;
}

export async function decodeQrWithHtml5File(
  file: File,
  elementId: string
): Promise<string | null> {
  if (!document.getElementById(elementId)) return null;
  const html5QrCode = new Html5Qrcode(elementId, { verbose: false } as any);
  const anyQr = html5QrCode as {
    scanFileV2?: (f: File, show: boolean) => Promise<unknown>;
  };
  try {
    for (const showImg of [false, true]) {
      try {
        const text = await html5QrCode.scanFile(file, showImg);
        if (text?.trim()) return text.trim();
      } catch {
        /* try next */
      }
    }
    if (typeof anyQr.scanFileV2 === 'function') {
      try {
        const result = await anyQr.scanFileV2(file, false);
        const text =
          (result as { decodedText?: string })?.decodedText ??
          (result as { result?: { text?: string } })?.result?.text ??
          (result as { text?: string })?.text ??
          (typeof result === 'string' ? result : null);
        if (text?.trim()) return String(text).trim();
      } catch {
        /* ignore */
      }
    }
  } finally {
    try {
      await html5QrCode.clear();
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Decode QR from an image file using every available strategy (order: fast native → ZXing → jsQR → html5-qrcode).
 */
export async function decodeQrFromImageFileRobust(
  file: File,
  html5ContainerId: string
): Promise<string | null> {
  const steps: Array<() => Promise<string | null>> = [
    () => decodeQrWithBarcodeDetector(file),
    () => decodeQrWithZxingFile(file),
    () => decodeQrWithJsQrExhaustive(file),
    () => decodeQrWithHtml5File(file, html5ContainerId),
  ];
  for (const step of steps) {
    try {
      const t = await step();
      if (t?.trim()) return t.trim();
    } catch {
      /* next strategy */
    }
  }
  return null;
}
