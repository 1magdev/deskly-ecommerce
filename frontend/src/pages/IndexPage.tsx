/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { faFire, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/shared/Navbar";
import ProductGrid from "../components/shared/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function IndexPage() {
  const navigate = useNavigate();
  const [accentColor, setAccentColor] = useState("primary");
  const [slideApi, setSlideApi] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!slideApi) return;
    (slideApi as any).on("select", () => {
      const currentIndex = (slideApi as any).selectedScrollSnap();

      if (currentIndex === 0) {
        setAccentColor("primary");
      } else {
        setAccentColor("success");
      }
    });
  }, [slideApi]);

  return (
    <>
      <Navbar />
      <main className="w-full flex flex-col items-center">
        <div className=" mt-25">
          <Carousel
            setApi={setSlideApi as any}
            style={{ pointerEvents: "none" }}
            plugins={[Autoplay({ delay: 9000 })]}
            opts={{ loop: true }}
          >
            <CarouselContent>
              <CarouselItem className="w-full bg-primary flex flex-col justify-center  items-center ">
                <img
                  src="branding/promotional-hero-session.png"
                  alt="hero-session"
                  className=" mb-3"
                />
              </CarouselItem>
              <CarouselItem className="w-full flex flex-col items-center justify-center bg-success">
                <img
                  src="branding/promotional-hero-session-2.png"
                  alt="hero-session"
                  className="mb-3"
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
        <div className="bg-white w-full justify-center flex flex-col items-center transition-all ease-in ">
          <h2 className="text-dark font-extrabold mt-6 text-3xl transition-all ease-in">
            <FontAwesomeIcon
              icon={faFire}
              className={`text-${accentColor} transition-all ease-in`}
            />{" "}
            Produtos em alta
          </h2>
          <hr
            className={`border-${accentColor} border-1 w-[50vw] mt-6 rounded transition-all ease-in`}
          />
        </div>
        <ProductGrid />
        <section className="w-full flex flex-col items-center justify-center py-16 bg-gradient-to-br from-success to-success/90 text-white">
          <div className="max-w-2xl w-full px-4 text-center">
            <h2 className="font-bold text-3xl mb-3">
              Ainda não achou o que procura?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Pesquise o que você precisa ou navegue por categorias
            </p>
            <div className="flex gap-3 w-full">
              <div className="flex-1 relative">
                <Input
                  type="search"
                  placeholder="Pesquise por palavra chave, exemplo: Teclado"
                  className="w-full h-12 pl-12 pr-4 text-gray-900 bg-white border-0 rounded-lg shadow-lg focus:ring-2 focus:ring-white/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(
                        `/produtos?search=${encodeURIComponent(searchQuery)}`
                      );
                    }
                  }}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                />
              </div>
              <Button
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(
                      `/produtos?search=${encodeURIComponent(searchQuery)}`
                    );
                  } else {
                    navigate("/produtos");
                  }
                }}
                className="h-12 px-8 bg-white text-success hover:bg-gray-100 font-semibold shadow-lg transition-all"
              >
                Buscar
              </Button>
            </div>
            <div className="mt-6">
              <Button
                onClick={() => navigate("/produtos")}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-success transition-all"
              >
                Ver todas as categorias
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="h-50 flex items-center justify-center px-15 w-full bg-dark text-white">
        <img
          src="branding/logo-variation-1.svg"
          width="130"
          alt="Deskly-Logo"
          className="left-25 absolute brightness-180  hue-rotate-84"
        />

        <div className="">
          <h3 className="text-xl font-semibold">Deskly Company</h3>
          <hr className="mb-5" />
          <p className="text-sm opacity-80">
            Vendas de aparelhos eletrônicos e periféricos para escritórios
            <br></br>
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
/*  <ProductsGrid></ProductsGrid> */
