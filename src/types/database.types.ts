export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'member';
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          flat_number: string;
          phone: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          flat_number: string;
          phone: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          flat_number?: string;
          phone?: string;
          email?: string;
          created_at?: string;
        };
      };
      maintenance_bills: {
        Row: {
          id: string;
          member_id: string;
          amount: number;
          due_date: string;
          status: 'paid' | 'unpaid';
          month: string;
          year: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          amount: number;
          due_date: string;
          status: 'paid' | 'unpaid';
          month: string;
          year: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          amount?: number;
          due_date?: string;
          status?: 'paid' | 'unpaid';
          month?: string;
          year?: number;
          created_at?: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          member_id: string;
          title: string;
          description: string;
          status: 'pending' | 'in_progress' | 'resolved';
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          title: string;
          description: string;
          status: 'pending' | 'in_progress' | 'resolved';
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          title?: string;
          description?: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          bill_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          transaction_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          transaction_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bill_id?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: string;
          transaction_id?: string;
          created_at?: string;
        };
      };
    };
  };
}