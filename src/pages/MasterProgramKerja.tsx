import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SimpleNamaFormDialog } from "@/components/master/SimpleNamaFormDialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useProgramKerja } from "@/hooks/useProgramKerja";
import { usePermissions } from "@/hooks/usePermissions";

const MasterProgramKerja = () => {
  const { programKerjaList, isLoading, createProgramKerja, updateProgramKerja, deleteProgramKerja } = useProgramKerja();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  const filtered = programKerjaList.filter((p: any) =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => { setEditingItem(null); setFormOpen(true); };
  const handleEdit = (item: any) => { setEditingItem(item); setFormOpen(true); };
  const handleDelete = (item: any) => setDeletingItem(item);

  const confirmDelete = () => {
    if (!deletingItem) return;
    deleteProgramKerja.mutate(deletingItem.id_program_kerja);
    setDeletingItem(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingItem) {
      await updateProgramKerja.mutateAsync({ ...data, id: editingItem.id_program_kerja });
    } else {
      await createProgramKerja.mutateAsync(data);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 py-7 px-6 md:px-12 text-white mb-2 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Master Program Kerja</h1>
        <p className="text-blue-100/85">Kelola daftar program kerja (Rutin, Non Rutin, TA, OH)</p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-700">Daftar Program Kerja ({filtered.length})</h2>
        {canCreate && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Program Kerja
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                      Belum ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item: any) => (
                    <TableRow key={item.id_program_kerja}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {canEdit && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <SimpleNamaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
        onSubmit={handleFormSubmit}
        isLoading={createProgramKerja.status === "pending" || updateProgramKerja.status === "pending"}
        title="Tambah Program Kerja"
        editTitle="Edit Program Kerja"
        placeholder="Contoh: Rutin, Non Rutin, TA, OH"
      />

      <ConfirmDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="Hapus Program Kerja?"
        description={`Apakah Anda yakin ingin menghapus '${deletingItem?.nama}'?`}
      />
    </div>
  );
};

export default MasterProgramKerja;
