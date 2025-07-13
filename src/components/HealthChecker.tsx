"use client";

import { Button } from "@/components/ui/button";

export default function HealthChecker() {
  const handleHealthCheck = async () => {
    try {
      const response = await fetch("/api/v1/health");
      const data = await response.json();
      console.log("Health Check Response:", data);
    } catch (error) {
      console.error("Health Check Error:", error);
    }
  };

  const handleDbHealthCheck = async () => {
    try {
      const response = await fetch("/api/v1/health/db");
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
