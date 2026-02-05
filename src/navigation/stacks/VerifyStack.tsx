import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper";


import VerificationLevelsScreen from "../../screens/Verify/VerificationLevelsScreen";

import PassportIntroScreen from "../../screens/Verify/PassportIntroScreen";
import PassportCaptureScreen from "../../screens/Verify/PassportCaptureScreen";

import LivenessIntroScreen from "../../screens/Verify/LivenessIntroScreen";
import LivenessCaptureScreen from "../../screens/Verify/LivenessCaptureScreen";

import ResidenceIntroScreen from "../../screens/Verify/ResidenceIntroScreen";
import ResidenceCaptureScreen from "../../screens/Verify/ResidenceCaptureScreen";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { tierHeaderRight } from "../headerOptions";



export type VerifyStackParamList = {
  VerificationLevels: undefined;

  PassportIntro: undefined;
  PassportCapture: undefined;

  LivenessIntro: undefined;
  LivenessCapture: undefined;

  ResidenceIntro: undefined;
  ResidenceCapture: undefined;
};

const Stack = createNativeStackNavigator<VerifyStackParamList>();


export default function VerifyStack({ navigation }: any) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
    
            ...(user
        ? tierHeaderRight({
            tier: user.verification_level,
            onPress: () =>
              navigation.navigate("Main", { screen: "Verify" }),
          })
        : {}),
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {/*Verification hub */}
      <Stack.Screen
        name="VerificationLevels"
        component={VerificationLevelsScreen}
        options={{
          title: "Verification",
          headerLeft: () => (
            <IconButton
              icon="menu"
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />

      {/* Passport */}
      <Stack.Screen
        name="PassportIntro"
        component={PassportIntroScreen}
        options={{
          title: "Citizen Verification",
        }}
      />
      <Stack.Screen
        name="PassportCapture"
        component={PassportCaptureScreen}
        options={{
          title: "Passport Verification",
        }}
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