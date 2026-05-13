import { useState, useCallback } from 'react';
import { MapChart } from '../../../components/Map';
import MapFilters from '../../../components/MapFilters';

const MapDash = () => {
  const [filters, setFilters] = useState({
    disease: '',
    risk: 'all',
    order: 'count_desc'
  });
  const [isMapLoading, setIsMapLoading] = useState(false);

  const diseaseConfig: Record<string, {
    colorScale?: string[];
    thresholds?: number[];
    customParams?: Record<string, string>;
  }> = {
    'COVID-19': {
      thresholds: [5, 15, 30, 50],
      colorScale: ['#FEF3C7', '#FCA511', '#F97316', '#DC2626', '#991B1B'],
      customParams: { 'severityLevel': 'critical', 'reportingType': 'immediate' }
    },
    'Dengue': {
      thresholds: [10, 25, 50, 75],
      colorScale: ['#F88379', '#DC143C', '#880808', '#660000', '#4c0505'],
      customParams: { 'vectorType': 'mosquito', 'seasonal': 'true' }
    },
    'Influenza': {
      thresholds: [20, 40, 60, 80],
      colorScale: ['#E0F2FE', '#F59E0B', '#DC2626', '#991B1B', '#7F1D1D'],
      customParams: { 'strainType': 'seasonal', 'vaccinationStatus': 'tracked' }
    }
  };

  const handleFiltersChange = useCallback((newFilters: {
    disease: string;
    risk: string;
    order: string;
  }) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <MapChart
          filters={filters}
          onLoadingChange={setIsMapLoading}
          diseaseConfig={diseaseConfig}
        />
      </div>
      <div className="absolute top-4 left-4 z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <MapFilters
          onFiltersChange={handleFiltersChange}
          isLoading={isMapLoading}
        />
      </div>

    </div>
  );
};

export default MapDash;