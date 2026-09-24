export function unwrapList(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function unwrapData(payload) {
  if (payload == null) return payload;
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload;
}

export function getApiErrorMessage(error, fallback = 'Request failed') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function sanitizePhone(value) {
  return String(value || '').trim().replace(/\s+/g, '');
}
