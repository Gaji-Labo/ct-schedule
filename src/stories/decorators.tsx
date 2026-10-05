import type { Decorator } from "@storybook/nextjs-vite";
import { Toaster } from "@/components/ui/sonner";

/** 操作後に toast を出すコンポーネント用。アプリの layout.tsx と同じ位置に Toaster を置く */
export const withToaster: Decorator = (Story) => (
  <>
    <Story />
    <Toaster position="top-center" />
  </>
);
