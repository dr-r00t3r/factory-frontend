"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProcesses } from "@/hooks";
import type { Customer } from "@/types";

const schema = z.object({
  customer_id: z.number({ required_error: "مشتری را انتخاب کنید" }),
  process_id: z.string({ required_error: "فرآیند را انتخاب کنید" }),
  output_date: z.string().min(1, "تاریخ را وارد کنید"),
  sabos_narm_weight: z.string().min(1, "وزن را وارد کنید"),
  sabos_narm_total: z.string().min(1, "مبلغ را وارد کنید"),
  sabos_do_weight: z.string().min(1, "وزن را وارد کنید"),
  nimdone_weight: z.string().min(1, "وزن را وارد کنید"),
  nimdone_total: z.string().min(1, "مبلغ را وارد کنید"),
  done_weight: z.string().min(1, "وزن را وارد کنید"),
  done_total: z.string().min(1, "مبلغ را وارد کنید"),
});

type FormData = z.infer<typeof schema>;

interface OutputFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function OutputForm({ initialData, onSubmit, isLoading }: OutputFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { data: processesData } = useProcesses(
    customer ? { customer: customer.id, page_size: 100 } : undefined
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      output_date: "",
      sabos_narm_weight: "",
      sabos_narm_total: "",
      sabos_do_weight: "",
      nimdone_weight: "",
      nimdone_total: "",
      done_weight: "",
      done_total: "",
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

      <FormField label="فرآیند" error={errors.process_id?.message} required>
        <Select
          value={initialData?.process_id}
          onValueChange={(v) => setValue("process_id", v)}
          disabled={!customer}
        >
          <SelectTrigger>
            <SelectValue placeholder={customer ? "انتخاب فرآیند" : "ابتدا مشتری را انتخاب کنید"} />
          </SelectTrigger>
          <SelectContent>
            {processesData?.results?.filter((p) => p.status === "COMPLETED").map((process) => (
              <SelectItem key={process.id} value={String(process.id)}>
                {process.rice_type_name} - {process.input_weight} کیلو
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <PersianDatePicker
        label="تاریخ خروجی"
        value={initialData?.output_date}
        onChange={(v) => setValue("output_date", v)}
        error={errors.output_date?.message}
        required
      />

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">سبوس نرم</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="وزن (کیلوگرم)" error={errors.sabos_narm_weight?.message} required>
            <Input type="number" step="0.1" {...register("sabos_narm_weight")} />
          </FormField>
          <FormField label="مبلغ کل" error={errors.sabos_narm_total?.message} required>
            <Input type="number" {...register("sabos_narm_total")} />
          </FormField>
        </div>
      </div>

      <FormField label="وزن سبوس دو (کیلوگرم)" error={errors.sabos_do_weight?.message} required>
        <Input type="number" step="0.1" {...register("sabos_do_weight")} />
      </FormField>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">نیمدونه</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="وزن (کیلوگرم)" error={errors.nimdone_weight?.message} required>
            <Input type="number" step="0.1" {...register("nimdone_weight")} />
          </FormField>
          <FormField label="مبلغ کل" error={errors.nimdone_total?.message} required>
            <Input type="number" {...register("nimdone_total")} />
          </FormField>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">دونه</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="وزن (کیلوگرم)" error={errors.done_weight?.message} required>
            <Input type="number" step="0.1" {...register("done_weight")} />
          </FormField>
          <FormField label="مبلغ کل" error={errors.done_total?.message} required>
            <Input type="number" {...register("done_total")} />
          </FormField>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
