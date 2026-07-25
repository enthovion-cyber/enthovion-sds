'use client';
import { useRouter } from 'next/navigation';
import SdsUploadZone from '@/components/sds/SdsUploadZone';
import Card from '@/components/ui/Card';
import { useSds } from '@/hooks/useSds';
import { useLocale } from '@/hooks/useLocale';

export default function SdsUploadPage() {
  const { upload, isLoading } = useSds();
  const { locale } = useLocale();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    const result = await upload(file);
   if (result?.sds?.id) {
  router.push(`/${locale}/sds/${result.sds.id}`);
  router.refresh(); // 🔥 IMPORTANT
}
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Upload SDS</h1>
        <p className="text-sm text-gray-500 mt-0.5">Import existing SDS documents — PDF, Word, or scanned images</p>
      </div>
      <Card>
        <SdsUploadZone onUpload={handleUpload} isLoading={isLoading} />
      </Card>
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-900 mb-1">What happens after upload?</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>→ AI extracts all 16 GHS sections from your document</li>
          <li>→ Each field gets a confidence score — low-confidence fields are flagged for your review</li>
          <li>→ A compliance audit runs automatically against current regulations</li>
          <li>→ You review, edit if needed, and approve before publishing</li>
        </ul>
      </div>
    </div>
  );
}
