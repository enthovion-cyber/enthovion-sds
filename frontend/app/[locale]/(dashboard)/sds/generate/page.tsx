'use client';
import { useRouter } from 'next/navigation';
import SdsGeneratorForm from '@/components/sds/SdsGeneratorForm';
import { useSds } from '@/hooks/useSds';
import { useLocale } from '@/hooks/useLocale';
import type { GenerateSdsInput } from '@/types/sds.types';

export default function SdsGeneratePage() {
  const { generate, isLoading } = useSds();
  const { locale } = useLocale();
  const router = useRouter();

  const handleGenerate = async (data: GenerateSdsInput) => {
    const sds = await generate(data);
    if (sds?.id) router.push(`/${locale}/sds/${sds.id}`);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Generate SDS</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI creates a compliant 16-section GHS Safety Data Sheet in minutes</p>
      </div>
      <SdsGeneratorForm onSubmit={handleGenerate} isLoading={isLoading} />
    </div>
  );
}
