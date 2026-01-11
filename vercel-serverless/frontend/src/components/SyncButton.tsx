import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { syncLocalDataToCloud } from '../services/api';
import { cache } from '../lib/cache';

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setStatus('idle');
    setMessage('');

    try {
      // Get local data from IndexedDB
      const likes = await cache.getLikedSongs();
      const reverseQueue = await cache.getReverseQueue();

      // Sync to cloud
      const stats = await syncLocalDataToCloud(likes, reverseQueue);

      setStatus('success');
      setMessage(
        `✅ Synced ${stats.likesSynced} likes and ${stats.historySynced} history entries. ` +
        `${stats.duplicatesSkipped} duplicates skipped.`
      );
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <Upload className="text-purple-500 flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Sync Local Data to Cloud
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Upload your liked songs and play history from this device to your cloud account.
            Duplicates will be automatically skipped.
          </p>
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${syncing 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
              }
            `}
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={16} />
                Sync Now
              </span>
            )}
          </button>

          {/* Status message */}
          {status !== 'idle' && (
            <div className={`
              mt-4 p-3 rounded-lg flex items-start gap-2
              ${status === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}
            `}>
              {status === 'success' ? (
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
