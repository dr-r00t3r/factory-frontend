"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMembers } from "@/hooks";

const schema = z.object({
  member_id: z.string({ required_error: "پرسنل را انتخاب کنید" }),
  amount: z.string().min(1, "مبلغ را وارد کنید"),
  salary_date: z.string().min(1, "تاریخ را وارد کنید"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SalaryFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function SalaryForm({ initialData, onSubmit, isLoading }: SalaryFormProps) {
  const { data: membersData } = useMembers({ page_size: 100 });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      salary_date: "",
      description: "",
      ...initialData,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="پرسنل" error={errors.member_id?.message} required>
        <Select
          value={initialData?.member_id}
          onValueChange={(v) => setValue("member_id", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="انتخاب پرسنل" />
          </SelectTrigger>
          <SelectContent>
            {membersData?.results?.map((member) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.name} - {member.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="مبلغ" error={errors.amount?.message} required>
          <Input type="number" {...register("amount")} />
        </FormField>
        <PersianDatePicker
          label="تاریخ حقوق"
          value={initialData?.salary_date}
          onChange={(v) => setValue("salary_date", v)}
          error={errors.salary_date?.message}
          required
        />
      </div>

      <FormField label="توضیحات" error={errors.description?.message}>
        <Textarea {...register("description")} />
      </FormField>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
