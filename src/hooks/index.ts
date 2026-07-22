import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  Customer,
  RiceInput,
  RiceType,
  ProcessLine,
  ProcessSession,
  Output,
  DailyPrice,
  Sale,
  Purchase,
  CheckPayment,
  Expense,
  Member,
  Salary,
  Inventory,
  CustomerInventory,
  FinancialSummary,
  OverallReport,
  CustomerReport,
  Debtor,
  YearlyFee,
  Kiln,
  MiscPayment,
  MiscReceipt,
  Loan,
  PaginatedResponse,
} from "@/types";

function paginatedQuery<T>(url: string, filters?: Record<string, unknown>) {
  return {
    queryKey: [url, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      const queryString = params.toString();
      const { data } = await apiClient.get<PaginatedResponse<T> | T[]>(
        queryString ? `${url}?${queryString}` : url
      );
      if (Array.isArray(data)) {
        return { count: data.length, next: null, previous: null, results: data } as PaginatedResponse<T>;
      }
      return data;
    },
  };
}

function singleQuery<T>(url: string, id?: number) {
  return {
    queryKey: [url, id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<T>(`${url}${id}/`);
      return data;
    },
    enabled: !!id,
  };
}

export function useCustomers(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<Customer>(API_ENDPOINTS.CUSTOMERS, filters));
}

export function useCustomer(id?: number) {
  return useQuery(singleQuery<Customer>(API_ENDPOINTS.CUSTOMERS, id));
}

export function useRiceInputs(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<RiceInput>(API_ENDPOINTS.RICE_INPUTS, filters));
}

export function useRiceInput(id?: number) {
  return useQuery(singleQuery<RiceInput>(API_ENDPOINTS.RICE_INPUTS, id));
}

export function useRiceTypes(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<RiceType>(API_ENDPOINTS.RICE_TYPES, filters));
}

export function useProcessLines(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<ProcessLine>(API_ENDPOINTS.PROCESS_LINES, filters));
}

export function useProcessLine(id?: number) {
  return useQuery(singleQuery<ProcessLine>(API_ENDPOINTS.PROCESS_LINES, id));
}

export function useProcessSessions(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<ProcessSession>(API_ENDPOINTS.PROCESS_SESSIONS, filters));
}

export function useProcessSession(id?: number) {
  return useQuery(singleQuery<ProcessSession>(API_ENDPOINTS.PROCESS_SESSIONS, id));
}

export function useOutputs(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<Output>(API_ENDPOINTS.OUTPUTS, filters));
}

export function useOutput(id?: number) {
  return useQuery(singleQuery<Output>(API_ENDPOINTS.OUTPUTS, id));
}

export function useDailyPrices(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<DailyPrice>(API_ENDPOINTS.DAILY_PRICES, filters));
}

export function useDailyPrice(id?: number) {
  return useQuery(singleQuery<DailyPrice>(API_ENDPOINTS.DAILY_PRICES, id));
}

export function useSales(productType?: string, filters?: Record<string, unknown>) {
  const url = productType
    ? `${API_ENDPOINTS.SALES}?product_type=${productType}`
    : API_ENDPOINTS.SALES;
  return useQuery(paginatedQuery<Sale>(url, filters));
}

export function usePurchases(productType?: string, filters?: Record<string, unknown>) {
  const url = productType
    ? `${API_ENDPOINTS.PURCHASES}?product_type=${productType}`
    : API_ENDPOINTS.PURCHASES;
  return useQuery(paginatedQuery<Purchase>(url, filters));
}

export function useChecks(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<CheckPayment>(API_ENDPOINTS.CHECKS, filters));
}

export function useCheck(id?: number) {
  return useQuery(singleQuery<CheckPayment>(API_ENDPOINTS.CHECKS, id));
}

export function useExpenses(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<Expense>(API_ENDPOINTS.EXPENSES, filters));
}

export function useMembers(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<Member>(API_ENDPOINTS.MEMBERS, filters));
}

export function useSalaries(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<Salary>(API_ENDPOINTS.SALARIES, filters));
}

export function useInventory() {
  return useQuery({
    queryKey: [API_ENDPOINTS.INVENTORY],
    queryFn: async () => {
      const { data } = await apiClient.get<Record<string, Inventory> | Inventory[]>(API_ENDPOINTS.INVENTORY);
      if (Array.isArray(data)) return data;
      return Object.values(data).filter((item): item is Inventory => item !== null && typeof item === "object" && "product_type" in item);
    },
  });
}

export function useInventoryByType(type: string) {
  return useQuery({
    queryKey: [API_ENDPOINTS.INVENTORY, type],
    queryFn: async () => {
      const { data } = await apiClient.get<CustomerInventory[]>(
        `${API_ENDPOINTS.INVENTORY}?type=${type}`
      );
      return data;
    },
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: [API_ENDPOINTS.FINANCIAL_SUMMARY],
    queryFn: async () => {
      const { data } = await apiClient.get<FinancialSummary>(API_ENDPOINTS.FINANCIAL_SUMMARY);
      return data;
    },
  });
}

export function useOverallReport() {
  return useQuery({
    queryKey: [API_ENDPOINTS.OVERALL_REPORT],
    queryFn: async () => {
      const { data } = await apiClient.get<OverallReport>(API_ENDPOINTS.OVERALL_REPORT);
      return data;
    },
  });
}

export function useCustomerReport(id?: number) {
  return useQuery({
    queryKey: [API_ENDPOINTS.CUSTOMER_REPORT, id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<CustomerReport>(
        `${API_ENDPOINTS.CUSTOMER_REPORT}${id}/`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDebtors() {
  return useQuery({
    queryKey: [API_ENDPOINTS.DEBTORS],
    queryFn: async () => {
      const { data } = await apiClient.get<Debtor[]>(API_ENDPOINTS.DEBTORS);
      return data;
    },
  });
}

export function useYearlyFees() {
  return useQuery(paginatedQuery<YearlyFee>(API_ENDPOINTS.YEARLY_FEES));
}

export function useKilns() {
  return useQuery({
    queryKey: [API_ENDPOINTS.KILNS],
    queryFn: async () => {
      const { data } = await apiClient.get<Kiln[]>(API_ENDPOINTS.KILNS);
      return data;
    },
  });
}

export function useMiscPayments(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<MiscPayment>(API_ENDPOINTS.MISC_PAYMENTS, filters));
}

export function useMiscReceipts(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<MiscReceipt>(API_ENDPOINTS.MISC_RECEIPTS, filters));
}

export function useLoans(filters?: Record<string, unknown>) {
  return useQuery(paginatedQuery<Loan>(API_ENDPOINTS.LOANS, filters));
}

export function useCreateMutation(url: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient.post(url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [url] });
    },
  });
}

export function useUpdateMutation(url: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const response = await apiClient.put(`${url}${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [url] });
    },
  });
}

export function useDeleteMutation(url: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${url}${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [url] });
    },
  });
}

export function useProcessSessionAddInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const response = await apiClient.post(`${API_ENDPOINTS.PROCESS_SESSIONS}${id}/inputs/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROCESS_SESSIONS] });
    },
  });
}

export function useProcessSessionRemoveInput() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, inputId }: { sessionId: number; inputId: number }) => {
      const response = await apiClient.delete(`${API_ENDPOINTS.PROCESS_SESSIONS}${sessionId}/inputs/${inputId}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROCESS_SESSIONS] });
    },
  });
}

export function useProcessSessionStart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.put(`${API_ENDPOINTS.PROCESS_SESSIONS}${id}/start/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROCESS_SESSIONS] });
    },
  });
}

export function useProcessSessionComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.put(`${API_ENDPOINTS.PROCESS_SESSIONS}${id}/complete/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PROCESS_SESSIONS] });
    },
  });
}
