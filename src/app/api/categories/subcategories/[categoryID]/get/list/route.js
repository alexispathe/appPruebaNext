// src/app/api/categories/subCategories/[categoryID]/get/list/route.js
//DEVUELVE LA LISTA DE LA SUBCATEGORIA PARA CREAR EL PRODUCTO
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { categoryID } = params;

  try {
    // 1. Verificar que categoryID está presente y es una cadena válida
    if (!categoryID || typeof categoryID !== 'string') {
      return NextResponse.json(
        { message: 'ID de categoría inválido.' },
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

    // 3. Verificar que la categoría existe
    const categoryRef = firestore.collection('categories').doc(categoryID);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { message: 'Categoría no encontrada.' },
        { status: 404 }
      );
    }

    // 4. Obtener la referencia a la subcolección 'subCategories'
    const subcategoriesRef = categoryRef.collection('subCategories');

    const snapshot = await subcategoriesRef.get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: 'No se encontraron subcategorías para esta categoría.' },
        { status: 404 }
      );
    }

    // 5. Mapear los documentos a objetos de datos
    const subcategories = snapshot.docs.map(doc => ({
      uniqueID: doc.id,
      ...doc.data(),
    }));

    // 6. Responder con la lista de subcategorías
    return NextResponse.json(
      { subcategories },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener las subcategorías:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.', error: error.message },
      { status: 500 }
    );
  }
}
