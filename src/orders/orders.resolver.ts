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
import { PUB_SUB } from 'src/common/common.constants';

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
    return this.ordersService.createOrderInput(customer, createOrderInput);
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

  @Mutation(returns => Boolean)
  popatoReady() {
    this.pubsub.publish('hotPotatos', {
      readyPotatos: 'Your potatos is ready. love you.',
    });
    return true;
  }

  @Subscription(returns => String)
  @Role(['Any'])
  readyPotatos(@AuthUser() user: User) {
    console.log(user);
    return this.pubsub.asyncIterator('hotPotatos');
  }
}
