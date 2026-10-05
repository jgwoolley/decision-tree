import { parseTreeJsonText } from './exportImport';
import { useTreeLibraryStore } from '../store/treeLibraryStore';

const SEEDED_FLAG_KEY = 'decision-tree-default-seeded-v1';

/** Loads the bundled example tree from /default-tree.json on first-ever visit,
 * i.e. only when nothing is in localStorage yet. Runs at most once per browser —
 * if the user later deletes every tree, we respect that and don't reseed. */
export async function seedDefaultTreeIfNeeded(): Promise<void> {
  let alreadyAttempted = false;
  try {
    alreadyAttempted = localStorage.getItem(SEEDED_FLAG_KEY) === '1';
  } catch {
    // localStorage unavailable; treat as not-yet-seeded for this session.
  }
  if (alreadyAttempted) return;

  const markAttempted = () => {
    try {
      localStorage.setItem(SEEDED_FLAG_KEY, '1');
    } catch {
      // Non-fatal: worst case we try to seed again next time.
    }
  };

  const { trees, importTrees } = useTreeLibraryStore.getState();
  if (Object.keys(trees).length > 0) {
    markAttempted();
    return;
  }

  try {
    const response = await fetch('default-tree.json');
    if (!response.ok) return;
    const parsed = parseTreeJsonText(await response.text());
    importTrees(parsed);
    markAttempted();
  } catch {
    // Non-fatal: the default tree is a nice-to-have, not required for the app to function.
  }
}
