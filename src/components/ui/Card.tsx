import React from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition-all hover:shadow-md dark:shadow-green-900/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: CardProps) => (
  <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: CardProps) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: CardProps) => (
  <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: CardProps) => (
  <div className={cn("pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: CardProps) => (
  <div className={cn("mt-4 flex items-center pt-0", className)} {...props}>
    {children}
  </div>
);
