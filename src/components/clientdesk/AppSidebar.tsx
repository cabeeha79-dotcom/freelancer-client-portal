import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, Settings, LogOut, Plus, ExternalLink } from "lucide-react";

export function AppSidebar({ onCreate }: { onCreate: () => void }) {
  const location = useLocation();
  const active = location.pathname.startsWith("/projects") ? "projects" : "overview";
  return <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white px-4 py-5 lg:flex">
    <Link to="/" className="flex items-center gap-2 px-3 text-lg font-bold tracking-tight text-foreground"><span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-white">C</span> ClientDesk</Link>
    <button onClick={onCreate} className="mt-9 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"><Plus size={17}/> New project</button>
    <nav className="mt-8 space-y-1" aria-label="Main navigation">
      <Link to="/" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${active === "overview" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><LayoutDashboard size={18}/> Overview</Link>
      <Link to="/projects" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${active === "projects" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><FolderKanban size={18}/> Projects</Link>
    </nav>
    <div className="mt-auto space-y-1 border-t border-border pt-4">
      <Link to="/portal/$token" params={{ token: "hearth-home-7q2k" }} target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><ExternalLink size={18}/> Preview portal</Link>
      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><Settings size={18}/> Settings</button>
      <Link to="/auth" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><LogOut size={18}/> Sign out</Link>
    </div>
    <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted p-3"><div className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">JD</div><div className="min-w-0"><p className="truncate text-sm font-semibold">Jordan Diaz</p><p className="truncate text-xs text-muted-foreground">Freelancer</p></div></div>
  </aside>;
}
