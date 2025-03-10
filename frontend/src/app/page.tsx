"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Fondo degradado amarillo hasta el final, posicionado justo donde inicia el sidebar colapsado */}
      <div
        className="absolute top-0 bottom-0 left-[-100px] bg-gradient-to-b from-white to-neutral-light z-[-1]"
        style={{ width: "calc(100% + 100px)" }}
      ></div>

      {/* Contenido */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-[-1]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left mt-8">
                <h1 className="mt-6 text-4xl tracking-tight font-extrabold text-neutral-dark sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                  <span className="block">
                    Optimiza la gestión de capacidad y
                  </span>
                  <span className="block text-secondary">
                    presupuesto en EVC
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Nuestra plataforma automatiza la administración de
                  proveedores, la asignación de recursos y el análisis
                  financiero, reduciendo errores y optimizando la toma de
                  decisiones.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/register">
                        <Button variant="primary" size="lg" className="w-full">
                          Comenzar ahora
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/features">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="bg-gray-300 hover:bg-gray-400 text-black font-bold transition-all duration-300 transform hover:scale-105"
                        >
                          Conocer más
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <Image
                      src="/images/image.png"
                      alt="Dashboard de gestión presupuestaria"
                      width={500}
                      height={300}
                      className="w-full"
                      unoptimized={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-secondary font-semibold tracking-wide uppercase">
                Características
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
                Digitaliza y optimiza tu gestión financiera
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Facilita la administración de proveedores, la asignación
                presupuestaria y el control de costos en tiempo real.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <h3 className="text-lg font-semibold">
                  Automatización de Cargas
                </h3>
                <p className="text-gray-600 mt-2">
                  Sube y valida datos de asignación presupuestaria de manera
                  estructurada.
                </p>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold">Comparación de Costos</h3>
                <p className="text-gray-600 mt-2">
                  Visualiza precios de proveedores y optimiza la contratación de
                  talento.
                </p>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold">Reportes y Análisis</h3>
                <p className="text-gray-600 mt-2">
                  Genera reportes visuales para un control presupuestario
                  eficiente.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">
                  Transforma tu gestión presupuestaria hoy
                </span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-white opacity-80">
                Optimiza la administración de tu presupuesto con tecnología
                avanzada.
              </p>
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-md shadow">
                  <Link href="/register">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-primary hover:bg-primary-light text-neutral-dark font-bold transition-all duration-300 transform hover:scale-105"
                    >
                      Empezar ahora
                    </Button>
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
