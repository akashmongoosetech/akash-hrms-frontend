import React from "react";
import TicketTable from "../../components/ticket/TicketTable";

export default function TicketPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tickets</h1>
      <TicketTable />
    </div>
  );
}