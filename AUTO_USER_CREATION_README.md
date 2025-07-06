# Sistema de Autenticación Automática de Usuarios

Este sistema integra la conexión de wallets con Wagmi para crear automáticamente usuarios en el backend de WrapSell.

## Archivos Creados

### 1. `src/services/userService.ts`
Servicio para interactuar con la API del backend:
- `UserService.createUser()` - Crear nuevo usuario
- `UserService.getUser()` - Obtener usuario existente
- `UserService.createUserIfNotExists()` - Crear usuario solo si no existe

### 2. `src/hooks/useAutoUserCreation.ts`
Hook personalizado que:
- Detecta conexiones/desconexiones de wallet
- Crea automáticamente usuarios en el backend
- Maneja estados de carga y errores

### 3. `src/context/UserContext.tsx`
Contexto global que proporciona:
- `useUser()` - Contexto completo del usuario
- `useUserData()` - Solo datos del usuario
- `useIsAuthenticated()` - Estado de autenticación

### 4. `src/components/UserProfile.tsx`
Componente que muestra el estado del usuario conectado y el proceso de creación automática.

## Cómo Funciona

1. **Conexión de Wallet**: Cuando un usuario conecta su wallet con Wagmi
2. **Detección Automática**: El hook `useAutoUserCreation` detecta la conexión
3. **Verificación**: Se verifica si el usuario ya existe en la base de datos
4. **Creación**: Si no existe, se crea automáticamente usando `POST /users`
5. **Estado Global**: El usuario queda disponible en toda la aplicación

## Uso en Componentes

```tsx
import { useUser, useUserData, useIsAuthenticated } from '../context/UserContext';

// Obtener solo datos del usuario
function MyComponent() {
  const userData = useUserData();
  
  if (!userData) {
    return <div>Usuario no conectado</div>;
  }
  
  return <div>Hola {userData.wallet_address}</div>;
}

// Verificar autenticación
function ProtectedComponent() {
  const isAuthenticated = useIsAuthenticated();
  
  if (!isAuthenticated) {
    return <div>Acceso denegado</div>;
  }
  
  return <div>Contenido protegido</div>;
}

// Contexto completo
function FullComponent() {
  const { user, isLoading, error, refetch } = useUser();
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Usuario: {user?.wallet_address}</div>;
}
```

## Configuración Requerida

### Variables de Entorno (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_KEY=your_secret_key
```

### Backend
El backend debe tener el endpoint `POST /users` configurado según la documentación.

## Estados del Usuario

- **Desconectado**: No hay wallet conectada
- **Cargando**: Verificando/creando usuario
- **Autenticado**: Usuario existe en BD y wallet conectada
- **Error**: Problema en la creación/verificación

## Integración Automática

El sistema está integrado en:
- `context/index.tsx` - Provider principal
- `src/app/page.tsx` - Página principal con componente de demostración

Cada vez que un usuario conecte su wallet, automáticamente se ejecutará el proceso de creación/verificación de usuario sin intervención manual.
