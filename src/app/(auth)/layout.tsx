// Layout simples para rotas de auth (login/register)
// Sem proteção — a verificação é feita dentro de cada página se necessário.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
