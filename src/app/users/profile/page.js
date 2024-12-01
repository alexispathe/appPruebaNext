// src/app/users/profile/page.js
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { auth } from '../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe(); // Limpieza del suscriptor
  }, [router]);

  const navigateToCreateRole = () => {
    router.push('/roles/create');
  };
  const navigateToEditProfile = () => {
    router.push('/profile/edit'); // Redirige a la página de edición del perfil
  };
  const navigateToCreateCategory = () => {
    router.push('/categories/create'); // Redirige a la página de edición del perfil
  };
  const navigateToUpdateCategory = () => {
    router.push('/categories/update/'); // Redirige a la página de edición del perfil
  };

  const navigateToCreateSubCategory = () => {
    router.push('/categories/subCategories/create'); // Redirige a la página de edición del perfil
  };
  const navigateToUpdateSubCategory = () => {
    router.push('/categories/subCategories/update/'); // Redirige a la página de edición del perfil
  };

  const navigateToCreateProduct = () => {
    router.push('/products/create'); // Redirige a la página de edición del perfil
  };
  const navigateToUpdateProduct = () => {
    router.push('/products/update'); // Redirige a la página de edición del perfil
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login')
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
}
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-3xl mb-4">Perfil del Usuario</h1>
      {/* Aquí puedes mostrar información del usuario */}
      <button
        onClick={navigateToCreateRole}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Crear Nuevo Rol
      </button>
      <button
        onClick={navigateToCreateCategory}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Crear categoria
      </button>
      <button
        onClick={navigateToUpdateCategory}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Actualizar categoria
      </button>
      <button
        onClick={navigateToEditProfile}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Editar Perfil
      </button>
      
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Cerrar sesion
      </button>
      <button
        onClick={navigateToCreateSubCategory}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Crear sub categoria
      </button>
      <button
        onClick={navigateToUpdateSubCategory}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Actualizar sub categoria
      </button>
      <button
        onClick={navigateToCreateProduct}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Crear producto
      </button>
      <button
        onClick={navigateToUpdateProduct}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Actualizar producto
      </button>
    </div>
  );
}
