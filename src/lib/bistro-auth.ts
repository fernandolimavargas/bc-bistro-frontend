export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface AuthSession {
  user: User;
}

const SESSION_KEY = "bc_bistro_session";

const isBrowser = () => typeof window !== "undefined";

export function getSession(): AuthSession | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw)
    return null;

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

export async function login(
  usuario: string,
  senha: string
): Promise<AuthSession> {

  const response = await fetch(
    "https://localhost:5001/api/Login/ExecutarLogin",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario,
        senha
      })
    }
  );

  if (!response.ok) {
    throw new Error("Usuário ou senha inválidos");
  }

  const dados = await response.json();

  const session: AuthSession = {
    user: dados.usuario
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

export function logout() {
  if (!isBrowser())
    return;

  localStorage.removeItem(SESSION_KEY);
}