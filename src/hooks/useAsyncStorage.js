import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getCollection, saveCollection } from '../services/storageService';

// All three feature areas need the same load / save / loading / error cycle,
// so it lives here once. Reloading on focus means a record added on one tab
// is there when you come back to another.
export default function useAsyncStorage(key) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getCollection(key));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = useCallback(async (records) => {
    try {
      await saveCollection(key, records);
      setData(records);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [key]);

  return { data, loading, error, reload: load, save };
}
