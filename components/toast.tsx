"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

import clsx from "clsx"

export interface ToastProps {
  id: string
  message: string
  error?: boolean
  duration?: number
  onClose?: (id: string) => void
}

export const Toast = ({ id, message, error = false, duration = 3000, onClose }: ToastProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => handleClose(), duration)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose && onClose(id)
    }, 300) 
  }

  return (
    <div
      className={clsx(
        "flex items-center gap-3 p-4 rounded-lg shadow-lg border w-80 max-w-full transition-transform transform",
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        "bg-white border border-gray-200 text-gray-900" 
      )}
    >

      {error ? <AlertCircle className="w-5 h-5 text-gray-900" /> : <CheckCircle className="w-5 h-5 text-gray-900" />}
      <span className="flex-1">{message}</span>
    </div>
  )
}
