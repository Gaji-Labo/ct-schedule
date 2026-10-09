"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          // success / error / warning / info は Alert と同じ feedback-* トークンで色付けする
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:data-[type=success]:border-feedback-success-border group-[.toaster]:data-[type=success]:bg-feedback-success-subtle group-[.toaster]:data-[type=success]:text-feedback-success-foreground group-[.toaster]:data-[type=success]:[&_[data-icon]]:text-feedback-success-icon group-[.toaster]:data-[type=success]:[&_[data-description]]:text-feedback-success-foreground group-[.toaster]:data-[type=error]:border-feedback-destructive-border group-[.toaster]:data-[type=error]:bg-feedback-destructive-subtle group-[.toaster]:data-[type=error]:text-feedback-destructive-foreground group-[.toaster]:data-[type=error]:[&_[data-icon]]:text-feedback-destructive-icon group-[.toaster]:data-[type=error]:[&_[data-description]]:text-feedback-destructive-foreground group-[.toaster]:data-[type=warning]:border-feedback-warning-border group-[.toaster]:data-[type=warning]:bg-feedback-warning-subtle group-[.toaster]:data-[type=warning]:text-feedback-warning-foreground group-[.toaster]:data-[type=warning]:[&_[data-icon]]:text-feedback-warning-icon group-[.toaster]:data-[type=warning]:[&_[data-description]]:text-feedback-warning-foreground group-[.toaster]:data-[type=info]:border-feedback-info-border group-[.toaster]:data-[type=info]:bg-feedback-info-subtle group-[.toaster]:data-[type=info]:text-feedback-info-foreground group-[.toaster]:data-[type=info]:[&_[data-icon]]:text-feedback-info-icon group-[.toaster]:data-[type=info]:[&_[data-description]]:text-feedback-info-foreground",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
