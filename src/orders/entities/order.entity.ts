import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.endtity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

/**
 * @Field(type => OrderStatus)
    status: OrderStatus;
 */
registerEnumType(OrderStatus, { name: 'OrderStatus' }); // you can reference the OrderStatus in our types for graphQL field

@InputType('OrderInputType', { isAbstract: true }) // isAbstract: true는 InputType이 스키마에 포함되지 않는 다는 뜻 : 직접 사용하는 게 아닌 확장시킨다는 말(이해 못 함)
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User; // 주문을 넣을땐 아직 driver가 배정되지 않았기 때문에 nullable: true

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant, restaurant => restaurant.orders, {
    // user가 많은 orders를 가졌던 것 처럼 restaurant도 orders를 가짐
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant: Restaurant;

  @Field(type => [Dish])
  @ManyToMany(type => Dish)
  @JoinTable() // dish쪽에선 어떤 사람이 주문했는지 알 수 없지만 order쪽에선 알 수 있으므로 order : dish의 ManyToMany relation의 주도권은 order가 가져감
  dishes: Dish[];

  @Field(type => Float, { nullable: true })
  @Column({ nullable: true })
  total?: number;

  @Field(type => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;
}
