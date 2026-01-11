"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#0d0d0d] group-[.toaster]:border-[#b3b3b3] group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-[#4d4d4d]',
          actionButton: 'group-[.toast]:bg-[#5e89e8] group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-[#f2f2f2] group-[.toast]:text-[#4d4d4d]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
