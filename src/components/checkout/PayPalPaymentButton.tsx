"use client";

import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  FUNDING,
} from "@paypal/react-paypal-js";

interface PayPalPaymentButtonProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

function PayPalButtonsWrapper({
  orderId,
  onSuccess,
  onError,
}: PayPalPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = async (): Promise<string> => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create PayPal order");
      }

      return data.paypalOrderId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create PayPal order";
      onError(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const onApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/payments/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId,
        }),
      });

      const captureData = await response.json();

      if (!response.ok) {
        throw new Error(captureData.error || "Failed to capture PayPal payment");
      }

      onSuccess(orderId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment capture failed";
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const onCancelPayPal = () => {
    setIsProcessing(false);
  };

  const onErrorPayPal = (err: Record<string, unknown>) => {
    console.error("PayPal error:", err);
    onError("PayPal encountered an error. Please try again.");
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-sm text-gray-600">Processing...</span>
        </div>
      )}

      <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        disabled={isProcessing}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={onCancelPayPal}
        onError={onErrorPayPal}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 48,
        }}
      />

      <p className="text-xs text-center text-muted-foreground">
        You will be redirected to PayPal to complete your payment securely.
      </p>
    </div>
  );
}

export function PayPalPaymentButton(props: PayPalPaymentButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
        <p>PayPal is not configured. Please contact support.</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: props.currency.toUpperCase(),
        intent: "capture",
      }}
    >
      <PayPalButtonsWrapper {...props} />
    </PayPalScriptProvider>
  );
}
