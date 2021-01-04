import { ArgsType, Field } from '@nestjs/graphql';

/** resolver의 Mutation의 createRestaurant의 Args들이 아래와 같이 항목에서 DTO로 변경
 * @Args('name') name: string,
    @Args('isVegan') isVegan: boolean,
    @Args('address') address: string,
    @Args('ownerName') ownerName: string,
 */
@ArgsType()
export class CreateRestaurantDTO {
  @Field(() => String)
  name: string;
  @Field(() => Boolean)
  isVegan: boolean;
  @Field(() => String)
  address: string;
  @Field(() => String)
  ownerName: string;
}
