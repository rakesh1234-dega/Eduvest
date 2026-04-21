/**
 * Budget Analysis Engine
 * Provides rule-based manual insights and suggestions for monthly review
 */

export interface BudgetReviewInsight {
  type: "warning" | "success" | "info";
  title: string;
  message: string;
}

export function generateMonthlyReview(
  totalBudget: number,
  totalSpent: number,
  savingsGoal: number,
  transactions: any[]
): BudgetReviewInsight[] {
  const insights: BudgetReviewInsight[] = [];
  const percentUsed = (totalSpent / totalBudget) * 100;
  const remaining = totalBudget - totalSpent;

  // 1. Overall logic
  if (percentUsed >= 100) {
    insights.push({
      type: "warning",
      title: "Budget Exceeded",
      message: `You went over your monthly limit by ₹${Math.abs(remaining).toLocaleString()}. Consider reviewing the 'Smart Daily Planner' to enforce stricter daily limits next month.`
    });
  } else if (percentUsed >= 90) {
    insights.push({
      type: "warning",
      title: "Nearing Limit",
      message: "You are extremely close to your spending ceiling. Cut discretionary spending (like eating out) immediately."
    });
  } else if (percentUsed < 60) {
    insights.push({
      type: "success",
      title: "Excellent Control",
      message: "You used less than 60% of your budget! You can safely allocate the extra funds to your savings or investments."
    });
  }

  // 2. Savings logic
  if (savingsGoal > 0) {
    const projectedSavings = Math.max(0, remaining);
    if (projectedSavings >= savingsGoal) {
      insights.push({
        type: "success",
        title: "Savings Goal Achieved",
        message: `Great job hitting your ₹${savingsGoal} target! You successfully stored surplus cash.`
      });
    } else {
      insights.push({
        type: "info",
        title: "Savings Missed",
        message: `You missed your savings goal by ₹${(savingsGoal - projectedSavings).toLocaleString()}. Suggestion: Lower your daily focus on 'Food' and 'Transport' to recover this margin.`
      });
    }
  }

  // 3. Category logic based on manual aggregation
  const categories = transactions.reduce((acc, t) => {
    if (t.type === "expense") {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  let topCategory = null;
  let maxSpend = 0;

  for (const [cat, amt] of Object.entries(categories)) {
    if ((amt as number) > maxSpend) {
      maxSpend = amt as number;
      topCategory = cat;
    }
  }

  if (topCategory && maxSpend > (totalBudget * 0.4)) {
    insights.push({
      type: "warning",
      title: "High Category Spend",
      message: `More than 40% of your budget was spent on ${topCategory}. Try to adjust your routine scheduling next month to reduce limits in this category.`
    });
  }

  // General filler insight if array is small
  if (insights.length < 3) {
    insights.push({
      type: "info",
      title: "Routine Adjustment",
      message: "Regularly update your 'Smart Daily Schedule' with accurate mode of transport and meal plans to automatically keep spending down."
    });
  }

  return insights;
}
