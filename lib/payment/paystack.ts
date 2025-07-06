export interface PaystackPaymentData {
  email: string
  amount: number
  reference: string
  callback_url: string
  metadata: {
    memberId: string
    packageType: string
    firstName: string
    lastName: string
  }
}

export async function initializePaystackPayment(data: PaystackPaymentData) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  return result
}

export async function verifyPaystackPayment(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  })

  const result = await response.json()
  return result
}
