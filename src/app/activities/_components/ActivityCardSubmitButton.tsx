"use client";

import type { FC } from "react";
import { Button } from "@/components/ui/button";

export const ActivityCardButton: FC = () => {
  return (
    <Button
      type="submit"
      className="bg-cyan-800"
      onClick={(e) => e.stopPropagation()}
    >
      記録する
    </Button>
  );
};
