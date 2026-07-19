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
import type { Customer } from "@/types";

const schema = z
  .object({
    customer_id: z.number({ required_error: "مشتری را انتخاب کنید" }),
    rice_type_id: z.string({ required_error: "نوع شالی را انتخاب کنید" }),
    bag_count: z.string().optional(),
    weight_kg: z.string().optional(),
    input_date: z.string().min(1, "تاریخ را وارد کنید"),
    description: z.string().optional(),
  })
  .refine((data) => data.bag_count || data.weight_kg, {
    message: "حداقل یکی از فیلدهای تعداد کیسه یا وزن را پر کنید",
  });

type FormData = z.infer<typeof schema>;

interface RiceInputFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function RiceInputForm({ initialData, onSubmit, isLoading }: RiceInputFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bag_count: "",
      weight_kg: "",
      input_date: "",
      description: "",
      ...initialData,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({ ...data, customer_id: customer?.id || 0 });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormField label="مشتری" error={errors.customer_id?.message} required>
        <CustomerSearch
          value={customer}
          onChange={(c) => {
            setCustomer(c);
            setValue("customer_id", c?.id || 0);
          }}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="تعداد کیسه" error={errors.bag_count?.message}>
          <Input type="number" {...register("bag_count")} />
        </FormField>
        <FormField label="وزن (کیلوگرم)" error={errors.weight_kg?.message}>
          <Input type="number" step="0.1" {...register("weight_kg")} />
        </FormField>
      </div>
      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <RiceTypeSelect
        label="نوع شالی"
        value={initialData?.rice_type_id}
        onChange={(v) => setValue("rice_type_id", v)}
        error={errors.rice_type_id?.message}
        required
      />

      <PersianDatePicker
        label="تاریخ ورود"
        value={initialData?.input_date}
        onChange={(v) => setValue("input_date", v)}
        error={errors.input_date?.message}
        required
      />

      <FormField label="توضیحات" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </FormField>

      <FormField label="عکس">
        <Input type="file" accept="image/*" />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
