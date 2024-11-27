import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';

export async function GET(request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken);

    const categoriesSnapshot = await firestore.collection('categories').get();

    const categories = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uniqueID: data.uniqueID,
        name: data.name,
        description: data.description,
      };
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
