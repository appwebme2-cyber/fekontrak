import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { isStaffOrAdminRole } from '@/hooks/useRolePermissionsConfig';

const API_URL = "https://bekontrak-production.up.railway.app/api";

const today = () => new Date().toISOString().split('T')[0];

const buildPayload = (contract: any) => ({
  idVendor: contract.id_vendor || '',
  judulKontrak: contract.judul_kontrak || '',
  noDokumenKontrak: contract.no_dokumen_kontrak || null,
  noPoPr: contract.no_po_pr || null,
  direksiPekerjaan: contract.direksi_pekerjaan || null,
  tipeKontrak: contract.tipe_kontrak || '',
  statusKontrak: contract.status_kontrak || 'Pre-KOM',
  tanggalSpbDiterima: contract.tanggal_terima_dokumen || contract.tanggal_spb_diterima || today(),
  estimasiTanggalKom: contract.estimasi_tanggal_kom || today(),
  tanggalTerimaDokumen: contract.tanggal_terima_dokumen || null,
  tanggalMaksimalKom: contract.tanggal_maksimal_kom || null,
  tanggalKom: contract.tanggal_kom || null,
  tanggalMulai: contract.tanggal_mulai || null,
  tanggalSelesai: contract.tanggal_selesai || null,
  slaKomHari: contract.sla_kom_hari || 14,
  nilaiAwal: contract.nilai_awal || null,
  durasiKontrakHari: contract.durasi_kontrak_hari || null,
  progressPlan: contract.progress_plan || 0,
  progressActual: contract.progress_actual || 0,
  aktivitasSaatIni: contract.aktivitas_saat_ini || null,
  kendala: contract.kendala || null,
  disiplin: contract.disiplin || null,
  tkdnPercentage: contract.tkdn_percentage || null,
  tanggalLkp: contract.tanggal_lkp || null,
  kboBagian: contract.kbo_bagian || null,
  programKerja: contract.id_program_kerja || null,
  planner: contract.id_planner || null,
  // MPL/MPA/Masa Pemeliharaan — angka (hari). ?? null biar nilai 0 tetap terkirim
  tanggalMpl: contract.tanggal_mpl ?? null,
  tanggalMpa: contract.tanggal_mpa ?? null,
  masaPemeliharaanHari: contract.masa_pemeliharaan_hari ?? null,
  contractDocuments: contract.contract_documents
    ? (typeof contract.contract_documents === 'string'
        ? contract.contract_documents
        : JSON.stringify(contract.contract_documents))
    : null,
  amendmentDocuments: contract.amendment_documents
    ? (typeof contract.amendment_documents === 'string'
        ? contract.amendment_documents
        : JSON.stringify(contract.amendment_documents))
    : null,
});

export const useContracts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  const canCRUD = isStaffOrAdminRole(userProfile?.role);

  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/contracts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal ambil kontrak");
      return data.map((c: any) => ({
        id_kontrak: c.idKontrak,
        id_vendor: c.idVendor,
        judul_kontrak: c.judulKontrak,
        no_dokumen_kontrak: c.noDokumenKontrak,
        no_po_pr: c.noPoPr,
        direksi_pekerjaan: c.direksiPekerjaan,
        tipe_kontrak: c.tipeKontrak,
        status_kontrak: c.statusKontrak,
        tanggal_mulai: c.tanggalMulai,
        tanggal_selesai: c.tanggalSelesai,
        tanggal_terima_dokumen: c.tanggalTerimaDokumen,
        estimasi_tanggal_kom: c.estimasiTanggalKom,
        tanggal_kom: c.tanggalKom,
        tanggal_lkp: c.tanggalLkp,
        nilai_awal: c.nilaiAwal,
        durasi_kontrak_hari: c.durasiKontrakHari,
        progress_plan: c.progressPlan,
        progress_actual: c.progressActual,
        aktivitas_saat_ini: c.aktivitasSaatIni,
        kendala: c.kendala,
        disiplin: c.disiplin,
        tkdn_percentage: c.tkdnPercentage,
        kbo_bagian: c.kboBagian,
        id_program_kerja: c.programKerja,
        id_planner: c.planner,
        sla_kom_hari: c.slaKomHari,
        // MPL/MPA/Masa Pemeliharaan — petakan balik dari API
        tanggal_mpl: c.tanggalMpl,
        tanggal_mpa: c.tanggalMpa,
        masa_pemeliharaan_hari: c.masaPemeliharaanHari,
        contract_documents: c.contractDocuments || null,
        amendment_documents: c.amendmentDocuments || null,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
        vendor: c.vendor ? {
          id_vendor: c.vendor.idVendor,
          nama_vendor: c.vendor.namaVendor,
          alamat: c.vendor.alamat,
          npwp: c.vendor.npwp,
          pic_nama: c.vendor.picNama,
          pic_kontak: c.vendor.picKontak,
        } : null
      }));
    }
  });

  const createContract = useMutation({
    mutationFn: async (contract: any) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildPayload(contract))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({ title: "Berhasil", description: "Kontrak berhasil ditambahkan" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menambahkan kontrak", variant: "destructive" });
    }
  });

  const updateContract = useMutation({
    mutationFn: async ({ id_kontrak, ...contract }: any) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/contracts/${id_kontrak}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildPayload(contract))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
      toast({ title: "Berhasil", description: "Kontrak berhasil diperbarui" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal memperbarui kontrak", variant: "destructive" });
    }
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/contracts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal hapus kontrak");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({ title: "Berhasil", description: "Kontrak berhasil dihapus" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menghapus kontrak", variant: "destructive" });
    }
  });

  return { contracts, isLoading, error, createContract, updateContract, deleteContract, canCRUD };
};

export const useKontraks = () => useContracts();
export const useCreateKontrak = () => useContracts().createContract;
export const useUpdateKontrak = () => useContracts().updateContract;