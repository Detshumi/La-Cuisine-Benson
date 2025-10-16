import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from "react";

export default function Home() {
    const { auth } = usePage<SharedData>().props;
    const [inputValue, setInputValue] = useState("");
    // Check if inputValue exactly matches "Somphone"
    const showLinks = inputValue === "Somphone";

  return (
    <>
      <Head title="Home">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFDFC] dark:bg-[#0a0a0a] shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <nav
            aria-label="Primary"
            className="flex justify-end gap-4 text-sm items-center"
          >
            {!showLinks ? (
              <input
                type="text"
                placeholder="Enter code to show login/register"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="rounded-sm border border-gray-300 px-3 py-1 text-sm text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
              />
            ) : auth.user ? (
              <Link
                href={dashboard()}
                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={login()}
                  className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                >
                  Log in
                </Link>
                <Link
                  href={register()}
                  className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Push content down so it’s not hidden behind fixed header */}
      <div className="pt-16 flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
        {/* Your page content */}
      </div>
    </>
  );
}
