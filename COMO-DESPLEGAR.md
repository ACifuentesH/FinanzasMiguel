# Cómo desplegar el Dashboard para abrirlo en el móvil y sincronizar datos

Para que la app funcione en el teléfono y los datos sean los mismos en todos los dispositivos, haz lo siguiente.

---

## 1. Configurar Google Sheet (sincronización)

1. Crea una **Google Sheet** en [sheets.google.com](https://sheets.google.com).
2. Menú **Extensiones** → **Apps Script**. Pega el contenido del archivo **GoogleSheet-AppScript.js** y guarda.
3. **Implementar** → **Nueva implementación** → Tipo **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién puede acceder: **Cualquier persona**
4. Implementa y **copia la URL** que termina en **`/exec`** (ej. `https://script.google.com/macros/s/xxxx/exec`).
5. En el dashboard (en tu PC), abre **Datos** → pega esa URL en **Conectar con Google Sheet** y haz clic en **Enviar datos al Sheet** una vez para subir lo que tengas. A partir de ahí, cada cambio se sincronizará solo.

---

## 2. Desplegar la app (para abrirla en el móvil)

Elige una opción: **Vercel** (recomendado) o **Netlify**. Ambas son gratis.

### Opción A: Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con GitHub si quieres).
2. Crea un proyecto nuevo e **importa tu carpeta** del proyecto (donde está `dashboard.html`).
   - Si usas GitHub: sube el repo y Vercel lo detectará.
   - Si no: instala [Vercel CLI](https://vercel.com/cli) y en la carpeta del proyecto ejecuta:
     ```bash
     npx vercel
     ```
     y sigue los pasos.
3. En la carpeta del proyecto debe haber el archivo **vercel.json** (ya incluido en el proyecto). Así la raíz del sitio sirve el dashboard.
4. Tras desplegar, te darán una URL tipo `https://tu-proyecto.vercel.app`.

### Opción B: Netlify

1. Entra en [netlify.com](https://netlify.com) e inicia sesión.
2. **Add new site** → **Deploy manually** (o conecta tu repo de GitHub).
3. Arrastra la **carpeta** del proyecto (la que contiene `dashboard.html` y `netlify.toml`) a la zona de deploy.
4. Netlify usará **netlify.toml** para servir `dashboard.html` en la raíz. Tu sitio quedará en `https://algo.netlify.app`.

---

## 3. Usar la misma URL en el móvil (y que los datos se sincronicen)

1. En el **PC**, después de configurar la URL del Sheet en **Datos**, crea un enlace que lleve la URL del Sheet en la propia dirección:
   - URL del Sheet (la que copiaste): `https://script.google.com/macros/s/XXXX/exec`
   - URL de tu app desplegada: `https://tu-proyecto.vercel.app` (o la de Netlify)
   - **Enlace para móvil y otros dispositivos:**
     ```
     https://tu-proyecto.vercel.app/?sheet=https://script.google.com/macros/s/XXXX/exec
     ```
     (Sustituye las dos URLs por las tuyas. La URL del Sheet debe estar codificada si tiene caracteres raros; si no, pégala tal cual.)
2. **Abre ese enlace en el móvil** (Chrome, Safari, etc.) y guárdalo en la pantalla de inicio o en favoritos.
3. La primera vez que abras ese enlace en el móvil, la app cargará los datos desde el Google Sheet. A partir de ahí, cualquier cambio (en el móvil o en el PC) se guarda en el Sheet y se verá en todos los dispositivos.

---

## Resumen

| Paso | Dónde | Qué hace |
|------|--------|----------|
| 1 | Google Sheet + Apps Script | Guarda y devuelve los datos (tus transacciones). |
| 2 | Vercel o Netlify | Sirve la app para poder abrirla desde el móvil por una URL. |
| 3 | Enlace con `?sheet=...` | En el móvil (y en cualquier dispositivo) abre la app ya conectada al mismo Sheet; los datos se mantienen igual en todas las plataformas. |

Si algo no carga en el móvil o los datos no se ven igual, revisa que la URL del Sheet sea exactamente la misma en todos los sitios y que en **Datos** tengas configurada esa URL (o que uses el enlace con `?sheet=...`).
