'use client';

import { useState, useEffect } from 'react';
import { BackButton } from '../shared';

interface BackupStatus {
  type: 'success' | 'error';
  message: string;
}

interface BackupSummary {
  burners: number;
  stealthAddresses: number;
  gaslessBurners: number;
  hasStealthSeed: boolean;
  hasFeePayerConfig: boolean;
}

interface BackupViewProps {
  backupPassword: string;
  importJson: string;
  backupStatus: BackupStatus | null;
  burnerCount: number;
  onPasswordChange: (password: string) => void;
  onImportJsonChange: (json: string) => void;
  onExport: () => void;
  onExportComplete?: () => void;
  onImport: () => void;
  onBack: () => void;
  backupSummary?: BackupSummary | null;
}

export function BackupView({
  backupPassword,
  importJson,
  backupStatus,
  burnerCount,
  onPasswordChange,
  onImportJsonChange,
  onExport,
  onExportComplete,
  onImport,
  onBack,
  backupSummary,
}: BackupViewProps) {
  const [exportMode, setExportMode] = useState<'complete' | 'burners'>('complete');

  const hasExtraData = backupSummary && (
    backupSummary.stealthAddresses > 0 ||
    backupSummary.gaslessBurners > 0 ||
    backupSummary.hasStealthSeed ||
    backupSummary.hasFeePayerConfig
  );

  const handleExport = () => {
    if (exportMode === 'complete' && onExportComplete) {
      onExportComplete();
    } else {
      onExport();
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl sm:text-4xl">
            💾
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Backup & Restore</h2>
          <p className="text-muted-foreground text-sm">
            Export your wallet data or restore from a previous backup.
          </p>
        </div>

        {backupStatus && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${backupStatus.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'}`}>
            {backupStatus.message}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Export Section */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-3">📤 Export Backup</h3>

            {/* Backup Summary */}
            {backupSummary && (
              <div className="mb-4 p-3 rounded-lg bg-white/5 text-xs space-y-1">
                <p className="text-muted-foreground mb-2">Your data:</p>
                <div className="flex items-center gap-2">
                  <span className={backupSummary.burners > 0 ? 'text-primary' : 'text-muted-foreground'}>
                    {backupSummary.burners > 0 ? '✓' : '○'}
                  </span>
                  <span>{backupSummary.burners} burner wallet{backupSummary.burners !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={backupSummary.hasStealthSeed ? 'text-primary' : 'text-muted-foreground'}>
                    {backupSummary.hasStealthSeed ? '✓' : '○'}
                  </span>
                  <span>Stealth master seed{backupSummary.stealthAddresses > 0 ? ` (${backupSummary.stealthAddresses} addresses)` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={backupSummary.gaslessBurners > 0 || backupSummary.hasFeePayerConfig ? 'text-primary' : 'text-muted-foreground'}>
                    {backupSummary.gaslessBurners > 0 || backupSummary.hasFeePayerConfig ? '✓' : '○'}
                  </span>
                  <span>Gasless config{backupSummary.gaslessBurners > 0 ? ` (${backupSummary.gaslessBurners} prepaid)` : ''}</span>
                </div>
              </div>
            )}

            {/* Export Mode Toggle */}
            {hasExtraData && onExportComplete && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Export type:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportMode('complete')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      exportMode === 'complete'
                        ? 'bg-primary/20 border border-primary/40 text-primary'
                        : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    📦 Complete
                  </button>
                  <button
                    onClick={() => setExportMode('burners')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      exportMode === 'burners'
                        ? 'bg-primary/20 border border-primary/40 text-primary'
                        : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    🔥 Burners Only
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {exportMode === 'complete'
                    ? 'Includes burners, stealth addresses, and gasless config'
                    : 'Only includes burner wallets (backward compatible)'}
                </p>
              </div>
            )}

            <input
              type="password"
              value={backupPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Set backup password (min 6 chars)"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all text-sm mb-3"
            />
            <button
              onClick={handleExport}
              disabled={!backupPassword || backupPassword.length < 6 || burnerCount === 0}
              className="w-full py-2.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 transition-all text-sm font-medium disabled:opacity-50"
            >
              📥 Download {exportMode === 'complete' && hasExtraData ? 'Complete ' : ''}Backup
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-semibold mb-3">📥 Import Backup</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Paste your backup JSON. Supports both complete and burner-only backups.
            </p>
            <textarea
              value={importJson}
              onChange={(e) => onImportJsonChange(e.target.value)}
              placeholder='Paste backup JSON here...'
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all text-sm font-mono mb-3 resize-none h-24"
            />
            <input
              type="password"
              value={backupPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter backup password"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all text-sm mb-3"
            />
            <button
              onClick={onImport}
              disabled={!importJson.trim() || !backupPassword || backupPassword.length < 6}
              className="w-full py-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/40 transition-all text-sm font-medium disabled:opacity-50"
            >
              🔓 Restore Wallet Data
            </button>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
            ⚠️ Your master password is required to restore. Keep it safe!
          </div>
        </div>
      </div>
    </div>
  );
}
