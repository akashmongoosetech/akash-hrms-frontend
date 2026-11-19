import API from './api';

/**
 * Shared types + API helpers for the attendance module.
 *
 * `VITE_API_URL` already includes the `/api` prefix (e.g. http://localhost:5000/api),
 * so every path here is relative to that prefix.
 */

export type AttendanceStatus = 'not-punched-in' | 'punched-in' | 'punched-out';

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  city?: string;
  state?: string;
  area?: string;
  postalCode?: string;
  capturedAt?: string;
}

export interface AttendancePunch {
  time: string;
  location: AttendanceLocation | null;
  hasSelfie: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: {
    _id?: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string | null;
  };
  date: string;
  dateKey: string | null;
  status: 'punched-in' | 'punched-out';
  punchInTime: string;
  punchOutTime: string | null;
  totalWorkingMinutes: number | null;
  totalWorkingHours: string | null;
  punchIn: AttendancePunch;
  punchOut: AttendancePunch | null;
  verificationStatus?: string;
  autoPunchOut?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceHistoryResponse {
  success: boolean;
  records: AttendanceRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TodayResponse {
  success: boolean;
  status: AttendanceStatus;
  attendance: AttendanceRecord | null;
}

export async function getTodayAttendance(): Promise<TodayResponse> {
  const { data } = await API.get('/attendance/today');
  return data;
}

export async function getAttendanceHistory(params: Record<string, string | number>): Promise<AttendanceHistoryResponse> {
  const { data } = await API.get('/attendance/history', { params });
  return data;
}

export async function getAttendanceById(id: string): Promise<AttendanceRecord> {
  const { data } = await API.get(`/attendance/${id}`);
  return data.attendance;
}

export async function submitPunch(mode: 'in' | 'out', formData: FormData) {
  const path = mode === 'in' ? '/attendance/punch-in' : '/attendance/punch-out';
  // Let the browser/axios generate the multipart boundary.
  const { data } = await API.post(path, formData);
  return data as { success: boolean; message: string; attendance: AttendanceRecord };
}

/**
 * Fetch a selfie through the authenticated endpoint and turn it into an object
 * URL. The raw storage reference is never sent to the browser.
 */
export async function fetchSelfieObjectUrl(
  attendanceId: string,
  type: 'in' | 'out'
): Promise<string> {
  const response = await API.get(`/attendance/${attendanceId}/selfie/${type}`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data as Blob);
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<AttendanceLocation>> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Reverse geocoding failed');
    const data = await response.json();
    const address = data.address || {};
    return {
      address: data.display_name || '',
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.suburb ||
        address.county ||
        '',
      state: address.state || address.state_district || address.region || '',
      area: address.suburb || address.neighbourhood || address.quarter || address.city_district || '',
      postalCode: address.postcode || '',
    };
  } catch {
    // Reverse geocoding is a nice-to-have; valid GPS is still enough to punch.
    return {};
  }
}

/** HH:MM (or HH:MM:SS) for a duration in minutes. */
export function formatDuration(minutes: number | null | undefined, includeSeconds = false): string {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '--:--';
  const totalSeconds = Math.max(0, Math.round(minutes * 60));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return includeSeconds
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatClock(value?: string | Date | null): string {
  if (!value) return '--:--';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatLongDate(value?: string | Date | null): string {
  const date = value ? (typeof value === 'string' ? new Date(value) : value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Distance between two GPS fixes in metres (used to flag location drift). */
export function distanceInMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
