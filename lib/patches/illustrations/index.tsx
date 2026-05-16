import React from 'react';

// Dynamically import or map IATA to SVG content
// For Phase 4, we'll manually export them as React components for simplicity and performance

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const KUL = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M30 65V15M30 40H50M50 65V15M25 15H35M45 15H55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SIN = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 50C20 30 60 30 60 50M20 50Q20 65 40 65Q60 65 60 50M40 30V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="40" cy="40" r="2" fill="currentColor"/>
  </svg>
);

export const SYD = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 60L40 20L60 60M25 60L40 30L55 60M30 60L40 40L50 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LHR = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 60V25L40 15L60 25V60M30 60V35H50V60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const NRT = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M15 60L40 20L65 60M30 45H50M40 20V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BKK = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 60V20M60 60V20M20 40H60M40 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const HKG = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M30 60V20H50V60M35 20V15H45V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="35" y="30" width="10" height="10" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const AMS = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M25 60V30L40 20L55 30V60M35 60V40H45V60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DXB = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 10V60M20 60H60M25 50L40 40L55 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ICN = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 60V20L40 10L60 20V60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="40" cy="35" r="10" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const MEL = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 15V65M20 30H60M30 45H50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CGK = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 10V60M30 60H50M35 15H45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DPS = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 60C50 60 60 50 60 40C60 30 50 20 40 20C30 20 20 30 20 40C20 50 30 60 40 60ZM40 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DOH = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 10V60M30 10H50M20 30V40H60V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CDG = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 65L40 15L60 65M30 45H50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FRA = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M20 60V30L40 20L60 30V60M20 45H60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BNE = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M25 60V30C25 20 55 20 55 30V60M25 45H55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PER = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 15L20 40H60L40 15ZM40 40V65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BOM = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M30 60V20L40 10L50 20V60M30 40H50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DEL = (props: IconProps) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width={props.size || 80} height={props.size || 80} {...props}>
    <path d="M40 10V30M20 30H60M25 60L40 30L55 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ILLUSTRATIONS: Record<string, React.FC<IconProps>> = {
  KUL, SIN, SYD, LHR, NRT, BKK, HKG, AMS, DXB, ICN,
  MEL, CGK, DPS, DOH, CDG, FRA, BNE, PER, BOM, DEL
};
