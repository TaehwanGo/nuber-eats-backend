import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  async createOrderInput(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }
      return { ok: true };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }
}
