"use client";

import { Button } from "@/components/ui/button";

export default function FirstCheckInButton() {
  const handleScrollToCheckIn = () => {
    document
      .getElementById("check-in-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button variant="default" onClick={handleScrollToCheckIn}>
      Complete Your First Check-in
    </Button>
  );
}
