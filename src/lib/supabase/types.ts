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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      challenge_tags: {
        Row: {
          challenge_id: string
          tag_id: string
        }
        Insert: {
          challenge_id: string
          tag_id: string
        }
        Update: {
          challenge_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_tags_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          category_id: string | null
          closes_at: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string
          id: string
          is_featured: boolean | null
          opens_at: string
          rules: string | null
          submission_count: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          closes_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_featured?: boolean | null
          opens_at: string
          rules?: string | null
          submission_count?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          closes_at?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_featured?: boolean | null
          opens_at?: string
          rules?: string | null
          submission_count?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      flags: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          details: string | null
          id: string
          luxicle_id: string | null
          reason: string
          reporter_id: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          luxicle_id?: string | null
          reason: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          luxicle_id?: string | null
          reason?: string
          reporter_id?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flags_luxicle_id_fkey"
            columns: ["luxicle_id"]
            isOneToOne: false
            referencedRelation: "luxicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flags_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followee_id: string | null
          follower_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          followee_id?: string | null
          follower_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          followee_id?: string | null
          follower_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      luxicle_items: {
        Row: {
          created_at: string | null
          description: string | null
          embed_data: Json | null
          embed_provider: string | null
          id: string
          luxicle_id: string | null
          media_url: string | null
          position: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embed_data?: Json | null
          embed_provider?: string | null
          id?: string
          luxicle_id?: string | null
          media_url?: string | null
          position: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embed_data?: Json | null
          embed_provider?: string | null
          id?: string
          luxicle_id?: string | null
          media_url?: string | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "luxicle_items_luxicle_id_fkey"
            columns: ["luxicle_id"]
            isOneToOne: false
            referencedRelation: "luxicles"
            referencedColumns: ["id"]
          },
        ]
      }
      luxicle_tags: {
        Row: {
          luxicle_id: string
          tag_id: string
        }
        Insert: {
          luxicle_id: string
          tag_id: string
        }
        Update: {
          luxicle_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "luxicle_tags_luxicle_id_fkey"
            columns: ["luxicle_id"]
            isOneToOne: false
            referencedRelation: "luxicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "luxicle_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      luxicles: {
        Row: {
          category_id: string | null
          challenge_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          challenge_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "luxicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "luxicles_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "luxicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          read_at: string | null
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          instagram_handle: string | null
          location: string | null
          onboarding_completed: boolean | null
          twitter_handle: string | null
          updated_at: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          instagram_handle?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          twitter_handle?: string | null
          updated_at?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          instagram_handle?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          twitter_handle?: string | null
          updated_at?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
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


// Explicit type exports for easier consumption
export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];
export type ChallengeUpdate = Database['public']['Tables']['challenges']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];

// Add other table types as needed, e.g.:
// export type Profile = Database['public']['Tables']['profiles']['Row'];
// export type Luxicle = Database['public']['Tables']['luxicles']['Row'];
// export type Submission = Database['public']['Tables']['submissions']['Row'];

export const Constants = {
  public: {
    Enums: {},
  },
} as const
