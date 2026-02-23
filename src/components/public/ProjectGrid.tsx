// =============================================================================
// THE A 5995 - Project Grid Component
// =============================================================================

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectCard from './ProjectCard';
import type { Project, ProjectImage, PropertyType } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProjectWithImages = Project & { images: ProjectImage[]; property_type?: PropertyType };

export interface ProjectGridProps {
  projects: ProjectWithImages[];
  loading?: boolean;
  className?: string;
  skeletonCount?: number;
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white animate-pulse">
      <div className="aspect-[4/3] bg-luxury-100" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 h-5 w-3/4 rounded bg-luxury-100" />
        <div className="mb-3 h-4 w-1/2 rounded bg-luxury-100" />
        <div className="mb-3 h-3.5 w-2/3 rounded bg-luxury-100" />
        <div className="mt-auto border-t border-luxury-100 pt-3">
          <div className="flex gap-4">
            <div className="h-4 w-16 rounded bg-luxury-100" />
            <div className="h-4 w-12 rounded bg-luxury-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectGrid({
  projects,
  loading = false,
  className,
  skeletonCount = 6,
}: ProjectGridProps) {
  const locale = useLocale();
  const t = useTranslations('common');

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-100">
          <FolderKanban className="h-8 w-8 text-luxury-400" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold text-primary-700">
          {t('noResults')}
        </h3>
        <p className="max-w-sm text-luxury-500">
          Try adjusting your filters or search criteria to find projects.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} locale={locale} />
      ))}
    </div>
  );
}
