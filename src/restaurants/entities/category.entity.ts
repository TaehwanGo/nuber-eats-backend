import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entitiy';

@InputType('CategoryInputType', { isAbstract: true }) // isAbstract: true는 InputType이 스키마에 포함되지 않는 다는 뜻 : 직접 사용하는 게 아닌 확장시킨다는 말(이해 못 함)
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage: string;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @OneToMany(type => Restaurant, restaurant => restaurant.category) // 어떤 entity에 적용되는 것인지 알려주는 것 : type => Restaurant
  @Field(type => [Restaurant])
  restaurants: Restaurant[];
}
