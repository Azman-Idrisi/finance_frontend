// import React, { useMemo } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';

// // Predefined categories and their colors
// const CATEGORIES = {
//   'Food & Dining': '#FF6B6B',
//   'Transportation': '#4ECDC4',
//   'Shopping': '#45B7D1',
//   'Entertainment': '#96CEB4',
//   'Healthcare': '#FFEEAD',
//   'Utilities': '#D4A5A5',
//   'Housing': '#9B597B',
//   'Income': '#4CAF50',
//   'Other': '#FFD93D'
// };

// interface Transaction {
//   _id: string;
//   amount: number;
//   description: string;
//   date: string;
//   category?: keyof typeof CATEGORIES;
// }

// interface ChartProps {
//   transactions: Transaction[];
// }

// const Charts = ({ transactions }: ChartProps) => {
//   // Calculate category-wise totals
//   const categoryData = useMemo(() => {
//     const categoryTotals = Object.keys(CATEGORIES).reduce((acc, category) => {
//       acc[category] = 0;
//       return acc;
//     }, {} as Record<string, number>);

//     transactions.forEach(transaction => {
//       // For expenses (negative amounts), categorize them
//       if (transaction.amount < 0) {
//         // Simple category detection based on keywords
//         const amount = Math.abs(transaction.amount);
//         const description = transaction.description.toLowerCase();

//         if (description.toLowerCase().includes('food') || description.toLowerCase().includes('restaurant') || description.toLowerCase().includes('grocery')) {
//           categoryTotals['Food & Dining'] += amount;
//         } else if (description.toLowerCase().includes('gas') || description.toLowerCase().includes('transport') || description.toLowerCase().includes('uber')) {
//           categoryTotals['Transportation'] += amount;
//         } else if (description.toLowerCase().includes('shopping') || description.toLowerCase().includes('amazon')) {
//           categoryTotals['Shopping'] += amount;
//         } else if (description.toLowerCase().includes('movie') || description.toLowerCase().includes('entertainment')) {
//           categoryTotals['Entertainment'] += amount;
//         } else if (description.toLowerCase().includes('doctor') || description.toLowerCase().includes('medical')) {
//           categoryTotals['Healthcare'] += amount;
//         } else if (description.toLowerCase().includes('electricity') || description.toLowerCase().includes('water') || description.toLowerCase().includes('bill')) {
//           categoryTotals['Utilities'] += amount;
//         } else if (description.toLowerCase().includes('rent') || description.toLowerCase().includes('mortgage')) {
//           categoryTotals['Housing'] += amount;
//         } else {
//           categoryTotals['Other'] += amount;
//         }
//       } else {
//         // For positive amounts (income)
//         categoryTotals['Income'] += transaction.amount;
//       }
//     });

//     // Convert to array format for PieChart
//     return Object.entries(categoryTotals)
//       .filter(([_, value]) => value > 0)
//       .map(([name, value]) => ({
//         name,
//         value: Number(value.toFixed(2))
//       }));
//   }, [transactions]);

//   // Calculate total expenses (excluding income)
//   const totalExpenses = useMemo(() => {
//     return transactions
//       .filter(t => t.amount < 0)
//       .reduce((sum, t) => sum + Math.abs(t.amount), 0);
//   }, [transactions]);

//   // Find top spending categories
//   const topCategories = useMemo(() => {
//     return categoryData
//       .filter(cat => cat.name !== 'Income')
//       .sort((a, b) => b.value - a.value)
//       .slice(0, 3);
//   }, [categoryData]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//       {/* Expense Analysis Card */}
//       <Card className="col-span-1">
//         <CardHeader>
//           <CardTitle>Expense Analysis</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={categoryData.filter(cat => cat.name !== 'Income')}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={80}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {categoryData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={CATEGORIES[entry.name as keyof typeof CATEGORIES]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   formatter={(value: number) => `$${value.toFixed(2)}`}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="flex flex-wrap gap-2 mt-4">
//             {Object.entries(CATEGORIES).map(([category, color]) => (
//               <Badge
//                 key={category}
//                 className="flex items-center gap-1"
//                 style={{ backgroundColor: color, color: '#000' }}
//               >
//                 {category}
//               </Badge>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Spending Summary Card */}
//       <Card className="col-span-1">
//         <CardHeader>
//           <CardTitle>Spending Summary</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             <div>
//               <p className="text-sm font-medium">Total Expenses</p>
//               <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
//             </div>

//             <div>
//               <p className="text-sm font-medium mb-4">Top Spending Categories</p>
//               <div className="space-y-4">
//                 {topCategories.map((category, index) => (
//                   <div key={category.name} className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-3 h-3 rounded-full"
//                         style={{ backgroundColor: CATEGORIES[category.name as keyof typeof CATEGORIES] }}
//                       />
//                       <span className="text-sm">{category.name}</span>
//                     </div>
//                     <span className="font-medium">${category.value.toFixed(2)}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <p className="text-sm font-medium mb-2">Category Distribution</p>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 {categoryData
//                   .filter(cat => cat.name !== 'Income')
//                   .map((category, index) => (
//                     <div
//                       key={category.name}
//                       className="h-full rounded-full"
//                       style={{
//                         width: `${(category.value / totalExpenses) * 100}%`,
//                         backgroundColor: CATEGORIES[category.name as keyof typeof CATEGORIES],
//                         marginLeft: index === 0 ? '0' : '-2px'
//                       }}
//                     />
//                   ))}
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Charts;

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Predefined categories and their colors
const CATEGORIES = {
  "Food & Dining": "#FF6B6B",
  Transportation: "#4ECDC4",
  Shopping: "#45B7D1",
  Entertainment: "#96CEB4",
  Healthcare: "#FFEEAD",
  Utilities: "#D4A5A5",
  Housing: "#9B597B",
  Income: "#4CAF50",
  Other: "#FFD93D",
};

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category?: keyof typeof CATEGORIES;
}

interface ChartProps {
  transactions: Transaction[];
}

const Charts = ({ transactions }: ChartProps) => {
  // Calculate category-wise totals
  const categoryData = useMemo(() => {
    const categoryTotals = Object.keys(CATEGORIES).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<string, number>);

    transactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        const amount = Math.abs(transaction.amount);
        const description = transaction.description.toLowerCase();

        if (
          /food|restaurant|grocery|meal|cafe|dining|supermarket|bakery|snack|fast food|lunch|dinner/i.test(
            description
          )
        ) {
          categoryTotals["Food & Dining"] += amount;
        } else if (
          /gas|transport|uber|taxi|bus|train|subway|metro|cab|fuel|ride|commute|car rental/i.test(
            description
          )
        ) {
          categoryTotals["Transportation"] += amount;
        } else if (
          /shopping|amazon|mall|store|boutique|retail|clothing|fashion|accessories|electronics/i.test(
            description
          )
        ) {
          categoryTotals["Shopping"] += amount;
        } else if (
          /movie|entertainment|concert|theater|festival|music|game|event|cinema|show/i.test(
            description
          )
        ) {
          categoryTotals["Entertainment"] += amount;
        } else if (
          /doctor|medical|hospital|clinic|pharmacy|medication|dentist|treatment|healthcare|prescription/i.test(
            description
          )
        ) {
          categoryTotals["Healthcare"] += amount;
        } else if (
          /electricity|water|bill|internet|cable|wifi|phone|utility|gas bill|subscription/i.test(
            description
          )
        ) {
          categoryTotals["Utilities"] += amount;
        } else if (
          /rent|mortgage|housing|apartment|lease|home loan|property tax|real estate/i.test(
            description
          )
        ) {
          categoryTotals["Housing"] += amount;
        } else if (
          /salary|income|paycheck|wages|bonus|commission|freelance|earnings|profit/i.test(
            description
          )
        ) {
          categoryTotals["Housing"] += amount;
        } else {
          categoryTotals["Other"] += amount;
        }
      } else {
        categoryTotals["Income"] += transaction.amount;
      }
    });

    return Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }));
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const topCategories = useMemo(() => {
    return categoryData
      .filter((cat) => cat.name !== "Income")
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [categoryData]);

  // Filter out expense categories for the pie chart
  const expenseData = useMemo(
    () => categoryData.filter((cat) => cat.name !== "Income"),
    [categoryData]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Expense Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORIES[entry.name as keyof typeof CATEGORIES]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(CATEGORIES).map(([category, color]) => (
              <Badge
                key={category}
                className="flex items-center gap-1"
                style={{ backgroundColor: color, color: "#000" }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Spending Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-4">
                Top Spending Categories
              </p>
              <div className="space-y-4">
                {topCategories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORIES[
                              category.name as keyof typeof CATEGORIES
                            ],
                        }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="font-medium">
                      ${category.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Category Distribution</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                {expenseData.map((category, index) => (
                  <div
                    key={category.name}
                    className="h-full rounded-full"
                    style={{
                      width: `${(category.value / totalExpenses) * 100}%`,
                      backgroundColor:
                        CATEGORIES[category.name as keyof typeof CATEGORIES],
                      marginLeft: index === 0 ? "0" : "-2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Charts;
