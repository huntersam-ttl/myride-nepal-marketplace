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
          author: string
          category: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
        }
        Insert: {
          author: string
          category: string
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
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
      listings: {
        Row: {
          bike_type: Database["public"]["Enums"]["bike_type"]
          brand: string
          colour: string | null
          condition: Database["public"]["Enums"]["bike_condition"]
          created_at: string
          description: string | null
          district: string
          featured: boolean
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id: string
          images: string[]
          mileage: number
          model: string
          phone: string
          price: number
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          user_id: string
          views: number
          whatsapp: string | null
          year: number
        }
        Insert: {
          bike_type?: Database["public"]["Enums"]["bike_type"]
          brand: string
          colour?: string | null
          condition: Database["public"]["Enums"]["bike_condition"]
          created_at?: string
          description?: string | null
          district: string
          featured?: boolean
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          images?: string[]
          mileage?: number
          model: string
          phone: string
          price: number
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          user_id: string
          views?: number
          whatsapp?: string | null
          year: number
        }
        Update: {
          bike_type?: Database["public"]["Enums"]["bike_type"]
          brand?: string
          colour?: string | null
          condition?: Database["public"]["Enums"]["bike_condition"]
          created_at?: string
          description?: string | null
          district?: string
          featured?: boolean
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          images?: string[]
          mileage?: number
          model?: string
          phone?: string
          price?: number
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          user_id?: string
          views?: number
          whatsapp?: string | null
          year?: number
        }
        Relationships: []
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
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      saved_listings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
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
