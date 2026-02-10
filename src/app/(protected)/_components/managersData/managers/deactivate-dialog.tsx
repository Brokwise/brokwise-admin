"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeactivateManager } from "@/hooks/useManager";
import { Manager } from "@/types/manager";
import { Loader2 } from "lucide-react";

interface DeactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager: Manager | null;
}

export function DeactivateDialog({
  open,
  onOpenChange,
  manager,
}: DeactivateDialogProps) {
  const deactivateManager = useDeactivateManager();

  const handleDeactivate = async () => {
    if (!manager) return;

    try {
      await deactivateManager.mutateAsync(manager._id);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!manager) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Manager</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold">
              {manager.first_name} {manager.last_name}
            </span>
            ? They will no longer be able to log in to the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeactivate}
            disabled={deactivateManager.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deactivateManager.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
