import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDTO } from './create-restaurant.dto';

@InputType() // resolver, mutation에 어떤 restaurant를 수정할 건지 알려주기 위해 id가 필요 함
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDTO) {
  // UpdateRestaurantDTO -> UpdateRestaurantInputType으로 클래스명 변경
  // Restaurant(entity)를 PartialType으로 하지 않은 이유는 id가 옵션이 되기때문, update하기위해서 id가 필수임
}

@ArgsType()
export class UpdateRestaurantDTO {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
