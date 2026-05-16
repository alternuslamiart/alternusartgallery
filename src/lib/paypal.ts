type PayPalOrder = {
 id: string;
};

type PayPalCaptureResult = {
 status: string;
 purchase_units?: Array<{
 payments?: {
 captures?: Array<{
 id: string;
 }>;
 };
 }>;
};

export async function createPayPalOrder(amount: number, currency: string, description: string, referenceId: string): Promise<PayPalOrder> {
 return {
 id: `mock-paypal-${referenceId}`,
 };
}

export async function capturePayPalOrder(_paypalOrderId: string): Promise<PayPalCaptureResult> {
 return {
 status: "COMPLETED",
 purchase_units: [
 {
 payments: {
 captures: [{ id: "mock-capture" }],
 },
 },
 ],
 };
}

export async function verifyWebhookSignature(_webhookId: string, _headers: Record<string, string>, _body: string): Promise<boolean> {
 return true;
}
