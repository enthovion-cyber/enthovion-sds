'use client';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { JURISDICTIONS, LANGUAGES } from '@/utils/constants';
import type { GenerateSdsInput } from '@/types/sds.types';

interface Props { onSubmit: (data: GenerateSdsInput) => Promise<void>; isLoading: boolean; }

export default function SdsGeneratorForm({ onSubmit, isLoading }: Props) {
  const { register, handleSubmit } = useForm<GenerateSdsInput>({
    defaultValues: { jurisdiction: 'US_OSHA', language: 'en' },
  });

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-900 mb-5">Chemical information</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Chemical name" placeholder="e.g. Hydrochloric Acid" {...register('chemicalName')} />
          <Input label="CAS Number" placeholder="e.g. 7647-01-0" {...register('casNumber')} />
          <Input label="Molecular formula" placeholder="e.g. HCl" {...register('formula')} />
          <Input label="Product code (optional)" placeholder="e.g. CHM-001" {...register('productCode')} />
          <Input label="Manufacturer (optional)" placeholder="Company name" {...register('manufacturer')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400" {...register('jurisdiction')}>
              {JURISDICTIONS.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output language</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400" {...register('language')}>
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional context (optional)</label>
          <textarea rows={3} placeholder="Any additional information about the chemical, intended use, or special requirements..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            {...register('additionalContext')} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" isLoading={isLoading} size="lg">
            {isLoading ? 'Generating SDS...' : 'Generate SDS'}
          </Button>
          {isLoading && <p className="text-sm text-gray-500">This takes about 30–60 seconds</p>}
        </div>
      </form>
    </Card>
  );
}
