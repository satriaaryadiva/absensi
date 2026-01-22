"use client"

import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            className="toaster group"
            style={
                {
                    "--normal-bg": "hsl(var(--background))",
                    "--normal-text": "hsl(var(--foreground))",
                    "--normal-border": "hsl(var(--border))",
                    "--success-bg": "hsl(142.1 76.2% 36.3%)",
                    "--success-text": "hsl(0 0% 100%)",
                    "--error-bg": "hsl(var(--destructive))",
                    "--error-text": "hsl(0 0% 100%)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
                    success: "group-[.toaster]:bg-green-600 group-[.toaster]:text-white group-[.toaster]:border-green-700",
                    error: "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-red-700",
                },
            }}
            {...props}
        />
    )
}

export { Toaster, toast }
