
interface KontrakLumpsumErrorStateProps {
  error: Error;
}

export function KontrakLumpsumErrorState({ error }: KontrakLumpsumErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="max-w-md text-center bg-white rounded shadow px-6 py-8">
        <h2 className="text-lg font-semibold mb-2">Error memuat kontrak</h2>
        <p className="text-red-500 mb-4">{error.message || "Gagal memuat data kontrak. Silakan refresh atau hubungi admin."}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Coba Lagi</button>
      </div>
    </div>
  );
}
