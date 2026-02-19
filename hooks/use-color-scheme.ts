// Copyright © Knoux. All rights reserved.
import { useThemeContext } from "@/lib/theme-provider";

export function useColorScheme() {
  return useThemeContext().colorScheme;
}
