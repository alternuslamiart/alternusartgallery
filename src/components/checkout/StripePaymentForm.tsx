"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  orderId,
  amount,
  currency,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An error occurred during payment.");
      onError(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(orderId);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
            Processing...
          </span>
        ) : (
          `Pay ${new Intl.NumberFormat("en-EU", {
            style: "currency",
            currency: currency,
          }).format(amount)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured with 256-bit SSL encryption.
      </p>
    </form>
  );
}

interface StripePaymentWrapperProps {
  orderId: string;
  email?: string;
  name?: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({
  orderId,
  email,
  name,
  onSuccess,
  onError,
}: StripePaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("EUR");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payments/stripe/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId, email, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        setClientSecret(data.clientSecret);
        setAmount(data.amount);
        setCurrency(data.currency);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize payment";
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderId, email, name, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-gray-400"
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
        <p className="font-medium">Payment initialization failed</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
        <p>Unable to initialize payment. Please try again.</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#000000",
            colorBackground: "#ffffff",
            colorText: "#1a1a1a",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
    >
      <CheckoutForm
        orderId={orderId}
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
