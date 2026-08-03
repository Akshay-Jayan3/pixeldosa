import type { ComponentType } from "react";

import ButtonDemo from "@pixeldosa/ui/registry/button/button.demo";
import FieldDemo from "@pixeldosa/ui/registry/field/field.demo";
import GhostInputDemo from "@pixeldosa/ui/registry/ghost-input/ghost-input.demo";
import OverlayDemo from "@pixeldosa/ui/registry/overlay/overlay.demo";

/**
 * Maps a registry item name to its demo component.
 *
 * These are the real `.demo.tsx` files from `packages/ui`, imported — not copied.
 * Section 7 forbids hand-written preview snippets precisely so that a breaking
 * change to a component surfaces as a broken docs build instead of a stale page.
 *
 * Adding a component means adding one line here.
 */
export const demos: Record<string, ComponentType> = {
  button: ButtonDemo,
  field: FieldDemo,
  overlay: OverlayDemo,
  "ghost-input": GhostInputDemo,
};
