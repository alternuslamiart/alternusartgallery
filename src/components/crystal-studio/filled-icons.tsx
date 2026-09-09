import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string };
const icon = (children: React.ReactNode, props: Props) => (
  <svg {...props} width={props.size ?? 20} height={props.size ?? 20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);

export const PlayFilled = (props: Props) => icon(<><path d="M7 4.8v14.4c0 1.1 1.2 1.8 2.2 1.2l10.7-7.2a1.5 1.5 0 0 0 0-2.4L9.2 3.6C8.2 3 7 3.7 7 4.8Z" /><path d="m8.8 5.8 8.9 6-8.9 6V5.8Z" fill="#171717" opacity=".22" /></>, props);
export const FocusFilled = (props: Props) => icon(<><path d="M3 3h7v2H5v5H3V3Zm11 0h7v7h-2V5h-5V3ZM3 14h2v5h5v2H3v-7Zm16 0h2v7h-7v-2h5v-5Z" /><path d="M8 8h8v8H8z" opacity=".18" /></>, props);
export const MoveFilled = (props: Props) => icon(<><path d="m10 2 4 4h-3v4h4V7l5 5-5 5v-3h-4v4h3l-4 4-4-4h3v-4H5v3l-5-5 5-5v3h4V6H6l4-4Z" /><path d="m10 6 3 3v6l-3 3-3-3V9l3-3Z" fill="#171717" opacity=".2" /></>, props);
export const RotateFilled = (props: Props) => icon(<><path fillRule="evenodd" d="M18.5 5.5A8 8 0 0 0 5 7l-2-1A10 10 0 0 1 21 4V1h2v8h-8V7h4.2a8 8 0 0 0-.7-1.5ZM5.5 18.5A8 8 0 0 0 19 17l2 1A10 10 0 0 1 3 20v3H1v-8h8v2H4.8c.2.5.4 1 .7 1.5Z" /><circle cx="12" cy="12" r="3.2" fill="#171717" opacity=".24" /><path d="M12 9v6l2-1.2V10.2L12 9Z" opacity=".42" /></>, props);
export const EditFaceFilled = (props: Props) => icon(<><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" opacity=".32" /><path d="m12 4.5 6.8 3.8-6.8 3.8-6.8-3.8L12 4.5Zm-6.8 5.3 5.8 3.2v6l-5.8-3.2v-6Zm7.8 9.2v-6l5.8-3.2v6l-5.8 3.2Z" /><path d="m12 6.2 3.8 2.1-3.8 2.1-3.8-2.1L12 6.2Z" fill="#171717" opacity=".28" /></>, props);
export const SparkleFilled = (props: Props) => icon(<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 16l.7 1.8L7.5 18l-1.8.7L5 20.5l-.7-1.8L2.5 18l1.8-.7L5 16Z" />, props);
export const PointerFilled = (props: Props) => icon(<><path d="m5 2 13.7 10.8-6 1.3 3.5 5.7-2.6 1.5-3.5-5.8-3.8 4.9L5 2Z" /><path d="m7 5 8.5 6.7-4.3.9 2.4 4-1 .6-2.4-4-2.7 3.5L7 5Z" fill="#171717" opacity=".2" /></>, props);
export const DrawFilled = (props: Props) => icon(<><path fillRule="evenodd" d="m14.8 3.2 6 6-10.9 10.9-7 1 1-7L14.8 3.2Zm-8.5 12-.5 3.2 3.2-.5 8.9-8.9-2.7-2.7-8.9 8.9ZM16.1 5.6l2.7 2.7 1.1-1.1-2.7-2.7-1.1 1.1Z" /><path d="m5.3 16.4 2.3 2.3-3.1.5.5-2.8.3-.3Z" fill="#171717" opacity=".28" /></>, props);
export const MeasureFilled = (props: Props) => icon(<><path d="m3 7 4-4 14 14-4 4L3 7Z" /><path d="m6.2 7.3 2.2-2.2 11.2 11.2-2.2 2.2L6.2 7.3Z" fill="#171717" opacity=".22" /><path d="m8.7 9.2 1.4-1.4 2 2-1.4 1.4-2-2Zm3 3 1.4-1.4 2 2-1.4 1.4-2-2Zm3 3 1.4-1.4 2 2-1.4 1.4-2-2Z" fill="#171717" /></>, props);
export const CubeFilled = (props: Props) => icon(<><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" opacity=".3" /><path d="m12 4.3 6.9 3.8-6.9 3.8-6.9-3.8L12 4.3Z" /><path d="M5 9.5v6.1l6 3.3v-6.1l-6-3.3Z" opacity=".72" /><path d="M13 12.8v6.1l6-3.3V9.5l-6 3.3Z" opacity=".46" /><path d="m12 5.8 3.8 2.1-3.8 2.1-3.8-2.1L12 5.8Z" fill="#171717" opacity=".2" /></>, props);
export const NavigationFilled = (props: Props) => icon(<><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" opacity=".26" /><path d="m12 4 5.2 5.2-3.4 1-1 3.4L12 20l-5.2-5.2 3.4-1 1-3.4L12 4Z" /><path d="m12 7 2.8 2.8-1.8.5-.5 1.8L12 15l-2.8-2.8 1.8-.5.5-1.8L12 7Z" fill="#171717" opacity=".25" /></>, props);
