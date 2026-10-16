/**
 * shadcn/ui の Alert (new-york / Tailwind v3 版)
 * 変更点: info / success / warning variant を追加し、色は Semantic トークン feedback-* を使う
 * (背景・文字・枠線・アイコンの組み合わせで、文字は背景に対して 4.5:1 以上になるよう定義済み)
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground [&>svg]:text-foreground",
        info: "border-feedback-info-border bg-feedback-info-subtle text-feedback-info-foreground [&>svg]:text-feedback-info-icon",
        success:
          "border-feedback-success-border bg-feedback-success-subtle text-feedback-success-foreground [&>svg]:text-feedback-success-icon",
        warning:
          "border-feedback-warning-border bg-feedback-warning-subtle text-feedback-warning-foreground [&>svg]:text-feedback-warning-icon",
        destructive:
          "border-feedback-destructive-border bg-feedback-destructive-subtle text-feedback-destructive-foreground [&>svg]:text-feedback-destructive-icon",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
