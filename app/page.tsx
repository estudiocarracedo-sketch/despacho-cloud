// app/page.tsx
import { FileUploader } from './components/FileUploader';
import { FileSpreadsheet, Zap, Shield, Cloud } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Extractor de Despachos Cloud
              </h1>
              <p className="text-sm text-gray-600">
                Procesa despachos de aduana en la nube
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Características */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Cloud</h3>
            <p className="text-sm text-gray-600">
              No necesitas instalar nada. Accede desde cualquier navegador.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Súper Rápido</h3>
            <p className="text-sm text-gray-600">
              Procesa múltiples PDFs en segundos y descarga tu Excel.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Seguro</h3>
            <p className="text-sm text-gray-600">
              Tus archivos no se almacenan. Procesamiento y descarga inmediata.
            </p>
          </div>
        </div>

        {/* Uploader */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sube tus Despachos
            </h2>
            <p className="text-gray-600">
              Arrastra o selecciona los PDFs de despachos de aduana para extraer los datos automáticamente.
            </p>
          </div>

          <FileUploader />

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Datos que se extraen
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-7">
              <li>• FOB Total, Flete Total, Seguro Total</li>
              <li>• Valor en Aduana (suma automática de múltiples páginas)</li>
              <li>• Divisa, Cotización</li>
              <li>• Vendedor, Importador/Exportador</li>
              <li>• Número de Despacho, Fecha de Oficialización</li>
            </ul>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sube los PDFs</h3>
            <p className="text-sm text-gray-600">
              Arrastra o selecciona uno o varios archivos PDF de despachos
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Procesa</h3>
            <p className="text-sm text-gray-600">
              Haz clic en "Procesar" y espera unos segundos
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Descarga</h3>
            <p className="text-sm text-gray-600">
              Tu Excel se descargará automáticamente con todos los datos
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Extractor de Despachos Cloud v1.0 | Procesa despachos de aduana argentinos de forma rápida y segura
          </p>
        </div>
      </footer>
    </div>
  );
}
