import { useEffect, useState } from 'react';
import { Camera, ImageOff, Loader2 } from 'lucide-react';
import { fetchSelfieObjectUrl } from '@/utils/attendanceApi';

interface Props {
  attendanceId: string;
  type: 'in' | 'out';
  alt?: string;
  className?: string;
  rounded?: string;
}

/**
 * Loads a selfie through the authenticated API (never a raw storage URL) and
 * renders it from an in-memory object URL.
 */
export default function SecureSelfie({
  attendanceId,
  type,
  alt = 'Attendance selfie',
  className = 'h-12 w-12',
  rounded = 'rounded-lg',
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    setUrl(null);
    setFailed(false);

    fetchSelfieObjectUrl(attendanceId, type)
      .then((objectUrl) => {
        if (!active) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        created = objectUrl;
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [attendanceId, type]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${rounded} ${className}`}
        title="Selfie unavailable"
      >
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${rounded} ${className}`}
      >
        {type === 'in' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`object-cover ${rounded} ${className}`}
      loading="lazy"
    />
  );
}
