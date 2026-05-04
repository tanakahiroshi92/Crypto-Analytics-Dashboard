import { cn } from '../../utils/cn';

export const Button = ({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 text-gray-900 dark:text-white hover:bg-white/20 backdrop-blur-sm',
    ghost: 'hover:bg-white/10 text-gray-700 dark:text-gray-300',
    outline: 'border border-white/20 bg-transparent hover:bg-white/10 text-gray-700 dark:text-gray-300',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
