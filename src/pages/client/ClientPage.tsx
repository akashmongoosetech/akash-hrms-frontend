import React from "react";
import ClientTable from "../../components/client/ClientTable";

export default function ClientPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Clients</h1>
      <ClientTable />
    </div>
  );
}