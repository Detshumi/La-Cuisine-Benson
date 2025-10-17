import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Home() {
  const { auth } = usePage<SharedData>().props;
  const [inputValue, setInputValue] = useState('');
  const [pdfToShow, setPdfToShow] = useState<null | 'fr' | 'en'>(null);

  // Check if inputValue exactly matches "Somphone"
  const showLinks = inputValue === 'Somphone';

  // URLs or relative paths to your PDFs (relative to public folder)
  const frenchPdfUrl = '/menus/french-menu.pdf';
  const englishPdfUrl = '/menus/english-menu.pdf';

  return (
    <>
      <Head title="Home">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
          rel="stylesheet"
        />
      </Head>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFDFC] shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <nav
            aria-label="Primary"
            className="flex justify-end gap-4 text-sm items-center"
          >
            {!showLinks ? (
              <input
                type="text"
                placeholder="La Cuisine Benson"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="rounded-sm border border-gray-300 px-3 py-1 text-sm text-[#1b1b18]"
              />
            ) : auth.user ? (
              <Link
                href={dashboard()}
                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={login()}
                  className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035]"
                >
                  Log in
                </Link>
                <Link
                  href={register()}
                  className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Push content down so it’s not hidden behind fixed header */}
      <div className="pt-16 flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8">
        <h1 className="mb-6 text-2xl font-semibold">Our Menus</h1>

        <div className="flex gap-6 mb-10">
          <button
            onClick={() => setPdfToShow('fr')}
            className="rounded border border-blue-600 bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700"
          >
            French Menu 
          </button>
          <button
            onClick={() => setPdfToShow('en')}
            className="rounded border border-blue-600 bg-blue-600 px-6 py-3 text-lg text-white hover:bg-blue-700"
          >
            English Menu 
          </button>
        </div>
             {/* Contact Info Section INSIDE main container */}
            <div className="max-w-md text-center bg-white p-6 rounded shadow-md border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Contact Us</h2>
            <p className="mb-2 text-gray-600">
                Email:{' '}
                <a
                href="mailto:la_cuisine_benson@outlook.com"
                className="text-blue-600 hover:underline"
                >
                la_cuisine_benson@outlook.com
                </a>
            </p>
            <p className="mb-2 text-gray-600">Phone: 613-714-9880</p>
            <p className="text-gray-600">
                Address:{' '}
                <a
                href="https://www.google.com/maps/search/?api=1&query=732+Rte+800+E,+St-Albert,+ON+K0A+3C0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                >
                732 Rte 800 E, St-Albert, ON K0A 3C0
                </a>
            </p>
            </div>
      </div>

      

      {/* Modal for PDF */}
      {pdfToShow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setPdfToShow(null)} // close on clicking overlay
        >
          <div
            className="relative w-11/12 max-w-4xl rounded bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()} // prevent closing modal on click inside
          >
            <button
            onClick={() => setPdfToShow(null)}
            className="absolute top-2 right-2 rounded bg-gray-200 px-3 py-1 text-sm font-bold text-red-600 hover:text-red-800"
            aria-label="Close menu PDF"
            >
            ✕
            </button>


            <iframe
              src={pdfToShow === 'fr' ? frenchPdfUrl : englishPdfUrl}
              title={pdfToShow === 'fr' ? 'French Menu' : 'English Menu'}
              className="h-[80vh] w-full rounded-b"
              frameBorder="0"
            />
          </div>
        </div>
      )}
    </>
  );
}
