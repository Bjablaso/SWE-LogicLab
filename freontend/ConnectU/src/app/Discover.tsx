import { SafeAreaView } from "react-native-safe-area-context";

import ApiEventDiscovery from "@/component/ApiEventDiscovery";

export default function Discover() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ApiEventDiscovery />
    </SafeAreaView>
  );
}
