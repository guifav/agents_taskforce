import React from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative grid w-full max-w-lg gap-4 border border-neutral-800 bg-neutral-950 p-6 shadow-lg rounded-xl ${className}`}
    {...props}
  >
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className = '', ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    {...props}
  />
);

export const DialogTitle = React.forwardRef(({ className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef(({ className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-neutral-500 ${className}`}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';
