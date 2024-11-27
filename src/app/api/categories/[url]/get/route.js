// src/app/api/categories/[url]/get/route.js
import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { url } = params; // Obtiene la propiedad url desde los parámetros

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken); // Verifica el token del usuario

    // Buscar la categoría por la propiedad url
    const categorySnapshot = await firestore.collection('categories')
      .where('url', '==', url) // Cambia a buscar por la propiedad url
      .limit(1) // Limitar a un solo resultado
      .get();

    if (categorySnapshot.empty) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    const categoryData = categorySnapshot.docs[0].data(); // Obtén los datos del primer documento encontrado

    // Devuelve solo la información necesaria (name y description)
    return NextResponse.json({
      name: categoryData.name,
      description: categoryData.description,
      url: categoryData.url,
    }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
