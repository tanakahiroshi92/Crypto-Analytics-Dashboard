import { cn } from '../../utils/cn';

export const Card = ({ className, children, hover = true, ...props }) => {
  return (
    <div
      className={cn(
        // Base glassmorphism styles
        "relative overflow-hidden rounded-2xl border border-white/10",
        "bg-white/5 backdrop-blur-xl",
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
        
        // Dark mode support
        "dark:bg-gray-800/20 dark:border-gray-700/20",
        
        // Hover effects
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_64px_0_rgba(31,38,135,0.5)]",
        
        className
      )}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-3", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
};
