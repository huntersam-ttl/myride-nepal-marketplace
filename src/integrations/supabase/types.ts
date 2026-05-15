export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string | null
          author_id: string | null
          category: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          read_time: number | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          category: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_time?: number | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          read_time?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dealer_profiles: {
        Row: {
          banner_url: string | null
          brands: string[] | null
          business_name: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          logo_url: string | null
          service_area: string[] | null
          slug: string
          user_id: string
          verified: boolean
        }
        Insert: {
          banner_url?: string | null
          brands?: string[] | null
          business_name: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          service_area?: string[] | null
          slug: string
          user_id: string
          verified?: boolean
        }
        Update: {
          banner_url?: string | null
          brands?: string[] | null
          business_name?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          service_area?: string[] | null
          slug?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      listing_reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          listing_id: string | null
          reason: string
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          listing_id?: string | null
          reason: string
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          listing_id?: string | null
          reason?: string
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          accident_details: string | null
          accident_history: boolean | null
          bike_type: Database["public"]["Enums"]["bike_type"]
          bluebook_name_match: boolean | null
          brand: string
          colour: string | null
          condition: Database["public"]["Enums"]["bike_condition"]
          created_at: string
          description: string | null
          district: string
          document_notes: string | null
          featured: boolean
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          has_bluebook: boolean | null
          has_insurance: boolean | null
          has_registration: boolean | null
          has_tax_clearance: boolean | null
          id: string
          images: string[]
          insurance_valid: boolean | null
          last_service_date: string | null
          mileage: number
          model: string
          modifications: string | null
          num_owners: number | null
          original_parts: boolean | null
          phone: string
          price: number
          registration_expiry: string | null
          rejection_reason: string | null
          report_count: number | null
          seller_role: string | null
          service_history: boolean | null
          shares: number | null
          sold_at: string | null
          sold_price: number | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          user_id: string
          views: number
          whatsapp: string | null
          year: number
        }
        Insert: {
          accident_details?: string | null
          accident_history?: boolean | null
          bike_type?: Database["public"]["Enums"]["bike_type"]
          bluebook_name_match?: boolean | null
          brand: string
          colour?: string | null
          condition: Database["public"]["Enums"]["bike_condition"]
          created_at?: string
          description?: string | null
          district: string
          document_notes?: string | null
          featured?: boolean
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          has_bluebook?: boolean | null
          has_insurance?: boolean | null
          has_registration?: boolean | null
          has_tax_clearance?: boolean | null
          id?: string
          images?: string[]
          insurance_valid?: boolean | null
          last_service_date?: string | null
          mileage?: number
          model: string
          modifications?: string | null
          num_owners?: number | null
          original_parts?: boolean | null
          phone: string
          price: number
          registration_expiry?: string | null
          rejection_reason?: string | null
          report_count?: number | null
          seller_role?: string | null
          service_history?: boolean | null
          shares?: number | null
          sold_at?: string | null
          sold_price?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          user_id: string
          views?: number
          whatsapp?: string | null
          year: number
        }
        Update: {
          accident_details?: string | null
          accident_history?: boolean | null
          bike_type?: Database["public"]["Enums"]["bike_type"]
          bluebook_name_match?: boolean | null
          brand?: string
          colour?: string | null
          condition?: Database["public"]["Enums"]["bike_condition"]
          created_at?: string
          description?: string | null
          district?: string
          document_notes?: string | null
          featured?: boolean
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          has_bluebook?: boolean | null
          has_insurance?: boolean | null
          has_registration?: boolean | null
          has_tax_clearance?: boolean | null
          id?: string
          images?: string[]
          insurance_valid?: boolean | null
          last_service_date?: string | null
          mileage?: number
          model?: string
          modifications?: string | null
          num_owners?: number | null
          original_parts?: boolean | null
          phone?: string
          price?: number
          registration_expiry?: string | null
          rejection_reason?: string | null
          report_count?: number | null
          seller_role?: string | null
          service_history?: boolean | null
          shares?: number | null
          sold_at?: string | null
          sold_price?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          user_id?: string
          views?: number
          whatsapp?: string | null
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          buyer_id: string | null
          counter_message: string | null
          counter_price: number | null
          created_at: string | null
          id: string
          listing_id: string | null
          message: string | null
          offer_price: number
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          counter_message?: string | null
          counter_price?: number | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          message?: string | null
          offer_price: number
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          counter_message?: string | null
          counter_price?: number | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          message?: string | null
          offer_price?: number
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      price_estimates: {
        Row: {
          base_price: number
          brand: string
          created_at: string
          id: string
          model: string
        }
        Insert: {
          base_price: number
          brand: string
          created_at?: string
          id?: string
          model: string
        }
        Update: {
          base_price?: number
          brand?: string
          created_at?: string
          id?: string
          model?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          created_at: string
          email: string | null
          id: string
          id_document_url: string | null
          id_verified: boolean | null
          name: string | null
          phone: string | null
          phone_verified: boolean | null
          total_reviews: number | null
          total_sales: number | null
          verification_approved_at: string | null
          verification_level: string | null
          verification_requested_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email?: string | null
          id: string
          id_document_url?: string | null
          id_verified?: boolean | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          total_reviews?: number | null
          total_sales?: number | null
          verification_approved_at?: string | null
          verification_level?: string | null
          verification_requested_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          created_at?: string
          email?: string | null
          id?: string
          id_document_url?: string | null
          id_verified?: boolean | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          total_reviews?: number | null
          total_sales?: number | null
          verification_approved_at?: string | null
          verification_level?: string | null
          verification_requested_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notify_price_drop: boolean | null
          price_at_save: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notify_price_drop?: boolean | null
          price_at_save?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notify_price_drop?: boolean | null
          price_at_save?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_reviews: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          rating: number
          review_text: string | null
          seller_id: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          rating: number
          review_text?: string | null
          seller_id?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          rating?: number
          review_text?: string | null
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_listing_report_count: {
        Args: { listing_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "dealer" | "admin"
      bike_condition: "new" | "excellent" | "good" | "fair" | "poor"
      bike_type:
        | "sport"
        | "commuter"
        | "scooter"
        | "cruiser"
        | "off-road"
        | "touring"
      fuel_type: "petrol" | "electric" | "hybrid"
      listing_status: "pending" | "active" | "sold" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "dealer", "admin"],
      bike_condition: ["new", "excellent", "good", "fair", "poor"],
      bike_type: [
        "sport",
        "commuter",
        "scooter",
        "cruiser",
        "off-road",
        "touring",
      ],
      fuel_type: ["petrol", "electric", "hybrid"],
      listing_status: ["pending", "active", "sold", "rejected"],
    },
  },
} as const
