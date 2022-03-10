import { createMock } from '@golevelup/ts-jest'
import { ExecutionContext } from '@nestjs/common'
import { keys } from 'libp2p-crypto'
import { AuthGuard, EXPIRES_IN } from './auth.guard'

describe('AuthGuard', () => {
  it('it should be success', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const publickey = Buffer.from(key.public.bytes).toString('base64')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = Buffer.from(
      await key.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))
    ).toString('base64')

    const guard = new AuthGuard()
    await expect(
      guard.canActivate(mockContext({ headers: { publickey, timestamp, signature } }))
    ).resolves.toBeTruthy()
  })

  it('missing publickey or timestamp or signature', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const publickey = Buffer.from(key.public.bytes).toString('base64')
    const timestamp = (Math.floor(Date.now() / 1000) - EXPIRES_IN - 1).toString()
    const signature = Buffer.from(
      await key.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))
    ).toString('base64')

    const guard = new AuthGuard()

    await expect(() =>
      guard.canActivate(mockContext({ headers: { timestamp, signature } }))
    ).rejects.toThrowError(/publickey/i)

    await expect(() =>
      guard.canActivate(mockContext({ headers: { publickey, signature } }))
    ).rejects.toThrowError(/timestamp/i)

    await expect(() =>
      guard.canActivate(mockContext({ headers: { publickey, timestamp } }))
    ).rejects.toThrowError(/signature/i)
  })

  it('invalid timestamp', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const publickey = Buffer.from(key.public.bytes).toString('base64')
    const timestamp = 'NaN'
    const signature = Buffer.from(
      await key.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))
    ).toString('base64')

    const guard = new AuthGuard()
    await expect(() =>
      guard.canActivate(mockContext({ headers: { publickey, timestamp, signature } }))
    ).rejects.toThrowError(/timestamp/i)
  })

  it('invalid signature', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const otherKey = await keys.generateKeyPair('Ed25519')
    const publickey = Buffer.from(key.public.bytes).toString('base64')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = Buffer.from([
      ...(await key.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))),
      // Invalid signature
      1,
      2,
      3,
    ]).toString('base64')

    const guard = new AuthGuard()
    await expect(() =>
      guard.canActivate(mockContext({ headers: { publickey, timestamp, signature } }))
    ).rejects.toThrowError(/signature/i)

    await expect(async () =>
      guard.canActivate(
        mockContext({
          headers: {
            publickey,
            timestamp,
            signature: Buffer.from(
              await otherKey.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))
            ).toString('base64'),
          },
        })
      )
    ).rejects.toThrowError(/signature/i)
  })

  it('timestamp expired', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const publickey = Buffer.from(key.public.bytes).toString('base64')
    const timestamp = (Math.floor(Date.now() / 1000) - EXPIRES_IN - 1).toString()
    const signature = Buffer.from(
      await key.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))
    ).toString('base64')

    const guard = new AuthGuard()
    await expect(() =>
      guard.canActivate(mockContext({ headers: { publickey, timestamp, signature } }))
    ).rejects.toThrowError(/expired/i)
  })

  it('unsupported key', async () => {
    const key = await keys.generateKeyPair('RSA', 2048)
    const publickey = Buffer.from(key.public.bytes).toString('base64')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = Buffer.from(
      await key.sign(Buffer.from(new URLSearchParams({ timestamp }).toString()))
    ).toString('base64')

    const guard = new AuthGuard()
    await expect(() =>
      guard.canActivate(mockContext({ headers: { publickey, timestamp, signature } }))
    ).rejects.toThrowError(/unsupported/i)
  })
})

function mockContext({ headers }: { headers: Record<string, string> }) {
  return createMock<ExecutionContext>({
    getArgs: () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <any[]>[{}, { req: { get: (key: string) => headers[key] } }, {}],
  })
}
