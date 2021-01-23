import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from 'src/restaurants/entities/dish.endtity';
import { Order } from '../entities/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['items']) {
  // order를 만들때 dish의 모든 정보는 필요 없음 - name, price만 필요 : 이 다음 commit에서 확인
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
