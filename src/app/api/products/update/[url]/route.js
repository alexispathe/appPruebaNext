// src/app/api/products/update/[url]/route.js

import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';
import slugify from 'slugify';

// Función para generar el slug
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,      // Convierte a minúsculas
    strict: true,     // Elimina caracteres especiales
    locale: 'es',     // Maneja caracteres específicos del idioma español
  });
};

// Función para asegurar la unicidad del slug
const ensureUniqueSlug = async (slug, currentProductId) => {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existingProduct = await firestore
      .collection('products')
      .where('url', '==', uniqueSlug)
      .get();

    if (existingProduct.empty) {
      break; // El slug es único
    }

    // Verifica si el slug pertenece al mismo producto
    const productExists = existingProduct.docs.some(doc => doc.id === currentProductId);
    if (productExists) {
      break; // El slug pertenece al mismo producto, está bien
    }

    uniqueSlug = `${slug}-${counter}`;
    counter += 1;
  }

  return uniqueSlug;
};

export async function PUT(request, { params }) {
  const { url } = params;
  try {
    // 1. Verificar que url está presente y es una cadena válida
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { message: 'URL de producto inválida.' },
        { status: 400 }
      );
    }

    // 2. Obtener el token de autenticación desde los headers
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No autorizado.' },
        { status: 401 }
      );
    }

    const idToken = authorization.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(idToken);
    } catch (tokenError) {
      return NextResponse.json(
        { message: 'Token de autenticación inválido.' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // 3. Buscar el producto por su 'url'
    const productQuery = await firestore
      .collection('products')
      .where('url', '==', url)
      .limit(1)
      .get();

    if (productQuery.empty) {
      return NextResponse.json(
        { message: 'Producto no encontrado.' },
        { status: 404 }
      );
    }

    const productDoc = productQuery.docs[0];
    const productData = productDoc.data();

    // 4. Verificar que el usuario es el propietario del producto
    if (productData.ownerId !== userId) {
      return NextResponse.json(
        { message: 'No tienes permisos para actualizar este producto.' },
        { status: 403 }
      );
    }

    // 5. Obtener los datos de la solicitud
    const { name, description, price, stockQuantity, categoryID, subcategoryID, images } = await request.json();

    // 6. Validaciones básicas
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { message: 'Nombre del producto es obligatorio y debe ser una cadena de texto.' },
        { status: 400 }
      );
    }

    if (price === undefined || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { message: 'Precio es obligatorio y debe ser un número positivo.' },
        { status: 400 }
      );
    }

    if (stockQuantity === undefined || typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return NextResponse.json(
        { message: 'Cantidad de stock es obligatoria y debe ser un número no negativo.' },
        { status: 400 }
      );
    }

    if (!categoryID || typeof categoryID !== 'string') {
      return NextResponse.json(
        { message: 'ID de categoría es obligatorio y debe ser una cadena de texto.' },
        { status: 400 }
      );
    }

    if (!subcategoryID || typeof subcategoryID !== 'string') {
      return NextResponse.json(
        { message: 'ID de subcategoría es obligatorio y debe ser una cadena de texto.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { message: 'Las imágenes deben ser un arreglo de URLs.' },
        { status: 400 }
      );
    }

    // 7. Generar y asegurar la unicidad del nuevo slug si el nombre ha cambiado
    let newUrl = productData.url;
    if (name.trim() !== productData.name) {
      newUrl = generateSlug(name.trim());
      newUrl = await ensureUniqueSlug(newUrl, productDoc.id);
    }

    // 8. Preparar los datos actualizados
    const updatedData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      price,
      stockQuantity,
      categoryID: categoryID.trim(),
      subcategoryID: subcategoryID.trim(),
      images: images.map((img) => img.trim()),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
      url: newUrl,
    };

    // 9. Actualizar el documento en Firestore
    await firestore.collection('products').doc(productDoc.id).update(updatedData);

    return NextResponse.json(
      { message: 'Producto actualizado exitosamente.', uniqueID: productDoc.id, url: newUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.', error: error.message },
      { status: 500 }
    );
  }
}
