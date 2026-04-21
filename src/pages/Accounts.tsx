import { useState } from "react";
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet, Trash2, Star, Banknote, Smartphone, CreditCard, Landmark, Pencil, X, Check } from "lucide-react";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];

const accountTypeConfig: Record<AccountType, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  cash:  { icon: Banknote,    label: "Cash",  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  upi:   { icon: Smartphone,  label: "UPI",   color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/30"  },
  card:  { icon: CreditCard,  label: "Card",  color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/30"      },
  bank:  { icon: Landmark,    label: "Bank",  color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/30"    },
};

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const updateAccount = useUpdateAccount();

  // Create dialog
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [balance, setBalance] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Edit state (inline per-card)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBalance, setEditBalance] = useState("");
  const [editType, setEditType] = useState<AccountType>("cash");
  const [editDefault, setEditDefault] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name) return;
    await createAccount.mutateAsync({ name, type, balance: parseFloat(balance) || 0, is_default: isDefault });
    setOpen(false);
    setName(""); setBalance(""); setIsDefault(false);
  };

  const startEdit = (acc: any) => {
    setEditingId(acc.id);
    setEditName(acc.name);
    setEditBalance(String(acc.balance));
    setEditType(acc.type);
    setEditDefault(acc.is_default);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName) return;
    await updateAccount.mutateAsync({
      id: editingId,
      name: editName,
      balance: parseFloat(editBalance) || 0,
      type: editType,
      is_default: editDefault,
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteAccount.mutateAsync(id);
    setDeletingId(null);
  };

  const totalBalance = accounts?.reduce((s, a) => s + a.balance, 0) || 0;

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground text-sm">Manage your money accounts — add, edit, or delete</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary gap-1 rounded-xl"><Plus className="h-4 w-4" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Account Name</Label>
                <Input placeholder="e.g. My Cash" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(accountTypeConfig).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2"><Icon className={`h-4 w-4 ${cfg.color}`} />{cfg.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Opening Balance (₹)</Label>
                <Input type="number" min="0" placeholder="0" value={balance} onChange={(e) => setBalance(e.target.value)} className="rounded-xl" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                <Label>Set as default account</Label>
              </div>
              <Button onClick={handleCreate} className="w-full gradient-primary rounded-xl" disabled={createAccount.isPending}>
                {createAccount.isPending ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Balance Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wide">Total Across All Accounts</p>
          <p className="text-3xl font-bold mt-1">₹{totalBalance.toLocaleString()}</p>
        </div>
        <Wallet className="h-10 w-10 text-white/30" />
      </div>

      {accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const cfg = accountTypeConfig[acc.type];
            const Icon = cfg.icon;
            const isEditing = editingId === acc.id;
            const isDeleting = deletingId === acc.id;

            return (
              <Card key={acc.id} className={cn(
                "rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200",
                isEditing && "ring-2 ring-indigo-500",
                isDeleting && "ring-2 ring-rose-500"
              )}>
                <CardContent className="p-5">
                  {isDeleting ? (
                    /* Delete Confirmation */
                    <div className="text-center space-y-3 py-2">
                      <Trash2 className="h-8 w-8 text-rose-500 mx-auto" />
                      <p className="text-sm font-semibold text-foreground">Delete "{acc.name}"?</p>
                      <p className="text-xs text-muted-foreground">This action cannot be undone. All transactions linked to this account will remain.</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setDeletingId(null)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1 rounded-lg" onClick={() => handleDelete(acc.id)} disabled={deleteAccount.isPending}>
                          {deleteAccount.isPending ? "..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Editing</p>
                        <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Account name" className="h-9 rounded-lg text-sm" />
                      <Select value={editType} onValueChange={(v) => setEditType(v as AccountType)}>
                        <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash</SelectItem>
                          <SelectItem value="upi">📱 UPI</SelectItem>
                          <SelectItem value="card">💳 Card</SelectItem>
                          <SelectItem value="bank">🏦 Bank</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} placeholder="Balance" className="h-9 rounded-lg text-sm" />
                      <div className="flex items-center gap-2">
                        <Switch checked={editDefault} onCheckedChange={setEditDefault} />
                        <span className="text-xs text-muted-foreground">Default</span>
                      </div>
                      <Button size="sm" onClick={handleSaveEdit} disabled={updateAccount.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 gap-1">
                        <Check className="h-3 w-3" /> {updateAccount.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  ) : (
                    /* Normal View */
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{acc.name}</h3>
                              {acc.is_default && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                            </div>
                            <Badge variant="secondary" className="text-[10px] capitalize mt-0.5">{acc.type}</Badge>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(acc)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="Edit account"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(acc.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                            title="Delete account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-2xl font-bold mt-3 text-foreground">₹{acc.balance.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Created {new Date(acc.created_at).toLocaleDateString()}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Wallet className="h-8 w-8 text-accent-foreground" />}
          title="No accounts yet"
          description="Create your first account to start tracking your money."
          actionLabel="Add Account"
          onAction={() => setOpen(true)}
        />
      )}
    </div>
  );
}
