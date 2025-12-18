import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';

export interface ImageResult {
  uri: string;
  fileName: string;
  type: string;
}

class CameraService {
  // Request camera permission (Android)
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message:
              'Uport needs access to your camera to upload grocery lists',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  // Open camera
  async openCamera(): Promise<ImageResult | null> {
    const hasPermission = await this.requestCameraPermission();

    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    return new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
        },
        response => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            reject(new Error(response.errorMessage || 'Camera error'));
          } else if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            resolve({
              uri: asset.uri || '',
              fileName: asset.fileName || 'image.jpg',
              type: asset.type || 'image/jpeg',
            });
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  // Open gallery
  async openGallery(): Promise<ImageResult | null> {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
        },
        response => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            reject(new Error(response.errorMessage || 'Gallery error'));
          } else if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            resolve({
              uri: asset.uri || '',
              fileName: asset.fileName || 'image.jpg',
              type: asset.type || 'image/jpeg',
            });
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  // Upload image to server
  async uploadImage(image: ImageResult, userId: number): Promise<any> {
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    } as any);
    formData.append('user_id', userId.toString());

    // You'll need to implement this endpoint in your API
    const response = await fetch(
      'https://uports.in/admin/api/v1/UploadGroceryList',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return await response.json();
  }
}

export default new CameraService();
