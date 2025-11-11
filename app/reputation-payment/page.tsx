'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ServicePayment } from '@/components/service-payment'
import { ViewReputation } from '@/components/view-reputation'
import dynamic from 'next/dynamic'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

// USDC Devnet Mint Address
const USDC_MINT_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'

// Example agent address - replace with actual agent's wallet
const EXAMPLE_AGENT = 'DwgYs4yR538ac5ZRKxx9fm4S3FhYvMZHiXsUqtPJrooB'

export default function ReputationPaymentDemo() {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(false)

  const handlePaymentSuccess = (signature: string) => {
    // Redirect to premium content page after 1.5 seconds
    setTimeout(() => {
      router.push(`/reputation-content?tx=${signature}`)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center py-16 px-6 bg-white dark:bg-black">
        {/* Wallet Button */}
        <div className="w-full flex justify-end mb-8">
          <WalletMultiButton />
        </div>

        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">Reputation-Based Payment</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Pay with USDC and update the agent's on-chain reputation.
          </p>

          {/* Reputation Display */}
          <div className="mb-8 border-t border-gray-200 dark:border-zinc-800 pt-6">
            <ViewReputation agentPublicKey={EXAMPLE_AGENT} />
          </div>

          {!unlocked ? (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Payment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Amount: 0.01 USDC • Recipient: Agent
              </p>
              <div className="text-xs text-gray-500 mb-2">What happens when you pay:</div>
              <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
                <li>USDC transferred to the agent</li>
                <li>Transaction count increases</li>
                <li>Total volume tracked</li>
                <li>All recorded on-chain</li>
              </ul>
              <div className="mt-4">
                <ServicePayment
                  agentPublicKey={EXAMPLE_AGENT}
                  amount="0.01"
                  mintAddress={USDC_MINT_DEVNET}
                  onSuccess={(signature) => {
                    setUnlocked(true)
                    handlePaymentSuccess(signature)
                  }}
                  onError={(error) => {
                    console.error('Payment failed:', error)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Payment successful</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Updating reputation on-chain and redirecting to content...
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-neutral-800 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Ensure you have USDC on devnet • Reputation must be initialized
          </p>
        </div>
      </main>
    </div>
  )
}
