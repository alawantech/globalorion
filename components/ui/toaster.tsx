"use client"

import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, variant }) {
        return (
          <div
            key={id}
            className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
              variant === "destructive"
                ? "border-red-500 bg-red-500 text-white"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            <button
              className="absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2"
              onClick={() => {
                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                  const toastElement = document.getElementById(id)
                  if (toastElement) {
                    toastElement.style.display = 'none'
                  }
                }, 3000)
              }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
