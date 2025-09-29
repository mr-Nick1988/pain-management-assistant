import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const selectVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        error: "border-red-500 focus-visible:ring-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <select
        className={cn(selectVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

export { Select };
