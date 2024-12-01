// src/app/api/products/get/[url]/route.js

import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { url } = params;

  try {
    // 1. Verificar que 'url' está presente y es una cadena válida
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

    // 4. (Opcional) Verificar permisos específicos si es necesario
    // Por ejemplo, si solo propietarios pueden ver ciertos detalles
    // En este ejemplo, permitimos que cualquier usuario autenticado vea el producto

    // 5. Responder con los datos del producto
    return NextResponse.json(
      {
        uniqueID: productDoc.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        categoryID: productData.categoryID,
        subcategoryID: productData.subcategoryID,
        images: productData.images,
        averageRating: productData.averageRating,
        numReviews: productData.numReviews,
        dateCreated: productData.dateCreated,
        dateModified: productData.dateModified,
        ownerId: productData.ownerId,
        url: productData.url,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.', error: error.message },
      { status: 500 }
    );
  }
}
