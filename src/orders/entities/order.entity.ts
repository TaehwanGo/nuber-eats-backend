import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking', // restaurant can change
  Cooked = 'Cooked', // 주문이 픽업을 기다리고 있는 상태 // restaurant can change
  PickedUp = 'PickedUp', // delivery driver can change
  Delivered = 'Delivered', // delivery driver can change
}

/**
 * @Field(type => OrderStatus)
    status: OrderStatus;
 */
registerEnumType(OrderStatus, { name: 'OrderStatus' }); // you can reference the OrderStatus in our types for graphQL field

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  driver?: User; // 주문을 넣을땐 아직 driver가 배정되지 않았기 때문에 nullable: true
  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(type => Restaurant, restaurant => restaurant.orders, {
    // user가 많은 orders를 가졌던 것 처럼 restaurant도 orders를 가짐
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  restaurant?: Restaurant;

  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem, { eager: true })
  @JoinTable() // dish쪽에선 어떤 사람이 주문했는지 알 수 없지만 order쪽에선 알 수 있으므로 order : dish의 ManyToMany relation의 주도권은 order가 가져감
  items: OrderItem[]; // dishOption이 없으면 그냥 Dish[]로 저장해도 되지만 dishOption은 반드시 필요함 -> 따로 분리 : order-item.entity (Dish[] 대신)

  @Field(type => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(type => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
