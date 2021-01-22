import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.endtity';
import { Restaurant } from './entities/restaurant.entitiy';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver, RestaurantsResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  //**2. forFeature는 TypeOrmModule이 특정feature(Restaurant entity)를 import 할 수 있게 해줌
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])], // entity가 여러개라면 여러개 import 가능
  // graphql은 post방식으로 query를 받기 때문에 controller가 없는 것 같다.
  providers: [RestaurantsResolver, RestaurantService, CategoryResolver], // provider == service, graphql에선 서비스(구체적 구현부)가 resolver
})
export class RestaurantsModule {}
