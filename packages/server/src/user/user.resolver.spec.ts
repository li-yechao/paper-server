import { Test, TestingModule } from '@nestjs/testing'
import { UserResolver } from './user.resolver'

describe('UserResolver', () => {
  let resolver: UserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver],
    }).compile()

    resolver = module.get<UserResolver>(UserResolver)
  })

  it('should return user', async () => {
    expect(await resolver.user('TEST_USER_ID')).toEqual(
      expect.objectContaining({ id: 'TEST_USER_ID' })
    )
  })
})
