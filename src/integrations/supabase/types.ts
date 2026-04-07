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
      auction_documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_uri: string
          id: string
          inspection_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_uri: string
          id?: string
          inspection_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_uri?: string
          id?: string
          inspection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_documents_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_pickups: {
        Row: {
          created_at: string
          id: string
          inspection_id: string
          notes: string | null
          pickup_date: string
          pickup_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_id: string
          notes?: string | null
          pickup_date: string
          pickup_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inspection_id?: string
          notes?: string | null
          pickup_date?: string
          pickup_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_pickups_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          allocation_timestamp: string | null
          auction_type: string
          bid_count: number | null
          broker_network: string | null
          created_at: string
          current_highest_bid: number | null
          current_highest_commission: number | null
          duration_minutes: number
          end_time: string
          geo_targeting_city: string | null
          geo_targeting_radius: number | null
          id: string
          inspection_id: string
          minimum_bid_increment: number | null
          outcome_reason: string | null
          reserve_price: number | null
          selected_broker_ids: string[] | null
          start_time: string
          status: string
          updated_at: string
          winning_bid_id: string | null
          winning_broker_id: string | null
        }
        Insert: {
          allocation_timestamp?: string | null
          auction_type?: string
          bid_count?: number | null
          broker_network?: string | null
          created_at?: string
          current_highest_bid?: number | null
          current_highest_commission?: number | null
          duration_minutes?: number
          end_time: string
          geo_targeting_city?: string | null
          geo_targeting_radius?: number | null
          id?: string
          inspection_id: string
          minimum_bid_increment?: number | null
          outcome_reason?: string | null
          reserve_price?: number | null
          selected_broker_ids?: string[] | null
          start_time?: string
          status?: string
          updated_at?: string
          winning_bid_id?: string | null
          winning_broker_id?: string | null
        }
        Update: {
          allocation_timestamp?: string | null
          auction_type?: string
          bid_count?: number | null
          broker_network?: string | null
          created_at?: string
          current_highest_bid?: number | null
          current_highest_commission?: number | null
          duration_minutes?: number
          end_time?: string
          geo_targeting_city?: string | null
          geo_targeting_radius?: number | null
          id?: string
          inspection_id?: string
          minimum_bid_increment?: number | null
          outcome_reason?: string | null
          reserve_price?: number | null
          selected_broker_ids?: string[] | null
          start_time?: string
          status?: string
          updated_at?: string
          winning_bid_id?: string | null
          winning_broker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_badges: {
        Row: {
          badge_icon: string | null
          badge_name: string
          broker_id: string
          coins_reward: number | null
          created_at: string
          description: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          progress: number | null
          target: number | null
        }
        Insert: {
          badge_icon?: string | null
          badge_name: string
          broker_id: string
          coins_reward?: number | null
          created_at?: string
          description?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string
          broker_id?: string
          coins_reward?: number | null
          created_at?: string
          description?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          progress?: number | null
          target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_badges_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bid_type: string | null
          broker_id: string
          commission_amount: number
          device_info: string | null
          effective_score: number | null
          id: string
          placed_at: string
          status: string
          time_offset_ms: number | null
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bid_type?: string | null
          broker_id: string
          commission_amount?: number
          device_info?: string | null
          effective_score?: number | null
          id?: string
          placed_at?: string
          status?: string
          time_offset_ms?: number | null
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bid_type?: string | null
          broker_id?: string
          commission_amount?: number
          device_info?: string | null
          effective_score?: number | null
          id?: string
          placed_at?: string
          status?: string
          time_offset_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_bids_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_strikes: {
        Row: {
          appeal_status: string | null
          broker_id: string
          created_at: string
          expires_at: string
          id: string
          penalty_coins: number | null
          penalty_trust_score: number | null
          reason: string
          related_entity_id: string | null
          related_entity_type: string | null
          severity: string
        }
        Insert: {
          appeal_status?: string | null
          broker_id: string
          created_at?: string
          expires_at: string
          id?: string
          penalty_coins?: number | null
          penalty_trust_score?: number | null
          reason: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string
        }
        Update: {
          appeal_status?: string | null
          broker_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          penalty_coins?: number | null
          penalty_trust_score?: number | null
          reason?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_strikes_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          broker_id: string
          created_at: string
          id: string
          reason: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          broker_id: string
          created_at?: string
          id?: string
          reason?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          broker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_wallet_transactions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_won_vehicles: {
        Row: {
          auction_id: string
          bid_id: string
          broker_id: string
          created_at: string
          delivered_at: string | null
          delivery_status: string
          id: string
          insurance_status: string
          name_transfer_status: string
          name_transferred_at: string | null
          notes: string | null
          payment_completed_at: string | null
          payment_status: string
          pickup_completed_at: string | null
          pickup_scheduled_at: string | null
          pickup_status: string
          rc_transfer_deadline: string
          rc_transfer_proof_uri: string | null
          rc_transfer_status: string
          rc_transferred_at: string | null
          updated_at: string
          won_at: string
        }
        Insert: {
          auction_id: string
          bid_id: string
          broker_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          id?: string
          insurance_status?: string
          name_transfer_status?: string
          name_transferred_at?: string | null
          notes?: string | null
          payment_completed_at?: string | null
          payment_status?: string
          pickup_completed_at?: string | null
          pickup_scheduled_at?: string | null
          pickup_status?: string
          rc_transfer_deadline: string
          rc_transfer_proof_uri?: string | null
          rc_transfer_status?: string
          rc_transferred_at?: string | null
          updated_at?: string
          won_at?: string
        }
        Update: {
          auction_id?: string
          bid_id?: string
          broker_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          id?: string
          insurance_status?: string
          name_transfer_status?: string
          name_transferred_at?: string | null
          notes?: string | null
          payment_completed_at?: string | null
          payment_status?: string
          pickup_completed_at?: string | null
          pickup_scheduled_at?: string | null
          pickup_status?: string
          rc_transfer_deadline?: string
          rc_transfer_proof_uri?: string | null
          rc_transfer_status?: string
          rc_transferred_at?: string | null
          updated_at?: string
          won_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_won_vehicles_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_won_vehicles_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "broker_bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_won_vehicles_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          account_status: string
          age_range: string | null
          bank_account_number: string | null
          business_name: string
          business_type: string | null
          city: string
          coins_balance: number
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          ifsc_code: string | null
          kms_range_max: number | null
          kyc_status: string | null
          kyc_verified_at: string | null
          level: number
          lifetime_coins_earned: number
          lifetime_coins_spent: number
          mobile: string
          operating_radius: number | null
          owner_name: string
          pan: string | null
          preferred_auction_types: string[] | null
          preferred_categories: string[] | null
          preferred_makes: string[] | null
          price_band_max: number | null
          price_band_min: number | null
          strikes_count: number
          trust_score: number
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_status?: string
          age_range?: string | null
          bank_account_number?: string | null
          business_name: string
          business_type?: string | null
          city: string
          coins_balance?: number
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          ifsc_code?: string | null
          kms_range_max?: number | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          level?: number
          lifetime_coins_earned?: number
          lifetime_coins_spent?: number
          mobile: string
          operating_radius?: number | null
          owner_name: string
          pan?: string | null
          preferred_auction_types?: string[] | null
          preferred_categories?: string[] | null
          preferred_makes?: string[] | null
          price_band_max?: number | null
          price_band_min?: number | null
          strikes_count?: number
          trust_score?: number
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_status?: string
          age_range?: string | null
          bank_account_number?: string | null
          business_name?: string
          business_type?: string | null
          city?: string
          coins_balance?: number
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          ifsc_code?: string | null
          kms_range_max?: number | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          level?: number
          lifetime_coins_earned?: number
          lifetime_coins_spent?: number
          mobile?: string
          operating_radius?: number | null
          owner_name?: string
          pan?: string | null
          preferred_auction_types?: string[] | null
          preferred_categories?: string[] | null
          preferred_makes?: string[] | null
          price_band_max?: number | null
          price_band_min?: number | null
          strikes_count?: number
          trust_score?: number
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      kyc_submissions: {
        Row: {
          assigned_to: string | null
          broker_id: string
          created_at: string
          document_type: string
          document_uri: string | null
          flag_reason: string | null
          id: string
          ocr_confidence: number | null
          ocr_extracted_data: Json | null
          rejection_reason: string | null
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          submission_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          broker_id: string
          created_at?: string
          document_type?: string
          document_uri?: string | null
          flag_reason?: string | null
          id?: string
          ocr_confidence?: number | null
          ocr_extracted_data?: Json | null
          rejection_reason?: string | null
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          submission_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          broker_id?: string
          created_at?: string
          document_type?: string
          document_uri?: string | null
          flag_reason?: string | null
          id?: string
          ocr_confidence?: number | null
          ocr_extracted_data?: Json | null
          rejection_reason?: string | null
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          submission_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "ops_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_organizations: {
        Row: {
          activated_at: string | null
          assigned_kam: string | null
          brands: string[] | null
          company_name: string
          created_at: string
          entity_status: string
          estimated_monthly_volume: string | null
          gst_number: string | null
          id: string
          legal_agreement_status: string
          notes: string | null
          org_id: string
          pan_number: string | null
          primary_city: string
          registered_address: string | null
          registration_doc_status: string
          signatory_designation: string | null
          signatory_email: string | null
          signatory_name: string | null
          signatory_phone: string | null
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          assigned_kam?: string | null
          brands?: string[] | null
          company_name: string
          created_at?: string
          entity_status?: string
          estimated_monthly_volume?: string | null
          gst_number?: string | null
          id?: string
          legal_agreement_status?: string
          notes?: string | null
          org_id?: string
          pan_number?: string | null
          primary_city: string
          registered_address?: string | null
          registration_doc_status?: string
          signatory_designation?: string | null
          signatory_email?: string | null
          signatory_name?: string | null
          signatory_phone?: string | null
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          assigned_kam?: string | null
          brands?: string[] | null
          company_name?: string
          created_at?: string
          entity_status?: string
          estimated_monthly_volume?: string | null
          gst_number?: string | null
          id?: string
          legal_agreement_status?: string
          notes?: string | null
          org_id?: string
          pan_number?: string | null
          primary_city?: string
          registered_address?: string | null
          registration_doc_status?: string
          signatory_designation?: string | null
          signatory_email?: string | null
          signatory_name?: string | null
          signatory_phone?: string | null
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ops_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          module: string
          ops_user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          module: string
          ops_user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          module?: string
          ops_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_audit_log_ops_user_id_fkey"
            columns: ["ops_user_id"]
            isOneToOne: false
            referencedRelation: "ops_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_users: {
        Row: {
          city_filter: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_login: string | null
          phone: string | null
          roles: Database["public"]["Enums"]["ops_role"][]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city_filter?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_login?: string | null
          phone?: string | null
          roles?: Database["public"]["Enums"]["ops_role"][]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city_filter?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_login?: string | null
          phone?: string | null
          roles?: Database["public"]["Enums"]["ops_role"][]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          broker_id: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string
        }
        Insert: {
          auth_key: string
          broker_id: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string
        }
        Update: {
          auth_key?: string
          broker_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_documents: {
        Row: {
          file_name: string
          file_type: string | null
          file_uri: string
          id: string
          rejection_reason: string | null
          service_type: string
          uploaded_at: string
          verification_status: string
          verified_at: string | null
          won_vehicle_id: string
        }
        Insert: {
          file_name: string
          file_type?: string | null
          file_uri: string
          id?: string
          rejection_reason?: string | null
          service_type: string
          uploaded_at?: string
          verification_status?: string
          verified_at?: string | null
          won_vehicle_id: string
        }
        Update: {
          file_name?: string
          file_type?: string | null
          file_uri?: string
          id?: string
          rejection_reason?: string | null
          service_type?: string
          uploaded_at?: string
          verification_status?: string
          verified_at?: string | null
          won_vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_documents_won_vehicle_id_fkey"
            columns: ["won_vehicle_id"]
            isOneToOne: false
            referencedRelation: "broker_won_vehicles"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "executive" | "broker" | "customer"
      ops_role:
        | "super_admin"
        | "ops_manager"
        | "onboarding_ops"
        | "kam"
        | "auction_ops"
        | "logistics_coordinator"
        | "runner"
        | "finance_ops"
        | "doc_exec"
        | "doc_lead"
        | "qa_audit"
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
      app_role: ["admin", "executive", "broker", "customer"],
      ops_role: [
        "super_admin",
        "ops_manager",
        "onboarding_ops",
        "kam",
        "auction_ops",
        "logistics_coordinator",
        "runner",
        "finance_ops",
        "doc_exec",
        "doc_lead",
        "qa_audit",
      ],
    },
  },
} as const
