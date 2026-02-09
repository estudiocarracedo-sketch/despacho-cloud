# 🚀 Guía de Deploy - Extractor de Despachos Cloud

## Deploy en Vercel (Más Fácil) ⭐

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Sube el código a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TU-USUARIO/despacho-cloud.git
   git push -u origin main
   ```

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Importa tu repositorio de GitHub
   - Click "Deploy"

3. **¡Listo!** 
   - Tu app estará en `https://despacho-cloud.vercel.app`
   - Los deploys automáticos están configurados
   - Cada push a `main` despliega automáticamente

### Opción 2: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

## Variables de Entorno

No son necesarias para la versión básica, pero puedes agregar:

```env
# En Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## Configuración de Dominio Personalizado

1. En Vercel Dashboard, ve a tu proyecto
2. Settings > Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

## Límites y Recomendaciones

### Plan Gratuito (Hobby)
- ✅ Perfecto para uso personal
- ⚠️ Timeout de 10 segundos
- ⚠️ Máximo 5-10 PDFs por request
- ✅ HTTPS gratis
- ✅ Deploy automático

### Plan Pro ($20/mes)
- ✅ Timeout de 60 segundos
- ✅ Procesa muchos más PDFs
- ✅ Métricas avanzadas
- ✅ Soporte prioritario

## Monitoreo

### Ver Logs en Tiempo Real

```bash
vercel logs
```

### Dashboard de Vercel
- Analytics de uso
- Logs de funciones
- Métricas de performance

## Actualizar la Aplicación

```bash
# Hacer cambios en el código
git add .
git commit -m "Mejoras en extracción"
git push

# Vercel detecta el push y despliega automáticamente
```

## Troubleshooting

### Deploy falla

```bash
# Verificar build local
npm run build

# Si funciona local, revisar logs en Vercel
vercel logs --follow
```

### Timeout en producción

**Solución temporal**: Procesa menos PDFs  
**Solución permanente**: Upgrade a Pro

## Seguridad

- ✅ HTTPS automático con certificados SSL
- ✅ Protección DDoS incluida
- ✅ Funciones serverless aisladas
- ✅ No almacenamos archivos

## Costos

**Vercel Hobby (Gratis)**:
- Deploy ilimitados
- 100GB bandwidth/mes
- Funciones serverless
- HTTPS

**Vercel Pro ($20/mes)**:
- Todo lo del plan gratuito
- Timeouts extendidos
- Métricas avanzadas
- Soporte

## Recomendaciones

✅ Usar plan gratuito para empezar  
✅ Monitorear uso con Analytics  
✅ Considerar Pro si procesas >50 PDFs/día  
✅ Configurar dominio personalizado  

---

¿Necesitas ayuda? Abre un issue en GitHub.
