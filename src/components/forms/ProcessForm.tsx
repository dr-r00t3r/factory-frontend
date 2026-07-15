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
import { useRiceInputs } from "@/hooks";
import type { Customer } from "@/types";

const schema = z.object({
  customer_id: z.number({ required_error: "مشتری را انتخاب کنید" }),
  rice_input_id: z.string({ required_error: "ورودی را انتخاب کنید" }),
  fer1_number: z.string().min(1, "شماره فر یک را وارد کنید"),
  fer2_number: z.string().optional(),
  fer1_bag_count: z.string().min(1, "تعداد کیسه فر یک را وارد کنید"),
  fer2_bag_count: z.string().optional(),
  process_date: z.string().min(1, "تاریخ را وارد کنید"),
});

type FormData = z.infer<typeof schema>;

interface ProcessFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function ProcessForm({ initialData, onSubmit, isLoading }: ProcessFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const { data: inputsData } = useRiceInputs(
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
      fer1_number: "",
      fer2_number: "",
      fer1_bag_count: "",
      fer2_bag_count: "",
      process_date: "",
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

      <FormField label="ورودی شالی" error={errors.rice_input_id?.message} required>
        <Select
          value={initialData?.rice_input_id}
          onValueChange={(v) => setValue("rice_input_id", v)}
          disabled={!customer}
        >
          <SelectTrigger>
            <SelectValue placeholder={customer ? "انتخاب ورودی" : "ابتدا مشتری را انتخاب کنید"} />
          </SelectTrigger>
          <SelectContent>
            {inputsData?.results?.map((input) => (
              <SelectItem key={input.id} value={String(input.id)}>
                {input.rice_type_name} - {input.weight_kg} کیلو - {new Date(input.input_date).toLocaleDateString("fa-IR")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="شماره فر یک" error={errors.fer1_number?.message} required>
          <Input {...register("fer1_number")} />
        </FormField>
        <FormField label="تعداد کیسه فر یک" error={errors.fer1_bag_count?.message} required>
          <Input type="number" {...register("fer1_bag_count")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="شماره فر دو" error={errors.fer2_number?.message}>
          <Input {...register("fer2_number")} />
        </FormField>
        <FormField label="تعداد کیسه فر دو" error={errors.fer2_bag_count?.message}>
          <Input type="number" {...register("fer2_bag_count")} />
        </FormField>
      </div>

      <PersianDatePicker
        label="تاریخ فرآیند"
        value={initialData?.process_date}
        onChange={(v) => setValue("process_date", v)}
        error={errors.process_date?.message}
        required
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
