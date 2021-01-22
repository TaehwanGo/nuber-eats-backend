import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
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

  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  // categoryService를 만들지 않는 이유는 작기 때문에 만약 서비스가 필요하다면 모듈을 따로 분리함
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(type => Int) // Parent(Category)의 field임(Resolver(of => Category))
  // dynamic field, 매 request마다 계산된 field를 만들어줌
  restaurantCount(@Parent() category: Category): Promise<number> {
    // return type을 Promise로 한것만으로도 브라우저가 알아서 기다림
    // @Parent() : this will give you currently being processed
    console.log('category:', category);
    return this.restaurantService.countRestaurants(category);
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}
