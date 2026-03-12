import fs from 'fs';
import path from 'path';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);
const GALLERY_TILE_CLASSES = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[5/4]'];
const PHOTO_TILE_CLASSES = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/3]'];
const REGIONS = [
{ key: 'china', label: 'China' },
{ key: 'worldwide', label: 'Worldwide' }
];

function folderToTitle(name) {
return name
.replace(/[-_]/g, ' ')
.replace(/\b\w/g, (char) => char.toUpperCase());
}

function fileToAlt(fileName) {
return fileName
.replace(/\.[^.]+$/, '')
.replace(/[-_]/g, ' ')
.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(dateInput) {
const date = new Date(dateInput);
if (Number.isNaN(date.getTime())) {
return '';
}

return date.toLocaleDateString('en-CA', {
year: 'numeric',
month: 'short',
day: '2-digit'
});
}

function formatDateTime(dateInput) {
const date = new Date(dateInput);
if (Number.isNaN(date.getTime())) {
return '';
}

return date.toLocaleString('en-CA', {
year: 'numeric',
month: 'short',
day: '2-digit',
hour: '2-digit',
minute: '2-digit'
});
}

function readJsonFile(filePath) {
if (!fs.existsSync(filePath)) {
return null;
}

try {
return JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (error) {
return null;
}
}

function formatPhotoDetails(metadata, createdAt) {
if (!metadata) {
return createdAt ? `Created ${createdAt}` : '';
}

const details = [];
if (metadata.shootDateTime) {
details.push(`Shot ${metadata.shootDateTime}`);
}
if (metadata.cameraModel) {
details.push(metadata.cameraModel);
}
if (metadata.city) {
details.push(metadata.city);
}
if (metadata.notes) {
details.push(metadata.notes);
}

if (details.length > 0) {
return details.join('  ');
}

return createdAt ? `Created ${createdAt}` : '';
}

function getMetadataForPhoto(folderMeta, sidecarMeta, fileName, baseName) {
const fromFolder = folderMeta?.[fileName] ?? folderMeta?.[baseName] ?? null;
const raw = sidecarMeta ?? fromFolder;

if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
return null;
}

const shootDateTime = raw.shootDateTime ? formatDateTime(raw.shootDateTime) : '';

return {
name: typeof raw.name === 'string' ? raw.name.trim() : '',
cameraModel: typeof raw.cameraModel === 'string' ? raw.cameraModel.trim() : '',
shootDateTime,
city: typeof raw.city === 'string' ? raw.city.trim() : '',
notes: typeof raw.notes === 'string' ? raw.notes.trim() : ''
};
}

function Lightbox({ photos, index, onClose, onPrev, onNext }) {
const photo = photos[index];
const hasPrev = index > 0;
const hasNext = index < photos.length - 1;

useEffect(() => {
const handleKeyDown = (event) => {
if (event.key === 'Escape') {
onClose();
}
if (event.key === 'ArrowLeft' && hasPrev) {
onPrev();
}
if (event.key === 'ArrowRight' && hasNext) {
onNext();
}
};

document.body.style.overflow = 'hidden';
window.addEventListener('keydown', handleKeyDown);

return () => {
document.body.style.overflow = '';
window.removeEventListener('keydown', handleKeyDown);
};
}, [hasNext, hasPrev, onClose, onNext, onPrev]);

if (!photo) {
return null;
}

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4" onClick={onClose}>
<button
type="button"
aria-label="Close photo"
className="absolute right-5 top-5 text-3xl text-white/75 transition hover:text-white"
onClick={onClose}
>
&times;
</button>
<button
type="button"
aria-label="Previous photo"
disabled={!hasPrev}
className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 px-4 py-3 text-2xl text-white transition ${
hasPrev ? 'hover:bg-white/10' : 'cursor-default opacity-20'
}`}
onClick={(event) => {
event.stopPropagation();
if (hasPrev) {
onPrev();
}
}}
>
&#8592;
</button>
<div className="mx-auto flex max-h-[88vh] max-w-6xl flex-col items-center" onClick={(event) => event.stopPropagation()}>
<img src={photo.src} alt={photo.alt} className="max-h-[78vh] max-w-full rounded-sm object-contain shadow-2xl" />
<div className="mt-4 text-center">
<div className="text-sm uppercase tracking-[0.3em] text-white/70">{photo.alt}</div>
{photo.details ? <div className="mt-2 text-xs uppercase tracking-[0.25em] text-white/55">{photo.details}</div> : null}
<div className="mt-2 text-xs uppercase tracking-[0.25em] text-white/45">
{index + 1} / {photos.length}
</div>
</div>
</div>
<button
type="button"
aria-label="Next photo"
disabled={!hasNext}
className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 px-4 py-3 text-2xl text-white transition ${
hasNext ? 'hover:bg-white/10' : 'cursor-default opacity-20'
}`}
onClick={(event) => {
event.stopPropagation();
if (hasNext) {
onNext();
}
}}
>
&#8594;
</button>
</div>
);
}

function NetworkBackground() {
return (
<svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 600" aria-hidden="true">
<defs>
<filter id="glow">
<feGaussianBlur stdDeviation="4" result="coloredBlur" />
<feMerge>
<feMergeNode in="coloredBlur" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>
<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stopColor="#13406a" />
<stop offset="60%" stopColor="#0b2038" />
<stop offset="100%" stopColor="#070d1b" />
</linearGradient>
</defs>

<rect width="1200" height="600" fill="url(#bgGradient)" />

<g opacity="0.55">
<line x1="60" y1="50" x2="250" y2="160" stroke="#39c6ff" strokeWidth="1.2" />
<line x1="250" y1="160" x2="430" y2="110" stroke="#31b4ff" strokeWidth="1" />
<line x1="430" y1="110" x2="600" y2="220" stroke="#1d9cf2" strokeWidth="1.4" />
<line x1="130" y1="260" x2="330" y2="350" stroke="#39c6ff" strokeWidth="1.1" />
<line x1="330" y1="350" x2="520" y2="310" stroke="#2ca9ff" strokeWidth="1.3" />
<line x1="520" y1="310" x2="700" y2="420" stroke="#3ed3ff" strokeWidth="1" />
<line x1="740" y1="160" x2="910" y2="230" stroke="#2090e4" strokeWidth="1.2" />
<line x1="910" y1="230" x2="1080" y2="140" stroke="#3ec8ff" strokeWidth="1" />
<line x1="860" y1="390" x2="1030" y2="450" stroke="#34b3ff" strokeWidth="1.2" />
</g>

<g filter="url(#glow)">
<circle cx="60" cy="50" r="5" fill="#7de3ff" opacity="0.9" />
<circle cx="250" cy="160" r="6" fill="#59d7ff" opacity="0.85" />
<circle cx="430" cy="110" r="4" fill="#67e3ff" opacity="0.78" />
<circle cx="600" cy="220" r="6" fill="#5ccfff" opacity="0.85" />
<circle cx="130" cy="260" r="4" fill="#68d8ff" opacity="0.8" />
<circle cx="330" cy="350" r="6" fill="#7de3ff" opacity="0.9" />
<circle cx="520" cy="310" r="5" fill="#59d7ff" opacity="0.82" />
<circle cx="700" cy="420" r="6" fill="#67e3ff" opacity="0.88" />
<circle cx="740" cy="160" r="5" fill="#68d8ff" opacity="0.75" />
<circle cx="910" cy="230" r="6" fill="#7de3ff" opacity="0.85" />
<circle cx="1080" cy="140" r="4" fill="#59d7ff" opacity="0.7" />
<circle cx="860" cy="390" r="6" fill="#67e3ff" opacity="0.82" />
<circle cx="1030" cy="450" r="5" fill="#68d8ff" opacity="0.78" />
</g>
</svg>
);
}

function RegionButtons({ activeRegion, onSelectRegion, onGoHome }) {
return (
<div className="border-b border-blue-500/20 bg-[#0f1b2e]/90 px-4 py-4 sm:px-6">
<div className="flex flex-wrap items-center justify-center gap-3">
<button
type="button"
onClick={() => onSelectRegion('china')}
className={`rounded-md border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
activeRegion === 'china'
? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
: 'border-cyan-500/35 bg-transparent text-cyan-300/70 hover:text-cyan-100'
}`}
>
China
</button>
<button
type="button"
onClick={() => onSelectRegion('worldwide')}
className={`rounded-md border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
activeRegion === 'worldwide'
? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
: 'border-cyan-500/35 bg-transparent text-cyan-300/70 hover:text-cyan-100'
}`}
>
Worldwide
</button>
<button
type="button"
onClick={onGoHome}
className={`rounded-md border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
activeRegion === null
? 'border-cyan-300 bg-cyan-400/15 text-cyan-100'
: 'border-cyan-500/35 bg-transparent text-cyan-300/70 hover:text-cyan-100'
}`}
>
Initial Page
</button>
</div>
</div>
);
}

export default function Home({ galleries }) {
const [activeRegion, setActiveRegion] = useState(null);
const [activeGalleryId, setActiveGalleryId] = useState(null);
const [lightboxIndex, setLightboxIndex] = useState(null);

const galleriesInRegion = useMemo(() => {
if (!activeRegion) {
return [];
}
return galleries[activeRegion] ?? [];
}, [activeRegion, galleries]);

const activeGallery = useMemo(() => galleriesInRegion.find((gallery) => gallery.id === activeGalleryId) ?? null, [activeGalleryId, galleriesInRegion]);
const photos = activeGallery?.photos ?? [];

const openRegion = useCallback((regionKey) => {
setActiveRegion(regionKey);
setActiveGalleryId(null);
setLightboxIndex(null);
}, []);

const openGallery = useCallback((galleryId) => {
setActiveGalleryId(galleryId);
setLightboxIndex(null);
}, []);

const goToInitialPage = useCallback(() => {
setActiveRegion(null);
setActiveGalleryId(null);
setLightboxIndex(null);
}, []);

const closeGallery = useCallback(() => {
setActiveGalleryId(null);
setLightboxIndex(null);
}, []);

const closeLightbox = useCallback(() => setLightboxIndex(null), []);
const showPrev = useCallback(() => setLightboxIndex((value) => Math.max(0, value - 1)), []);
const showNext = useCallback(() => setLightboxIndex((value) => Math.min(photos.length - 1, value + 1)), [photos.length]);

const currentRegionLabel = REGIONS.find((item) => item.key === activeRegion)?.label;

return (
<>
<Head>
<title>Ziaozhao Photography</title>
<meta name="description" content="Gallery-based photography website with location folders and fullscreen image browsing." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/images/favicon.svg" />
</Head>

<div className="relative min-h-screen px-3 py-6 text-white sm:px-6 lg:px-8" style={{ background: '#071120' }}>
<NetworkBackground />
<div className="relative z-10">
<div className="mx-auto max-w-7xl overflow-hidden border border-blue-500/30 bg-[#1a2844] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
<div className="flex items-center gap-2 border-b border-blue-500/20 bg-[#0f1b2e] px-5 py-4">
<span className="h-3 w-3 rounded-full bg-[#ff6b57]" />
<span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
<span className="h-3 w-3 rounded-full bg-[#28c840]" />
<div className="ml-6 hidden h-10 flex-1 items-center rounded-full bg-[#00ccff]/15 px-4 text-sm text-[#60d5ff] sm:flex">
https://ziaozhao.photography
</div>
</div>

<div className="border-b border-blue-500/20 bg-gradient-to-b from-[#1a3a5a] to-[#0f1b2e] px-6 py-6 text-center">
<p className="text-xs uppercase tracking-[0.45em] text-cyan-300/50">Ziaozhao Photography</p>
<h1 className="mt-2 font-serif text-3xl uppercase tracking-[0.2em] text-cyan-200 sm:text-4xl">Photolux Style Gallery</h1>
<p className="mt-3 text-sm uppercase tracking-[0.35em] text-cyan-400/60">
{activeGallery ? activeGallery.title : currentRegionLabel ? `${currentRegionLabel} Locations` : 'Locations'}
</p>
</div>

{lightboxIndex === null ? (
<RegionButtons activeRegion={activeRegion} onSelectRegion={openRegion} onGoHome={goToInitialPage} />
) : null}

{!activeRegion ? (
<main className="bg-gradient-to-b from-[#152a42] to-[#0f1b2e] px-4 py-8 sm:px-6 sm:py-10">
<div className="mx-auto max-w-5xl">
<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
{REGIONS.map((region) => {
const locationCount = galleries[region.key]?.length ?? 0;
const photoCount = (galleries[region.key] ?? []).reduce((count, gallery) => count + gallery.photos.length, 0);

return (
<button
key={region.key}
type="button"
onClick={() => openRegion(region.key)}
className="group overflow-hidden rounded-sm border border-cyan-400/20 bg-[#0f1f35]/80 text-left transition hover:border-cyan-300/60"
>
<div className="aspect-[16/8] bg-gradient-to-r from-cyan-700/20 via-cyan-400/10 to-transparent p-6">
<div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/55">Region</div>
<div className="mt-3 font-serif text-4xl text-cyan-100">{region.label}</div>
<div className="mt-4 text-xs uppercase tracking-[0.25em] text-cyan-300/70">
{locationCount} location{locationCount === 1 ? '' : 's'}
</div>
<div className="mt-2 text-xs uppercase tracking-[0.25em] text-cyan-300/70">
{photoCount} photo{photoCount === 1 ? '' : 's'}
</div>
</div>
</button>
);
})}
</div>
</div>
</main>
) : !activeGallery ? (
<main className="bg-gradient-to-b from-[#152a42] to-[#0f1b2e] px-4 py-4 sm:px-6 sm:py-6">
{galleriesInRegion.length === 0 ? (
<div className="flex min-h-[50vh] items-center justify-center border border-dashed border-cyan-400/25 bg-blue-950/20 p-10 text-center text-sm uppercase tracking-[0.3em] text-cyan-300/60">
Add location folders inside public/images/photos/{activeRegion}/
</div>
) : (
<div className="overflow-x-auto pb-3 [scrollbar-color:#22d3ee22_transparent] [scrollbar-width:thin]">
<div className="flex min-w-max gap-4">
{galleriesInRegion.map((gallery, index) => (
<button
key={gallery.id}
type="button"
className="group w-[290px] shrink-0 overflow-hidden border border-cyan-400/20 bg-[#0f1f35] text-left transition hover:border-cyan-400/60"
onClick={() => openGallery(gallery.id)}
aria-label={`Open ${gallery.title}`}
>
<div className={`overflow-hidden bg-black ${GALLERY_TILE_CLASSES[index % GALLERY_TILE_CLASSES.length]}`}>
{gallery.cover ? (
<img
src={gallery.cover}
alt={gallery.title}
className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-85"
/>
) : (
<div className="flex h-full min-h-[260px] items-center justify-center text-5xl text-cyan-400/20">&#128247;</div>
)}
</div>
<div className="border-t border-cyan-400/20 px-4 py-4">
<div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/50">Location / Gallery</div>
<div className="mt-2 font-serif text-2xl leading-tight text-cyan-100">{gallery.title}</div>
<div className="mt-3 text-xs uppercase tracking-[0.3em] text-cyan-400/70">
{gallery.photos.length} photo{gallery.photos.length === 1 ? '' : 's'}
</div>
</div>
</button>
))}
</div>
</div>
)}
</main>
) : (
<main className="bg-gradient-to-b from-[#132035] to-[#0f1b2e] px-4 py-4 sm:px-6 sm:py-6">
<div className="mb-5 flex flex-col gap-3 border-b border-cyan-400/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
<button
type="button"
onClick={closeGallery}
className="inline-flex w-fit items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-400/70 transition hover:text-cyan-200"
>
<span className="text-lg leading-none">&#8592;</span>
Back To Locations
</button>
<div className="text-xs uppercase tracking-[0.35em] text-cyan-400/60">Click any figure to open fullscreen</div>
</div>
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
{photos.map((photo, index) => (
<button
key={photo.src}
type="button"
className="group overflow-hidden border border-cyan-400/15 bg-[#0a1420] text-left transition hover:border-cyan-400/50"
onClick={() => setLightboxIndex(index)}
aria-label={`View ${photo.alt}`}
>
<div className={`overflow-hidden ${PHOTO_TILE_CLASSES[index % PHOTO_TILE_CLASSES.length]}`}>
<img
src={photo.src}
alt={photo.alt}
className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-85"
/>
</div>
<div className="border-t border-cyan-400/15 px-4 py-3">
<div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/50">Figure {index + 1}</div>
<div className="mt-2 font-serif text-xl leading-tight text-cyan-100">{photo.alt}</div>
{photo.details ? <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-cyan-300/55">{photo.details}</div> : null}
</div>
</button>
))}
</div>
</main>
)}
</div>
</div>
</div>

{lightboxIndex !== null && photos.length > 0 ? (
<Lightbox photos={photos} index={lightboxIndex} onClose={closeLightbox} onPrev={showPrev} onNext={showNext} />
) : null}
</>
);
}

export async function getStaticProps() {
const photosDir = path.join(process.cwd(), 'public', 'images', 'photos');
const galleries = {
china: [],
worldwide: []
};

if (fs.existsSync(photosDir)) {
const buildRegionGalleries = (regionKey) => {
const regionPath = path.join(photosDir, regionKey);

if (!fs.existsSync(regionPath)) {
return [];
}

const folders = fs
.readdirSync(regionPath, { withFileTypes: true })
.filter((entry) => entry.isDirectory())
.map((entry) => entry.name)
.sort();

return folders.map((folderName) => {
const folderPath = path.join(regionPath, folderName);
const folderMeta = readJsonFile(path.join(folderPath, 'metadata.json'));
const files = fs
.readdirSync(folderPath)
.filter((fileName) => IMAGE_EXTS.has(path.extname(fileName).toLowerCase()))
.sort();

const photos = files.map((fileName) => {
const filePath = path.join(folderPath, fileName);
const baseName = fileName.replace(/\.[^.]+$/, '');
const sidecarMeta = readJsonFile(path.join(folderPath, `${baseName}.json`));
const customMeta = getMetadataForPhoto(folderMeta, sidecarMeta, fileName, baseName);
const stats = fs.statSync(filePath);
const createdAt = formatDate(stats.birthtimeMs ? stats.birthtime : stats.mtime);

return {
src: `/images/photos/${regionKey}/${folderName}/${fileName}`,
alt: customMeta?.name || fileToAlt(fileName),
details: formatPhotoDetails(customMeta, createdAt)
};
});

return {
id: `${regionKey}/${folderName}`,
title: folderToTitle(folderName),
cover: photos[0]?.src ?? null,
photos
};
});
};

for (const region of REGIONS) {
galleries[region.key] = buildRegionGalleries(region.key);
}

const hasRegionFolders = REGIONS.some((region) => fs.existsSync(path.join(photosDir, region.key)));

if (!hasRegionFolders) {
// Backward compatibility for old flat structure under public/images/photos/<location>
const legacyFolders = fs
.readdirSync(photosDir, { withFileTypes: true })
.filter((entry) => entry.isDirectory())
.map((entry) => entry.name)
.sort();

galleries.worldwide = legacyFolders.map((folderName) => {
const folderPath = path.join(photosDir, folderName);
const folderMeta = readJsonFile(path.join(folderPath, 'metadata.json'));
const files = fs
.readdirSync(folderPath)
.filter((fileName) => IMAGE_EXTS.has(path.extname(fileName).toLowerCase()))
.sort();

const photos = files.map((fileName) => {
const filePath = path.join(folderPath, fileName);
const baseName = fileName.replace(/\.[^.]+$/, '');
const sidecarMeta = readJsonFile(path.join(folderPath, `${baseName}.json`));
const customMeta = getMetadataForPhoto(folderMeta, sidecarMeta, fileName, baseName);
const stats = fs.statSync(filePath);
const createdAt = formatDate(stats.birthtimeMs ? stats.birthtime : stats.mtime);

return {
src: `/images/photos/${folderName}/${fileName}`,
alt: customMeta?.name || fileToAlt(fileName),
details: formatPhotoDetails(customMeta, createdAt)
};
});

return {
id: `worldwide/${folderName}`,
title: folderToTitle(folderName),
cover: photos[0]?.src ?? null,
photos
};
});
}
}

return {
props: {
galleries
}
};
}
