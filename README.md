# 📱 Finanzas App - Documentación de Construcción y Exportación

Este documento detalla el proceso correcto para generar la compilación de producción (`.apk`) de la aplicación móvil "Finanzas" desde tu computadora local.

---

## 1. Configuración del Entorno (`.env`)

Para que la aplicación se compile apuntando a los servidores correctos, el sistema lee las variables de entorno en este orden de prioridad durante la exportación local en Gradle:

1. \`.env\` (Valor base por defecto, es el **más seguro** para compilar).
2. \`.env.production\` (Sobrescribe si se exporta la variable `NODE_ENV=production`).
3. \`.env.development\` (Usado solo para desarrollo cuando haces `npx expo start`).

**Acción recomendada antes de compilar:**
Asegúrate de que en el archivo \`.env\` general (en la raíz de la carpeta `app_movil`) esté declarada la variable de la API apuntando a produción:

```env
EXPO_PUBLIC_API_URL=https://proyecto-finanzas-finanzasbackend-sowei6-83ae4c-144-91-101-243.traefik.me/api
```

---

## 2. Generar el APK Localmente (Sin límites de Expo EAS)

Para explotar la RAM y CPU de tu propia máquina local en lugar de depender de servidores en la nube y sus tiempos de espera, utilizamos las herramientas nativas de Expo conectadas a Gradle.

Abre una terminal en la carpeta `app_movil` y sigue estos pasos:

### Paso 2.1: Precompilar el código nativo (Solo la primera vez)
```bash
npx expo prebuild -p android
```
*Esto generará la carpeta `android` con todo el esqueleto nativo (Java/Kotlin y C++) necesario para Android Studio.*

### Paso 2.2: Compilar el Release (El archivo `.apk`)
Entramos a la subcarpeta generada y lanzamos la compilación.
```bash
cd android
./gradlew assembleRelease
```
*(En Windows, si `./gradlew` da error, usa simplemente `gradlew assembleRelease`).*

Al terminar, la terminal mostrará un mensaje verde de `BUILD SUCCESSFUL`. Tu archivo instalable quedará guardado en:
`app_movil/android/app/build/outputs/apk/release/app-release.apk`

---

## 3. Ejecución en Desarrollo (VPN)

Si necesitas ejecutar el servidor de desarrollo mientras estás conectado a una VPN, utiliza el siguiente comando para asegurar que el empaquetador de React Native utilice la dirección IP correcta de la VPN:

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME="100.95.37.127"; npm run dev
```

---

## 4. Resolución de Errores Frecuentes

### ❌ Error: `ninja: error: Stat(...): Filename longer than 260 characters`
**Por qué ocurre:** Windows mantiene por defecto una regla antigua que impide manejar rutas de archivos excesivamente largas. Durante la compilación de C++ (react-native-reanimated, screens), las carpetas anidadas superan fácilmente estos 260 caracteres, corrompiendo el build en un 87% de progreso.

**🛡️ Solución Definitiva (Unidad Virtual en caché de consola):**
El truco más rápido si no quieres reiniciar la máquina, es crear una unidad virtual con la sintaxis de "substitute" apuntando directamente a tu proyecto, acortando inmediatamente la longitud base de la ruta.

Abre PowerShell en tu proyecto padre y ejecuta:
```powershell
# 1. Asigna la letra "Z:" a toda la ruta pesada
subst Z: E:\Programs_Installed\xampp\htdocs\finanzas

# 2. Salta a la nueva "unidad" ultracorta
Z:

# 3. Viaja a la subcarpeta de android e inicia el build
cd app_movil\android
./gradlew assembleRelease
```
*Si reinicias el PC, este atajo "Z:" desaparecerá limpiamente sin dañar tus archivos originales, ya que seguían físicamente alojados en "E:".*

**🛡️ Solución Alternativa (Permanente):**
Abre "PowerShell" como administrador y ejecuta esto para quitar el límite a nivel de núcleo de Windows (luego debes reiniciar tu equipo o VS Code):
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
git config --system core.longpaths true
```

---

## 5. Notas adicionales para el Despliegue iOS
Dado que el proceso actual detalla exportaciones de `.apk` para sistema Android, si quisieras exportar un archivo `.ipa` en el futuro, requerirás una máquina física o virtual ejecutando macOS con Xcode instalado, y ejecutar:
`npx expo prebuild -p ios` seguido de compilaciones con CocoaPods y Xcode.

