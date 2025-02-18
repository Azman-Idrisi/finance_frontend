import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Settings,
} from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

interface BudgetCategory {
  category: string;
  budget: number;
  color: string;
}

const DEFAULT_BUDGETS: BudgetCategory[] = [
  { category: "Food & Dining", budget: 500, color: "#FF6B6B" },
  { category: "Transportation", budget: 300, color: "#4ECDC4" },
  { category: "Shopping", budget: 400, color: "#45B7D1" },
  { category: "Entertainment", budget: 200, color: "#96CEB4" },
  { category: "Healthcare", budget: 200, color: "#FFEEAD" },
  { category: "Utilities", budget: 300, color: "#D4A5A5" },
  { category: "Housing", budget: 1200, color: "#9B597B" },
  { category: "Other", budget: 200, color: "#FFD93D" },
];

const categorizeTransaction = (description: string): string => {
  const lowerDesc = description.toLowerCase(); // Convert to lowercase for case-insensitive matching

  if (
    /food|restaurant|grocery|Food & Dining|meal|cafe|dining|supermarket|bakery|snack|fast food|lunch|dinner/i.test(
      lowerDesc
    )
  )
    return "Food & Dining";

  if (
    /gas|transport|uber|taxi|Transportation|bus|train|subway|metro|cab|fuel|ride|commute|car rental/i.test(
      lowerDesc
    )
  )
    return "Transportation";

  if (
    /shopping|amazon|mall|store|boutique|retail|clothing|fashion|accessories|electronics/i.test(
      lowerDesc
    )
  )
    return "Shopping";

  if (
    /movie|entertainment|concert|theater|festival|music|game|event|cinema|show/i.test(
      lowerDesc
    )
  )
    return "Entertainment";

  if (
    /doctor|medical|hospital|Healthcare|clinic|pharmacy|medication|dentist|treatment|healthcare|prescription/i.test(
      lowerDesc
    )
  )
    return "Healthcare";

  if (
    /electricity|water|bill|internet|cable|wifi|Utilities|phone|utility|gas bill|subscription/i.test(
      lowerDesc
    )
  )
    return "Utilities";

  if (
    /rent|mortgage|housing|House|apartment|lease|home loan|property tax|real estate/i.test(
      lowerDesc
    )
  )
    return "Housing";

  if (
    /salary|income|paycheck|wages|bonus|commission|freelance|earnings|profit/i.test(
      lowerDesc
    )
  )
    return "Income";

  return "Other";
};

const BudgetSettingsDialog = ({
  budgets,
  onSave,
}: {
  budgets: BudgetCategory[];
  onSave: (newBudgets: BudgetCategory[]) => void;
}) => {
  const [tempBudgets, setTempBudgets] = useState<BudgetCategory[]>(budgets);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave(tempBudgets);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Budget Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Category Budgets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {tempBudgets.map((category, index) => (
            <div key={category.category} className="flex items-center gap-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <Label className="flex-1">{category.category}</Label>
              <Input
                type="number"
                value={category.budget}
                onChange={(e) => {
                  const newBudgets = [...tempBudgets];
                  newBudgets[index].budget = Number(e.target.value);
                  setTempBudgets(newBudgets);
                }}
                className="max-w-[150px]"
                min="0"
                step="10"
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full mt-4">
            Save Budgets
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BudgetTracker = ({ transactions }: { transactions: Transaction[] }) => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const savedBudgets = localStorage.getItem("categoryBudgets");
    return savedBudgets ? JSON.parse(savedBudgets) : DEFAULT_BUDGETS;
  });

  useEffect(() => {
    localStorage.setItem("categoryBudgets", JSON.stringify(budgets));
  }, [budgets]);

  const currentSpending = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        transaction.amount < 0
      );
    });

    return budgets.map((category) => {
      const spent = monthlyTransactions.reduce((total, transaction) => {
        if (
          categorizeTransaction(transaction.description) === category.category
        ) {
          return total + Math.abs(transaction.amount);
        }
        return total;
      }, 0);

      return {
        category: category.category,
        budget: category.budget,
        spent,
        remaining: category.budget - spent,
        color: category.color,
        percentageUsed: (spent / category.budget) * 100,
      };
    });
  }, [transactions, budgets]);

  const generateInsights = () => {
    const insights = [];

    const overBudget = currentSpending.filter((cat) => cat.spent > cat.budget);
    if (overBudget.length > 0) {
      insights.push({
        type: "warning",
        message: `Over budget in ${overBudget.length} categories: ${overBudget
          .map((cat) => cat.category)
          .join(", ")}`,
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      });
    }

    const nearLimit = currentSpending.filter(
      (cat) => cat.percentageUsed >= 80 && cat.percentageUsed < 100
    );
    if (nearLimit.length > 0) {
      insights.push({
        type: "info",
        message: `Approaching budget limit in: ${nearLimit
          .map((cat) => cat.category)
          .join(", ")}`,
        icon: <TrendingDown className="h-4 w-4 text-blue-500" />,
      });
    }

    const wellManaged = currentSpending.filter(
      (cat) => cat.percentageUsed <= 50 && cat.spent > 0
    );
    if (wellManaged.length > 0) {
      insights.push({
        type: "success",
        message: `Well managed spending in: ${wellManaged
          .map((cat) => cat.category)
          .join(", ")}`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    }

    return insights;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Budget vs Actual Spending</CardTitle>
            <BudgetSettingsDialog budgets={budgets} onSave={setBudgets} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentSpending}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="budget" fill="#82ca9d" name="Budget" />
                <Bar dataKey="spent" fill="#8884d8" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generateInsights().map((insight, index) => (
              <Alert key={index}>
                <div className="flex items-center gap-2">
                  {insight.icon}
                  <AlertDescription>{insight.message}</AlertDescription>
                </div>
              </Alert>
            ))}

            <div className="space-y-4 mt-6">
              {currentSpending.map((category) => (
                <div key={category.category}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">
                        {category.category}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ${category.spent.toFixed(2)} / ${category.budget}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(category.percentageUsed, 100)}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;
