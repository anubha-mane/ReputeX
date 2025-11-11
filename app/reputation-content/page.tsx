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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#14F195] to-[#9945FF] font-sans">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-8 mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔓 Premium Content Unlocked</h2>
            <p className="text-gray-700 leading-relaxed mb-6 font-medium">
              You deserve the best! Here are some happy, wealthy cats living their best lives. 🐱💰✨
            </p>
            <p className="text-sm text-purple-600 mb-6">
              Payment processed through Solana blockchain with reputation tracking!
            </p>
            <CatsComponent contentType="expensive" />
          </div>

          {/* Show updated reputation */}
          <div className="mb-8">
            <ViewReputation agentPublicKey={EXAMPLE_AGENT} />
          </div>

          {txSignature && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">✅ Transaction Confirmed</p>
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

          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
            
            <Link
              href="/reputation-payment"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Make Another Payment
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ReputationContentPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#14F195] to-[#9945FF]">
        <div className="text-white text-xl">Loading content...</div>
      </div>
    }>
      <ReputationContentInner />
    </Suspense>
  )
}
