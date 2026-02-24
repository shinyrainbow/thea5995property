'use client';

// =============================================================================
// THE A 5995 - Edit Project Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProjectForm from '@/components/admin/ProjectForm';
import type { PropertyType, ProjectWithDetails } from '@/types';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('admin');

  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectRes, typesRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch('/api/property-types'),
        ]);

        if (!projectRes.ok) {
          setError(t('projectNotFound'));
          return;
        }

        const projectData = await projectRes.json();
        setProject(projectData.data);

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          const allTypes: PropertyType[] = typesData.data || [];
          const projectTypes = allTypes.filter((t) => t.has_projects);
          if (projectTypes.length === 0) {
            const fallbackSlugs = ['condo', 'townhouse', 'apartment'];
            const fallback = allTypes.filter((t) =>
              fallbackSlugs.includes(t.slug_en?.toLowerCase() ?? ''),
            );
            setPropertyTypes(fallback.length > 0 ? fallback : allTypes);
          } else {
            setPropertyTypes(projectTypes);
          }
        }
      } catch (err) {
        setError(t('failedToLoad'));
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

  if (error || !project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
        <p className="text-red-600 font-medium">{error || t('projectNotFound')}</p>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 mt-4 text-secondary-500 hover:text-secondary-600 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToProjects')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="p-2 text-luxury-500 hover:text-primary-700 hover:bg-luxury-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-700">
            {t('editProject')}
          </h1>
          <p className="text-luxury-500 mt-1">{project.name_en}</p>
        </div>
      </div>

      <ProjectForm project={project} propertyTypes={propertyTypes} />
    </div>
  );
}
