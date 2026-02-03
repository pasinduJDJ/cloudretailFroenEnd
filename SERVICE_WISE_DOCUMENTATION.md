# CloudRetail - Service-Wise Detailed Documentation

---

## 📋 **Table of Contents**

1. [Auth Service](#1-auth-service)
2. [Product Service](#2-product-service)
3. [Cart Service](#3-cart-service)
4. [Inventory Service](#4-inventory-service)
5. [Order Service](#5-order-service)
6. [Payment Service](#6-payment-service)
7. [Notification Service](#7-notification-service)
8. [Health Service](#8-health-service)
9. [DB Test Service](#9-db-test-service)

---

## 1. **Auth Service**

### **1.1 Overview**

The Authentication Service is responsible for managing user registration, login, and authentication using AWS Cognito. It handles the complete user lifecycle from registration to login, including email verification.

### **1.2 Technology Stack**

- **Runtime:** Node.js 18.x (ES Modules)
- **AWS SDK:** @aws-sdk/client-cognito-identity-provider
- **Authentication:** AWS Cognito User Pool
- **Security:** HMAC SHA-256 for secret hash

### **1.3 Architecture**

```
┌─────────────┐
│   Client    │
│  (Angular)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  /auth/*        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Auth Service   │
│  (Lambda)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  AWS Cognito    │
│  User Pool      │
└─────────────────┘
```

### **1.4 API Endpoints**

#### **1.4.1 POST /auth/register**

**Purpose:** Register a new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Process Flow:**
1. Validate email and password format
2. Check environment variables (CLIENT_ID, CLIENT_SECRET)
3. Generate secret hash using HMAC SHA-256
4. Call Cognito SignUpCommand
5. Return user sub and confirmation status

**Response (Success):**
```json
{
  "message": "User registered. Check email for confirmation code.",
  "userConfirmed": false,
  "userSub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response (Error):**
```json
{
  "message": "User already exists",
  "error": "UsernameExistsException"
}
```

**Cognito Configuration:**
- Password policy: Minimum 8 characters, uppercase, lowercase, numbers
- Email verification required
- Auto-verify email attribute

---

#### **1.4.2 POST /auth/confirm**

**Purpose:** Confirm user email with verification code

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Process Flow:**
1. Validate email and code
2. Generate secret hash
3. Call Cognito ConfirmSignUpCommand
4. Activate user account

**Response (Success):**
```json
{
  "message": "Email confirmed successfully"
}
```

**Response (Error):**
```json
{
  "message": "Invalid verification code",
  "error": "CodeMismatchException"
}
```

---

#### **1.4.3 POST /auth/login**

**Purpose:** Authenticate user and return JWT tokens

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Process Flow:**
1. Validate credentials
2. Generate secret hash
3. Call Cognito InitiateAuthCommand with USER_PASSWORD_AUTH flow
4. Return access, ID, and refresh tokens

**Response (Success):**
```json
{
  "message": "Login successful",
  "tokens": {
    "accessToken": "eyJraWQiOiJ...",
    "idToken": "eyJraWQiOiJ...",
    "refreshToken": "eyJjdHkiOiJ...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

**Token Details:**
- **Access Token:** Used for API authorization (1 hour expiry)
- **ID Token:** Contains user claims (email, sub, etc.)
- **Refresh Token:** Used to get new access tokens (30 days expiry)

**Response (Error):**
```json
{
  "message": "Incorrect username or password",
  "error": "NotAuthorizedException"
}
```

---

#### **1.4.4 POST /auth/logout**

**Purpose:** Logout user (client-side token removal)

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Note:** Actual token invalidation happens on the frontend by removing tokens from localStorage.

---

### **1.5 Environment Variables**

```bash
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret
FINAL_AWS_REGION=ap-southeast-1
```

### **1.6 Security Features**

1. **Secret Hash:** Additional security layer using HMAC SHA-256
2. **Password Policy:** Enforced by Cognito
3. **Email Verification:** Mandatory before login
4. **JWT Tokens:** Industry-standard authentication
5. **Token Expiration:** Automatic token expiry
6. **CORS:** Configured for frontend domain

### **1.7 Error Handling**

| Error | Status | Message |
|-------|--------|---------|
| Missing credentials | 400 | "email and password are required" |
| Invalid JSON | 400 | "Invalid JSON body" |
| User exists | 400 | "User already exists" |
| Invalid code | 400 | "Invalid verification code" |
| Wrong password | 401 | "Incorrect username or password" |
| Missing env vars | 500 | "Missing COGNITO_CLIENT_ID / COGNITO_CLIENT_SECRET" |

---

## 2. **Product Service**

### **2.1 Overview**

The Product Service manages the product catalog, including product creation, retrieval, and image management using S3 pre-signed URLs.

### **2.2 Technology Stack**

- **Runtime:** Node.js 18.x (CommonJS)
- **AWS SDK:** @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb
- **Storage:** DynamoDB for product data, S3 for images
- **Security:** Pre-signed URLs for image access

### **2.3 Architecture**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  /products/*    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Product Service │
│    (Lambda)     │
└──────┬──────────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────┐   ┌──────────┐
│ DynamoDB │   │    S3    │
│ Products │   │  Images  │
└──────────┘   └──────────┘
```

### **2.4 API Endpoints**

#### **2.4.1 GET /products**

**Purpose:** List all products with images

**Response:**
```json
{
  "items": [
    {
      "productId": "P001",
      "name": "Wireless Mouse",
      "category": "Electronics",
      "price": 29.99,
      "currency": "USD",
      "imageKey": "products/P001.jpg",
      "imageUrl": "https://bucket.s3.amazonaws.com/products/P001.jpg?X-Amz-...",
      "createdAt": "2026-02-03T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Features:**
- Scans DynamoDB (limit 50 items)
- Generates pre-signed URLs for each image
- URLs expire in 5 minutes (configurable)

---

#### **2.4.2 GET /products/{productId}**

**Purpose:** Get single product details

**Request:** `GET /products/P001`

**Response:**
```json
{
  "productId": "P001",
  "name": "Wireless Mouse",
  "category": "Electronics",
  "price": 29.99,
  "currency": "USD",
  "imageKey": "products/P001.jpg",
  "imageUrl": "https://bucket.s3.amazonaws.com/products/P001.jpg?X-Amz-...",
  "createdAt": "2026-02-03T10:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Product not found"
}
```

---

#### **2.4.3 POST /products**

**Purpose:** Create new product

**Request:**
```json
{
  "productId": "P001",
  "name": "Wireless Mouse",
  "category": "Electronics",
  "price": 29.99,
  "currency": "USD",
  "imageKey": "products/P001.jpg"
}
```

**Response:**
```json
{
  "message": "Product created",
  "product": {
    "productId": "P001",
    "name": "Wireless Mouse",
    "category": "Electronics",
    "price": 29.99,
    "currency": "USD",
    "imageKey": "products/P001.jpg",
    "imageUrl": "https://...",
    "createdAt": "2026-02-03T10:00:00.000Z"
  }
}
```

---

### **2.5 Data Model**

**DynamoDB Table: Products**

```javascript
{
  productId: "P001",           // Primary Key (String)
  name: "Wireless Mouse",      // String
  category: "Electronics",     // String
  price: 29.99,                // Number
  currency: "USD",             // String
  imageKey: "products/P001.jpg", // String (S3 key)
  createdAt: "2026-02-03T..."  // String (ISO 8601)
}
```

**S3 Structure:**
```
cloudretail-products-bucket/
└── products/
    ├── P001.jpg
    ├── P002.jpg
    └── P003.jpg
```

### **2.6 Environment Variables**

```bash
PRODUCTS_TABLE=cloudretail-products
S3_BUCKET=cloudretail-products-bucket
SIGNED_URL_EXPIRES=300  # seconds (5 minutes)
```

### **2.7 Pre-Signed URL Generation**

**Purpose:** Secure, temporary access to S3 images

**Process:**
```javascript
const cmd = new GetObjectCommand({
  Bucket: bucket,
  Key: item.imageKey
});

const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });
```

**Benefits:**
- No public S3 bucket required
- Time-limited access
- Secure image delivery
- No authentication needed for viewing

---

## 3. **Cart Service**

### **3.1 Overview**

The Cart Service manages user shopping carts with real-time stock validation through integration with the Inventory Service.

### **3.2 Technology Stack**

- **Runtime:** Node.js 18.x (CommonJS)
- **AWS SDK:** @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb
- **Database:** DynamoDB
- **Integration:** HTTPS calls to Inventory Service

### **3.3 Architecture**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  /cart/*        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Cart Service   │
│    (Lambda)     │
└──────┬──────────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────┐   ┌────────────┐
│ DynamoDB │   │ Inventory  │
│   Cart   │   │  Service   │
└──────────┘   └────────────┘
```

### **3.4 API Endpoints**

#### **3.4.1 GET /cart?userId={userId}**

**Purpose:** Retrieve user's shopping cart

**Request:** `GET /cart?userId=U1001`

**Response:**
```json
{
  "userId": "U1001",
  "items": [
    {
      "productId": "P001",
      "qty": 2,
      "price": 29.99
    },
    {
      "productId": "P002",
      "qty": 1,
      "price": 49.99
    }
  ],
  "updatedAt": "2026-02-03T10:30:00.000Z"
}
```

**Empty Cart Response:**
```json
{
  "userId": "U1001",
  "items": [],
  "updatedAt": null
}
```

---

#### **3.4.2 POST /cart/items?userId={userId}**

**Purpose:** Add item to cart with stock validation

**Request:**
```json
{
  "productId": "P001",
  "qty": 2,
  "price": 29.99
}
```

**Process Flow:**
1. Validate input (productId, qty, price)
2. Load existing cart from DynamoDB
3. Calculate new quantity (if item exists)
4. **Call Inventory Service to check stock**
5. Update cart if stock available
6. Save to DynamoDB

**Stock Check:**
```javascript
GET https://api.../inventory/P001

Response:
{
  "productId": "P001",
  "availableQty": 100,
  "reservedQty": 5
}

// Check: newQty <= availableQty
```

**Response (Success):**
```json
{
  "message": "Item added to cart",
  "cart": {
    "userId": "U1001",
    "items": [
      { "productId": "P001", "qty": 2, "price": 29.99 }
    ],
    "updatedAt": "2026-02-03T10:35:00.000Z"
  }
}
```

**Response (Out of Stock):**
```json
{
  "message": "Out of stock",
  "productId": "P001",
  "availableQty": 1,
  "requestedQty": 2
}
```

---

#### **3.4.3 PUT /cart/items/{productId}?userId={userId}**

**Purpose:** Update item quantity

**Request:** `PUT /cart/items/P001?userId=U1001`
```json
{
  "qty": 3,
  "price": 29.99
}
```

**Process:**
1. Validate stock for new quantity
2. Update item in cart
3. Save to DynamoDB

**Response:**
```json
{
  "message": "Cart item updated",
  "cart": { ... }
}
```

---

#### **3.4.4 DELETE /cart/items/{productId}?userId={userId}**

**Purpose:** Remove item from cart

**Request:** `DELETE /cart/items/P001?userId=U1001`

**Response:**
```json
{
  "message": "Item removed",
  "cart": {
    "userId": "U1001",
    "items": [],
    "updatedAt": "2026-02-03T10:40:00.000Z"
  }
}
```

---

#### **3.4.5 DELETE /cart?userId={userId}**

**Purpose:** Clear entire cart

**Request:** `DELETE /cart?userId=U1001`

**Response:**
```json
{
  "message": "Cart cleared",
  "userId": "U1001"
}
```

---

### **3.5 Data Model**

**DynamoDB Table: Cart**

```javascript
{
  userId: "U1001",             // Primary Key (String)
  items: [                     // List
    {
      productId: "P001",       // String
      qty: 2,                  // Number
      price: 29.99             // Number
    }
  ],
  updatedAt: "2026-02-03T..."  // String (ISO 8601)
}
```

### **3.6 Environment Variables**

```bash
CART_TABLE=cloudretail-cart
INVENTORY_API_BASE=https://xxx.execute-api.ap-southeast-1.amazonaws.com/dev
```

### **3.7 Stock Validation Logic**

**Function:** `ensureStockAvailable()`

```javascript
async function ensureStockAvailable(inventoryBase, productId, neededQty) {
  // 1. Call Inventory Service
  const url = `${inventoryBase}/inventory/${productId}`;
  const res = await httpsRequestJson("GET", url);
  
  // 2. Check response
  if (res.statusCode !== 200) {
    return { ok: false, reason: "Inventory service error" };
  }
  
  // 3. Validate stock
  const available = res.body.availableQty;
  if (available < neededQty) {
    return {
      ok: false,
      reason: "Out of stock",
      availableQty: available,
      requestedQty: neededQty
    };
  }
  
  return { ok: true, availableQty: available };
}
```

**Benefits:**
- Prevents overselling
- Real-time stock checks
- User-friendly error messages
- Integration with inventory system

---

## 4. **Inventory Service**

### **4.1 Overview**

The Inventory Service manages product stock levels with atomic reservation and release operations to prevent overselling.

### **4.2 Technology Stack**

- **Runtime:** Node.js 18.x (CommonJS)
- **AWS SDK:** @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb
- **Database:** DynamoDB with conditional updates
- **Operations:** Atomic increment/decrement

### **4.3 Architecture**

```
┌─────────────┐
│   Client    │
│  Services   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  /inventory/*   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Inventory Svc   │
│    (Lambda)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│    DynamoDB     │
│   Inventory     │
│ (Atomic Ops)    │
└─────────────────┘
```

### **4.4 Stock Model**

**Concept:**
- **availableQty:** Free stock available for purchase
- **reservedQty:** Stock reserved for pending orders

**Example:**
```
Total Physical Stock: 100 units
availableQty: 95
reservedQty: 5

Free for purchase: 95 units
Reserved for orders: 5 units
```

### **4.5 API Endpoints**

#### **4.5.1 GET /inventory/{productId}**

**Purpose:** Get current stock levels

**Request:** `GET /inventory/P001`

**Response:**
```json
{
  "productId": "P001",
  "availableQty": 95,
  "reservedQty": 5,
  "updatedAt": "2026-02-03T10:00:00.000Z"
}
```

**If product not found:**
```json
{
  "productId": "P001",
  "availableQty": 0,
  "reservedQty": 0
}
```

---

#### **4.5.2 PUT /inventory/{productId}**

**Purpose:** Update inventory levels (admin operation)

**Request:** `PUT /inventory/P001`
```json
{
  "availableQty": 100,
  "reservedQty": 0
}
```

**Response:**
```json
{
  "message": "Inventory updated",
  "inventory": {
    "productId": "P001",
    "availableQty": 100,
    "reservedQty": 0,
    "updatedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

---

#### **4.5.3 POST /inventory/{productId}/reserve**

**Purpose:** Reserve stock for order (atomic operation)

**Request:** `POST /inventory/P001/reserve`
```json
{
  "qty": 5
}
```

**Process:**
```javascript
// DynamoDB UpdateCommand with ConditionExpression
UpdateExpression: "SET availableQty = availableQty - :q, 
                       reservedQty = reservedQty + :q, 
                       updatedAt = :n"
ConditionExpression: "availableQty >= :q"
```

**Response (Success):**
```json
{
  "message": "Reserved",
  "inventory": {
    "productId": "P001",
    "availableQty": 90,
    "reservedQty": 10,
    "updatedAt": "2026-02-03T11:05:00.000Z"
  }
}
```

**Response (Out of Stock):**
```json
{
  "message": "Out of stock"
}
```

**Atomic Operation Benefits:**
- No race conditions
- Prevents overselling
- Automatic rollback if condition fails
- Thread-safe

---

#### **4.5.4 POST /inventory/{productId}/release**

**Purpose:** Release reserved stock (on payment failure)

**Request:** `POST /inventory/P001/release`
```json
{
  "qty": 5
}
```

**Process:**
```javascript
UpdateExpression: "SET availableQty = availableQty + :q, 
                       reservedQty = reservedQty - :q, 
                       updatedAt = :n"
```

**Response:**
```json
{
  "message": "Released",
  "inventory": {
    "productId": "P001",
    "availableQty": 95,
    "reservedQty": 5,
    "updatedAt": "2026-02-03T11:10:00.000Z"
  }
}
```

---

### **4.6 Data Model**

**DynamoDB Table: Inventory**

```javascript
{
  productId: "P001",           // Primary Key (String)
  availableQty: 95,            // Number (free stock)
  reservedQty: 5,              // Number (reserved for orders)
  updatedAt: "2026-02-03T..."  // String (ISO 8601)
}
```

### **4.7 Environment Variables**

```bash
INVENTORY_TABLE=cloudretail-inventory
```

### **4.8 Use Cases**

**1. Checkout Process:**
```
Order Service → Reserve Stock → Inventory Service
```

**2. Payment Success:**
```
Stock remains reserved → Order fulfilled
```

**3. Payment Failure:**
```
Payment Service → Release Stock → Inventory Service
```

**4. Cart Validation:**
```
Cart Service → Check Stock → Inventory Service
```

---

## 5. **Order Service**

### **5.1 Overview**

The Order Service orchestrates the checkout process, coordinating with Cart and Inventory services to create orders with proper stock reservation.

### **5.2 Technology Stack**

- **Runtime:** Node.js 18.x (CommonJS)
- **AWS SDK:** @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb
- **Database:** DynamoDB with GSI
- **Integration:** HTTPS calls to Cart and Inventory services

### **5.3 Architecture**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  /orders/*      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Order Service  │
│    (Lambda)     │
└──────┬──────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌────────────┐
│ DynamoDB │   │   Cart   │   │ Inventory  │
│  Orders  │   │ Service  │   │  Service   │
└──────────┘   └──────────┘   └────────────┘
```

### **5.4 API Endpoints**

#### **5.4.1 POST /orders/checkout?userId={userId}**

**Purpose:** Create order from cart with inventory reservation

**Request:** `POST /orders/checkout?userId=U1001`
```json
{
  "email": "user@example.com"
}
```

**Process Flow:**

**Step 1: Load Cart**
```javascript
GET /cart?userId=U1001

Response:
{
  "userId": "U1001",
  "items": [
    { "productId": "P001", "qty": 2, "price": 29.99 },
    { "productId": "P002", "qty": 1, "price": 49.99 }
  ]
}
```

**Step 2: Validate Cart**
```javascript
if (items.length === 0) {
  return error("Cart is empty");
}
```

**Step 3: Reserve Inventory**
```javascript
for each item in cart:
  POST /inventory/{productId}/reserve
  body: { qty: item.qty }
  
  if fails:
    rollback all previous reservations
    return error("Out of stock")
```

**Step 4: Create Order**
```javascript
const order = {
  orderId: "O-" + crypto.randomUUID(),
  userId: "U1001",
  userEmail: "user@example.com",
  status: "PENDING",
  items: [...],
  totalAmount: 109.97,
  currency: "USD",
  createdAt: new Date().toISOString()
};

await ddb.send(new PutCommand({ TableName, Item: order }));
```

**Step 5: Clear Cart**
```javascript
DELETE /cart?userId=U1001
```

**Response (Success):**
```json
{
  "message": "Checkout successful",
  "order": {
    "orderId": "O-a1b2c3d4-...",
    "userId": "U1001",
    "userEmail": "user@example.com",
    "status": "PENDING",
    "items": [
      { "productId": "P001", "qty": 2, "price": 29.99 },
      { "productId": "P002", "qty": 1, "price": 49.99 }
    ],
    "totalAmount": 109.97,
    "currency": "USD",
    "createdAt": "2026-02-03T12:00:00.000Z"
  }
}
```

**Response (Error - Out of Stock):**
```json
{
  "message": "Checkout failed: Out of stock for P001",
  "rollback": {
    "released": ["P002"]
  }
}
```

---

#### **5.4.2 GET /orders?userId={userId}**

**Purpose:** List user's orders

**Request:** `GET /orders?userId=U1001`

**Process:**
```javascript
// Uses GSI: GSI1-userId-createdAt
await ddb.send(new QueryCommand({
  TableName: ordersTable,
  IndexName: gsiName,
  KeyConditionExpression: "userId = :uid",
  ExpressionAttributeValues: {
    ":uid": userId
  },
  ScanIndexForward: false  // Latest first
}));
```

**Response:**
```json
{
  "items": [
    {
      "orderId": "O-a1b2c3d4-...",
      "userId": "U1001",
      "userEmail": "user@example.com",
      "status": "CONFIRMED",
      "items": [...],
      "totalAmount": 109.97,
      "currency": "USD",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### **5.5 Data Model**

**DynamoDB Table: Orders**

**Primary Key:**
- Partition Key: `orderId` (String)

**Global Secondary Index (GSI):**
- Name: `GSI1-userId-createdAt`
- Partition Key: `userId` (String)
- Sort Key: `createdAt` (String)

**Attributes:**
```javascript
{
  orderId: "O-uuid",           // Primary Key
  userId: "U1001",             // GSI Partition Key
  userEmail: "user@example.com", // NEW: For notifications
  status: "PENDING",           // PENDING | CONFIRMED
  items: [
    {
      productId: "P001",
      qty: 2,
      price: 29.99
    }
  ],
  totalAmount: 59.98,
  currency: "USD",
  createdAt: "2026-02-03T..."  // GSI Sort Key
}
```

### **5.6 Environment Variables**

```bash
ORDERS_TABLE=cloudretail-orders
ORDERS_GSI1=GSI1-userId-createdAt
CART_API_BASE=https://xxx.execute-api.../dev
INVENTORY_API_BASE=https://xxx.execute-api.../dev
```

### **5.7 Rollback Mechanism**

**Scenario:** Inventory reservation fails for one item

**Process:**
```javascript
const reserved = [];

try {
  for (const item of items) {
    await reserveInventory(item.productId, item.qty);
    reserved.push({ productId: item.productId, qty: item.qty });
  }
} catch (err) {
  // Rollback: Release all reserved items
  for (const r of reserved) {
    await releaseInventory(r.productId, r.qty);
  }
  throw new Error("Checkout failed: " + err.message);
}
```

**Benefits:**
- Transactional integrity
- No partial orders
- Automatic cleanup
- User-friendly error messages

---

## 6. **Payment Service**

### **6.1 Overview**

The Payment Service processes payments, updates order status, sends email notifications, and handles inventory release on payment failure.

### **6.2 Technology Stack**

- **Runtime:** Node.js 18.x (CommonJS)
- **AWS SDK:** @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb
- **Database:** DynamoDB (Payments, Orders tables)
- **Integration:** Inventory Service, Notification Service

### **6.3 Architecture**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  /payments/*    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Payment Service │
│    (Lambda)     │
└──────┬──────────┘
       │
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ DynamoDB │ │ Orders │ │Inventory│ │Notific.│
│ Payments │ │  Table │ │ Service│ │Service │
└──────────┘ └────────┘ └────────┘ └────────┘
```

### **6.4 API Endpoints**

#### **6.4.1 POST /payments**

**Purpose:** Process payment and update order

**Request:**
```json
{
  "orderId": "O-a1b2c3d4-...",
  "status": "SUCCESS"
}
```

**Process Flow:**

**Step 1: Load Order**
```javascript
const order = await ddb.send(new GetCommand({
  TableName: ordersTable,
  Key: { orderId }
}));

if (!order.Item) {
  return error(404, "Order not found");
}
```

**Step 2: Create Payment Record**
```javascript
const payment = {
  paymentId: "PAY-" + crypto.randomUUID(),
  orderId: orderId,
  userId: order.userId,
  amount: order.totalAmount,
  currency: order.currency,
  status: status,  // SUCCESS or FAILED
  provider: "MOCK",
  createdAt: new Date().toISOString()
};

await ddb.send(new PutCommand({
  TableName: paymentsTable,
  Item: payment
}));
```

**Step 3: Update Order Status**
```javascript
const newOrderStatus = (status === "SUCCESS") ? "CONFIRMED" : "PENDING";

await ddb.send(new UpdateCommand({
  TableName: ordersTable,
  Key: { orderId },
  UpdateExpression: "SET #s = :status, updatedAt = :now",
  ExpressionAttributeNames: { "#s": "status" },
  ExpressionAttributeValues: {
    ":status": newOrderStatus,
    ":now": new Date().toISOString()
  }
}));
```

**Step 4: Send Email Notification (if SUCCESS)**
```javascript
if (status === "SUCCESS" && order.userEmail) {
  try {
    const notificationUrl = `${baseUrl}/notifications/order-confirmed`;
    
    await httpsRequestJson('POST', notificationUrl, {
      email: order.userEmail,
      userId: order.userId,
      orderId: orderId,
      amount: order.totalAmount,
      currency: order.currency
    });
    
    emailNotification.success = true;
  } catch (err) {
    emailNotification.error = err.message;
    // Don't fail payment if email fails
  }
}
```

**Step 5: Release Inventory (if FAILED)**
```javascript
if (status === "FAILED") {
  for (const item of order.items) {
    try {
      const releaseUrl = `${inventoryBase}/inventory/${item.productId}/release`;
      await httpsRequestJson('POST', releaseUrl, { qty: item.qty });
    } catch (err) {
      console.error("Failed to release inventory:", err);
    }
  }
}
```

**Response (Success):**
```json
{
  "message": "Payment processed",
  "payment": {
    "paymentId": "PAY-xyz...",
    "orderId": "O-a1b2c3d4-...",
    "userId": "U1001",
    "amount": 109.97,
    "currency": "USD",
    "status": "SUCCESS",
    "provider": "MOCK",
    "createdAt": "2026-02-03T12:05:00.000Z"
  },
  "orderUpdate": {
    "orderId": "O-a1b2c3d4-...",
    "status": "CONFIRMED"
  },
  "emailNotification": {
    "attempted": true,
    "success": true,
    "response": {
      "message": "Notification sent",
      "type": "order-confirmed",
      "toEmail": "user@example.com"
    }
  },
  "inventoryRelease": {
    "attempted": false
  }
}
```

---

#### **6.4.2 GET /payments/{paymentId}**

**Purpose:** Get payment details

**Request:** `GET /payments/PAY-xyz...`

**Response:**
```json
{
  "paymentId": "PAY-xyz...",
  "orderId": "O-a1b2c3d4-...",
  "userId": "U1001",
  "amount": 109.97,
  "currency": "USD",
  "status": "SUCCESS",
  "provider": "MOCK",
  "createdAt": "2026-02-03T12:05:00.000Z"
}
```

---

### **6.5 Data Model**

**DynamoDB Table: Payments**

```javascript
{
  paymentId: "PAY-uuid",       // Primary Key (String)
  orderId: "O-uuid",           // String
  userId: "U1001",             // String
  amount: 109.97,              // Number
  currency: "USD",             // String
  status: "SUCCESS",           // SUCCESS | FAILED
  provider: "MOCK",            // MOCK | STRIPE | PAYPAL
  createdAt: "2026-02-03T..."  // String (ISO 8601)
}
```

### **6.6 Environment Variables**

```bash
PAYMENTS_TABLE=cloudretail-payments
ORDERS_TABLE=cloudretail-orders
INVENTORY_API_BASE=https://xxx.execute-api.../dev
```

### **6.7 Payment Flow Diagram**

```
┌─────────────────────────────────────────────────────┐
│                  Payment Request                     │
│              { orderId, status }                     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Load Order    │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Create Payment │
              │     Record     │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │  Update Order  │
              │     Status     │
              └────────┬───────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
    ┌───────────────┐    ┌───────────────┐
    │ If SUCCESS:   │    │ If FAILED:    │
    │ - Send Email  │    │ - Release     │
    │               │    │   Inventory   │
    └───────────────┘    └───────────────┘
```

---

## 7. **Notification Service**

### **7.1 Overview**

The Notification Service sends transactional emails using AWS SES with HTML and plain text templates.

### **7.2 Technology Stack**

- **Runtime:** Node.js 18.x (CommonJS)
- **AWS SDK:** @aws-sdk/client-ses
- **Email Service:** Amazon SES
- **Templates:** HTML + Plain Text

### **7.3 Architecture**

```
┌─────────────┐
│  Payment    │
│  Service    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│ /notifications/*│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Notification    │
│    Service      │
│   (Lambda)      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│    AWS SES      │
│ (Email Delivery)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  User's Email   │
│     Inbox       │
└─────────────────┘
```

### **7.4 API Endpoints**

#### **7.4.1 POST /notifications/user-registered**

**Purpose:** Send welcome email

**Request:**
```json
{
  "email": "user@example.com",
  "userId": "U1001"
}
```

**Email Template:**
```html
<h2>Welcome to CloudRetail 🎉</h2>
<p>Hi <b>U1001</b>, your account has been created successfully.</p>
<p>Thanks,<br/>CloudRetail</p>
```

**Response:**
```json
{
  "message": "Notification sent",
  "type": "user-registered",
  "toEmail": "user@example.com"
}
```

---

#### **7.4.2 POST /notifications/order-confirmed**

**Purpose:** Send order confirmation email

**Request:**
```json
{
  "email": "user@example.com",
  "userId": "U1001",
  "orderId": "O-a1b2c3d4-...",
  "amount": 109.97,
  "currency": "USD"
}
```

**Email Template:**
```html
<h2>✅ Order Confirmed</h2>
<p>Hi <b>U1001</b>,</p>
<p>Your order <b>O-a1b2c3d4-...</b> is confirmed.</p>
<p><b>Total:</b> 109.97 USD</p>
<p>Thanks,<br/>CloudRetail</p>
```

**Plain Text Version:**
```
Hi U1001,

Your order O-a1b2c3d4-... is confirmed.
Total: 109.97 USD

Thanks,
CloudRetail
```

**Response:**
```json
{
  "message": "Notification sent",
  "type": "order-confirmed",
  "toEmail": "user@example.com"
}
```

---

#### **7.4.3 POST /notifications/payment-failed**

**Purpose:** Send payment failure notification

**Request:**
```json
{
  "email": "user@example.com",
  "userId": "U1001",
  "orderId": "O-a1b2c3d4-..."
}
```

**Email Template:**
```html
<h2>❌ Payment Failed</h2>
<p>Hi <b>U1001</b>,</p>
<p>Your payment for order <b>O-a1b2c3d4-...</b> failed.</p>
<p>Please try again.</p>
<p>Thanks,<br/>CloudRetail</p>
```

**Response:**
```json
{
  "message": "Notification sent",
  "type": "payment-failed",
  "toEmail": "user@example.com"
}
```

---

### **7.5 SES Email Sending**

**Function:** `sendEmail()`

```javascript
const cmd = new SendEmailCommand({
  Source: FROM_EMAIL,  // Must be verified in SES
  Destination: {
    ToAddresses: [toEmail]
  },
  Message: {
    Subject: {
      Data: subject,
      Charset: "UTF-8"
    },
    Body: {
      Html: {
        Data: htmlBody,
        Charset: "UTF-8"
      },
      Text: {
        Data: textBody,
        Charset: "UTF-8"
      }
    }
  }
});

await ses.send(cmd);
```

### **7.6 Environment Variables**

```bash
SES_FROM_EMAIL=noreply@cloudretail.com  # Must be verified
APP_NAME=CloudRetail
REGION=ap-southeast-1
```

### **7.7 SES Configuration**

**Sandbox Mode (Development):**
- Can only send to verified email addresses
- Limited to 200 emails per day
- Both sender and recipient must be verified

**Production Mode:**
- Can send to any email address
- Higher sending limits
- Request production access in SES console

**Email Verification:**
1. Go to SES Console
2. Click "Email Addresses"
3. Click "Verify a New Email Address"
4. Enter email and verify via link

---

## 8. **Health Service**

### **8.1 Overview**

Simple health check endpoint for monitoring system availability.

### **8.2 Endpoint**

**GET /health**

**Response:**
```json
{
  "status": "ok",
  "service": "health-service",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "requestId": "abc-123-xyz"
}
```

### **8.3 Use Cases**

- API Gateway health checks
- Load balancer probes
- Monitoring systems (CloudWatch, Datadog)
- Uptime tracking services

---

## 9. **DB Test Service**

### **9.1 Overview**

Tests DynamoDB connectivity by writing and reading a test record.

### **9.2 Functionality**

**Process:**
1. Creates test product
2. Writes to DynamoDB
3. Reads back the record
4. Returns both records

**Response:**
```json
{
  "message": "DynamoDB write + read success",
  "wrote": {
    "productId": "P-DEMO-001",
    "name": "Demo Product",
    "category": "Demo",
    "price": 9.99,
    "currency": "USD",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "read": {
    "productId": "P-DEMO-001",
    "name": "Demo Product",
    "category": "Demo",
    "price": 9.99,
    "currency": "USD",
    "createdAt": "2026-02-03T12:00:00.000Z"
  }
}
```

### **9.3 Use Cases**

- Database connectivity testing
- Deployment verification
- Troubleshooting DynamoDB issues
- Permission validation

---

## **Conclusion**

This document provides detailed, service-by-service documentation for the CloudRetail platform. Each service is independently deployable, scalable, and follows microservices best practices.

**Key Takeaways:**
- 9 independent microservices
- RESTful API design
- Atomic operations for data consistency
- Service-to-service integration
- Comprehensive error handling
- Production-ready architecture

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Author:** CloudRetail Development Team
