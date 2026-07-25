'use client';

import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SOP_TYPES, LANGUAGES } from '@/utils/constants';
import type { GenerateSopInput } from '@/types/sop.types';
import type { SdsListItem } from '@/types/sds.types';

interface Props {
  approvedSdsList: SdsListItem[];
  onSubmit: (data: GenerateSopInput) => Promise<void>;
  isLoading: boolean;
}

export default function SopGeneratorForm({ approvedSdsList, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateSopInput>({
    defaultValues: {
      language: 'en',
      type: 'handling',
      sdsId: '',
    },
  });

  const hasNoSds = approvedSdsList.length === 0;

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-900 mb-5">
        Generate Standard Operating Procedure
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        {/* Source SDS Selection */}
        <div>
          <label htmlFor="sdsId" className="block text-sm font-medium text-gray-700 mb-1">
            Source SDS document
          </label>
          <select
            id="sdsId"
            disabled={hasNoSds || isLoading}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors ${
              errors.sdsId ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('sdsId', { required: 'Please select a document' })}
          >
            <option value="" disabled>
              {hasNoSds ? 'No documents available' : 'Select an approved SDS...'}
            </option>
            {approvedSdsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.chemicalName} {s.casNumber ? `(${s.casNumber})` : ''}
              </option>
            ))}
          </select>
          
          {/* Helper / Error Messages */}
          {hasNoSds ? (
            <p className="text-xs text-amber-600 mt-1">
              No approved SDS documents found. Please approve a document first.
            </p>
          ) : errors.sdsId ? (
            <p className="text-xs text-red-500 mt-1">{errors.sdsId.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* SOP Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              SOP type
            </label>
            <select
              id="type"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...register('type')}
            >
              {SOP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Output language
            </label>
            <select
              id="language"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...register('language')}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={hasNoSds || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Generating SOP...' : 'Generate SOP'}
          </Button>
        </div>
      </form>
    </Card>
  );
}