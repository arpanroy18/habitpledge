import { Database } from '@supabase/supabase-js'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          frequency: string
          target_days: number
          period: string
          pledge_amount: number
          charity_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          frequency: string
          target_days: number
          period: string
          pledge_amount: number
          charity_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          frequency?: string
          target_days?: number
          period?: string
          pledge_amount?: number
          charity_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          amount: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          notes?: string | null
          created_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          date: string
          completed: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          date: string
          completed?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          date?: string
          completed?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      charities: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          logo_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}

export interface HabitInsert {
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  target_days: number
  pledge_amount: number
  charity_id: string
  user_id: string
}