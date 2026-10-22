-- Ejecutar una vez en Supabase -> SQL Editor.
-- Perfiles y sesiones privadas gestionadas exclusivamente por el servidor Java.
create table if not exists public.miembros (
  google_sub text primary key,
  correo text not null,
  nombre text not null,
  foto text not null default '',
  alta timestamptz not null default now(),
  ultimo_acceso timestamptz not null default now()
);
create table if not exists public.sesiones (
  token_hash text primary key,
  google_sub text not null references public.miembros(google_sub) on delete cascade,
  expira timestamptz not null
);
create index if not exists sesiones_expira_idx on public.sesiones(expira);
create index if not exists sesiones_google_sub_idx on public.sesiones(google_sub);

alter table public.miembros enable row level security;
alter table public.sesiones enable row level security;
-- No crear políticas públicas: solo backend con service_role puede leer/escribir.
revoke all on public.miembros from anon, authenticated;
revoke all on public.sesiones from anon, authenticated;

-- Limpieza ocasional, desde consola SQL, si no hay un cron gratuito:
-- delete from public.sesiones where expira < now();
