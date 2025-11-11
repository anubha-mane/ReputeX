import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { IDL } from '@/lib/idl'

const PROGRAM_ID = new PublicKey('8EavuS1VJ6GXEwqdgm65mofBQSULf1nXY2pmvhbNyS7k')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      payerPublicKey, 
      agentPublicKey, 
      mintAddress, 
      amount,
      connection: rpcEndpoint 
    } = body

    if (!payerPublicKey || !agentPublicKey || !mintAddress || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const connection = new Connection(rpcEndpoint || 'https://api.devnet.solana.com')
    const payer = new PublicKey(payerPublicKey)
    const agent = new PublicKey(agentPublicKey)
    const mint = new PublicKey(mintAddress)

    // Create a mock wallet for the provider (we won't sign here, just build the instruction)
    const mockWallet = {
      publicKey: payer,
      signTransaction: async (tx: Transaction) => tx,
      signAllTransactions: async (txs: Transaction[]) => txs,
    }

    const provider = new AnchorProvider(connection, mockWallet as any, {
      preflightCommitment: 'processed',
    })

    const program = new Program(IDL as any, provider)

    // Derive the PDA for reputation account
    const [reputationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('reputation'), agent.toBuffer()],
      PROGRAM_ID
    )

    // Get token accounts
    const payerTokenAccount = await getAssociatedTokenAddress(mint, payer)
    const agentTokenAccount = await getAssociatedTokenAddress(mint, agent)

    // Build the instruction
    const instruction = await program.methods
      .logServiceTransaction(amount)
      .accounts({
        payer: payer,
        authority: agent,
        reputationAccount: reputationPda,
        mint: mint,
        payerTokenAccount: payerTokenAccount,
        agentTokenAccount: agentTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: new PublicKey('11111111111111111111111111111111'),
      })
      .instruction()

    // Return the serialized instruction
    return NextResponse.json({
      instruction: instruction.data.toString('base64'),
      programId: PROGRAM_ID.toString(),
      keys: instruction.keys.map(key => ({
        pubkey: key.pubkey.toString(),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
    })
  } catch (error: any) {
    console.error('Error building transaction:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to build transaction' },
      { status: 500 }
    )
  }
}
