"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
  full_name: z.string().min(1, "نام را وارد کنید"),
  phone: z.string().optional(),
  position: z.string().min(1, "سمت را وارد کنید"),
  daily_wage: z.string().optional(),
  monthly_fee: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface MemberFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function MemberForm({ initialData, onSubmit, isLoading }: MemberFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone: "",
      position: "",
      daily_wage: "",
      monthly_fee: "",
      is_active: true,
      ...initialData,
    },
  });

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="نام و نام خانوادگی" error={errors.full_name?.message} required>
          <Input {...register("full_name")} />
        </FormField>
        <FormField label="شماره تماس" error={errors.phone?.message}>
          <Input {...register("phone")} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="سمت" error={errors.position?.message} required>
          <Input {...register("position")} />
        </FormField>
        <FormField label="دستمزد روزانه">
          <Input type="number" {...register("daily_wage")} />
        </FormField>
      </div>

      <FormField label="حقوق ماهانه">
        <Input type="number" {...register("monthly_fee")} />
      </FormField>

      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={(v) => setValue("is_active", v)}
          id="is_active"
        />
        <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
          فعال
        </label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
