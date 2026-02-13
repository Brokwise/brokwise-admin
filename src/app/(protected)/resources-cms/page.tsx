"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ResourceItem,
  ResourceOpenMode,
  ResourceScope,
  ResourceSection,
  ResourceStatus,
  ResourceTargetType,
  ResourceState,
  useBrokerResourceCatalogPreview,
  useCreateResourceItem,
  useCreateResourceState,
  useDeleteResourceItem,
  useDeleteResourceState,
  usePatchResourceItemStatus,
  useReorderResourceItems,
  useResourceItems,
  useResourceStates,
  useSeedDefaultResources,
  useUpdateResourceItem,
  useUpdateResourceState,
} from "@/hooks/useResourcesCMS";

type StateFormData = {
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type ItemFormData = {
  key: string;
  label: string;
  section: ResourceSection;
  scope: ResourceScope;
  stateCode?: string;
  targetType: ResourceTargetType;
  target: string;
  openMode: ResourceOpenMode;
  icon?: string;
  description?: string;
  status: ResourceStatus;
  isActive: boolean;
  sortOrder: number;
};

const defaultStateForm: StateFormData = {
  code: "",
  name: "",
  sortOrder: 100,
  isActive: true,
};

const defaultItemForm: ItemFormData = {
  key: "",
  label: "",
  section: "resource",
  scope: "state",
  targetType: "external",
  target: "",
  openMode: "new_tab",
  icon: "",
  description: "",
  status: "draft",
  isActive: true,
  sortOrder: 100,
};

const ResourceTable = ({
  title,
  description,
  items,
  states,
  onAdd,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onPublish,
  onDraft,
  sortInput,
  onSortChange,
  onSaveSort,
  isBusy,
}: {
  title: string;
  description: string;
  items: ResourceItem[];
  states: ResourceState[];
  onAdd: () => void;
  onEdit: (item: ResourceItem) => void;
  onDuplicate: (item: ResourceItem) => void;
  onArchive: (item: ResourceItem) => void;
  onDelete: (item: ResourceItem) => void;
  onPublish: (item: ResourceItem) => void;
  onDraft: (item: ResourceItem) => void;
  sortInput: Record<string, number>;
  onSortChange: (id: string, value: number) => void;
  onSaveSort: (items: ResourceItem[]) => void;
  isBusy: boolean;
}) => {
  const stateMap = useMemo(
    () => new Map(states.map((state) => [state.code, state.name])),
    [states]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => onSaveSort(items)}
              disabled={isBusy || items.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Sort Order
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell>{item.key}</TableCell>
                  <TableCell>{item.scope}</TableCell>
                  <TableCell>
                    {item.scope === "state"
                      ? stateMap.get(item.stateCode || "") || item.stateCode
                      : "Common"}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">{item.target}</TableCell>
                  <TableCell className="uppercase text-xs">{item.status}</TableCell>
                  <TableCell>{item.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={sortInput[item._id] ?? item.sortOrder}
                      onChange={(e) => onSortChange(item._id, Number(e.target.value || 0))}
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDuplicate(item)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          item.status === "published" ? onDraft(item) : onPublish(item)
                        }
                        title={item.status === "published" ? "Move to Draft" : "Publish"}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onArchive(item)}
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(item)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const ResourcesCMSPage = () => {
  const [activeTab, setActiveTab] = useState("states");

  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [previewState, setPreviewState] = useState<string>("RJ");

  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const [editingState, setEditingState] = useState<ResourceState | null>(null);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);

  const [stateForm, setStateForm] = useState<StateFormData>(defaultStateForm);
  const [itemForm, setItemForm] = useState<ItemFormData>(defaultItemForm);

  const [sortInput, setSortInput] = useState<Record<string, number>>({});

  const { data: states = [], isLoading: statesLoading } = useResourceStates(false);
  const { data: items = [], isLoading: itemsLoading } = useResourceItems({
    includeHistory: false,
  });
  const { data: previewCatalog, isLoading: previewLoading } =
    useBrokerResourceCatalogPreview(previewState === "all" ? undefined : previewState);

  const createState = useCreateResourceState();
  const updateState = useUpdateResourceState();
  const deleteState = useDeleteResourceState();

  const createItem = useCreateResourceItem();
  const updateItem = useUpdateResourceItem();
  const patchStatus = usePatchResourceItemStatus();
  const deleteItem = useDeleteResourceItem();
  const reorderItems = useReorderResourceItems();
  const seedDefaults = useSeedDefaultResources();

  const isBusy =
    createState.isPending ||
    updateState.isPending ||
    deleteState.isPending ||
    createItem.isPending ||
    updateItem.isPending ||
    patchStatus.isPending ||
    deleteItem.isPending ||
    reorderItems.isPending ||
    seedDefaults.isPending;

  const stateOptions = useMemo(
    () => states.filter((state) => state.isActive),
    [states]
  );

  const filteredResourceLinks = useMemo(() => {
    return items
      .filter((item) => item.section === "resource")
      .filter((item) => {
        if (selectedStatusFilter !== "all" && item.status !== selectedStatusFilter) {
          return false;
        }
        if (selectedStateFilter === "all") return true;
        if (selectedStateFilter === "common") return item.scope === "common";
        return item.scope === "state" && item.stateCode === selectedStateFilter;
      });
  }, [items, selectedStatusFilter, selectedStateFilter]);

  const filteredTools = useMemo(() => {
    return items
      .filter((item) => item.section === "tool")
      .filter((item) => {
        if (selectedStatusFilter !== "all" && item.status !== selectedStatusFilter) {
          return false;
        }
        if (selectedStateFilter === "all") return true;
        if (selectedStateFilter === "common") return item.scope === "common";
        return item.scope === "state" && item.stateCode === selectedStateFilter;
      });
  }, [items, selectedStatusFilter, selectedStateFilter]);

  const openCreateStateDialog = () => {
    setEditingState(null);
    setStateForm(defaultStateForm);
    setStateDialogOpen(true);
  };

  const openEditStateDialog = (state: ResourceState) => {
    setEditingState(state);
    setStateForm({
      code: state.code,
      name: state.name,
      sortOrder: state.sortOrder,
      isActive: state.isActive,
    });
    setStateDialogOpen(true);
  };

  const saveState = async () => {
    if (editingState) {
      await updateState.mutateAsync({
        id: editingState._id,
        payload: {
          name: stateForm.name,
          isActive: stateForm.isActive,
          sortOrder: stateForm.sortOrder,
        },
      });
    } else {
      await createState.mutateAsync({
        code: stateForm.code.toUpperCase(),
        name: stateForm.name,
        isActive: stateForm.isActive,
        sortOrder: stateForm.sortOrder,
      });
    }

    setStateDialogOpen(false);
    setStateForm(defaultStateForm);
  };

  const openCreateItemDialog = (section: ResourceSection) => {
    setEditingItem(null);
    setItemForm({
      ...defaultItemForm,
      section,
      scope: section === "tool" ? "common" : "state",
      stateCode: section === "tool" ? undefined : previewState,
      status: "draft",
      isActive: true,
    });
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (item: ResourceItem) => {
    setEditingItem(item);
    setItemForm({
      key: item.key,
      label: item.label,
      section: item.section,
      scope: item.scope,
      stateCode: item.stateCode,
      targetType: item.targetType,
      target: item.target,
      openMode: item.openMode,
      icon: item.icon,
      description: item.description,
      status: item.status,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setItemDialogOpen(true);
  };

  const duplicateItem = (item: ResourceItem) => {
    setEditingItem(null);
    setItemForm({
      key: `${item.key}-copy`,
      label: `${item.label} Copy`,
      section: item.section,
      scope: item.scope,
      stateCode: item.stateCode,
      targetType: item.targetType,
      target: item.target,
      openMode: item.openMode,
      icon: item.icon,
      description: item.description,
      status: "draft",
      isActive: item.isActive,
      sortOrder: item.sortOrder + 1,
    });
    setItemDialogOpen(true);
  };

  const saveItem = async () => {
    const payload = {
      key: itemForm.key,
      label: itemForm.label,
      section: itemForm.section,
      scope: itemForm.scope,
      stateCode: itemForm.scope === "state" ? itemForm.stateCode : undefined,
      targetType: itemForm.targetType,
      target: itemForm.target,
      openMode: itemForm.openMode,
      icon: itemForm.icon,
      description: itemForm.description,
      status: itemForm.status,
      isActive: itemForm.isActive,
      sortOrder: itemForm.sortOrder,
    };

    if (editingItem) {
      await updateItem.mutateAsync({
        id: editingItem._id,
        payload,
      });
    } else {
      await createItem.mutateAsync(payload);
    }

    setItemDialogOpen(false);
    setEditingItem(null);
    setItemForm(defaultItemForm);
  };

  const saveSortOrder = async (visibleItems: ResourceItem[]) => {
    await reorderItems.mutateAsync(
      visibleItems.map((item) => ({
        id: item._id,
        sortOrder: sortInput[item._id] ?? item.sortOrder,
      }))
    );
  };

  const loading = statesLoading || itemsLoading;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Resources CMS</CardTitle>
              <CardDescription>
                Manage states, resource links and tools shown in broker sidebar.
              </CardDescription>
            </div>
            <Button onClick={() => seedDefaults.mutate()} disabled={seedDefaults.isPending}>
              {seedDefaults.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Import Default Dataset
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview Sidebar</CardTitle>
          <CardDescription>
            Preview published content exactly as broker users will see it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="w-60">
              <Label>Preview State</Label>
              <Select value={previewState} onValueChange={setPreviewState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((state) => (
                    <SelectItem value={state.code} key={state._id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {previewLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading preview...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {previewCatalog?.tools.length ? (
                    previewCatalog.tools.map((item) => <div key={item._id}>{item.label}</div>)
                  ) : (
                    <div className="text-muted-foreground">No tools</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Common Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {previewCatalog?.commonResources.length ? (
                    previewCatalog.commonResources.map((item) => (
                      <div key={item._id}>{item.label}</div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">No common links</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">State Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {previewCatalog?.stateResources.length ? (
                    previewCatalog.stateResources.map((item) => (
                      <div key={item._id}>{item.label}</div>
                    ))
                  ) : (
                    <div className="text-muted-foreground">No state links</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="w-60">
              <Label>Filter by State</Label>
              <Select value={selectedStateFilter} onValueChange={setSelectedStateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="common">Common Only</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state._id} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-60">
              <Label>Filter by Status</Label>
              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="states">State Management</TabsTrigger>
          <TabsTrigger value="resources">Resource Links</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="states" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>States</CardTitle>
                  <CardDescription>Activate/deactivate and order available states.</CardDescription>
                </div>
                <Button onClick={openCreateStateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add State
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {states.map((state) => (
                      <TableRow key={state._id}>
                        <TableCell>{state.code}</TableCell>
                        <TableCell>{state.name}</TableCell>
                        <TableCell>{state.isActive ? "Yes" : "No"}</TableCell>
                        <TableCell>{state.sortOrder}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditStateDialog(state)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteState.mutate(state._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <ResourceTable
            title="Resource Links"
            description="Manage common and state-specific links shown under Resources."
            items={filteredResourceLinks}
            states={states}
            onAdd={() => openCreateItemDialog("resource")}
            onEdit={openEditItemDialog}
            onDuplicate={duplicateItem}
            onArchive={(item) => patchStatus.mutate({ id: item._id, status: "archived", isActive: false })}
            onDelete={(item) => deleteItem.mutate(item._id)}
            onPublish={(item) => patchStatus.mutate({ id: item._id, status: "published", isActive: true })}
            onDraft={(item) => patchStatus.mutate({ id: item._id, status: "draft", isActive: true })}
            sortInput={sortInput}
            onSortChange={(id, value) =>
              setSortInput((prev) => ({
                ...prev,
                [id]: value,
              }))
            }
            onSaveSort={saveSortOrder}
            isBusy={isBusy}
          />
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <ResourceTable
            title="Tools"
            description="Manage tools shown under Tools section in sidebar."
            items={filteredTools}
            states={states}
            onAdd={() => openCreateItemDialog("tool")}
            onEdit={openEditItemDialog}
            onDuplicate={duplicateItem}
            onArchive={(item) => patchStatus.mutate({ id: item._id, status: "archived", isActive: false })}
            onDelete={(item) => deleteItem.mutate(item._id)}
            onPublish={(item) => patchStatus.mutate({ id: item._id, status: "published", isActive: true })}
            onDraft={(item) => patchStatus.mutate({ id: item._id, status: "draft", isActive: true })}
            sortInput={sortInput}
            onSortChange={(id, value) =>
              setSortInput((prev) => ({
                ...prev,
                [id]: value,
              }))
            }
            onSaveSort={saveSortOrder}
            isBusy={isBusy}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={stateDialogOpen} onOpenChange={setStateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingState ? "Edit State" : "Add State"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={stateForm.code}
                  onChange={(e) =>
                    setStateForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  disabled={!!editingState}
                  placeholder="RJ"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={stateForm.sortOrder}
                  onChange={(e) =>
                    setStateForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={stateForm.name}
                onChange={(e) =>
                  setStateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Rajasthan"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label>Active</Label>
              <Switch
                checked={stateForm.isActive}
                onCheckedChange={(checked) =>
                  setStateForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveState} disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save State
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={itemForm.label}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={itemForm.key}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, key: e.target.value.toLowerCase() }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={itemForm.section}
                onValueChange={(value: ResourceSection) =>
                  setItemForm((prev) => ({
                    ...prev,
                    section: value,
                    scope: value === "tool" ? "common" : prev.scope,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select
                value={itemForm.scope}
                onValueChange={(value: ResourceScope) =>
                  setItemForm((prev) => ({ ...prev, scope: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {itemForm.scope === "state" && (
              <div className="space-y-2">
                <Label>State</Label>
                <Select
                  value={itemForm.stateCode || ""}
                  onValueChange={(value) =>
                    setItemForm((prev) => ({ ...prev, stateCode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state._id} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Target Type</Label>
              <Select
                value={itemForm.targetType}
                onValueChange={(value: ResourceTargetType) =>
                  setItemForm((prev) => ({ ...prev, targetType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External URL</SelectItem>
                  <SelectItem value="internal">Internal Path</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Open Mode</Label>
              <Select
                value={itemForm.openMode}
                onValueChange={(value: ResourceOpenMode) =>
                  setItemForm((prev) => ({ ...prev, openMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_tab">Open New Tab</SelectItem>
                  <SelectItem value="webview">Open In App WebView</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Target</Label>
              <Input
                value={itemForm.target}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, target: e.target.value }))
                }
                placeholder={
                  itemForm.targetType === "external"
                    ? "https://example.gov.in"
                    : "/resources/news"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Icon (Optional)</Label>
              <Input
                value={itemForm.icon || ""}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, icon: e.target.value }))
                }
                placeholder="Map"
              />
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={itemForm.sortOrder}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    sortOrder: Number(e.target.value || 0),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={itemForm.status}
                onValueChange={(value: ResourceStatus) =>
                  setItemForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label>Active</Label>
              <Switch
                checked={itemForm.isActive}
                onCheckedChange={(checked) =>
                  setItemForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={itemForm.description || ""}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveItem} disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourcesCMSPage;
