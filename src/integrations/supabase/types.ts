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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      captured_images: {
        Row: {
          angle: string
          captured_at: string
          hash: string | null
          id: string
          inspection_id: string
          latitude: number | null
          longitude: number | null
          uri: string
        }
        Insert: {
          angle: string
          captured_at?: string
          hash?: string | null
          id?: string
          inspection_id: string
          latitude?: number | null
          longitude?: number | null
          uri: string
        }
        Update: {
          angle?: string
          captured_at?: string
          hash?: string | null
          id?: string
          inspection_id?: string
          latitude?: number | null
          longitude?: number | null
          uri?: string
        }
        Relationships: [
          {
            foreignKeyName: "captured_images_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      captured_videos: {
        Row: {
          captured_at: string
          duration: number
          hash: string | null
          id: string
          inspection_id: string
          latitude: number | null
          longitude: number | null
          uri: string
          video_type: string
        }
        Insert: {
          captured_at?: string
          duration: number
          hash?: string | null
          id?: string
          inspection_id: string
          latitude?: number | null
          longitude?: number | null
          uri: string
          video_type: string
        }
        Update: {
          captured_at?: string
          duration?: number
          hash?: string | null
          id?: string
          inspection_id?: string
          latitude?: number | null
          longitude?: number | null
          uri?: string
          video_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "captured_videos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      defects: {
        Row: {
          category: string
          confidence: number | null
          created_at: string
          description: string
          extracted_from: string
          id: string
          inspection_id: string
          severity: string
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string
          description: string
          extracted_from: string
          id?: string
          inspection_id: string
          severity: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string
          description?: string
          extracted_from?: string
          id?: string
          inspection_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "defects_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_deltas: {
        Row: {
          attribution: string
          created_at: string
          first_inspection_id: string
          id: string
          second_inspection_id: string
        }
        Insert: {
          attribution: string
          created_at?: string
          first_inspection_id: string
          id?: string
          second_inspection_id: string
        }
        Update: {
          attribution?: string
          created_at?: string
          first_inspection_id?: string
          id?: string
          second_inspection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_deltas_first_inspection_id_fkey"
            columns: ["first_inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_deltas_second_inspection_id_fkey"
            columns: ["second_inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          ai_confidence: number | null
          condition_score: number | null
          consented_at: string | null
          created_at: string
          customer_id: string | null
          engine_cc: number | null
          executive_id: string
          frozen_hash: string | null
          id: string
          odometer_reading: number | null
          status: string
          updated_at: string
          vehicle_color: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_registration: string
          vehicle_vin: string | null
          vehicle_year: number | null
        }
        Insert: {
          ai_confidence?: number | null
          condition_score?: number | null
          consented_at?: string | null
          created_at?: string
          customer_id?: string | null
          engine_cc?: number | null
          executive_id: string
          frozen_hash?: string | null
          id?: string
          odometer_reading?: number | null
          status?: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_registration: string
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Update: {
          ai_confidence?: number | null
          condition_score?: number | null
          consented_at?: string | null
          created_at?: string
          customer_id?: string | null
          engine_cc?: number | null
          executive_id?: string
          frozen_hash?: string | null
          id?: string
          odometer_reading?: number | null
          status?: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_registration?: string
          vehicle_vin?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          coins: number
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          streak: number
          trust_level: string
          trust_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role?: string
          streak?: number
          trust_level?: string
          trust_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          streak?: number
          trust_level?: string
          trust_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          audio_uri: string
          category: string
          duration: number
          id: string
          inspection_id: string
          recorded_at: string
          transcript: string
        }
        Insert: {
          audio_uri: string
          category: string
          duration: number
          id?: string
          inspection_id: string
          recorded_at?: string
          transcript: string
        }
        Update: {
          audio_uri?: string
          category?: string
          duration?: number
          id?: string
          inspection_id?: string
          recorded_at?: string
          transcript?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
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
