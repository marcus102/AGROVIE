import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';

export const uploadImage = async (
  uri: string,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `missions/${userId}/${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) throw error;
    return filePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
