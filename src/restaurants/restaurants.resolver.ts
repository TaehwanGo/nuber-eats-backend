import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurants.service';

// resolver : controller 에서 service(구체적 구현)까지 다 구현한 것
@Resolver(() => Restaurant) // entity에서 만든 Restaurant objectType을 resolver가 반환할 것임을 알려 줌
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {} // **3. resolver에 service를 import (providers에 등록된)

  @Query(() => [Restaurant]) // controller라면 @Get 이나 @Post 였겠지만 graphql은 @Query나 @Mutation
  restaurant(): Promise<Restaurant[]> {
    // Promise<T> 응답을 기다렸다가 오면 return함
    // controller는 constructor의 parameter로 service를 받아서 return this.service.function하지만
    // resolver는 이미 provider이고 여기에서 구체적으로 구현 후 return
    return this.restaurantService.getAll();
  }
  @Mutation(() => Boolean)
  async createRestaurant(
    @Args('input') createRestaurantDTO: CreateRestaurantDTO,
  ): Promise<boolean> {
    // Args를 하나하나 적어주는 것을 받는 것과 똑같은데 여기서 볼땐 더 깔끔하게 보임
    // 여전히 data가 잘 저장 됐는지를 boolean으로 return 하기 위해 async await을 사용
    console.log(createRestaurantDTO);
    try {
      await this.restaurantService.createRestaurant(createRestaurantDTO);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
