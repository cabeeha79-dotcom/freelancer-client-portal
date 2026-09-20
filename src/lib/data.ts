import { supabase } from "@/integrations/supabase/client";

export type ProjectStatus = "Not Started" | "In Progress" | "Review" | "Completed";
export type ProjectFile = { id: string; name: string; size: string; type: string; storagePath?: string };
export type ProjectMessage = { id: string; from: "client" | "freelancer"; text: string; time: string };
export type Project = { id: string; name: string; clientId: string; clientName: string; clientEmail: string; description: string; status: ProjectStatus; progress: number; updated: string; token: string; files: ProjectFile[]; messages: ProjectMessage[] };

type DbProject = { id: string; name: string; description: string; status: ProjectStatus; progress: number; portal_token: string; updated_at: string; client: { id: string; name: string; email: string } | null; project_files: ProjectFile[]; project_messages: { id: string; sender_type: "client" | "freelancer"; body: string; created_at: string }[] };

function mapProject(row: DbProject): Project {
  return { id: row.id, name: row.name, clientId: row.client?.id ?? "", clientName: row.client?.name ?? "", clientEmail: row.client?.email ?? "", description: row.description, status: row.status, progress: row.progress, updated: new Date(row.updated_at).toLocaleString(), token: row.portal_token, files: row.project_files ?? [], messages: (row.project_messages ?? []).map(message => ({ id: message.id, from: message.sender_type, text: message.body, time: new Date(message.created_at).toLocaleString() })) };
}

const db = supabase as any;
const projectSelect = "id,name,description,status,progress,portal_token,updated_at,client:clients(id,name,email),project_files(id,name,size,type,storage_path),project_messages(id,sender_type,body,created_at)";

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await db.from("projects").select(projectSelect).order("updated_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as DbProject[]).map(mapProject);
}

export async function createProjectRecord(input: { name: string; clientName: string; clientEmail: string; description: string }) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Please sign in before creating a project.");
  const { data: client, error: clientError } = await db.from("clients").upsert({ freelancer_id: user.user.id, name: input.clientName, email: input.clientEmail }, { onConflict: "freelancer_id,email" }).select("id").single();
  if (clientError) throw clientError;
  const { error } = await db.from("projects").insert({ freelancer_id: user.user.id, client_id: client.id, name: input.name, description: input.description, status: "Not Started", progress: 0, portal_token: crypto.randomUUID() });
  if (error) throw error;
}

export async function updateProjectRecord(id: string, patch: Partial<Pick<Project, "status" | "progress">>) {
  const { error } = await db.from("projects").update(patch).eq("id", id);
  if (error) throw error;
}

export async function addProjectFile(projectId: string, file: ProjectFile) {
  const { error } = await db.from("project_files").insert({ project_id: projectId, name: file.name, size: file.size, type: file.type, storage_path: file.storagePath ?? null });
  if (error) throw error;
}

export async function addProjectMessage(projectId: string, text: string, senderType: ProjectMessage["from"]) {
  const { error } = await db.from("project_messages").insert({ project_id: projectId, sender_type: senderType, body: text });
  if (error) throw error;
}

export async function fetchPortalProject(token: string): Promise<Project | null> {
  const { data, error } = await db.from("projects").select(projectSelect).eq("portal_token", token).maybeSingle();
  if (error) throw error;
  return data ? mapProject(data as unknown as DbProject) : null;
}

/** Deprecated local helpers kept only so older screens fail closed instead of showing fake records. */
export function loadProjects(): Project[] { return []; }
export function saveProjects(_projects: Project[]) { /* persistence is handled by Supabase mutations */ }
