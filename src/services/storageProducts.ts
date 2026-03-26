import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';
import * as FileSystem from 'expo-file-system';

export const uploadProductImage = async (localUri: string) => {
  const fileExt = localUri.split('.').pop() || 'jpg';
  const fileName = `products/${Date.now()}.${fileExt}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, blob);

  return await getDownloadURL(storageRef);
};