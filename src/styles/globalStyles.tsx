import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // ----- Screens -----
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

  // ----- Spacing -----
  mtSmall: { marginTop: 10 },
  mtMedium: { marginTop: 20 },
  mtLarge: { marginTop: 30 },

  mbSmall: { marginBottom: 10 },
  mbMedium: { marginBottom: 20 },
  mbLarge: { marginBottom: 30 },

  // ----- Error Text -----
  error: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
  },

  // ----- Typography helpers (no colors!) -----
  heading: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  subheading: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 14,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
  },
});