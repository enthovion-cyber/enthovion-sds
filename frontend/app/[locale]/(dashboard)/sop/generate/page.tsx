'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SopGeneratorForm from '@/components/sop/SopGeneratorForm';
import { useSop } from '@/hooks/useSop';
import { useSds } from '@/hooks/useSds';
import { useLocale } from '@/hooks/useLocale';
import type { GenerateSopInput } from '@/types/sop.types';

export default function SopGeneratePage() {
  const { generate, isLoading } = useSop();
  const { list, fetchAll } = useSds();
  const { locale } = useLocale();
  const router = useRouter();

  useEffect(() => { fetchAll({ status: 'approved', limit: 100 }); }, []);

  const handleGenerate = async (data: GenerateSopInput) => {
    const sop = await generate(data);
    if (sop?.id) router.push(`/${locale}/sop/${sop.id}`);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Generate SOP</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a step-by-step operating procedure from an approved SDS — in any language including Arabic</p>
      </div>
      <SopGeneratorForm approvedSdsList={list} onSubmit={handleGenerate} isLoading={isLoading} />
    </div>
  );
}
