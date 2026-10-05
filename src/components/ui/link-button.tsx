"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const linkButtonVariants = cva(
  "group/link-button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform,filter] duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/35 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-brand text-primary-foreground shadow-sm hover:shadow-glow hover:brightness-[1.07] dark:hover:brightness-110",
        outline:
          "border-border bg-card text-foreground shadow-xs hover:border-primary/35 hover:bg-accent hover:text-accent-foreground hover:shadow-sm aria-expanded:border-primary/35 aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_7%)] hover:shadow-sm aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-foreground/80 hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 hover:shadow-sm focus-visible:border-destructive focus-visible:ring-destructive/25 dark:bg-destructive dark:text-white",
        link: "h-auto rounded-sm p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        xs: "h-7 gap-1.5 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 gap-2 rounded-lg px-6 text-[0.9375rem] [&_svg:not([class*='size-'])]:size-[1.125rem]",
        icon: "size-9",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkButtonVariants> {
  href: string;
}

export function LinkButton({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(linkButtonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  );
}