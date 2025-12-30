"use client";

import { setEmployeeNumber } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const EmployeeNumberDialog = ({ userId }: { userId: string }) => {
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(true);

  const handleSubmit = async (formData: FormData) => {
    try {
      const empemployeeNumber = Number(formData.get("employeeNumber"));
      await setEmployeeNumber(userId, empemployeeNumber);
      setOpen(false);
      toast.success("社員番号を設定しました");
    } catch (error) {
      toast.error("社員番号の設定に失敗しました");
      console.error("Error updating member:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setNumber("");
        setOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>社員番号を入力</DialogTitle>
            <DialogDescription>社員番号を入力してください</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Input
                name="employeeNumber"
                type="number"
                id="employeeNumber"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!number}>
              決定
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
