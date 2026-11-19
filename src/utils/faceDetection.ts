import type { FaceDetector } from '@mediapipe/tasks-vision';

/**
 * Lightweight wrapper around MediaPipe's face detector.
 *
 * The attendance selfie step uses this to give real "face centered" feedback so
 * the scan ring only turns green when a face is actually inside the oval. If the
 * detector cannot load (offline, blocked assets, old browser) the caller simply
 * falls back to manual capture — punching in/out is never blocked.
 */

export type FaceScanState =
  | 'loading'
  | 'unavailable'
  | 'no-face'
  | 'off-center'
  | 'too-far'
  | 'too-close'
  | 'centered';

export interface FaceScanResult {
  state: FaceScanState;
  /** Normalized horizontal offset of the face center from frame center. */
  dx: number;
  /** Normalized vertical offset of the face center from frame center. */
  dy: number;
  /** Face height as a fraction of the frame height. */
  size: number;
}

const WASM_PATH = '/mediapipe/wasm';
const MODEL_PATH = '/mediapipe/blaze_face_short_range.tflite';

// Face must sit inside this normalized tolerance around the oval center.
const MAX_OFFSET_X = 0.18;
const MAX_OFFSET_Y = 0.2;
const MIN_FACE_HEIGHT = 0.16;
const MAX_FACE_HEIGHT = 0.85;

let detectorPromise: Promise<FaceDetector | null> | null = null;
const lastTimestamps = new WeakMap<FaceDetector, number>();

async function createDetector(): Promise<FaceDetector | null> {
  try {
    const vision = await import('@mediapipe/tasks-vision');
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_PATH);

    const baseOptions = { modelAssetPath: MODEL_PATH };

    try {
      return await vision.FaceDetector.createFromOptions(fileset, {
        baseOptions: { ...baseOptions, delegate: 'GPU' },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
    } catch {
      // Some browsers/drivers reject the GPU delegate; CPU still works fine.
      return await vision.FaceDetector.createFromOptions(fileset, {
        baseOptions,
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
    }
  } catch (error) {
    console.warn(
      '[attendance] Face detection unavailable, falling back to manual capture.',
      error
    );
    return null;
  }
}

export function loadFaceDetector(): Promise<FaceDetector | null> {
  if (!detectorPromise) {
    detectorPromise = createDetector();
  }
  return detectorPromise;
}

const EMPTY: FaceScanResult = { state: 'no-face', dx: 0, dy: 0, size: 0 };

export function scanFace(
  detector: FaceDetector,
  video: HTMLVideoElement,
  timestamp: number
): FaceScanResult {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height || video.readyState < 2) return EMPTY;

  // MediaPipe requires strictly increasing timestamps across calls.
  const previous = lastTimestamps.get(detector) ?? 0;
  const nextTimestamp = Math.max(timestamp, previous + 1);
  lastTimestamps.set(detector, nextTimestamp);

  let detections: import('@mediapipe/tasks-vision').Detection[] = [];
  try {
    detections = detector.detectForVideo(video, nextTimestamp).detections;
  } catch {
    return EMPTY;
  }

  if (!detections.length) return EMPTY;

  // Use the largest detected face (closest to the camera).
  let best = detections[0];
  let bestArea = 0;
  for (const detection of detections) {
    const box = detection.boundingBox;
    if (!box) continue;
    const area = box.width * box.height;
    if (area > bestArea) {
      bestArea = area;
      best = detection;
    }
  }

  const box = best.boundingBox;
  if (!box) return EMPTY;

  const centerX = (box.originX + box.width / 2) / width;
  const centerY = (box.originY + box.height / 2) / height;
  const size = box.height / height;
  const dx = centerX - 0.5;
  const dy = centerY - 0.5;

  if (size < MIN_FACE_HEIGHT) {
    return { state: 'too-far', dx, dy, size };
  }
  if (size > MAX_FACE_HEIGHT) {
    return { state: 'too-close', dx, dy, size };
  }

  const centered = Math.abs(dx) <= MAX_OFFSET_X && Math.abs(dy) <= MAX_OFFSET_Y;
  return { state: centered ? 'centered' : 'off-center', dx, dy, size };
}

export function scanHint(state: FaceScanState, dx = 0, dy = 0): string {
  switch (state) {
    case 'loading':
      return 'Starting face scan…';
    case 'unavailable':
      return 'Face scan unavailable — you can still capture';
    case 'no-face':
      return 'Position your face inside the oval';
    case 'too-far':
      return 'Move a little closer to the camera';
    case 'too-close':
      return 'Move a little further back';
    case 'off-center': {
      const vertical = dy < -0.08 ? 'up' : dy > 0.08 ? 'down' : '';
      const horizontal = dx < -0.08 ? 'left' : dx > 0.08 ? 'right' : '';
      if (horizontal && vertical) return `Move ${vertical} and ${horizontal} into the oval`;
      if (horizontal) return `Move ${horizontal} into the oval`;
      if (vertical) return `Move ${vertical} into the oval`;
      return 'Center your face in the oval';
    }
    case 'centered':
      return 'Face detected — ready to capture';
    default:
      return 'Center your face in the oval';
  }
}
