# PTUDW - Final Project - Online Auction

###### tags: `PTUDW-LT` `project`

:::info
Build an **Online Auction Application**, including the following modules & functions
:::

## 1. Anonymous User Module - ==guest==

### 1.1 Menu System

- Display list of ==categories==
- There are 2 levels of categories
  - Electronics ➠ Mobile Phones
  - Electronics ➠ Laptops
  - Fashion ➠ Shoes
  - Fashion ➠ Watches
  - ...

### 1.2 Home Page

- Top 5 products ending soon
- Top 5 products with the most bids
- Top 5 products with the highest price

### 1.3 View Product List

- By ==category==
- With **pagination**

### 1.4 Search Products

:::success
Use `Full-text search` technique
:::

- Search by ==product name== and/or search by ==category==
- **Pagination** of results
- Sort by user preference
  - End time descending
  - Price ascending
- Newly posted products (within N minutes) will be displayed differently from other products (more prominent)

#### 1.4.1 Products displayed on the list page include the following information

- Product thumbnail
- Product name
- Current price
- Information of the ==bidder== currently holding the highest bid
- Buy it now price (if any)
- Product posting date
- Time remaining
- Current number of bids

:::warning
Users can click on ==category== to quickly switch to the ==VIEW PRODUCT LIST== screen
:::

### 1.5 View Product Details

- Full content of the product
  - Thumbnail (large size)
  - Secondary images (at least 3 images)
  - Product name
  - Current price
  - Buy it now price (if any)
  - Seller information & rating score
  - Current highest bidder information & rating score
  - Posting time
  - End time
    - If the end time is less than 3 days, display in relative format (relative time - 3 days left, 10 minutes left, ...)
  - Detailed product description
- History of questions and answers from bidders & seller
- 5 other products in the same category

### 1.6 Registration

- Users need to register an account to be able to bid
  - reCaptcha
  - Password encrypted using `bcrypt` or `scrypt` algorithm
  - Information
    - Full name
    - Address
    - Email
      - Email must be unique
      - With ==OTP verification==

## 2. Bidder Module - ==bidder==

### 2.1 Save a product to ==Watch List==

- Perform at ==Product List== view
- Perform at ==Product Details== view

### 2.2 Place Bid

- Perform at ==Product Details== view
- System checks rating score (+/+-) is more than 80% to allow bidding
  - ==Bidder== rated 10 times, has 8+ and 2-, so this ==bidder=='s score is 8/10 ~ 80%, allowed to participate in product auction
  - ==Bidder== never rated is allowed to bid if **seller allows**
- System suggests valid price (current price + step price set by seller)
- System requests confirmation

### 2.3 View Product Auction History

Bidder information is masked partially

| Time             | Buyer         | Price     |
| ---------------- | ------------- | --------- |
| 27/10/2025 10:43 | \*\*\*\*Khoa  | 6,000,000 |
| 27/10/2025 9:43  | \*\*\*\*Kha   | 5,900,000 |
| 27/10/2025 8:43  | \*\*\*\*Tuấn  | 5,800,000 |
| 27/10/2025 7:43  | \*\*\*\*Khánh | 5,700,000 |

### 2.4 Ask Seller about Product

- Perform at ==View Product Details== view
- Seller receives email notification about buyer's question, email includes link to quickly open ==View Product Details== view to answer

### 2.5 Manage Personal Profile

- Change email, full name, password (requires entering old password)
- View rating score and details of ratings & comments sent by reviewers
- View list of favorite products
- View list of products currently bidding on
- View list of won products (highest price)
  - Allowed to rate seller :+1: (+1) or :thumbsdown: (-1), attach a comment

### 2.6 Request to sell within 7 days

- ==Bidder== sends request to upgrade to ==seller==
- Admin will approve this request

## 3. Seller - ==seller==

### 3.1 Post Auction Product

- Enter full information:
  - Product name
  - Minimum 3 images
  - Starting price
  - Step price
  - Buy it now price (if any)
  - Product description
    - Support `WYSIWYG`
      - quilljs (https://quilljs.com)
      - TinyMCE (https://www.tiny.cloud)
      - ...
  - Auto-extend?
    - If yes, when there is a new bid before ending ==5 minutes==, product automatically extends for ==10 minutes==.
    - Parameters 5 minutes, 10 minutes can be adjusted by administrator and will apply to all products

### 3.2 Supplement Product Description

- Supplement description information for posted product
- New information is appended to old description, not allowed to replace old description

```=
電源入り撮影出来ましたが細部の機能までは確認していません。
不得意ジャンルの買い取り品の為細かい確認出来る知識がありません、ご了承ください。
簡単な確認方法が有れば確認しますので方法等質問欄からお願いします、終了日の質問には答えられない場合があります。
付属品、状態は画像でご確認ください。
当方詳しくありませんので高度な質問には答えられない場合がありますがご了承ください。
発送は佐川急便元払いを予定しています、破損防止の為梱包サイズが大きくなる事がありますがご了承下さい。
中古品の為NC/NRでお願いします。

✏️ 31/10/2025

- が大きくなる事がありますがご了承下さい。

✏️ 5/11/2025

- 不得意ジャンルの買い取り品の為細かい確認出来る知識がありません、ご了承ください。

```

### 3.3 Reject ==bidder=='s bid

- Perform at ==Product Details== view
- Rejected buyer is not allowed to bid on this product anymore
- If rejected buyer is currently the highest bidder, product transfers to the second highest bidder.

### 3.4 Answer Bidder's Questions

- Perform at ==View Product Details== view

### 3.5 Manage Personal Profile (cont.)

- View list of products currently posted & active
- View list of products with a winner
  - Allowed to rate winner :+1: (+1) or :thumbsdown: (-1), attach a comment
  - Allowed to cancel transaction and automatically :thumbsdown: (-1) winner. In this case, the comment content is: **_Winner did not pay_**

## 4. Administrator Module - ==administrator==

:::info
==Management== includes the following operations:

1. View list
1. View details
1. Add
1. Delete
1. Update
1. And other specialized operations
   :::

### 4.1 Manage Categories ==category==

- Basic ==management== functions
- Cannot delete category that already has products

### 4.2 Manage Products

- Remove products

### 4.3 Manage User List

- Basic ==management== functions
- View list of ==bidders== requesting account upgrade
- Approve account upgrade ==bidder== ➠ ==seller==

## 5. Common Features for User Modules

### 5.1 Login

- Self-implemented
- Or use `passportjs` (http://www.passportjs.org)
- _Recommended_ to implement additional login via Google, Facebook, Twitter, Github, ...

### 5.2 Update Personal Information

- Full name
- Contact email
- Date of birth

### 5.3 Change Password

- Password encrypted using `bcrypt` or `scrypt` algorithm

### 5.4 Forgot Password

- Request verification via email OTP

## 6. System

### 6.1 Mailing System

For each **important** transaction, the system sends an email to relevant parties to notify

- Successful bid, product price updated
  - Send to seller
  - Send to bidder
  - Send to previous price holder (if any)
- Buyer rejected from bidding
  - Buyer
- Auction ended, no buyer
  - Seller
- Auction ended
  - Seller
  - Winner
- Buyer asks question
  - Seller
- Seller answers
  - Bidders participating in auction & buyers who asked questions

### 6.2 Automatic Bidding

System supports **automatic** bidding, helping buyers win auction products at the **lowest** possible price

- Buyer sets ==max-price== they can pay for the product
- Current price of the product will be continuously updated based on ==max-price== and ==max-price-of-other-buyers==
- If 2 ==bidders== bid the same price, the ==bidder== who bid first is recorded as ==highest-bidder==

#### 🧰 Auction Product Information

- **iPhone 11**
- Starting price 10m
- Step price multiple of 100k

#### ❗️Normal Auction

| Bidder | Bid Price  | Product Price | Price Holder |
| :----- | :--------- | :------------ | :----------- |
| #1     | 10,000,000 | 10,000,000    | #1           |
| #2     | 10,100,000 | 10,100,000    | #2           |
| #3     | 10,500,000 | 10,500,000    | #3           |
| #1     | 10,800,000 | 10,800,000    | #1           |
| #3     | 11,100,000 | 11,100,000    | #3           |

- ==Bidder== needs to operate continuously to put new price on product

#### ❗️Automatic Auction

| Bidder | Max Price  | Product Price | Price Holder |
| ------ | ---------- | ------------- | ------------ |
| #1     | 11,000,000 | 10,000,000    | #1           |
| #2     | 10,800,000 | 10,800,000    | #1           |
| #3     | 11,500,000 | 11,100,000    | #3           |
| #4     | 11,500,000 | 11,500,000    | #3           |
| #4     | 11,700,000 | 11,600,000    | #4           |

- ==Bidder== **_does not_** need to operate continuously to put new price on product
- Product price is always just-enough-to-win price of other ==bidders==

System only installs ==automatic bidding== or ==normal bidding==, not both

## 7. Post-Auction Payment Process

After the auction session ends, seller and buyer when accessing product details will be led to ==Complete Order== view, other users only see basic product info with notification **Product has ended**

**Complete order** process consists of 4 steps

1. Buyer provides payment invoice with delivery address
2. Seller confirms receipt of money and sends shipping invoice
3. Buyer confirms receipt of goods
4. Buyer and seller rate transaction quality (+/- points with short comment)

During **complete order** process, seller can ==cancel transaction== at any time and rate -1 for winner. Example: seller requires payment within 24h after auction ends, but buyer does not meet it, seller cancels transaction.

Between seller and auction winner there is always a friendly chat interface to exchange necessary information during **complete order** process.

Seller and buyer are always allowed to change their rating result (+/-) to suit their wishes.

## 8. Other Requirements

### 8.1 Technical Requirements

- Web App SSR (MVC) or CSR (ReactJS) or combination
- Technical Stack SSR
  - framework: `expressjs`
  - view engine: `handlebars/ejs`
  - db: `mysql/postgres/mongodb`
- Technical Stack CSR
  - Backend: RESTful API (stack similar to SSR)
  - Frontend: SPA ReactJS
- Only complete **EXACTLY** the requested functions
  - Can add effects to increase usability of specific functions
- **NO REQUIREMENT** for realtime functions

### 8.2 Data Requirements

- Need at least 20 products belonging to 4-5 categories, full description content & images.
  - Products must have auction history of at least 5 bids

### 8.3 Source Code Management Requirements

- Students need to upload source code to ==github== from the start of the project.
- Groups with almost no commit/push history ➠ 0 points.
