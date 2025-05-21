"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  FaFileUpload,
  FaChartLine,
  FaChartPie,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Home() {
  // Estado para el carrusel de imágenes
  const [currentImage, setCurrentImage] = useState(0);
  const carouselImages = [
    "/images/carusel/image1.png",
    "/images/carusel/image2.jpg",
    "/images/carusel/image3.jpg",
  ];

  // Función para avanzar o retroceder imágenes con tipo definido
  const navigateCarousel = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    } else {
      setCurrentImage((prev) =>
        prev === 0 ? carouselImages.length - 1 : prev - 1,
      );
    }
  };

  // Cambia la imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      navigateCarousel("next");
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-white">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 bg-[#f7f7f7]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFE600]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left mt-8">
                <h1 className="mt-6 text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                  <span className="block">
                    Optimiza la gestión de capacidad y
                  </span>
                  <span className="block">presupuesto en EVC</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Nuestra plataforma automatiza la administración de
                  proveedores, la asignación de recursos y el análisis
                  financiero, reduciendo errores y optimizando la toma de
                  decisiones.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-full shadow-lg overflow-hidden">
                      <Link href="/login" legacyBehavior>
                        <a className="block rounded-full overflow-hidden">
                          <Button
                            variant="primary"
                            size="lg"
                            className="w-full bg-[#FFE600] hover:bg-[#F5DC00] text-black font-extrabold border-0 rounded-full px-12 py-4 text-xl"
                          >
                            Comenzar ahora
                          </Button>
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                {/* Contenedor con flexbox para los botones y el carrusel */}
                <div className="flex items-center justify-center w-full space-x-4">
                  {/* Botón izquierdo */}
                  <button
                    onClick={() => navigateCarousel("prev")}
                    className="w-10 h-10 rounded-full bg-[#FFE600] hover:bg-[#F5DC00] flex items-center justify-center shadow-md focus:outline-none transition-all duration-300 flex-shrink-0"
                    aria-label="Imagen anterior"
                  >
                    <FaChevronLeft className="text-black text-lg" />
                  </button>

                  {/* Carrusel central */}
                  <div className="relative mx-auto w-full rounded-lg shadow-lg">
                    <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                      {/* Carrusel de imágenes - Más grande */}
                      <div className="relative h-80 sm:h-96 md:h-[400px]">
                        {carouselImages.map((src, index) => (
                          <div
                            key={index}
                            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                              index === currentImage
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          >
                            <Image
                              src={src}
                              alt={`Dashboard vista ${index + 1}`}
                              fill
                              className="object-cover"
                              priority={index === 0}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Indicadores del carrusel */}
                      <div className="absolute bottom-3 left-0 right-0">
                        <div className="flex justify-center space-x-2">
                          {carouselImages.map((_, index) => (
                            <button
                              key={index}
                              className={`h-2 w-2 rounded-full ${
                                index === currentImage
                                  ? "bg-[#FFE600]"
                                  : "bg-gray-300"
                              }`}
                              onClick={() => setCurrentImage(index)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón derecho */}
                  <button
                    onClick={() => navigateCarousel("next")}
                    className="w-10 h-10 rounded-full bg-[#FFE600] hover:bg-[#F5DC00] flex items-center justify-center shadow-md focus:outline-none transition-all duration-300 flex-shrink-0"
                    aria-label="Imagen siguiente"
                  >
                    <FaChevronRight className="text-black text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <p className="mt-2 text-2xl leading-8 font-bold tracking-tight text-neutral-dark sm:text-3xl">
                Digitaliza y optimiza tu gestión financiera
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Facilita la administración de proveedores, la asignación
                presupuestaria y el control de costos en tiempo real.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-1 lg:grid-cols-3">
              {/* Tarjeta 1 - Automatización de Cargas */}
              <div className="bg-[#ffe474] p-6 rounded-lg shadow-md border-l-4 border-[#FFE600] hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="mr-3">
                    <FaFileUpload className="text-gray-900 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Automatización de Cargas
                  </h3>
                </div>
                <p className="text-gray-700 flex-grow">
                  Valida y procesa datos de asignación presupuestaria con
                  nuestra plataforma intuitiva y eficiente.
                </p>
                <div className="mt-4">
                  <Link href="/login" legacyBehavior>
                    <a className="inline-flex items-center text-gray-900 font-medium hover:text-[#00448D] transition-colors">
                      Ver más
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>

              {/* Tarjeta 2 - Comparación de Costos */}
              <div className="bg-[#ffe474] p-6 rounded-lg shadow-md border-l-4 border-[#FFE600] hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="mr-3">
                    <FaChartLine className="text-gray-900 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Comparación de Costos
                  </h3>
                </div>
                <p className="text-gray-700 flex-grow">
                  Visualiza tendencias de precios y encuentra oportunidades de
                  ahorro con gráficos interactivos.
                </p>
                <div className="mt-4">
                  <Link href="/login" legacyBehavior>
                    <a className="inline-flex items-center text-gray-900 font-medium hover:text-[#00448D] transition-colors">
                      Ver más
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>

              {/* Tarjeta 3 - Reportes y Análisis */}
              <div className="bg-[#ffe474] p-6 rounded-lg shadow-md border-l-4 border-[#FFE600] hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="mr-3">
                    <FaChartPie className="text-gray-900 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reportes y Análisis
                  </h3>
                </div>
                <p className="text-gray-700 flex-grow">
                  Toma decisiones informadas basadas en datos precisos y
                  actualizados para anticipar necesidades.
                </p>
                <div className="mt-4">
                  <Link href="/login" legacyBehavior>
                    <a className="inline-flex items-center text-gray-900 font-medium hover:text-[#00448D] transition-colors">
                      Ver más
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#f7f7f7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                <span className="block">
                  Transforma tu gestión presupuestaria hoy
                </span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-gray-600">
                Optimiza la administración de tu presupuesto con tecnología
                avanzada.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="rounded-full shadow-lg overflow-hidden">
                  <Link href="/login" legacyBehavior>
                    <a className="block rounded-full overflow-hidden">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-[#FFE600] hover:bg-[#F5DC00] text-black font-extrabold border-0 rounded-full px-12 py-4 text-xl"
                      >
                        Comenzar ahora
                      </Button>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
