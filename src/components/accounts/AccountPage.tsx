import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import AccountTable from "./elements/AccountTable";
import AccountAddEditModal from "./elements/AccountAddEditModal";
import AccountViewModal from "./elements/AccountViewModal";
import PaymentTable from "./elements/PaymentTable";
import PaymentAddEditModal from "./elements/PaymentAddEditModal";
import PaymentViewModal from "./elements/PaymentViewModal";
import ExpenseTable from "./elements/ExpenseTable";
import ExpenseAddEditModal from "./elements/ExpenseAddEditModal";
import ExpenseViewModal from "./elements/ExpenseViewModal";
import { ReceiptText, ReceiptIndianRupee, WalletCards } from 'lucide-react';

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

interface Payment {
  _id: string;
  paymentId: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  reason: string;
  date: string;
  type: string;
  amount: number;
  createdAt: string;
}

interface Expense {
  _id: string;
  expenseId: string;
  item: string;
  orderBy: string;
  from: string;
  date: string;
  status: string;
  type: string;
  amount: number;
  createdAt: string;
}

export default function AccountPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Payment modal states
  const [showPaymentAddModal, setShowPaymentAddModal] = useState(false);
  const [showPaymentEditModal, setShowPaymentEditModal] = useState(false);
  const [showPaymentViewModal, setShowPaymentViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentRefreshTrigger, setPaymentRefreshTrigger] = useState(0);

  // Expense modal states
  const [showExpenseAddModal, setShowExpenseAddModal] = useState(false);
  const [showExpenseEditModal, setShowExpenseEditModal] = useState(false);
  const [showExpenseViewModal, setShowExpenseViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState(0);

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

  // Payment handlers
  const handlePaymentAdd = () => {
    setSelectedPayment(null);
    setShowPaymentAddModal(true);
  };

  const handlePaymentEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentEditModal(true);
  };

  const handlePaymentView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentViewModal(true);
  };

  const handlePaymentModalSuccess = () => {
    setPaymentRefreshTrigger(prev => prev + 1);
  };

  const closePaymentModals = () => {
    setShowPaymentAddModal(false);
    setShowPaymentEditModal(false);
    setShowPaymentViewModal(false);
    setSelectedPayment(null);
  };

  // Expense handlers
  const handleExpenseAdd = () => {
    setSelectedExpense(null);
    setShowExpenseAddModal(true);
  };

  const handleExpenseEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseEditModal(true);
  };

  const handleExpenseView = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseViewModal(true);
  };

  const handleExpenseModalSuccess = () => {
    setExpenseRefreshTrigger(prev => prev + 1);
  };

  const closeExpenseModals = () => {
    setShowExpenseAddModal(false);
    setShowExpenseEditModal(false);
    setShowExpenseViewModal(false);
    setSelectedExpense(null);
  };

  return (
    <div className="p-6">
      <Tabs defaultValue="invoice" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoice"><ReceiptText className="w-4 h-4" />&nbsp; Invoice</TabsTrigger>
          <TabsTrigger value="payments"><ReceiptIndianRupee className="w-4 h-4" />&nbsp; Payments</TabsTrigger>
          <TabsTrigger value="expenses"><WalletCards className="w-4 h-4"/>&nbsp; Expenses</TabsTrigger>
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
          <PaymentTable
            onAdd={handlePaymentAdd}
            onEdit={handlePaymentEdit}
            onView={handlePaymentView}
            key={paymentRefreshTrigger}
          />
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <ExpenseTable
            onAdd={handleExpenseAdd}
            onEdit={handleExpenseEdit}
            onView={handleExpenseView}
            key={expenseRefreshTrigger}
          />
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

      {/* Payment Modals */}
      <PaymentAddEditModal
        isOpen={showPaymentAddModal}
        onClose={closePaymentModals}
        onSuccess={handlePaymentModalSuccess}
      />

      <PaymentAddEditModal
        isOpen={showPaymentEditModal}
        onClose={closePaymentModals}
        onSuccess={handlePaymentModalSuccess}
        editingPayment={selectedPayment}
      />

      <PaymentViewModal
        isOpen={showPaymentViewModal}
        onClose={closePaymentModals}
        onEdit={handlePaymentEdit}
        payment={selectedPayment}
      />

      {/* Expense Modals */}
      <ExpenseAddEditModal
        isOpen={showExpenseAddModal}
        onClose={closeExpenseModals}
        onSuccess={handleExpenseModalSuccess}
      />

      <ExpenseAddEditModal
        isOpen={showExpenseEditModal}
        onClose={closeExpenseModals}
        onSuccess={handleExpenseModalSuccess}
        editingExpense={selectedExpense}
      />

      <ExpenseViewModal
        isOpen={showExpenseViewModal}
        onClose={closeExpenseModals}
        onEdit={handleExpenseEdit}
        expense={selectedExpense}
      />
    </div>
  );
}