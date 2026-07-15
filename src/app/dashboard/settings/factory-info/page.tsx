"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/FormField";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { Save, Factory, MapPin, Phone, User } from "lucide-react";

const FACTORY_INFO_KEY = "factory-info";

interface FactoryInfo {
  name: string;
  address: string;
  phone: string;
  manager: string;
  description: string;
}

export default function FactoryInfoPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: [FACTORY_INFO_KEY],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/api/factory-info/");
        return data as FactoryInfo;
      } catch {
        return { name: "", address: "", phone: "", manager: "", description: "" } as FactoryInfo;
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async (info: FactoryInfo) => {
      const { data } = await apiClient.put("/api/factory-info/", info);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [FACTORY_INFO_KEY] }),
  });

  const [formData, setFormData] = useState<FactoryInfo>({ name: "", address: "", phone: "", manager: "", description: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleSubmit = () => {
    mutation.mutate(formData, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;

  return (
    <PageShell title="تنظیمات کارخانه" description="مشخصات و اطلاعات کارخانه">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            اطلاعات کارخانه
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="نام کارخانه">
              <div className="relative">
                <Factory className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="نام کارخانه"
                />
              </div>
            </FormField>
            <FormField label="مدیر کارخانه">
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="نام مدیر"
                />
              </div>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="تلفن">
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="تلفن تماس"
                />
              </div>
            </FormField>
            <FormField label="آدرس">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pr-10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="آدرس کارخانه"
                />
              </div>
            </FormField>
          </div>
          <FormField label="توضیحات">
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات اضافی"
            />
          </FormField>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              <Save className="h-4 w-4 ml-1" />
              {saved ? "ذخیره شد" : "ذخیره"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
