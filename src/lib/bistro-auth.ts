// Client-side auth store. Replace the functions below with real API calls
// (login / list users / create / update / delete) when the backend is ready.
// The shape of `User` and `AuthSession` is intentionally close to a typical
// JWT-based REST backend response.

export type Perfil = "ADMIN" | "FUNCIONARIO";

export interface User {
  id: string;
  nome: string;
  usuario: string; // username or email
  perfil: Perfil;
  ativo: boolean;
}

interface StoredUser extends User {
  // NOTE: this is a frontend mock. In production the backend stores a hash
  // (bcrypt/argon2) and never sends passwords to the client.
  senhaHash: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

const USERS_KEY = "bc_bistro_users";
const SESSION_KEY = "bc_bistro_session";

const uid = () => Math.random().toString(36).slice(2, 10);

// Tiny non-cryptographic hash — placeholder only; backend will use bcrypt.
function fakeHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h_${h}_${s.length}`;
}

const isBrowser = () => typeof window !== "undefined";

function seedIfEmpty(): StoredUser[] {
  const seed: StoredUser[] = [
    {
      id: uid(),
      nome: "Administrador",
      usuario: "admin",
      perfil: "ADMIN",
      ativo: true,
      senhaHash: fakeHash("admin123"),
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seed));
  return seed;
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return seedIfEmpty();
  try {
    const list = JSON.parse(raw) as StoredUser[];
    return Array.isArray(list) && list.length > 0 ? list : seedIfEmpty();
  } catch {
    return seedIfEmpty();
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(u: StoredUser): User {
  const { senhaHash: _h, ...rest } = u;
  return rest;
}

// ---------- Session ----------

export function getSession(): AuthSession | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  return getSession()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function isAdmin(): boolean {
  return getCurrentUser()?.perfil === "ADMIN";
}

export function login(usuario: string, senha: string): AuthSession {
  const users = readUsers();
  const u = users.find(
    (x) => x.usuario.toLowerCase() === usuario.trim().toLowerCase()
  );
  if (!u) throw new Error("Usuário ou senha inválidos");
  if (!u.ativo) throw new Error("Usuário inativo. Procure o administrador.");
  if (u.senhaHash !== fakeHash(senha)) throw new Error("Usuário ou senha inválidos");

  const session: AuthSession = {
    token: `mock.${u.id}.${Date.now()}`,
    user: toPublic(u),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  if (isBrowser()) localStorage.removeItem(SESSION_KEY);
}

// ---------- Users CRUD (admin) ----------

export function listUsers(): User[] {
  return readUsers().map(toPublic);
}

export function createUser(input: {
  nome: string;
  usuario: string;
  senha: string;
  perfil: Perfil;
  ativo?: boolean;
}): User {
  const users = readUsers();
  if (users.some((u) => u.usuario.toLowerCase() === input.usuario.trim().toLowerCase())) {
    throw new Error("Já existe um usuário com este nome de usuário");
  }
  const novo: StoredUser = {
    id: uid(),
    nome: input.nome.trim(),
    usuario: input.usuario.trim(),
    perfil: input.perfil,
    ativo: input.ativo ?? true,
    senhaHash: fakeHash(input.senha),
  };
  writeUsers([...users, novo]);
  return toPublic(novo);
}

export function updateUser(
  id: string,
  patch: Partial<{ nome: string; usuario: string; perfil: Perfil; ativo: boolean }>
) {
  const users = readUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  writeUsers(users);

  // Refresh stored session if the current user was edited
  const session = getSession();
  if (session && session.user.id === id) {
    const updated = users.find((u) => u.id === id);
    if (updated) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...session, user: toPublic(updated) })
      );
    }
  }
}

export function changePassword(id: string, novaSenha: string) {
  if (!novaSenha || novaSenha.length < 4) {
    throw new Error("A senha deve ter pelo menos 4 caracteres");
  }
  const users = readUsers().map((u) =>
    u.id === id ? { ...u, senhaHash: fakeHash(novaSenha) } : u
  );
  writeUsers(users);
}

export function deleteUser(id: string) {
  const me = getCurrentUser();
  if (me?.id === id) throw new Error("Você não pode excluir seu próprio usuário");
  writeUsers(readUsers().filter((u) => u.id !== id));
}
