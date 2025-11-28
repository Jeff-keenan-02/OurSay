import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { typography } from "../../theme/typography";

type Props = {
  title: string;
 description?: string | null;
  icon?: string;
  onPress: () => void;
};

export function CategoryCard({ title, description, icon = "folder", onPress }: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        {/* Optional leading icon */}
        <Avatar.Icon
          size={40}
          icon={icon}
          style={{
            backgroundColor: theme.colors.primaryContainer,
            marginRight: 12,
          }}
          color={theme.colors.onPrimaryContainer}
        />

        {/* Text Section */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.title,
              { color: theme.colors.onSurface }
            ]}
          >
            {title}
          </Text>

          {description && (
            <Text
              style={[
                typography.body,
                { color: theme.colors.onSurfaceVariant, marginTop: 4 }
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
});