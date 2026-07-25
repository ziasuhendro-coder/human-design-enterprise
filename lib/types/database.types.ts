/**
 * Type definitions manual yang mencerminkan schema Supabase Fase 1.
 * Ditulis manual (bukan hasil `supabase gen types`) karena workflow
 * pengembangan tidak memakai CLI. WAJIB disinkronkan manual setiap kali
 * schema database berubah -- lihat catatan di setiap migration SQL.
 */

export type HdUserRole = 'user' | 'master';

export type HdUserStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deactivated';

export type HdAuditAction =
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'role_changed'
  | 'status_changed'
  | 'profile_updated'
  | 'password_changed'
  | 'login_failed'
  | 'suspicious_activity';

export interface Database {
  public: {
    Tables: {
      hd_users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: HdUserRole;
          status: HdUserStatus;
          avatar_url: string | null;
          phone: string | null;
          locale: string;
          timezone: string;
          last_login_at: string | null;
          last_login_ip: string | null;
          failed_login_count: number;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: HdUserRole;
          status?: HdUserStatus;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          timezone?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          locale?: string;
          timezone?: string;
          metadata?: Record<string, unknown>;
        };
      };
      hd_audit_log: {
        Row: {
          id: number;
          actor_id: string | null;
          actor_email: string | null;
          action: HdAuditAction;
          target_id: string | null;
          target_table: string | null;
          description: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_email?: string | null;
          action: HdAuditAction;
          target_id?: string | null;
          target_table?: string | null;
          description?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: never; // Audit log immutable -- tidak boleh di-update
      };
    };
    Functions: {
      hd_check_login_lockout: {
        Args: { p_email: string };
        Returns: {
          is_locked: boolean;
          locked_until: string | null;
          failed_count: number;
        }[];
      };
      hd_record_login_attempt: {
        Args: {
          p_email: string;
          p_success: boolean;
          p_ip?: string | null;
          p_user_agent?: string | null;
        };
        Returns: void;
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
