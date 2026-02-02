import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { playSoundIfEnabled } from "@/hooks/useSoundNotifications";
export interface WalletTransaction {
  id: string;
  broker_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  reason: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

interface UseBrokerWalletReturn {
  transactions: WalletTransaction[];
  loading: boolean;
  refetch: () => Promise<void>;
  addTransaction: (
    type: "earned" | "spent" | "bonus" | "penalty",
    amount: number,
    reason: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ) => Promise<boolean>;
}

export const useBrokerWallet = (brokerId: string | undefined): UseBrokerWalletReturn => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!brokerId) return;

    try {
      const { data, error } = await supabase
        .from("broker_wallet_transactions")
        .select("*")
        .eq("broker_id", brokerId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching wallet transactions:", error);
        return;
      }

      setTransactions((data as WalletTransaction[]) || []);
    } catch (err) {
      console.error("Error in fetchTransactions:", err);
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  const addTransaction = async (
    type: "earned" | "spent" | "bonus" | "penalty",
    amount: number,
    reason: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ): Promise<boolean> => {
    if (!brokerId) return false;

    try {
      // First get current broker balance
      const { data: broker, error: brokerError } = await supabase
        .from("brokers")
        .select("coins_balance, lifetime_coins_earned, lifetime_coins_spent")
        .eq("id", brokerId)
        .single();

      if (brokerError || !broker) {
        throw new Error("Failed to get broker balance");
      }

      const isCredit = type === "earned" || type === "bonus";
      const newBalance = isCredit
        ? broker.coins_balance + amount
        : broker.coins_balance - amount;

      // Check if broker has enough balance for debit
      if (!isCredit && newBalance < 0) {
        toast({
          title: "Insufficient coins",
          description: `You need ${amount} coins but only have ${broker.coins_balance}`,
          variant: "destructive",
        });
        playSoundIfEnabled('error');
        return false;
      }

      // Insert transaction
      const { error: txError } = await supabase
        .from("broker_wallet_transactions")
        .insert({
          broker_id: brokerId,
          transaction_type: type,
          amount,
          balance_after: newBalance,
          reason,
          related_entity_type: relatedEntityType || null,
          related_entity_id: relatedEntityId || null,
        });

      if (txError) throw txError;

      // Update broker balance
      const updateData: Record<string, number> = {
        coins_balance: newBalance,
      };

      if (isCredit) {
        updateData.lifetime_coins_earned = broker.lifetime_coins_earned + amount;
      } else {
        updateData.lifetime_coins_spent = broker.lifetime_coins_spent + amount;
      }

      const { error: updateError } = await supabase
        .from("brokers")
        .update(updateData)
        .eq("id", brokerId);

      if (updateError) throw updateError;

      // Refetch transactions and play sound
      await fetchTransactions();
      
      // Play appropriate sound
      if (isCredit) {
        playSoundIfEnabled('coin-earn');
      } else {
        playSoundIfEnabled('coin-spend');
      }
      
      return true;
    } catch (err) {
      console.error("Error adding wallet transaction:", err);
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive",
      });
      playSoundIfEnabled('error');
      return false;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!brokerId) return;

    fetchTransactions();

    const channel = supabase
      .channel(`broker-wallet-${brokerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broker_wallet_transactions",
          filter: `broker_id=eq.${brokerId}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brokerId, fetchTransactions]);

  return {
    transactions,
    loading,
    refetch: fetchTransactions,
    addTransaction,
  };
};
