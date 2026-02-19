// Copyright © Knoux. All rights reserved.
import { Text, type TextProps } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextComponent = Animated.createAnimatedComponent(Text);

interface AnimatedTextProps extends TextProps {
  children: string;
  animationDuration?: number;
}

/**
 * AnimatedText Component
 *
 * Provides smooth fade-in and fade-out animations for text content.
 * Useful for language switching and dynamic content updates.
 *
 * Usage:
 * ```tsx
 * <AnimatedText className="text-lg font-bold">
 *   {t.home.title}
 * </AnimatedText>
 * ```
 */
export function AnimatedText({
  children,
  animationDuration = 200,
  ...props
}: AnimatedTextProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Trigger animation when text changes
  useEffect(() => {
    opacity.value = withTiming(1, { duration: animationDuration });
  }, [children, animationDuration, opacity]);

  return (
    <AnimatedTextComponent style={animatedStyle} {...props}>
      {children}
    </AnimatedTextComponent>
  );
}
