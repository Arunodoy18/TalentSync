export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: string;
};

export type PaymentWebhookEvent = {
  id: string;
  event: string;
  payload?: Record<string, unknown>;
};
