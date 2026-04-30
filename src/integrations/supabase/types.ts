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
      customers: {
        Row: {
          created_at: string
          derniere_visite: string | null
          id: string
          numero_telephone: string
          shop_id: string
          total_recompenses: number
          total_tampons: number
        }
        Insert: {
          created_at?: string
          derniere_visite?: string | null
          id?: string
          numero_telephone: string
          shop_id: string
          total_recompenses?: number
          total_tampons?: number
        }
        Update: {
          created_at?: string
          derniere_visite?: string | null
          id?: string
          numero_telephone?: string
          shop_id?: string
          total_recompenses?: number
          total_tampons?: number
        }
        Relationships: [
          {
            foreignKeyName: "customers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_questions: {
        Row: {
          ai_answer: string | null
          created_at: string
          email: string | null
          id: string
          page: string
          question: string
        }
        Insert: {
          ai_answer?: string | null
          created_at?: string
          email?: string | null
          id?: string
          page?: string
          question: string
        }
        Update: {
          ai_answer?: string | null
          created_at?: string
          email?: string | null
          id?: string
          page?: string
          question?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          card_template: string
          couleur: string
          created_at: string
          description_recompense: string
          id: string
          logo_url: string | null
          nom: string
          owner_id: string
          owner_nom: string | null
          qr_displayed_at: string | null
          stamp_emoji: string
          stamp_shape: string
          statut_abonnement: string
          stripe_customer_id: string | null
          tampons_requis: number
          trial_end: string
        }
        Insert: {
          card_template?: string
          couleur?: string
          created_at?: string
          description_recompense?: string
          id?: string
          logo_url?: string | null
          nom: string
          owner_id: string
          owner_nom?: string | null
          qr_displayed_at?: string | null
          stamp_emoji?: string
          stamp_shape?: string
          statut_abonnement?: string
          stripe_customer_id?: string | null
          tampons_requis?: number
          trial_end?: string
        }
        Update: {
          card_template?: string
          couleur?: string
          created_at?: string
          description_recompense?: string
          id?: string
          logo_url?: string | null
          nom?: string
          owner_id?: string
          owner_nom?: string | null
          qr_displayed_at?: string | null
          stamp_emoji?: string
          stamp_shape?: string
          statut_abonnement?: string
          stripe_customer_id?: string | null
          tampons_requis?: number
          trial_end?: string
        }
        Relationships: []
      }
      stamp_requests: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          numero_telephone: string
          shop_id: string
          statut: Database["public"]["Enums"]["stamp_status"]
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          numero_telephone: string
          shop_id: string
          statut?: Database["public"]["Enums"]["stamp_status"]
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          numero_telephone?: string
          shop_id?: string
          statut?: Database["public"]["Enums"]["stamp_status"]
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stamp_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_requests_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      stamp_status: "en_attente" | "valide" | "refuse"
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
      stamp_status: ["en_attente", "valide", "refuse"],
    },
  },
} as const
