'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, Keypair, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { IDL } from '../lib/idl'

const PROGRAM_ID = new PublicKey('8EavuS1VJ6GXEwqdgm65mofBQSULf1nXY2pmvhbNyS7k')
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export function RegisterIdentity() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [username, setUsername] = useState('')
  const [symbol, setSymbol] = useState('')
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const registerIdentity = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setStatus('Please connect your wallet first')
      return
    }

    if (!username || !symbol || !uri) {
      setStatus('Please fill all fields')
      return
    }

    setLoading(true)
    setStatus('Creating identity...')

    try {
      const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: 'processed',
      })

      const program = new Program(IDL as any, provider)

      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate()

      // Derive the PDA for identity account
      const [identityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('identity'), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      )

      // Derive the associated token account
      const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      )

      // Derive metadata account
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      // Derive master edition account
      const [masterEditionAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      setStatus('Sending transaction...')

      const tx = await program.methods
        .registerIdentity(username, symbol, uri)
        .accounts({
          identityAccount: identityPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccount,
          metadataAccount: metadataAccount,
          masterEditionAccount: masterEditionAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc()

      setStatus(`Success! Transaction: ${tx}`)
      console.log('Transaction signature:', tx)
      
      // Clear form
      setUsername('')
      setSymbol('')
      setUri('')
    } catch (error: any) {
      console.error('Error:', error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-4">Register Identity</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        Create your on-chain identity with an NFT badge
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username (max 50 chars)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
            placeholder="alice"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Symbol (e.g., ID, BADGE)</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
            placeholder="ID"
            maxLength={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Metadata URI (max 200 chars)</label>
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
            placeholder="https://arweave.net/..."
            maxLength={200}
          />
        </div>

        <button
          onClick={registerIdentity}
          disabled={loading || !wallet.connected}
          className="w-full px-6 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : wallet.connected ? 'Register Identity' : 'Connect Wallet First'}
        </button>

        {status && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-zinc-800 rounded text-sm break-all">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
