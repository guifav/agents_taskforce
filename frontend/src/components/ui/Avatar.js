import React from 'react';

export const Avatar = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-lg ${className}`}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

export const AvatarFallback = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-lg bg-neutral-900 text-[#ffbe00] font-medium ${className}`}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';
