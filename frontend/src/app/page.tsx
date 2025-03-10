import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-white to-neutral-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-neutral-dark sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Toma el control de</span>
                <span className="block text-secondary">tus finanzas personales</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                FinUp te ayuda a organizar tus gastos, ahorrar dinero y alcanzar tus metas financieras con herramientas simples pero poderosas.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/register">
                      <Button variant="primary" size="lg" className="w-full">
                        Comenzar gratis
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/caracteristicas">
                      <Button variant="secondary" size="lg" className="w-full">
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
                    src="/images/dashboard-preview.jpg"
                    alt="Dashboard de FinUp"
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
            <h2 className="text-base text-secondary font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
              Una mejor manera de gestionar tu dinero
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Herramientas diseñadas para ayudarte a tomar mejores decisiones financieras.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-neutral-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-bancolombia-text">Seguimiento de gastos</h3>
                <p className="mt-2 text-base text-gray-500">
                  Registra y categoriza tus gastos para saber exactamente dónde va tu dinero cada mes.
                </p>
              </Card>

              <Card className="transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-bancolombia-blue text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-bancolombia-text">Análisis financiero</h3>
                <p className="mt-2 text-base text-gray-500">
                  Visualiza tus finanzas con gráficos intuitivos y obtén insights para mejorar tus hábitos financieros.
                </p>
              </Card>

              <Card className="transform transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-bancolombia-yellow text-bancolombia-text">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-bancolombia-text">Metas de ahorro</h3>
                <p className="mt-2 text-base text-gray-500">
                  Establece metas de ahorro y haz un seguimiento de tu progreso para alcanzar tus objetivos financieros.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-secondary font-semibold tracking-wide uppercase">Testimonios</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-neutral-dark sm:text-4xl">
              Lo que dicen nuestros usuarios
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="inline-block h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-neutral-dark font-bold">AM</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Ana María</h4>
                  <p className="mt-1 text-gray-500">"FinUp me ha ayudado a organizar mis finanzas y ahorrar para mi primer apartamento."</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="inline-block h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-white font-bold">JC</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Juan Carlos</h4>
                  <p className="mt-1 text-gray-500">"Gracias a las herramientas de análisis, pude identificar gastos innecesarios y reducirlos."</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="inline-block h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-neutral-dark font-bold">LP</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">Laura Pérez</h4>
                  <p className="mt-1 text-gray-500">"La aplicación es intuitiva y fácil de usar. Me encanta poder ver mis finanzas en gráficos claros."</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">¿Listo para tomar el control de tus finanzas?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-white opacity-80">
              Únete a miles de colombianos que ya están mejorando su salud financiera con FinUp.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Link href="/register">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="bg-primary hover:bg-primary-light text-neutral-dark font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End of CTA Section */}
    </div>
  );
}
