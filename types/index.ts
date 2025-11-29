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
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
  };
}

export type UserRole = 'operator' | 'technician' | 'supervisor' | 'admin';
export type CapacityLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';