import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string };
const icon = (children: React.ReactNode, props: Props) => (
  <svg {...props} width={props.size ?? 20} height={props.size ?? 20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);

export const PlayFilled = (props: Props) => icon(<path d="M7 4.8v14.4c0 1.1 1.2 1.8 2.2 1.2l10.7-7.2a1.5 1.5 0 0 0 0-2.4L9.2 3.6C8.2 3 7 3.7 7 4.8Z" />, props);
export const FocusFilled = (props: Props) => icon(<path fillRule="evenodd" d="M4 3h5v2H6v3H4V3Zm10 0h6v5h-2V5h-4V3ZM4 16h2v3h3v2H4v-5Zm14 0h2v5h-6v-2h4v-3Z" />, props);
export const MoveFilled = (props: Props) => icon(<path fillRule="evenodd" d="m11 2-4 4h3v4H6V7L2 11l4 4v-3h4v4H7l4 4 4-4h-3v-4h4v3l4-4-4-4v3h-4V6h3l-4-4Z" />, props);
export const RotateFilled = (props: Props) => icon(<path fillRule="evenodd" d="M17.7 5.1A8 8 0 0 0 4.3 7.4l-1.8-1.1a10.1 10.1 0 0 1 17-2.7V1h2v7h-7V6h3.7a8 8 0 0 0-.5-.9ZM4.3 18.9a8 8 0 0 0 13.4-2.3l1.8 1.1a10.1 10.1 0 0 1-17 2.7V23h-2v-7h7v2H3.8c.1.3.3.6.5.9Z" />, props);
export const EditFaceFilled = (props: Props) => icon(<path fillRule="evenodd" d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 2.3L6.2 8.5 12 11.8l5.8-3.3L12 5.3Zm-6 5v5l5 2.8v-5L6 10.3Zm7 7.8 5-2.8v-5l-5 2.8v5Z" />, props);
export const SparkleFilled = (props: Props) => icon(<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 16l.7 1.8L7.5 18l-1.8.7L5 20.5l-.7-1.8L2.5 18l1.8-.7L5 16Z" />, props);
export const PointerFilled = (props: Props) => icon(<path d="m5 2 13.7 10.8-6 1.3 3.5 5.7-2.6 1.5-3.5-5.8-3.8 4.9L5 2Z" />, props);
export const DrawFilled = (props: Props) => icon(<path fillRule="evenodd" d="m14.8 3.2 6 6-10.9 10.9-7 1 1-7L14.8 3.2Zm-8.5 12-.5 3.2 3.2-.5 8.9-8.9-2.7-2.7-8.9 8.9ZM16.1 5.6l2.7 2.7 1.1-1.1-2.7-2.7-1.1 1.1Z" />, props);
export const MeasureFilled = (props: Props) => icon(<path fillRule="evenodd" d="m3 7 4-4 14 14-4 4L3 7Zm4-1.2L5.8 7 17 18.2l1.2-1.2L7 5.8Zm1.7 3.4 1.4-1.4 2 2-1.4 1.4-2-2Zm3 3 1.4-1.4 2 2-1.4 1.4-2-2Zm3 3 1.4-1.4 2 2-1.4 1.4-2-2Z" />, props);
export const CubeFilled = (props: Props) => icon(<path fillRule="evenodd" d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 2.3L5.1 8 12 11.8 18.9 8 12 4.3Zm-7 5.4v6.1l6 3.3v-6.1L5 9.7Zm8 9.4 6-3.3V9.7l-6 3.3v6.1Z" />, props);
export const NavigationFilled = (props: Props) => icon(<path fillRule="evenodd" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 3a7 7 0 0 1 5.7 2.9L14 9.2l-1.2 3.7-3.7 1.2-1.3 3.7A7 7 0 0 1 12 5Z" />, props);
