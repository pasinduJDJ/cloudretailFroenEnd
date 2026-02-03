# CloudRetail - Serverless E-Commerce Platform
## Complete Project Documentation

---

## 📋 **Table of Contents**

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [AWS Services Used](#aws-services-used)
4. [Backend Services](#backend-services)
5. [Frontend Application](#frontend-application)
6. [Data Flow](#data-flow)
7. [Security & Authentication](#security--authentication)
8. [Deployment Architecture](#deployment-architecture)

---

## 1. **Project Overview**

### **1.1 Introduction**

**CloudRetail** is a fully serverless, cloud-native e-commerce platform built on Amazon Web Services (AWS). The application demonstrates modern microservices architecture, leveraging AWS Lambda for compute, DynamoDB for data persistence, API Gateway for routing, Cognito for authentication, SES for notifications, and S3 for static asset storage.

The platform provides a complete online shopping experience including:
- User authentication and registration
- Product catalog browsing
- Shopping cart management
- Inventory tracking and reservation
- Order processing and checkout
- Payment processing (Cash on Delivery)
- Email notifications for order confirmation

### **1.2 Project Objectives**

1. **Demonstrate Serverless Architecture** - Build a production-ready application using AWS serverless services
2. **Microservices Design** - Implement loosely coupled, independently deployable services
3. **Scalability** - Leverage AWS auto-scaling capabilities for handling variable loads
4. **Cost Efficiency** - Pay-per-use model with no idle server costs
5. **Security** - Implement industry-standard authentication and authorization
6. **User Experience** - Provide seamless shopping experience with real-time updates

### **1.3 Technology Stack**

**Backend:**
- **Runtime:** Node.js 18.x
- **Compute:** AWS Lambda (Serverless Functions)
- **Database:** Amazon DynamoDB (NoSQL)
- **API:** Amazon API Gateway (REST API)
- **Authentication:** Amazon Cognito
- **Email:** Amazon SES (Simple Email Service)
- **Storage:** Amazon S3
- **Monitoring:** Amazon CloudWatch

**Frontend:**
- **Framework:** Angular 18+ (Standalone Components)
- **State Management:** Angular Signals
- **HTTP Client:** RxJS + HttpClient
- **Routing:** Angular Router
- **Styling:** Vanilla CSS

---

## 2. **System Architecture**

### **2.1 High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│                   (Angular Frontend)                         │
│  • User Interface  • State Management  • API Integration    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│              (Amazon API Gateway - REST API)                 │
│  • Routing  • CORS  • Request/Response Transformation       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│                    (AWS Lambda Functions)                    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Auth    │ Product  │   Cart   │Inventory │  Order   │  │
│  │ Service  │ Service  │ Service  │ Service  │ Service  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ Payment  │Notifica- │  Health  │ DB Test  │             │
│  │ Service  │   tion   │ Service  │ Service  │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Amazon DynamoDB Tables                   │  │
│  │  • Products  • Cart  • Inventory  • Orders           │  │
│  │  • Payments                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Amazon S3 Buckets                        │  │
│  │  • Product Images  • Static Assets                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **2.2 Microservices Architecture**

The application follows a microservices pattern with **9 independent services**:

1. **Auth Service** - User authentication and registration
2. **Product Service** - Product catalog management
3. **Cart Service** - Shopping cart operations
4. **Inventory Service** - Stock management and reservation
5. **Order Service** - Order creation and management
6. **Payment Service** - Payment processing
7. **Notification Service** - Email notifications
8. **Health Service** - System health monitoring
9. **DB Test Service** - Database connectivity testing

Each service is:
- **Independently deployable** - Can be updated without affecting others
- **Loosely coupled** - Communicates via REST APIs
- **Single responsibility** - Focused on one business domain
- **Scalable** - Auto-scales based on demand

---

## 3. **AWS Services Used**

### **3.1 AWS Lambda**

**Purpose:** Serverless compute for running backend logic

**Usage in Project:**
- 9 Lambda functions (one per microservice)
- Node.js 18.x runtime
- Event-driven execution
- Auto-scaling based on request volume

**Benefits:**
- No server management
- Pay per invocation
- Automatic high availability
- Built-in fault tolerance

**Configuration:**
- Memory: 128-512 MB per function
- Timeout: 10-30 seconds
- Concurrent executions: Auto-scaled
- Environment variables for configuration

---

### **3.2 Amazon API Gateway**

**Purpose:** RESTful API management and routing

**Usage in Project:**
- Single REST API with multiple resources
- Routes requests to appropriate Lambda functions
- CORS configuration for frontend access
- Request/response transformation

**Endpoints:**
```
/auth/register          - POST
/auth/confirm           - POST
/auth/login             - POST
/auth/logout            - POST
/products               - GET, POST
/products/{id}          - GET
/cart                   - GET, DELETE
/cart/items             - POST
/cart/items/{id}        - PUT, DELETE
/inventory/{id}         - GET, PUT
/inventory/{id}/reserve - POST
/inventory/{id}/release - POST
/orders                 - GET
/orders/checkout        - POST
/payments               - POST, GET
/payments/{id}          - GET
/notifications/{type}   - POST
/health                 - GET
```

**Benefits:**
- Centralized API management
- Built-in throttling and caching
- API versioning support
- CloudWatch integration for monitoring

---

### **3.3 Amazon DynamoDB**

**Purpose:** NoSQL database for data persistence

**Usage in Project:**

**Tables:**

1. **Products Table**
   - Primary Key: `productId` (String)
   - Attributes: name, category, price, currency, imageKey, createdAt
   - Purpose: Store product catalog

2. **Cart Table**
   - Primary Key: `userId` (String)
   - Attributes: items (List), updatedAt
   - Purpose: Store user shopping carts

3. **Inventory Table**
   - Primary Key: `productId` (String)
   - Attributes: availableQty, reservedQty, updatedAt
   - Purpose: Track product stock levels

4. **Orders Table**
   - Primary Key: `orderId` (String)
   - GSI: `userId-createdAt` (for querying user orders)
   - Attributes: userId, userEmail, status, items, totalAmount, currency, createdAt
   - Purpose: Store order records

5. **Payments Table**
   - Primary Key: `paymentId` (String)
   - Attributes: orderId, userId, amount, currency, status, provider, createdAt
   - Purpose: Store payment transactions

**Benefits:**
- Fully managed NoSQL database
- Single-digit millisecond latency
- Automatic scaling
- Built-in backup and restore
- Global tables for multi-region

---

### **3.4 Amazon Cognito**

**Purpose:** User authentication and authorization

**Usage in Project:**
- User Pool for user management
- Email/password authentication
- Email verification with confirmation codes
- JWT token generation (access, ID, refresh tokens)
- Secure password hashing

**Features Implemented:**
- User registration with email
- Email confirmation with 6-digit code
- User login with JWT tokens
- Token refresh mechanism
- Secure password requirements

**Benefits:**
- Managed authentication service
- Industry-standard security (OAuth 2.0, OpenID Connect)
- Built-in user management
- MFA support (future enhancement)
- Social login integration capability

---

### **3.5 Amazon SES (Simple Email Service)**

**Purpose:** Transactional email delivery

**Usage in Project:**
- Order confirmation emails
- Welcome emails (future)
- Payment failure notifications (future)

**Email Templates:**
1. **Order Confirmed** - Sent after successful payment
2. **User Registered** - Welcome email (planned)
3. **Payment Failed** - Retry notification (planned)

**Configuration:**
- Sender email: Verified in SES
- HTML + Plain text formats
- UTF-8 encoding
- Sandbox mode (for development)

**Benefits:**
- High deliverability rates
- Scalable email infrastructure
- Detailed sending statistics
- Bounce and complaint handling

---

### **3.6 Amazon S3**

**Purpose:** Object storage for static assets

**Usage in Project:**
- Product images storage
- Pre-signed URLs for secure access
- Image keys stored in DynamoDB
- 5-minute URL expiration

**Benefits:**
- Unlimited storage capacity
- 99.999999999% durability
- Low-cost storage
- CDN integration (CloudFront)
- Versioning and lifecycle policies

---

### **3.7 Amazon CloudWatch**

**Purpose:** Monitoring and logging

**Usage in Project:**
- Lambda function logs
- API Gateway access logs
- Custom metrics and alarms
- Error tracking and debugging

**Metrics Monitored:**
- Lambda invocations
- Error rates
- Duration and latency
- API Gateway requests
- DynamoDB read/write capacity

**Benefits:**
- Centralized logging
- Real-time monitoring
- Automated alerting
- Log retention policies
- Integration with AWS X-Ray for tracing

---

## 4. **Backend Services**

### **4.1 Auth Service**

**Purpose:** Handle user authentication and registration using AWS Cognito

**Technology:**
- AWS Lambda (Node.js 18.x)
- AWS Cognito Identity Provider
- HMAC SHA-256 for secret hash

**Endpoints:**

1. **POST /auth/register**
   - **Purpose:** Register new user
   - **Input:** `{ email, password }`
   - **Process:**
     - Validates email and password
     - Creates secret hash for Cognito
     - Calls Cognito SignUp API
     - Returns userSub and confirmation status
   - **Output:** `{ message, userConfirmed, userSub }`

2. **POST /auth/confirm**
   - **Purpose:** Confirm user email with verification code
   - **Input:** `{ email, code }`
   - **Process:**
     - Validates confirmation code
     - Calls Cognito ConfirmSignUp API
     - Activates user account
   - **Output:** `{ message }`

3. **POST /auth/login**
   - **Purpose:** Authenticate user and return JWT tokens
   - **Input:** `{ email, password }`
   - **Process:**
     - Creates secret hash
     - Calls Cognito InitiateAuth with USER_PASSWORD_AUTH flow
     - Returns access, ID, and refresh tokens
   - **Output:** `{ message, tokens: { accessToken, idToken, refreshToken, expiresIn, tokenType } }`

4. **POST /auth/logout**
   - **Purpose:** Logout user (client-side token removal)
   - **Process:** Returns success message (tokens cleared on frontend)
   - **Output:** `{ message }`

**Environment Variables:**
- `COGNITO_CLIENT_ID` - Cognito App Client ID
- `COGNITO_CLIENT_SECRET` - Cognito App Client Secret
- `FINAL_AWS_REGION` - AWS Region (ap-southeast-1)

**Security Features:**
- Password complexity requirements
- Email verification mandatory
- Secret hash for additional security
- JWT tokens with expiration
- Refresh token for session management

---

### **4.2 Product Service**

**Purpose:** Manage product catalog with image support

**Technology:**
- AWS Lambda (Node.js 18.x)
- DynamoDB for product data
- S3 for product images
- Pre-signed URLs for secure image access

**Endpoints:**

1. **GET /products**
   - **Purpose:** List all products
   - **Process:**
     - Scans Products table (limit 50)
     - Generates pre-signed URLs for images
     - Returns product list with image URLs
   - **Output:** `{ items: [...], count: number }`

2. **GET /products/{productId}**
   - **Purpose:** Get single product details
   - **Process:**
     - Retrieves product from DynamoDB
     - Generates pre-signed URL for image
   - **Output:** Product object with imageUrl

3. **POST /products**
   - **Purpose:** Create new product
   - **Input:** `{ productId, name, category, price, currency, imageKey }`
   - **Process:**
     - Validates product data
     - Stores in DynamoDB
     - Returns product with image URL
   - **Output:** `{ message, product }`

**Data Model:**
```javascript
{
  productId: "P001",
  name: "Product Name",
  category: "Electronics",
  price: 99.99,
  currency: "USD",
  imageKey: "products/P001.jpg",
  createdAt: "2026-02-03T..."
}
```

**Environment Variables:**
- `PRODUCTS_TABLE` - DynamoDB table name
- `S3_BUCKET` - S3 bucket for images
- `SIGNED_URL_EXPIRES` - URL expiration (default 300s)

**Features:**
- Pre-signed URLs for secure image access
- Image URL expiration for security
- Scalable product catalog
- Support for multiple currencies

---

### **4.3 Cart Service**

**Purpose:** Manage user shopping carts with real-time stock validation

**Technology:**
- AWS Lambda (Node.js 18.x)
- DynamoDB for cart storage
- HTTPS calls to Inventory Service for stock checks

**Endpoints:**

1. **GET /cart?userId={userId}**
   - **Purpose:** Retrieve user's cart
   - **Process:** Fetches cart from DynamoDB
   - **Output:** `{ userId, items: [...], updatedAt }`

2. **DELETE /cart?userId={userId}**
   - **Purpose:** Clear entire cart
   - **Process:** Deletes cart record from DynamoDB
   - **Output:** `{ message, userId }`

3. **POST /cart/items?userId={userId}**
   - **Purpose:** Add item to cart
   - **Input:** `{ productId, qty, price }`
   - **Process:**
     - Loads existing cart
     - Calculates new quantity (if item exists)
     - Checks stock availability via Inventory Service
     - Updates cart if stock available
   - **Output:** `{ message, cart }`

4. **PUT /cart/items/{productId}?userId={userId}**
   - **Purpose:** Update item quantity
   - **Input:** `{ qty, price? }`
   - **Process:**
     - Validates stock availability
     - Updates item quantity
   - **Output:** `{ message, cart }`

5. **DELETE /cart/items/{productId}?userId={userId}**
   - **Purpose:** Remove item from cart
   - **Process:** Filters out item from cart
   - **Output:** `{ message, cart }`

**Data Model:**
```javascript
{
  userId: "U1001",
  items: [
    { productId: "P001", qty: 2, price: 99.99 },
    { productId: "P002", qty: 1, price: 49.99 }
  ],
  updatedAt: "2026-02-03T..."
}
```

**Environment Variables:**
- `CART_TABLE` - DynamoDB table name
- `INVENTORY_API_BASE` - Inventory service URL

**Features:**
- Real-time stock validation
- Automatic quantity updates
- Price tracking per item
- Integration with Inventory Service

---

### **4.4 Inventory Service**

**Purpose:** Track product stock levels with reservation mechanism

**Technology:**
- AWS Lambda (Node.js 18.x)
- DynamoDB with conditional updates
- Atomic operations for stock management

**Endpoints:**

1. **GET /inventory/{productId}**
   - **Purpose:** Get stock levels
   - **Output:** `{ productId, availableQty, reservedQty }`

2. **PUT /inventory/{productId}**
   - **Purpose:** Update inventory levels
   - **Input:** `{ availableQty, reservedQty }`
   - **Output:** `{ message, inventory }`

3. **POST /inventory/{productId}/reserve**
   - **Purpose:** Reserve stock for order
   - **Input:** `{ qty }`
   - **Process:**
     - Uses DynamoDB conditional update
     - Decreases availableQty
     - Increases reservedQty
     - Fails if insufficient stock
   - **Output:** `{ message, inventory }`

4. **POST /inventory/{productId}/release**
   - **Purpose:** Release reserved stock (on payment failure)
   - **Input:** `{ qty }`
   - **Process:**
     - Increases availableQty
     - Decreases reservedQty
   - **Output:** `{ message, inventory }`

**Data Model:**
```javascript
{
  productId: "P001",
  availableQty: 100,    // Free stock
  reservedQty: 5,       // Reserved for pending orders
  updatedAt: "2026-02-03T..."
}
```

**Environment Variables:**
- `INVENTORY_TABLE` - DynamoDB table name

**Features:**
- Atomic stock operations
- Prevents overselling
- Reservation mechanism for checkout
- Automatic rollback on payment failure

---

### **4.5 Order Service**

**Purpose:** Handle order creation and checkout process

**Technology:**
- AWS Lambda (Node.js 18.x)
- DynamoDB with GSI for user queries
- HTTPS integration with Cart and Inventory services

**Endpoints:**

1. **POST /orders/checkout?userId={userId}**
   - **Purpose:** Create order from cart
   - **Input:** `{ email }`
   - **Process:**
     1. Load user's cart
     2. Validate cart not empty
     3. Reserve inventory for all items
     4. Create order with PENDING status
     5. Clear user's cart
     6. Return order details
   - **Output:** `{ message, order }`
   - **Rollback:** Releases inventory if any step fails

2. **GET /orders?userId={userId}**
   - **Purpose:** List user's orders
   - **Process:** Queries Orders table using GSI
   - **Output:** `{ items: [...], count }`

**Data Model:**
```javascript
{
  orderId: "O-uuid",
  userId: "U1001",
  userEmail: "user@example.com",
  status: "PENDING",  // or "CONFIRMED"
  items: [
    { productId: "P001", qty: 2, price: 99.99 }
  ],
  totalAmount: 199.98,
  currency: "USD",
  createdAt: "2026-02-03T..."
}
```

**Environment Variables:**
- `ORDERS_TABLE` - DynamoDB table name
- `ORDERS_GSI1` - GSI name for userId queries
- `CART_API_BASE` - Cart service URL
- `INVENTORY_API_BASE` - Inventory service URL

**Features:**
- Transactional order creation
- Inventory reservation
- Automatic cart clearing
- Email storage for notifications
- Rollback on failure

---

### **4.6 Payment Service**

**Purpose:** Process payments and update order status

**Technology:**
- AWS Lambda (Node.js 18.x)
- DynamoDB for payment records
- Integration with Order, Inventory, and Notification services

**Endpoints:**

1. **POST /payments**
   - **Purpose:** Process payment
   - **Input:** `{ orderId, status }`  (status: SUCCESS/FAILED)
   - **Process:**
     1. Load order from DynamoDB
     2. Create payment record
     3. Update order status to CONFIRMED (if SUCCESS)
     4. Send order confirmation email
     5. Release inventory (if FAILED)
   - **Output:** `{ message, payment, orderUpdate, emailNotification, inventoryRelease }`

2. **GET /payments/{paymentId}**
   - **Purpose:** Get payment details
   - **Output:** Payment record

**Data Model:**
```javascript
{
  paymentId: "PAY-uuid",
  orderId: "O-uuid",
  userId: "U1001",
  amount: 199.98,
  currency: "USD",
  status: "SUCCESS",
  provider: "MOCK",
  createdAt: "2026-02-03T..."
}
```

**Environment Variables:**
- `PAYMENTS_TABLE` - DynamoDB table name
- `ORDERS_TABLE` - Orders table name
- `INVENTORY_API_BASE` - Inventory service URL (also used for notifications)

**Features:**
- Mock payment provider (COD)
- Order status updates
- Email notification integration
- Inventory release on failure
- Payment history tracking

---

### **4.7 Notification Service**

**Purpose:** Send transactional emails via AWS SES

**Technology:**
- AWS Lambda (Node.js 18.x)
- AWS SES for email delivery
- HTML + Plain text email templates

**Endpoints:**

1. **POST /notifications/user-registered**
   - **Purpose:** Send welcome email
   - **Input:** `{ email, userId }`
   - **Template:** Welcome message
   - **Output:** `{ message, type, toEmail }`

2. **POST /notifications/order-confirmed**
   - **Purpose:** Send order confirmation
   - **Input:** `{ email, userId, orderId, amount, currency }`
   - **Template:** Order confirmation with details
   - **Output:** `{ message, type, toEmail }`

3. **POST /notifications/payment-failed**
   - **Purpose:** Send payment failure notification
   - **Input:** `{ email, userId, orderId }`
   - **Template:** Payment failure message
   - **Output:** `{ message, type, toEmail }`

**Email Templates:**

**Order Confirmed:**
```html
<h2>✅ Order Confirmed</h2>
<p>Hi <b>{userId}</b>,</p>
<p>Your order <b>{orderId}</b> is confirmed.</p>
<p><b>Total:</b> {amount} {currency}</p>
<p>Thanks,<br/>CloudRetail</p>
```

**Environment Variables:**
- `SES_FROM_EMAIL` - Verified sender email
- `APP_NAME` - Application name
- `REGION` - AWS region

**Features:**
- HTML + Plain text emails
- Dynamic template rendering
- UTF-8 encoding
- Error handling (doesn't block payment)

---

### **4.8 Health Service**

**Purpose:** System health check endpoint

**Technology:**
- AWS Lambda (Node.js 18.x)
- Minimal dependencies

**Endpoint:**

**GET /health**
- **Purpose:** Check service availability
- **Output:**
  ```json
  {
    "status": "ok",
    "service": "health-service",
    "timestamp": "2026-02-03T...",
    "requestId": "..."
  }
  ```

**Use Cases:**
- API Gateway health checks
- Load balancer probes
- Monitoring systems
- Uptime tracking

---

### **4.9 DB Test Service**

**Purpose:** Test DynamoDB connectivity

**Technology:**
- AWS Lambda (Node.js 18.x)
- DynamoDB SDK

**Functionality:**
- Writes test product to DynamoDB
- Reads back the record
- Verifies database connectivity

**Output:**
```json
{
  "message": "DynamoDB write + read success",
  "wrote": { ... },
  "read": { ... }
}
```

**Use Cases:**
- Database connectivity testing
- Deployment verification
- Troubleshooting

---

## 5. **Frontend Application**

### **5.1 Architecture**

**Framework:** Angular 18+ with Standalone Components

**Key Features:**
- Reactive state management with Signals
- Service-based architecture
- Route guards for authentication
- Lazy loading for performance

**Structure:**
```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── products.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── payment.service.ts
│   │   │   └── notification.service.ts
│   │   └── api/
│   │       └── api-client.service.ts
│   ├── features/
│   │   ├── home/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── payment/
│   │   └── orders/
│   └── app.routes.ts
└── environments/
    └── environment.ts
```

### **5.2 Core Services**

1. **AuthService** - Authentication management
2. **ProductsService** - Product catalog
3. **CartService** - Shopping cart
4. **OrdersService** - Order management
5. **PaymentService** - Payment processing
6. **NotificationService** - Email triggers
7. **ApiClient** - HTTP wrapper

### **5.3 Pages**

1. **Home** - Landing page
2. **Auth** - Login/Register
3. **Products** - Product listing
4. **Cart** - Shopping cart
5. **Payment** - Payment processing
6. **Orders** - Order history

---

## 6. **Data Flow**

### **6.1 User Registration Flow**

```
User → Frontend → API Gateway → Auth Service → Cognito
                                      ↓
                                 Email Sent
                                      ↓
User Confirms → Frontend → API Gateway → Auth Service → Cognito
                                                ↓
                                          Account Activated
```

### **6.2 Shopping Flow**

```
1. Browse Products
   Frontend → API Gateway → Product Service → DynamoDB

2. Add to Cart
   Frontend → API Gateway → Cart Service → Inventory Service (stock check)
                                  ↓
                              DynamoDB (cart saved)

3. Checkout
   Frontend → API Gateway → Order Service → Cart Service (load cart)
                                  ↓
                           Inventory Service (reserve stock)
                                  ↓
                           DynamoDB (order created)
                                  ↓
                           Cart Service (clear cart)

4. Payment
   Frontend → API Gateway → Payment Service → DynamoDB (payment record)
                                  ↓
                           DynamoDB (order status updated)
                                  ↓
                           Notification Service → SES (email sent)

5. Confirmation
   Frontend displays success → User receives email
```

---

## 7. **Security & Authentication**

### **7.1 Authentication Flow**

1. User registers with email/password
2. Cognito sends verification code
3. User confirms email
4. User logs in
5. Cognito returns JWT tokens (access, ID, refresh)
6. Frontend stores tokens in localStorage
7. Tokens included in API requests
8. API Gateway validates tokens (future enhancement)

### **7.2 Security Features**

- Password complexity requirements
- Email verification mandatory
- JWT token expiration
- HTTPS for all communications
- CORS configuration
- IAM roles for Lambda functions
- Environment variables for secrets

---

## 8. **Deployment Architecture**

### **8.1 Infrastructure**

**Region:** ap-southeast-1 (Singapore)

**Components:**
- 9 Lambda functions
- 1 API Gateway (REST API)
- 5 DynamoDB tables
- 1 Cognito User Pool
- 1 S3 bucket
- SES (email service)

### **8.2 Deployment Process**

1. **Lambda Functions:**
   ```bash
   cd backend/Services/{service-name}
   npm install
   npm run zip
   # Upload function.zip to AWS Lambda
   ```

2. **API Gateway:**
   - Configure routes
   - Enable CORS
   - Deploy to stage (dev/prod)

3. **DynamoDB:**
   - Create tables
   - Configure GSI (for Orders)
   - Set capacity mode (On-demand)

4. **Frontend:**
   ```bash
   cd frontend/retailcloud-web
   npm install
   ng serve  # Development
   ng build  # Production
   ```

---

## 9. **Conclusion**

CloudRetail demonstrates a production-ready, serverless e-commerce platform leveraging AWS managed services. The architecture provides:

- **Scalability** - Auto-scales with demand
- **Reliability** - Built-in redundancy and fault tolerance
- **Cost Efficiency** - Pay-per-use pricing model
- **Security** - Industry-standard authentication
- **Maintainability** - Microservices architecture
- **Performance** - Low latency with DynamoDB and Lambda

The project showcases modern cloud-native development practices and serves as a foundation for building enterprise-grade applications on AWS.

---

**Project Developed By:** [Your Name]  
**Institution:** APIIT Campus  
**Course:** AWS Cloud Computing  
**Date:** February 2026  
**Version:** 1.0
