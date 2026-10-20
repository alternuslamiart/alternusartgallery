import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, ChevronRight, X, type LucideIcon } from "lucide-react";
import "./soft-ui.css";

/** Join truthy class names. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ Root */
export function SoftRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("sui", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ Icon */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";
const ICON_PX: Record<IconSize, number> = { xs: 14, sm: 16, md: 18, lg: 22, xl: 28 };

/** Soft line icon: lucide icon with rounded caps and a light, consistent stroke. */
export function SoftIcon({
  icon: Icon,
  size = "md",
  className,
  label,
}: {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  label?: string;
}) {
  return (
    <span className={cx("sui-icon", className)} aria-hidden={label ? undefined : true} aria-label={label}>
      <Icon size={ICON_PX[size]} strokeWidth={1.6} absoluteStrokeWidth />
    </span>
  );
}

export function IconTile({
  icon,
  size = "md",
  tone,
  state,
  className,
}: {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "sage" | "sand";
  state?: "hover" | "active" | "disabled";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "sui-icon-tile",
        size !== "md" && `sui-icon-tile-${size}`,
        tone && `sui-icon-tile-${tone}`,
        state && `is-${state}`,
        className,
      )}
    >
      <SoftIcon icon={icon} size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} className="!text-inherit" />
    </span>
  );
}

/* ------------------------------------------------------------------ Button */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
};

function buttonClass({ variant = "primary", size = "md", rounded, iconOnly, loading }: ButtonBaseProps, extra?: string) {
  return cx(
    "sui-btn",
    `sui-btn-${variant}`,
    size !== "md" && `sui-btn-${size}`,
    rounded && "sui-btn-rounded",
    iconOnly && "sui-btn-icon",
    loading && "sui-btn-loading",
    extra,
  );
}

function ButtonContent({ children, leadingIcon, trailingIcon, loading, size }: ButtonBaseProps & { children?: ReactNode }) {
  const iconSize: IconSize = size === "lg" ? "md" : "sm";
  return (
    <>
      {leadingIcon && <SoftIcon icon={leadingIcon} size={iconSize} className="!text-inherit" />}
      {children}
      {trailingIcon && <SoftIcon icon={trailingIcon} size={iconSize} className="!text-inherit" />}
      {loading && <span className="sui-spinner" aria-hidden />}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ variant, size, rounded, iconOnly, loading, leadingIcon, trailingIcon, className, children, type, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        aria-busy={loading || undefined}
        className={buttonClass({ variant, size, rounded, iconOnly, loading }, className)}
        {...rest}
      >
        <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading} size={size}>
          {children}
        </ButtonContent>
      </button>
    );
  },
);

export function ButtonLink({
  href,
  variant,
  size,
  rounded,
  leadingIcon,
  trailingIcon,
  className,
  children,
}: ButtonBaseProps & { href: string; className?: string; children?: ReactNode }) {
  return (
    <Link href={href} className={buttonClass({ variant, size, rounded }, className)}>
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} size={size}>
        {children}
      </ButtonContent>
    </Link>
  );
}

/* ------------------------------------------------------------------ Card */
export function Card({
  children,
  className,
  hover,
  elevated,
  outline,
  glass,
  padded = true,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  elevated?: boolean;
  outline?: boolean;
  glass?: boolean;
  padded?: boolean;
  as?: "div" | "article" | "section" | "aside";
}) {
  return (
    <Tag
      className={cx(
        glass ? "sui-glass" : "sui-card",
        glass && "rounded-[24px]",
        hover && "sui-card-hover",
        elevated && "sui-card-elevated",
        outline && "sui-card-outline",
        padded && "sui-card-pad",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone,
  dot,
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "error";
  dot?: boolean;
}) {
  return <span className={cx("sui-badge", tone && `sui-badge-${tone}`, dot && "sui-badge-dot")}>{children}</span>;
}

/* ------------------------------------------------------------------ Forms */
export function Field({
  label,
  hint,
  status,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  status?: "error" | "success";
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="sui-field">
      {label && (
        <label className="sui-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {hint && (
        <span className={cx("sui-hint", status && `sui-hint-${status}`)} role={status === "error" ? "alert" : undefined}>
          {hint}
        </span>
      )}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { status?: "error" | "success"; icon?: LucideIcon }
>(function Input({ status, icon, className, ...rest }, ref) {
  const input = (
    <input
      ref={ref}
      aria-invalid={status === "error" || undefined}
      className={cx("sui-input", status && `is-${status}`, className)}
      {...rest}
    />
  );
  if (!icon) return input;
  return (
    <div className="sui-input-wrap">
      <SoftIcon icon={icon} size="sm" />
      {input}
    </div>
  );
});

export function Textarea({ status, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { status?: "error" | "success" }) {
  return <textarea className={cx("sui-textarea", status && `is-${status}`, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx("sui-select", className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="sui-check">
      <input type="checkbox" {...rest} />
      <span className="sui-check-box">
        <Check size={13} strokeWidth={2.4} />
      </span>
      {label}
    </label>
  );
}

export function Radio({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="sui-check sui-radio">
      <input type="radio" {...rest} />
      <span className="sui-check-box" />
      {label}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="sui-toggle"
      onClick={() => onChange(!checked)}
    />
  );
}

/* ------------------------------------------------------------------ Navigation */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "pill",
  label,
}: {
  items: Array<{ id: T; label: string; icon?: LucideIcon }>;
  value: T;
  onChange: (id: T) => void;
  variant?: "pill" | "line";
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={variant === "line" ? "sui-tabs-line" : "sui-tabs"}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          className="sui-tab"
          onClick={() => onChange(item.id)}
        >
          {item.icon && <SoftIcon icon={item.icon} size="sm" className="!text-inherit" />}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="sui-breadcrumbs">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
              {!last && <SoftIcon icon={ChevronRight} size="xs" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ Feedback */
export function Alert({
  tone = "info",
  icon,
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx("sui-alert", `sui-alert-${tone}`)} role={tone === "error" ? "alert" : "status"}>
      <SoftIcon icon={icon} size="md" />
      <div>
        <div className="sui-alert-title">{title}</div>
        {children && <div className="sui-small">{children}</div>}
      </div>
    </div>
  );
}

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="sui-tooltip-host">
      {children}
      <span role="tooltip" className="sui-tooltip">
        {content}
      </span>
    </span>
  );
}

export function Toast({
  icon,
  tone = "primary",
  title,
  description,
  onDismiss,
}: {
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "error";
  title: string;
  description?: string;
  onDismiss?: () => void;
}) {
  const toneColor = {
    primary: "var(--sui-primary)",
    success: "var(--sui-success)",
    warning: "var(--sui-warning)",
    error: "var(--sui-error)",
  }[tone];
  return (
    <div className="sui-toast sui-glass" role="status">
      <span className="sui-icon" style={{ color: toneColor }}>
        <SoftIcon icon={icon} size="md" className="!text-inherit" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[0.875rem] font-medium text-[var(--sui-text)]">{title}</div>
        {description && <div className="sui-small">{description}</div>}
      </div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss notification" className="sui-btn sui-btn-ghost sui-btn-sm sui-btn-icon" onClick={onDismiss}>
          <X size={15} strokeWidth={1.6} />
        </button>
      )}
    </div>
  );
}

export function Progress({ value, label }: { value?: number; label: string }) {
  const indeterminate = value === undefined;
  return (
    <div
      className={cx("sui-progress", indeterminate && "sui-progress-indeterminate")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
    >
      <span style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 64, label }: { value: number; size?: number; label: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" role="progressbar" aria-label={label} aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} className="sui-ring">
        <defs>
          <linearGradient id="sui-ring-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#b4beff" />
            <stop offset="100%" stopColor="#a9cdbd" />
          </linearGradient>
        </defs>
        <circle className="sui-ring-track" cx={size / 2} cy={size / 2} r={r} />
        <circle className="sui-ring-value" cx={size / 2} cy={size / 2} r={r} strokeDasharray={c} strokeDashoffset={c - (clamped / 100) * c} />
      </svg>
      <span className="absolute text-[0.75rem] font-medium text-[var(--sui-text)]">{clamped}%</span>
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return <span className="sui-spinner" role="status" aria-label={label} />;
}

export function TypingDots({ label = "Generating" }: { label?: string }) {
  return (
    <span className="sui-dots" role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="sui-modal-backdrop" onClick={onClose} onKeyDown={(event) => event.key === "Escape" && onClose()}>
      <div
        className="sui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sui-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 id="sui-modal-title" className="sui-h3">
            {title}
          </h3>
          <button type="button" aria-label="Close dialog" className="sui-btn sui-btn-ghost sui-btn-sm sui-btn-icon" onClick={onClose} autoFocus>
            <X size={16} strokeWidth={1.6} />
          </button>
        </div>
        <div className="sui-body">{children}</div>
        {footer && <div className="mt-7 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
