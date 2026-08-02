
import { AmendmentForm } from './forms/AmendmentForm';

interface ContractAmendmentsProps {
  idKontrak: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  nilaiAwal?: string;
}

export const ContractAmendments = ({ idKontrak, tanggalMulai, tanggalSelesai, nilaiAwal }: ContractAmendmentsProps) => {
  return (
    <AmendmentForm 
      idKontrak={idKontrak}
      tanggalMulai={tanggalMulai}
      tanggalSelesai={tanggalSelesai}
      nilaiAwal={nilaiAwal}
    />
  );
};
