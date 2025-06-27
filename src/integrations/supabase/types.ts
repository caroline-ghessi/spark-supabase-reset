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
      ai_quality_assessments: {
        Row: {
          analyzed_at: string
          assessment_type: string
          conversation_id: string | null
          created_at: string
          feedback: string | null
          id: string
          issues_detected: Json | null
          message_id: string | null
          salesperson_id: string | null
          score: number
          suggestions: Json | null
        }
        Insert: {
          analyzed_at?: string
          assessment_type: string
          conversation_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          issues_detected?: Json | null
          message_id?: string | null
          salesperson_id?: string | null
          score?: number
          suggestions?: Json | null
        }
        Update: {
          analyzed_at?: string
          assessment_type?: string
          conversation_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          issues_detected?: Json | null
          message_id?: string | null
          salesperson_id?: string | null
          score?: number
          suggestions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_quality_assessments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_quality_assessments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_quality_assessments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_monitoring: {
        Row: {
          client_engagement_score: number | null
          conversation_id: string | null
          created_at: string
          id: string
          last_activity: string
          message_count: number | null
          response_time_avg: number | null
          salesperson_id: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          client_engagement_score?: number | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          last_activity?: string
          message_count?: number | null
          response_time_avg?: number | null
          salesperson_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_engagement_score?: number | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          last_activity?: string
          message_count?: number | null
          response_time_avg?: number | null
          salesperson_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_monitoring_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_monitoring_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          conversation_id: string | null
          created_at: string
          generated_at: string
          id: string
          is_incremental: boolean | null
          lead_classification: string
          messages_analyzed_until: string | null
          next_steps: string | null
          previous_summary_id: string | null
          sequence_number: number | null
          summary_text: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          is_incremental?: boolean | null
          lead_classification: string
          messages_analyzed_until?: string | null
          next_steps?: string | null
          previous_summary_id?: string | null
          sequence_number?: number | null
          summary_text: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          generated_at?: string
          id?: string
          is_incremental?: boolean | null
          lead_classification?: string
          messages_analyzed_until?: string | null
          next_steps?: string | null
          previous_summary_id?: string | null
          sequence_number?: number | null
          summary_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_previous_summary_id_fkey"
            columns: ["previous_summary_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_takeovers: {
        Row: {
          action: string
          conversation_id: string | null
          created_at: string
          id: string
          notes: string | null
          operator_name: string
          timestamp: string
        }
        Insert: {
          action: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          operator_name: string
          timestamp?: string
        }
        Update: {
          action?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          operator_name?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_takeovers_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          contact_name: string | null
          created_at: string
          dify_conversation_id: string | null
          has_summary: boolean | null
          human_takeover: boolean | null
          id: string
          is_active: boolean | null
          last_activity_resumed: string | null
          last_message: string | null
          last_message_time: string | null
          last_message_type: string | null
          last_summary_check: string | null
          needs_new_summary: boolean | null
          phone_number: string
          taken_over_by: string | null
          takeover_at: string | null
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          dify_conversation_id?: string | null
          has_summary?: boolean | null
          human_takeover?: boolean | null
          id?: string
          is_active?: boolean | null
          last_activity_resumed?: string | null
          last_message?: string | null
          last_message_time?: string | null
          last_message_type?: string | null
          last_summary_check?: string | null
          needs_new_summary?: boolean | null
          phone_number: string
          taken_over_by?: string | null
          takeover_at?: string | null
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          dify_conversation_id?: string | null
          has_summary?: boolean | null
          human_takeover?: boolean | null
          id?: string
          is_active?: boolean | null
          last_activity_resumed?: string | null
          last_message?: string | null
          last_message_time?: string | null
          last_message_type?: string | null
          last_summary_check?: string | null
          needs_new_summary?: boolean | null
          phone_number?: string
          taken_over_by?: string | null
          takeover_at?: string | null
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string
          assignment_reason: string | null
          assignment_type: string
          confidence_score: number | null
          conversion_value: number | null
          converted_at: string | null
          created_at: string
          first_contact_at: string | null
          id: string
          lead_id: string | null
          notes: string | null
          salesperson_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string
          assignment_reason?: string | null
          assignment_type?: string
          confidence_score?: number | null
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string
          first_contact_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          salesperson_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string
          assignment_reason?: string | null
          assignment_type?: string
          confidence_score?: number | null
          conversion_value?: number | null
          converted_at?: string | null
          created_at?: string
          first_contact_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          salesperson_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          content: string | null
          created_at: string
          id: string
          interaction_type: string
          lead_assignment_id: string | null
          next_action: string | null
          next_action_date: string | null
          outcome: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          interaction_type: string
          lead_assignment_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          lead_assignment_id?: string | null
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_assignment_id_fkey"
            columns: ["lead_assignment_id"]
            isOneToOne: false
            referencedRelation: "lead_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget_confirmed: boolean | null
          client_type: string | null
          company: string | null
          contact_name: string | null
          conversation_id: string | null
          created_at: string
          decision_maker: boolean | null
          email: string | null
          estimated_value: number | null
          geographic_region: string | null
          id: string
          lead_temperature: string
          phone_number: string
          products_interest: string[]
          project_details: Json | null
          project_timeline: string | null
          qualification_date: string
          qualification_score: number
          source_campaign: string | null
          technical_requirements: Json | null
          updated_at: string
        }
        Insert: {
          budget_confirmed?: boolean | null
          client_type?: string | null
          company?: string | null
          contact_name?: string | null
          conversation_id?: string | null
          created_at?: string
          decision_maker?: boolean | null
          email?: string | null
          estimated_value?: number | null
          geographic_region?: string | null
          id?: string
          lead_temperature?: string
          phone_number: string
          products_interest?: string[]
          project_details?: Json | null
          project_timeline?: string | null
          qualification_date?: string
          qualification_score?: number
          source_campaign?: string | null
          technical_requirements?: Json | null
          updated_at?: string
        }
        Update: {
          budget_confirmed?: boolean | null
          client_type?: string | null
          company?: string | null
          contact_name?: string | null
          conversation_id?: string | null
          created_at?: string
          decision_maker?: boolean | null
          email?: string | null
          estimated_value?: number | null
          geographic_region?: string | null
          id?: string
          lead_temperature?: string
          phone_number?: string
          products_interest?: string[]
          project_details?: Json | null
          project_timeline?: string | null
          qualification_date?: string
          qualification_score?: number
          source_campaign?: string | null
          technical_requirements?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          created_at: string
          dify_file_id: string | null
          file_size: number | null
          id: string
          local_path: string | null
          message_id: string | null
          mime_type: string | null
          original_url: string | null
          upload_status: string | null
        }
        Insert: {
          created_at?: string
          dify_file_id?: string | null
          file_size?: number | null
          id?: string
          local_path?: string | null
          message_id?: string | null
          mime_type?: string | null
          original_url?: string | null
          upload_status?: string | null
        }
        Update: {
          created_at?: string
          dify_file_id?: string | null
          file_size?: number | null
          id?: string
          local_path?: string | null
          message_id?: string | null
          mime_type?: string | null
          original_url?: string | null
          upload_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string | null
          created_at: string
          duration: number | null
          file_name: string | null
          file_size: number | null
          from_number: string
          id: string
          media_caption: string | null
          media_type: string
          media_url: string | null
          message_type: string
          mime_type: string | null
          status: string
          thumbnail_url: string | null
          timestamp: string
          to_number: string
          transcription: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          from_number: string
          id?: string
          media_caption?: string | null
          media_type?: string
          media_url?: string | null
          message_type?: string
          mime_type?: string | null
          status?: string
          thumbnail_url?: string | null
          timestamp?: string
          to_number: string
          transcription?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          from_number?: string
          id?: string
          media_caption?: string | null
          media_type?: string
          media_url?: string | null
          message_type?: string
          mime_type?: string | null
          status?: string
          thumbnail_url?: string | null
          timestamp?: string
          to_number?: string
          transcription?: string | null
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
      quality_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          conversation_id: string | null
          created_at: string
          description: string | null
          id: string
          resolved_at: string | null
          salesperson_id: string | null
          severity: string
          status: string
          title: string
          triggered_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          resolved_at?: string | null
          salesperson_id?: string | null
          severity?: string
          status?: string
          title: string
          triggered_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          resolved_at?: string | null
          salesperson_id?: string | null
          severity?: string
          status?: string
          title?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_alerts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_alerts_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      salespeople: {
        Row: {
          average_response_time: number | null
          client_profile: string[]
          conversion_rate: number | null
          created_at: string
          current_lead_count: number
          email: string | null
          expertise_level: string
          id: string
          is_active: boolean
          last_assignment: string | null
          max_leads_per_day: number
          name: string
          performance_rating: string
          phone: string
          product_groups: string[]
          region_codes: string[]
          specialties: string[]
          updated_at: string
        }
        Insert: {
          average_response_time?: number | null
          client_profile?: string[]
          conversion_rate?: number | null
          created_at?: string
          current_lead_count?: number
          email?: string | null
          expertise_level?: string
          id?: string
          is_active?: boolean
          last_assignment?: string | null
          max_leads_per_day?: number
          name: string
          performance_rating?: string
          phone: string
          product_groups?: string[]
          region_codes?: string[]
          specialties?: string[]
          updated_at?: string
        }
        Update: {
          average_response_time?: number | null
          client_profile?: string[]
          conversion_rate?: number | null
          created_at?: string
          current_lead_count?: number
          email?: string | null
          expertise_level?: string
          id?: string
          is_active?: boolean
          last_assignment?: string | null
          max_leads_per_day?: number
          name?: string
          performance_rating?: string
          phone?: string
          product_groups?: string[]
          region_codes?: string[]
          specialties?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      salesperson_performance_metrics: {
        Row: {
          active_conversations: number | null
          alerts_triggered: number | null
          avg_response_time: number | null
          client_satisfaction_score: number | null
          conversations_abandoned: number | null
          conversations_converted: number | null
          created_at: string
          date: string
          id: string
          objections_handled: number | null
          quality_score_avg: number | null
          salesperson_id: string | null
          total_conversations: number | null
          updated_at: string
        }
        Insert: {
          active_conversations?: number | null
          alerts_triggered?: number | null
          avg_response_time?: number | null
          client_satisfaction_score?: number | null
          conversations_abandoned?: number | null
          conversations_converted?: number | null
          created_at?: string
          date?: string
          id?: string
          objections_handled?: number | null
          quality_score_avg?: number | null
          salesperson_id?: string | null
          total_conversations?: number | null
          updated_at?: string
        }
        Update: {
          active_conversations?: number | null
          alerts_triggered?: number | null
          avg_response_time?: number | null
          client_satisfaction_score?: number | null
          conversations_abandoned?: number | null
          conversations_converted?: number | null
          created_at?: string
          date?: string
          id?: string
          objections_handled?: number | null
          quality_score_avg?: number | null
          salesperson_id?: string | null
          total_conversations?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesperson_performance_metrics_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          api_token: string
          created_at: string
          error_message: string | null
          id: string
          instance_name: string
          last_ping: string | null
          phone_number: string
          qr_code: string | null
          salesperson_id: string | null
          session_data: Json | null
          status: string
          updated_at: string
          w_api_url: string
          webhook_url: string | null
        }
        Insert: {
          api_token: string
          created_at?: string
          error_message?: string | null
          id?: string
          instance_name: string
          last_ping?: string | null
          phone_number: string
          qr_code?: string | null
          salesperson_id?: string | null
          session_data?: Json | null
          status?: string
          updated_at?: string
          w_api_url: string
          webhook_url?: string | null
        }
        Update: {
          api_token?: string
          created_at?: string
          error_message?: string | null
          id?: string
          instance_name?: string
          last_ping?: string | null
          phone_number?: string
          qr_code?: string | null
          salesperson_id?: string | null
          session_data?: Json | null
          status?: string
          updated_at?: string
          w_api_url?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
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
