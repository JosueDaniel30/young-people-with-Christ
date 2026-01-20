
import React, { useState } from 'react';
import { Music, Plus, Heart, Share2, Play, ExternalLink, X, Save, Disc, Youtube, Sparkles, Link as LinkIcon, Headphones, Search, Radio, Mic2, Flame } from 'lucide-react';
import { loadDB, addPlaylist, addFEPoints } from '../store/db';
import { Playlist } from '../types';
import { shareContent } from '../services/shareService';
import { feedback } from '../services/audioFeedback';

const PlaylistsView: React.FC<{ refreshState?: () => void }> = ({ refreshState }) => {
  const [state, setState] = useState(loadDB());
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    creator: '',
    spotifyLink: '',
    ytMusicLink: ''
  });

  const isDarkMode = state.user.theme === 'dark';

  const filters = ['Todos', 'Worship', 'Urbano', 'Lo-Fi', 'Podcasts'];

  const handleSavePlaylist = () => {
    if (!newPlaylist.title || !newPlaylist.creator) return;
    feedback.playClick();
    
    const playlist: Playlist = {
      id: Date.now().toString(),
      title: newPlaylist.title,
      creator: newPlaylist.creator,
      spotifyLink: newPlaylist.spotifyLink,
      ytMusicLink: newPlaylist.ytMusicLink,
      likes: 0,
      cover: `https://api.dicebear.com/7.x/shapes/svg?seed=${newPlaylist.title}&backgroundColor=7c3aed`
    };

    addPlaylist(playlist);
    addFEPoints(100, 'Integrar música nueva');
    
    if (refreshState) refreshState();
    setState(loadDB());
    setShowAddModal(false);
    setNewPlaylist({ title: '', creator: '', spotifyLink: '', ytMusicLink: '' });
  };

  return (
    <div className="p-4 sm:p-10 space-y-12 animate-in fade-in slide-in-from-bottom duration-700 pb-32">
      
      {/* Immersive Music Header */}
      <section className="relative overflow-hidden rounded-[4rem] p-10 sm:p-20 group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 animate-gradient-xy opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30">
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Live Frecuency</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter font-heading leading-none">
              SONIDOS DEL <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">ESPÍRITU</span>
            </h2>
            <p className="text-white/70 font-medium max-w-md text-lg italic">
              "Cantad al Señor cántico nuevo..." Elevando la cultura a través de cada beat.
            </p>
          </div>
          
          <button 
            onClick={() => { feedback.playClick(); setShowAddModal(true); }}
            className="group relative p-1 rounded-[2.5rem] bg-white/20 hover:bg-white/40 transition-all active:scale-95"
          >
            <div className="bg-white text-violet-600 px-10 py-6 rounded-[2.2rem] flex items-center gap-4 shadow-2xl">
              <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">Sugerir Playlist</span>
            </div>
          </button>
        </div>
      </section>

      {/* Filter Chips */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => { feedback.playClick(); setActiveFilter(f); }}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
              activeFilter === f 
                ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-500/40' 
                : `${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-violet-50 text-slate-400 hover:border-violet-200'}`
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {state.playlists.map((pl) => (
          <div key={pl.id} className={`group relative rounded-[4rem] p-8 border-2 transition-all hover:-translate-y-3 ${isDarkMode ? 'bg-slate-900 border-white/5 hover:border-violet-500/40' : 'bg-white border-violet-50 shadow-xl shadow-violet-100/30'}`}>
            
            {/* Vinyl Record Visual */}
            <div className="relative aspect-square mb-8 overflow-hidden rounded-[3rem] shadow-2xl">
              <img src={pl.cover} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              {/* Spinning Disc Overlay on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-sm">
                 <div className="relative">
                   <Disc className="w-32 h-32 text-white/20 animate-spin-slow" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white fill-current" />
                   </div>
                 </div>
              </div>

              <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center">
                 <div className="flex gap-2">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                      <Headphones className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                      <Mic2 className="w-4 h-4 text-white" />
                    </div>
                 </div>
                 <span className="text-[9px] font-black text-white uppercase tracking-widest bg-violet-600 px-3 py-1 rounded-full">Ignite Choice</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2 group-hover:text-violet-500 transition-colors">{pl.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Curado por <span className="text-fuchsia-500">{pl.creator}</span></p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full">
                   <Heart className="w-3 h-3 fill-current" />
                   <span className="text-[9px] font-black">{pl.likes}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {pl.spotifyLink && (
                  <a href={pl.spotifyLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#1DB954] text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                    Spotify
                  </a>
                )}
                {pl.ytMusicLink && (
                  <a href={pl.ytMusicLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-rose-600 text-white py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-rose-500/20">
                    YouTube
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => shareContent(pl.title, `Escucha esta playlist en Ignite`)} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${isDarkMode ? 'border-white/5 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-100 text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}>
                  <Share2 className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Compartir</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Playlist Modal - Designer Look */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className={`w-full max-w-xl rounded-[5rem] overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-500 glass ${isDarkMode ? 'border-white/10' : 'border-white'}`}>
            
            <div className="relative h-48 bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="relative z-10 text-center space-y-2">
                <Disc className="w-16 h-16 text-white mx-auto animate-spin-slow" />
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Lanzar Playlist</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-12 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 ml-4">Título del Album</label>
                  <div className="relative">
                    <input 
                      value={newPlaylist.title} 
                      onChange={e => setNewPlaylist({...newPlaylist, title: e.target.value})}
                      placeholder="Ej: Trueno Celestial" 
                      className={`w-full px-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-sm transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-violet-500 shadow-inner' : 'bg-slate-50 border-transparent focus:bg-white focus:border-violet-500'}`}
                    />
                    <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 ml-4">Curador / Artista</label>
                  <input 
                    value={newPlaylist.creator} 
                    onChange={e => setNewPlaylist({...newPlaylist, creator: e.target.value})}
                    placeholder="Tu nombre" 
                    className={`w-full px-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-sm transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-violet-500 shadow-inner' : 'bg-slate-50 border-transparent focus:bg-white focus:border-violet-500'}`}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center text-slate-400">Canales de Distribución</p>
                <div className="space-y-4">
                   <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-current" />
                     </div>
                     <input 
                      value={newPlaylist.spotifyLink} 
                      onChange={e => setNewPlaylist({...newPlaylist, spotifyLink: e.target.value})}
                      placeholder="Link de Spotify" 
                      className={`w-full pl-16 pr-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-[11px] transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-[#1DB954]' : 'bg-slate-50 border-transparent focus:bg-white focus:border-[#1DB954]'}`}
                    />
                   </div>
                   <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
                        <Youtube className="w-4 h-4 text-white" />
                     </div>
                     <input 
                      value={newPlaylist.ytMusicLink} 
                      onChange={e => setNewPlaylist({...newPlaylist, ytMusicLink: e.target.value})}
                      placeholder="Link de YouTube Music" 
                      className={`w-full pl-16 pr-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-[11px] transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-rose-600' : 'bg-slate-50 border-transparent focus:bg-white focus:border-rose-600'}`}
                    />
                   </div>
                </div>
              </div>

              <button 
                onClick={handleSavePlaylist}
                className="w-full py-6 rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-violet-500/40 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Publicar en el Muro <Flame className="w-5 h-5 group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsView;
