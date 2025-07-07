export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_agents_config: {
        Row: {
          agent_id: string
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          prompt: string
          status: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          agent_id: string
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          prompt: string
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          agent_id?: string
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          prompt?: string
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
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
            foreignKeyName: "ai_recommendations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "vendor_conversations_full"
            referencedColumns: ["conversation_id"]
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
      alert_configurations: {
        Row: {
          cooldown_minutes: number | null
          created_at: string
          description: string | null
          escalation_levels: number[]
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          notification_channels: string[]
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          cooldown_minutes?: number | null
          created_at?: string
          description?: string | null
          escalation_levels?: number[]
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          notification_channels?: string[]
          trigger_conditions: Json
          updated_at?: string
        }
        Update: {
          cooldown_minutes?: number | null
          created_at?: string
          description?: string | null
          escalation_levels?: number[]
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          notification_channels?: string[]
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          alert_configuration_id: string | null
          channels_sent: string[]
          created_at: string
          id: string
          message: string
          metadata: Json | null
          recipients: Json
          resolved_at: string | null
          resolved_by: string | null
          response_time_minutes: number | null
          status: string
          triggered_by_conversation_id: string | null
          triggered_by_user_id: string | null
        }
        Insert: {
          alert_configuration_id?: string | null
          channels_sent: string[]
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          recipients: Json
          resolved_at?: string | null
          resolved_by?: string | null
          response_time_minutes?: number | null
          status?: string
          triggered_by_conversation_id?: string | null
          triggered_by_user_id?: string | null
        }
        Update: {
          alert_configuration_id?: string | null
          channels_sent?: string[]
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          recipients?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          response_time_minutes?: number | null
          status?: string
          triggered_by_conversation_id?: string | null
          triggered_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_alert_configuration_id_fkey"
            columns: ["alert_configuration_id"]
            isOneToOne: false
            referencedRelation: "alert_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_triggered_by_conversation_id_fkey"
            columns: ["triggered_by_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_triggered_by_conversation_id_fkey"
            columns: ["triggered_by_conversation_id"]
            isOneToOne: false
            referencedRelation: "vendor_conversations_full"
            referencedColumns: ["conversation_id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          actions: Json
          conditions: Json
          cooldown_minutes: number | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          actions: Json
          conditions: Json
          cooldown_minutes?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          cooldown_minutes?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      alert_types: {
        Row: {
          channel: string
          condition_description: string
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          priority: string
          target_role: string
          updated_at: string
        }
        Insert: {
          channel: string
          condition_description: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          priority?: string
          target_role: string
          updated_at?: string
        }
        Update: {
          channel?: string
          condition_description?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          priority?: string
          target_role?: string
          updated_at?: string
        }
        Relationships: []
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
      communication_logs: {
        Row: {
          context_type: string
          created_at: string
          id: string
          message_content: string
          message_type: string
          metadata: Json | null
          recipient_number: string
          sender_id: string | null
          sender_name: string
          status: string
          updated_at: string
          whapi_message_id: string | null
        }
        Insert: {
          context_type?: string
          created_at?: string
          id?: string
          message_content: string
          message_type?: string
          metadata?: Json | null
          recipient_number: string
          sender_id?: string | null
          sender_name?: string
          status?: string
          updated_at?: string
          whapi_message_id?: string | null
        }
        Update: {
          context_type?: string
          created_at?: string
          id?: string
          message_content?: string
          message_type?: string
          metadata?: Json | null
          recipient_number?: string
          sender_id?: string | null
          sender_name?: string
          status?: string
          updated_at?: string
          whapi_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
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
      dismissed_notifications: {
        Row: {
          context_data: Json | null
          context_id: string
          created_at: string
          dismissed_at: string
          id: string
          notification_type: string
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          context_id: string
          created_at?: string
          dismissed_at?: string
          id?: string
          notification_type: string
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          context_id?: string
          created_at?: string
          dismissed_at?: string
          id?: string
          notification_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      escalation_contacts: {
        Row: {
          created_at: string
          email: string
          escalation_level: number
          id: string
          is_active: boolean
          name: string
          role: string
          updated_at: string
          whatsapp_number: string
          work_schedule: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          escalation_level: number
          id?: string
          is_active?: boolean
          name: string
          role: string
          updated_at?: string
          whatsapp_number: string
          work_schedule?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          escalation_level?: number
          id?: string
          is_active?: boolean
          name?: string
          role?: string
          updated_at?: string
          whatsapp_number?: string
          work_schedule?: Json | null
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
            foreignKeyName: "escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "vendor_conversations_full"
            referencedColumns: ["conversation_id"]
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
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "vendor_conversations_full"
            referencedColumns: ["conversation_id"]
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
            foreignKeyName: "quality_scores_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "vendor_conversations_full"
            referencedColumns: ["conversation_id"]
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
          alerts_count: number | null
          created_at: string | null
          current_clients: number | null
          email: string
          id: string
          last_activity: string | null
          last_alert_at: string | null
          max_concurrent_clients: number | null
          metadata: Json | null
          name: string
          performance_score: number | null
          phone: string
          position: string | null
          response_time_avg: number | null
          specialties: string[] | null
          status: string | null
          updated_at: string | null
          whapi_instance_id: string | null
          whapi_last_sync: string | null
          whapi_status: string | null
          whapi_token: string | null
          whapi_webhook_url: string | null
          whatsapp_number: string
          work_schedule: Json | null
        }
        Insert: {
          alerts_count?: number | null
          created_at?: string | null
          current_clients?: number | null
          email: string
          id?: string
          last_activity?: string | null
          last_alert_at?: string | null
          max_concurrent_clients?: number | null
          metadata?: Json | null
          name: string
          performance_score?: number | null
          phone: string
          position?: string | null
          response_time_avg?: number | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          whapi_instance_id?: string | null
          whapi_last_sync?: string | null
          whapi_status?: string | null
          whapi_token?: string | null
          whapi_webhook_url?: string | null
          whatsapp_number: string
          work_schedule?: Json | null
        }
        Update: {
          alerts_count?: number | null
          created_at?: string | null
          current_clients?: number | null
          email?: string
          id?: string
          last_activity?: string | null
          last_alert_at?: string | null
          max_concurrent_clients?: number | null
          metadata?: Json | null
          name?: string
          performance_score?: number | null
          phone?: string
          position?: string | null
          response_time_avg?: number | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          whapi_instance_id?: string | null
          whapi_last_sync?: string | null
          whapi_status?: string | null
          whapi_token?: string | null
          whapi_webhook_url?: string | null
          whatsapp_number?: string
          work_schedule?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_login_completed: boolean | null
          id: string
          name: string
          role: string
          seller_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_login_completed?: boolean | null
          id: string
          name: string
          role?: string
          seller_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_login_completed?: boolean | null
          id?: string
          name?: string
          role?: string
          seller_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_whatsapp_messages: {
        Row: {
          caption: string | null
          client_phone: string
          conversation_id: string | null
          created_at: string | null
          delivered_at: string | null
          flagged_for_review: boolean | null
          forwarded: boolean | null
          from_number: string
          id: string
          is_from_seller: boolean
          media_duration: number | null
          media_mime_type: string | null
          media_size: number | null
          media_url: string | null
          message_type: string
          quality_score: number | null
          quoted_message_id: string | null
          read_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seller_id: string
          sent_at: string
          spin_analysis: Json | null
          status: string | null
          text_content: string | null
          thumbnail_url: string | null
          to_number: string
          updated_at: string | null
          whapi_message_id: string
          whatsapp_context: Json | null
        }
        Insert: {
          caption?: string | null
          client_phone: string
          conversation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          flagged_for_review?: boolean | null
          forwarded?: boolean | null
          from_number: string
          id?: string
          is_from_seller?: boolean
          media_duration?: number | null
          media_mime_type?: string | null
          media_size?: number | null
          media_url?: string | null
          message_type?: string
          quality_score?: number | null
          quoted_message_id?: string | null
          read_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id: string
          sent_at: string
          spin_analysis?: Json | null
          status?: string | null
          text_content?: string | null
          thumbnail_url?: string | null
          to_number: string
          updated_at?: string | null
          whapi_message_id: string
          whatsapp_context?: Json | null
        }
        Update: {
          caption?: string | null
          client_phone?: string
          conversation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          flagged_for_review?: boolean | null
          forwarded?: boolean | null
          from_number?: string
          id?: string
          is_from_seller?: boolean
          media_duration?: number | null
          media_mime_type?: string | null
          media_size?: number | null
          media_url?: string | null
          message_type?: string
          quality_score?: number | null
          quoted_message_id?: string | null
          read_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id?: string
          sent_at?: string
          spin_analysis?: Json | null
          status?: string | null
          text_content?: string | null
          thumbnail_url?: string | null
          to_number?: string
          updated_at?: string | null
          whapi_message_id?: string
          whatsapp_context?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "vendor_conversations_full"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "vendor_whatsapp_messages_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_whatsapp_messages_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      whapi_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_details: Json | null
          id: string
          message_count: number | null
          seller_id: string
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          message_count?: number | null
          seller_id: string
          started_at: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_details?: Json | null
          id?: string
          message_count?: number | null
          seller_id?: string
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "whapi_sync_logs_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vendor_conversations_full: {
        Row: {
          avg_quality_score: number | null
          client_messages: number | null
          client_name: string | null
          client_phone: string | null
          conversation_id: string | null
          conversation_status: string | null
          created_at: string | null
          first_message_at: string | null
          flagged_count: number | null
          last_message_at: string | null
          last_message_text: string | null
          lead_temperature: string | null
          seller_id: string | null
          seller_messages: number | null
          seller_name: string | null
          total_messages: number | null
          updated_at: string | null
          whapi_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_spin_score: {
        Args: { message_text: string }
        Returns: Json
      }
      create_admin_user: {
        Args: { admin_id: string; admin_email: string; admin_name: string }
        Returns: boolean
      }
      ensure_admin_setup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_conversations: {
        Args: Record<PropertyKey, never> | { source_filter?: string }
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
      get_current_user_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          user_role: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_seller_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_message_sync_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_conversations: number
          conversations_with_messages: number
          conversations_without_messages: number
          total_messages: number
          total_vendor_messages: number
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
      has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      is_seller: {
        Args: { seller_uuid: string }
        Returns: boolean
      }
      link_user_to_seller: {
        Args: { user_email: string; seller_phone: string }
        Returns: boolean
      }
      test_conversations_without_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          conversation_id: string
          client_name: string
          client_phone: string
          status: string
          created_at: string
          message_count: number
        }[]
      }
      test_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_name: string
          result: boolean
          error_message: string
        }[]
      }
      validate_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          status: string
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
