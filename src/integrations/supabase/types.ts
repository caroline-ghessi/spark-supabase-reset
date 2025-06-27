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
      ai_recommendations: {
        Row: {
          client_id: string | null
          confidence_score: number | null
          conversation_id: string | null
          created_at: string | null
          id: string
          implemented_at: string | null
          metadata: Json | null
          reasoning: string | null
          recommendation: string
          result: string | null
          seller_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          client_id?: string | null
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          implemented_at?: string | null
          metadata?: Json | null
          reasoning?: string | null
          recommendation: string
          result?: string | null
          seller_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          client_id?: string | null
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          implemented_at?: string | null
          metadata?: Json | null
          reasoning?: string | null
          recommendation?: string
          result?: string | null
          seller_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_interaction: string | null
          lead_score: number | null
          location: Json | null
          metadata: Json | null
          name: string | null
          notes: string | null
          phone: string
          position: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          total_interactions: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_interaction?: string | null
          lead_score?: number | null
          location?: Json | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone: string
          position?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          total_interactions?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_interaction?: string | null
          lead_score?: number | null
          location?: Json | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string
          position?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          total_interactions?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assigned_seller_id: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string
          closed_at: string | null
          created_at: string | null
          dify_conversation_id: string | null
          id: string
          last_message_at: string | null
          lead_temperature: string
          metadata: Json | null
          potential_value: number | null
          priority: string | null
          source: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_seller_id?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone: string
          closed_at?: string | null
          created_at?: string | null
          dify_conversation_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_temperature?: string
          metadata?: Json | null
          potential_value?: number | null
          priority?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_seller_id?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string
          closed_at?: string | null
          created_at?: string | null
          dify_conversation_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_temperature?: string
          metadata?: Json | null
          potential_value?: number | null
          priority?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      escalations: {
        Row: {
          conversation_id: string
          created_at: string | null
          description: string | null
          escalated_to: string
          id: string
          metadata: Json | null
          priority: string | null
          reason: string
          resolution: string | null
          resolved_at: string | null
          seller_id: string | null
          status: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          description?: string | null
          escalated_to: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          seller_id?: string | null
          status?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          description?: string | null
          escalated_to?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          seller_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string
          conversion_rate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          download_count: number | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          permissions: string[] | null
          share_count: number | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          version: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          permissions?: string[] | null
          share_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          version?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          permissions?: string[] | null
          share_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          version?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message_type: string
          metadata: Json | null
          sender_id: string | null
          sender_name: string
          sender_type: string
          status: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_name: string
          sender_type: string
          status?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
          status?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_data: Json | null
          channels: string[] | null
          context: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          channels?: string[] | null
          context?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          channels?: string[] | null
          context?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      quality_scores: {
        Row: {
          ai_analysis: string | null
          conversation_id: string
          created_at: string | null
          criteria_details: Json | null
          id: string
          metadata: Json | null
          overall_score: number
          personalization_score: number | null
          professionalism_score: number | null
          response_time_score: number | null
          seller_id: string | null
          technique_score: number | null
        }
        Insert: {
          ai_analysis?: string | null
          conversation_id: string
          created_at?: string | null
          criteria_details?: Json | null
          id?: string
          metadata?: Json | null
          overall_score: number
          personalization_score?: number | null
          professionalism_score?: number | null
          response_time_score?: number | null
          seller_id?: string | null
          technique_score?: number | null
        }
        Update: {
          ai_analysis?: string | null
          conversation_id?: string
          created_at?: string | null
          criteria_details?: Json | null
          id?: string
          metadata?: Json | null
          overall_score?: number
          personalization_score?: number | null
          professionalism_score?: number | null
          response_time_score?: number | null
          seller_id?: string | null
          technique_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_scores_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_scores_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          created_at: string | null
          current_clients: number | null
          email: string
          id: string
          last_activity: string | null
          max_concurrent_clients: number | null
          metadata: Json | null
          name: string
          performance_score: number | null
          phone: string
          position: string | null
          specialties: string[] | null
          status: string | null
          updated_at: string | null
          whapi_instance_id: string | null
          whapi_token: string | null
          whatsapp_number: string
          work_schedule: Json | null
        }
        Insert: {
          created_at?: string | null
          current_clients?: number | null
          email: string
          id?: string
          last_activity?: string | null
          max_concurrent_clients?: number | null
          metadata?: Json | null
          name: string
          performance_score?: number | null
          phone: string
          position?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          whapi_instance_id?: string | null
          whapi_token?: string | null
          whatsapp_number: string
          work_schedule?: Json | null
        }
        Update: {
          created_at?: string | null
          current_clients?: number | null
          email?: string
          id?: string
          last_activity?: string | null
          max_concurrent_clients?: number | null
          metadata?: Json | null
          name?: string
          performance_score?: number | null
          phone?: string
          position?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          whapi_instance_id?: string | null
          whapi_token?: string | null
          whatsapp_number?: string
          work_schedule?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_conversations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          client_phone: string
          client_name: string
          status: string
          lead_temperature: string
          source: string
          dify_conversation_id: string
          potential_value: number
          priority: string
          assigned_seller_id: string
          metadata: Json
          created_at: string
          updated_at: string
          closed_at: string
        }[]
      }
      get_messages: {
        Args: { conv_id: string }
        Returns: {
          id: string
          conversation_id: string
          sender_type: string
          sender_name: string
          content: string
          message_type: string
          file_url: string
          file_name: string
          file_size: number
          whatsapp_message_id: string
          status: string
          metadata: Json
          created_at: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
