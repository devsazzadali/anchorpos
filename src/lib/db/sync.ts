import { db, type SyncQueueItem } from './db';
import { getSupabaseClient } from '@/lib/supabase/client';

export class SyncEngine {
  private static isSyncing = false;
  private static syncInterval: NodeJS.Timeout | null = null;
  private static MAX_RETRIES = 5;

  /**
   * Starts the background sync interval
   */
  static startBackgroundSync(intervalMs: number = 30000) {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => this.processQueue(), intervalMs);
    
    // Listen for online events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  /**
   * Stops the background sync interval
   */
  static stopBackgroundSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
  }

  /**
   * Queue an operation to be synced to Supabase when online.
   * Priority: 1=Critical (sales), 2=Normal (purchases), 3=Low (updates)
   */
  static async enqueue(
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    record_id: string,
    payload: any,
    priority: 1 | 2 | 3 = 2
  ) {
    await db.syncQueue.add({
      operation,
      table,
      record_id,
      payload: JSON.stringify(payload),
      timestamp: Date.now(),
      retries: 0,
      max_retries: this.MAX_RETRIES,
      priority,
      status: 'pending',
      error: null,
    });

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  /**
   * Process all pending items in the sync queue
   */
  static async processQueue() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;

    try {
      const supabase = getSupabaseClient();
      
      // Get all pending items sorted by priority then timestamp (FIFO)
      const pendingItems = await db.syncQueue
        .where('status')
        .equals('pending')
        .sortBy('priority');

      for (const item of pendingItems) {
        if (!item.id) continue;
        
        await db.syncQueue.update(item.id, { status: 'processing' });
        const payload = JSON.parse(item.payload);

        let success = false;
        let errorMessage = '';
        try {
          const tableRef = supabase.from(item.table as any) as any;
          if (item.operation === 'INSERT') {
            const { error } = await tableRef.insert(payload);
            if (error) throw error;
          } else if (item.operation === 'UPDATE') {
            const { error } = await tableRef.update(payload).eq('id', item.record_id);
            if (error) throw error;
          } else if (item.operation === 'DELETE') {
            // We use soft-delete, so it's actually an UPDATE to deleted_at
            const { error } = await tableRef.update({ deleted_at: new Date().toISOString() }).eq('id', item.record_id);
            if (error) throw error;
          }
          
          success = true;
        } catch (err: any) {
          success = false;
          errorMessage = err.message || JSON.stringify(err);
        }

        if (success) {
          // Remove from queue
          await db.syncQueue.delete(item.id);
          
          // Mark local record as synced if it exists in local DB
          if (db[item.table as keyof typeof db]) {
            try {
              const table = db[item.table as keyof typeof db] as any;
              await table.update(item.record_id, { _synced: true, _sync_error: null });
            } catch (e) {
              console.error('Local sync success update failed:', e);
            }
          }
        } else {
          // Handle failure & retries
          const newRetries = item.retries + 1;
          const status = newRetries >= item.max_retries ? 'failed' : 'pending';
          
          await db.syncQueue.update(item.id, {
            retries: newRetries,
            status,
            error: errorMessage,
          });

          // Update local record with error
          if (db[item.table as keyof typeof db]) {
             try {
              const table = db[item.table as keyof typeof db] as any;
              await table.update(item.record_id, { _synced: false, _sync_error: errorMessage });
            } catch (e) {
              console.error('Local sync error update failed:', e);
            }
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Pulls fresh data from Supabase down to local Dexie DB.
   * Mostly used for Products, Contacts, and Settings.
   */
  static async pullReferenceData(businessId: string) {
    if (!navigator.onLine) return;
    
    const supabase = getSupabaseClient();
    
    try {
      // 1. Pull Products
      const { data: products } = await supabase
        .from('products')
        .select('*, categories(name), brands(name), units(short_name)')
        .eq('business_id', businessId)
        .is('deleted_at', null);

      if (products) {
        await db.products.bulkPut(
          (products as any[]).map(p => ({
            ...p,
            category_name: p.categories?.name || null,
            brand_name: p.brands?.name || null,
            unit_name: p.units?.short_name || null,
            tax_rate: p.tax_rate ?? 0,
            tax_method: p.tax_method ?? 'exclusive',
            alert_quantity: p.alert_quantity ?? 0,
            image_url: p.image_url ?? null,
            barcode_type: p.barcode_type ?? null,
            _synced: true,
          }))
        );
      }

      // 2. Pull Contacts
      const { data: contacts } = await (supabase
        .from('contacts' as any) as any)
        .select('*')
        .eq('business_id', businessId)
        .is('deleted_at', null);
        
      if (contacts) {
        await db.contacts.bulkPut(
          (contacts as any[]).map(c => ({
            ...c,
            business_name: c.business_name || null,
            email: c.email || null,
            city: c.city || null,
            credit_limit: c.credit_limit || 0,
            customer_group_id: c.customer_group_id || null,
            _synced: true,
          }))
        );
      }
    } catch (error) {
      console.error('Error pulling reference data:', error);
    }
  }
}
