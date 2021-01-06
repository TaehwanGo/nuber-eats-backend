import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDTO } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entitiy';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Repository with entity
    private readonly restaurants: Repository<Restaurant>, // **4. Repository class를 사용해서 DB에 접근(Data mapper 방식)
  ) {} // 우리 Repository를 inject
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find(); // **4. '여기에 Database에 접근해서 데이터를 가져오는 것을 리턴함';
  }
  createRestaurant(
    createRestaurantDTO: CreateRestaurantDTO,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(createRestaurantDTO); // entity에 dto를 하나하나 씩 넣을 필요 없이 이렇게 해결 // 하지만 단지 typescript상에만 존재하는 클래스를 만든 것
    return this.restaurants.save(newRestaurant);
  }
  updateRestaurant({ id, data }: UpdateRestaurantDTO) {
    return this.restaurants.update(id, { ...data }); // {...data} 는 data의 contents를 나열한 것
    // Repository.update()가 Promise를 return한다는 것은 db에 entity가 있는지 없는지 확인하지 않고
    // update query를 실행한다는 뜻 - 존재하지 않는 id를 넣어도 에러가 발생하지 않음
    // update()의 첫번째 argument는 search criteria(검색기준) => id대신 {name: "lalala"}를 입력하면 name column에서 lalala를 찾을 것임
  }
}
