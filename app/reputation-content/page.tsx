'use client'

import { CatsComponent } from '@/components/cats-component'
import { ViewReputation } from '@/components/view-reputation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const EXAMPLE_AGENT = 'DwgYs4yR538ac5ZRKxx9fm4S3FhYvMZHiXsUqtPJrooB'

function ReputationContentInner() {
  const searchParams = useSearchParams()
  const txSignature = searchParams.get('tx')

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center py-16 px-6 bg-white dark:bg-black">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">Premium Content</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Unlocked after payment. Enjoy some delightful luxury cats and check your updated on-chain reputation.
          </p>

          <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3">Unlocked Content</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Payment processed on Solana with reputation tracking.
            </p>
            <CatsComponent contentType="expensive" />
          </div>

          {/* Show updated reputation */}
          <div className="mb-8 border-t border-gray-200 dark:border-zinc-800 pt-6">
            <ViewReputation agentPublicKey={EXAMPLE_AGENT} />
          </div>

          {txSignature && (
            <div className="bg-green-50 dark:bg-zinc-900 border border-green-200 dark:border-zinc-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">✅ Transaction confirmed</p>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline break-all"
              >
                View on Solana Explorer
              </a>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-neutral-800 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
            <Link
              href="/reputation-payment"
              className="px-5 py-2.5 bg-neutral-800 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Make another payment
            </Link>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            You can revisit this page anytime with your transaction signature.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ReputationContentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-gray-700 dark:text-gray-200 text-xl">Loading content...</div>
      </div>
    }>
      <ReputationContentInner />
    </Suspense>
  )
}
