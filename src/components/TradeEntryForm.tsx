import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Calculator, Target, CalendarIcon } from "lucide-react";
import { Trade, AccountSettings } from "./TradingDashboard";
import { cn } from "@/lib/utils";

interface TradeEntryFormProps {
  onAddTrade: (trade: Omit<Trade, "id">) => void;
  onCancel: () => void;
  accountSettings: AccountSettings;
  defaultTab?: "detailed" | "simple";
}

export const TradeEntryForm = ({ onAddTrade, onCancel, accountSettings, defaultTab = "simple" }: TradeEntryFormProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({
    pair: "",
    entry: "",
    exit: "",
    stopLoss: "",
    takeProfit: "",
    size: "",
    riskPercent: accountSettings.defaultRiskPercent.toString(),
    accountBalance: accountSettings.balance.toString(),
  });
  const [detailedDate, setDetailedDate] = useState<Date>(new Date());

  const [simpleRRData, setSimpleRRData] = useState({
    pair: "",
    rrValue: "",
    accountBalance: accountSettings.balance.toString(),
  });
  const [simpleDate, setSimpleDate] = useState<Date>(new Date());

  const handleDetailedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = parseFloat(formData.entry);
    const exit = parseFloat(formData.exit);
    const stopLoss = parseFloat(formData.stopLoss);
    const takeProfit = parseFloat(formData.takeProfit);
    const accountBalance = parseFloat(formData.accountBalance);
    const riskPercent = parseFloat(formData.riskPercent);
    
    if (!formData.pair || isNaN(entry) || isNaN(exit) || isNaN(stopLoss) || isNaN(accountBalance) || isNaN(riskPercent)) {
      return;
    }

    // Calculate position size based on risk
    const riskAmount = (accountBalance * riskPercent) / 100;
    const entryToStopDistance = Math.abs(entry - stopLoss);
    const positionSize = riskAmount / entryToStopDistance;

    // Calculate profit/loss
    const exitDistance = exit - entry;
    const profit = exitDistance * positionSize;
    
    // Calculate RR 
    const riskPerUnit = Math.abs(entry - stopLoss);
    const rewardPerUnit = Math.abs(exit - entry);
    const profitRR = exit > entry ? rewardPerUnit / riskPerUnit : -(rewardPerUnit / riskPerUnit);
    
    const isWin = profit > 0;

    onAddTrade({
      pair: formData.pair,
      entry,
      exit,
      stopLoss,
      takeProfit,
      size: positionSize,
      profit,
      profitRR,
      isWin,
      date: detailedDate,
      entryMethod: 'detailed',
      accountBalance,
      riskPercent
    });

    resetForms();
  };

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rrValue = parseFloat(simpleRRData.rrValue);
    const accountBalance = parseFloat(simpleRRData.accountBalance);
    
    if (!simpleRRData.pair || isNaN(rrValue) || isNaN(accountBalance)) {
      return;
    }

    // Calculate dollar profit based on RR and 1% default risk
    const oneR = accountBalance * 0.01; // 1R = 1% of account balance
    const profit = rrValue * oneR;
    const isWin = rrValue > 0;

    onAddTrade({
      pair: simpleRRData.pair,
      size: oneR, // For simple mode, size represents the risk amount
      profit,
      profitRR: rrValue,
      isWin,
      date: simpleDate,
      entryMethod: 'simple',
      accountBalance
    });

    resetForms();
  };

  const resetForms = () => {
    setFormData({
      pair: "",
      entry: "",
      exit: "",
      stopLoss: "",
      takeProfit: "",
      size: "",
      riskPercent: accountSettings.defaultRiskPercent.toString(),
      accountBalance: accountSettings.balance.toString(),
    });
    setDetailedDate(new Date());

    setSimpleRRData({
      pair: "",
      rrValue: "",
      accountBalance: accountSettings.balance.toString(),
    });
    setSimpleDate(new Date());
  };

  const handleDetailedChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSimpleChange = (field: string, value: string) => {
    setSimpleRRData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add New Trade</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "simple" | "detailed")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Simple RR Input</span>
              <span className="sm:hidden">Simple</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Detailed Calculation</span>
              <span className="sm:hidden">Detailed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple">
            <form onSubmit={handleSimpleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="simplePair">Trading Pair</Label>
                  <Input
                    id="simplePair"
                    value={simpleRRData.pair}
                    onChange={(e) => handleSimpleChange("pair", e.target.value)}
                    placeholder="e.g., EURUSD"
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={format(simpleDate, "yyyy-MM-dd")}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate.getTime())) {
                          setSimpleDate(newDate);
                        }
                      }}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={simpleDate}
                          onSelect={(date) => date && setSimpleDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rrValue">Risk/Reward (RR)</Label>
                  <Input
                    id="rrValue"
                    type="number"
                    step="0.1"
                    value={simpleRRData.rrValue}
                    onChange={(e) => handleSimpleChange("rrValue", e.target.value)}
                    placeholder="e.g., 2 (profit) or -1 (loss)"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Positive for profit (1, 2, 3), negative for loss (-0.5, -1)
                  </p>
                </div>
                <div>
                  <Label htmlFor="simpleAccountBalance">Account Balance ($)</Label>
                  <Input
                    id="simpleAccountBalance"
                    type="number"
                    step="0.01"
                    value={simpleRRData.accountBalance}
                    onChange={(e) => handleSimpleChange("accountBalance", e.target.value)}
                    placeholder="100000"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    1R = 1% of account balance
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1 gradient-primary">
                  Add Trade
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="detailed">
            <form onSubmit={handleDetailedSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pair">Trading Pair</Label>
                  <Input
                    id="pair"
                    value={formData.pair}
                    onChange={(e) => handleDetailedChange("pair", e.target.value)}
                    placeholder="e.g., EURUSD"
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={format(detailedDate, "yyyy-MM-dd")}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate.getTime())) {
                          setDetailedDate(newDate);
                        }
                      }}
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={detailedDate}
                          onSelect={(date) => date && setDetailedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="entry">Entry Price</Label>
                  <Input
                    id="entry"
                    type="number"
                    step="0.00001"
                    value={formData.entry}
                    onChange={(e) => handleDetailedChange("entry", e.target.value)}
                    placeholder="1.12345"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.00001"
                    value={formData.stopLoss}
                    onChange={(e) => handleDetailedChange("stopLoss", e.target.value)}
                    placeholder="1.12000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="exit">Exit Price</Label>
                  <Input
                    id="exit"
                    type="number"
                    step="0.00001"
                    value={formData.exit}
                    onChange={(e) => handleDetailedChange("exit", e.target.value)}
                    placeholder="1.12445"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountBalance">Account Balance ($)</Label>
                  <Input
                    id="accountBalance"
                    type="number"
                    step="0.01"
                    value={formData.accountBalance}
                    onChange={(e) => handleDetailedChange("accountBalance", e.target.value)}
                    placeholder="100000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="riskPercent">Risk (%)</Label>
                  <Input
                    id="riskPercent"
                    type="number"
                    step="0.1"
                    value={formData.riskPercent}
                    onChange={(e) => handleDetailedChange("riskPercent", e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1 gradient-primary">
                  Add Trade
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};