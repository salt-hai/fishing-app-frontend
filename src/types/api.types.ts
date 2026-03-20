// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 用户类型
export interface UserInfo {
  user_id: string
  phone_number?: string
  nickname: string
  avatar_url?: string
  gender?: number
  user_level: number
  fish_dry_balance: number
  verified_fisherman: boolean
  created_at: string
}

// 钓点类型
export interface VenueInfo {
  venue_id: string
  venue_name: string
  city: string
  district?: string
  address?: string
  water_type: number
  venue_type: number
  venue_score?: number
  is_free: boolean
  fees?: string
  latitude?: number
  longitude?: number
  area_size?: number
  description?: string
  output_fish_species?: string
  danger_level: number
  open_time?: string
  close_time?: string
  online_count: number
  fishing_count: number
  favorite_count: number
  created_at: string
  updated_at: string
}

// 商品类型
export interface ProductInfo {
  product_id: string
  product_no: string
  cate_id: number
  product_name: string
  description?: string
  cover_url?: string
  image_urls?: string
  sale_price: number
  stock_num: number
  support_one_hour: boolean
  support_next_day: boolean
  support_installment: boolean
  support_repair: boolean
  created_at: string
  updated_at: string
}

export interface ProductSku {
  sku_id: string
  product_id: string
  sku_name: string
  sku_image_urls?: string
  sku_spec?: string
  sku_price: number
  stock_num: number
}

// 订单类型
export interface OrderInfo {
  order_id: string
  order_no: string
  user_id: string
  biz_type: number
  delivery_type: number
  sku_id?: string
  product_num: number
  product_quantity: number
  product_price: number
  order_amount: number
  pay_type?: number
  installments_count?: number
  order_status: number
  pay_status: number
  created_at: string
  updated_at: string
}

// 内容类型
export interface ContentInfo {
  content_id: string
  content_no: string
  author_id: string
  author_nickname: string
  content_type: number
  title?: string
  desc_content?: string
  cover_url?: string
  video_url?: string
  video_duration?: number
  video_size?: number
  image_urls?: string
  topic_ids?: string
  topic_names?: string
  tags?: string
  audit_status: number
  publish_status: number
  publish_time?: string
  timing_publish_time?: string
  visible_scope: number
  is_top: boolean
  is_allow_comment: boolean
  is_allow_save: boolean
  is_allow_share: boolean
  play_count: number
  like_count: number
  comment_count: number
  collect_count: number
  share_count: number
  forward_count: number
  created_at: string
  updated_at: string
}

// 聊天室类型
export interface ChatroomInfo {
  chatroom_id: string
  venue_id: string
  chatroom_name: string
  current_people_count: number
  fishing_people_count: number
  last_msg_time: string
}

export interface ChatMessage {
  msg_id: number
  chatroom_id: string
  sender_id: string
  sender_nickname: string
  message_type: number
  content: string
  image_url?: string
  file_url?: string
  created_at: string
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
