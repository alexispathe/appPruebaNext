import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { productID } = params;

  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken);

    // Referencia al documento del producto
    const productDocRef = firestore.collection('products').doc(productID);
    const productDoc = await productDocRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ message: 'Producto no encontrado.' }, { status: 404 });
    }

    const productData = productDoc.data();

    return NextResponse.json(productData, { status: 200 });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
