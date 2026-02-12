import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text, useTheme, Avatar } from "react-native-paper";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

type Props = {
  title: string;
  description?: string | null;
  icon?: string;
  onPress: () => void;
};

export function TopicCard({
  title,
  description,
  icon = "folder",
  onPress,
}: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {/* Leading icon */}
        <Avatar.Icon
          size={40}
          icon={icon}
          style={{
            backgroundColor: theme.colors.primaryContainer,
            marginRight: spacing.md,
          }}
          color={theme.colors.onPrimaryContainer}
        />

        {/* Text Section */}
        <View style={{ flex: 1 }}>
          <Text
            variant={typography.sectionTitle}
            style={{ color: theme.colors.onSurface }}
          >
            {title}
          </Text>

          {description && (
            <Text
              variant={typography.body}
              style={{
                color: theme.colors.onSurfaceVariant,
                marginTop: spacing.xs,
              }}
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
    padding: spacing.md,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
});