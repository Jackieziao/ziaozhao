/**
 * Portfolio page — dynamic gallery driven by the filesystem.
 *
 * HOW TO ADD A NEW GALLERY BLOCK:
 *   1. Create a sub-folder inside  public/images/portfolio/<your-folder-name>/
 *   2. Drop your photos into that folder (jpg, jpeg, png, webp, gif, avif, svg).
 *   3. Commit and push to GitHub — Netlify rebuilds and the new block appears.
 *
 * Folder name rules:
 *   - Hyphens and underscores become spaces in the display title.
 *   - Words are capitalised automatically.
 *   - The first image in the folder is used as the cover thumbnail.
 *
 * Example:
 *   public/images/portfolio/city-hall-wedding/
 *     01.jpg  02.jpg  03.jpg  …
 *   → block titled "City Hall Wedding"
 */

import fs from 'fs';
import path from 'path';
import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Header from '../components/sections/Header';
import Footer from '../components/sections/Footer';
import { allContent } from '../utils/local-content';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);

function folderToTitle(name) {
    return name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Placeholder — never actually used but keeps the linter happy
const GALLERY_LOCATIONS = [
    {
        id: 'weddings',
        title: 'Weddings',
        description: 'Full-day documentary coverage',
        cover: '/images/main-hero.jpg',
        count: 6,
        photos: [
            { src: '/images/main-hero.jpg', alt: 'Wedding ceremony – soft winter light' },
            { src: '/images/hero.svg', alt: 'Getting ready portraits' },
            { src: '/images/hero2.svg', alt: 'First look in the garden' },
            { src: '/images/hero3.svg', alt: 'Exchange of rings' },
            { src: '/images/abstract-feature1.svg', alt: 'Reception table details' },
            { src: '/images/abstract-feature2.svg', alt: 'First dance' },
        ]
    },
    {
        id: 'portraits',
        title: 'Portraits',
        description: 'Editorial warmth, honest light',
        cover: '/images/hero2.svg',
        count: 5,
        photos: [
            { src: '/images/hero2.svg', alt: 'Golden hour portrait' },
            { src: '/images/hero3.svg', alt: 'Window-light studio portrait' },
            { src: '/images/abstract-feature1.svg', alt: 'Outdoor natural light' },
            { src: '/images/abstract-feature3.svg', alt: 'Couple portrait by water' },
            { src: '/images/main-hero.jpg', alt: 'Lifestyle portrait – park session' },
        ]
    },
    {
        id: 'brand',
        title: 'Brand Sessions',
        description: 'Campaign and lifestyle imagery',
        cover: '/images/abstract-feature1.svg',
        count: 5,
        photos: [
            { src: '/images/abstract-feature1.svg', alt: 'Product flat lay' },
            { src: '/images/abstract-feature2.svg', alt: 'Founder portrait at desk' },
            { src: '/images/abstract-feature3.svg', alt: 'Behind-the-scenes workspace' },
            { src: '/images/hero.svg', alt: 'Campaign lifestyle shot' },
            { src: '/images/main-hero.jpg', alt: 'Brand editorial still' },
        ]
    },
    {
        id: 'elopements',
        title: 'Elopements',
        description: 'Intimate ceremonies, big feeling',
        cover: '/images/hero3.svg',
        count: 4,
        photos: [
            { src: '/images/hero3.svg', alt: 'Mountain elopement ceremony' },
            { src: '/images/hero.svg', alt: 'Vows in the forest' },
            { src: '/images/abstract-background.svg', alt: 'Scenic overlook portraits' },
            { src: '/images/main-hero.jpg', alt: 'Intimate sunset portraits' },
        ]
    },
    {
        id: 'family',
        title: 'Family',
        description: 'Genuine moments, no forced smiles',
        cover: '/images/abstract-feature2.svg',
        count: 4,
        photos: [
            { src: '/images/abstract-feature2.svg', alt: 'Family on the beach' },
            { src: '/images/abstract-feature3.svg', alt: 'Morning light at home' },
            { src: '/images/hero2.svg', alt: 'Parents and newborn' },
            { src: '/images/hero3.svg', alt: 'Kids in the garden' },
        ]
    },
    {
        id: 'travel',
        title: 'Travel',
        description: 'Destination sessions around the world',
        cover: '/images/abstract-background.svg',
        count: 4,
        photos: [
            { src: '/images/abstract-background.svg', alt: 'Golden hour in Tuscany' },
            { src: '/images/hero.svg', alt: 'Urban street portraits – Tokyo' },
            { src: '/images/abstract-feature1.svg', alt: 'Beach session – Maldives' },
            { src: '/images/main-hero.jpg', alt: 'Landscape elopement – Iceland' },
        ]
    }
];

// ---------------------------------------------------------------------------
// Lightbox component
// ---------------------------------------------------------------------------
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
    const photo = photos[index];
    const hasPrev = index > 0;
    const hasNext = index < photos.length - 1;

    useEffect(() => {
        const handle = (e) => {
            if (e.key === 'ArrowRight' && hasNext) onNext();
            if (e.key === 'ArrowLeft' && hasPrev) onPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [index, hasPrev, hasNext, onClose, onPrev, onNext]);

    // Prevent body scroll while lightbox is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            {/* Counter */}
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm select-none">
                {index + 1} / {photos.length}
            </span>

            {/* Close */}
            <button
                className="absolute top-4 right-5 text-white/70 hover:text-white text-3xl leading-none select-none transition-colors"
                onClick={onClose}
                aria-label="Close lightbox"
            >
                &times;
            </button>

            {/* Prev */}
            <button
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors select-none ${!hasPrev ? 'opacity-20 cursor-default' : ''}`}
                onClick={(e) => { e.stopPropagation(); if (hasPrev) onPrev(); }}
                aria-label="Previous photo"
                disabled={!hasPrev}
            >
                &#8592;
            </button>

            {/* Image */}
            <div
                className="max-w-5xl max-h-[85vh] px-16"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={photo.src}
                    alt={photo.alt}
                    className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl"
                />
                {photo.alt && (
                    <p className="text-white/60 text-sm text-center mt-3 select-none">{photo.alt}</p>
                )}
            </div>

            {/* Next */}
            <button
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors select-none ${!hasNext ? 'opacity-20 cursor-default' : ''}`}
                onClick={(e) => { e.stopPropagation(); if (hasNext) onNext(); }}
                aria-label="Next photo"
                disabled={!hasNext}
            >
                &#8594;
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Portfolio page
// ---------------------------------------------------------------------------
export default function Portfolio({ site, galleries }) {
    const [activeLocation, setActiveLocation] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const photos = activeLocation?.photos ?? [];

    const openLightbox = useCallback((i) => setLightboxIndex(i), []);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);
    const prevPhoto = useCallback(() => setLightboxIndex((i) => Math.max(0, i - 1)), []);
    const nextPhoto = useCallback(
        () => setLightboxIndex((i) => Math.min(photos.length - 1, i + 1)),
        [photos.length]
    );

    return (
        <>
            <Head>
                <title>Portfolio — Ziaozhao Photography</title>
                <meta name="description" content="Browse wedding, portrait, brand, and travel photography by Ziaozhao." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {site?.favicon && <link rel="icon" href={site.favicon} />}
            </Head>

            <div className="sb-page">
                <div className="sb-base sb-default-base-layout">
                    {site?.header && <Header {...site.header} />}

                    <main className="bg-light min-h-screen">
                        {/* ---- Page header ---- */}
                        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
                            {activeLocation ? (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => { setActiveLocation(null); setLightboxIndex(null); }}
                                        className="inline-flex items-center gap-2 text-sm text-dark/60 hover:text-dark transition-colors"
                                        aria-label="Back to all galleries"
                                    >
                                        <span className="text-lg leading-none">&#8592;</span> All galleries
                                    </button>
                                    <span className="text-dark/30">/</span>
                                    <h1 className="text-dark font-serif text-2xl">{activeLocation.title}</h1>
                                    <span className="text-dark/40 text-sm">{activeLocation.photos.length} photos</span>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm uppercase tracking-widest text-primary mb-2">Portfolio</p>
                                    <h1 className="font-serif text-4xl text-dark">Photography galleries</h1>
                                    <p className="mt-3 text-dark/60 max-w-xl">
                                        Select a gallery to browse. Click any photo to view it full-screen.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ---- Gallery blocks grid ---- */}
                        {!activeLocation && (
                            <section className="max-w-7xl mx-auto px-6 pb-20">
                                {galleries.length === 0 ? (
                                    <div className="border-2 border-dashed border-neutral rounded-2xl p-16 text-center text-dark/40">
                                        <p className="text-lg font-serif mb-2">No galleries yet</p>
                                        <p className="text-sm">
                                            Add a folder of photos to{' '}
                                            <code className="bg-neutral px-1.5 py-0.5 rounded text-xs">
                                                public/images/portfolio/&lt;folder-name&gt;/
                                            </code>{' '}
                                            and redeploy to see it here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {galleries.map((gallery) => (
                                            <button
                                                key={gallery.id}
                                                onClick={() => setActiveLocation(gallery)}
                                                className="group relative overflow-hidden rounded-2xl bg-neutral text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                                aria-label={`Open ${gallery.title} gallery`}
                                            >
                                                {/* Cover image */}
                                                <div className="aspect-[4/3] overflow-hidden bg-neutral">
                                                    {gallery.cover ? (
                                                        <img
                                                            src={gallery.cover}
                                                            alt={gallery.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-dark/20 text-5xl">&#128247;</div>
                                                    )}
                                                </div>

                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/30 transition-colors duration-300 rounded-2xl" />

                                                {/* Text at bottom */}
                                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-dark/70 to-transparent rounded-b-2xl">
                                                    <h2 className="text-white font-serif text-xl leading-tight">{gallery.title}</h2>
                                                    <span className="text-white/60 text-xs mt-1 inline-block">
                                                        {gallery.photos.length} photo{gallery.photos.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>

                                                {/* Arrow hint */}
                                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <span className="text-white text-sm">→</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ---- Photo grid for selected gallery ---- */}
                        {activeLocation && (
                            <section className="max-w-7xl mx-auto px-6 pb-20">
                                {activeLocation.photos.length === 0 ? (
                                    <div className="border-2 border-dashed border-neutral rounded-2xl p-16 text-center text-dark/40">
                                        <p className="text-sm">No photos found in this folder.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {activeLocation.photos.map((photo, i) => (
                                            <button
                                                key={i}
                                                onClick={() => openLightbox(i)}
                                                className="group relative overflow-hidden rounded-xl bg-neutral focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                                aria-label={`View: ${photo.alt}`}
                                            >
                                                <div className="aspect-[4/3] overflow-hidden">
                                                    <img
                                                        src={photo.src}
                                                        alt={photo.alt}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300 rounded-xl flex items-center justify-center">
                                                    <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow select-none">&#9654;</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </main>

                    {site?.footer && <Footer {...site.footer} />}
                </div>
            </div>

            {/* ---- Lightbox ---- */}
            {lightboxIndex !== null && (
                <Lightbox
                    photos={photos}
                    index={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={prevPhoto}
                    onNext={nextPhoto}
                />
            )}
        </>
    );
}

// ---------------------------------------------------------------------------
// Build-time: scan public/images/portfolio/ for sub-folders and images.
// Add a folder there, push to GitHub, and Netlify will rebuild with the
// new block automatically.
// ---------------------------------------------------------------------------
export async function getStaticProps() {
    const portfolioDir = path.join(process.cwd(), 'public', 'images', 'portfolio');

    let galleries = [];

    if (fs.existsSync(portfolioDir)) {
        const entries = fs.readdirSync(portfolioDir, { withFileTypes: true });
        const folders = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort();

        galleries = folders.map((folderName) => {
            const folderPath = path.join(portfolioDir, folderName);
            const files = fs
                .readdirSync(folderPath)
                .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
                .sort();

            const photos = files.map((file) => ({
                src: `/images/portfolio/${folderName}/${file}`,
                alt: file.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
            }));

            return {
                id: folderName,
                title: folderToTitle(folderName),
                cover: photos[0]?.src ?? null,
                photos
            };
        });
    }

    const data = allContent();
    const site = data.props?.site ?? null;

    return { props: { site, galleries } };
}
