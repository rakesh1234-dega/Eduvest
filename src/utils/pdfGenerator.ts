import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export function generateMonthlyPDF(
  profile: any,
  transactions: any[],
  accounts: any[],
  budget: any
) {
  const doc = new jsPDF();
  const month = format(new Date(), "MMMM yyyy");

  // Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text("EduVest Monthly Report", 14, 22);

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated for ${profile?.display_name || "User"} - ${month}`, 14, 30);

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Financial Summary", 14, 45);

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Amount (INR)"]],
    body: [
      ["Total Income", `Rs. ${income.toLocaleString()}`],
      ["Total Expense", `Rs. ${expense.toLocaleString()}`],
      ["Monthly Budget Limit", budget ? `Rs. ${budget.amount.toLocaleString()}` : "Not Set"],
      ["Net Savings", `Rs. ${(income - expense).toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Account balances
  const accountsStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Account Balances", 14, accountsStartY);

  autoTable(doc, {
    startY: accountsStartY + 5,
    head: [["Account Name", "Type", "Balance"]],
    body: accounts.map(a => [a.name, a.type.toUpperCase(), `Rs. ${a.balance.toLocaleString()}`]),
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] } // Green
  });

  // AI Suggestions Mock
  const aiStartY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("AI Insights & Suggestions", 14, aiStartY);

  doc.setFontSize(10);
  doc.setTextColor(80);

  const insights = [];
  if (expense > (budget?.amount || income)) {
    insights.push("• You are currently exceeding your budget limit. Consider cutting down on non-essential categories.");
  } else {
    insights.push("• Great job staying under budget! You're building a strong savings habit.");
  }
  insights.push("• Most of your spending this month went towards routine expenses. Review your 'Food' category.");
  insights.push(`• As a Level ${profile?.level || 1} Saver, consistency is key!`);

  let currentY = aiStartY + 7;
  insights.forEach(insight => {
    doc.text(insight, 14, currentY);
    currentY += 7;
  });

  // Save PDF
  doc.save(`monthly_report_${month.replace(' ', '_').toLowerCase()}.pdf`);
}
