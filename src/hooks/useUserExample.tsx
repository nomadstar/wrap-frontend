// hooks/useUserExample.tsx
"use client";

import React from 'react';
import { useUser, useUserData, useIsAuthenticated } from '../context/UserContext';

// Ejemplo de cómo usar los hooks en diferentes componentes

export function ExampleComponentWithUserData() {
  // Obtener solo los datos del usuario
  const userData = useUserData();

  if (!userData) {
    return <div>Usuario no conectado</div>;
  }

  return (
    <div>
      <h3>Bienvenido {userData.wallet_address}</h3>
      <p>Tipo de wallet: {userData.wallet_type}</p>
    </div>
  );
}

export function ExampleComponentWithAuthentication() {
  // Verificar si está autenticado
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <div>Por favor conecta tu wallet</div>;
  }

  return <div>¡Usuario autenticado! Contenido protegido aquí</div>;
}

export function ExampleComponentWithFullUserContext() {
  // Obtener todo el contexto del usuario
  const { user, isLoading, error, isAuthenticated, refetch } = useUser();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error}
        <button onClick={refetch}>Reintentar</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <h3>Usuario: {user?.wallet_address}</h3>
      <button onClick={refetch}>Actualizar datos</button>
    </div>
  );
}
