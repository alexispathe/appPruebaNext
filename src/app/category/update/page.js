// src/app/categories/[url]/update/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const UpdateCategory = ({ params }) => {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const { url } = params; // Captura el ID de la categoría desde los parámetros

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        checkUserPermissions(user.uid);
      }
    });
    return () => unsubscribe(); // Limpieza del suscriptor
  }, [router]);

  const checkUserPermissions = async (userId) => {
    const token = await auth.currentUser.getIdToken(); // Obtén el token del usuario
    const userResponse = await fetch(`/api/users/${userId}/get`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      const { roleId } = userData;

      // Verifica los permisos del rol correspondiente
      const roleResponse = await fetch(`/api/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        if (roleData.permissions.includes('update')) {
          setHasPermission(true);
          loadCategoryData(url); // Cargar datos de la categoría si tiene permiso
        } else {
          router.push('/not-found'); // Redirige si no tiene permiso
        }
      } else {
        setError('Error al obtener los permisos del rol.');
      }
    } else {
      setError('Error al obtener datos del usuario.');
    }
  };

  const loadCategoryData = async (url) => {
    const token = await auth.currentUser.getIdToken(); // Obtén el token del usuario
    const response = await fetch(`/api/categories/${url}/get`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setCategoryData({
        name: data.name,
        description: data.description || '',
      });
    } else {
      setError('Error al cargar la categoría.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryData.name.trim()) {
      setError('Por favor, ingresa un nombre válido para la categoría.');
      return;
    }

    const token = await auth.currentUser.getIdToken(); // Obtén el token del usuario
    const response = await fetch(`/api/categories/${url}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message);
    } else {
      alert("Categoría actualizada correctamente");
      router.push('/profile'); // Redirige al perfil después de la actualización
    }
  };

  if (!hasPermission) return null; // No renderizar nada si no tiene permisos

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Actualizar Categoría</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nombre de la Categoría</label>
          <input
            type="text"
            name="name"
            value={categoryData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Descripción (opcional)</label>
          <textarea
            name="description"
            value={categoryData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Actualizar Categoría
        </button>
      </form>
    </div>
  );
};

export default UpdateCategory;
