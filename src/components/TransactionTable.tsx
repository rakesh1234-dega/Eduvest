import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRightLeft
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { useBulkDeleteTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import type { Transaction } from "@/hooks/use-transactions";

const ITEMS_PER_PAGE = 10;

export function TransactionTable({ transactions, isLoading, headerAction }: { transactions: any[], isLoading: boolean, headerAction?: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const bulkDeleteTx = useBulkDeleteTransactions();
  const deleteTx = useDeleteTransaction();

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...(transactions || [])];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(searchLower) ||
          tx.categories?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type === typeFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = (a.categories?.name || "").localeCompare(b.categories?.name || "");
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field: string) => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length && paginatedTransactions.length > 0
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) return;
    await bulkDeleteTx.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-10 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                className="h-10 rounded-xl px-4"
                onClick={handleBulkDelete}
                disabled={bulkDeleteTx.isPending}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter !== "all") && (
            <Button
              variant="outline"
              className="h-10 w-10 p-0 rounded-xl"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {headerAction}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[50px] px-4">
                <Checkbox
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground hover:bg-muted/60 transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground hover:bg-muted/60 transition-colors hidden md:table-cell"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Account</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground hover:bg-muted/60 transition-colors text-right"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="text-center w-[100px] hidden sm:table-cell">Type</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/20 transition-colors group">
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.includes(tx.id)}
                      onCheckedChange={() => handleSelect(tx.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium whitespace-nowrap">
                    {format(new Date(tx.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {tx.description || tx.categories?.name || "Transaction"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell capitalize">
                    {tx.categories?.name ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent text-accent-foreground border max-w-[120px] truncate block">
                        {tx.categories.name}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {tx.accounts?.name || "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-bold tabular-nums whitespace-nowrap",
                      tx.type === "expense" ? "text-rose-500" : tx.type === "income" ? "text-emerald-500" : "text-blue-500"
                    )}
                  >
                    {tx.type === "expense" ? "-" : tx.type === "income" ? "+" : ""}
                    ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge variant="outline" className={cn(
                      "capitalize text-[10px]",
                      tx.type === "expense" ? "text-rose-600 border-rose-200 bg-rose-50" :
                        tx.type === "income" ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
                          "text-blue-600 border-blue-200 bg-blue-50"
                    )}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer" onClick={() => deleteTx.mutate(tx.id)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4 text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
