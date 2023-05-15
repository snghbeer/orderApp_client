import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { Camera, CameraResultType } from '@capacitor/camera';
import { isPlatform } from '@ionic/react';


const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  var imageUrl = image.webPath;

  // Can be set to the src of an image now
  const imageSrc = imageUrl;
  return imageSrc
}

const startScan = async () => {
  // Check camera permission
  // This is just a simple example, check out the better checks below
  await BarcodeScanner.checkPermission({ force: true });

  // make background of WebView transparent
  // note: if you are using ionic this might not be enough, check below
  BarcodeScanner.hideBackground();

  const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] }); // start scanning and wait for a result

  // if the result has content
  if (result.hasContent) {
    console.log(result.content); // log the raw scanned content
  }
};

const stopScan = () => {
  BarcodeScanner.showBackground();
  BarcodeScanner.stopScan();
};

const openCamera = async () => {
  if(isPlatform('ios')) await takePicture()
  else await startScan()
}

export default startScan;