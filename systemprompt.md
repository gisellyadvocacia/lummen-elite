### 🧩 Diretrizes de Skills Ativas

Por favor, aplique as seguintes diretrizes e padrões de desenvolvimento durante toda a geração de código:

1. **`mattpocock/skills` (TypeScript Estrito):**
   - Garanta tipagem rigorosa de ponta a ponta, sem uso de `any`.
   - Utilize types/interfaces explícitas para props de componentes, retornos de hooks, payloads de auth e documentos do Firestore.
   - Trate estados nulos/indefinidos (`null | undefined`) com type guards e optional chaining.

2. **`nextlevelbuilder/ui-ux-pro-max-skill` + `Leonxlnx/taste-skill` (Design & UI/UX):**
   - Construa componentes com acabamento visual moderno e profissional, evitando layouts genéricos.
   - Aplique microinterações, estados de foco, hover e transições suaves com Tailwind CSS.
   - Mantenha a identidade visual dark premium do **Lummen Elite**: fundo escuro (`bg-slate-950`/`bg-zinc-900`), cards contrastantes com bordas sutis (`border-slate-800`), tipografia nítida e detalhes com acento dourado/âmbar (`amber-500`, `yellow-500`)[cite: 1].
   - Adicione feedback visual imediato para estados de carregamento (skeletons/spinners) e alertas de erro.

3. **`anthropics/skills` / `obra/superpowers` (Arquitetura Full-Stack):**
   - Mantenha separação clara de responsabilidades: serviços e SDKs isolados em `lib/`, estado global em `context/`, componentes reutilizáveis em `components/` e páginas em `app/`.
   - Escreva código modular, limpo, de fácil manutenção e pronto para produção no Next.js App Router.