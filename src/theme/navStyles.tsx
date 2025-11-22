export const navColors = {
  bg: "#121212",
  surface: "#1e1e1e",
  border: "#2b2b2b",
  text: "#e0e0e0",
  muted: "#777",
  accent: "#90caf9",
};

export const stackScreenOptions = {
  headerStyle: { backgroundColor: navColors.surface },
  headerTintColor: navColors.text,
  headerTitleStyle: { fontWeight: "600" as const },
};

export const tabScreenOptions = {
  ...stackScreenOptions,
  tabBarStyle: {
    backgroundColor: navColors.surface,
    borderTopColor: navColors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarActiveTintColor: navColors.accent,
  tabBarInactiveTintColor: navColors.muted,
};