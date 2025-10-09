import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Account {
  id: string;
  account_name: string;
  balance: number;
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onSelectAccount,
}: AccountSelectorProps) {
  return (
    <Select value={selectedAccountId || undefined} onValueChange={onSelectAccount}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.account_name} (${account.balance.toLocaleString()})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
