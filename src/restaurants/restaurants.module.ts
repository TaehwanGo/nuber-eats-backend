import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantsResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])], // entity가 여러개라면 여러개 import 가능
  // graphql은 post방식으로 query를 받기 때문에 controller가 없는 것 같다.
  providers: [RestaurantsResolver, RestaurantService], // provider == service, graphql에선 서비스(구체적 구현부)가 resolver
})
export class RestaurantsModule {}
