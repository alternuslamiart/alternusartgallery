const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

interface PayPalAccessToken {
  access_token: string
  token_type: string
  expires_in: number
}

interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

interface PayPalCaptureResponse {
  id: string
  status: string
  purchase_units: Array<{
    reference_id: string
    payments: {
      captures: Array<{
        id: string
        status: string
        amount: {
          currency_code: string
          value: string
        }
      }>
    }
  }>
  payer: {
    email_address: string
    payer_id: string
    name: {
      given_name: string
      surname: string
    }
  }
}

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not set in environment variables')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get PayPal access token: ${error}`)
  }

  const data: PayPalAccessToken = await response.json()
  return data.access_token
}

// Create a PayPal order
export async function createPayPalOrder(
  amount: number,
  currency: string = 'EUR',
  description?: string,
  referenceId?: string
): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken()

  const order = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: referenceId || `order_${Date.now()}`,
        description: description || 'Alternus Art Gallery Purchase',
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'Alternus Art Gallery',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
    },
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create PayPal order: ${error}`)
  }

  return await response.json()
}

// Capture a PayPal order (after customer approves payment)
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to capture PayPal order: ${error}`)
  }

  return await response.json()
}

// Get PayPal order details
export async function getPayPalOrder(orderId: string): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get PayPal order: ${error}`)
  }

  return await response.json()
}

// Verify PayPal webhook signature
export async function verifyWebhookSignature(
  webhookId: string,
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  const accessToken = await getAccessToken()

  const verificationPayload = {
    auth_algo: headers['paypal-auth-algo'],
    cert_url: headers['paypal-cert-url'],
    transmission_id: headers['paypal-transmission-id'],
    transmission_sig: headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id: webhookId,
    webhook_event: JSON.parse(body),
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationPayload),
  })

  if (!response.ok) {
    return false
  }

  const data = await response.json()
  return data.verification_status === 'SUCCESS'
}

// Refund a captured payment
export async function refundPayPalPayment(
  captureId: string,
  amount?: number,
  currency: string = 'EUR',
  note?: string
): Promise<{ id: string; status: string }> {
  const accessToken = await getAccessToken()

  const refundPayload: Record<string, unknown> = {}

  if (amount) {
    refundPayload.amount = {
      value: amount.toFixed(2),
      currency_code: currency.toUpperCase(),
    }
  }

  if (note) {
    refundPayload.note_to_payer = note
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(refundPayload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refund PayPal payment: ${error}`)
  }

  return await response.json()
}
