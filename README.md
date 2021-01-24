# Nuber Eats

The Backend of Nuber Eats Clone

## User Entity:

- id
- createAt
- updatedAt

- email
- password
- role( client | owner | delivery )
  - client: restaurant list
  - owner: dash board
  - delivery: realtime time order list

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

## Restaurant Model

- name
- category // foreign key
- address
- coverImage

## Plan

- Edit Restaurant : Owner는 edit, delete이 가능 - role based authentication을 이용
- Delete Restaurant

- See Categories
- See Restaurants by Category (pagination) : category 클릭하면 restaurants를 볼 수 있음
- See Restaurants (pagination)
- See Restaurant

- Create Dish
- Edit Dish
- Delete Dish

- Orders CRUD

## Plan for Subscription : how many subscription do we need?

- Orders Subscription (for Owner, Customer, Delivery) : subscription은 resolver에서 변경사항이나 업데이트를 listen
- Resolvers for Subscriptions(Pending Orders, Order Status, Pending Pickup Order)

  - Pending Orders(Owner) (subscription: newOrder) (trigger: createOrder(newOrder))

    - restaurant owner는 dashboard에서 새로 들어오는 orders를 보게 될 것임
    - when the user create the order => trigger : newOrder

  - Pending Pickup Order(Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))

    - order가 cooked되면 driver에게 픽업할 order가 있다고 알림을 줌

  - Order Status(Customer) (s: orderUpdate) (t: editOrder(orderUpdate))

    - Client가 order를 만들면 화면에서 order status를 볼 수 있음
    - order status는 orderUpdate라는 trigger를 listening
    - editOrder가 order status를 update할 때마다 orderUpdate를 trigger

- Payments(using paddle) - CRON jobs : 특정 작업을 정해진 시간에 하는 것
