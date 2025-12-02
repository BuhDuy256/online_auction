-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.auto_bids (
  auto_bid_id integer NOT NULL DEFAULT nextval('auto_bids_auto_bid_id_seq'::regclass),
  product_id integer NOT NULL,
  bidder_id integer NOT NULL,
  max_amount numeric NOT NULL CHECK (max_amount > 0::numeric),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auto_bids_pkey PRIMARY KEY (auto_bid_id),
  CONSTRAINT auto_bids_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT auto_bids_bidder_id_fkey FOREIGN KEY (bidder_id) REFERENCES public.users(id)
);
CREATE TABLE public.bids (
  bid_id integer NOT NULL DEFAULT nextval('bids_bid_id_seq'::regclass),
  product_id integer NOT NULL,
  bidder_id integer NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bids_pkey PRIMARY KEY (bid_id),
  CONSTRAINT bids_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT bids_bidder_id_fkey FOREIGN KEY (bidder_id) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  category_id integer NOT NULL DEFAULT nextval('categories_category_id_seq'::regclass),
  name character varying NOT NULL,
  slug character varying NOT NULL,
  parent_id integer,
  CONSTRAINT categories_pkey PRIMARY KEY (category_id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(category_id)
);
CREATE TABLE public.conversation_participants (
  user_id integer NOT NULL,
  conversation_id integer NOT NULL,
  joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (user_id, conversation_id),
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.conversations (
  id integer NOT NULL DEFAULT nextval('conversations_id_seq'::regclass),
  name character varying,
  is_group boolean DEFAULT false,
  creator_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);
CREATE TABLE public.invoices (
  invoice_id integer NOT NULL DEFAULT nextval('invoices_invoice_id_seq'::regclass),
  order_id integer NOT NULL UNIQUE,
  shipping_address text,
  payment_proof_url character varying,
  shipping_tracking_code character varying,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id),
  CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.messages (
  id integer NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  conversation_id integer NOT NULL,
  sender_id integer NOT NULL,
  body text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  notification_id integer NOT NULL DEFAULT nextval('notifications_notification_id_seq'::regclass),
  user_id integer NOT NULL,
  type character varying NOT NULL,
  channel USER-DEFINED NOT NULL DEFAULT 'in_app'::notification_channel_enum,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp without time zone,
  action_url character varying,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.order_chat (
  message_id integer NOT NULL DEFAULT nextval('order_chat_message_id_seq'::regclass),
  order_id integer NOT NULL,
  sender_id integer NOT NULL,
  receiver_id integer NOT NULL,
  content text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_chat_pkey PRIMARY KEY (message_id),
  CONSTRAINT order_chat_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT order_chat_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT order_chat_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.orders (
  order_id integer NOT NULL DEFAULT nextval('orders_order_id_seq'::regclass),
  product_id integer NOT NULL UNIQUE,
  winner_id integer NOT NULL,
  seller_id integer NOT NULL,
  final_price numeric NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::order_status_enum,
  cancellation_reason text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT orders_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.users(id),
  CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id)
);
CREATE TABLE public.otp_verifications (
  id integer NOT NULL DEFAULT nextval('otp_verifications_id_seq'::regclass),
  user_id integer NOT NULL,
  otp character varying NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT otp_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT otp_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.permissions (
  permission_id integer NOT NULL DEFAULT nextval('permissions_permission_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT permissions_pkey PRIMARY KEY (permission_id)
);
CREATE TABLE public.product_comments (
  comment_id integer NOT NULL DEFAULT nextval('product_comments_comment_id_seq'::regclass),
  product_id integer NOT NULL,
  user_id integer NOT NULL,
  content text NOT NULL,
  parent_id integer,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  CONSTRAINT product_comments_pkey PRIMARY KEY (comment_id),
  CONSTRAINT product_comments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT product_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT product_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.product_comments(comment_id)
);
CREATE TABLE public.product_descriptions (
  description_id integer NOT NULL DEFAULT nextval('product_descriptions_description_id_seq'::regclass),
  product_id integer NOT NULL,
  author_id integer NOT NULL,
  content text NOT NULL,
  lang character varying NOT NULL DEFAULT 'vi'::character varying,
  version integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_descriptions_pkey PRIMARY KEY (description_id),
  CONSTRAINT product_descriptions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT product_descriptions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.product_images (
  image_id integer NOT NULL DEFAULT nextval('product_images_image_id_seq'::regclass),
  product_id integer NOT NULL,
  image_url character varying NOT NULL,
  CONSTRAINT product_images_pkey PRIMARY KEY (image_id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.product_rejections (
  rejection_id integer NOT NULL DEFAULT nextval('product_rejections_rejection_id_seq'::regclass),
  product_id integer NOT NULL,
  bidder_id integer NOT NULL,
  reason text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_rejections_pkey PRIMARY KEY (rejection_id),
  CONSTRAINT product_rejections_bidder_id_fkey FOREIGN KEY (bidder_id) REFERENCES public.users(id),
  CONSTRAINT product_rejections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.products (
  product_id integer NOT NULL DEFAULT nextval('products_product_id_seq'::regclass),
  category_id integer NOT NULL,
  seller_id integer NOT NULL,
  highest_bidder_id integer,
  name character varying NOT NULL,
  thumbnail_url character varying,
  current_price numeric NOT NULL,
  buy_now_price numeric,
  start_price numeric NOT NULL CHECK (start_price > 0::numeric),
  step_price numeric NOT NULL CHECK (step_price > 0::numeric),
  end_time timestamp without time zone NOT NULL,
  bid_count integer NOT NULL DEFAULT 0,
  auto_extend boolean NOT NULL DEFAULT false,
  status USER-DEFINED NOT NULL DEFAULT 'active'::product_status_enum,
  fts tsvector,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  slug text,
  CONSTRAINT products_pkey PRIMARY KEY (product_id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id),
  CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id),
  CONSTRAINT products_highest_bidder_id_fkey FOREIGN KEY (highest_bidder_id) REFERENCES public.users(id)
);
CREATE TABLE public.refresh_tokens (
  token_id integer NOT NULL DEFAULT nextval('refresh_tokens_token_id_seq'::regclass),
  user_id integer NOT NULL,
  token_hash character varying NOT NULL UNIQUE,
  expires_at timestamp without time zone NOT NULL,
  device_info text,
  ip_address character varying,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at timestamp without time zone,
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (token_id),
  CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.reviews (
  review_id integer NOT NULL DEFAULT nextval('reviews_review_id_seq'::regclass),
  order_id integer NOT NULL,
  reviewer_id integer NOT NULL,
  reviewered_id integer NOT NULL,
  rating integer NOT NULL CHECK (rating = ANY (ARRAY[1, '-1'::integer])),
  content text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  CONSTRAINT reviews_pkey PRIMARY KEY (review_id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id),
  CONSTRAINT reviews_reviewered_id_fkey FOREIGN KEY (reviewered_id) REFERENCES public.users(id)
);
CREATE TABLE public.roles (
  role_id integer NOT NULL DEFAULT nextval('roles_role_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.roles_permissions (
  role_id integer NOT NULL,
  permission_id integer NOT NULL,
  CONSTRAINT roles_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT roles_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id),
  CONSTRAINT roles_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id)
);
CREATE TABLE public.social_accounts (
  id integer NOT NULL DEFAULT nextval('social_accounts_id_seq'::regclass),
  user_id integer NOT NULL,
  provider character varying NOT NULL,
  provider_id character varying NOT NULL,
  email character varying,
  name character varying,
  avatar_url character varying,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT social_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.system_settings (
  setting_key character varying NOT NULL,
  setting_value character varying NOT NULL,
  description text,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key)
);
CREATE TABLE public.upgrade_requests (
  request_id integer NOT NULL DEFAULT nextval('upgrade_requests_request_id_seq'::regclass),
  user_id integer NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::upgrade_status_enum,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp without time zone,
  expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval),
  CONSTRAINT upgrade_requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT upgrade_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_otps (
  otp_id integer NOT NULL DEFAULT nextval('user_otps_otp_id_seq'::regclass),
  user_id integer NOT NULL,
  otp_code character varying NOT NULL,
  purpose USER-DEFINED NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp without time zone NOT NULL,
  consumed_at timestamp without time zone,
  CONSTRAINT user_otps_pkey PRIMARY KEY (otp_id),
  CONSTRAINT user_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  full_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying,
  address character varying,
  is_verified boolean NOT NULL DEFAULT false,
  positive_reviews integer NOT NULL DEFAULT 0,
  negative_reviews integer NOT NULL DEFAULT 0,
  status USER-DEFINED NOT NULL DEFAULT 'pending_verification'::user_status_enum,
  password_updated_at timestamp without time zone,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  last_login_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users_roles (
  user_id integer NOT NULL,
  role_id integer NOT NULL,
  CONSTRAINT users_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT users_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT users_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id)
);
CREATE TABLE public.watchlist (
  user_id integer NOT NULL,
  product_id integer NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT watchlist_pkey PRIMARY KEY (user_id, product_id),
  CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT watchlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);