'use client';

// =============================================================================
// THE A 5995 - Edit Property Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';
import type { PropertyType, PropertyWithDetails } from '@/types';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditPropertyPage() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<PropertyWithDetails | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name_en: string; property_type_id: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propertyRes, typesRes, projectsRes] = await Promise.all([
          fetch(`/api/properties/${id}`),
          fetch('/api/property-types'),
          fetch('/api/projects?perPage=100'),
        ]);

        if (!propertyRes.ok) {
          setError('Property not found');
          return;
        }

        const propertyData = await propertyRes.json();
        setProperty(propertyData.data);

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          setPropertyTypes(typesData.data || []);
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(
            (projectsData.data || []).map((p: { id: string; name_en: string; property_type_id: string }) => ({
              id: p.id,
              name_en: p.name_en,
              property_type_id: String(p.property_type_id),
            })),
          );
        }
      } catch (err) {
        setError('Failed to load property data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-secondary-400 animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium">{error || 'Property not found'}</p>
        <Link
          href="/admin/properties"
          className="inline-flex items-center gap-2 mt-4 text-secondary-500 hover:text-secondary-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
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
            Edit Property
          </h1>
          <p className="text-luxury-500 mt-1">{property.title_en}</p>
        </div>
      </div>

      <PropertyForm property={property} propertyTypes={propertyTypes} projects={projects} />
    </div>
  );
}
