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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          lat: number | null
          lng: number | null
          postal_code: string | null
          province: string
          street: string
          user_id: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          lat?: number | null
          lng?: number | null
          postal_code?: string | null
          province?: string
          street: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          lat?: number | null
          lng?: number | null
          postal_code?: string | null
          province?: string
          street?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bimbel_classes: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          gform_link: string | null
          happy_hour_end: string | null
          happy_hour_gform_link: string | null
          happy_hour_price: number | null
          happy_hour_start: string | null
          id: string
          img_url: string | null
          is_happy_hour: boolean | null
          is_hot: boolean | null
          is_published: boolean | null
          mentor_name: string | null
          price: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          happy_hour_end?: string | null
          happy_hour_gform_link?: string | null
          happy_hour_price?: number | null
          happy_hour_start?: string | null
          id?: string
          img_url?: string | null
          is_happy_hour?: boolean | null
          is_hot?: boolean | null
          is_published?: boolean | null
          mentor_name?: string | null
          price?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          happy_hour_end?: string | null
          happy_hour_gform_link?: string | null
          happy_hour_price?: number | null
          happy_hour_start?: string | null
          id?: string
          img_url?: string | null
          is_happy_hour?: boolean | null
          is_hot?: boolean | null
          is_published?: boolean | null
          mentor_name?: string | null
          price?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_status_logs: {
        Row: {
          booking_id: string
          changed_at: string
          changed_by: string | null
          id: string
          new_status: Database["public"]["Enums"]["booking_status"]
          old_status: Database["public"]["Enums"]["booking_status"] | null
          reason: string | null
        }
        Insert: {
          booking_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: Database["public"]["Enums"]["booking_status"]
          old_status?: Database["public"]["Enums"]["booking_status"] | null
          reason?: string | null
        }
        Update: {
          booking_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["booking_status"]
          old_status?: Database["public"]["Enums"]["booking_status"] | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string
          buffer_end_at: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          end_at: string
          id: string
          is_overnight: boolean
          locked_until: string | null
          mannequin_id: string
          order_id: string
          rental_date: string
          start_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_number: string
          buffer_end_at: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          end_at: string
          id?: string
          is_overnight?: boolean
          locked_until?: string | null
          mannequin_id: string
          order_id: string
          rental_date: string
          start_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_number?: string
          buffer_end_at?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          end_at?: string
          id?: string
          is_overnight?: boolean
          locked_until?: string | null
          mannequin_id?: string
          order_id?: string
          rental_date?: string
          start_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mannequin_id_fkey"
            columns: ["mannequin_id"]
            isOneToOne: false
            referencedRelation: "mannequins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          billing_units: number
          created_at: string
          duration_hours: number
          end_time: string
          id: string
          is_overnight: boolean
          mannequin_id: string
          rental_date: string
          start_time: string
          subtotal: number
          unit_price: number
          user_id: string
        }
        Insert: {
          billing_units: number
          created_at?: string
          duration_hours: number
          end_time: string
          id?: string
          is_overnight?: boolean
          mannequin_id: string
          rental_date: string
          start_time: string
          subtotal: number
          unit_price: number
          user_id: string
        }
        Update: {
          billing_units?: number
          created_at?: string
          duration_hours?: number
          end_time?: string
          id?: string
          is_overnight?: boolean
          mannequin_id?: string
          rental_date?: string
          start_time?: string
          subtotal?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_mannequin_id_fkey"
            columns: ["mannequin_id"]
            isOneToOne: false
            referencedRelation: "mannequins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      class_contents: {
        Row: {
          class_id: string | null
          created_at: string | null
          drive_file_id: string | null
          file_path: string | null
          id: string
          title: string | null
          type: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          drive_file_id?: string | null
          file_path?: string | null
          id?: string
          title?: string | null
          type?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          drive_file_id?: string | null
          file_path?: string | null
          id?: string
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_contents_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          mentor_id: string | null
          name: string | null
          slug: string
          title: string
          trailer_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mentor_id?: string | null
          name?: string | null
          slug: string
          title: string
          trailer_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          mentor_id?: string | null
          name?: string | null
          slug?: string
          title?: string
          trailer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_classes_mentor"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tasks: {
        Row: {
          created_at: string
          delivered_at: string | null
          driver_id: string | null
          id: string
          notes: string | null
          order_id: string
          pickup_at: string | null
          proof_image_url: string | null
          status: Database["public"]["Enums"]["delivery_task_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_id: string
          pickup_at?: string | null
          proof_image_url?: string | null
          status?: Database["public"]["Enums"]["delivery_task_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          pickup_at?: string | null
          proof_image_url?: string | null
          status?: Database["public"]["Enums"]["delivery_task_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tasks_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          processed_by: string | null
          refund_note: string | null
          returned_at: string | null
          status: Database["public"]["Enums"]["deposit_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          processed_by?: string | null
          refund_note?: string | null
          returned_at?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          processed_by?: string | null
          refund_note?: string | null
          returned_at?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "deposits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_available: boolean
          license_number: string | null
          user_id: string
          vehicle_plate: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_available?: boolean
          license_number?: string | null
          user_id: string
          vehicle_plate: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_available?: boolean
          license_number?: string | null
          user_id?: string
          vehicle_plate?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      les_s1_classes: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          gform_link: string | null
          id: string
          img_url: string | null
          is_hot: boolean | null
          is_published: boolean | null
          mentor_name: string | null
          price: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          id?: string
          img_url?: string | null
          is_hot?: boolean | null
          is_published?: boolean | null
          mentor_name?: string | null
          price?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          id?: string
          img_url?: string | null
          is_hot?: boolean | null
          is_published?: boolean | null
          mentor_name?: string | null
          price?: number | null
          title?: string
        }
        Relationships: []
      }
      manekin: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          foto_url: string | null
          harga_sewa_per_3_jam: number | null
          harga_sewa_per_hari: number
          id: string
          nama_manekin: string
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          foto_url?: string | null
          harga_sewa_per_3_jam?: number | null
          harga_sewa_per_hari: number
          id?: string
          nama_manekin: string
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          foto_url?: string | null
          harga_sewa_per_3_jam?: number | null
          harga_sewa_per_hari?: number
          id?: string
          nama_manekin?: string
        }
        Relationships: []
      }
      mannequins: {
        Row: {
          billing_unit_hours: number
          category_id: string | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image_urls: string[]
          is_active: boolean
          max_stock: number
          name: string
          price_per_billing_unit: number
          slug: string
          stock: number
          updated_at: string
        }
        Insert: {
          billing_unit_hours?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[]
          is_active?: boolean
          max_stock?: number
          name: string
          price_per_billing_unit: number
          slug: string
          stock?: number
          updated_at?: string
        }
        Update: {
          billing_unit_hours?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[]
          is_active?: boolean
          max_stock?: number
          name?: string
          price_per_billing_unit?: number
          slug?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mannequins_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          auth_user_id: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          img_url: string | null
          is_active: boolean | null
          name: string
          password: string | null
          position: string
          specialty: string[] | null
          university: string | null
        }
        Insert: {
          auth_user_id?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          img_url?: string | null
          is_active?: boolean | null
          name: string
          password?: string | null
          position: string
          specialty?: string[] | null
          university?: string | null
        }
        Update: {
          auth_user_id?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          img_url?: string | null
          is_active?: boolean | null
          name?: string
          password?: string | null
          position?: string
          specialty?: string[] | null
          university?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          billing_units: number
          duration_hours: number
          end_at: string
          id: string
          is_overnight: boolean
          mannequin_id: string
          order_id: string
          rental_date: string
          start_at: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          billing_units: number
          duration_hours: number
          end_at: string
          id?: string
          is_overnight?: boolean
          mannequin_id: string
          order_id: string
          rental_date: string
          start_at: string
          subtotal: number
          unit_price: number
        }
        Update: {
          billing_units?: number
          duration_hours?: number
          end_at?: string
          id?: string
          is_overnight?: boolean
          mannequin_id?: string
          order_id?: string
          rental_date?: string
          start_at?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_mannequin_id_fkey"
            columns: ["mannequin_id"]
            isOneToOne: false
            referencedRelation: "mannequins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address_id: string | null
          delivery_distance_km: number | null
          delivery_fee: number
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          deposit_amount: number
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address_id?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          deposit_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address_id?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          deposit_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_answers: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          item_id: string
          participant_profile_id: string
          session_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          item_id: string
          participant_profile_id: string
          session_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          item_id?: string
          participant_profile_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "osce_answers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "osce_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_answers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "osce_case_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_answers_participant_profile_id_fkey"
            columns: ["participant_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "osce_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_case_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          result_type: string | null
          result_url: string | null
          section_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          result_type?: string | null
          result_url?: string | null
          section_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          result_type?: string | null
          result_url?: string | null
          section_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "osce_case_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "osce_case_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_case_sections: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "osce_case_sections_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "osce_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_cases: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      osce_scores: {
        Row: {
          created_at: string | null
          examiner_profile_id: string | null
          id: string
          is_correct: boolean | null
          item_id: string
          note: string | null
          participant_profile_id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          examiner_profile_id?: string | null
          id?: string
          is_correct?: boolean | null
          item_id: string
          note?: string | null
          participant_profile_id: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          examiner_profile_id?: string | null
          id?: string
          is_correct?: boolean | null
          item_id?: string
          note?: string | null
          participant_profile_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "osce_scores_examiner_profile_id_fkey"
            columns: ["examiner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_scores_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "osce_case_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_scores_participant_profile_id_fkey"
            columns: ["participant_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "osce_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_session_members: {
        Row: {
          id: string
          participant_order: number | null
          profile_id: string | null
          role: string | null
          session_id: string | null
          station_number: number | null
          status: string | null
        }
        Insert: {
          id?: string
          participant_order?: number | null
          profile_id?: string | null
          role?: string | null
          session_id?: string | null
          station_number?: number | null
          status?: string | null
        }
        Update: {
          id?: string
          participant_order?: number | null
          profile_id?: string | null
          role?: string | null
          session_id?: string | null
          station_number?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "osce_session_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osce_session_members_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "osce_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_sessions: {
        Row: {
          break_after_rotation: number | null
          break_duration_minutes: number | null
          created_at: string | null
          created_by: string | null
          current_rotation: number | null
          current_station: number | null
          description: string | null
          finished_at: string | null
          id: string
          max_participants: number | null
          session_date: string | null
          start_time: string | null
          started_at: string | null
          station_duration_minutes: number | null
          status: string
          title: string
          total_stations: number | null
        }
        Insert: {
          break_after_rotation?: number | null
          break_duration_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          current_rotation?: number | null
          current_station?: number | null
          description?: string | null
          finished_at?: string | null
          id?: string
          max_participants?: number | null
          session_date?: string | null
          start_time?: string | null
          started_at?: string | null
          station_duration_minutes?: number | null
          status?: string
          title: string
          total_stations?: number | null
        }
        Update: {
          break_after_rotation?: number | null
          break_duration_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          current_rotation?: number | null
          current_station?: number | null
          description?: string | null
          finished_at?: string | null
          id?: string
          max_participants?: number | null
          session_date?: string | null
          start_time?: string | null
          started_at?: string | null
          station_duration_minutes?: number | null
          status?: string
          title?: string
          total_stations?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "osce_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_stage_questions: {
        Row: {
          checklist: Json | null
          created_at: string | null
          duration_minutes: number | null
          examiner_instruction: string | null
          id: string
          participant_instruction: string | null
          scenario: string | null
          stage_id: string
          updated_at: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          examiner_instruction?: string | null
          id?: string
          participant_instruction?: string | null
          scenario?: string | null
          stage_id: string
          updated_at?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string | null
          duration_minutes?: number | null
          examiner_instruction?: string | null
          id?: string
          participant_instruction?: string | null
          scenario?: string | null
          stage_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "osce_stage_questions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "osce_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      osce_stages: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          station_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          station_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          station_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "osce_stages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "osce_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          class_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          midtrans_transaction_id: string | null
          order_id: string | null
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          redirect_url: string | null
          snap_token: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          class_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          midtrans_transaction_id?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          redirect_url?: string | null
          snap_token?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          class_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          midtrans_transaction_id?: string | null
          order_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          redirect_url?: string | null
          snap_token?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          password: string
          university: string | null
          verify_token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          password: string
          university?: string | null
          verify_token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          password?: string
          university?: string | null
          verify_token?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          class_id: string | null
          created_at: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          type: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          type: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_windows: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean
          is_online: boolean | null
          last_seen: string | null
          mentor_id: string | null
          role: string | null
          university: string | null
          university_email: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean
          is_online?: boolean | null
          last_seen?: string | null
          mentor_id?: string | null
          role?: string | null
          university?: string | null
          university_email?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_online?: boolean | null
          last_seen?: string | null
          mentor_id?: string | null
          role?: string | null
          university?: string | null
          university_email?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          cancellation_type: string
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_id: string | null
          processed_at: string | null
          processed_by: string | null
          proof_url: string | null
          reason: string
          refund_percentage: number
          status: Database["public"]["Enums"]["refund_status"]
        }
        Insert: {
          amount: number
          cancellation_type: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          proof_url?: string | null
          reason: string
          refund_percentage: number
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Update: {
          amount?: number
          cancellation_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          proof_url?: string | null
          reason?: string
          refund_percentage?: number
          status?: Database["public"]["Enums"]["refund_status"]
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      rental_identities: {
        Row: {
          created_at: string
          document_url: string
          id: string
          identity_type: Database["public"]["Enums"]["identity_type"]
          is_verified: boolean
          notes: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_url: string
          id?: string
          identity_type: Database["public"]["Enums"]["identity_type"]
          is_verified?: boolean
          notes?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string
          id?: string
          identity_type?: Database["public"]["Enums"]["identity_type"]
          is_verified?: boolean
          notes?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_identities_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          segment: number
          selected_option: string
          simulation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          segment: number
          selected_option?: string
          simulation_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          segment?: number
          selected_option?: string
          simulation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "simulation_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_answers_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulation_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_questions: {
        Row: {
          correct_option: string | null
          created_at: string | null
          id: string
          image_url: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          option_e: string | null
          question_number: number | null
          segment: number | null
          simulation_id: string | null
          station: string | null
          text: string | null
        }
        Insert: {
          correct_option?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          question_number?: number | null
          segment?: number | null
          simulation_id?: string | null
          station?: string | null
          text?: string | null
        }
        Update: {
          correct_option?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          question_number?: number | null
          segment?: number | null
          simulation_id?: string | null
          station?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_questions_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulation_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_registrations: {
        Row: {
          created_at: string | null
          gform_submitted: boolean | null
          id: string
          module_access: boolean | null
          simulation_id: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          gform_submitted?: boolean | null
          id?: string
          module_access?: boolean | null
          simulation_id: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          gform_submitted?: boolean | null
          id?: string
          module_access?: boolean | null
          simulation_id?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_registrations_tryout_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulation_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_results: {
        Row: {
          finished_at: string | null
          score: number
          simulation_id: string
          start_time: string | null
          total_correct: number
          total_wrong: number
          user_id: string
        }
        Insert: {
          finished_at?: string | null
          score?: number
          simulation_id: string
          start_time?: string | null
          total_correct?: number
          total_wrong?: number
          user_id: string
        }
        Update: {
          finished_at?: string | null
          score?: number
          simulation_id?: string
          start_time?: string | null
          total_correct?: number
          total_wrong?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_segment_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          segment: number
          simulation_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          segment: number
          simulation_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          segment?: number
          simulation_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_segment_progress_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulation_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_sets: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          description: string | null
          gform_link: string | null
          id: string
          img_url: string | null
          is_hot: boolean | null
          is_published: boolean | null
          module_pdf_url: string | null
          price: number | null
          title: string | null
          total_duration_minutes: number | null
          total_questions: number | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          id?: string
          img_url?: string | null
          is_hot?: boolean | null
          is_published?: boolean | null
          module_pdf_url?: string | null
          price?: number | null
          title?: string | null
          total_duration_minutes?: number | null
          total_questions?: number | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          id?: string
          img_url?: string | null
          is_hot?: boolean | null
          is_published?: boolean | null
          module_pdf_url?: string | null
          price?: number | null
          title?: string | null
          total_duration_minutes?: number | null
          total_questions?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          class_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          payment_id: string | null
          plan_id: string | null
          start_date: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string | null
          selected_option: string | null
          tryout_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          selected_option?: string | null
          tryout_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          selected_option?: string | null
          tryout_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "tryout_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryout_answers_tryout_id_fkey"
            columns: ["tryout_id"]
            isOneToOne: false
            referencedRelation: "tryout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_progress: {
        Row: {
          answers: Json | null
          current_index: number | null
          flags: Json | null
          id: string
          last_updated: string | null
          remaining_time: number
          tryout_id: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          current_index?: number | null
          flags?: Json | null
          id?: string
          last_updated?: string | null
          remaining_time: number
          tryout_id?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          current_index?: number | null
          flags?: Json | null
          id?: string
          last_updated?: string | null
          remaining_time?: number
          tryout_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_progress_tryout_id_fkey"
            columns: ["tryout_id"]
            isOneToOne: false
            referencedRelation: "tryout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_questions: {
        Row: {
          correct_option: string
          created_at: string | null
          halaman: number | null
          id: string
          image_url: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          option_e: string
          question_number: number
          station: string
          text: string
          tryout_id: string | null
        }
        Insert: {
          correct_option: string
          created_at?: string | null
          halaman?: number | null
          id?: string
          image_url?: string | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          option_e: string
          question_number: number
          station?: string
          text: string
          tryout_id?: string | null
        }
        Update: {
          correct_option?: string
          created_at?: string | null
          halaman?: number | null
          id?: string
          image_url?: string | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          option_e?: string
          question_number?: number
          station?: string
          text?: string
          tryout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_questions_tryout_id_fkey"
            columns: ["tryout_id"]
            isOneToOne: false
            referencedRelation: "tryout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_registrations: {
        Row: {
          created_at: string | null
          gform_submitted: boolean | null
          id: string
          module_access: boolean | null
          tryout_id: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          gform_submitted?: boolean | null
          id?: string
          module_access?: boolean | null
          tryout_id?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          gform_submitted?: boolean | null
          id?: string
          module_access?: boolean | null
          tryout_id?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_registrations_tryout_id_fkey1"
            columns: ["tryout_id"]
            isOneToOne: false
            referencedRelation: "tryout_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_results: {
        Row: {
          finished_at: string | null
          id: string
          score: number
          total_correct: number
          total_wrong: number
          tryout_id: string | null
          user_id: string | null
        }
        Insert: {
          finished_at?: string | null
          id?: string
          score: number
          total_correct: number
          total_wrong: number
          tryout_id?: string | null
          user_id?: string | null
        }
        Update: {
          finished_at?: string | null
          id?: string
          score?: number
          total_correct?: number
          total_wrong?: number
          tryout_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_results_tryout_id_fkey"
            columns: ["tryout_id"]
            isOneToOne: false
            referencedRelation: "tryout_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryout_results_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_sets: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          description: string | null
          gform_link: string | null
          id: string
          img_url: string | null
          is_hot: boolean | null
          is_published: boolean | null
          module_access: boolean
          module_pdf_url: string | null
          month: number | null
          price: number | null
          registration_closed: boolean
          title: string
          total_duration_minutes: number
          total_questions: number
          year: number | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          id?: string
          img_url?: string | null
          is_hot?: boolean | null
          is_published?: boolean | null
          module_access?: boolean
          module_pdf_url?: string | null
          month?: number | null
          price?: number | null
          registration_closed?: boolean
          title: string
          total_duration_minutes?: number
          total_questions?: number
          year?: number | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          gform_link?: string | null
          id?: string
          img_url?: string | null
          is_hot?: boolean | null
          is_published?: boolean | null
          module_access?: boolean
          module_pdf_url?: string | null
          month?: number | null
          price?: number | null
          registration_closed?: boolean
          title?: string
          total_duration_minutes?: number
          total_questions?: number
          year?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_banned: boolean
          is_verified: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_banned?: boolean
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      hot_topics_view: {
        Row: {
          category: string | null
          description: string | null
          id: string | null
          img_url: string | null
          link: string | null
          price: number | null
          source: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      before_user_created_acid: { Args: { event: Json }; Returns: Json }
      finalize_simulation:
        | {
            Args: { p_simulation_id: string; p_user_id: string }
            Returns: undefined
          }
        | {
            Args: {
              p_correct: number
              p_simulation_id: string
              p_user_id: string
              p_wrong: number
            }
            Returns: undefined
          }
        | {
            Args: {
              p_correct: number
              p_score: number
              p_simulation_id: string
              p_user_id: string
              p_wrong: number
            }
            Returns: undefined
          }
      finalize_tryout: {
        Args: { p_tryout_id: string; p_user_id: string }
        Returns: undefined
      }
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      total_registered_users: { Args: never; Returns: number }
      update_simulation_score: {
        Args: {
          p_correct: number
          p_simulation_id: string
          p_user_id: string
          p_wrong: number
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "waiting_payment"
        | "paid"
        | "preparing"
        | "on_delivery"
        | "ready_for_pickup"
        | "ongoing_rental"
        | "completed"
        | "cancelled_by_customer"
        | "cancelled_by_provider"
        | "expired"
      delivery_task_status:
        | "assigned"
        | "picking_up"
        | "on_the_way"
        | "delivered"
        | "failed"
      delivery_type: "pickup" | "delivery"
      deposit_status: "held" | "returned" | "forfeited"
      identity_type:
        | "ktp"
        | "sim"
        | "passport"
        | "kartu_mahasiswa"
        | "kartu_pelajar"
        | "sip"
        | "str"
        | "surat_institusi"
        | "other"
      payment_status:
        | "pending"
        | "success"
        | "failure"
        | "expire"
        | "cancel"
        | "refund"
      refund_status: "pending" | "processing" | "processed" | "rejected"
      Role: "ADMIN" | "PARTICIPANT" | "EXAMINER"
      SessionStatus: "WAITING" | "ACTIVE" | "FINISHED"
      user_role: "customer" | "admin" | "driver"
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
      booking_status: [
        "pending",
        "waiting_payment",
        "paid",
        "preparing",
        "on_delivery",
        "ready_for_pickup",
        "ongoing_rental",
        "completed",
        "cancelled_by_customer",
        "cancelled_by_provider",
        "expired",
      ],
      delivery_task_status: [
        "assigned",
        "picking_up",
        "on_the_way",
        "delivered",
        "failed",
      ],
      delivery_type: ["pickup", "delivery"],
      deposit_status: ["held", "returned", "forfeited"],
      identity_type: [
        "ktp",
        "sim",
        "passport",
        "kartu_mahasiswa",
        "kartu_pelajar",
        "sip",
        "str",
        "surat_institusi",
        "other",
      ],
      payment_status: [
        "pending",
        "success",
        "failure",
        "expire",
        "cancel",
        "refund",
      ],
      refund_status: ["pending", "processing", "processed", "rejected"],
      Role: ["ADMIN", "PARTICIPANT", "EXAMINER"],
      SessionStatus: ["WAITING", "ACTIVE", "FINISHED"],
      user_role: ["customer", "admin", "driver"],
    },
  },
} as const
