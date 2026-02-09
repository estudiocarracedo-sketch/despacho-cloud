# 🌐 Extractor de Despachos Cloud

Aplicación web Next.js para extraer datos de despachos de aduana argentinos y exportarlos a Excel. **100% en la nube, sin instalación**.

## ✨ Características

- ☁️ **100% Cloud**: Accede desde cualquier navegador, sin instalar nada
- 🚀 **Súper Rápido**: Procesa múltiples PDFs en segundos
- 📊 **Excel Automático**: Descarga inmediata con todos los datos
- 🔒 **Seguro**: Los archivos no se almacenan, procesamiento temporal
- 📱 **Responsive**: Funciona en desktop, tablet y móvil
- 🎨 **UI Moderna**: Interfaz intuitiva con drag & drop

## 📋 Datos Extraídos

- FOB Total
- Flete Total
- Seguro Total
- Divisa
- Valor en Aduana (USD) - suma automática de múltiples páginas
- Cotización
- Vendedor
- Importador/Exportador
- Número de Despacho
- Fecha de Oficialización

## 🚀 Deploy en Vercel (Recomendado)

### Deploy con un clic

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/despacho-cloud)

### Deploy manual

1. **Fork este repositorio** en GitHub

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Importa tu repositorio
   - Click en "Deploy"

3. **¡Listo!** Tu app estará en `https://tu-proyecto.vercel.app`

## 💻 Desarrollo Local

### Requisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/despacho-cloud.git
cd despacho-cloud

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
despacho-cloud/
├── app/
│   ├── api/
│   │   └── process/
│   │       └── route.ts          # API para procesar PDFs
│   ├── components/
│   │   └── FileUploader.tsx      # Componente drag & drop
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globales
├── lib/
│   ├── pdf-extractor.ts          # Lógica de extracción
│   └── excel-generator.ts        # Generador de Excel
├── public/                       # Archivos estáticos
├── next.config.js               # Configuración Next.js
├── tailwind.config.ts           # Configuración Tailwind
└── package.json                 # Dependencias
```

## 🛠️ Tecnologías

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **React Dropzone** - Drag & drop de archivos
- **Lucide React** - Iconos

### Backend
- **Next.js API Routes** - Endpoints serverless
- **pdf-parse** - Extracción de texto de PDFs
- **ExcelJS** - Generación de archivos Excel
- **Node.js Runtime** - Procesamiento en servidor

### Deploy
- **Vercel** - Hosting y CI/CD automático

## 🔧 Configuración

### Variables de Entorno (Opcional)

Crea un archivo `.env.local`:

```env
# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### Límites de Vercel

**Plan Hobby (Gratis)**:
- Timeout: 10 segundos
- Body size: 4.5 MB
- Recomendado: Máx 5-10 PDFs por request

**Plan Pro**:
- Timeout: 60 segundos
- Body size: 4.5 MB
- Puede procesar más PDFs

Para archivos grandes, considera dividir en lotes.

## 📖 Uso

### Desde la Web

1. Visita `https://tu-proyecto.vercel.app`
2. Arrastra o selecciona PDFs de despachos
3. Click en "Procesar y Descargar Excel"
4. El Excel se descarga automáticamente

### API Endpoint

También puedes usar la API directamente:

```bash
curl -X POST https://tu-proyecto.vercel.app/api/process \
  -F "files=@despacho1.pdf" \
  -F "files=@despacho2.pdf" \
  -o resultado.xlsx
```

## 🐛 Troubleshooting

### Error: "Request Entity Too Large"

**Causa**: Los PDFs son muy grandes.

**Solución**: 
- Procesa menos PDFs a la vez
- Comprime los PDFs antes de subir
- Considera upgrade a Vercel Pro

### Error: "Function Execution Timeout"

**Causa**: El procesamiento toma más de 10 segundos (plan gratuito).

**Solución**:
- Procesa menos PDFs por request
- Upgrade a Vercel Pro (60s timeout)

### Los datos no se extraen correctamente

**Causas**:
- PDF escaneado (imagen, no texto)
- Formato de despacho diferente

**Solución**:
- Verifica que el PDF tenga texto seleccionable
- Ajusta los regex en `lib/pdf-extractor.ts`

## 🔐 Seguridad y Privacidad

- ✅ Los archivos **NO se almacenan** en el servidor
- ✅ Procesamiento temporal en memoria
- ✅ Sin base de datos de archivos
- ✅ HTTPS en Vercel por defecto
- ✅ Los PDFs nunca salen de tu sesión

## 📈 Mejoras Futuras

- [ ] Autenticación de usuarios
- [ ] Historial de procesamientos
- [ ] Almacenamiento en Supabase (opcional)
- [ ] Procesamiento en background para archivos grandes
- [ ] API pública con rate limiting
- [ ] Soporte para más tipos de documentos
- [ ] OCR para PDFs escaneados
- [ ] Dashboard con estadísticas

## 🤝 Contribuciones

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- 📧 Email: [tu-email@ejemplo.com]
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/despacho-cloud/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tu-usuario/despacho-cloud/discussions)

## ⭐ Agradecimientos

Desarrollado para facilitar el procesamiento de despachos de aduana argentinos.

---

**Versión**: 1.0.0  
**Stack**: Next.js 14 + TypeScript + Tailwind CSS  
**Deploy**: Vercel  
**Estado**: Producción ✅
