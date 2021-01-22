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
- Orders Subscription (for Owner, Customer, Delivery)

- Payments(using paddle) - CRON jobs : 특정 작업을 정해진 시간에 하는 것
