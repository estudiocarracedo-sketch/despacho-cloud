// app/components/FileUploader.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Download, Loader2 } from 'lucide-react';

export function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    setFiles(prev => [...prev, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar los archivos');
      }

      // Descargar Excel
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Despachos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress(100);
      
      // Limpiar después de 2 segundos
      setTimeout(() => {
        setFiles([]);
        setProcessing(false);
        setProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar los archivos. Por favor intente nuevamente.');
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${processing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg text-blue-600 font-medium">
            Suelta los archivos aquí...
          </p>
        ) : (
          <>
            <p className="text-lg text-gray-700 font-medium mb-2">
              Arrastra PDFs aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500">
              Acepta múltiples archivos PDF de despachos de aduana
            </p>
          </>
        )}
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Archivos seleccionados ({files.length})
            </h3>
            {!processing && (
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpiar todo
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                {!processing && (
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de procesar */}
      {files.length > 0 && (
        <button
          onClick={processFiles}
          disabled={processing}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold text-white
            transition-all duration-200 flex items-center justify-center gap-2
            ${processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando {files.length} archivo{files.length > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Procesar y Descargar Excel
            </>
          )}
        </button>
      )}

      {/* Barra de progreso */}
      {processing && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Procesando archivos...
            </span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
