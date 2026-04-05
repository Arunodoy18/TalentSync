type AlertSeverity = "info" | "warning" | "critical";

type AlertPayload = {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
};

function shouldDispatch(alerts: AlertPayload[]): boolean {
  return alerts.some((alert) => alert.severity === "warning" || alert.severity === "critical");
}

export async function dispatchOpsAlerts(alerts: AlertPayload[]): Promise<void> {
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL;
  if (!webhookUrl || !shouldDispatch(alerts)) {
    return;
  }

  const payload = {
    service: "talentsync-ops",
    sentAt: new Date().toISOString(),
    alertCount: alerts.length,
    alerts,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Alert dispatch failed with status ${response.status}`);
  }
}




