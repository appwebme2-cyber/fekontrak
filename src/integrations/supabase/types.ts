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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      amandemen_kontrak: {
        Row: {
          alasan_perubahan: string | null
          amendment_documents: Json | null
          created_at: string | null
          durasi_amandemen: number | null
          id_amandemen: string
          id_kontrak: string
          jenis_amandemen: string | null
          nilai_kontrak_baru: number | null
          no_amandemen: string | null
          nomor_urut: number
          tanggal_amandemen: string | null
          tanggal_mulai_baru: string | null
          tanggal_selesai_baru: string | null
          updated_at: string | null
        }
        Insert: {
          alasan_perubahan?: string | null
          amendment_documents?: Json | null
          created_at?: string | null
          durasi_amandemen?: number | null
          id_amandemen?: string
          id_kontrak: string
          jenis_amandemen?: string | null
          nilai_kontrak_baru?: number | null
          no_amandemen?: string | null
          nomor_urut?: number
          tanggal_amandemen?: string | null
          tanggal_mulai_baru?: string | null
          tanggal_selesai_baru?: string | null
          updated_at?: string | null
        }
        Update: {
          alasan_perubahan?: string | null
          amendment_documents?: Json | null
          created_at?: string | null
          durasi_amandemen?: number | null
          id_amandemen?: string
          id_kontrak?: string
          jenis_amandemen?: string | null
          nilai_kontrak_baru?: number | null
          no_amandemen?: string | null
          nomor_urut?: number
          tanggal_amandemen?: string | null
          tanggal_mulai_baru?: string | null
          tanggal_selesai_baru?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "amandemen_kontrak_id_kontrak_fkey"
            columns: ["id_kontrak"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id_kontrak"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      konfigurasi_sistem: {
        Row: {
          deskripsi: string | null
          id_setting: string
          nama_setting: string
          nilai_setting: string
          updated_at: string | null
        }
        Insert: {
          deskripsi?: string | null
          id_setting?: string
          nama_setting: string
          nilai_setting: string
          updated_at?: string | null
        }
        Update: {
          deskripsi?: string | null
          id_setting?: string
          nama_setting?: string
          nilai_setting?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kontrak: {
        Row: {
          aktivitas_saat_ini: string | null
          alasan_perubahan: string | null
          amendment_documents: Json | null
          contract_documents: Json | null
          created_at: string | null
          direksi_pekerjaan: string | null
          disiplin: string | null
          durasi_amandemen: number | null
          durasi_kontrak_hari: number | null
          has_amendment: boolean | null
          id_kontrak: string
          id_vendor: string
          jenis_amandemen: string | null
          judul_kontrak: string
          kendala: string | null
          nilai_awal: number | null
          nilai_kontrak_baru: number | null
          no_amandemen: string | null
          no_dokumen_kontrak: string | null
          no_po_pr: string | null
          progress_actual: number | null
          progress_plan: number | null
          sla_kom_hari: number
          status_kontrak: Database["public"]["Enums"]["contract_status"]
          tanggal_amandemen: string | null
          tanggal_kom: string | null
          tanggal_lkp: string | null
          tanggal_maksimal_kom: string | null
          tanggal_mulai: string | null
          tanggal_mulai_baru: string | null
          tanggal_selesai: string | null
          tanggal_selesai_baru: string | null
          tanggal_terima_dokumen: string | null
          tipe_kontrak: Database["public"]["Enums"]["contract_type"]
          tkdn_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          aktivitas_saat_ini?: string | null
          alasan_perubahan?: string | null
          amendment_documents?: Json | null
          contract_documents?: Json | null
          created_at?: string | null
          direksi_pekerjaan?: string | null
          disiplin?: string | null
          durasi_amandemen?: number | null
          durasi_kontrak_hari?: number | null
          has_amendment?: boolean | null
          id_kontrak?: string
          id_vendor: string
          jenis_amandemen?: string | null
          judul_kontrak: string
          kendala?: string | null
          nilai_awal?: number | null
          nilai_kontrak_baru?: number | null
          no_amandemen?: string | null
          no_dokumen_kontrak?: string | null
          no_po_pr?: string | null
          progress_actual?: number | null
          progress_plan?: number | null
          sla_kom_hari?: number
          status_kontrak?: Database["public"]["Enums"]["contract_status"]
          tanggal_amandemen?: string | null
          tanggal_kom?: string | null
          tanggal_lkp?: string | null
          tanggal_maksimal_kom?: string | null
          tanggal_mulai?: string | null
          tanggal_mulai_baru?: string | null
          tanggal_selesai?: string | null
          tanggal_selesai_baru?: string | null
          tanggal_terima_dokumen?: string | null
          tipe_kontrak: Database["public"]["Enums"]["contract_type"]
          tkdn_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          aktivitas_saat_ini?: string | null
          alasan_perubahan?: string | null
          amendment_documents?: Json | null
          contract_documents?: Json | null
          created_at?: string | null
          direksi_pekerjaan?: string | null
          disiplin?: string | null
          durasi_amandemen?: number | null
          durasi_kontrak_hari?: number | null
          has_amendment?: boolean | null
          id_kontrak?: string
          id_vendor?: string
          jenis_amandemen?: string | null
          judul_kontrak?: string
          kendala?: string | null
          nilai_awal?: number | null
          nilai_kontrak_baru?: number | null
          no_amandemen?: string | null
          no_dokumen_kontrak?: string | null
          no_po_pr?: string | null
          progress_actual?: number | null
          progress_plan?: number | null
          sla_kom_hari?: number
          status_kontrak?: Database["public"]["Enums"]["contract_status"]
          tanggal_amandemen?: string | null
          tanggal_kom?: string | null
          tanggal_lkp?: string | null
          tanggal_maksimal_kom?: string | null
          tanggal_mulai?: string | null
          tanggal_mulai_baru?: string | null
          tanggal_selesai?: string | null
          tanggal_selesai_baru?: string | null
          tanggal_terima_dokumen?: string | null
          tipe_kontrak?: Database["public"]["Enums"]["contract_type"]
          tkdn_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kontrak_id_vendor_fkey"
            columns: ["id_vendor"]
            isOneToOne: false
            referencedRelation: "vendor"
            referencedColumns: ["id_vendor"]
          },
        ]
      }
      monitoring_ltsa: {
        Row: {
          created_at: string | null
          durasi_jam: number
          id_kontrak: string
          id_log: string
          jenis_layanan: string
          keterangan: string | null
          sla_terpenuhi: string
          tanggal_kunjungan: string
        }
        Insert: {
          created_at?: string | null
          durasi_jam: number
          id_kontrak: string
          id_log?: string
          jenis_layanan: string
          keterangan?: string | null
          sla_terpenuhi: string
          tanggal_kunjungan: string
        }
        Update: {
          created_at?: string | null
          durasi_jam?: number
          id_kontrak?: string
          id_log?: string
          jenis_layanan?: string
          keterangan?: string | null
          sla_terpenuhi?: string
          tanggal_kunjungan?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_ltsa_id_kontrak_fkey"
            columns: ["id_kontrak"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id_kontrak"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      padi: {
        Row: {
          bagian: string | null
          catatan_status: string | null
          created_at: string
          dokumen_pendukung: Json | null
          id_padi: string
          id_vendor: string | null
          judul_pembelian: string
          link_pembelian: string | null
          nilai: number
          no_pembelian: string
          no_po_pr: string | null
          status_purchase: string
          tanggal: string
          tanggal_bast: string | null
          tanggal_invoice: string | null
          tanggal_paid: string | null
          tanggal_payment_approval: string | null
          tanggal_sa_gr: string | null
          updated_at: string
        }
        Insert: {
          bagian?: string | null
          catatan_status?: string | null
          created_at?: string
          dokumen_pendukung?: Json | null
          id_padi?: string
          id_vendor?: string | null
          judul_pembelian: string
          link_pembelian?: string | null
          nilai?: number
          no_pembelian: string
          no_po_pr?: string | null
          status_purchase?: string
          tanggal: string
          tanggal_bast?: string | null
          tanggal_invoice?: string | null
          tanggal_paid?: string | null
          tanggal_payment_approval?: string | null
          tanggal_sa_gr?: string | null
          updated_at?: string
        }
        Update: {
          bagian?: string | null
          catatan_status?: string | null
          created_at?: string
          dokumen_pendukung?: Json | null
          id_padi?: string
          id_vendor?: string | null
          judul_pembelian?: string
          link_pembelian?: string | null
          nilai?: number
          no_pembelian?: string
          no_po_pr?: string | null
          status_purchase?: string
          tanggal?: string
          tanggal_bast?: string | null
          tanggal_invoice?: string | null
          tanggal_paid?: string | null
          tanggal_payment_approval?: string | null
          tanggal_sa_gr?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "padi_id_vendor_fkey"
            columns: ["id_vendor"]
            isOneToOne: false
            referencedRelation: "vendor"
            referencedColumns: ["id_vendor"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_lumpsum: {
        Row: {
          created_at: string | null
          evidence: string | null
          id_kontrak: string
          id_progress: string
          milestone: string
          persen: number
          tanggal_update: string
        }
        Insert: {
          created_at?: string | null
          evidence?: string | null
          id_kontrak: string
          id_progress?: string
          milestone: string
          persen: number
          tanggal_update: string
        }
        Update: {
          created_at?: string | null
          evidence?: string | null
          id_kontrak?: string
          id_progress?: string
          milestone?: string
          persen?: number
          tanggal_update?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lumpsum_id_kontrak_fkey"
            columns: ["id_kontrak"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id_kontrak"]
          },
        ]
      }
      progress_unit_price: {
        Row: {
          created_at: string | null
          harga_satuan: number
          id_kontrak: string
          id_progress: string
          nama_item: string
          qty_aktual: number
          qty_rencana: number
          satuan: string
          tanggal_update: string
        }
        Insert: {
          created_at?: string | null
          harga_satuan: number
          id_kontrak: string
          id_progress?: string
          nama_item: string
          qty_aktual?: number
          qty_rencana: number
          satuan: string
          tanggal_update: string
        }
        Update: {
          created_at?: string | null
          harga_satuan?: number
          id_kontrak?: string
          id_progress?: string
          nama_item?: string
          qty_aktual?: number
          qty_rencana?: number
          satuan?: string
          tanggal_update?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_unit_price_id_kontrak_fkey"
            columns: ["id_kontrak"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id_kontrak"]
          },
        ]
      }
      tagihan: {
        Row: {
          catatan: string | null
          created_at: string | null
          dokumen_memo: string | null
          dokumen_tagihan: Json | null
          id_kontrak: string
          id_tagihan: string
          memo_required: boolean | null
          nilai_tagihan: number
          nomor_tagihan: string
          status_tagihan: string
          tanggal_pengiriman_memo: string | null
          tanggal_tagihan: string
          termin: string | null
          tipe_kontrak: string
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          dokumen_memo?: string | null
          dokumen_tagihan?: Json | null
          id_kontrak: string
          id_tagihan?: string
          memo_required?: boolean | null
          nilai_tagihan?: number
          nomor_tagihan: string
          status_tagihan?: string
          tanggal_pengiriman_memo?: string | null
          tanggal_tagihan: string
          termin?: string | null
          tipe_kontrak: string
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          dokumen_memo?: string | null
          dokumen_tagihan?: Json | null
          id_kontrak?: string
          id_tagihan?: string
          memo_required?: boolean | null
          nilai_tagihan?: number
          nomor_tagihan?: string
          status_tagihan?: string
          tanggal_pengiriman_memo?: string | null
          tanggal_tagihan?: string
          termin?: string | null
          tipe_kontrak?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tagihan_id_kontrak_fkey"
            columns: ["id_kontrak"]
            isOneToOne: false
            referencedRelation: "kontrak"
            referencedColumns: ["id_kontrak"]
          },
        ]
      }
      vendor: {
        Row: {
          alamat: string | null
          created_at: string | null
          id_vendor: string
          nama_vendor: string
          npwp: string | null
          pic_kontak: string | null
          pic_nama: string | null
          score: number | null
          status_vendor: string
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          id_vendor?: string
          nama_vendor: string
          npwp?: string | null
          pic_kontak?: string | null
          pic_nama?: string | null
          score?: number | null
          status_vendor?: string
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          id_vendor?: string
          nama_vendor?: string
          npwp?: string | null
          pic_kontak?: string | null
          pic_nama?: string | null
          score?: number | null
          status_vendor?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_metrics: {
        Row: {
          active_budget: number | null
          active_contracts: number | null
          avg_progress: number | null
          behind_schedule_count: number | null
          completed_contracts: number | null
          ending_soon_count: number | null
          kom_overdue_count: number | null
          pending_contracts: number | null
          terminated_contracts: number | null
          total_budget: number | null
          total_contracts: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_dashboard_data_complete: {
        Args: never
        Returns: {
          metrics: Json
          recent_contracts: Json
        }[]
      }
      get_dashboard_data_paginated: {
        Args: { page_offset?: number; page_size?: number }
        Returns: {
          metrics: Json
          recent_contracts: Json
          total_count: number
        }[]
      }
      get_dashboard_metrics: {
        Args: never
        Returns: {
          active_budget: number
          active_contracts: number
          avg_progress: number
          behind_schedule_count: number
          completed_contracts: number
          ending_soon_count: number
          kom_overdue_count: number
          pending_contracts: number
          terminated_contracts: number
          total_budget: number
          total_contracts: number
        }[]
      }
      get_dashboard_metrics_optimized: {
        Args: never
        Returns: {
          active_contracts: number
          avg_progress: number
          budget_utilization: number
          completed_contracts: number
          ending_soon_count: number
          pending_contracts: number
          total_budget: number
          total_contracts: number
        }[]
      }
      refresh_dashboard_metrics: { Args: never; Returns: undefined }
    }
    Enums: {
      contract_status:
        | "Pre-KOM"
        | "Active"
        | "Completed"
        | "Terminated"
        | "Aktif"
        | "Selesai"
      contract_type: "Lumpsum" | "Unit Price" | "LTSA" | "TSA" | "TSA/LTSA"
      invoice_status:
        | "draft"
        | "submitted"
        | "pending_approval"
        | "approved"
        | "paid"
        | "rejected"
      user_role: "admin" | "pic" | "user"
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
      contract_status: [
        "Pre-KOM",
        "Active",
        "Completed",
        "Terminated",
        "Aktif",
        "Selesai",
      ],
      contract_type: ["Lumpsum", "Unit Price", "LTSA", "TSA", "TSA/LTSA"],
      invoice_status: [
        "draft",
        "submitted",
        "pending_approval",
        "approved",
        "paid",
        "rejected",
      ],
      user_role: ["admin", "pic", "user"],
    },
  },
} as const
