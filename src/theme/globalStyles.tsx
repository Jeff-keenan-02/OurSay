import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // ---------- SCREEN LAYOUT ----------
  // Removed backgroundColor! We will handle that in the component or Navigation
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  screenCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // ---------- SPACING HELPERS ----------
  // These are great, keep them!
  mtSmall: { marginTop: 10 },
  mtMedium: { marginTop: 20 },
  mtLarge: { marginTop: 30 },

  mbSmall: { marginBottom: 10 },
  mbMedium: { marginBottom: 20 },
  mbLarge: { marginBottom: 30 },

  // -----------------------------------------------------
  // CARDS (Material You inspired)
  // -----------------------------------------------------
  card: {
    width: "92%",
    alignSelf: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,          // Android shadow
  },

  // -----------------------------------------------------
  // BUTTONS (standard size)
  // -----------------------------------------------------
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  // Full-width button (forms / login)
  buttonFull: {
    width: "100%",
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
  },

  // -----------------------------------------------------
  // ERROR TEXT (consistent styling everywhere)
  // -----------------------------------------------------
  error: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },
  heading: {
  fontSize: 26,
  fontWeight: "700",
  color: "#e0e0e0",
  textAlign: "center",
  marginBottom: 10,
},

subheading: {
  fontSize: 14,
  color: "#b0b0b0",
  textAlign: "center",
  marginBottom: 20,
  opacity: 0.9,
},

sectionTitle: {
  fontSize: 20,
  fontWeight: "600",
  color: "#e0e0e0",
  marginBottom: 14,
},

text: {
  color: "#c2c2c2",
  fontSize: 15,
  lineHeight: 22,
},

});


// REMOVE 'card', 'input', 'textPrimary', 'button' styles.
// Why? Because React Native Paper components (<Card>, <Button>, <TextInput>)
// already have these styles built-in and linked to your theme.
// Doubling up makes the code messy.