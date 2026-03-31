# Guía de Despliegue - Green Force PWA

## Estado del Despliegue (31/03/2026)

### 🔥 Firebase Hosting (Production)
- **URL:** https://green-force-pwa-2025.web.app/
- **Status:** ⏳ Pendiente de re-intento (error API temporal)
- **Solución:** Reintentar `firebase deploy --project green-force-pwa-2025 --only hosting` cuando conectividad sea estable

### 📦 GitHub Pages (Mirror/Backup)
- **URL:** https://lfalzatel.github.io/SchoolPage/
- **Status:** ✅ Workflow configurado (`.github/workflows/deploy.yml`)
- **Activación:** En GitHub Settings:
  
  1. Ve a: https://github.com/lfalzatel/SchoolPage/settings/pages
  2. Source: Selecciona `Deploy from a branch`
  3. Branch: Selecciona `gh-pages` (será creada automáticamente)
  4. Save

### 📝 Cambios Recientes Desplegados
- Commit: `2c2f6c5` - GitHub Actions workflow agregado
- Commit: `6257ef5` - Share App button con Web Share API
- Todos los cambios en main branch de GitHub

## Próximos Pasos

1. **Habilitar GitHub Pages en Settings** (manual, una única vez)
2. **Reintentar Firebase** cuando haya conectividad estable
3. **Ambos sitios sirven el mismo código** desde GitHub main branch

## Commands Útiles

```bash
# Desplegar a Firebase (cuando conectividad funcione)
firebase deploy --project green-force-pwa-2025 --only hosting

# Verificar status de deployment
firebase hosting:channel:list --project green-force-pwa-2025

# Ver logs de GitHub Actions
# https://github.com/lfalzatel/SchoolPage/actions
```
