import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // エラー・要対応。ほかの状態色と同じ淡い背景のパターン (塗りの赤は文字のコントラストが足りないため)
        destructive:
          "border-feedback-destructive-border bg-feedback-destructive-subtle text-feedback-destructive-foreground",
        outline: "text-foreground",
        // 状態を示す色付きパターン (Alert / toast と同じ feedback-* トークン)
        info: "border-feedback-info-border bg-feedback-info-subtle text-feedback-info-foreground",
        success:
          "border-feedback-success-border bg-feedback-success-subtle text-feedback-success-foreground",
        warning:
          "border-feedback-warning-border bg-feedback-warning-subtle text-feedback-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
