import { Text, useTheme } from "react-native-paper";
export function SectionTitle({ children }: { children: string }) {
  const theme = useTheme();

  return (
    <Text
      variant="titleMedium"
      style={{
        color: theme.colors.onSurface,
        marginTop: 20,
        marginBottom: 10,
        fontWeight: "600",
      }}
    >
      {children}
    </Text>
  );
}