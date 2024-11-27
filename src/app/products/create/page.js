"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const CreateProduct = () => {
  const router = useRouter();
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryID: '',
    subcategoryID: '',
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

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

        const roleResponse = await fetch(`/api/roles/${roleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          if (roleData.permissions.includes('create')) {
            setHasPermission(true);
            await loadCategories();
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
      const response = await fetch('/api/categories/list', {
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

  const loadSubCategories = async (categoryID) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/categories/${categoryID}/subCategories/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubCategories(data.subCategories);
      } else {
        setError('Error al cargar las subcategorías.');
      }
    } catch (error) {
      setError('Error al cargar las subcategorías.');
    }
  };

  const handleCategoryChange = (e) => {
    const categoryID = e.target.value;
    setProductData({ ...productData, categoryID, subcategoryID: '' });
    if (categoryID) {
      loadSubCategories(categoryID);
    } else {
      setSubCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductData({ ...productData, images: files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productData.name.trim()) {
      setError('Por favor, ingresa un nombre válido para el producto.');
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

    if (!productData.price || isNaN(productData.price)) {
      setError('Por favor, ingresa un precio válido.');
      return;
    }

    if (!productData.stockQuantity || isNaN(productData.stockQuantity)) {
      setError('Por favor, ingresa una cantidad de stock válida.');
      return;
    }

    const token = await auth.currentUser.getIdToken();

    // Manejo de subida de imágenes (opcional)
    let imageUrls = [];
    if (productData.images.length > 0) {
      // Subir imágenes al almacenamiento y obtener URLs
      // Aquí puedes implementar la lógica para subir imágenes a Firebase Storage
      // y obtener las URLs para guardarlas en Firestore
    }

    const response = await fetch('/api/products/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...productData,
        images: imageUrls, // Usar las URLs obtenidas después de subir las imágenes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message);
    } else {
      alert("Producto creado correctamente");
      router.push('/profile');
    }
  };

  if (!hasPermission) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl mb-4">Crear Nuevo Producto</h2>
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

        {/* Descripción */}
        <div className="mb-4">
          <label className="block mb-1">Descripción</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Precio */}
        <div className="mb-4">
          <label className="block mb-1">Precio</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Cantidad en Stock */}
        <div className="mb-4">
          <label className="block mb-1">Cantidad en Stock</label>
          <input
            type="number"
            name="stockQuantity"
            value={productData.stockQuantity}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Categoría */}
        <div className="mb-4">
          <label className="block mb-1">Categoría</label>
          <select
            name="categoryID"
            value={productData.categoryID}
            onChange={handleCategoryChange}
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
            {subCategories.map((subCategory) => (
              <option key={subCategory.uniqueID} value={subCategory.uniqueID}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>

        {/* Imágenes */}
        <div className="mb-4">
          <label className="block mb-1">Imágenes del Producto</label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Crear Producto
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
