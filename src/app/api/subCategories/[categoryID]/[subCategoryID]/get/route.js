import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../../../libs/firebaseAdmin';

export async function GET(request, { params }) {
  const { categoryID, subCategoryID } = params;
  console.log(params)
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    await verifyIdToken(idToken);

    // Referencia al documento de la subcategoría
    const subcategoryDocRef = firestore
      .collection('categories')
      .doc(categoryID)
      .collection('subCategories')
      .doc(subCategoryID);
    const subcategoryDoc = await subcategoryDocRef.get();

    if (!subcategoryDoc.exists) {
      return NextResponse.json({ message: 'Subcategoría no encontrada.' }, { status: 404 });
    }

    const subcategoryData = subcategoryDoc.data();

    return NextResponse.json({
      name: subcategoryData.name,
      description: subcategoryData.description,
      categoryID: subcategoryData.categoryID,
      url: subcategoryData.url,
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener la subcategoría:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
