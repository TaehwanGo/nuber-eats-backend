import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entitiy';

/** resolver의 Mutation의 createRestaurant의 Args들이 아래와 같이 항목에서 DTO로 변경
 * @Args('name') name: string,
    @Args('isVegan') isVegan: boolean,
    @Args('address') address: string,
    @Args('ownerName') ownerName: string,
 */
@InputType() // resolver에서 @Args()를 @Args('input')으로 수정 - Omit Mapped Types를 사용하는데 InputType을 만들기 때문
export class CreateRestaurantDTO extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {} // InputType을 필요로 하는데 entity(Restaurant)는 objectType임 그래서 option으로 InputType을 원한다고 적어줌
// parent(상속개념에서) : Restautant(ObjectType), InputType을 옵션으로 넘겨줌으로써 parentType을 InputType으로 변경
