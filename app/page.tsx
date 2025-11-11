'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { RegisterIdentity } from '@/components/register-identity'
import { InitializeReputation } from '@/components/initialize-reputation'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center py-16 px-6 bg-white dark:bg-black">
        {/* Wallet Connect Button */}
        <div className="w-full flex justify-end mb-8">
          <WalletMultiButton />
        </div>

        <div className="w-full">
          <h1 className="text-4xl font-bold mb-4">Welcome to Solana Reputation Demo</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Create your on-chain identity and reputation on Solana.
          </p>

          {/* Identity & Reputation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RegisterIdentity />
            <InitializeReputation />
          </div>

          {/* Reputation Payment Only Section */}
          <div className="border-t border-gray-200 dark:border-zinc-800 pt-8">
            <h2 className="text-2xl font-bold mb-4">Reputation-Based Payment Demo</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Make a USDC payment through the Solana smart contract and update the agent's on-chain reputation.
            </p>
            <Link
              href="/reputation-payment"
              className="inline-block px-6 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Reputation Payment
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
