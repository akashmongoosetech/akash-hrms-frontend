import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import AccountTable from "./elements/AccountTable";
import AccountAddEditModal from "./elements/AccountAddEditModal";
import AccountViewModal from "./elements/AccountViewModal";

interface Invoice {
  _id: string;
  invoiceNo: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
}

export default function AccountPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setSelectedInvoice(null);
    setShowAddModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="invoice" className="mt-6">
          <AccountTable
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            key={refreshTrigger}
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Payments Management</h2>
            <p className="text-gray-600">Manage your payments here.</p>
            {/* Add payments content here */}
          </div>
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Expenses Management</h2>
            <p className="text-gray-600">Manage your expenses here.</p>
            {/* Add expenses content here */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AccountAddEditModal
        isOpen={showAddModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />

      <AccountAddEditModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        editingInvoice={selectedInvoice}
      />

      <AccountViewModal
        isOpen={showViewModal}
        onClose={closeModals}
        onEdit={handleEdit}
        invoice={selectedInvoice}
      />
    </div>
  );
}