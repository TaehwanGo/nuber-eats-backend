import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entitiy';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Repository with entity
    private readonly restaurant: Repository<Restaurant>, // **4. Repository class를 사용해서 DB에 접근(Data mapper 방식)
  ) {} // 우리 Repository를 inject
  getAll(): Promise<Restaurant[]> {
    return this.restaurant.find(); // **4. '여기에 Database에 접근해서 데이터를 가져오는 것을 리턴함';
  }
}
