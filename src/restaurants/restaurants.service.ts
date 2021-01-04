import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entitiy';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
  ) {} // 우리 Repository를 inject
  getAll(): Promise<Restaurant[]> {
    return this.restaurant.find(); // '여기에 Database에 접근해서 데이터를 가져오는 것을 리턴함';
  }
}
