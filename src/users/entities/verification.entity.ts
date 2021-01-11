import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User) // user는 오직 하나의 verification만 가질 수 있고 verification도 오직 하나의 user만 가질 수 있음
  @JoinColumn() // OneToOne relation 에선 반드시 JoinColumn이 어느한쪽엔 필수이고 JoinColumn이 포함된 entity는 반대쪽 id를 foreign key로 가짐 // JoinColumn을 가진쪽에서만 접근 할 수 있음
  user: User;
}
