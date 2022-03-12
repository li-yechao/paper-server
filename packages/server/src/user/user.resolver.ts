import { Args, Query, Resolver } from '@nestjs/graphql'
import { User } from './user.schema'

@Resolver()
export class UserResolver {
  @Query(() => User)
  async user(@Args('userId') userId: string): Promise<User> {
    return { id: userId }
  }
}
