"use client";

import { setEmployeeNumber } from "@/app/actions";
import { Dialog } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

export const EmployeeNumberDialog = ({ userId }: { userId: string }) => {
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

  return <Dialog></Dialog>;
};
