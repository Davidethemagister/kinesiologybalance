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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      affirmations: {
        Row: {
          id: string
          integration_check_id: string
          results_by_level: Json
          statement: string
          voice_id: string
        }
        Insert: {
          id?: string
          integration_check_id: string
          results_by_level?: Json
          statement: string
          voice_id: string
        }
        Update: {
          id?: string
          integration_check_id?: string
          results_by_level?: Json
          statement?: string
          voice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affirmations_integration_check_id_fkey"
            columns: ["integration_check_id"]
            isOneToOne: false
            referencedRelation: "integration_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          archived_at: string | null
          consent_given: boolean
          consent_given_at: string | null
          consent_version: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          notes: string
          practitioner_id: string
        }
        Insert: {
          archived_at?: string | null
          consent_given?: boolean
          consent_given_at?: string | null
          consent_version?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          id?: string
          notes?: string
          practitioner_id: string
        }
        Update: {
          archived_at?: string | null
          consent_given?: boolean
          consent_given_at?: string | null
          consent_version?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          notes?: string
          practitioner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      closings: {
        Row: {
          anything_else: boolean | null
          anything_else_notes: string
          goal_id: string
          homework: string
          id: string
          next_session_date: string | null
          retest_confirmed: boolean
        }
        Insert: {
          anything_else?: boolean | null
          anything_else_notes?: string
          goal_id: string
          homework?: string
          id?: string
          next_session_date?: string | null
          retest_confirmed?: boolean
        }
        Update: {
          anything_else?: boolean | null
          anything_else_notes?: string
          goal_id?: string
          homework?: string
          id?: string
          next_session_date?: string | null
          retest_confirmed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "closings_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          goal_statement: string
          id: string
          issue: string
          order_index: number
          session_id: string
          status: string
        }
        Insert: {
          goal_statement: string
          id?: string
          issue: string
          order_index?: number
          session_id: string
          status?: string
        }
        Update: {
          goal_statement?: string
          id?: string
          issue?: string
          order_index?: number
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_checks: {
        Row: {
          goal_id: string
          id: string
          life_energy_percent: number | null
          sabotage_check: string | null
          sabotage_notes: string
          stress_on_goal_percent: number | null
        }
        Insert: {
          goal_id: string
          id?: string
          life_energy_percent?: number | null
          sabotage_check?: string | null
          sabotage_notes?: string
          stress_on_goal_percent?: number | null
        }
        Update: {
          goal_id?: string
          id?: string
          life_energy_percent?: number | null
          sabotage_check?: string | null
          sabotage_notes?: string
          stress_on_goal_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_checks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          goal_id: string
          id: string
          notes: string
          retest_result: string | null
          technique: string
        }
        Insert: {
          goal_id: string
          id?: string
          notes?: string
          retest_result?: string | null
          technique?: string
        }
        Update: {
          goal_id?: string
          id?: string
          notes?: string
          retest_result?: string | null
          technique?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      pot_creations: {
        Row: {
          branch: string | null
          emotion_entry: Json | null
          findings: string
          goal_id: string
          id: string
          more_info_notes: string
          needs_more_info: boolean | null
          sub_branch: string | null
          time: string | null
        }
        Insert: {
          branch?: string | null
          emotion_entry?: Json | null
          findings?: string
          goal_id: string
          id?: string
          more_info_notes?: string
          needs_more_info?: boolean | null
          sub_branch?: string | null
          time?: string | null
        }
        Update: {
          branch?: string | null
          emotion_entry?: Json | null
          findings?: string
          goal_id?: string
          id?: string
          more_info_notes?: string
          needs_more_info?: boolean | null
          sub_branch?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pot_creations_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_check_rounds: {
        Row: {
          created_at: string
          id: string
          round_number: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_number: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_number?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_check_rounds_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_checks: {
        Row: {
          emotion_attached: boolean | null
          emotion_entry: Json | null
          id: string
          name: string
          notes: string
          result: string | null
          round_id: string
          source: string
          voice_id: string | null
        }
        Insert: {
          emotion_attached?: boolean | null
          emotion_entry?: Json | null
          id?: string
          name: string
          notes?: string
          result?: string | null
          round_id: string
          source: string
          voice_id?: string | null
        }
        Update: {
          emotion_attached?: boolean | null
          emotion_entry?: Json | null
          id?: string
          name?: string
          notes?: string
          result?: string | null
          round_id?: string
          source?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_checks_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "pre_check_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          voice_settings: Json
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          voice_settings?: Json
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          voice_settings?: Json
        }
        Relationships: []
      }
      sessions: {
        Row: {
          active_goal_id: string | null
          active_pre_check_round_id: string | null
          client_id: string
          created_at: string
          id: string
          practitioner_id: string
          session_date: string
          status: string
          updated_at: string
        }
        Insert: {
          active_goal_id?: string | null
          active_pre_check_round_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          practitioner_id: string
          session_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          active_goal_id?: string | null
          active_pre_check_round_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          practitioner_id?: string
          session_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_pattern_summary: {
        Args: { p_client_id: string }
        Returns: {
          name: string
          voice_id: string
          weak_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
