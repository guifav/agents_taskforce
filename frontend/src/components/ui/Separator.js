import React from 'react';

export const Separator = React.forwardRef(({ className = '', orientation = 'horizontal', ...props }, ref) => {
  const orientations = {
    horizontal: 'h-px w-full',
    vertical: 'h-full w-px'
  };
  
  return (
    <div
      ref={ref}
      className={`shrink-0 bg-neutral-800 ${orientations[orientation]} ${className}`}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';
