"use client";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/rpc-client";

export default function HealthChecker() {
  const handleHealthCheck = async () => {
    try {
      const response = await (client as any).health.$get();
      const data = await response.json();
      console.log("Health Check Response:", data);
    } catch (error) {
      console.error("Health Check Error:", error);
    }
  };

  const handleDbHealthCheck = async () => {
    try {
      const response = await (client as any).health.db.$get();
      const data = await response.json();
      console.log("Health Check DB Response:", data);
    } catch (error) {
      console.error("Health Check DB Error:", error);
    }
  };

  return (
    <>
      <Button onClick={handleHealthCheck}>Healthcheck</Button>
      <Button onClick={handleDbHealthCheck}>DB Healthcheck</Button>
    </>
  );
}
