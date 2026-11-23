import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LocationMap from './LocationMap';
import {
  AttendanceLocation,
  AttendanceRecord,
  formatClock,
  reverseGeocode,
  submitPunch,
} from '@/utils/attendanceApi';
import {
  FaceScanState,
  loadFaceDetector,
  scanFace,
  scanHint,
} from '@/utils/faceDetection';

const ACCURACY_THRESHOLD = Number(
  (import.meta as any).env.VITE_PUNCH_ACCURACY_THRESHOLD || 250
);

type Mode = 'in' | 'out';

interface Props {
  isOpen: boolean;
  mode: Mode;
  onClose: () => void;
  onSuccess?: (record: AttendanceRecord) => void;
}

const STEPS = [
  { id: 0, title: 'Selfie', subtitle: 'Live camera only' },
  { id: 1, title: 'Location', subtitle: 'Fresh GPS fix' },
  { id: 2, title: 'Confirm', subtitle: 'Review & submit' },
];

function locationErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Location permission is blocked. Open the site on https:// or http://localhost (plain http network URLs are blocked), click the location icon in the address bar, choose "Allow", then tap Retry location.';
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Your device could not provide a location. Turn on Location Services (Windows: Settings → Privacy & security → Location; macOS: System Settings → Privacy & Security → Location Services), make sure Wi-Fi is on, then tap Retry location.';
  }
  if (error.code === error.TIMEOUT) {
    return 'Getting a GPS fix timed out. Move near a window or outdoors, keep Wi-Fi on, then tap Retry location.';
  }
  return 'Unable to retrieve your location. Please try again.';
}

function accuracyTone(accuracy?: number | null) {
  if (accuracy === null || accuracy === undefined) {
    return { text: 'text-slate-500', bg: 'bg-slate-100', bar: 'bg-slate-300', label: 'Unknown' };
  }
  if (accuracy <= 50) {
    return { text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500', label: 'Excellent' };
  }
  if (accuracy <= ACCURACY_THRESHOLD) {
    return { text: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500', label: 'Acceptable' };
  }
  return { text: 'text-rose-700', bg: 'bg-rose-50', bar: 'bg-rose-500', label: 'Too low' };
}

// Shared visual building blocks (presentation only).
const panel = 'rounded-2xl border border-slate-200/80 bg-white';
const fieldLabel = 'text-xs font-medium text-slate-500';

export default function AttendanceVerificationModal({ isOpen, mode, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [selfie, setSelfie] = useState<{ preview: string; file: File } | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceScan, setFaceScan] = useState<FaceScanState>('loading');
  const [faceOffset, setFaceOffset] = useState({ dx: 0, dy: 0 });

  const [location, setLocation] = useState<AttendanceLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locatingHint, setLocatingHint] = useState('Fetching a precise GPS fix…');
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<Awaited<ReturnType<typeof loadFaceDetector>>>(null);
  const locationRequestRef = useRef(0);

  const isPunchIn = mode === 'in';
  const actionLabel = isPunchIn ? 'Punch In' : 'Punch Out';
  const faceCentered = faceScan === 'centered';
  const scanActive = faceScan !== 'unavailable' && faceScan !== 'loading';
  const faceHint = scanHint(faceScan, faceOffset.dx, faceOffset.dy);

  const accent = isPunchIn
    ? {
        solid: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
        soft: 'bg-emerald-50 text-emerald-700',
        icon: 'bg-emerald-600 text-white shadow-emerald-600/25',
        text: 'text-emerald-600',
        step: 'bg-emerald-600 text-white',
        line: 'bg-emerald-500',
      }
    : {
        solid: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500',
        soft: 'bg-indigo-50 text-indigo-700',
        icon: 'bg-indigo-600 text-white shadow-indigo-600/25',
        text: 'text-indigo-600',
        step: 'bg-indigo-600 text-white',
        line: 'bg-indigo-500',
      };

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        /* noop */
      }
    }
    setCameraReady(false);
    setFaceScan('loading');
    setFaceOffset({ dx: 0, dy: 0 });
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraStarting(true);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStarting(false);
      setCameraError(
        'Camera access is not available. Use a modern browser and open the app over HTTPS (or localhost).'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      await video.play().catch(() => undefined);

      // Only advertise "ready" once a real frame is available so the green
      // state and capture button reflect a usable preview.
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const finish = () => resolve();
          video.addEventListener('loadeddata', finish, { once: true });
          window.setTimeout(finish, 1500);
        });
      }

      if (streamRef.current === stream) {
        setCameraReady(true);
      }
    } catch (err: any) {
      const name = err?.name;
      let message = 'Unable to start the camera. Please try again.';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        message =
          'Camera permission was denied. Click the camera icon in the browser address bar, choose "Allow", then tap Retry.';
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        message = 'No camera was found on this device.';
      } else if (name === 'NotReadableError') {
        message = 'The camera is being used by another application. Close it and tap Retry.';
      } else if (name === 'NotSupportedError') {
        message = 'Camera access requires HTTPS (or localhost) and a supported browser.';
      }
      setCameraError(message);
    } finally {
      setCameraStarting(false);
    }
  }, [stopCamera]);

  // Live face-centering scan. Runs only while the camera preview is visible and
  // no selfie has been captured yet. Degrades to manual capture if unavailable.
  useEffect(() => {
    if (!isOpen || !cameraReady || selfie || step !== 0) return;

    let cancelled = false;
    let raf = 0;
    let lastRun = 0;

    const loop = async () => {
      if (cancelled) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      if (now - lastRun < 160) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastRun = now;

      let detector = detectorRef.current;
      if (!detector) {
        detector = await loadFaceDetector();
        if (cancelled) return;
        detectorRef.current = detector;
        if (!detector) {
          setFaceScan('unavailable');
          return;
        }
      }

      const result = scanFace(detector, video, now);
      if (!cancelled) {
        setFaceScan((previous) => (previous === result.state ? previous : result.state));
        setFaceOffset((previous) =>
          Math.abs(previous.dx - result.dx) < 0.01 && Math.abs(previous.dy - result.dy) < 0.01
            ? previous
            : { dx: result.dx, dy: result.dy }
        );
      }
      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [isOpen, cameraReady, selfie, step]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        'Geolocation is not supported by this browser. Try Chrome, Edge or Safari over HTTPS.'
      );
      return;
    }

    // Ignore callbacks from any earlier request (e.g. a slow fallback that
    // finishes after the user has already refreshed the fix).
    const requestId = ++locationRequestRef.current;
    const isCurrent = () => locationRequestRef.current === requestId;

    setLocating(true);
    setLocatingHint('Fetching a precise GPS fix…');
    setLocationError(null);
    // A punch must use the fix from this request only, never a previous one.
    setLocation(null);

    const handleSuccess = async (position: GeolocationPosition) => {
      if (!isCurrent()) return;

      const base: AttendanceLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        capturedAt: new Date().toISOString(),
      };
      setLocation(base);
      setLocationError(null);
      setLocating(false);

      const extra = await reverseGeocode(base.latitude, base.longitude);
      if (!isCurrent()) return;
      setLocation((prev) => ({ ...(prev || base), ...base, ...extra }));
    };

    const handleFailure = (error: GeolocationPositionError) => {
      if (!isCurrent()) return;
      console.warn(
        '[attendance] geolocation failed',
        error.code,
        error.message || '(no message)'
      );
      setLocationError(locationErrorMessage(error));
      setLocating(false);
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (firstError) => {
        if (!isCurrent()) return;

        console.warn(
          '[attendance] high-accuracy geolocation failed, retrying with network location',
          firstError.code,
          firstError.message || '(no message)'
        );

        // A denied permission will not improve by asking again.
        if (firstError.code === firstError.PERMISSION_DENIED) {
          handleFailure(firstError);
          return;
        }

        // Desktops without GPS hardware often fail high accuracy. Retry with a
        // network/Wi-Fi based fix, which is the only option on those machines.
        setLocatingHint('Trying a network-based location fix…');
        navigator.geolocation.getCurrentPosition(handleSuccess, handleFailure, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 0,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        // Never reuse a cached fix — every punch needs fresh coordinates.
        maximumAge: 0,
      }
    );
  }, []);

  // Reset the flow whenever the modal opens or the action changes.
  useEffect(() => {
    // Invalidate any geolocation request still in flight.
    locationRequestRef.current += 1;

    if (!isOpen) {
      stopCamera();
      return;
    }
    setStep(0);
    setSelfie(null);
    setCameraError(null);
    setLocation(null);
    setLocationError(null);
    setLocating(false);
    setLocatingHint('Fetching a precise GPS fix…');
    setSubmitting(false);

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, stopCamera]);

  // Keep the live preview only while the selfie step is active and uncaptured.
  useEffect(() => {
    if (!isOpen) return;
    if (step === 0 && !selfie) {
      const timer = window.setTimeout(() => {
        startCamera();
      }, 80);
      return () => window.clearTimeout(timer);
    }
    if (step !== 0) {
      stopCamera();
    }
  }, [isOpen, step, selfie, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      toast.error('The camera is still starting. Please wait a moment and try again.');
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    // Keep the stored selfie reasonably small (and under the 5 MB API limit)
    // without losing the detail needed to verify identity.
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(videoWidth, videoHeight));
    const width = Math.max(1, Math.round(videoWidth * scale));
    const height = Math.max(1, Math.round(videoHeight * scale));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error('Could not capture the photo. Please try again.');
          return;
        }
        const file = new File([blob], `attendance-${mode}-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        setSelfie({ preview: dataUrl, file });
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetake = () => {
    setSelfie(null);
    setCameraError(null);
  };

  const accuracy = location?.accuracy ?? null;
  const tone = accuracyTone(accuracy);
  const accuracyOk = accuracy !== null && accuracy <= ACCURACY_THRESHOLD;
  const canGoToConfirm = !!selfie && !!location && accuracyOk;
  // Display only: how much of the accuracy budget is left (fuller = better).
  const accuracyQuality =
    accuracy === null ? 0 : Math.max(6, Math.min(100, 100 - (accuracy / ACCURACY_THRESHOLD) * 100));

  const handleNext = () => {
    if (step === 0) {
      if (!selfie) {
        toast.error('Please capture a live selfie to continue.');
        return;
      }
      setStep(1);
      if (!location) requestLocation();
      return;
    }
    if (step === 1) {
      if (!location) {
        toast.error('Waiting for a fresh GPS location. Please retry.');
        requestLocation();
        return;
      }
      if (!accuracyOk) {
        toast.error(
          `GPS accuracy is ${Math.round(accuracy || 0)}m. Move to an open area and refresh until it is within ${ACCURACY_THRESHOLD}m.`
        );
        return;
      }
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selfie || !location) {
      toast.error('Selfie and location are both required.');
      return;
    }
    if (!accuracyOk) {
      toast.error('GPS accuracy is too low. Refresh your location and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('selfie', selfie.file);
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
      formData.append('accuracy', String(location.accuracy));
      formData.append('timestamp', location.capturedAt || new Date().toISOString());
      formData.append('address', location.address || '');
      formData.append('city', location.city || '');
      formData.append('state', location.state || '');
      formData.append('area', location.area || '');
      formData.append('postalCode', location.postalCode || '');
      formData.append(
        'deviceInfo',
        JSON.stringify({
          userAgent: navigator.userAgent,
          platform: (navigator as any).platform || '',
          language: navigator.language,
          screen: `${window.screen.width}x${window.screen.height}`,
        })
      );

      const result = await submitPunch(mode, formData);
      toast.success(
        isPunchIn ? 'Punched in successfully. Have a great day!' : 'Punched out successfully.'
      );
      onSuccess?.(result.attendance);
      onClose();
    } catch (err: any) {
      let message = err?.response?.data?.message;
      if (!message) {
        if (err?.code === 'ERR_NETWORK') {
          message = 'Network error. Check your connection and try again.';
        } else if (err?.response?.status === 401) {
          message = 'Your session has expired. Please sign in again.';
        } else {
          message = err?.message || 'Something went wrong while submitting. Please try again.';
        }
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const checklist = [
    { ok: !!selfie, label: 'Live selfie captured from camera' },
    { ok: !!location, label: 'Fresh GPS coordinates captured' },
    {
      ok: accuracyOk,
      label: `GPS accuracy within ${ACCURACY_THRESHOLD}m${accuracyOk ? '' : ' (refresh required)'}`,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1300] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={submitting ? undefined : onClose}
        >
          <motion.div
            initial={{ y: 48, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 48, opacity: 0, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-slate-50 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)] ring-1 ring-slate-900/5 sm:max-h-[92vh] sm:rounded-[28px]"
          >
            {/* Header */}
            <div className="bg-white px-5 pb-4 pt-5 sm:px-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg ${accent.icon}`}
                  >
                    {isPunchIn ? <UserCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                      {actionLabel}
                    </h2>
                    <p className="text-xs text-slate-500 sm:text-sm">
                      Verify with a live selfie and your GPS location
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
                  aria-label="Close verification"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stepper */}
              <ol className="mt-5 flex items-center">
                {STEPS.map((item, index) => {
                  const active = step === item.id;
                  const done = step > item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <li className="shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.id < step && !submitting) setStep(item.id);
                          }}
                          aria-current={active ? 'step' : undefined}
                          className={`flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                            item.id < step ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                              done
                                ? accent.step
                                : active
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {done ? <Check className="h-3.5 w-3.5" /> : item.id + 1}
                          </span>
                          <span className="min-w-0 leading-tight">
                            <span
                              className={`block text-xs font-semibold ${
                                active || done ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="hidden text-[11px] text-slate-400 sm:block">
                              {item.subtitle}
                            </span>
                          </span>
                        </button>
                      </li>
                      {index < STEPS.length - 1 && (
                        <span className="relative mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${accent.line}`}
                            style={{ width: step > item.id ? '100%' : '0%' }}
                          />
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </ol>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto border-t border-slate-200/70 px-5 py-5 sm:px-7">
              <AnimatePresence mode="wait" initial={false}>
                {step === 0 && (
                  <motion.div
                    key="step-selfie"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Take a live selfie</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Fresh camera capture only. Uploads and saved photos are not accepted.
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
                          faceCentered
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-white text-slate-600 ring-slate-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            faceCentered
                              ? 'animate-pulse bg-emerald-500'
                              : cameraReady
                                ? 'bg-slate-400'
                                : 'bg-slate-300'
                          }`}
                        />
                        {faceCentered ? 'Face detected' : cameraReady ? 'Camera live' : 'Camera off'}
                      </span>
                    </div>

                    {/* Viewfinder */}
                    <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-inner ring-1 ring-slate-900/10">
                      <div className="relative h-[44dvh] max-h-[360px] min-h-[220px] w-full sm:aspect-[4/3] sm:h-auto sm:max-h-none sm:min-h-0">
                        {selfie ? (
                          <>
                            <img
                              src={selfie.preview}
                              alt="Captured selfie"
                              className="absolute inset-0 h-full w-full object-cover object-center"
                            />
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/95 px-3 py-1 text-[11px] font-medium text-white shadow-lg">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Selfie captured
                            </span>
                          </>
                        ) : cameraError ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30">
                              <AlertTriangle className="h-6 w-6" />
                            </span>
                            <p className="max-w-sm text-sm leading-relaxed text-rose-100">{cameraError}</p>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Retry camera
                            </button>
                          </div>
                        ) : (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="absolute inset-0 h-full w-full object-cover object-center"
                              style={{ transform: 'scaleX(-1)' }}
                            />
                            {cameraStarting && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/75 text-white backdrop-blur-sm">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p className="text-xs font-medium">Starting camera…</p>
                              </div>
                            )}
                            {cameraReady && (
                              <div className="pointer-events-none absolute inset-0">
                                {/* Corner brackets frame the viewfinder. */}
                                {[
                                  'left-4 top-4 border-l-2 border-t-2 rounded-tl-xl',
                                  'right-4 top-4 border-r-2 border-t-2 rounded-tr-xl',
                                  'bottom-4 left-4 border-b-2 border-l-2 rounded-bl-xl',
                                  'bottom-4 right-4 border-b-2 border-r-2 rounded-br-xl',
                                ].map((corner) => (
                                  <span
                                    key={corner}
                                    className={`absolute h-6 w-6 transition-colors duration-200 ${corner} ${
                                      faceCentered ? 'border-emerald-400' : 'border-white/60'
                                    }`}
                                  />
                                ))}
                                {/* The ring only turns green when a face is actually centered. */}
                                <div
                                  className={`absolute left-1/2 top-1/2 h-36 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[999px] border-2 transition-colors duration-200 sm:h-52 sm:w-40 ${
                                    faceCentered
                                      ? 'border-emerald-400'
                                      : scanActive
                                        ? 'border-dashed border-amber-300/90'
                                        : 'border-dashed border-white/70'
                                  }`}
                                  style={{
                                    boxShadow: faceCentered
                                      ? '0 0 0 9999px rgba(2,6,23,0.45), 0 0 28px rgba(16,185,129,0.6)'
                                      : '0 0 0 9999px rgba(2,6,23,0.42)',
                                  }}
                                />
                                <span
                                  className={`absolute bottom-5 left-1/2 inline-flex max-w-[84%] -translate-x-1/2 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-center text-[11px] font-medium backdrop-blur-md ${
                                    faceCentered
                                      ? 'bg-emerald-600/90 text-white'
                                      : 'bg-slate-950/70 text-white/90'
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                      faceCentered
                                        ? 'animate-pulse bg-white'
                                        : scanActive
                                          ? 'bg-amber-300'
                                          : 'bg-slate-400'
                                    }`}
                                  />
                                  {faceHint}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {!selfie ? (
                        <Button
                          type="button"
                          onClick={handleCapture}
                          disabled={!cameraReady || cameraStarting}
                          className={`h-12 flex-1 rounded-2xl text-sm font-semibold text-white shadow-sm transition-colors ${
                            faceCentered && !cameraStarting
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-slate-900 hover:bg-slate-800'
                          }`}
                        >
                          {cameraStarting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing camera
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" /> Capture selfie
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleRetake}
                          className="h-12 flex-1 rounded-2xl text-sm font-semibold"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" /> Retake
                        </Button>
                      )}
                    </div>

                    <p className="flex items-start gap-2 rounded-2xl bg-white px-3.5 py-3 text-[11px] leading-relaxed text-slate-500 ring-1 ring-slate-200/80">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      The selfie is captured directly from your device camera. It is stored securely and
                      used only for attendance verification.
                    </p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-location"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Confirm your location</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          A fresh GPS fix is captured for every punch.
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${tone.bg} ${tone.text}`}
                      >
                        {locating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Navigation className="h-3.5 w-3.5" />
                        )}
                        {locating ? 'Locating…' : tone.label}
                      </span>
                    </div>

                    {locationError ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
                            <AlertTriangle className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-rose-800">Location unavailable</p>
                            <p className="mt-1 text-xs leading-relaxed text-rose-700">{locationError}</p>
                            <button
                              type="button"
                              onClick={requestLocation}
                              className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Retry location
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-3xl ring-1 ring-slate-200">
                        <LocationMap
                          latitude={location?.latitude}
                          longitude={location?.longitude}
                          className="h-52 sm:h-60"
                          label={location?.address || 'Captured location'}
                        />
                      </div>
                    )}

                    {locating && !location && (
                      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/80">
                        <Loader2 className={`h-4 w-4 animate-spin ${accent.text}`} />
                        {locatingHint}
                      </div>
                    )}

                    {location && (
                      <>
                        {/* Accuracy meter */}
                        <div className={`${panel} p-4`}>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className={fieldLabel}>GPS accuracy</p>
                              <p className={`mt-1 text-2xl font-semibold tracking-tight ${tone.text}`}>
                                {Math.round(location.accuracy)}
                                <span className="ml-1 text-sm font-medium text-slate-400">m</span>
                              </p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tone.bg} ${tone.text}`}>
                              {tone.label}
                            </span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
                              style={{ width: `${accuracyQuality}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[11px] text-slate-400">
                            Needs to be within {ACCURACY_THRESHOLD} m to continue.
                          </p>
                        </div>

                        {/* Coordinates */}
                        <div className={`${panel} grid grid-cols-3 divide-x divide-slate-100`}>
                          <div className="p-3.5">
                            <p className={fieldLabel}>Latitude</p>
                            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                              {location.latitude.toFixed(6)}
                            </p>
                          </div>
                          <div className="p-3.5">
                            <p className={fieldLabel}>Longitude</p>
                            <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                              {location.longitude.toFixed(6)}
                            </p>
                          </div>
                          <div className="p-3.5">
                            <p className={fieldLabel}>Captured</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {formatClock(location.capturedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className={`${panel} flex items-start gap-3 p-3.5`}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className={fieldLabel}>Detected address</p>
                            <p className="mt-1 text-sm text-slate-800">
                              {location.address || 'Address unavailable — GPS coordinates captured'}
                            </p>
                            {(location.city || location.state || location.postalCode) && (
                              <p className="mt-1 text-xs text-slate-500">
                                {[location.area, location.city, location.state, location.postalCode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                        </div>

                        {!accuracyOk && (
                          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            Accuracy is above {ACCURACY_THRESHOLD}m. Move to an open area and refresh before
                            continuing.
                          </div>
                        )}

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={requestLocation}
                          disabled={locating}
                          className="h-10 w-full rounded-xl sm:w-auto"
                        >
                          {locating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing…
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" /> Refresh location
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-confirm"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Review and confirm</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Check your {actionLabel.toLowerCase()} details. The server records the exact
                        timestamp.
                      </p>
                    </div>

                    <div className={`${panel} overflow-hidden`}>
                      <div className="grid sm:grid-cols-[148px_1fr]">
                        <div className="bg-slate-950">
                          {selfie ? (
                            <img
                              src={selfie.preview}
                              alt="Selfie preview"
                              className="h-44 w-full object-cover sm:h-full"
                            />
                          ) : (
                            <div className="flex h-44 items-center justify-center text-slate-500 sm:h-full">
                              <Camera className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="divide-y divide-slate-100">
                          <div className="flex items-start gap-3 p-4">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent.soft}`}>
                              <MapPin className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900">Location</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                {location?.address || 'Address unavailable — GPS coordinates captured'}
                              </p>
                              <p className="mt-1 font-mono text-[11px] text-slate-400">
                                {location
                                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                                  : '—'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-slate-100">
                            <div className="p-4">
                              <p className={fieldLabel}>Accuracy</p>
                              <p className={`mt-1 text-sm font-semibold ${tone.text}`}>
                                {location ? `${Math.round(location.accuracy)} m` : '—'}
                              </p>
                            </div>
                            <div className="p-4">
                              <p className={fieldLabel}>Time</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {formatClock(location?.capturedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${panel} p-4`}>
                      <p className="text-xs font-semibold text-slate-900">Verification checklist</p>
                      <ul className="mt-3 space-y-2.5">
                        {checklist.map((item) => (
                          <li key={item.label} className="flex items-center gap-2.5 text-xs">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                item.ok ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {item.ok ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                            </span>
                            <span className={item.ok ? 'text-slate-700' : 'text-amber-700'}>
                              {item.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      Your identity, location and timestamp are saved to your attendance record.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 bg-white px-5 py-4 sm:px-7">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl text-slate-500 hover:text-slate-800"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    disabled={submitting}
                    className="h-11 rounded-xl"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                )}

                {step < 2 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={step === 0 ? !selfie : !canGoToConfirm || locating}
                    className={`h-11 rounded-xl px-5 font-semibold text-white shadow-sm ${accent.solid}`}
                  >
                    Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting || !canGoToConfirm}
                    className={`h-11 rounded-xl px-5 font-semibold text-white shadow-sm ${accent.solid}`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm {actionLabel}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}