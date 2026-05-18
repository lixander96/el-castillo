import axios from 'axios';
import { User, UserRole, Event, TicketType } from '../data/mockData';

export const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
}

// inicializa desde localStorage si ya hay token
const t = localStorage.getItem('token');
if (t) setAuthToken(t);

let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

const AUTH_BYPASS_PATHS = ['/auth/login', '/auth/register', '/auth/google'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    const isAuthEndpoint = AUTH_BYPASS_PATHS.some((path) => url.includes(path));
    const hadSession = !!localStorage.getItem('token');

    if (status === 401 && !isAuthEndpoint && hadSession) {
      if (unauthorizedHandler) {
        try {
          unauthorizedHandler();
        } catch (err) {
          console.warn('unauthorizedHandler failed', err);
        }
      } else {
        setAuthToken(undefined);
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  },
);

const backendRoleMap: Record<string, UserRole> = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
  ARTISTA: 'artista',
  VISITANTE: 'visitante',
  ACCESO: 'acceso',
  OPERACIONES: 'operaciones',
  PUBLICO: 'publico',
  PROMOTOR: 'promotor',
};

export function toUserRole(role?: string | UserRole | null): UserRole {
  if (!role) return 'visitante';
  const str = `${role}`;
  const upper = str.toUpperCase();
  if (backendRoleMap[upper]) return backendRoleMap[upper];
  const lower = str.toLowerCase() as UserRole;
  if (['admin', 'cliente', 'artista', 'visitante', 'acceso', 'operaciones', 'publico', 'promotor'].includes(lower)) {
    return lower as UserRole;
  }
  return 'visitante';
}

export function normalizeUser<T extends Record<string, any>>(user: T): User {
  return {
    id: String(user?.id ?? ''),
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    role: toUserRole(user?.role),
    avatar: user?.avatar ?? undefined,
  };
}

export type CouponType = 'AMOUNT' | 'PERCENTAGE' | 'FREE';

export interface CouponAllowedEvent {
  id: string;
  title: string;
  date?: string | null;
  time?: string | null;
}

export interface CouponResponse {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  commissionRate: number | null;
  maxRedemptions: number | null;
  isActive: boolean;
  promoter: User | null;
  allowedEvents: CouponAllowedEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponMetrics {
  orders: number;
  ticketsSold: number;
  grossRevenue: number;
  discountGiven: number;
  netRevenue: number;
  commissionEarned: number;
  remainingQuota: number | null;
  lastOrderAt: string | null;
}

export interface CouponMetricsResponse {
  coupon: CouponResponse;
  metrics: CouponMetrics;
}

export interface CouponPublicInfo {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  maxRedemptions: number | null;
  isActive: boolean;
  restrictedToEventIds: string[];
  applicable: boolean;
  allowedEvents: CouponAllowedEvent[];
}

export interface PromoterDashboard {
  promoterId: number;
  totals: {
    coupons: number;
    orders: number;
    tickets: number;
    grossRevenue: number;
    discountGiven: number;
    netRevenue: number;
    commissionEarned: number;
  };
  coupons: Array<{
    id: string;
    code: string;
    description: string | null;
    isActive: boolean;
    type: CouponType;
    value: number;
    commissionRate: number;
    maxRedemptions: number | null;
    createdAt: string;
    orders: number;
    ticketsSold: number;
    grossRevenue: number;
    discountGiven: number;
    netRevenue: number;
    commissionEarned: number;
    remainingQuota: number | null;
    lastOrderAt: string | null;
    allowedEvents: CouponAllowedEvent[];
  }>;
}

const parseNumber = (value: unknown): number => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const parseNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseNullableInteger = (value: unknown): number | null => {
  const num = parseNullableNumber(value);
  return num === null ? null : Math.floor(num);
};

const mapAllowedEvents = (allowed: any): CouponAllowedEvent[] => {
  if (!Array.isArray(allowed)) return [];
  return allowed
    .map((item) => ({
      id: String(item?.id ?? ''),
      title: item?.title ?? '',
      date: item?.date ?? null,
      time: item?.time ?? null,
    }))
    .filter((item) => item.id.length > 0);
};

const mapCoupon = (input: any): CouponResponse => ({
  id: String(input?.id ?? ''),
  code: String(input?.code ?? '').toUpperCase(),
  description: input?.description ?? null,
  type: (input?.type ?? 'AMOUNT') as CouponType,
  value: parseNumber(input?.value),
  commissionRate: parseNullableNumber(input?.commissionRate),
  maxRedemptions: parseNullableInteger(input?.maxRedemptions),
  isActive: Boolean(input?.isActive),
  promoter: input?.promoter ? normalizeUser(input.promoter) : null,
  allowedEvents: mapAllowedEvents(input?.allowedEvents),
  createdAt: String(input?.createdAt ?? ''),
  updatedAt: String(input?.updatedAt ?? input?.createdAt ?? ''),
});

const mapCouponList = (input: any): CouponResponse[] => {
  if (!Array.isArray(input)) return [];
  return input.map(mapCoupon);
};

const mapCouponMetrics = (input: any): CouponMetrics => ({
  orders: parseNumber(input?.orders),
  ticketsSold: parseNumber(input?.ticketsSold),
  grossRevenue: parseNumber(input?.grossRevenue),
  discountGiven: parseNumber(input?.discountGiven),
  netRevenue: parseNumber(input?.netRevenue),
  commissionEarned: parseNumber(input?.commissionEarned),
  remainingQuota: parseNullableInteger(input?.remainingQuota),
  lastOrderAt: input?.lastOrderAt ?? null,
});

const mapCouponMetricsResponse = (input: any): CouponMetricsResponse => ({
  coupon: mapCoupon(input?.coupon),
  metrics: mapCouponMetrics(input?.metrics),
});

const mapDashboard = (input: any): PromoterDashboard => ({
  promoterId: parseNumber(input?.promoterId),
  totals: {
    coupons: parseNumber(input?.totals?.coupons),
    orders: parseNumber(input?.totals?.orders),
    tickets: parseNumber(input?.totals?.tickets),
    grossRevenue: parseNumber(input?.totals?.grossRevenue),
    discountGiven: parseNumber(input?.totals?.discountGiven),
    netRevenue: parseNumber(input?.totals?.netRevenue),
    commissionEarned: parseNumber(input?.totals?.commissionEarned),
  },
  coupons: Array.isArray(input?.coupons)
    ? input.coupons.map((coupon: any) => ({
        id: String(coupon?.id ?? ''),
        code: String(coupon?.code ?? '').toUpperCase(),
        description: coupon?.description ?? null,
        isActive: Boolean(coupon?.isActive),
        type: (coupon?.type ?? 'AMOUNT') as CouponType,
        value: parseNumber(coupon?.value),
        commissionRate: parseNumber(coupon?.commissionRate),
        maxRedemptions: parseNullableInteger(coupon?.maxRedemptions),
        createdAt: String(coupon?.createdAt ?? ''),
        orders: parseNumber(coupon?.orders),
        ticketsSold: parseNumber(coupon?.ticketsSold),
        grossRevenue: parseNumber(coupon?.grossRevenue),
        discountGiven: parseNumber(coupon?.discountGiven),
        netRevenue: parseNumber(coupon?.netRevenue),
        commissionEarned: parseNumber(coupon?.commissionEarned),
        remainingQuota: parseNullableInteger(coupon?.remainingQuota),
        lastOrderAt: coupon?.lastOrderAt ?? null,
        allowedEvents: mapAllowedEvents(coupon?.allowedEvents),
      }))
    : [],
});
export interface CreateCouponPayload {
  code: string;
  description?: string | null;
  type: CouponType;
  value?: number;
  isActive?: boolean;
  promoterId?: number;
  commissionRate?: number;
  maxRedemptions?: number;
  eventIds?: string[];
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
  clearPromoter?: boolean;
  clearLimit?: boolean;
  clearEvents?: boolean;
}

export async function fetchProfile(): Promise<User> {
  const { data } = await api.get('/auth/profile');
  return normalizeUser(data);
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    const token = data?.access_token;
    if (!token) {
      throw new Error('No se pudo iniciar sesion');
    }
    setAuthToken(token);
    const user = await fetchProfile();
    return { token, user };
  } catch (error) {
    setAuthToken(undefined);
    throw error;
  }
}

export async function registerWithEmail(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const { data } = await api.post('/auth/register', payload);
    const token = data?.access_token;
    if (!token) {
      throw new Error('No se pudo completar el registro');
    }
    setAuthToken(token);
    const user = await fetchProfile();
    return { token, user };
  } catch (error) {
    setAuthToken(undefined);
    throw error;
  }
}

// Helpers
export type OrderStatus = 'initiated' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface OrderItemResponse {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount?: number;
  ticketType?: TicketType;
}

export interface OrderResponse {
  id: string;
  buyerEmail?: string | null;
  status: OrderStatus;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  promoterCommissionAmount?: number;
  coupon?: CouponResponse | null;
  items?: OrderItemResponse[];
}

export interface CreateOrderPayload {
  buyerEmail?: string;
  couponCode?: string;
  items: { eventId: string; ticketTypeId: string; quantity: number }[];
}

export async function createOrder(body: CreateOrderPayload): Promise<OrderResponse> {
  const payload = {
    ...body,
    couponCode: body.couponCode?.trim() ? body.couponCode.trim() : undefined,
  };
  const { data } = await api.post<OrderResponse>('/orders', payload);
  return data;
}

export async function checkoutPro(orderId: string) {
  const { data } = await api.post('/payments/checkout', { orderId });
  return data as { id: string; init_point?: string; sandbox_init_point?: string };
}

// For future Bricks flow
export async function processPaymentBricks(payload: {
  orderId: string;
  transaction_amount: number;
  token: string;
  payment_method_id: string;
  issuer_id?: number | string;
  installments?: number;
  description?: string;
  payer: { email: string; identification?: { type?: string; number?: string } };
}) {
  const { data } = await api.post('/payments/process', payload);
  return data;
}

export async function fetchCoupons(params?: { onlyActive?: boolean; promoterId?: number | string }) {
  const normalizedParams =
    params && params.promoterId !== undefined
      ? { ...params, promoterId: Number(params.promoterId) || undefined }
      : params;
  const { data } = await api.get('/coupons', {
    params: normalizedParams,
  });
  return mapCouponList(data);
}

export async function createCoupon(payload: CreateCouponPayload) {
  const eventIds = Array.isArray(payload.eventIds)
    ? payload.eventIds.map((id) => id.trim()).filter((id) => id.length > 0)
    : undefined;
  const body: Record<string, unknown> = {
    ...payload,
    eventIds,
  };
  if (payload.promoterId !== undefined) {
    body.promoterId = Number(payload.promoterId) || undefined;
  }
  if (payload.commissionRate !== undefined) {
    body.commissionRate = Number(payload.commissionRate);
  }
  if (payload.maxRedemptions !== undefined) {
    body.maxRedemptions =
      payload.maxRedemptions === null ? null : Number(payload.maxRedemptions);
  }
  if (payload.value !== undefined) {
    body.value = Number(payload.value);
  }
  const { data } = await api.post('/coupons', body);
  return mapCoupon(data);
}

export async function updateCoupon(id: string, payload: UpdateCouponPayload) {
  const eventIds = Array.isArray(payload.eventIds)
    ? payload.eventIds.map((value) => value.trim()).filter((value) => value.length > 0)
    : undefined;
  const body: Record<string, unknown> = {
    ...payload,
    eventIds,
  };
  if (payload.promoterId !== undefined) {
    body.promoterId =
      payload.promoterId === null ? null : Number(payload.promoterId) || undefined;
  }
  if (payload.commissionRate !== undefined) {
    body.commissionRate = Number(payload.commissionRate);
  }
  if (payload.maxRedemptions !== undefined) {
    body.maxRedemptions =
      payload.maxRedemptions === null ? null : Number(payload.maxRedemptions);
  }
  if (payload.value !== undefined) {
    body.value = Number(payload.value);
  }
  const { data } = await api.patch(`/coupons/${id}`, body);
  return mapCoupon(data);
}

export async function deleteCoupon(id: string) {
  await api.delete(`/coupons/${id}`);
}

export async function fetchCouponMetrics(id: string) {
  const { data } = await api.get(`/coupons/${id}/metrics`);
  return mapCouponMetricsResponse(data);
}
export async function fetchPublicCoupon(code: string, eventIds: string[] = []) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error('El codigo del cupon es obligatorio');
  }
  const params =
    eventIds.length > 0
      ? {
          eventId: eventIds.map((id) => id.trim()).filter((id) => id.length > 0),
        }
      : undefined;
  const { data } = await api.get(`/coupons/public/${encodeURIComponent(normalizedCode)}`, {
    params,
  });
  const restricted =
    Array.isArray(data?.restrictedToEventIds) && data.restrictedToEventIds.length > 0
      ? data.restrictedToEventIds.map((id: any) => String(id))
      : [];

  return {
    id: String(data?.id ?? ''),
    code: normalizedCode,
    description: data?.description ?? null,
    type: (data?.type ?? 'AMOUNT') as CouponType,
    value: parseNumber(data?.value),
    maxRedemptions: parseNullableInteger(data?.maxRedemptions),
    isActive: Boolean(data?.isActive),
    restrictedToEventIds: restricted,
    applicable: Boolean(data?.applicable),
    allowedEvents: mapAllowedEvents(data?.allowedEvents),
  };
}

export async function fetchMyCouponDashboard() {
  const { data } = await api.get('/coupons/metrics/me');
  return mapDashboard(data);
}

export async function fetchPromoterDashboard(promoterId: number) {
  const { data } = await api.get(`/coupons/metrics/promoter/${promoterId}`);
  return mapDashboard(data);
}

export async function fetchUsers() {
  const { data } = await api.get('/users');
  return (Array.isArray(data) ? data : []).map(normalizeUser);
}

export interface CouponEventOption {
  id: string;
  title: string;
  date?: string | null;
  time?: string | null;
  status?: string | null;
  space?: string | null;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: UserRole;
}

const toBackendRole = (role?: UserRole | string | null) => {
  if (!role) return undefined;
  return `${role}`.toUpperCase();
};

export async function createUser(payload: CreateUserPayload) {
  const body = {
    email: payload.email.trim(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    password: payload.password,
    role: toBackendRole(payload.role),
  };
  const { data } = await api.post('/users', body);
  return normalizeUser(data);
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const body: Record<string, unknown> = {};
  if (payload.email !== undefined) body.email = payload.email.trim();
  if (payload.firstName !== undefined) body.firstName = payload.firstName.trim();
  if (payload.lastName !== undefined) body.lastName = payload.lastName.trim();
  if (payload.role !== undefined) body.role = toBackendRole(payload.role);
  if (payload.password !== undefined) body.password = payload.password;

  const { data } = await api.patch(`/users/${Number(id)}`, body);
  return normalizeUser(data);
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${Number(id)}`);
}

export async function fetchCouponEventOptions() {
  const { data } = await api.get('/coupons/admin/events');
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => ({
    id: String(item?.id ?? ''),
    title: item?.title ?? '',
    date: item?.date ?? null,
    time: item?.time ?? null,
    status: item?.status ?? null,
    space: item?.space ?? null,
  })) as CouponEventOption[];
}

export interface TicketTypePayload {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  total: number;
  sold?: number;
  available?: number;
  perks?: string[];
}

export interface EventPayload {
  title: string;
  description: string;
  date: string;
  time: string;
  space: string;
  capacity: number;
  price: number;
  status: Event['status'];
  category: string;
  image?: string | null;
  featured?: boolean;
  ticketTypes: TicketTypePayload[];
}

export type EventResponse = Event & {
  ticketTypes: (TicketType & {
    description?: string | null;
    perks?: string[] | null;
  })[];
};

export async function fetchEvents() {
  const { data } = await api.get<EventResponse[]>('/events');
  return data;
}

export async function createEvent(payload: EventPayload) {
  const { data } = await api.post<EventResponse>('/events', payload);
  return data;
}

export async function updateEvent(id: string, payload: Partial<EventPayload>) {
  const { data } = await api.put<EventResponse>(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id: string) {
  await api.delete(`/events/${id}`);
}

export interface UploadResponse {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResponse>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export interface PublicSiteSettings {
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  heroImageUrl: string | null;
  faviconUrl: string | null;
  siteName: string | null;
  siteTagline: string | null;
}

export interface SiteSettings extends PublicSiteSettings {
  id: string;
  mpAccessToken: string | null;
  mpWebhookSecret: string | null;
  mpUserId: string | null;
  mpLiveMode: boolean | null;
  paymentStatementDescriptor: string;
  createdAt: string;
  updatedAt: string;
}

export interface MercadoPagoStatus {
  connected: boolean;
  liveMode: boolean | null;
  userId: string | null;
  expiresAt: string | null;
  connectedAt: string | null;
  scope: string | null;
}

export interface SiteSettingsResponse {
  settings: SiteSettings;
  mpStatus: MercadoPagoStatus;
}

export interface UpdateSiteSettingsPayload {
  mpWebhookSecret?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  heroImageUrl?: string | null;
  faviconUrl?: string | null;
  siteName?: string | null;
  siteTagline?: string | null;
  paymentStatementDescriptor?: string;
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const { data } = await api.get<PublicSiteSettings>('/site-settings/public');
  return data;
}

export async function fetchSiteSettings(): Promise<SiteSettingsResponse> {
  const { data } = await api.get<SiteSettingsResponse>('/site-settings');
  return data;
}

export async function updateSiteSettings(payload: UpdateSiteSettingsPayload): Promise<SiteSettings> {
  const { data } = await api.put<SiteSettings>('/site-settings', payload);
  return data;
}

export async function fetchMpStatus(): Promise<MercadoPagoStatus> {
  const { data } = await api.get<MercadoPagoStatus>('/site-settings/mp/status');
  return data;
}

export async function startMpOAuth(): Promise<{ url: string }> {
  const { data } = await api.get<{ url: string }>('/payments/mp/oauth/start');
  return data;
}

export async function disconnectMp(): Promise<MercadoPagoStatus> {
  const { data } = await api.delete<MercadoPagoStatus>('/site-settings/mp');
  return data;
}

export interface TicketValidationResponse {
  valid: boolean;
  reason: 'already_redeemed' | 'order_not_approved' | 'wrong_event' | null;
  eventId: string;
  eventTitle: string;
  eventDate?: string | null;
  eventTime?: string | null;
  ticketType: string;
  price?: number | null;
  redeemedAt?: string | null;
  orderId?: string | null;
  buyerEmail?: string | null;
  code: string;
  ticketId: string;
}

export async function validateTicketForEvent(eventId: string, code: string) {
  const { data } = await api.get<TicketValidationResponse>(`/tickets/event/${eventId}/validate/${encodeURIComponent(code)}`);
  return data;
}

export async function redeemTicketForEvent(eventId: string, code: string) {
  const { data } = await api.post<{ ok: boolean; redeemedAt: string }>(`/tickets/event/${eventId}/redeem/${encodeURIComponent(code)}`);
  return data;
}