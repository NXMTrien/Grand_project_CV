import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { colors } from "@/src/components/ui";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: { height: 62, paddingTop: 6, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tìm việc",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "magnifyingglass", android: "search", web: "search" }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumes"
        options={{
          title: "CV của tôi",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "doc.text", android: "description", web: "description" }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "person.crop.circle", android: "account_circle", web: "account_circle" }} tintColor={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
