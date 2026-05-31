import { api } from "../services/api";

export interface User {
  id: number,
  nome: string;
  usuario: string;
}

export interface AuthSession {
  user: User;
}

const SESSION_KEY = "bc_bistro_session";

const isBrowser = () => typeof window !== "undefined";

export function getSession(): AuthSession | null {

  if (!isBrowser())
    return null;

  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw)
    return null;

  try {

    const session = JSON.parse(raw);

    // Valida estrutura da sessão
    if (
      !session ||
      !session.user ||
      typeof session.user.nome !== "string"
    ) {

      localStorage.removeItem(SESSION_KEY);
      return null;

    }

    return session as AuthSession;

  } catch {

    localStorage.removeItem(SESSION_KEY);
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

  try {

    const response = await api.post(
      "/login/ExecutarLogin",
      {
        usuario,
        senha
      }
    );

    const session: AuthSession = {
      user: response.data.usuario
    };

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(session)
    );

    return session;

  } catch {

    throw new Error(
      "Usuário ou senha inválidos"
    );

  }
}

export function logout() {

  if (!isBrowser())
    return;

  localStorage.removeItem(
    SESSION_KEY
  );
}