import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDTO } from './dtos/create-restaurant.dto';
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
}
