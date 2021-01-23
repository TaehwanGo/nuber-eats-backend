import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish, DishOption } from 'src/restaurants/entities/dish.endtity';
import { Order } from '../entities/order.entity';

@InputType()
class CreateOrderItemInput {
  @Field(type => Int)
  dishId: number;

  @Field(type => [DishOption], { nullable: true })
  options?: DishOption[];
}

@InputType()
export class CreateOrderInput {
  //  extends PickType(Order, ['items']) 고객이 주문하는데 dish의 모든 정보를 입력해야 될 필요는 없음
  // order를 만들때 dish의 모든 정보는 필요 없음 - name, price만 필요 : 이 다음 commit에서 확인
  @Field(type => Int)
  restaurantId: number;

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
