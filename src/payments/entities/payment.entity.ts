import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(type => String)
  @Column()
  transactionId: string; // paddle이 넘겨주는 것

  @Field(type => User)
  @ManyToOne(type => User, user => user.payments)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant) // restaurant에서 payment로 접근할일이 없기 대문에 restaurant entity엔 만들지 않음
  restaurant: Restaurant;

  @Field(type => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
