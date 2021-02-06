import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like, Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.endtity';
import { Restaurant } from './entities/restaurant.entitiy';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Repository with entity
    private readonly restaurants: Repository<Restaurant>, // **4. Repository class를 사용해서 DB에 접근(Data mapper 방식)
    // @InjectRepository(Category)
    private readonly categories: CategoryRepository, // Repository<Category> 를 상속받아서 만든 custom repository
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {} // 우리 Repository를 inject

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
      return { ok: true, restaurantId: newRestaurant.id };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput, // 여기에서 { name, address, ... } 같이 하지 않은 이유는 없는 항목은 undefined가 되는데 아래에 ...에서 undefined까지 업데이트 하므로
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        // { loadRelationIds: true }, // { relations: ['owner'], } 이런식으로 owner정보를 모두 가져올 수 있음
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
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

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      // 여기서 부터
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        // 수정하려는 사람(owner)가 그 수정하려는 restaurant를 가지고 있는지 확인 해야 함
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }
      // 여기까지 check하는 함수로 만들기 code challenge : checking if the person is the owner of the restaurant

      await this.restaurants.delete(restaurantId);
    } catch (err) {
      return {
        ok: false,
        error: 'Could not delete restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'could not load categories',
      };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne(
        { slug },
        // { relations: ['restaurants'] }, // 전부 load하면 느리므로 pagination을 적용해서 부분적으로 load
      );
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: 3,
        skip: (page - 1) * 3,
        order: {
          isPromoted: 'DESC', // true is top
        },
      });
      // category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner }); // 본인이 소유한 restaurant만을 찾아서 전달
      return {
        restaurants,
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] },
      );
      return {
        restaurant,
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not find restaurant.',
      };
    }
  }
  // allRestaurants
  async seeRestaurantsByPage({
    page,
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 3,
        take: 3,
        order: {
          isPromoted: 'DESC', // true is top
        },
      });
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Could not find restaurant by id',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      // custom repository를 만들고 그 안에 pagination함수를 구현: homework
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: Raw(name => `${name} ILike '%${query}%'`) }, // sql : name column에서 query가 포함된 것을 찾음(restaurant table에서) // ILike : insensitive(대소문자 구분없이 찾음)
        skip: (page - 1) * 3,
        take: 3,
      });

      return {
        ok: true,
        totalResults,
        restaurants,
        totalPages: Math.ceil(totalResults / 3),
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not search restaurant',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      // 1. find restaurant
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // 2. check owner and owner of the restaurant are the same
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't create dish on the restaurant you don't own.",
        };
      }
      // 3. create dish and add to the restaurant
      const dish = await this.dishes.save(
        this.dishes.create({
          ...createDishInput,
          restaurant,
        }),
      );
      console.log(dish);
      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        // dish의 존재 여부를 체크하고 오너가 맞는지 확인하는 checkDish()를 만들어도 좋음
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found.',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't edit the dish on the restaurant you don't own.",
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        // dish의 존재 여부를 체크하고 오너가 맞는지 확인하는 checkDish()를 만들어도 좋음
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found.',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't delete the dish on the restaurant you don't own.",
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }
}
