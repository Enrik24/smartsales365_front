import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const spinnerVariants = cva('animate-spin rounded-full border-solid', {
  variants: {
    variant: {
      primary: 'border-primary border-t-transparent',
      secondary: 'border-white border-t-transparent',
    },
    size: {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-4',
      lg: 'h-16 w-16 border-8',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

const Spinner = ({ variant, size, className }: SpinnerProps) => {
  return <div className={cn(spinnerVariants({ variant, size }), className)} />;
};

export default Spinner;
