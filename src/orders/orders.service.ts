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
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        // item은 유저가 보낸 것
        // !dish error handing을 위해 items.forEach대신 for of를 사용
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // abort this whole thing
          return {
            ok: false,
            error: 'Dish not found.',
          };
        }
        // item의 options의 항목들이 DB(dish repository)에 있는지 확인 후 최종 음식값을 계산
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          // 요금을 계산하기 위한 for of 문
          //   console.log(itemOption);
          const dishOption = dish.options.find(
            // array.find() 이구나 return값은 조건이 일치하면 return하네, 일치 안하면 undefined을 return
            dishOption => dishOption.name === itemOption.name, // dishOption은 어디서 온거지? options array의 각 항목
          );
          //   console.log('dishOption:', dishOption);
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
              //   console.log(dishOption.extra);
            }
            if (dishOption.choices) {
              const dishOptionChoice = dishOption.choices.find(
                optionChoice => optionChoice.name === itemOption.choice,
              );
              //   console.log(dishOptionChoice);
              //   console.log(dishOptionChoice.extra);
              if (dishOptionChoice.extra) {
                dishFinalPrice += dishOptionChoice.extra;
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      } // json으로 하면 유연하게 entity없이 구조를 작성할 수 있지만 각 입력들을 검사할 수 없기 때문에 위와같이 for문으로 직접 검사함
      //   console.log('orderFinalPrice:', orderFinalPrice);
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems, // ManyToMany relation
        }),
      );
      //   console.log(order);
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
