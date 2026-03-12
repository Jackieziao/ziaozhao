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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);
const GALLERY_TILE_CLASSES = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[5/4]'];
const PHOTO_TILE_CLASSES = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/3]'];

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
                <div className="mt-4 flex items-center gap-4 text-sm uppercase tracking-[0.3em] text-white/60">
                    <span>{photo.alt}</span>
                    <span>
                        {index + 1} / {photos.length}
                    </span>
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

export default function Portfolio({ galleries }) {
    const [activeGalleryId, setActiveGalleryId] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const activeGallery = useMemo(() => galleries.find((gallery) => gallery.id === activeGalleryId) ?? null, [activeGalleryId, galleries]);
    const photos = activeGallery?.photos ?? [];

    const openGallery = useCallback((galleryId) => {
        setActiveGalleryId(galleryId);
        setLightboxIndex(null);
    }, []);

    const closeGallery = useCallback(() => {
        setActiveGalleryId(null);
        setLightboxIndex(null);
    }, []);

    const closeLightbox = useCallback(() => setLightboxIndex(null), []);
    const showPrev = useCallback(() => setLightboxIndex((value) => Math.max(0, value - 1)), []);
    const showNext = useCallback(() => setLightboxIndex((value) => Math.min(photos.length - 1, value + 1)), [photos.length]);

    return (
        <>
            <Head>
                <title>Ziaozhao Photography</title>
                <meta name="description" content="Gallery-based photography website with location folders and fullscreen image browsing." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/images/favicon.svg" />
            </Head>

            <div className="min-h-screen bg-[#7fc7bc] px-3 py-6 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden border border-black/30 bg-[#2f2f31] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center gap-2 border-b border-black/20 bg-[#223740] px-5 py-4">
                        <span className="h-3 w-3 rounded-full bg-[#ff6b57]" />
                        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                        <div className="ml-6 hidden h-10 flex-1 items-center rounded-full bg-[#cde4de]/85 px-4 text-sm text-[#4d7068] sm:flex">
                            https://ziaozhao.photography
                        </div>
                    </div>

                    <div className="border-b border-black/30 bg-gradient-to-b from-[#2a2a2d] to-[#1c1d20] px-6 py-6 text-center">
                        <p className="text-xs uppercase tracking-[0.45em] text-white/45">Ziaozhao Photography</p>
                        <h1 className="mt-2 font-serif text-3xl uppercase tracking-[0.2em] text-white sm:text-4xl">Photolux Style Gallery</h1>
                        <p className="mt-3 text-sm uppercase tracking-[0.35em] text-white/50">
                            {activeGallery ? activeGallery.title : 'Locations'}
                        </p>
                    </div>

                    {!activeGallery ? (
                        <main className="bg-[#3c3c3f] px-4 py-4 sm:px-6 sm:py-6">
                            {galleries.length === 0 ? (
                                <div className="flex min-h-[50vh] items-center justify-center border border-dashed border-white/15 bg-black/10 p-10 text-center text-sm uppercase tracking-[0.3em] text-white/55">
                                    Add folders with images inside public/images/photos/
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {galleries.map((gallery, index) => (
                                        <button
                                            key={gallery.id}
                                            type="button"
                                            className="group overflow-hidden bg-[#1f1f21] text-left"
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
                                                    <div className="flex h-full min-h-[260px] items-center justify-center text-5xl text-white/20">&#128247;</div>
                                                )}
                                            </div>
                                            <div className="border-t border-white/10 px-4 py-4">
                                                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Location / Gallery</div>
                                                <div className="mt-2 font-serif text-2xl leading-tight text-white">{gallery.title}</div>
                                                <div className="mt-3 text-xs uppercase tracking-[0.3em] text-white/55">
                                                    {gallery.photos.length} photo{gallery.photos.length === 1 ? '' : 's'}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </main>
                    ) : (
                        <main className="bg-[#2a2b2f] px-4 py-4 sm:px-6 sm:py-6">
                            <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={closeGallery}
                                    className="inline-flex w-fit items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/60 transition hover:text-white"
                                >
                                    <span className="text-lg leading-none">&#8592;</span>
                                    Back To Locations
                                </button>
                                <div className="text-xs uppercase tracking-[0.35em] text-white/45">Click any figure to open fullscreen</div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {photos.map((photo, index) => (
                                    <button
                                        key={photo.src}
                                        type="button"
                                        className="group overflow-hidden bg-[#17181b] text-left"
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
                                        <div className="border-t border-white/10 px-4 py-3">
                                            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Figure {index + 1}</div>
                                            <div className="mt-2 font-serif text-xl leading-tight text-white">{photo.alt}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </main>
                    )}
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
    let galleries = [];

    if (fs.existsSync(photosDir)) {
        const folders = fs
            .readdirSync(photosDir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();

        galleries = folders.map((folderName) => {
            const folderPath = path.join(photosDir, folderName);
            const files = fs
                .readdirSync(folderPath)
                .filter((fileName) => IMAGE_EXTS.has(path.extname(fileName).toLowerCase()))
                .sort();

            const photos = files.map((fileName) => ({
                src: `/images/photos/${folderName}/${fileName}`,
                alt: fileToAlt(fileName)
            }));

            return {
                id: folderName,
                title: folderToTitle(folderName),
                cover: photos[0]?.src ?? null,
                photos
            };
        });
    }

    return {
        props: {
            galleries
        }
    };
}
