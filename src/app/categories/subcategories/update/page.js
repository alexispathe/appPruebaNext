"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const UpdateSubcategory = ({ params }) => {
  const router = useRouter();
  const [subcategoryData, setSubcategoryData] = useState({
    name: '',
    description: '',
    categoryID: '',
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  // const { categoryID, subcategoryID } = params;
  const categoryID = "gz5OxtBNgYM5E00v3f3E";
  const subCategoryID = "IR32Kg1QOl2KvtwUJVr7"


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        checkUserPermissions(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const checkUserPermissions = async (userId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const userResponse = await fetch(`/api/users/${userId}/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const { roleId } = userData;

        const roleResponse = await fetch(`/api/roles/get/${roleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          if (roleData.permissions.includes('update')) {
            setHasPermission(true);
            await loadCategories();
            await loadSubcategoryData(categoryID, subCategoryID);
          } else {
            router.push('/not-found');
          }
        } else {
          setError('Error al obtener los permisos del rol.');
        }
      } else {
        setError('Error al obtener datos del usuario.');
      }
    } catch (error) {
      setError('Error al verificar los permisos.');
    }
  };

  const loadCategories = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/categories/get/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        setError('Error al cargar las categorías.');
      }
    } catch (error) {
      setError('Error al cargar las categorías.');
    }
  };

  const loadSubcategoryData = async (categoryID, subCategoryID) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/categories/subCategories/get/${categoryID}/${subCategoryID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubcategoryData({
          name: data.name,
          description: data.description || '',
          categoryID: data.categoryID,
        });
      } else {
        setError('Error al cargar la subcategoría.');
      }
    } catch (error) {
      setError('Error al cargar la subcategoría.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubcategoryData({ ...subcategoryData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subcategoryData.name.trim()) {
      setError('Por favor, ingresa un nombre válido para la subcategoría.');
      return;
    }

    if (!subcategoryData.categoryID) {
      setError('Por favor, selecciona una categoría.');
      return;
    }

    const token = await auth.currentUser.getIdToken();
    const response = await fetch(`/api/categories/subCategories/update/${categoryID}/${subCategoryID}/route.js`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(subcategoryData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message);
    } else {
      alert("Subcategoría actualizada correctamente");
      router.push('/profile');
    }
  };

  if (!hasPermission) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Actualizar Subcategoría</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Nombre de la Subcategoría</label>
          <input
            type="text"
            name="name"
            value={subcategoryData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Descripción (opcional)</label>
          <textarea
            name="description"
            value={subcategoryData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Categoría</label>
          <select
            name="categoryID"
            value={subcategoryData.categoryID}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.uniqueID} value={category.uniqueID}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Actualizar Subcategoría
        </button>
      </form>
    </div>
  );
};

export default UpdateSubcategory;
