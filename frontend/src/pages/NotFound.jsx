import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFound() {
  return (
    <section className="min-h-screen bg-gray-50">
      <SEO title="404 - Oldal nem található" noindex />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-3 text-gray-600">
          A keresett oldal nem található.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="rounded-lg bg-green-600 px-5 py-3 text-white font-medium hover:bg-green-700 transition-colors"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    </section>
  );
}
