import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entitiy';

// resolver : controller 에서 service(구체적 구현)까지 다 구현한 것
@Resolver(() => Restaurant) // entity에서 만든 Restaurant objectType을 resolver가 반환할 것임을 알려 줌
export class RestaurantsResolver {
  @Query(() => Restaurant) // controller라면 @Get 이나 @Post 였겠지만 graphql은 @Query나 @Mutation
  myRestaurant() {
    // controller는 constructor의 parameter로 service를 받아서 return this.service.function하지만
    // resolver는 이미 provider이고 여기에서 구체적으로 구현 후 return
    return true;
  }
}
