import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  PlusCircle,
  Trash2,
  PencilLine,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Charts from "./Charts";
import BudgetTracker from "./BudgetTracker";

// Types
interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  
}

interface TransactionStats {
  total: number;
  income: number;
  expenses: number;
}

const API_BASE_URL = "http://13.203.157.175:3000/";

const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
});

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("transactionsData", (data: Transaction[]) => {
      setTransactions(data);
    });

    socket.emit("getTransactions");

    return () => {
      socket.off("transactionsData");
    };
  }, []);

  const stats: TransactionStats = transactions.reduce(
    (acc, curr) => {
      const amount = Number(curr.amount);
      return {
        total: acc.total + amount,
        income: amount > 0 ? acc.income + amount : acc.income,
        expenses: amount < 0 ? acc.expenses + Math.abs(amount) : acc.expenses,
      };
    },
    { total: 0, income: 0, expenses: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = editingTransaction
      ? `${API_BASE_URL}/api/transactions/${editingTransaction._id}`
      : `${API_BASE_URL}/api/transactions`;

    const method = editingTransaction ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
      });
      setIsOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Error:", error);
      // Here you could add a toast notification for error feedback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      // Here you could add a toast notification for error feedback
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // First try to parse the date
      const date = parseISO(dateString);
      return format(date, "PPP");
    } catch (error) {
      // If parsing fails, return the original string
      console.error("Date parsing error:", error);
      return dateString;
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    try {
      // Ensure the date is in YYYY-MM-DD format for the input
      const date = new Date(transaction.date);
      const formattedDate = date.toISOString().split("T")[0];

      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: formattedDate,
        category: "",
      });
      setIsOpen(true);
    } catch (error) {
      console.error("Error formatting date:", error);
      // Fallback to original date string if parsing fails
      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
        category: "",
      });
      setIsOpen(true);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Financial Dashboard
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction
                    ? "Edit Transaction"
                    : "Add New Transaction"}
                </DialogTitle>
                <DialogDescription>
                  Enter the transaction details below : use - for spendings -
                  ex:-100
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="Enter amount (negative for expenses)"
                    required
                  />
                  
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? "Processing..."
                    : editingTransaction
                    ? "Update"
                    : "Add"}{" "}
                  Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(stats.total.toFixed(2))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${Number(stats.income.toFixed(2))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                ${Number(stats.expenses.toFixed(2))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Charts transactions={transactions} />
        <BudgetTracker transactions={transactions} />
        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A list of your recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...transactions]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`font-bold ${
                          transaction.amount > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(transaction)}
                      >
                        <PencilLine className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
