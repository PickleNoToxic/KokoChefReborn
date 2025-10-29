"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Toast } from "@/components/toast"
import { v4 as uuid } from "uuid"

interface ToastContextType {
  addToast: (message: string, error?: boolean) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<any[]>([])

  const addToast = (message: string, error?: boolean) => {
    const id = uuid()
    setToasts((prev) => [...prev, { id, message, error }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
