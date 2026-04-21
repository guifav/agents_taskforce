import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  isLoading = false,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbe00] disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-[#ffbe00] text-black hover:bg-[#e6ac00] shadow',
    secondary: 'bg-neutral-900 text-white hover:bg-neutral-800',
    outline: 'border border-neutral-800 bg-transparent hover:bg-neutral-900',
    ghost: 'hover:bg-neutral-900',
    link: 'text-[#ffbe00] underline-offset-4 hover:underline'
  };
  
  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-8 text-base',
    icon: 'h-9 w-9'
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
