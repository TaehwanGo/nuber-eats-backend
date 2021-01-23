import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType() // 사람들이 주문을 필터링 할 수 있게 하기위해 InputType
export class GetOrdersInput {
  @Field(type => OrderStatus, { nullable: true }) // 모든 주문을 보거나 일부만 볼 수 있게 nullable true
  status: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(type => [Order], { nullable: true })
  orders?: Order[];
}
