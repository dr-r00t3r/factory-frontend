"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  year: z.string().min(4, "سال را وارد کنید"),
  fee_per_bag: z.string().min(1, "مبلغ را وارد کنید"),
  weight_farmer: z.string().min(1, "وزن را وارد کنید"),
  fee_trader_per_bag: z.string().min(1, "مبلغ را وارد کنید"),
  weight_trader: z.string().min(1, "وزن را وارد کنید"),
  bag_weight_kg: z.string().min(1, "وزن کیسه را وارد کنید"),
});

type FormData = z.infer<typeof schema>;

interface YearlyFeeFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function YearlyFeeForm({ initialData, onSubmit, isLoading }: YearlyFeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: "",
      fee_per_bag: "",
      weight_farmer: "",
      fee_trader_per_bag: "",
      weight_trader: "",
      bag_weight_kg: "",
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="سال" error={errors.year?.message} required>
        <Input type="number" {...register("year")} />
      </FormField>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">کشاورز</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="کرایه هر کیسه" error={errors.fee_per_bag?.message} required>
            <Input type="number" {...register("fee_per_bag")} />
          </FormField>
          <FormField label="وزن کشاورز" error={errors.weight_farmer?.message} required>
            <Input type="number" step="0.1" {...register("weight_farmer")} />
          </FormField>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">تاجر</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="کرایه هر کیسه" error={errors.fee_trader_per_bag?.message} required>
            <Input type="number" {...register("fee_trader_per_bag")} />
          </FormField>
          <FormField label="وزن تاجر" error={errors.weight_trader?.message} required>
            <Input type="number" step="0.1" {...register("weight_trader")} />
          </FormField>
        </div>
      </div>

      <FormField label="وزن هر کیسه (کیلوگرم)" error={errors.bag_weight_kg?.message} required>
        <Input type="number" step="0.1" {...register("bag_weight_kg")} />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
