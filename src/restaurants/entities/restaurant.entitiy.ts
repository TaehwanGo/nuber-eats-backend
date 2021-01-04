import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @ObjectType()
// export class Restaurant {
//   // Restaurant의 objectType
//   // 아직 DB는 없지만 모든 특징들을 살펴본뒤 DB를 추가 할 것임(TypeORM)
//   // GraphQL 관점에서 본 Restaurnat가 어떻게 생겼는지 묘사 할 것임
//   @Field(() => String)
//   name: string;

//   @Field(() => Boolean)
//   isVegan: boolean;

//   @Field(() => String)
//   address: string;

//   @Field(() => String)
//   ownerName: string;
// }

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Boolean)
  @Column()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  ownerName: string;

  @Field(() => String)
  @Column()
  categoryName: string;
}
