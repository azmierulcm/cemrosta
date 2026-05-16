'use client';

import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { StatsStrip } from './StatsStrip';
import { MonthlyRecap } from './MonthlyRecap';
import { DestinationsGrid } from './DestinationsGrid';

import { ProfileData } from '@/lib/types';

interface ProfileFilledProps {
  data: ProfileData;
  onEdit?: () => void;
}

export const ProfileFilled = ({ data, onEdit }: ProfileFilledProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-32 space-y-12 md:space-y-16">
      <ProfileHeader 
        name={data.name}
        role={data.role}
        homeBase={data.homeBase}
        aircraftType={data.aircraftType}
        onEdit={onEdit}
      />

      <StatsStrip stats={data.lifetimeStats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-12">
          <MonthlyRecap recap={data.monthlyRecap} />
        </div>
        
        <div className="lg:col-span-12 mt-8">
          <DestinationsGrid 
            destinations={data.destinations}
            collectedCount={data.lifetimeStats.citiesCollected}
            totalCount={data.lifetimeStats.totalAvailableCities}
          />
        </div>
      </div>
    </div>
  );
};


