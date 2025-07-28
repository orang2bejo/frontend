export interface Order {
  id: string;
  created_date: string;
  item_description: string;
  store_location?: string;
  delivery_address: string;
  max_budget: number;
  customer_phone: string;
  customer_notes?: string;
  status: string;
  payment_status: string;
  // Fields that might be added by the backend
  final_price?: number;
  driver_id?: string;
  review_submitted?: boolean;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  driver_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
}

export interface DriverWallet {
  available_balance: number;
  commission_debt: number;
  withdrawal_history: WithdrawalRequest[];
}

export interface Donation {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  donated_at: string;
}

export interface LeaderboardEntry {
  driver_id: string;
  driver_name: string; // Assuming name is available
  score: number;
}

export interface HallOfFameWinner {
  id: string;
  award_name: string;
  driver_name: string;
  achieved_at: string;
}

export interface MilestoneProgress {
  current_drivers: number;
  next_milestone: number;
  milestone_reward: string;
}

export interface HallOfFameData {
  current_prize_pool: number;
  leaderboard: LeaderboardEntry[];
  recent_winners: HallOfFameWinner[];
  milestone_progress: MilestoneProgress;
}
