'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { IDL } from '@/lib/idl'

const PROGRAM_ID = new PublicKey('8EavuS1VJ6GXEwqdgm65mofBQSULf1nXY2pmvhbNyS7k')

interface ServicePaymentProps {
  agentPublicKey: string
  amount: string // in USDC (e.g., "0.01")
  mintAddress: string // USDC mint address
  onSuccess?: (txSignature: string) => void
  onError?: (error: Error) => void
  children?: React.ReactNode
}

export function ServicePayment({
  agentPublicKey,
  amount,
  mintAddress,
  onSuccess,
  onError,
  children,
}: ServicePaymentProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const processPayment = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setStatus('Please connect your wallet first')
      return
    }

    setLoading(true)
    setStatus('Processing payment through reputation system...')

    try {
      const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: 'processed',
      })

      const program = new Program(IDL as any, provider)

      const agent = new PublicKey(agentPublicKey)
      const mint = new PublicKey(mintAddress)

      // Convert amount to lamports (USDC has 6 decimals)
      const amountLamports = new BN(parseFloat(amount) * 1_000_000)

      // Derive the PDA for reputation account
      const [reputationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('reputation'), agent.toBuffer()],
        PROGRAM_ID
      )

      // Get token accounts
      const payerTokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey)
      const agentTokenAccount = await getAssociatedTokenAddress(mint, agent)

      setStatus('Sending transaction...')

      const tx = await program.methods
        .logServiceTransaction(amountLamports)
        .accounts({
          payer: wallet.publicKey,
          authority: agent,
          reputationAccount: reputationPda,
          mint: mint,
          payerTokenAccount: payerTokenAccount,
          agentTokenAccount: agentTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      setStatus(`Success! Transaction: ${tx}`)
      console.log('Transaction signature:', tx)
      
      if (onSuccess) {
        onSuccess(tx)
      }
    } catch (error: any) {
      console.error('Error:', error)
      const errorMsg = error.message || 'Payment failed'
      setStatus(`Error: ${errorMsg}`)
      
      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {children ? (
        <div onClick={processPayment} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <button
          onClick={processPayment}
          disabled={loading || !wallet.connected}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : wallet.connected ? `Pay ${amount} USDC` : 'Connect Wallet First'}
        </button>
      )}

      {status && (
        <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded text-sm break-all">
          {status}
        </div>
      )}
    </div>
  )
}
