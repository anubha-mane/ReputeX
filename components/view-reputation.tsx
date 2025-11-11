'use client'

import { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { IDL } from '@/lib/idl'

const PROGRAM_ID = new PublicKey('8EavuS1VJ6GXEwqdgm65mofBQSULf1nXY2pmvhbNyS7k')

interface ReputationData {
  authority: string
  totalTransactions: number
  totalVolume: number
  totalReviews: number
  totalRatingScore: number
  averageRating: number
}

interface ViewReputationProps {
  agentPublicKey: string
}

export function ViewReputation({ agentPublicKey }: ViewReputationProps) {
  const { connection } = useConnection()
  const [reputation, setReputation] = useState<ReputationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchReputation = async () => {
    setLoading(true)
    setError('')

    try {
      const agent = new PublicKey(agentPublicKey)

      // Create a dummy wallet for reading
      const dummyWallet = {
        publicKey: agent,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      }

      const provider = new AnchorProvider(connection, dummyWallet as any, {
        preflightCommitment: 'processed',
      })

      const program = new Program(IDL as any, provider)

      // Derive the PDA for reputation account
      const [reputationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('reputation'), agent.toBuffer()],
        PROGRAM_ID
      )

      // Fetch the account
      const reputationAccount = await connection.getAccountInfo(reputationPda)
      
      if (!reputationAccount) {
        throw new Error('Reputation account not found')
      }

      // Decode the account data manually
      // Skip the 8-byte discriminator
      const data = reputationAccount.data.slice(8)
      
      // Parse the account structure:
      // authority: 32 bytes (Pubkey)
      // total_transactions: 8 bytes (u64)
      // total_volume: 8 bytes (u64)
      // total_reviews: 8 bytes (u64)
      // total_rating_score: 8 bytes (u64)
      // bump: 1 byte (u8)
      
      // Helper function to read u64 as little endian
      const readU64LE = (buffer: Uint8Array, offset: number): number => {
        let value = 0
        for (let i = 0; i < 8; i++) {
          value += buffer[offset + i] * Math.pow(2, 8 * i)
        }
        return value
      }
      
      const authority = new PublicKey(data.slice(0, 32))
      const totalTransactions = readU64LE(data, 32)
      const totalVolume = readU64LE(data, 40)
      const totalReviews = readU64LE(data, 48)
      const totalRatingScore = readU64LE(data, 56)
      
      setReputation({
        authority: authority.toString(),
        totalTransactions,
        totalVolume: totalVolume / 1_000_000, // Convert from lamports
        totalReviews,
        totalRatingScore,
        averageRating: totalReviews > 0 ? totalRatingScore / totalReviews : 0,
      })
    } catch (err: any) {
      console.error('Error fetching reputation:', err)
      setError(err.message || 'Failed to fetch reputation. Agent may not have initialized their reputation account.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (agentPublicKey) {
      fetchReputation()
    }
  }, [agentPublicKey])

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading reputation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchReputation}
          className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!reputation) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Agent Reputation
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {reputation.totalTransactions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${reputation.totalVolume.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume (USDC)</div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {reputation.totalReviews}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {reputation.averageRating > 0 ? reputation.averageRating.toFixed(1) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 break-all">
        <strong>Agent:</strong> {reputation.authority}
      </div>

      <button
        onClick={fetchReputation}
        className="mt-4 w-full text-sm text-purple-600 dark:text-purple-400 hover:underline"
      >
        🔄 Refresh
      </button>
    </div>
  )
}
