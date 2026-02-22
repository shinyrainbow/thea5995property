'use client';

// =============================================================================
// THE A 5995 - Create Property Page
// =============================================================================

import { useState, useEffect } from 'react';
import PropertyForm from '@/components/admin/PropertyForm';
import type { PropertyType } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePropertyPage() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPropertyTypes() {
      try {
        const response = await fetch('/api/property-types');
        if (response.ok) {
          const data = await response.json();
          setPropertyTypes(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch property types:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPropertyTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-secondary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/properties"
          className="p-2 text-luxury-500 hover:text-primary-700 hover:bg-luxury-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-700">
            Add New Property
          </h1>
          <p className="text-luxury-500 mt-1">
            Create a new property listing
          </p>
        </div>
      </div>

      <PropertyForm propertyTypes={propertyTypes} />
    </div>
  );
}
