// Generated database types. This is a placeholder until the project has tables —
// the schema-codegen step overwrites this file (e.g. `supabase gen types typescript`).
// After any migration, regenerate this so the client at ./client.ts stays type-safe.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      freelancer_profiles: { Row: { id: string; full_name: string; email: string | null; created_at: string }; Insert: { id: string; full_name: string; email?: string | null }; Update: { full_name?: string; email?: string | null } };
      clients: { Row: { id: string; freelancer_id: string; name: string; email: string; created_at: string }; Insert: { freelancer_id: string; name: string; email: string }; Update: { name?: string; email?: string } };
      projects: { Row: { id: string; freelancer_id: string; client_id: string; name: string; description: string; status: "Not Started" | "In Progress" | "Review" | "Completed"; progress: number; portal_token: string; updated_at: string }; Insert: { freelancer_id: string; client_id: string; name: string; description: string; status: "Not Started" | "In Progress" | "Review" | "Completed"; progress: number; portal_token: string }; Update: { status?: "Not Started" | "In Progress" | "Review" | "Completed"; progress?: number; name?: string; description?: string } };
      project_files: { Row: { id: string; project_id: string; name: string; size: string; type: string; storage_path: string | null; created_at: string }; Insert: { project_id: string; name: string; size: string; type: string; storage_path?: string | null }; Update: { name?: string; size?: string; type?: string; storage_path?: string | null } };
      project_messages: { Row: { id: string; project_id: string; sender_type: "client" | "freelancer"; body: string; created_at: string }; Insert: { project_id: string; sender_type: "client" | "freelancer"; body: string }; Update: { body?: string } };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: { [key: string]: never };
    CompositeTypes: { [key: string]: never };
  };
};
