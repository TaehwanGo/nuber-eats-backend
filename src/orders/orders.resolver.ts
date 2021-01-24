import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { OrderUpdatesInput } from 'src/users/dtos/order-updates.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

@Resolver(of => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query(returns => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User, // 요청한 사람이 누구냐에 따라 다른 결과값을 보여줄 것임
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query(returns => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User, // 요청한 사람이 누구냐에 따라 다른 결과값을 보여줄 것임
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation(returns => EditOrderOutput)
  @Role(['Any']) // @Role(['Owner', 'Delivery']) 로 해도 됨
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Subscription(returns => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(returns => Order) // driver는 모든 restaurant에 들어오는 주문을 확인 가능 : filter 사용 안함
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(returns => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order }, // type 추가(typescript)
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      // order와 관련된 owner, customer, (driver는 다 볼수 있음) 만 볼수 있게 해야 함
      // console.log(order);
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false; // 로그인된 user가 order와 관련이 하나라도 관련이 있으면 if문을 실행하지 않음
      }
      return order.id === input.id; // 유저가 원하는 order의 update만 볼 수 있음
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(returns => TakeOrderOutput) // delivery driver를 order에 등록
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, takeOrderInput);
  }
  /*
  @Mutation(returns => Boolean)
  async popatoReady(@Args('potatoId') potatoId: number) {
    await this.pubsub.publish('hotPotatos', {
      readyPotatos: potatoId, // payload
    });
    return true;
  }
  // variable : subscription에 적용한 args
  // context: graphql의 context
  @Subscription(returns => String, {
    filter: ({ readyPotatos }, { potatoId }) => {
      return readyPotatos === potatoId; // filter가 true일때만 update함
    },
    resolve: (
      { readyPotatos }, // payload를 변형해서 응답값으로 출력할 수 있음
    ) => `Your potato with the id ${readyPotatos} is ready!`, // return값은 @Subscription의 returns값 : returns => String
  })
  @Role(['Any'])
  readyPotatos(@Args('potatoId') potatoId: number) {
    // @AuthUser() user: User
    // console.log(user);
    return this.pubsub.asyncIterator('hotPotatos');
  }
  */
}
