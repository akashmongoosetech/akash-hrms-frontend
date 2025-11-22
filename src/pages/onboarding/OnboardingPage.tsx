import React from "react";
import OnboardingTable from "@/components/onboarding/OnboardingTable";

export default function OnboardingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Onboarding Management</h1>
      <OnboardingTable />
    </div>
  );
}