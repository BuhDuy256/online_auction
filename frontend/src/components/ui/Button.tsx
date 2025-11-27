import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import "./Button.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const classes = clsx("btn", `btn-${variant}`, `btn-${size}`, className);

    return (
      <Comp
        className={classes}
        ref={ref}
        disabled={isLoading || disabled}
        aria-disabled={isLoading || disabled}
        {...props}
      >
        {/* Logic hiển thị: Nếu loading thì hiện spinner, Text vẫn giữ nguyên hoặc thay đổi tùy ý */}
        {isLoading && <span className="spinner" aria-hidden="true" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export default Button;
