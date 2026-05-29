
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

interface StaticAsset {
  id: string;
  name: string;
  icon: string;
  contentType: string;
  size: string;
  description: string;
}

const allAssets: StaticAsset[] = [
  { id: 'index-html', name: 'index.html', icon: '🏠', contentType: 'text/html', size: '4.2 KB', description: 'Main entry point HTML document' },
  { id: 'main-js', name: 'main.js', icon: '⚡', contentType: 'application/javascript', size: '128 KB', description: 'Bundled JavaScript application' },
  { id: 'style-css', name: 'style.css', icon: '🎨', contentType: 'text/css', size: '32 KB', description: 'Compiled Tailwind CSS stylesheet' },
  { id: 'favicon', name: 'favicon.ico', icon: '🖼️', contentType: 'image/x-icon', size: '1.1 KB', description: 'Browser tab favicon' },
  { id: 'robots-txt', name: 'robots.txt', icon: '🤖', contentType: 'text/plain', size: '0.3 KB', description: 'Search engine crawler rules' },
];

const vitalAssetIds = new Set(['index-html', 'main-js', 'style-css']);

export default function Phase6TractorBeam() {
  const { completePhase, addScore, addBadge, uploadedFiles, addUploadedFile } = useGameStore();
  const [draggingOver, setDraggingOver] = useState(false);
  const [draggingAsset, setDraggingAsset] = useState<string | null>(null);
  const [snapAnimations, setSnapAnimations] = useState<Set<string>>(new Set());
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [showMetadata, setShowMetadata] = useState<Record<string, boolean>>({});

  // Check if all vital assets are uploaded
  const allVitalUploaded = allAssets
    .filter((a) => vitalAssetIds.has(a.id))
    .every((a) => uploadedFiles.includes(a.id));

  // Check all assets uploaded
  const allUploaded = allAssets.every((a) => uploadedFiles.includes(a.id));

  const handleDragStart = (e: React.DragEvent, assetId: string) => {
    e.dataTransfer.setData('text/plain', assetId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingAsset(assetId);
  };

  const handleDragEnd = () => {
    setDraggingAsset(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggingOver(true);
  };

  const handleDragLeave = () => {
    setDraggingOver(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const assetId = e.dataTransfer.getData('text/plain');
    
    if (!uploadedFiles.includes(assetId)) {
      addUploadedFile(assetId);
      setSnapAnimations((prev) => new Set([...prev, assetId]));
      
      // Show metadata chip with animation
      setTimeout(() => {
        setShowMetadata((prev) => ({ ...prev, [assetId]: true }));
      }, 300);

      // Clear snap animation
      setTimeout(() => {
        setSnapAnimations((prev) => {
          const next = new Set(prev);
          next.delete(assetId);
          return next;
        });
      }, 600);

      addScore(30);
    }
  }, [uploadedFiles, addUploadedFile, addScore]);

  // Check for phase completion
  const handleComplete = useCallback(() => {
    if (allVitalUploaded && !phaseCompleted) {
      completePhase(6);
      addScore(50);
      addBadge({
        id: 'tractor-operator',
        name: 'Tractor Operator',
        icon: '📦',
        earnedAt: Date.now(),
      });
      setPhaseCompleted(true);
    }
  }, [allVitalUploaded, phaseCompleted, completePhase, addScore, addBadge]);

  // Trigger completion check when vital files are uploaded
  if (allVitalUploaded && !phaseCompleted) {
    setTimeout(handleComplete, 1200);
  }

  return (
    <div className="p-6 flex flex-col items-center min-h-[500px] relative">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-2"
      >
        📦 Tractor Beam — Static File Upload
      </motion.h2>
      <p className="text-sm text-cosmic-muted mb-6 text-center max-w-lg">
        Transfer your build artifacts into the S3 bucket. Drag each file from the asset bay to the storage star.
      </p>

      <div className="w-full max-w-2xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Asset Bay */}
        <div>
          <h3 className="text-xs font-mono text-cosmic-accent mb-3">
            📂 BUILD ASSETS
          </h3>
          <div className="space-y-3">
            {allAssets.map((asset) => {
              const isUploaded = uploadedFiles.includes(asset.id);
              const isVital = vitalAssetIds.has(asset.id);
              const isDragging = draggingAsset === asset.id;

              return (
                <motion.div
                  key={asset.id}
                  draggable={!isUploaded && !phaseCompleted}
                  onDragStart={(e) => handleDragStart(e, asset.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    bg-cosmic-panel/50 border rounded-lg px-4 py-3 flex items-center gap-3
                    transition-all duration-300
                    ${isUploaded 
                      ? 'border-cosmic-success/30 opacity-50' 
                      : 'border-cosmic-border hover:border-cosmic-accent/50 cursor-grab active:cursor-grabbing'
                    }
                    ${isDragging ? 'opacity-40 border-cosmic-accent' : ''}
                  `}
                  whileHover={!isUploaded ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!isUploaded ? { scale: 0.98 } : {}}
                  animate={isUploaded ? { opacity: 0.45 } : { opacity: 1 }}
                >
                  <span className="text-2xl">{asset.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-cosmic-text truncate">
                      {asset.name}
                      {isVital && <span className="text-cosmic-warning ml-1">*</span>}
                    </p>
                    <p className="text-[10px] text-cosmic-muted">{asset.size}</p>
                  </div>
                  {isUploaded && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-cosmic-success text-sm"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <p className="text-[10px] text-cosmic-muted mt-2">
            <span className="text-cosmic-warning">*</span> Vital assets — required for launch
          </p>
        </div>

        {/* RIGHT: S3 Bucket Drop Zone */}
        <div>
          <h3 className="text-xs font-mono text-cosmic-accent mb-3">
            ☁️ S3 BUCKET
          </h3>
          
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-6 min-h-[300px] flex flex-col items-center justify-center
              transition-all duration-300 relative
              ${draggingOver 
                ? 'drop-zone-active scale-[1.02]' 
                : allUploaded 
                  ? 'border-cosmic-success bg-cosmic-success/5' 
                  : 'border-cosmic-border'
              }
            `}
            animate={draggingOver ? { scale: 1.02 } : { scale: 1 }}
          >
            {/* Bucket Icon */}
            <motion.div
              className="text-6xl mb-3"
              animate={allUploaded ? {
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              } : draggingOver ? {
                scale: [1, 1.15, 1],
              } : {}}
              transition={allUploaded ? { 
                rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity }
              } : { duration: 0.8, repeat: draggingOver ? Infinity : 0 }}
            >
              🪣
            </motion.div>
            
            <p className="text-xs font-mono text-cosmic-muted text-center">
              {uploadedFiles.length === 0 
                ? '🎯 Drag assets here' 
                : `${uploadedFiles.length}/${allAssets.length} files uploaded`
              }
            </p>

            {/* Uploaded files list inside bucket */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2 w-full">
                {allAssets.filter((a) => uploadedFiles.includes(a.id)).map((asset) => (
                  <motion.div
                    key={asset.id + '-in-bucket'}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: snapAnimations.has(asset.id) ? [0, 1.2, 1] : 1, 
                      opacity: 1 
                    }}
                    className="bg-cosmic-bg/60 border border-cosmic-border rounded-lg px-3 py-2 flex items-center gap-2"
                  >
                    <span className="text-sm">{asset.icon}</span>
                    <span className="text-[10px] font-mono text-cosmic-text flex-1 truncate">
                      {asset.name}
                    </span>
                    
                    {/* Metadata chip appearing */}
                    <AnimatePresence>
                      {showMetadata[asset.id] && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          className="text-[8px] font-mono bg-cosmic-accent/10 border border-cosmic-accent/30 px-1.5 py-0.5 rounded text-cosmic-accent whitespace-nowrap"
                        >
                          {asset.contentType}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Progress indicator */}
            {uploadedFiles.length > 0 && !allUploaded && (
              <div className="w-full mt-4">
                <div className="w-full h-1 bg-cosmic-bg rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cosmic-accent rounded-full"
                    animate={{ width: `${(uploadedFiles.length / allAssets.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* All vital files indicator */}
          <motion.div
            className={`mt-3 text-center ${allVitalUploaded ? 'text-cosmic-success' : 'text-cosmic-muted'}`}
            animate={allVitalUploaded ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: allVitalUploaded ? Infinity : 0 }}
          >
            <span className="text-xs font-mono">
              {allVitalUploaded 
                ? '✅ All vital assets transferred — Ready for next phase!' 
                : `⚠️ Transfer index.html, main.js, style.css to proceed`
              }
            </span>
          </motion.div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {phaseCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-cosmic-bg/80 flex items-center justify-center rounded-xl z-20"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <motion.span
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl inline-block"
              >
                📦
              </motion.span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">
                Assets Transferred!
              </h2>
              <p className="text-sm text-cosmic-text mt-2">
                All static files beamed into the S3 bucket. +200 points
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
