export type CommunicationStyle = 'direct' | 'empathetic' | 'analytical' | 'casual' | 'flexible';
export type InteractionPreference = 'one-on-one' | 'small-group' | 'large-group' | 'flexible';
export type ContactMode = 'text' | 'audio' | 'video';
export type BackendProfile = {
  user_id: string; display_name: string; bio: string; avatar: string; discoverable: boolean; share_presence: boolean;
  interests: string[]; goals: string[]; languages: string[]; contact_modes: ContactMode[];
  communication_style: CommunicationStyle; interaction_preference: InteractionPreference; updated_at: string;
};
export type UserMatch = {
  user_id: string; display_name: string; bio: string; avatar: string; similarity_score: number;
  shared_interests: string[]; shared_goals: string[]; shared_languages: string[];
  compatible_contact_modes: string[]; reasons: string[];
};
export type RecommendationResponse = {matches: UserMatch[]; algorithm_version: string; score_label: string; message: string | null};
type Tokens = {access_token: string; token_type: string; expires_in: number};

export class APIError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// Access tokens live in memory. The server stores the rotating refresh token in
// an HttpOnly cookie; credentials and bearer tokens never enter localStorage.
class RoleplayAPI {
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly base = ((import.meta as ImportMeta & {env?: Record<string,string>}).env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

  private async parse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = 'The server could not complete this request.';
      try {
        const data = await response.json();
        message = typeof data.detail === 'string' ? data.detail : Array.isArray(data.detail) ? data.detail.map((item:{msg:string})=>item.msg).join('. ') : message;
      } catch { if (response.status >= 500) message = 'The service is temporarily unavailable. Please try again.'; }
      throw new APIError(response.status, message);
    }
    return response.status === 204 ? undefined as T : response.json() as Promise<T>;
  }

  async restoreSession(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async()=>{
      try {
        const response = await fetch(`${this.base}/v1/auth/refresh`, {method:'POST', credentials:'include', headers:{'X-Roleplay-CSRF':'1'}});
        const data = await this.parse<Tokens>(response);
        this.accessToken = data.access_token;
        return true;
      } catch {
        this.accessToken = null;
        return false;
      } finally { this.refreshPromise = null; }
    })();
    return this.refreshPromise;
  }

  private async request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body) headers.set('Content-Type', 'application/json');
    if (this.accessToken) headers.set('Authorization', `Bearer ${this.accessToken}`);
    headers.set('X-Roleplay-CSRF', '1');
    let response: Response;
    try { response = await fetch(this.base + path, {...init, headers, credentials:'include'}); }
    catch { throw new APIError(0, 'Unable to connect. Please try again in a moment.'); }
    if (response.status === 401 && retry && !path.startsWith('/v1/auth/')) {
      if (await this.restoreSession()) return this.request<T>(path, init, false);
      this.accessToken = null;
    }
    return this.parse<T>(response);
  }

  async signIn(email: string, password: string) {
    const data = await this.request<Tokens>('/v1/auth/login', {method:'POST',body:JSON.stringify({email,password})}, false);
    this.accessToken = data.access_token;
  }
  async register(email: string, password: string, display_name: string) {
    const data = await this.request<Tokens>('/v1/auth/register', {method:'POST',body:JSON.stringify({email,password,display_name})}, false);
    this.accessToken = data.access_token;
  }
  async logout() {
    try { await this.request<void>('/v1/auth/logout', {method:'POST'}); }
    finally { this.accessToken = null; }
  }
  ensureSession() { return this.accessToken ? Promise.resolve(true) : this.restoreSession(); }
  accountCapabilities() { return this.request<{is_moderator: boolean}>('/v1/me/capabilities'); }
  connections() { return this.request<Connection[]>('/v1/connections'); }
  requestConnection(target_id: string) { return this.request<Connection>('/v1/connections',{method:'POST',body:JSON.stringify({target_id})}); }
  decideConnection(id: string, action: 'accept'|'decline'|'cancel') { return this.request<Connection>(`/v1/connections/${encodeURIComponent(id)}/decision`,{method:'POST',body:JSON.stringify({action})}); }
  conversations() { return this.request<Conversation[]>('/v1/conversations'); }
  messages(id: string, options: {after?:number;before?:number;limit?:number}={}) { const query=new URLSearchParams(Object.entries(options).map(([key,value])=>[key,String(value)]));return this.request<MessagePage>(`/v1/conversations/${encodeURIComponent(id)}/messages?${query}`); }
  sendMessage(value:{conversation_id:string;client_message_id:string;body:string}) { return this.request<ChatMessage>('/v1/messages',{method:'POST',body:JSON.stringify(value)}); }
  readConversation(id:string,sequence:number) { return this.request<void>(`/v1/conversations/${encodeURIComponent(id)}/read`,{method:'PUT',body:JSON.stringify({sequence})}); }
  retractMessage(id:string) { return this.request<void>(`/v1/messages/${encodeURIComponent(id)}`,{method:'DELETE'}); }
  notifications(before?:string) { return this.request<NotificationItem[]>(`/v1/notifications${before?'?before='+encodeURIComponent(before):''}`); }
  readNotification(id:string) { return this.request<void>(`/v1/notifications/${encodeURIComponent(id)}/read`,{method:'PUT'}); }
  notificationSettings() { return this.request<NotificationSettings>('/v1/me/notification-settings'); }
  saveNotificationSettings(value:NotificationSettings) { return this.request<NotificationSettings>('/v1/me/notification-settings',{method:'PUT',body:JSON.stringify(value)}); }
  forgotPassword(email:string) { return this.request<{message:string}>('/v1/auth/forgot-password',{method:'POST',body:JSON.stringify({email})},false); }
  resetPassword(token:string,password:string,confirm_password:string) { return this.request<{message:string}>('/v1/auth/reset-password',{method:'POST',body:JSON.stringify({token,password,confirm_password})},false); }
  report(value:{target_user_id?:string;message_id?:string;reason:ReportReason;details:string}) { return this.request<SafetyReport>('/v1/reports',{method:'POST',body:JSON.stringify(value)}); }
  myReports() { return this.request<SafetyReport[]>('/v1/reports/me'); }
  moderationQueue(status='open') { return this.request<ModeratorReport[]>(`/v1/moderation/reports?status=${encodeURIComponent(status)}`); }
  moderationAction(id:string,action:ModerationAction,note:string) { return this.request<ModeratorReport>(`/v1/moderation/reports/${encodeURIComponent(id)}/actions`,{method:'POST',body:JSON.stringify({action,note})}); }
  live(onEvent:(event:RealtimeEvent)=>void,onStatus:(status:LiveStatus)=>void) {
    const url=new URL(this.base+'/v1/ws',window.location.origin);url.protocol=url.protocol==='https:'?'wss:':'ws:';
    return new LiveConnection(()=>this.request<{ticket:string}>('/v1/ws-ticket',{method:'POST'}),url.toString(),onEvent,onStatus);
  }
  getProfile() { return this.request<BackendProfile>('/v1/me/profile'); }
  updateProfile(profile: Partial<Omit<BackendProfile, 'user_id' | 'updated_at'>>) { return this.request<BackendProfile>('/v1/me/profile',{method:'PATCH',body:JSON.stringify(profile)}); }
  capabilities() { return this.request<{ai_configured: boolean}>('/v1/tools/recommend-users/schema'); }
  recommendations() { return this.request<RecommendationResponse>('/v1/recommendations?limit=10'); }
  aiRecommendations(prompt: string, share_preferences_with_ai: boolean) { return this.request<RecommendationResponse>('/v1/ai/recommendations',{method:'POST',body:JSON.stringify({prompt,share_preferences_with_ai})}); }
  feedback(target_id: string, action: 'dismiss' | 'interested') { return this.request<void>('/v1/recommendations/feedback',{method:'POST',body:JSON.stringify({target_id,action})}); }
  block(id: string) { return this.request<void>(`/v1/blocks/${encodeURIComponent(id)}`,{method:'PUT'}); }
  unblock(id: string) { return this.request<void>(`/v1/blocks/${encodeURIComponent(id)}`,{method:'DELETE'}); }
  getBlocks() { return this.request<string[]>('/v1/blocks'); }
  exportAccount() { return this.request<Record<string,unknown>>('/v1/me/export'); }
  async deleteAccount(password: string) {
    await this.request<void>('/v1/me',{method:'DELETE',body:JSON.stringify({password})});
    this.accessToken = null;
  }
}

export const roleplayAPI = new RoleplayAPI();

export type Peer = {user_id: string; display_name: string; avatar: string};
export type Connection = {id: string; status: string; requested_by: string; peer: Peer; conversation_id: string|null; created_at: string};
export type Conversation = {id: string; peer: Peer; last_sequence: number; last_read_sequence: number; peer_read_sequence: number; presence: 'online'|'offline'|'hidden'|'unknown'};
export type ChatMessage = {id: string; conversation_id: string; sender_id: string; client_message_id: string; sequence: number; body: string; removed: boolean; created_at: string};
export type MessagePage = {messages: ChatMessage[]; has_more: boolean; latest_sequence: number};
export type NotificationItem = {id: string; kind: string; title: string; data: Record<string,string>; read_at: string|null; created_at: string};
export type NotificationSettings = {in_app: boolean; messages: boolean; email: boolean};
export type ReportReason = 'harassment'|'hate'|'spam'|'impersonation'|'safety'|'other';
export type SafetyReport = {id: string; reason: string; details: string; status: string; resolution: string|null; created_at: string};
export type ModeratorReport = SafetyReport & {reporter_id: string; reported_id: string; message_id: string|null; evidence: string|null};
export type ModerationAction = 'dismiss_report'|'remove_message'|'suspend_user'|'restore_user';
export type RealtimeEvent = {type: string; conversation_id?: string; sequence?: number; message?: ChatMessage; client_message_id?: string; status?: number; user_id?: string};
export type LiveStatus = 'connecting'|'live'|'offline'|'signed_out';

export class LiveConnection {
  private socket: WebSocket|null = null;
  private stopped = false;
  private ready = false;
  private attempt = 0;
  private retryTimer: ReturnType<typeof setTimeout>|undefined;
  private heartbeat: ReturnType<typeof setInterval>|undefined;
  private pending = new Map<string,{resolve:(value:ChatMessage)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
  constructor(private getTicket:()=>Promise<{ticket:string}>, private url:string, private onEvent:(event:RealtimeEvent)=>void, private onStatus:(status:LiveStatus)=>void) { void this.open(); }

  private async open() {
    if(this.stopped)return;
    this.onStatus('connecting');
    try {
      const {ticket}=await this.getTicket();
      if(this.stopped)return;
      const socket = new WebSocket(this.url);
      this.socket = socket;
      socket.onopen=()=>socket.send(JSON.stringify({type:'authenticate',ticket}));
      socket.onmessage=message=>{
        let event:RealtimeEvent;
        try { event=JSON.parse(message.data); } catch { return; }
        if(event.type==='ready'){
          this.ready=true; this.attempt=0; this.onStatus('live');
          this.heartbeat=setInterval(()=>{if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'ping'}));},20000);
        }
        if(event.type==='message.ack'&&event.message){
          const pending=this.pending.get(event.message.client_message_id);
          if(pending){clearTimeout(pending.timer);pending.resolve(event.message);this.pending.delete(event.message.client_message_id);}
        }
        if(event.type==='error'&&event.client_message_id){
          const pending=this.pending.get(event.client_message_id);
          if(pending){clearTimeout(pending.timer);pending.reject(new APIError(event.status||400,typeof (event as {message?:unknown}).message==='string'?String((event as {message?:unknown}).message):'Message could not be sent.'));this.pending.delete(event.client_message_id);}
        }
        this.onEvent(event);
      };
      socket.onerror=()=>this.onStatus('offline');
      socket.onclose=()=>{
        this.ready=false;clearInterval(this.heartbeat);
        for(const pending of this.pending.values()){clearTimeout(pending.timer);pending.reject(new APIError(0,'Live connection interrupted.'));}
        this.pending.clear();
        if(!this.stopped)this.reconnect();
      };
    } catch(error) {
      if(this.stopped)return;
      if(error instanceof APIError&&error.status===401){this.onStatus('signed_out');return;}
      this.reconnect();
    }
  }
  private reconnect(){
    this.onStatus('offline');
    clearTimeout(this.retryTimer);
    this.retryTimer=setTimeout(()=>void this.open(),Math.min(30000,1000*2**this.attempt++));
  }
  send(value:{conversation_id:string;client_message_id:string;body:string}):Promise<ChatMessage>{
    if(!this.ready||this.socket?.readyState!==WebSocket.OPEN)return Promise.reject(new APIError(0,'Live connection unavailable.'));
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(value.client_message_id);reject(new APIError(0,'Message acknowledgement timed out.'));},5000);
      this.pending.set(value.client_message_id,{resolve,reject,timer});
      this.socket!.send(JSON.stringify({type:'message.send',...value}));
    });
  }
  close(){this.stopped=true;clearTimeout(this.retryTimer);clearInterval(this.heartbeat);this.socket?.close();for(const pending of this.pending.values()){clearTimeout(pending.timer);pending.reject(new APIError(0,'Live connection closed.'));}this.pending.clear();}
}
