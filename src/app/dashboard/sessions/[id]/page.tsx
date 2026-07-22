"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { CustomerSearch } from "@/components/shared/CustomerSearch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useProcessSession,
  useProcessSessionAddInput,
  useProcessSessionRemoveInput,
  useProcessSessionStart,
  useProcessSessionComplete,
  useRiceInputs,
  useDeleteMutation,
} from "@/hooks";
import { API_ENDPOINTS } from "@/lib/constants";
import { toPersianNumber, formatPersianDate } from "@/lib/utils";
import { ArrowRight, Play, CheckCircle, Trash2 } from "lucide-react";
import type { ProcessInput, Customer } from "@/types";

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = Number(params.id);

  const { data: session, isLoading, refetch } = useProcessSession(sessionId);
  const deleteMutation = useDeleteMutation(API_ENDPOINTS.PROCESS_SESSIONS);
  const addInputMutation = useProcessSessionAddInput();
  const removeInputMutation = useProcessSessionRemoveInput();
  const startMutation = useProcessSessionStart();
  const completeMutation = useProcessSessionComplete();

  const [addInputDialogOpen, setAddInputDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteInputId, setDeleteInputId] = useState<number | null>(null);

  const [inputCustomer, setInputCustomer] = useState<Customer | null>(null);
  const [inputRiceInputId, setInputRiceInputId] = useState("");
  const [inputBagCount, setInputBagCount] = useState("");

  const { data: riceInputsData } = useRiceInputs(
    inputCustomer ? { customer_id: inputCustomer.id, page_size: 200 } : undefined
  );

  if (isLoading) return <LoadingSpinner className="min-h-[60vh]" size="lg" />;
  if (!session) {
    return (
      <PageShell title="نشست یافت نشد">
        <Button onClick={() => router.push("/dashboard/process-lines")}>بازگشت</Button>
      </PageShell>
    );
  }

  const handleAddInput = () => {
    if (!inputCustomer || !inputRiceInputId) return;
    addInputMutation.mutate(
      { id: sessionId, data: { rice_input_id: parseInt(inputRiceInputId), customer_id: inputCustomer.id, bag_count: parseFloat(inputBagCount) } },
      { onSuccess: () => { setAddInputDialogOpen(false); setInputCustomer(null); setInputRiceInputId(""); setInputBagCount(""); } }
    );
  };

  const handleRemoveInput = (inputId: number) => {
    removeInputMutation.mutate({ sessionId, inputId }, { onSuccess: () => { setDeleteInputId(null); refetch(); } });
  };

  const groupedInputs = session.inputs.reduce<Record<number, { name: string; inputs: ProcessInput[]; totalBags: number }>>(
    (acc, input) => {
      if (!acc[input.customer_id]) acc[input.customer_id] = { name: input.customer_name || `مشتری #${input.customer_id}`, inputs: [], totalBags: 0 };
      acc[input.customer_id].inputs.push(input);
      acc[input.customer_id].totalBags += input.bag_count;
      return acc;
    }, {}
  );

  const getStatusBadge = () => {
    if (session.is_completed) return <Badge variant="success">تکمیل شده</Badge>;
    if (session.is_started) return <Badge variant="info">در حال اجرا</Badge>;
    return <Badge variant="warning">شروع نشده</Badge>;
  };

  return (
    <PageShell
      title={`نشست خط شماره ${toPersianNumber(session.process_number)}`}
      description={session.description || undefined}
      actions={
        <Button variant="outline" onClick={() => router.push(`/dashboard/process-lines/${session.process_line_id}`)}>
          <ArrowRight className="h-4 w-4 ml-1" />بازگشت به خط
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">وضعیت</CardTitle></CardHeader><CardContent>{getStatusBadge()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">ظرفیت</CardTitle></CardHeader><CardContent>{toPersianNumber(session.capacity_bag_count)} کیسه</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">پر شده</CardTitle></CardHeader><CardContent>{toPersianNumber(session.filled_bag_count)} / {toPersianNumber(session.capacity_bag_count)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">درصد پر شدن</CardTitle></CardHeader><CardContent>{toPersianNumber(session.fill_percentage)}٪ (نیاز: {toPersianNumber(session.fill_percentage_required)}٪)</CardContent></Card>
      </div>

      {session.session_date && (
        <p className="text-sm text-muted-foreground mb-4">تاریخ نشست: {formatPersianDate(session.session_date)}</p>
      )}

      {session.is_started && !session.is_completed && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => completeMutation.mutate(sessionId)} disabled={completeMutation.isPending}>
            <CheckCircle className="h-4 w-4 ml-1" />تکمیل نشست
          </Button>
        </div>
      )}

      {!session.is_started && !session.is_completed && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => startMutation.mutate(sessionId)} disabled={startMutation.isPending}>
            <Play className="h-4 w-4 ml-1" />شروع نشست
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 ml-1" />حذف نشست
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">ورودی‌ها ({session.inputs.length})</h3>
        {!session.is_completed && (
          <Button onClick={() => setAddInputDialogOpen(true)}>افزودن ورودی</Button>
        )}
      </div>

      {Object.entries(groupedInputs).length === 0 ? (
        <p className="text-muted-foreground">هنوز ورودی ثبت نشده است</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInputs).map(([customerId, group]) => (
            <div key={customerId} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{group.name}</h4>
                <span className="text-sm text-muted-foreground">{toPersianNumber(group.totalBags)} کیسه</span>
              </div>
              <div className="space-y-1">
                {group.inputs.map((input) => (
                  <div key={input.id} className="flex justify-between items-center text-sm">
                    <span>{formatPersianDate(input.rice_input_date)} - {toPersianNumber(input.bag_count)} کیسه</span>
                    {!session.is_started && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveInput(input.id)}>حذف</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addInputDialogOpen} onOpenChange={setAddInputDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>افزودن ورودی</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <FormField label="مشتری" required>
              <CustomerSearch value={inputCustomer} onChange={(c) => { setInputCustomer(c); setInputRiceInputId(""); setInputBagCount(""); }} />
            </FormField>
            {inputCustomer && (
              <FormField label="ورودی برنج" required>
                <Select value={inputRiceInputId} onValueChange={(v) => { setInputRiceInputId(v); const ri = riceInputsData?.results?.find((r) => r.id === parseInt(v)); if (ri?.bag_count) setInputBagCount(String(ri.bag_count)); }}>
                  <SelectTrigger><SelectValue placeholder="انتخاب ورودی" /></SelectTrigger>
                  <SelectContent>
                    {riceInputsData?.results?.map((ri) => (
                      <SelectItem key={ri.id} value={String(ri.id)}>
                        {formatPersianDate(ri.input_date)} | {ri.bag_count ? `${toPersianNumber(ri.bag_count)} کیسه` : ""} {ri.weight_kg ? `${toPersianNumber(ri.weight_kg)} کیلو` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
            <FormField label="تعداد کیسه" required>
              <Input type="number" value={inputBagCount} onChange={(e) => setInputBagCount(e.target.value)} />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddInputDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleAddInput} disabled={!inputCustomer || !inputRiceInputId || !inputBagCount || addInputMutation.isPending}>افزودن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={() => deleteMutation.mutate(sessionId, { onSuccess: () => router.push("/dashboard/process-lines") })} isLoading={deleteMutation.isPending} />
    </PageShell>
  );
}
