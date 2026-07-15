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
import { RiceTypeSelect } from "@/components/shared/RiceTypeSelect";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useInventory } from "@/hooks";
import { toPersianCurrency } from "@/lib/utils";
import type { Customer } from "@/types";

const schema = z.object({
  customer_id: z.number().optional(),
  rice_type_id: z.string({ required_error: "نوع شالی را انتخاب کنید" }),
  weight_kg: z.string().min(1, "وزن را وارد کنید"),
  unit_price: z.string().min(1, "قیمت واحد را وارد کنید"),
  transaction_date: z.string().min(1, "تاریخ را وارد کنید"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SaleFormProps {
  productType: string;
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function SaleForm({ productType, initialData, onSubmit, isLoading }: SaleFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { data: inventory } = useInventory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      weight_kg: "",
      unit_price: "",
      transaction_date: "",
      description: "",
      ...initialData,
    },
  });

  const weight = watch("weight_kg");
  const unitPrice = watch("unit_price");
  const totalAmount = (parseFloat(weight || "0") || 0) * (parseFloat(unitPrice || "0") || 0);

  const availableInventory = inventory?.find(
    (item) => item.product_type.toLowerCase() === productType.toLowerCase()
  );

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

      {availableInventory && (
        <div className="rounded-md bg-muted p-3 text-sm">
          موجودی قابل فروش: {toPersianCurrency(availableInventory.total_weight)} کیلوگرم
        </div>
      )}

      <RiceTypeSelect
        label="نوع محصول"
        value={initialData?.rice_type_id}
        onChange={(v) => setValue("rice_type_id", v)}
        error={errors.rice_type_id?.message}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="وزن (کیلوگرم)" error={errors.weight_kg?.message} required>
          <Input type="number" step="0.1" {...register("weight_kg")} />
        </FormField>
        <FormField label="قیمت واحد" error={errors.unit_price?.message} required>
          <Input type="number" {...register("unit_price")} />
        </FormField>
      </div>

      {totalAmount > 0 && (
        <div className="rounded-md bg-primary/5 p-3 text-sm font-medium">
          مبلغ کل: {toPersianCurrency(totalAmount)}
        </div>
      )}

      <PersianDatePicker
        label="تاریخ معامله"
        value={initialData?.transaction_date}
        onChange={(v) => setValue("transaction_date", v)}
        error={errors.transaction_date?.message}
        required
      />

      <FormField label="توضیحات" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
