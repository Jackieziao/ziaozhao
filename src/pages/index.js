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

function NetworkBackground() {
	return (
		<svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 600">
			<defs>
				<filter id="glow">
					<feGaussianBlur stdDeviation="4" result="coloredBlur" />
					<feMerge>
						<feMergeNode in="coloredBlur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<radialGradient id="nodeGradient1" cx="30%" cy="30%">
					<stop offset="0%" stopColor="#60d5ff" stopOpacity="1" />
					<stop offset="100%" stopColor="#0099cc" stopOpacity="0.3" />
				</radialGradient>
				<radialGradient id="nodeGradient2" cx="30%" cy="30%">
					<stop offset="0%" stopColor="#00ccff" stopOpacity="0.8" />
					<stop offset="100%" stopColor="#0055aa" stopOpacity="0.1" />
				</radialGradient>
			</defs>

			{/* Dark gradient background */}
			<rect width="1200" height="600" fill="#0a1628" />
			<rect width="1200" height="600" fill="url(#bgGradient)" opacity="0.6" />

			{/* Animated network lines and nodes */}
			<g opacity="0.6">
				{/* Lines */}
				<line x1="80" y1="40" x2="250" y2="120" stroke="#0088ff" strokeWidth="1.5" />
				<line x1="250" y1="120" x2="420" y2="80" stroke="#00ccff" strokeWidth="1" />
				<line x1="420" y1="80" x2="580" y2="180" stroke="#0066ff" strokeWidth="1.5" />
				<line x1="120" y1="200" x2="280" y2="280" stroke="#00ddff" strokeWidth="1" />
				<line x1="280" y1="280" x2="450" y2="250" stroke="#0088ff" strokeWidth="1.5" />
				<line x1="450" y1="250" x2="600" y2="350" stroke="#00aaff" strokeWidth="1" />
				<line x1="600" y1="350" x2="750" y2="300" stroke="#0066ff" strokeWidth="1.5" />
				<line x1="200" y1="400" x2="380" y2="480" stroke="#00ccff" strokeWidth="1" />
				<line x1="380" y1="480" x2="550" y2="420" stroke="#0088ff" strokeWidth="1.5" />
				<line x1="550" y1="420" x2="720" y2="500" stroke="#00aaff" strokeWidth="1" />
				<line x1="750" y1="150" x2="900" y2="200" stroke="#0066ff" strokeWidth="1.5" />
				<line x1="900" y1="200" x2="1050" y2="120" stroke="#00ccff" strokeWidth="1" />
				<line x1="850" y1="350" x2="1000" y2="400" stroke="#00ddff" strokeWidth="1.5" />
				<line x1="950" y1="180" x2="1100" y2="280" stroke="#0088ff" strokeWidth="1" />
			</g>

			{/* Nodes (circles) */}
			<g filter="url(#glow)">
				{/* Bright nodes */}
				<circle cx="80" cy="40" r="6" fill="#60d5ff" opacity="0.9" />
				<circle cx="250" cy="120" r="5" fill="#00ffff" opacity="0.8" />
				<circle cx="420" cy="80" r="4" fill="#00ddff" opacity="0.7" />
				<circle cx="580" cy="180" r="6" fill="#60d5ff" opacity="0.85" />
				<circle cx="120" cy="200" r="5" fill="#00ccff" opacity="0.8" />
				<circle cx="280" cy="280" r="7" fill="#00ffff" opacity="0.9" />
				<circle cx="450" cy="250" r="4" fill="#60d5ff" opacity="0.7" />
				<circle cx="600" cy="350" r="6" fill="#00ddff" opacity="0.8" />
				<circle cx="750" cy="300" r="5" fill="#00ccff" opacity="0.75" />
				<circle cx="200" cy="400" r="4" fill="#60d5ff" opacity="0.7" />
				<circle cx="380" cy="480" r="6" fill="#00ffff" opacity="0.85" />
				<circle cx="550" cy="420" r="5" fill="#00ddff" opacity="0.8" />
				<circle cx="720" cy="500" r="7" fill="#60d5ff" opacity="0.9" />
				<circle cx="750" cy="150" r="5" fill="#00ccff" opacity="0.75" />
				<circle cx="900" cy="200" r="6" fill="#00ffff" opacity="0.8" />
				<circle cx="1050" cy="120" r="4" fill="#60d5ff" opacity="0.7" />
				<circle cx="850" cy="350" r="6" fill="#00ddff" opacity="0.85" />
				<circle cx="1000" cy="400" r="5" fill="#00ccff" opacity="0.8" />
				<circle cx="950" cy="180" r="7" fill="#60d5ff" opacity="0.9" />
				<circle cx="1100" cy="280" r="4" fill="#00ffff" opacity="0.7" />

				{/* Dimmer nodes scattered throughout */}
				<circle cx="350" cy="50" r="3" fill="#0099ff" opacity="0.5" />
				<circle cx="650" cy="120" r="2" fill="#00aaff" opacity="0.4" />
				<circle cx="800" cy="400" r="3" fill="#0088ff" opacity="0.5" />
				<circle cx="150" cy="350" r="2" fill="#00bbff" opacity="0.4" />
				<circle cx="500" cy="500" r="3" fill="#0099ff" opacity="0.5" />
				<circle cx="1000" cy="520" r="2" fill="#0088ff" opacity="0.4" />
				<circle cx="700" cy="450" r="3" fill="#00aaff" opacity="0.5" />
				<circle cx="300" cy="150" r="2" fill="#00ccff" opacity="0.4" />
			</g>

			{/* Outer glow effect */}
			<defs>
				<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#1a4d7a" />
					<stop offset="100%" stopColor="#0a1628" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export default function Home({ galleries }) {
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

			<div className="relative min-h-screen px-3 py-6 text-white sm:px-6 lg:px-8" style={{ background: '#0a1628' }}>
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
								{activeGallery ? activeGallery.title : 'Locations'}
							</p>
						</div>

						{!activeGallery ? (
							<main className="bg-gradient-to-b from-[#152a42] to-[#0f1b2e] px-4 py-4 sm:px-6 sm:py-6">
								{galleries.length === 0 ? (
									<div className="flex min-h-[50vh] items-center justify-center border border-dashed border-cyan-400/25 bg-blue-950/20 p-10 text-center text-sm uppercase tracking-[0.3em] text-cyan-300/60">
										Add folders with images inside public/images/photos/
									</div>
								) : (
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
										{galleries.map((gallery, index) => (
											<button
												key={gallery.id}
												type="button"
												className="group overflow-hidden bg-[#0f1f35] text-left transition hover:border-cyan-400/60 border border-cyan-400/20"
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
											className="group overflow-hidden bg-[#0a1420] text-left transition hover:border-cyan-400/50 border border-cyan-400/15"
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