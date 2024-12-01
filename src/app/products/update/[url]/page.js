// src/app/products/update/[url]/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth } from '../../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const UpdateProduct = () => {
  const router = useRouter();
  const params = useParams();
  const { url } = params; // Captura el parámetro 'url' de la ruta

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryID: '',
    subcategoryID: '',
    images: [''],
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url || typeof url !== 'string') {
      setError('URL de producto inválida.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        checkUserPermissions(user.uid);
      }
    });
    return () => unsubscribe(); // Limpieza del suscriptor
  }, [router, url]);

  const checkUserPermissions = async (userId) => {
    try {
      const token = await auth.currentUser.getIdToken(); // Obtén el token del usuario
      const userResponse = await fetch(`/api/users/${userId}/get`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Incluye el token en la cabecera
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario.');
      }

      const userData = await userResponse.json();
      const { roleId } = userData;

      // Verifica los permisos del rol correspondiente
      const roleResponse = await fetch(`/api/roles/get/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Incluye el token en la cabecera
        },
      });

      if (!roleResponse.ok) {
        throw new Error('Error al obtener los permisos del rol.');
      }

      const roleData = await roleResponse.json();
      // Verifica si el rol tiene el permiso 'update'
      if (roleData.permissions.includes('update')) {
        setHasPermission(true);
        await loadCategories(token);
        await loadProductData(url, token);
      } else {
        router.push('/not-found'); // Redirige si no tiene permiso
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadCategories = async (token) => {
    try {
      const response = await fetch('/api/categories/get/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las categorías.');
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadProductData = async (productUrl, token) => {
    try {
      const response = await fetch(`/api/products/get/${productUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar el producto.');
      }

      const data = await response.json();
      setProductData({
        name: data.name,
        description: data.description || '',
        price: data.price,
        stockQuantity: data.stockQuantity,
        categoryID: data.categoryID,
        subcategoryID: data.subcategoryID,
        images: data.images.length > 0 ? data.images : [''],
      });

      // Cargar las subcategorías basadas en la categoría del producto
      await loadSubcategories(data.categoryID, token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryID, token) => {
    try {
      const response = await fetch(`/api/categories/subCategories/${categoryID}/get/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar las subcategorías.');
      }

      const data = await response.json();
      setSubcategories(data.subcategories);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === 'images') {
      const images = [...productData.images];
      images[index] = value;
      setProductData({ ...productData, images });
    } else if (name === 'categoryID') {
      setProductData({ ...productData, categoryID: value, subcategoryID: '' });
      if (value) {
        loadSubcategories(value, auth.currentUser.getIdToken());
      } else {
        setSubcategories([]);
      }
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const addImageField = () => {
    setProductData({ ...productData, images: [...productData.images, ''] });
  };

  const removeImageField = (index) => {
    const images = [...productData.images];
    images.splice(index, 1);
    setProductData({ ...productData, images });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!productData.name.trim()) {
      setError('Por favor, ingresa un nombre válido para el producto.');
      return;
    }

    if (!productData.price || isNaN(productData.price) || Number(productData.price) <= 0) {
      setError('Por favor, ingresa un precio válido para el producto.');
      return;
    }

    if (!productData.stockQuantity || isNaN(productData.stockQuantity) || Number(productData.stockQuantity) < 0) {
      setError('Por favor, ingresa una cantidad de stock válida.');
      return;
    }

    if (!productData.categoryID) {
      setError('Por favor, selecciona una categoría.');
      return;
    }

    if (!productData.subcategoryID) {
      setError('Por favor, selecciona una subcategoría.');
      return;
    }

    // Filtrar imágenes vacías
    const images = productData.images.filter((img) => img.trim() !== '');

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/products/update/${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluye el token en la cabecera
        },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          price: Number(productData.price),
          stockQuantity: Number(productData.stockQuantity),
          categoryID: productData.categoryID,
          subcategoryID: productData.subcategoryID,
          images: images,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el producto.');
      }

      const responseData = await response.json();
      alert(`Producto actualizado correctamente. URL: ${responseData.url}`);
      router.push('/users/profile'); // Redirige al perfil o a la página deseada
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
        {error ? <p className="text-red-500 mb-2">{error}</p> : <p>Cargando...</p>}
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
        {error ? <p className="text-red-500 mb-2">{error}</p> : <p>Cargando...</p>}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Actualizar Producto</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Nombre del Producto */}
        <div className="mb-4">
          <label className="block mb-1">Nombre del Producto</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Descripción del Producto */}
        <div className="mb-4">
          <label className="block mb-1">Descripción Detallada</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Precio del Producto */}
        <div className="mb-4">
          <label className="block mb-1">Precio</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        {/* Cantidad de Stock */}
        <div className="mb-4">
          <label className="block mb-1">Cantidad en Inventario</label>
          <input
            type="number"
            name="stockQuantity"
            value={productData.stockQuantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min="0"
            step="1"
            required
          />
        </div>

        {/* Categoría */}
        <div className="mb-4">
          <label className="block mb-1">Categoría</label>
          <select
            name="categoryID"
            value={productData.categoryID}
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

        {/* Subcategoría */}
        {subcategories.length > 0 && (
          <div className="mb-4">
            <label className="block mb-1">Subcategoría</label>
            <select
              name="subcategoryID"
              value={productData.subcategoryID}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Selecciona una subcategoría</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.uniqueID} value={subcategory.uniqueID}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Imágenes del Producto */}
        <div className="mb-4">
          <label className="block mb-1">Imágenes del Producto</label>
          {productData.images.map((image, index) => (
            <div key={index} className="flex mb-2 items-center">
              <input
                type="text"
                name="images"
                value={image}
                onChange={(e) => handleChange(e, index)}
                className="w-full border px-3 py-2 rounded"
                placeholder="URL de la imagen"
                required
              />
              {productData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="ml-2 text-red-500"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 text-blue-500"
          >
            Añadir otra imagen
          </button>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Actualizar Producto
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
