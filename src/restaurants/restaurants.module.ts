import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';

@Module({
  // graphql은 post방식으로 query를 받기 때문에 controller가 없는 것 같다.
  providers: [RestaurantsResolver], // provider == service, graphql에선 서비스(구체적 구현부)가 resolver
})
export class RestaurantsModule {}
