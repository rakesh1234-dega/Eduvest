import { useState } from "react";
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet, Trash2, Star } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];
const accountTypeIcons: Record<AccountType, string> = { cash: "💵", upi: "📱", card: "💳", bank: "🏦" };

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const updateAccount = useUpdateAccount();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [balance, setBalance] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleCreate = async () => {
    if (!name) return;
    await createAccount.mutateAsync({ name, type, balance: parseFloat(balance) || 0, is_default: isDefault });
    setOpen(false);
    setName("");
    setBalance("");
    setIsDefault(false);
  };

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground text-sm">Manage your money accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary gap-1"><Plus className="h-4 w-4" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Account Name</Label>
                <Input placeholder="e.g. My Cash" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="upi">📱 UPI</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                    <SelectItem value="bank">🏦 Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Opening Balance (₹)</Label>
                <Input type="number" min="0" placeholder="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                <Label>Set as default account</Label>
              </div>
              <Button onClick={handleCreate} className="w-full gradient-primary" disabled={createAccount.isPending}>
                {createAccount.isPending ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{accountTypeIcons[acc.type]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{acc.name}</h3>
                        {acc.is_default && <Star className="h-3 w-3 text-primary fill-primary" />}
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{acc.type}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteAccount.mutate(acc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-2xl font-bold mt-3">₹{acc.balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Created {new Date(acc.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
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
