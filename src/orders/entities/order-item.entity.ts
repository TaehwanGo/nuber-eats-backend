import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishOption } from 'src/restaurants/entities/dish.endtity';
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

@InputType('OrderItemInputType', { isAbstract: true }) // isAbstract: true는 InputType이 스키마에 포함되지 않는 다는 뜻 : 직접 사용하는 게 아닌 확장시킨다는 말(이해 못 함)
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  // Dish : OrderItem == 1 : N
  // order item은 dish랑 연결 되어야 함
  @Field(type => Dish)
  @ManyToOne(type => Dish, { nullable: true, onDelete: 'CASCADE' }) // restaurant => restaurant.menu 같이 dish에서 order-item을 불러오지 않아도 되므로 reverse는 신경안씀
  // 우린 단지 OrderItem에서 Dish로 접근하기만을 원하므로 reverse와 Dish entity에선 언급하지 않음
  dish: Dish;

  @Field(type => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true }) // OneToMany & ManyToOne 대신 사용
  options?: DishOption[]; // menu의 option이 삭제되거나 변경되면 이전 주문에 영향을 줌 => 그래서 json으로 option은 order가 생성되고 완료될때까지 한번만 저장됨 - owner가 음식의 옵션을 수정해도 문제가 없음
}
