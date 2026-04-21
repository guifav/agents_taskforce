import React from 'react';

const Badge = React.forwardRef(({ className = '', variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-[#ffbe00]/10 text-[#ffbe00] border-[#ffbe00]/20',
    secondary: 'bg-neutral-900 text-neutral-300 border-neutral-800',
    outline: 'text-neutral-300 border-neutral-800',
    destructive: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  
  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export default Badge;
