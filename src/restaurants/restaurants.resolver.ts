import { SetMetadata } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurants.service';

// resolver : controller 에서 service(구체적 구현)까지 다 구현한 것
@Resolver(() => Restaurant) // entity에서 만든 Restaurant objectType을 resolver가 반환할 것임을 알려 줌
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {} // **3. resolver에 service를 import (providers에 등록된)

  @Mutation(() => CreateRestaurantOutput)
  @Role(['Owner']) // @SetMetadata('role', UserRole.Owner) // 단지 resolver에 metadata를 세팅하는 것
  async createRestaurant(
    @AuthUser() authUser: User, // owner를 입력으로 받는게 아니라 로그인한 유저정보를 가져오는 방식
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }
}
