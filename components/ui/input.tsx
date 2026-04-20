import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-main">{label}</label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl border border-border bg-white",
          "text-text-main placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-400 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-main">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl border border-border bg-white",
          "text-text-main placeholder:text-muted",
          "focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral",
          "transition-all duration-200 resize-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-400 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
