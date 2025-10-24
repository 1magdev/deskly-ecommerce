/* eslint-disable @typescript-eslint/no-explicit-any */
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Navbar } from "../components/shared/Navbar";
import ProductGrid from "../components/shared/ProductGrid";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [accentColor, setAccentColor] = useState("primary");
  const [slideApi, setSlideApi] = useState();

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
