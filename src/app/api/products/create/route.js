import { NextResponse } from 'next/server';
import { firestore, verifyIdToken } from '../../../../libs/firebaseAdmin';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    const ownerId = decodedToken.uid;

    const {
      name,
      description,
      price,
      stockQuantity,
      categoryID,
      subcategoryID,
      images,
    } = await request.json();

    // Validaciones
    if (!name || !description || !price || !stockQuantity || !categoryID || !subcategoryID) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    // Generar URL única
    const randomTwoDigits = Math.floor(Math.random() * 90) + 10; // 10 to 99
    const url = `${name.trim().toLowerCase().replace(/\s+/g, '-')}-${randomTwoDigits}`;

    // Verificar si la categoría y subcategoría existen
    const categoryDocRef = firestore.collection('categories').doc(categoryID);
    const categoryDoc = await categoryDocRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ message: 'Categoría no encontrada.' }, { status: 404 });
    }

    const subCategoryDocRef = categoryDocRef.collection('subCategories').doc(subcategoryID);
    const subCategoryDoc = await subCategoryDocRef.get();
    if (!subCategoryDoc.exists) {
      return NextResponse.json({ message: 'Subcategoría no encontrada.' }, { status: 404 });
    }

    // Crear referencia al nuevo documento en la colección 'products'
    const productDocRef = firestore.collection('products').doc();

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      categoryID,
      subcategoryID,
      images: images || [],
      averageRating: 0,
      numReviews: 0,
      dateCreated: admin.firestore.FieldValue.serverTimestamp(),
      dateModified: admin.firestore.FieldValue.serverTimestamp(),
      uniqueID: productDocRef.id,
      ownerId,
      url,
    };

    await productDocRef.set(productData);

    return NextResponse.json({ message: 'Producto creado exitosamente.', uniqueID: productDocRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
