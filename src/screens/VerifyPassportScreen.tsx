import React from 'react';
import { View, Button } from 'react-native';
import Onfido, { OnfidoCaptureType, OnfidoDocumentType} from '@onfido/react-native-sdk';

export default function VerifyPassportScreen() {

//   const startVerification = () => {
//     Onfido.start({
//       sdkToken: "REPLACE_THIS_WITH_YOUR_SDK_TOKEN",
//       flowSteps: {
//         captureDocument: {
//           docType: OnfidoDocumentType.PASSPORT,
//         },
//         captureFace: {
//         type: OnfidoCaptureType.VIDEO,
//         },
//       },
//     })
//     .then(result => {
//       console.log("✅ Verification completed:", result);
//     })
//     .catch(err => {
//       console.log("❌ Verification cancelled or failed:", err);
//     });
//   };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* <Button title="Start Passport Verification" onPress={startVerification} /> */}
    </View>
  );
}