import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMemberId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `BO${timestamp}${random}`
}

export function generatePin(): string {
  // Generate a 12-character PIN with letters and numbers
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let pin = "PIN"

  for (let i = 0; i < 9; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return pin
}

export function generateTrackingNumber(): string {
  // Generate a tracking number for package delivery
  const prefix = "BO"
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0")

  return `${prefix}${timestamp}${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function calculateCommission(level: number, amount: number): number {
  // Commission structure for 6-level matrix
  const commissionRates = {
    1: 0.1, // 10% for level 1
    2: 0.08, // 8% for level 2
    3: 0.06, // 6% for level 3
    4: 0.04, // 4% for level 4
    5: 0.03, // 3% for level 5
    6: 0.02, // 2% for level 6
  }

  return amount * (commissionRates[level as keyof typeof commissionRates] || 0)
}
