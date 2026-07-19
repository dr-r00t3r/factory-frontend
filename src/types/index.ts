export interface User {
  id: number;
  username: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: string;
  is_active: boolean;
  is_staff?: boolean;
  date_joined?: string;
}

export interface Customer {
  id: number;
  name: string;
  national_code?: string;
  phone?: string;
  address?: string;
  customer_type: string;
  created_at?: string;
  updated_at?: string;
}

export interface RiceType {
  id: number;
  name: string;
  created_at?: string;
}

export interface YearlyFee {
  id: number;
  year: number;
  fee_per_bag: number;
  weight_farmer: number;
  fee_trader_per_bag: number;
  weight_trader: number;
  bag_weight_kg: number;
  created_at?: string;
}

export interface RiceInput {
  id: number;
  customer_id: number;
  customer_name?: string;
  input_date: string;
  bag_count?: number;
  weight_kg?: number;
  rice_type_id?: number;
  rice_type_name?: string;
  photo?: unknown;
  description?: string;
  created_at?: string;
}

export interface Process {
  id: number;
  customer_id: number;
  rice_input_id: number;
  fer1_number?: number;
  fer2_number?: number;
  fer1_bag_count?: number;
  fer2_bag_count?: number;
  is_processed: boolean;
  process_date?: string;
  created_at?: string;
  // joined fields
  customer_name?: string;
  rice_type_name?: string;
  input_weight?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  kiln_number?: number;
  description?: string;
}

export interface Output {
  id: number;
  customer_id: number;
  process_id?: number;
  output_date: string;
  sabos_narm_weight: number;
  sabos_narm_total: number;
  sabos_do_weight: number;
  nimdone_weight: number;
  nimdone_total: number;
  done_weight: number;
  done_total: number;
  created_at?: string;
  customer_name?: string;
  process_info?: string;
  rice_type_name?: string;
  weight?: number;
  description?: string;
}

export interface CustomerPayment {
  id: number;
  customer_id: number;
  process_id?: number;
  payment_date: string;
  cash_amount: number;
  card_amount: number;
  discount: number;
  credit_amount: number;
  debt_amount: number;
  total_paid: number;
  sabos_weight: number;
  sabos_rate: number;
  nimdone_weight: number;
  nimdone_rate: number;
  done_weight: number;
  done_rate: number;
  description?: string;
  created_at?: string;
  customer_name?: string;
}

export interface CheckPayment {
  id: number;
  customer_id?: number;
  bank_name?: string;
  check_date?: string;
  amount: number;
  check_number?: string;
  payee_name?: string;
  owner_name?: string;
  account_number?: string;
  branch_name?: string;
  discount: number;
  is_collected: boolean;
  collection_date?: string;
  description?: string;
  purpose?: string;
  created_at?: string;
  customer_name?: string;
  issue_date?: string;
  due_date?: string;
  status?: string;
  customer?: number;
}

export interface Expense {
  id: number;
  amount: number;
  expense_date: string;
  category?: string;
  description?: string;
  payment_method?: string;
  created_at?: string;
  title?: string;
}

export interface Member {
  id: number;
  full_name: string;
  phone?: string;
  position?: string;
  daily_wage: number;
  monthly_fee: number;
  is_active: boolean;
  created_at?: string;
  name?: string;
  role?: string;
  salary?: number;
  joined_date?: string;
}

export interface Salary {
  id: number;
  member_id: number;
  amount: number;
  salary_date: string;
  description?: string;
  created_at?: string;
  member_name?: string;
  member?: number;
  month?: number;
  year?: number;
  paid_date?: string;
}

export interface MiscPayment {
  id: number;
  amount: number;
  payment_date: string;
  recipient_name?: string;
  description?: string;
  created_at?: string;
  title?: string;
}

export interface MiscReceipt {
  id: number;
  amount: number;
  receipt_date: string;
  description?: string;
  created_at?: string;
  title?: string;
}

export interface Loan {
  id: number;
  customer_id: number;
  debit_amount: number;
  credit_amount: number;
  loan_date: string;
  description?: string;
  is_settled: boolean;
  created_at?: string;
  member?: number;
  member_name?: string;
  amount?: number;
  interest_rate?: number;
  issue_date?: string;
  due_date?: string;
  status?: string;
}

export interface Sale {
  id: number;
  customer_id?: number;
  rice_type_id?: number;
  weight_kg: number;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  description?: string;
  created_at?: string;
  product_type?: string;
  customer_name?: string;
  // computed for frontend
  customer?: number;
  weight?: number;
  price_per_unit?: number;
  sale_date?: string;
}

export interface Purchase {
  id: number;
  customer_id?: number;
  rice_type_id?: number;
  weight_kg: number;
  unit_price: number;
  total_amount: number;
  transaction_date: string;
  description?: string;
  created_at?: string;
  product_type?: string;
  customer_name?: string;
  customer?: number;
  weight?: number;
  price_per_unit?: number;
  purchase_date?: string;
}

export interface Inventory {
  product_type: string;
  product_type_display?: string;
  weight: number;
  total_amount: number;
  updated_at?: string;
  total_weight?: number;
  total_value?: number;
  id?: number;
  last_updated?: string;
}

export interface CustomerInventory {
  customer_id: number;
  customer_name: string;
  done_count: number;
  done_weight: number;
  nimdone_count: number;
  nimdone_weight: number;
  updated_at?: string;
  customer?: number;
  product_type?: string;
  product_type_display?: string;
  weight?: number;
}

export interface Debtor {
  customer_id: number;
  customer_name: string;
  debt_amount: number;
  phone?: string;
  last_payment_date?: string;
  customer?: number;
  total_debt?: number;
  last_transaction?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FinancialSummary {
  total_cash_payments: number;
  total_card_payments: number;
  total_discounts: number;
  total_expenses: number;
  total_salaries: number;
  total_misc_payments: number;
  total_misc_receipts: number;
  total_check_amounts: number;
  total_collected_checks: number;
  total_sales: number;
  total_purchases: number;
  total_loans_given: number;
  total_loans_received: number;
  net_balance: number;
  // computed
  net_profit?: number;
  total_sales_amount?: number;
  total_purchases_amount?: number;
  period_start?: string;
  period_end?: string;
}

export interface OverallReport {
  total_input_weight: number;
  total_input_bags: number;
  total_output_weight: number;
  total_processed_customers: number;
  total_active_customers: number;
  total_income: number;
  total_expense: number;
  total_karmozd: number;
  total_profit: number;
  inventory_summary?: Record<string, { weight: number; total_amount: number; updated_at?: string }>;
  // computed
  total_rice_input?: number;
  total_output?: number;
  total_sales?: Record<string, number>;
  total_purchases?: Record<string, number>;
  total_expenses?: number;
  total_salaries?: number;
  total_customers?: number;
  active_members?: number;
}

export interface CustomerReport {
  customer_id: number;
  customer_name: string;
  total_input_weight: number;
  total_input_bags: number;
  total_output_weight: number;
  total_paid: number;
  total_debt: number;
  current_balance: number;
  input_details?: Array<{
    id: number;
    date: string;
    bag_count: number;
    weight_kg: number;
    description?: string;
  }>;
  output_details?: Array<{
    id: number;
    date: string;
    done_weight: number;
    nimdone_weight: number;
    sabos_narm_weight: number;
    sabos_do_weight: number;
  }>;
  payment_details?: Array<{
    id: number;
    date: string;
    cash: number;
    card: number;
    discount: number;
    total_paid: number;
  }>;
  karmozd_details?: unknown[];
  // computed
  customer?: Customer;
  total_inputs?: number;
  total_outputs?: number;
  remaining_weight?: number;
  total_sales_amount?: number;
  total_payments?: number;
  balance?: number;
  recent_transactions?: Array<{
    type: string;
    date: string;
    amount: number;
    description?: string;
  }>;
}

export interface Kiln {
  id: number;
  number: number;
  status: string;
  current_process?: number;
  current_process_info?: string;
  temperature?: number;
  last_updated: string;
}
