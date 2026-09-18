"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProjectFormData {
  id?: string;
  name: string;
  plan: string;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: ProjectFormData | null;
  onSubmit: (data: ProjectFormData) => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: ProjectDialogProps) {
  const [formData, setFormData] = React.useState<ProjectFormData>({
    id: "",
    name: "",
    plan: "",
  });

  // Sync internal form state when dialog opens or initialData changes
  React.useEffect(() => {
    if (open) {
      setFormData({
        id: initialData?.id || "",
        name: initialData?.name || "",
        plan: initialData?.plan || "",
      });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      id: formData.id,
      name: formData.name.trim(),
      plan: formData.plan.trim() || (mode === "add" ? "Free" : ""),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new project workspace."
              : "Update your project details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g. Acme Inc"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description (Plan)</Label>
            <Input
              value={formData.plan}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  plan: e.target.value,
                }))
              }
              placeholder="e.g. Enterprise"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Create Project" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
