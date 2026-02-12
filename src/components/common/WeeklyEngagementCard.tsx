import { Text, TouchableOpacity, View } from "react-native";
import { WeeklyCardData } from "../../types/WeeklyCardData";
import { Card, ProgressBar, useTheme } from "react-native-paper";

type Props = {
  data: WeeklyCardData;
  onPress: () => void;
};

export function WeeklyEngagementCard({ data, onPress }: Props) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
   <Card
   
      style={{
        borderRadius: 18,
        padding: 14,
        backgroundColor: theme.colors.surface,
      }}
    >
        <Card.Title
          title={data.label}
          subtitle={data.title}
          titleStyle={{ color: theme.colors.primary, fontWeight: "700" }}
        />

        <Card.Content>
          {data.description && (
            <Text style={{ marginBottom: 8 ,color: theme.colors.onSurfaceVariant }}>
              {data.description}
            </Text>
          )}

          {data.progress !== undefined && (
            <ProgressBar
              progress={data.progress}
              color={theme.colors.primary}
              style={{ height: 8, borderRadius: 6 }}
            />
          )}

     {(data.footerText || data.createdBy) && (
      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {data.footerText ? (
          <Text
            style={{
              color: theme.colors.primary,
              opacity: 0.7,
              fontSize: 12,
            }}
          >
            {data.footerText}
          </Text>
        ) : (
          <View />
        )}

        {data.createdBy && (
          <Text
            style={{
              color: theme.colors.primary,
              opacity: 0.7,
              fontSize: 12,
            }}
          >
            Created by {data.createdBy}
          </Text>
        )}
      </View>
    )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

