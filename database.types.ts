export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      habit_checkins: {
        Row: {
          completed: boolean
          created_at: string
          habit_uuid: string | null
          proof_content: string | null
          proof_type: string | null
          proof_verified: boolean | null
          status: string | null
          uuid: string
        }
        Insert: {
          completed: boolean
          created_at?: string
          habit_uuid?: string | null
          proof_content?: string | null
          proof_type?: string | null
          proof_verified?: boolean | null
          status?: string | null
          uuid?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          habit_uuid?: string | null
          proof_content?: string | null
          proof_type?: string | null
          proof_verified?: boolean | null
          status?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_checkins_habit_uuid_fkey"
            columns: ["habit_uuid"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["uuid"]
          },
        ]
      }
      habit_payments: {
        Row: {
          amount: number
          created_at: string | null
          habit_uuid: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          stake_uuid: string
          transaction_id: string | null
          updated_at: string | null
          uuid: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          habit_uuid: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          stake_uuid: string
          transaction_id?: string | null
          updated_at?: string | null
          uuid?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          habit_uuid?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          stake_uuid?: string
          transaction_id?: string | null
          updated_at?: string | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_payments_habit_uuid_fkey"
            columns: ["habit_uuid"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "habit_payments_stake_uuid_fkey"
            columns: ["stake_uuid"]
            isOneToOne: false
            referencedRelation: "habit_stakes"
            referencedColumns: ["uuid"]
          },
        ]
      }
      habit_stakes: {
        Row: {
          amount: number | null
          created_at: string
          payment_status: string | null
          status: string | null
          transaction_date: string | null
          uuid: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          payment_status?: string | null
          status?: string | null
          transaction_date?: string | null
          uuid?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          payment_status?: string | null
          status?: string | null
          transaction_date?: string | null
          uuid?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          color: string | null
          created_at: string
          duration_unit: string | null
          duration_value: number | null
          end_date: string | null
          frequency_unit: string | null
          frequency_value: number | null
          icon: string | null
          name: string | null
          slug: string | null
          stake_uuid: string | null
          start_date: string | null
          status: string | null
          user_uuid: string
          uuid: string
          verification_type: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          duration_unit?: string | null
          duration_value?: number | null
          end_date?: string | null
          frequency_unit?: string | null
          frequency_value?: number | null
          icon?: string | null
          name?: string | null
          slug?: string | null
          stake_uuid?: string | null
          start_date?: string | null
          status?: string | null
          user_uuid?: string
          uuid?: string
          verification_type?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          duration_unit?: string | null
          duration_value?: number | null
          end_date?: string | null
          frequency_unit?: string | null
          frequency_value?: number | null
          icon?: string | null
          name?: string | null
          slug?: string | null
          stake_uuid?: string | null
          start_date?: string | null
          status?: string | null
          user_uuid?: string
          uuid?: string
          verification_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_stake_uuid_fkey"
            columns: ["stake_uuid"]
            isOneToOne: false
            referencedRelation: "habit_stakes"
            referencedColumns: ["uuid"]
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
      habit_status: "active" | "completed" | "failed" | "archived"
      stake_payment_status: "pending" | "paid" | "forfeited" | "cancelled"
      unit: "g" | "kg" | "ml" | "l" | "tbsp" | "tsp" | "cup" | "piece"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
