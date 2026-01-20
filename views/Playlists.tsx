
import React, { useState, useMemo } from 'react';
import { Music, Plus, Heart, Share2, Play, ExternalLink, X, Save, Disc, Youtube, Sparkles, Link as LinkIcon, Headphones, Search, Radio, Mic2, Flame, Globe, EyeOff, PlusCircle, CheckCircle2 } from 'lucide-react';
import { loadDB, addPlaylist, addFEPoints } from '../store/db';
import { Playlist } from '../types';
import { shareContent } from '../services/shareService';
import { feedback } from '../services/audioFeedback';

const PlaylistsView: React.FC<{ refreshState?: () => void }> = ({ refreshState }) => {
  const [state, setState] = useState(loadDB());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    creator: state.user.name,
    spotifyLink: '',
    ytMusicLink: '',
    shared: true
  });

  const isDarkMode = state.user.theme === 'dark';

  // Validación dinámica de enlaces
  const isSpotifyValid = useMemo(() => {
    return newPlaylist.spotifyLink.includes('spotify.com/playlist') || newPlaylist.spotifyLink.includes('spotify.com/album');
  }, [newPlaylist.spotifyLink]);

  const isYouTubeValid = useMemo(() => {
    return newPlaylist.ytMusicLink.includes('music.youtube.com/playlist') || newPlaylist.ytMusicLink.includes('youtube.com/playlist');
  }, [newPlaylist.ytMusicLink]);

  const handleSavePlaylist = () => {
    if (!newPlaylist.title.trim()) return;
    feedback.playClick();
    
    // Generar portada automática temática si no hay una
    const autoCover = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(newPlaylist.title)}&backgroundColor=7c3aed,c026d3,e11d48`;

    const playlist: Playlist = {
      id: Date.now().toString(),
      userId: state.user.id,
      title: newPlaylist.title,
      creator: newPlaylist.creator || state.user.name,
      spotifyLink: newPlaylist.spotifyLink,
      ytMusicLink: newPlaylist.ytMusicLink,
      likes: 0,
      shared: newPlaylist.shared,
      cover: autoCover
    };

    addPlaylist(playlist);
    addFEPoints(100, 'Aporte musical a la comunidad');
    
    if (refreshState) refreshState();
    setState(loadDB());
    setShowAddModal(false);
    setNewPlaylist({ title: '', creator: state.user.name, spotifyLink: '', ytMusicLink: '', shared: true });
    feedback.playSuccess();
  };

  const filteredPlaylists = state.playlists.filter((pl: Playlist) => pl.shared || pl.userId === state.user.id);

  return (
    <div className="p-4 sm:p-10 space-y-12 animate-in fade-in slide-in-from-bottom duration-700 pb-32 relative">
      
      {/* Hero Section con Botón Prominente */}
      <section className="relative overflow-hidden rounded-[4rem] p-10 sm:p-20 group border-2 border-violet-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 animate-gradient-xy opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30">
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Radio Ignite Live</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter font-heading leading-none">
              MÚSICA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">QUE CURA</span>
            </h2>
            <p className="text-white/70 font-medium max-w-xs text-lg italic">
              Conecta con el cielo a través de los ritmos de nuestra generación.
            </p>
          </div>
          
          <button 
            onClick={() => { feedback.playClick(); setShowAddModal(true); }}
            className="group hidden sm:flex relative p-1 rounded-[3.5rem] bg-white/20 hover:bg-white/40 transition-all active:scale-95 shadow-2xl"
          >
            <div className="bg-white text-violet-600 px-14 py-10 rounded-[3.2rem] flex flex-col items-center gap-4">
              <PlusCircle className="w-12 h-12 group-hover:rotate-180 transition-transform duration-700" />
              <div className="text-center">
                <span className="block font-black text-sm uppercase tracking-[0.2em]">Nueva Mezcla</span>
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">Spotify & YouTube</span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Botón Flotante de Acción (FAB) para Móvil y Desktop */}
      <button 
        onClick={() => { feedback.playClick(); setShowAddModal(true); }}
        className="fixed bottom-32 right-6 sm:right-12 z-50 w-20 h-20 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-full shadow-[0_20px_50px_rgba(124,58,237,0.5)] flex items-center justify-center text-white border-4 border-white dark:border-slate-900 active:scale-90 transition-all group"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping group-hover:animate-none" />
        <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Grid de Playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredPlaylists.map((pl: Playlist) => (
          <div key={pl.id} className={`group relative rounded-[4rem] p-8 border-2 transition-all hover:-translate-y-3 ${isDarkMode ? 'bg-slate-900 border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-violet-50 shadow-xl shadow-violet-100/30'}`}>
            
            <div className="relative aspect-square mb-8 overflow-hidden rounded-[3rem] shadow-2xl">
              <img src={pl.cover} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-sm">
                 <Disc className="w-24 h-24 text-white/10 animate-spin-slow" />
                 <Play className="absolute w-14 h-14 text-white fill-current" />
              </div>

              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center">
                 <div className="flex gap-2">
                    {pl.spotifyLink && <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center border border-white/20 shadow-lg"><Music className="w-4 h-4 text-white" /></div>}
                    {pl.ytMusicLink && <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center border border-white/20 shadow-lg"><Youtube className="w-4 h-4 text-white" /></div>}
                 </div>
                 {!pl.shared && <span className="text-[8px] font-black text-white uppercase tracking-widest bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">Privada</span>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-violet-500 transition-colors">{pl.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Curado por <span className="text-fuchsia-500">{pl.creator}</span></p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full">
                   <Heart className="w-3.5 h-3.5 fill-current" />
                   <span className="text-[9px] font-black">{pl.likes}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {pl.spotifyLink ? (
                  <a href={pl.spotifyLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#1DB954] text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                    <Music className="w-3.5 h-3.5" /> Spotify
                  </a>
                ) : (
                  <div className="bg-slate-100 dark:bg-white/5 text-slate-400 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center opacity-40">No Link</div>
                )}
                {pl.ytMusicLink ? (
                  <a href={pl.ytMusicLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-rose-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-500/20">
                    <Youtube className="w-3.5 h-3.5" /> YouTube
                  </a>
                ) : (
                  <div className="bg-slate-100 dark:bg-white/5 text-slate-400 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center opacity-40">No Link</div>
                )}
              </div>

              <button onClick={() => shareContent(pl.title, `Escucha esta mezcla en Ignite: ${pl.title}`)} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'border-white/5 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}>
                <Share2 className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Compartir con el Mundo</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Lanzamiento Mejorado */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className={`w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-500 ${isDarkMode ? 'bg-[#0a0520] border-white/10' : 'bg-white border-white'}`}>
            
            <div className="relative h-44 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 flex flex-col items-center justify-center text-center">
              <Disc className="w-20 h-20 text-white/10 animate-spin-slow absolute" />
              <h3 className="relative z-10 text-3xl font-black uppercase tracking-tighter text-white">Lanzar Nueva Mezcla</h3>
              <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Añade tu frecuencia al altar</p>
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 ml-4">Nombre de la Mezcla</label>
                <input 
                  value={newPlaylist.title} 
                  onChange={(e) => setNewPlaylist({...newPlaylist, title: e.target.value})}
                  placeholder="Ej: Trueno de Pentecostés" 
                  className={`w-full px-8 py-5 rounded-2xl border-2 outline-none font-bold text-sm transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-violet-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-violet-500'}`}
                />
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center text-slate-400">Canales de Música</p>
                <div className="grid grid-cols-1 gap-5">
                  <div className="relative group">
                    <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSpotifyValid ? 'bg-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.4)]' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                      {isSpotifyValid ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Music className="w-4 h-4" />}
                    </div>
                    <input 
                      value={newPlaylist.spotifyLink} 
                      onChange={(e) => setNewPlaylist({...newPlaylist, spotifyLink: e.target.value})}
                      placeholder="Pega link de Spotify" 
                      className={`w-full pl-18 pr-8 py-5 rounded-2xl border-2 outline-none font-medium text-xs transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-[#1DB954]' : 'bg-slate-50 border-transparent focus:bg-white focus:border-[#1DB954]'}`}
                    />
                    {isSpotifyValid && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-[#1DB954] tracking-widest">Listo</span>}
                  </div>

                  <div className="relative group">
                    <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isYouTubeValid ? 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                      {isYouTubeValid ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Youtube className="w-4 h-4" />}
                    </div>
                    <input 
                      value={newPlaylist.ytMusicLink} 
                      onChange={(e) => setNewPlaylist({...newPlaylist, ytMusicLink: e.target.value})}
                      placeholder="Pega link de YouTube Music" 
                      className={`w-full pl-18 pr-8 py-5 rounded-2xl border-2 outline-none font-medium text-xs transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-rose-600' : 'bg-slate-50 border-transparent focus:bg-white focus:border-rose-600'}`}
                    />
                    {isYouTubeValid && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-rose-600 tracking-widest">Listo</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-violet-500/10 rounded-3xl border border-violet-500/20">
                <div className="flex items-center gap-3">
                  <Globe className={`w-5 h-5 ${newPlaylist.shared ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest">Muro de la Iglesia</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{newPlaylist.shared ? 'Todos podrán escucharla' : 'Solo tú la verás'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setNewPlaylist({...newPlaylist, shared: !newPlaylist.shared})}
                  className={`w-14 h-7 rounded-full transition-all relative ${newPlaylist.shared ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${newPlaylist.shared ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <button 
                onClick={handleSavePlaylist}
                disabled={!newPlaylist.title.trim() || (!newPlaylist.spotifyLink && !newPlaylist.ytMusicLink)}
                className="w-full py-7 rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-violet-500/40 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-30 disabled:grayscale"
              >
                Lanzar Mezcla <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsView;
