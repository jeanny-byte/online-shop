
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image: string
          category: string
          featured: boolean
          benefits: string[]
          ingredients: string[]
          how_to_use: string
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          image: string
          category: string
          featured?: boolean
          benefits?: string[]
          ingredients?: string[]
          how_to_use: string
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image?: string
          category?: string
          featured?: boolean
          benefits?: string[]
          ingredients?: string[]
          how_to_use?: string
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: string
          order_total: number
          payment_method: string
          order_status: string
          tracking_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          shipping_address: string
          order_total: number
          payment_method: string
          order_status?: string
          tracking_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          shipping_address?: string
          order_total?: number
          payment_method?: string
          order_status?: string
          tracking_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_per_item: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string | null
          quantity: number
          price_per_item: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_per_item?: number
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_admin?: boolean
          created_at?: string
        }
      }
    }
  }
}
