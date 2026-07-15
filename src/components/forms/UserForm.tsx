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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  username: z.string().min(3, "نام کاربری حداقل ۳ کاراکتر"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر").optional().or(z.literal("")),
  full_name: z.string().min(1, "نام را وارد کنید"),
  role: z.string().min(1, "نقش را انتخاب کنید"),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface UserFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading, isAdmin }: UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      full_name: "",
      role: "",
      is_active: true,
      ...initialData,
    },
  });

  const isActive = watch("is_active");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="نام کاربری" error={errors.username?.message} required>
          <Input {...register("username")} />
        </FormField>
        <FormField label="نام و نام خانوادگی" error={errors.full_name?.message} required>
          <Input {...register("full_name")} />
        </FormField>
      </div>

      <FormField
        label={initialData ? "رمز عبور جدید (خالی بگذارید بدون تغییر)" : "رمز عبور"}
        error={errors.password?.message}
        required={!initialData}
      >
        <Input type="password" {...register("password")} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="نقش" error={errors.role?.message} required>
          <Select
            value={initialData?.role}
            onValueChange={(v) => setValue("role", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب نقش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدیر</SelectItem>
              <SelectItem value="operator">اپراتور</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {isAdmin && (
          <div className="flex items-end gap-3 pb-2">
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setValue("is_active", v)}
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              فعال
            </label>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <LoadingSpinner size="sm" /> : "ذخیره"}
      </Button>
    </form>
  );
}
