import { useRef } from 'react';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { downloadLibraryAsJson, parseImportedFile } from '../../lib/exportImport';
import { useTreeLibraryStore } from '../../store/treeLibraryStore';

export function ImportExportControls() {
  const inputRef = useRef<HTMLInputElement>(null);
  const trees = useTreeLibraryStore((s) => s.trees);
  const importTrees = useTreeLibraryStore((s) => s.importTrees);
  const push = useToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = await parseImportedFile(file);
      importTrees(imported);
      push(`Imported ${imported.length} tree${imported.length === 1 ? '' : 's'}.`);
    } catch (error) {
      push(error instanceof Error ? error.message : 'Import failed.', 'error');
    }
  }

  return (
    <div className="flex gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
        Import
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={Object.keys(trees).length === 0}
        onClick={() => downloadLibraryAsJson(Object.values(trees))}
      >
        Export all
      </Button>
    </div>
  );
}
