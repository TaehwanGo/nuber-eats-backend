import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Dish } from 'src/restaurants/entities/dish.endtity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entitiy';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

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
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}
  async createOrder(
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
        // console.log('item:', item, 'item.options:', item.options);
        if (item.options) {
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
      await this.pubsub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
      return { ok: true };
    } catch (err) {
      console.log(err);
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    // user가 customer라면 주문한 모든 order를 보여줌
    // delivery man이라면 등록된 주문을 검색해서 보여줌, 음식점도 마찬가지
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }), // status가 undefined이면 TypeORM은 아무것도 안 가져옴
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        //   console.log(restaurants); // [restaurant1[order1, order2], restaurant2[order1, order2]] : 우리가 1 owner가 여러개 restaurants를 갖도록 허락했기 때문에
        orders = restaurants.map(restaurant => restaurant.orders).flat(1); // flat(1) 한껍질 벗김 내부에서 외부로 : [],[] 같은 빈 array들을 제거 하기 위해
        // console.log(orders);
        if (status) {
          orders = orders.filter(order => order.status === status); // array.filter는 조건을 만족시키지 못하는 요소를 제거 함
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch (err) {
      return {
        ok: false,
        error: 'Could not get orders.',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You can't see that",
        };
      }

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not get the order',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You can't see that",
        };
      }
      // status 변화 흐름
      // 1. client가 status를 pending으로 create
      // 2. restaurant가 order를 받으면 status가 cooking이 됨
      let canEdit = true;
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      const newOrder = await this.orders.save({
        id: orderId,
        status,
      });
      // console.log(newOrder); // save()안에 create()이 없을땐 온전한 order 객체를 return하지 않음
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubsub.publish(NEW_COOKED_ORDER, {
            cookedOrders: { ...order, status },
          }); // payload는 resolver이름으로 줘야 함
        }
      }

      return {
        ok: true,
      };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Could not edit order.',
      };
    }
  }
}
