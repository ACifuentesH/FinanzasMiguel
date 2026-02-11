# Subir el proyecto a GitHub (sin copy-paste)

Para que el dashboard no se rompa, sube los archivos con Git en lugar de copiar y pegar en la web.

## En la carpeta del proyecto (donde está dashboard.html)

Abre PowerShell o CMD en:
`c:\Users\aleja\OneDrive\7mo semestre\miguelini`

### 1. Inicializar Git (si no lo has hecho)
```powershell
git init
```

### 2. Conectar con tu repositorio
```powershell
git remote add origin https://github.com/ACifuentesH/FinanzasMiguel.git
```
(Si ya existe `origin`, usa: `git remote set-url origin https://github.com/ACifuentesH/FinanzasMiguel.git`)

### 3. Añadir todo y hacer commit
```powershell
git add .
git commit -m "Dashboard finanzas completo"
```

### 4. Subir a GitHub
```powershell
git branch -M main
git push -u origin main
```

Si te pide usuario y contraseña: en GitHub usa un **Personal Access Token** como contraseña (no tu clave normal).  
Configuración de GitHub → Developer settings → Personal access tokens → Generate new token.

---

Así `dashboard.html` (y el resto) se sube con la codificación correcta y sin que se corte nada.
