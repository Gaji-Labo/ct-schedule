"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { error, reset } = props;
  return (
    <div>
      <p>{error.message}</p>
      <Button onClick={reset}>リトライ</Button>
    </div>
  );
}
