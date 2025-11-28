import type { ReactNode } from "react";
import { Navbar } from "../shared/Navbar";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen min-w-full flex flex-col py-15">
        {children}
      </main>
      <footer className="h-50 flex items-center justify-center px-15 w-full bg-dark text-white">
        <img
          src="/branding/logo-variation-1.svg"
          width="130"
          alt="Deskly-Logo"
          className="left-25 absolute brightness-180 hue-rotate-84"
        />

        <div>
          <h3 className="text-xl font-semibold">Deskly Company</h3>
          <hr className="mb-5" />
          <p className="text-sm opacity-80">
            Vendas de aparelhos eletrônicos e periféricos para escritórios
            <br />
            voltados a trabalhos remotos "Home-Office"
          </p>
          <p className="text-xs mt-1 opacity-60">
            © {new Date().getFullYear()} Deskly. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
