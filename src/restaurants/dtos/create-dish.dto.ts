import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.endtity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  // 'description',
  'options',
  'photo',
]) {
  @Field(type => Int)
  restaurantId: number;

  @Field(type => String)
  description: string;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
