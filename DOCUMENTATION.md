# EcoBuilt API Documentation

This documentation provides details about all API endpoints for the EcoBuilt platform.

## Table of Contents

- [User API](#user-api)
- [Shop API](#shop-api)
- [Product API](#product-api)
- [Order API](#order-api)
- [Withdraw API](#withdraw-api)
- [Payment API](#payment-api)
- [Coupon API](#coupon-api)
- [Event API](#event-api)
- [Conversation API](#conversation-api)
- [Message API](#message-api)

## User API

### Create New User Account

- **Endpoint:** `POST /api/users`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "avatar": "base64_encoded_image"
  }
  ```
- **Response:** Success message with activation instructions
- **Description:** Registers a new user and sends an activation email.

### Activate User Account

- **Endpoint:** `POST /api/users/activation`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "activation_token": "jwt_token_from_email"
  }
  ```
- **Response:** Returns user data with authentication token
- **Description:** Validates the activation token and creates the user account.

### User Login

- **Endpoint:** `POST /api/users/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** Returns user data with authentication token
- **Description:** Authenticates a user and returns their information.

### Get Current User

- **Endpoint:** `GET /api/users/me`
- **Auth Required:** Yes (User)
- **Response:** Returns current user data
- **Description:** Retrieves the currently authenticated user's information.

### User Logout

- **Endpoint:** `GET /api/users/logout`
- **Auth Required:** No
- **Response:** Success message
- **Description:** Clears the authentication cookie.

### Update User Information

- **Endpoint:** `PUT /api/users/info`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "email": "user@example.com",
    "password": "current_password",
    "phoneNumber": "1234567890"
  }
  ```
- **Response:** Returns updated user data
- **Description:** Updates the user's personal information.

### Update User Avatar

- **Endpoint:** `PUT /api/users/avatar`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "avatar": "base64_encoded_image"
  }
  ```
- **Response:** Returns updated user data
- **Description:** Updates the user's profile picture.

### Get All Users (Admin)

- **Endpoint:** `GET /api/users/admin/all`
- **Auth Required:** Yes (Admin)
- **Response:** Returns list of all users
- **Description:** Admin endpoint to retrieve all registered users.

### Delete User (Admin)

- **Endpoint:** `DELETE /api/users/admin/:id`
- **Auth Required:** Yes (Admin)
- **Response:** Returns ID of deleted user
- **Description:** Admin endpoint to delete a user account.

## Shop API

### Create Shop

- **Endpoint:** `POST /api/shops`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Shop Name",
    "email": "shop@example.com",
    "password": "password123",
    "avatar": "base64_encoded_image",
    "address": "123 Shop St",
    "phoneNumber": "1234567890",
    "zipCode": "12345"
  }
  ```
- **Response:** Success message with activation instructions
- **Description:** Registers a new shop and sends an activation email.

### Activate Shop

- **Endpoint:** `POST /api/shops/activation`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "activation_token": "jwt_token_from_email"
  }
  ```
- **Response:** Returns shop data with authentication token
- **Description:** Validates the activation token and creates the shop account.

### Shop Login

- **Endpoint:** `POST /api/shops/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "shop@example.com",
    "password": "password123"
  }
  ```
- **Response:** Returns shop data with authentication token
- **Description:** Authenticates a shop and returns its information.

### Get Shop Profile

- **Endpoint:** `GET /api/shops/me`
- **Auth Required:** Yes (Seller)
- **Response:** Returns current shop data
- **Description:** Retrieves the currently authenticated shop's information.

### Shop Logout

- **Endpoint:** `GET /api/shops/logout`
- **Auth Required:** No
- **Response:** Success message
- **Description:** Clears the seller authentication cookie.

### Get Shop by ID

- **Endpoint:** `GET /api/shops/:id`
- **Auth Required:** No
- **Response:** Returns shop data
- **Description:** Retrieves information about a specific shop.

### Update Shop Avatar

- **Endpoint:** `PUT /api/shops/avatar`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "avatar": "base64_encoded_image"
  }
  ```
- **Response:** Returns updated shop data
- **Description:** Updates the shop's profile picture.

### Update Shop Information

- **Endpoint:** `PUT /api/shops/info`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "name": "Updated Shop Name",
    "description": "Shop description",
    "address": "123 Shop St",
    "phoneNumber": "1234567890",
    "zipCode": "12345"
  }
  ```
- **Response:** Returns updated shop data
- **Description:** Updates the shop's business information.

### Update Withdraw Method

- **Endpoint:** `PUT /api/shops/withdraw-method`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "withdrawMethod": {
      "type": "bank",
      "bankDetails": {
        "bankName": "Bank Name",
        "accountNumber": "1234567890",
        "accountHolderName": "Account Holder"
      }
    }
  }
  ```
- **Response:** Returns updated shop data
- **Description:** Updates the shop's method for receiving payouts.

### Delete Withdraw Method

- **Endpoint:** `DELETE /api/shops/withdraw-method`
- **Auth Required:** Yes (Seller)
- **Response:** Returns updated shop data
- **Description:** Removes the shop's current withdraw method.

### Get All Shops (Admin)

- **Endpoint:** `GET /api/shops/admin/all`
- **Auth Required:** Yes (Admin)
- **Response:** Returns list of all shops
- **Description:** Admin endpoint to retrieve all registered shops.

### Delete Shop (Admin)

- **Endpoint:** `DELETE /api/shops/admin/:id`
- **Auth Required:** Yes (Admin)
- **Response:** Returns ID of deleted shop
- **Description:** Admin endpoint to delete a shop account.

## Product API

### Get All Products

- **Endpoint:** `GET /api/products`
- **Auth Required:** No
- **Response:** Returns all products
- **Description:** Retrieves all available products across all shops.

### Get Shop Products

- **Endpoint:** `GET /api/products/shop/:shopId`
- **Auth Required:** No
- **Response:** Returns all products for a specific shop
- **Description:** Retrieves all products from a specific shop.

### Get All Products (Admin)

- **Endpoint:** `GET /api/products/admin`
- **Auth Required:** Yes (Admin)
- **Response:** Returns all products
- **Description:** Admin endpoint to retrieve all products.

### Create Product

- **Endpoint:** `POST /api/products`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Product description",
    "category": "Category",
    "tags": ["tag1", "tag2"],
    "originalPrice": 100,
    "discountPrice": 80,
    "stock": 50,
    "images": ["base64_image1", "base64_image2"],
    "shopId": "shop_id"
  }
  ```
- **Response:** Returns created product data
- **Description:** Creates a new product for a shop.

### Add Product Review

- **Endpoint:** `PUT /api/products/:productId/review`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "rating": 5,
    "comment": "Great product!",
    "orderId": "order_id"
  }
  ```
- **Response:** Returns updated product data
- **Description:** Adds a review to a product.

### Delete Product

- **Endpoint:** `DELETE /api/products/:productId`
- **Auth Required:** Yes (Seller)
- **Response:** Returns ID of deleted product
- **Description:** Deletes a specific product.

## Order API

### Get User Orders

- **Endpoint:** `GET /api/orders/user/:userId`
- **Auth Required:** Yes (User)
- **Response:** Returns all orders for the user
- **Description:** Retrieves all orders placed by a specific user.

### Get Shop Orders

- **Endpoint:** `GET /api/orders/seller/:shopId`
- **Auth Required:** Yes (Seller)
- **Response:** Returns all orders for the shop
- **Description:** Retrieves all orders for a specific shop.

### Get All Orders (Admin)

- **Endpoint:** `GET /api/orders/admin`
- **Auth Required:** Yes (Admin)
- **Response:** Returns all orders
- **Description:** Admin endpoint to retrieve all orders.

### Create Order

- **Endpoint:** `POST /api/orders`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "cart": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "price": 80,
        "qty": 2,
        "images": ["image_url"],
        "shopId": "shop_id"
      }
    ],
    "shippingAddress": {
      "address": "123 Main St",
      "city": "City",
      "zipCode": "12345",
      "country": "Country"
    },
    "user": {
      "_id": "user_id",
      "name": "User Name"
    },
    "totalPrice": 160,
    "paymentInfo": {
      "id": "payment_id",
      "status": "Pending",
      "type": "Credit Card"
    }
  }
  ```
- **Response:** Returns created order data
- **Description:** Creates a new order.

### Update Order Status

- **Endpoint:** `PUT /api/orders/:orderId/status`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "status": "Delivered"
  }
  ```
- **Response:** Returns updated order data
- **Description:** Updates the status of an order.

### Request Refund

- **Endpoint:** `PUT /api/orders/:orderId/refund-request`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "status": "Processing Refund"
  }
  ```
- **Response:** Returns updated order data
- **Description:** Initiates a refund request for an order.

### Process Refund

- **Endpoint:** `PUT /api/orders/:orderId/refund-success`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "status": "Refund Success"
  }
  ```
- **Response:** Returns updated order data
- **Description:** Processes and completes a refund request.

## Withdraw API

### Get All Withdraw Requests

- **Endpoint:** `GET /api/withdraws`
- **Auth Required:** Yes (Admin)
- **Response:** Returns all withdraw requests
- **Description:** Admin endpoint to retrieve all withdraw requests.

### Create Withdraw Request

- **Endpoint:** `POST /api/withdraws`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "amount": 1000
  }
  ```
- **Response:** Returns created withdraw request
- **Description:** Creates a new withdraw request for a seller.

### Process Withdraw Request

- **Endpoint:** `PUT /api/withdraws/:id`
- **Auth Required:** Yes (Admin)
- **Request Body:**
  ```json
  {
    "sellerId": "seller_id"
  }
  ```
- **Response:** Returns updated withdraw request
- **Description:** Processes a withdraw request and marks it as succeeded.

## Payment API

### Get Stripe API Key

- **Endpoint:** `GET /api/payments/stripe-key`
- **Auth Required:** Yes (User)
- **Response:** Returns Stripe API key
- **Description:** Retrieves the public Stripe API key for client-side payment processing.

### Create Payment Intent

- **Endpoint:** `POST /api/payments/process`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "amount": 10000,
    "currency": "usd"
  }
  ```
- **Response:** Returns client secret for Stripe payment
- **Description:** Creates a payment intent with Stripe.

### Confirm Payment

- **Endpoint:** `POST /api/payments/confirm`
- **Auth Required:** Yes (User)
- **Request Body:**
  ```json
  {
    "paymentIntentId": "payment_intent_id"
  }
  ```
- **Response:** Returns payment intent status
- **Description:** Retrieves the status of a payment intent.

## Coupon API

### Get Seller Coupons

- **Endpoint:** `GET /api/coupons/seller/:id`
- **Auth Required:** Yes (Seller)
- **Response:** Returns all coupons for the seller
- **Description:** Retrieves all coupons created by a specific seller.

### Get Coupon by Name

- **Endpoint:** `GET /api/coupons/value/:name`
- **Auth Required:** No
- **Response:** Returns coupon details
- **Description:** Retrieves details of a specific coupon by its code.

### Create Coupon

- **Endpoint:** `POST /api/coupons`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "name": "SUMMER20",
    "value": 20,
    "minAmount": 100,
    "maxAmount": 1000,
    "selectedProduct": "all",
    "shopId": "shop_id"
  }
  ```
- **Response:** Returns created coupon
- **Description:** Creates a new discount coupon.

### Delete Coupon

- **Endpoint:** `DELETE /api/coupons/:id`
- **Auth Required:** Yes (Seller)
- **Response:** Returns deleted coupon data
- **Description:** Deletes a specific coupon.

## Event API

### Get All Events

- **Endpoint:** `GET /api/events`
- **Auth Required:** No
- **Response:** Returns all events
- **Description:** Retrieves all active events.

### Get Shop Events

- **Endpoint:** `GET /api/events/shop/:shopId`
- **Auth Required:** No
- **Response:** Returns all events for a specific shop
- **Description:** Retrieves all events created by a specific shop.

### Get All Events (Admin)

- **Endpoint:** `GET /api/events/admin`
- **Auth Required:** Yes (Admin)
- **Response:** Returns all events
- **Description:** Admin endpoint to retrieve all events.

### Create Event

- **Endpoint:** `POST /api/events`
- **Auth Required:** Yes (Seller)
- **Request Body:**
  ```json
  {
    "name": "Summer Sale",
    "description": "Up to 50% off on summer items",
    "startDate": "2023-07-01T00:00:00.000Z",
    "endDate": "2023-07-31T23:59:59.000Z",
    "status": "Running",
    "images": ["base64_image1", "base64_image2"],
    "shopId": "shop_id",
    "category": "Summer",
    "tags": ["sale", "summer", "discount"]
  }
  ```
- **Response:** Returns created event data
- **Description:** Creates a new event.

### Delete Event

- **Endpoint:** `DELETE /api/events/:id`
- **Auth Required:** Yes (Seller)
- **Response:** Returns ID of deleted event
- **Description:** Deletes a specific event.

## Conversation API

### Create Conversation

- **Endpoint:** `POST /api/conversations`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "groupTitle": "user_id-shop_id",
    "userId": "user_id",
    "sellerId": "seller_id"
  }
  ```
- **Response:** Returns created or existing conversation
- **Description:** Creates a new conversation between user and seller.

### Get Seller Conversations

- **Endpoint:** `GET /api/conversations/seller/:id`
- **Auth Required:** Yes (Seller)
- **Response:** Returns all conversations for the seller
- **Description:** Retrieves all conversations involving a specific seller.

### Get User Conversations

- **Endpoint:** `GET /api/conversations/user/:id`
- **Auth Required:** Yes (User)
- **Response:** Returns all conversations for the user
- **Description:** Retrieves all conversations involving a specific user.

### Update Last Message

- **Endpoint:** `PUT /api/conversations/:id/last-message`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "lastMessage": "Message content",
    "lastMessageId": "message_id"
  }
  ```
- **Response:** Returns updated conversation
- **Description:** Updates the last message information for a conversation.

## Message API

### Send Message

- **Endpoint:** `POST /api/messages`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "conversationId": "conversation_id",
    "text": "Message content",
    "sender": "user_id",
    "images": ["base64_image1"]
  }
  ```
- **Response:** Returns created message
- **Description:** Sends a new message in a conversation.
