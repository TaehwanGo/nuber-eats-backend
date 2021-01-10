import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  // CoreOutput으로 이름 변경 예정
  @Field((type) => String, { nullable: true })
  error?: string;

  @Field((type) => Boolean)
  ok: boolean;
}
