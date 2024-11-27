"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../libs/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const ViewProduct = ({ params }) => {
  const router = useRouter();
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');
  const { productID } = params;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        loadProductData(productID);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadProductData = async (productID) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/products/${productID}/get`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProductData(data);
      } else {
        setError('Error al cargar el producto.');
      }
    } catch (error) {
      setError('Error al cargar el producto.');
    }
  };

  if (!productData) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-3xl mb-4">{productData.name}</h2>
      <p className="mb-4">{productData.description}</p>
      <p className="mb-2">Precio: ${productData.price}</p>
      <p className="mb-2">Stock: {productData.stockQuantity}</p>
      {/* Mostrar imágenes y otros detalles adicionales */}
    </div>
  );
};

export default ViewProduct;
