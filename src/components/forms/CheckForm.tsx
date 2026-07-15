"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Customer } from "@/types";

const schema = z.object({
  customer_id: z.number().optional(),
  bank_name: z.string().min(1, "نام بانک را وارد کنید"),
  check_number: z.string().min(1, "شماره چک را وارد کنید"),
  amount: z.string().min(1, "مبلغ را وارد کنید"),
  check_date: z.string().min(1, "تاریخ را وارد کنید"),
  due_date: z.string().min(1, "تاریخ سررسید را وارد کنید"),
  payee_name: z.string().optional(),
  owner_name: z.string().optional(),
  account_number: z.string().optional(),
  branch_name: z.string().optional(),
  discount: z.string().optional(),
  description: z.string().optional(),
  purpose: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CheckFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function CheckForm({ initialData, onSubmit, isLoading }: CheckFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank_name: "",
      check_number: "",
      amount: "",
      check_date: "",
      due_date: "",
      payee_name: "",
      owner_name: "",
      account_number: "",
      branch_name: "",
      discount: "",
      description: "",
      purpose: "",
      ...initialData,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({ ...data, customer_id: customer?.id });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField label="مشتری (اختیاری)">
        <CustomerSearch
          value={customer}
          onChange={(c) => {
            setCustomer(c);
            setValue("customer_id", c?.id);
          }}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="نام بانک" error={errors.bank_name?.message} required>
          <Input {...register("bank_name")} />
        </FormField>
        <FormField label="شماره چک" error={errors.check_number?.message} required>
          <Input {...register("check_number")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="مبلغ" error={errors.amount?.message} required>
          <Input type="number" {...register("amount")} />
        </FormField>
        <FormField label="تخفیف" error={errors.discount?.message}>
          <Input type="number" {...register("discount")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PersianDatePicker
          label="تاریخ چک"
          value={initialData?.check_date}
          onChange={(v) => setValue("check_date", v)}
          error={errors.check_date?.message}
          required
        />
        <PersianDatePicker
          label="تاریخ سررسید"
          value={initialData?.due_date}
          onChange={(v) => setValue("due_date", v)}
          error={errors.due_date?.message}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="دریافت کننده" error={errors.payee_name?.message}>
          <Input {...register("payee_name")} />
        </FormField>
        <FormField label="صاحب حساب" error={errors.owner_name?.message}>
          <Input {...register("owner_name")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="شماره حساب" error={errors.account_number?.message}>
          <Input {...register("account_number")} />
        </FormField>
        <FormField label="نام شعبه" error={errors.branch_name?.message}>
          <Input {...register("branch_name")} />
        </FormField>
      </div>

      <FormField label="هدف">
        <Select onValueChange={(v) => setValue("purpose", v)}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب هدف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PAYMENT">پرداخت</SelectItem>
            <SelectItem value="RECEIPT">دریافت</SelectItem>
            <SelectItem value="TRANSFER">انتقال</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="توضیحات" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
