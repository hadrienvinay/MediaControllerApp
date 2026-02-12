
'use client'

import { useEffect, useState } from "react";
import { getConvertedFiles } from "@/lib/converter";
import { ConvertedItem } from "@/types/converted";
import Link from "next/link";

export default function ConverterPage() {
    const [convertedFiles, setConvertedFiles] = useState<ConvertedItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConvertedFiles = async () => {
        try {
            const response = await fetch('/api/convert');
            const data = await response.json();
            setConvertedFiles(data);
            } catch (error) {
            console.error('Erreur:', error);
            } finally {
            setLoading(false);
            };
        }
    
      useEffect(() => {
        fetchConvertedFiles();
      }, []);

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">Chargement...</div>
        </div>
        );
    }

  return ( 
  <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Mes Fichiers convertis</h1>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Nouvelle conversion
        </Link>
      </div>

      {convertedFiles.length === 0 ? (
        <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Aucune conversion réalisée pour le moment
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >Retourner à l'accueil pour vos conversions 
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {convertedFiles.map((converted) => (
            <div
              key={converted.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{converted.title}</h2>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(converted.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span>📐 {converted.duration } minutes </span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                    <a href={'/audio/converted/'+converted.filename}
                      download
                      className="bg-green-400 text-white px-6 py-2 rounded-lg cursor-pointer"
                    >
                      Télécharger
                    </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}