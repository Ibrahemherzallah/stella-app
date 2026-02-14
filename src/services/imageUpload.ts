import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function pickAndUploadImage() {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (res.canceled) return null;

  const uri = res.assets[0].uri;
  const blob = await (await fetch(uri)).blob();

  const filename = `items/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}