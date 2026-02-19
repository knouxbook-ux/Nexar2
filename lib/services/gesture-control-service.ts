// Copyright © Knoux. All rights reserved.
/**
 * GestureControlService - Gesture-based controls for recording and editing
 */

export type GestureType =
  | "swipe_left"
  | "swipe_right"
  | "swipe_up"
  | "swipe_down"
  | "pinch_in"
  | "pinch_out"
  | "double_tap"
  | "long_press"
  | "rotate";

export interface GestureAction {
  gesture: GestureType;
  action: string;
  description: string;
  enabled: boolean;
}

export interface GestureEvent {
  type: GestureType;
  timestamp: number;
  x: number;
  y: number;
  velocity?: number;
  scale?: number;
}

export interface GestureMapping {
  [key: string]: GestureAction;
}

class GestureControlServiceClass {
  private gestureMappings: GestureMapping = {
    swipe_left: {
      gesture: "swipe_left",
      action: "next_clip",
      description: "Go to next clip",
      enabled: true,
    },
    swipe_right: {
      gesture: "swipe_right",
      action: "previous_clip",
      description: "Go to previous clip",
      enabled: true,
    },
    swipe_up: {
      gesture: "swipe_up",
      action: "increase_volume",
      description: "Increase volume",
      enabled: true,
    },
    swipe_down: {
      gesture: "swipe_down",
      action: "decrease_volume",
      description: "Decrease volume",
      enabled: true,
    },
    pinch_in: {
      gesture: "pinch_in",
      action: "zoom_in",
      description: "Zoom in",
      enabled: true,
    },
    pinch_out: {
      gesture: "pinch_out",
      action: "zoom_out",
      description: "Zoom out",
      enabled: true,
    },
    double_tap: {
      gesture: "double_tap",
      action: "play_pause",
      description: "Play/Pause",
      enabled: true,
    },
    long_press: {
      gesture: "long_press",
      action: "show_menu",
      description: "Show context menu",
      enabled: true,
    },
    rotate: {
      gesture: "rotate",
      action: "rotate_clip",
      description: "Rotate clip",
      enabled: true,
    },
  };

  private listeners: Map<string, Function[]> = new Map();
  private gestureHistory: GestureEvent[] = [];

  registerGestureMapping(gesture: GestureType, action: string): void {
    if (this.gestureMappings[gesture]) {
      this.gestureMappings[gesture].action = action;
      this.emit("gestureMappingUpdated", { gesture, action });
    }
  }

  enableGesture(gesture: GestureType): void {
    if (this.gestureMappings[gesture]) {
      this.gestureMappings[gesture].enabled = true;
      this.emit("gestureEnabled", { gesture });
    }
  }

  disableGesture(gesture: GestureType): void {
    if (this.gestureMappings[gesture]) {
      this.gestureMappings[gesture].enabled = false;
      this.emit("gestureDisabled", { gesture });
    }
  }

  handleGestureEvent(event: GestureEvent): void {
    if (!this.gestureMappings[event.type]?.enabled) {
      return;
    }

    this.gestureHistory.push(event);

    // Keep only last 100 events
    if (this.gestureHistory.length > 100) {
      this.gestureHistory.shift();
    }

    const mapping = this.gestureMappings[event.type];

    this.emit("gestureDetected", {
      gesture: event.type,
      action: mapping.action,
      event,
    });

    // Execute the action
    this.executeGestureAction(mapping.action, event);
  }

  private executeGestureAction(action: string, event: GestureEvent): void {
    const actionMap: Record<string, Function> = {
      next_clip: () => this.emit("action:next_clip", event),
      previous_clip: () => this.emit("action:previous_clip", event),
      increase_volume: () => this.emit("action:increase_volume", event),
      decrease_volume: () => this.emit("action:decrease_volume", event),
      zoom_in: () => this.emit("action:zoom_in", { scale: event.scale }),
      zoom_out: () => this.emit("action:zoom_out", { scale: event.scale }),
      play_pause: () => this.emit("action:play_pause", event),
      show_menu: () => this.emit("action:show_menu", { x: event.x, y: event.y }),
      rotate_clip: () => this.emit("action:rotate_clip", { rotation: event.scale }),
    };

    const executor = actionMap[action];
    if (executor) {
      executor();
    }
  }

  getGestureMappings(): GestureMapping {
    return { ...this.gestureMappings };
  }

  getGestureHistory(limit: number = 20): GestureEvent[] {
    return this.gestureHistory.slice(-limit);
  }

  clearGestureHistory(): void {
    this.gestureHistory = [];
  }

  resetToDefaults(): void {
    this.gestureMappings = {
      swipe_left: {
        gesture: "swipe_left",
        action: "next_clip",
        description: "Go to next clip",
        enabled: true,
      },
      swipe_right: {
        gesture: "swipe_right",
        action: "previous_clip",
        description: "Go to previous clip",
        enabled: true,
      },
      swipe_up: {
        gesture: "swipe_up",
        action: "increase_volume",
        description: "Increase volume",
        enabled: true,
      },
      swipe_down: {
        gesture: "swipe_down",
        action: "decrease_volume",
        description: "Decrease volume",
        enabled: true,
      },
      pinch_in: {
        gesture: "pinch_in",
        action: "zoom_in",
        description: "Zoom in",
        enabled: true,
      },
      pinch_out: {
        gesture: "pinch_out",
        action: "zoom_out",
        description: "Zoom out",
        enabled: true,
      },
      double_tap: {
        gesture: "double_tap",
        action: "play_pause",
        description: "Play/Pause",
        enabled: true,
      },
      long_press: {
        gesture: "long_press",
        action: "show_menu",
        description: "Show context menu",
        enabled: true,
      },
      rotate: {
        gesture: "rotate",
        action: "rotate_clip",
        description: "Rotate clip",
        enabled: true,
      },
    };
    this.emit("gesturesReset", {});
  }

  on(event: string, cb: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Function): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) || []).filter((c) => c !== cb)
    );
  }

  private emit(event: string, data: any): void {
    (this.listeners.get(event) || []).forEach((cb) => cb(data));
  }
}

export const GestureControlService = new GestureControlServiceClass();
