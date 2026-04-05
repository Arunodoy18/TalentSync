export type RazorpayWebhookEvent = {
  id: string;
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
      };
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
      };
    };
    refund?: {
      entity?: {
        id?: string;
        amount?: number;
      };
    };
    subscription?: {
      entity?: {
        id?: string;
        plan_id?: string;
        current_start?: number;
        current_end?: number;
        ended_at?: number;
      };
    };
  };
};

export function getEventOrderId(event: RazorpayWebhookEvent): string | null {
  const paymentOrderId = event.payload?.payment?.entity?.order_id;
  const orderId = event.payload?.order?.entity?.id;
  return paymentOrderId || orderId || null;
}

export function getEventAmount(event: RazorpayWebhookEvent): number | null {
  const paymentAmount = event.payload?.payment?.entity?.amount;
  const orderAmount = event.payload?.order?.entity?.amount;
  const refundAmount = event.payload?.refund?.entity?.amount;
  return paymentAmount ?? orderAmount ?? refundAmount ?? null;
}




