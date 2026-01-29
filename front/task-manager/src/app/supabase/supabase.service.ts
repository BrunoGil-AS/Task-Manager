import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../core/environment';
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Getter público para acceder al cliente (si lo necesitas)
  get client(): SupabaseClient {
    return this.supabase;
  }
}

export default SupabaseService;
