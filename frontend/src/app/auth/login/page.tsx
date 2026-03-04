"use client"

import Image from "next/image"
import { LoginForm } from "../../../Features/auth/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#d7d9dd] p-2 md:p-4">
      <section className="mx-auto grid min-h-[calc(100vh-1rem)] max-w-[1240px] overflow-hidden rounded-[28px] bg-[#f3f4f4] shadow-[0_18px_36px_rgba(30,43,58,0.12)] md:min-h-[calc(100vh-2rem)] lg:grid-cols-2">
        <div className="relative flex items-center justify-center px-6 py-10 md:px-10 lg:px-14">
          <div className="absolute left-6 top-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f04f4f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f6bf4f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#40c75a]" />
          </div>
          <LoginForm />
        </div>

        <aside className="relative hidden border-l border-[#dfe5e0] bg-[#e6ede8] px-8 py-10 lg:flex lg:flex-col lg:items-center lg:justify-between">
          <div className="relative mt-5 flex h-[56%] w-full max-w-[500px] items-center justify-center">
            <Image
              src="/login.png"
              alt="Ilustração de produtividade Vision Tech"
              width={1470}
              height={980}
              className="h-auto w-full max-w-[500px] object-contain"
              priority
            />
          </div>

          <div className="mb-6 max-w-[470px] text-center">
            <div className="mb-5 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#bac2ca]" />
              <span className="h-2 w-2 rounded-full bg-[#1d2433]" />
              <span className="h-2 w-2 rounded-full bg-[#c9d0d6]" />
            </div>
            <h2 className="text-5xl leading-[1.1] font-bold tracking-[-0.02em] text-[#141d2e]">
              Torne seu trabalho mais fácil e organizado
            </h2>
            <p className="mx-auto mt-4 max-w-[430px] text-[20px] leading-relaxed text-[#4f5766]">
              Com o <span className="font-semibold text-[#111b2d]">Vision Tech</span>, você tem o controle total da sua empresa em um só lugar.
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
