// Type exports for GMAO MVP v1
export interface Database {
  // Generated types will be added here when Supabase is connected
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          capacity_level: CapacityLevel | null;
          avatar_url: string | null;
          invitation_status: InvitationStatus | null;
          invited_by: string | null;
          invited_at: string | null;
          invitation_token: string | null;
          invitation_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      user_invitations: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          invited_by: string;
          invitation_token: string;
          status: InvitationStatus;
          sent_at: string;
          accepted_at: string | null;
          expires_at: string;
          metadata: object;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_invitations']['Row'], 'id' | 'invitation_token' | 'sent_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_invitations']['Insert']>;
      };
      invitation_management_view: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          status: InvitationStatus;
          sent_at: string;
          accepted_at: string | null;
          expires_at: string;
          invited_by_email: string | null;
          invited_by_name: string | null;
          metadata: object;
          current_status: 'active' | 'expired' | string;
        };
      };
    };
  };
}

export type UserRole = 'operator' | 'technician' | 'supervisor' | 'admin';
export type CapacityLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';