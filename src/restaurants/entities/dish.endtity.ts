import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entitiy';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
class DishChoice {
  @Field(type => String)
  name: string;
  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  @Field(type => String)
  name: string;
  @Field(type => [DishChoice], { nullable: true })
  choices?: DishChoice[];
  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true }) // isAbstract: true는 InputType이 스키마에 포함되지 않는 다는 뜻 : 직접 사용하는 게 아닌 확장시킨다는 말(이해 못 함)
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  photo?: string;

  @Field(type => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String)
  @Column()
  @Length(5, 140) // 글자수 제한
  description: string;

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant, restaurant => restaurant.menu, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(type => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true }) // OneToMany & ManyToOne 대신 사용
  options?: DishOption[];
}
