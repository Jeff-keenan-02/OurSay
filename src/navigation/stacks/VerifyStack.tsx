import { createNativeStackNavigator } from "@react-navigation/native-stack";
import VerificationLevelsScreen from "../../screens/Verify/VerificationLevelsScreen";
import PassportIntroScreen from "../../screens/Verify/PassportIntroScreen";
import PassportCaptureScreen from "../../screens/Verify/PassportCaptureScreen";
import LivenessIntroScreen from "../../screens/Verify/LivenessIntroScreen";
import LivenessCaptureScreen from "../../screens/Verify/LivenessCaptureScreen";
import ResidenceIntroScreen from "../../screens/Verify/ResidenceIntroScreen";
import ResidenceCaptureScreen from "../../screens/Verify/ResidenceCaptureScreen";



const Stack = createNativeStackNavigator();

export default function VerifyStack() {
  return (
    <Stack.Navigator
      screenOptions={{        
        headerShown: false,
      }}
    >
      {/*Verification hub */}
      <Stack.Screen
        name="VerificationLevels"
        component={VerificationLevelsScreen}
      />

      {/* Passport */}
      <Stack.Screen
        name="PassportIntro"
        component={PassportIntroScreen}
      />
      <Stack.Screen
        name="PassportCapture"
        component={PassportCaptureScreen}
      />
         {/* Liveness */}
      <Stack.Screen 
      name="LivenessIntro" 
      component={LivenessIntroScreen} 
      />

      <Stack.Screen 
      name="LivenessCapture" 
      component={LivenessCaptureScreen} 
      />

      {/* Residence */}
      <Stack.Screen 
      name="ResidenceIntro" 
      component={ResidenceIntroScreen} />

      <Stack.Screen 
      name="ResidenceCapture" 
      component={ResidenceCaptureScreen} 
      />

    </Stack.Navigator>
  );
}