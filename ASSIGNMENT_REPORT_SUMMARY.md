# CloudRetail - Assignment Report Summary
---

## 📋 **Executive Summary**

**Project Name:** CloudRetail - Serverless E-Commerce Platform  
**Technology:** AWS Serverless Architecture  
**Region:** ap-southeast-1 (Singapore)  

---

## 1. **Project Introduction**

### **1.1 What is CloudRetail?**

CloudRetail is a fully serverless, cloud-native e-commerce platform built entirely on Amazon Web Services (AWS). The application demonstrates modern microservices architecture, leveraging AWS managed services to create a scalable, cost-effective, and highly available online shopping platform.

### **1.2 Problem Statement**

Traditional e-commerce platforms face several challenges:
- **High Infrastructure Costs** - Maintaining servers 24/7
- **Scalability Issues** - Difficulty handling traffic spikes
- **Maintenance Overhead** - Server management and updates
- **Security Concerns** - Managing authentication and data protection
- **Availability** - Ensuring 99.9% uptime

### **1.3 Solution**

CloudRetail addresses these challenges using AWS serverless architecture:
- ✅ **Zero Server Management** - AWS Lambda handles all compute
- ✅ **Auto-Scaling** - Automatically scales with demand
- ✅ **Pay-Per-Use** - Only pay for actual usage
- ✅ **Built-in Security** - AWS Cognito for authentication
- ✅ **High Availability** - Multi-AZ deployment by default

---

## 2. **AWS Services Used**

### **2.1 Complete AWS Stack**

| AWS Service | Purpose | Usage |
|-------------|---------|-------|
| **AWS Lambda** | Serverless Compute | 7 microservices (Node.js 18.x) |
| **API Gateway** | REST API Management | Single API with 15+ endpoints |
| **DynamoDB** | NoSQL Database | 5 tables (Products, Cart, Inventory, Orders, Payments) |
| **Cognito** | User Authentication | User Pool with email verification |
| **SES** | Email Service | Transactional emails (order confirmation) |
| **S3** | Object Storage | Product images with pre-signed URLs |
| **CloudWatch** | Monitoring & Logging | Lambda logs, metrics, alarms |
| **IAM** | Access Management | Roles and policies for Lambda functions |

### **2.2 Why Serverless?**

**Benefits:**
1. **Cost Efficiency** - No idle server costs
2. **Automatic Scaling** - Handles 1 to 1 million requests
3. **High Availability** - Built-in redundancy
4. **Faster Development** - Focus on code, not infrastructure
5. **Reduced Maintenance** - AWS manages servers

**Cost Comparison:**

| Traditional Server | Serverless (AWS) |
|-------------------|------------------|
| $50-100/month (always running) | $0-5/month (pay per use) |
| Manual scaling | Auto-scaling |
| 99.5% uptime | 99.99% uptime |
| Manual updates | Automatic updates |

---

## 3. **System Architecture**

### **3.1 Microservices Overview**

CloudRetail consists of **9 independent microservices**:

| # | Service | Purpose | Key Features |
|---|---------|---------|--------------|
| 1 | **Auth Service** | User authentication | Cognito integration, JWT tokens |
| 2 | **Product Service** | Product catalog | S3 images, pre-signed URLs |
| 3 | **Cart Service** | Shopping cart | Real-time stock validation |
| 4 | **Inventory Service** | Stock management | Atomic operations, reservation |
| 5 | **Order Service** | Order processing | Transaction rollback |
| 6 | **Payment Service** | Payment processing | Email notifications |
| 7 | **Notification Service** | Email delivery | AWS SES, HTML templates |

---

## 4. **Key Features Implemented**

### **4.1 User Management**
- ✅ User registration with email
- ✅ Email verification (6-digit code)
- ✅ Secure login with JWT tokens
- ✅ Password complexity requirements
- ✅ Token refresh mechanism

### **4.2 Product Catalog**
- ✅ Product listing with images
- ✅ S3 image storage

### **4.3 Shopping Cart**
- ✅ Add/remove items
- ✅ Update quantities
- ✅ Real-time stock validation
- ✅ Price tracking
- ✅ Cart persistence

### **4.4 Inventory Management**
- ✅ Stock level tracking
- ✅ Atomic reservation
- ✅ Automatic release on failure
- ✅ Prevents overselling
- ✅ Real-time availability

### **4.5 Order Processing**
- ✅ Checkout from cart
- ✅ Inventory reservation
- ✅ Order creation
- ✅ Transaction rollback
- ✅ Order history

### **4.6 Payment System**
- ✅ Cash payment
- ✅ Payment record creation
- ✅ Order status updates
- ✅ Email notifications
- ✅ Inventory release on failure

### **4.7 Notifications**
- ✅ Order confirmation emails
- ✅ HTML + Plain text templates
- ✅ AWS SES integration
- ✅ Dynamic content
- ✅ Error handling

---

## 5. **Technical Implementation**

### **5.1 Backend Services**

**Technology Stack:**
- **Runtime:** Node.js 20
- **Package Manager:** npm
- **SDK:** AWS SDK v3
- **API Style:** RESTful
- **Data Format:** JSON

**Service Communication:**
```
Order Service → Cart Service (HTTPS)
Order Service → Inventory Service (HTTPS)
Payment Service → Inventory Service (HTTPS)
Payment Service → Notification Service (HTTPS)
Cart Service → Inventory Service (HTTPS)
```

### **5.2 Frontend Application**

**Technology Stack:**
- **Framework:** Angular 18+
- **Language:** TypeScript
- **State Management:** Angular Signals
- **HTTP:** RxJS + HttpClient
- **Routing:** Angular Router
- **Styling:** Vanilla CSS

**Pages:**
1. Home - Landing page
2. Auth - Login/Register
3. Products - Product listing
4. Cart - Shopping cart
5. Payment - Payment processing
6. checkout - checkout page

### **5.3 Database Design**

**DynamoDB Tables:**

**1. Products Table**
```
Primary Key: productId
Attributes: name, category, price, currency, imageKey, createdAt
```

**2. Cart Table**
```
Primary Key: userId
Attributes: items (List), updatedAt
```

**3. Inventory Table**
```
Primary Key: productId
Attributes: availableQty, reservedQty, updatedAt
```

**4. Orders Table**
```
Primary Key: orderId
GSI: userId-createdAt
Attributes: userId, userEmail, status, items, totalAmount, currency, createdAt
```

**5. Payments Table**
```
Primary Key: paymentId
Attributes: orderId, userId, amount, currency, status, provider, createdAt
```

---

## 6. **Complete User Journey**

### **6.1 Registration to Purchase Flow**

```
Step 1: User Registration
├─ User visits website
├─ Clicks "Register"
├─ Enters email and password
├─ Receives verification code via email
├─ Confirms email with code
└─ Account activated ✅

Step 2: Login
├─ User enters credentials
├─ Cognito validates
├─ JWT tokens generated
├─ Tokens stored in localStorage
└─ User logged in ✅

Step 3: Browse Products
├─ User views product catalog
├─ Products loaded from DynamoDB
├─ Images loaded from S3 (pre-signed URLs)
└─ User selects product ✅

Step 4: Add to Cart
├─ User clicks "Add to Cart"
├─ Frontend calls Cart Service
├─ Cart Service checks stock (Inventory Service)
├─ If available, item added to cart
└─ Cart updated in DynamoDB ✅

Step 5: Checkout
├─ User clicks "Checkout"
├─ Order Service loads cart
├─ Inventory reserved for all items
├─ Order created (status: PENDING)
├─ Cart cleared
└─ User redirected to Payment Page ✅

Step 6: Payment
├─ User sees order summary
├─ Clicks "Pay with Cash (COD)"
├─ Payment Service processes payment
├─ Order status updated to CONFIRMED
├─ Email notification sent via SES
└─ User redirected to Home ✅

Step 7: Confirmation
├─ Success message displayed
├─ Email arrives in inbox
├─ Order visible in Order History
└─ Purchase complete! 🎉
```

---

## 7. **Security Implementation**

### **7.1 Authentication & Authorization**

**Cognito Configuration:**
- User Pool with email verification
- Password policy: Min 8 chars, uppercase, lowercase, numbers
- JWT tokens (access, ID, refresh)
- Token expiration: 1 hour (access), 30 days (refresh)

**Frontend Security:**
- Tokens stored in localStorage
- Automatic token refresh
- Route guards for protected pages
- Logout clears all tokens

### **7.2 Data Security**

**DynamoDB:**
- Encryption at rest (AWS managed keys)
- IAM roles for Lambda access
- No public access

**S3:**
- Private bucket
- Pre-signed URLs for temporary access
- 5-minute URL expiration

**API Gateway:**
- HTTPS only
- CORS configuration
- Throttling enabled

### **7.3 IAM Roles**

**Lambda Execution Roles:**
- DynamoDB read/write permissions
- S3 read permissions (Product Service)
- SES send email permissions (Notification Service)
- CloudWatch Logs permissions

---

## 8. **Deployment & Operations**

### **8.1 Deployment Process**

**Lambda Functions:**
```bash
1. Navigate to service directory
   cd backend/Services/{service-name}

2. Create deployment package
   npm run zip

3. Upload to AWS Lambda
   - Via AWS Console
   - Or AWS CLI: aws lambda update-function-code
```

**API Gateway:**
```
1. Create REST API
2. Configure resources and methods
3. Enable CORS
4. Deploy to stage (dev/prod)
```

**DynamoDB:**
```
1. Create tables
2. Configure GSI (for Orders table)
3. Set capacity mode (On-demand recommended)
```

### **8.2 Monitoring**

**CloudWatch Metrics:**
- Lambda invocations
- Error rates
- Duration
- Concurrent executions
- API Gateway requests
- DynamoDB read/write capacity

**Logging:**
- Lambda function logs
- API Gateway access logs
- Error tracking
- Performance monitoring

---

## 9. **Cost Analysis**

### **9.1 Estimated Monthly Costs**

**Assumptions:**
- 10,000 requests/month
- Average Lambda duration: 500ms
- DynamoDB on-demand pricing
- 100 emails/month

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 10,000 invocations × 9 services | $0.00 (Free tier) |
| API Gateway | 10,000 requests | $0.04 |
| DynamoDB | 10,000 reads/writes | $0.25 |
| S3 | 1 GB storage + requests | $0.05 |
| SES | 100 emails | $0.01 |
| CloudWatch | Logs | $0.50 |
| **Total** | | **~$0.85/month** |

**With Free Tier:**
- First 12 months: Most services free
- Lambda: 1M requests/month free
- DynamoDB: 25 GB storage free
- S3: 5 GB storage free

### **9.2 Scalability Cost**

**At 100,000 requests/month:**
- Lambda: $0.20
- API Gateway: $0.35
- DynamoDB: $2.50
- Total: **~$3.50/month**

**At 1,000,000 requests/month:**
- Lambda: $2.00
- API Gateway: $3.50
- DynamoDB: $25.00
- Total: **~$31.00/month**

---

## 10. **Challenges & Solutions**

### **10.1 Technical Challenges**

**Challenge 1: Race Conditions in Inventory**
- **Problem:** Multiple users buying last item simultaneously
- **Solution:** DynamoDB conditional updates (atomic operations)

**Challenge 2: Transaction Rollback**
- **Problem:** Order creation fails after inventory reservation
- **Solution:** Implemented rollback mechanism to release reserved stock

**Challenge 3: Email Delivery**
- **Problem:** SES sandbox mode restrictions
- **Solution:** Verified sender and recipient emails for testing

**Challenge 4: CORS Issues**
- **Problem:** Frontend couldn't call API
- **Solution:** Configured CORS in API Gateway and Lambda responses

**Challenge 5: Token Management**
- **Problem:** Token expiration handling
- **Solution:** Implemented automatic token refresh and logout

### **10.2 Lessons Learned**

1. **Serverless Benefits** - Reduced operational overhead significantly
2. **Microservices** - Independent deployment and scaling
3. **AWS Managed Services** - Focus on business logic, not infrastructure
4. **Error Handling** - Critical for production readiness
5. **Testing** - Postman essential for API testing


## 12. **Conclusion**

### **12.1 Project Achievements**

✅ **AWS Serverless Architecture**
- Zero server management
- Auto-scaling capabilities
- Cost-effective solution


### **12.2 Skills Demonstrated**

**AWS Services:**
- Lambda, API Gateway, DynamoDB
- Cognito, SES, S3, CloudWatch
- IAM roles and policies

**Backend Development:**
- Node.js microservices
- RESTful API design
- Service integration
- Error handling

### **12.3 Final Thoughts**

CloudRetail successfully demonstrates how AWS serverless services can be leveraged to build a production-ready e-commerce platform. The architecture is:

- **Scalable** - Handles growth automatically
- **Reliable** - Built-in redundancy and fault tolerance
- **Cost-Effective** - Pay only for what you use
- **Secure** - Industry-standard authentication
- **Maintainable** - Clean microservices architecture

This project serves as a strong foundation for building enterprise-grade applications on AWS and showcases the power of serverless computing.

