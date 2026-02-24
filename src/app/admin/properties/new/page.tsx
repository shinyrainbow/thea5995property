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
  const [projects, setProjects] = useState<Array<{ id: string; name_en: string; property_type_id: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [typesRes, projectsRes] = await Promise.all([
          fetch('/api/property-types'),
          fetch('/api/projects?perPage=100&status=all'),
        ]);
        if (typesRes.ok) {
          const data = await typesRes.json();
          setPropertyTypes(data.data || []);
        }
        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(
            (data.data || []).map((p: { id: string; name_en: string; property_type_id: string }) => ({
              id: p.id,
              name_en: p.name_en,
              property_type_id: String(p.property_type_id),
            })),
          );
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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

      <PropertyForm propertyTypes={propertyTypes} projects={projects} />
    </div>
  );
}
