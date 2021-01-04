import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  // Restaurant의 objectType
  // 아직 DB는 없지만 모든 특징들을 살펴본뒤 DB를 추가 할 것임(TypeORM)
  // GraphQL 관점에서 본 Restaurnat가 어떻게 생겼는지 묘사 할 것임
  @Field(() => String)
  name: string;

  @Field(() => Boolean, { nullable: true })
  isGood?: boolean;
}
