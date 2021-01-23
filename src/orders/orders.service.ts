import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.endtity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
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
      // order 생성 후 loop를 돌려서 items(CreateOrderItemInput[] : dishID, options)를 추가
      //   const order = await this.orders.save(
      //     this.orders.create({
      //       customer,
      //       restaurant,
      //     }),
      //   );
      //   console.log('createOrderInput,order:', order);
      items.forEach(async item => {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // abort this whole thing
        }
        await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
      }); // json으로 하면 유연하게 entity없이 구조를 작성할 수 있지만 각 입력들을 검사할 수 없음
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
