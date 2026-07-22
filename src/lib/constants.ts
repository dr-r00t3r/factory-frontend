export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/login",
    REFRESH: "/api/refresh",
    PROFILE: "/api/me",
  },
  CUSTOMERS: "/api/customers/",
  RICE_TYPES: "/api/rice-types/",
  RICE_INPUTS: "/api/rice-inputs/",
  PROCESSES: "/api/processes/",
  PROCESS_LINES: "/api/processes/lines/",
  PROCESS_SESSIONS: "/api/processes/sessions/",
  OUTPUTS: "/api/outputs/",
  DAILY_PRICES: "/api/daily-prices/",
  SALES: "/api/sales/",
  PURCHASES: "/api/purchases/",
  CHECKS: "/api/checks/",
  EXPENSES: "/api/expenses/",
  MEMBERS: "/api/members/",
  SALARIES: "/api/salaries/",
  INVENTORY: "/api/inventory/",
  FINANCIAL_SUMMARY: "/api/reports/financial-summary/",
  OVERALL_REPORT: "/api/reports/overall/",
  CUSTOMER_REPORT: "/api/reports/customer/",
  DEBTORS: "/api/reports/debtors/",
  YEARLY_FEES: "/api/yearly-fees/",
  KILNS: "/api/kilns/",
  MISC_PAYMENTS: "/api/misc-payments/",
  MISC_RECEIPTS: "/api/misc-receipts/",
  LOANS: "/api/loans/",
  USERS: "/api/users/",
};

export enum ProductType {
  SHALI = "SHALI",
  DONE = "DONE",
  NIMDONE = "NIMDONE",
  SABOS_NARM = "SABOS_NARM",
  SABOS_DO = "SABOS_DO",
}

export const ProductTypeLabels: Record<ProductType, string> = {
  [ProductType.SHALI]: "شالی",
  [ProductType.DONE]: "دونه",
  [ProductType.NIMDONE]: "نیمدونه",
  [ProductType.SABOS_NARM]: "سبوس نرم",
  [ProductType.SABOS_DO]: "سبوس دو",
};

export enum CustomerType {
  FARMER = "FARMER",
  TRADER = "TRADER",
}

export const CustomerTypeLabels: Record<CustomerType, string> = {
  [CustomerType.FARMER]: "کشاورز",
  [CustomerType.TRADER]: "تاجر",
};

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "داشبورد",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "مشتریان",
    href: "/dashboard/customers",
    icon: "Users",
  },
  {
    title: "داشبورد مالی",
    href: "/dashboard/finance",
    icon: "Wallet",
  },
  {
    title: "ورودی و فرآیند",
    href: "#",
    icon: "Package",
    children: [
      { title: "ورودی شالی", href: "/dashboard/rice-inputs", icon: "ArrowDownToLine" },
      { title: "جلسات فرآیند", href: "/dashboard/sessions", icon: "Factory" },
      { title: "خروجی تبدیل", href: "/dashboard/outputs", icon: "ArrowUpFromLine" },
      { title: "نرخ روزانه محصولات", href: "/dashboard/daily-prices", icon: "Tag" },
    ],
  },
  {
    title: "فروش",
    href: "#",
    icon: "TrendingUp",
    children: [
      { title: "فروش شالی", href: "/dashboard/sales/shali", icon: "DollarSign" },
      { title: "فروش دونه", href: "/dashboard/sales/done", icon: "DollarSign" },
      { title: "فروش نیمدونه", href: "/dashboard/sales/nimdone", icon: "DollarSign" },
      { title: "فروش سبوس نرم", href: "/dashboard/sales/sabos-narm", icon: "DollarSign" },
      { title: "فروش سبوس دو", href: "/dashboard/sales/sabos-do", icon: "DollarSign" },
    ],
  },
  {
    title: "خرید",
    href: "#",
    icon: "ShoppingCart",
    children: [
      { title: "خرید شالی", href: "/dashboard/purchases/shali", icon: "ShoppingBag" },
      { title: "خرید دونه", href: "/dashboard/purchases/done", icon: "ShoppingBag" },
      { title: "خرید نیمدونه", href: "/dashboard/purchases/nimdone", icon: "ShoppingBag" },
      { title: "خرید سبوس نرم", href: "/dashboard/purchases/sabos-narm", icon: "ShoppingBag" },
    ],
  },
  {
    title: "مالی",
    href: "#",
    icon: "Wallet",
    children: [
      { title: "کارمزد", href: "/dashboard/misc-payments", icon: "HandCoins" },
      { title: "پرداخت نقدی", href: "/dashboard/customer-payments", icon: "Banknote" },
      { title: "چک", href: "/dashboard/checks", icon: "FileText" },
      { title: "هزینه‌ها", href: "/dashboard/expenses", icon: "Receipt" },
      { title: "حقوق", href: "/dashboard/salaries", icon: "Wallet" },
      { title: "دستی", href: "/dashboard/misc-receipts", icon: "ArrowDownCircle" },
      { title: "تنخواه", href: "/dashboard/loans", icon: "CreditCard" },
    ],
  },
  {
    title: "انبار",
    href: "#",
    icon: "Warehouse",
    children: [
      { title: "انبار مشتریان", href: "/dashboard/customer-inventory", icon: "Users" },
      { title: "موجودی محصولات", href: "/dashboard/inventory", icon: "PackageCheck" },
    ],
  },
  {
    title: "گزارشات",
    href: "#",
    icon: "BarChart3",
    children: [
      { title: "گزارش جامع", href: "/dashboard/reports/overall", icon: "FileBarChart" },
      { title: "گزارش مشتری", href: "/dashboard/reports/customer", icon: "UserSquare" },
      { title: "بدهکاران", href: "/dashboard/reports/debtors", icon: "AlertTriangle" },
    ],
  },
  {
    title: "مدیریت",
    href: "#",
    icon: "Settings",
    children: [
      { title: "پرسنل", href: "/dashboard/members", icon: "UsersRound" },
      { title: "کاربران", href: "/dashboard/users", icon: "UserCog" },
      { title: "نرخ‌های سالانه", href: "/dashboard/settings/yearly-fees", icon: "Percent" },
      { title: "تنظیمات", href: "/dashboard/settings", icon: "Cog" },
    ],
  },
];
