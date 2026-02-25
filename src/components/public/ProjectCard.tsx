// =============================================================================
// THE A 5995 - Project Card Component
// =============================================================================

import { Link } from '@/i18n/routing';
import { MapPin, Building2, Users, Calendar } from 'lucide-react';
import { cn, getLocalizedField, getLocalizedProvince } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Project, ProjectImage, PropertyType } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectCardProps {
  project: Project & { images: ProjectImage[]; property_type?: PropertyType };
  locale: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Status badge mapping
// ---------------------------------------------------------------------------

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  active: 'success',
  completed: 'info',
  under_construction: 'warning',
  draft: 'default',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  under_construction: 'Under Construction',
  draft: 'Draft',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectCard({
  project,
  locale,
  className,
}: ProjectCardProps) {
  const name = getLocalizedField(project, 'name', locale);
  const slug = getLocalizedField(project, 'slug', locale);

  // Get primary image or first available
  const primaryImage =
    project.images.find((img) => img.is_primary) || project.images[0];
  const imageUrl = primaryImage?.url || '/images/placeholder-property.jpg';
  const imageAlt = primaryImage
    ? getLocalizedField(primaryImage, 'alt', locale) || name
    : name;

  const typeName = project.property_type
    ? getLocalizedField(project.property_type, 'name', locale)
    : null;

  return (
    <Link
      href={`/projects/${slug}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-luxury-200 bg-white',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-luxury-200/50 hover:-translate-y-1',
        className,
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent" />

        {/* Property type badge - top left */}
        {typeName ? (
          <div className="absolute left-3 top-3">
            <Badge variant="default" className="text-xs shadow-sm bg-white/90 text-primary-700 backdrop-blur-sm">
              {typeName.toUpperCase()}
            </Badge>
          </div>
        ) : null}

        {/* Status badge - top right */}
        <div className="absolute right-3 top-3">
          <Badge
            variant={statusVariant[project.status] || 'default'}
            className="text-xs shadow-sm backdrop-blur-sm"
            dot
          >
            {statusLabel[project.status] || project.status}
          </Badge>
        </div>

        {/* Developer name - bottom left */}
        {project.developer_name && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-block rounded-md bg-primary-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {project.developer_name}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Project name */}
        <h3 className="mb-1.5 min-h-13 line-clamp-2 font-heading text-lg font-semibold text-primary-700 group-hover:text-secondary-500 transition-colors">
          {name}
        </h3>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1 text-sm text-luxury-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary-400" />
          <span className="truncate">
            {[project.district, project.province ? getLocalizedProvince(project.province, locale) : ''].filter(Boolean).join(', ')}
          </span>
        </div>

        {/* Info row */}
        <div className="mt-auto flex items-center gap-4 border-t border-luxury-100 pt-3 min-h-10">
          {project.total_units && (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <Building2 className="h-4 w-4 text-luxury-400" />
              <span>{project.total_units} Units</span>
            </div>
          )}
          {project.year_built && (
            <div className="flex items-center gap-1.5 text-sm text-luxury-600">
              <Calendar className="h-4 w-4 text-luxury-400" />
              <span>{project.year_built}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
