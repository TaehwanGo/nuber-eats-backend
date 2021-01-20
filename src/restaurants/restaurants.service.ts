import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entitiy';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Repository with entity
    private readonly restaurants: Repository<Restaurant>, // **4. Repository class를 사용해서 DB에 접근(Data mapper 방식)
    // @InjectRepository(Category)
    private readonly categories: CategoryRepository, // Repository<Category> 를 상속받아서 만든 custom repository
  ) {} // 우리 Repository를 inject

  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase().replace(/ +/g, ' '); // 정규식 공부 필요 !
    // trim() : 앞, 뒤 space를 지워줌
    const categorySlug = categoryName.replace(/ /g, '-'); // '/ /g':regular expression
    let category = await this.categories.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput); // entity에 dto를 하나하나 씩 넣을 필요 없이 이렇게 해결 // 하지만 단지 typescript상에만 존재하는 클래스를 만든 것
      newRestaurant.owner = owner; // dto에서 owner는 graphql에서 받아오지 않기 때문에 여기서 완성시켜 줘야함

      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        { loadRelationIds: true }, // { relations: ['owner'], } 이런식으로 owner정보를 모두 가져올 수 있음
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurnat not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        // 수정하려는 사람(owner)가 그 수정하려는 restaurant를 가지고 있는지 확인 해야 함
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }
      let category: Category = null; // default로 null을 넣어줌 (category를 유저가 변경 안할 수 도 있으므로)
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          // this.restaurants.create({})를 하지 않고 entity를 만들어서 save하고 싶으면 save()안에 []가 들어가야 함
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }), // category가 존재하면 category object를 리턴하는 것 : ...은 {}를 제거하고 결론적으로 category: category 가 됨
        },
      ]);
      // defensive programming : 처음에 에러를 핸들해주고 이후에 하고 싶은 것을 하는 것
      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not edit restaurant' };
    }
  }
}
