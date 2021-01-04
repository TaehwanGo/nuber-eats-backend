import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

/** resolver의 Mutation의 createRestaurant의 Args들이 아래와 같이 항목에서 DTO로 변경
 * @Args('name') name: string,
    @Args('isVegan') isVegan: boolean,
    @Args('address') address: string,
    @Args('ownerName') ownerName: string,
 */
@ArgsType()
export class CreateRestaurantDTO {
  @Field(() => String)
  @IsString()
  @Length(5, 10) // name의 length는 min:5, max: 10 <- validation pipe line을 만들어야 동작함(main.ts)
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  ownerName: string;
}
