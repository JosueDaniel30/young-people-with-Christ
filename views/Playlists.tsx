
import React, { useState } from 'react';
import { Music, Plus, Heart, Share2, Play, ExternalLink, X, Link as LinkIcon, Save } from 'lucide-react';
import { loadDB, addPlaylist } from '../store/db';
import { Playlist } from '../types';

const PlaylistsView: React.FC = () => {
  const [state, setState] = useState(loadDB());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    creator: '',
    spotifyLink: '',
    ytMusicLink: ''
  });

  const isDarkMode = state.user.theme === 'dark';

  const handleSavePlaylist = () => {
    if (!newPlaylist.title || !newPlaylist.creator) return;
    
    const playlist: Playlist = {
      id: Date.now().toString(),
      title: newPlaylist.title,
      creator: newPlaylist.creator,
      spotifyLink: newPlaylist.spotifyLink,
      ytMusicLink: newPlaylist.ytMusicLink,
      likes: 0,
      cover: `https://picsum.photos/seed/${Date.now()}/400/400`
    };

    addPlaylist(playlist);
    setState(loadDB());
    setShowAddModal(false);
    setNewPlaylist({ title: '', creator: '', spotifyLink: '', ytMusicLink: '' });
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-in slide-in-from-left duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Música y Fe</h2>
          <p className="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-widest mt-1">Comparte y descubre adoración</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#B91C1C] text-white p-4 rounded-2xl shadow-xl hover:scale-110 hover:rotate-3 transition-all active:scale-95 flex items-center gap-2 group"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden sm:inline font-black text-xs uppercase tracking-widest">Integrar Lista</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.playlists.map((pl) => (
          <div key={pl.id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border rounded-[40px] p-6 flex flex-col gap-6 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
            
            <div className="flex gap-5 items-center relative z-10">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src={pl.cover || `https://picsum.photos/seed/${pl.id}/300/300`} 
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play className="w-10 h-10 text-white fill-current drop-shadow-lg" />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Playlist</span>
                <h3 className={`font-black text-lg sm:text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'} uppercase tracking-tight leading-none mb-2`}>{pl.title}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Por {pl.creator}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex gap-3">
                {pl.spotifyLink && (
                  <a 
                    href={pl.spotifyLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1DB954] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 hover:-translate-y-1 transition-all active:scale-95 shadow-lg shadow-green-900/10"
                  >
                    Spotify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {pl.ytMusicLink && (
                  <a 
                    href={pl.ytMusicLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FF0000] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 hover:-translate-y-1 transition-all active:scale-95 shadow-lg shadow-red-900/10"
                  >
                    YouTube
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-5">
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors group">
                    <Heart className={`w-4 h-4 ${pl.likes > 10 ? 'fill-red-500 text-red-500' : ''}`} />
                    {pl.likes}
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                </div>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Playlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} w-full max-w-lg rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Integrar Playlist</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Spotify o YouTube Music</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full hover:rotate-90 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">Título de la Playlist</label>
                  <input 
                    type="text"
                    value={newPlaylist.title}
                    onChange={e => setNewPlaylist({...newPlaylist, title: e.target.value})}
                    placeholder="Ej: Alabanza de Domingo"
                    className={`w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">Creador / Tu Nombre</label>
                  <input 
                    type="text"
                    value={newPlaylist.creator}
                    onChange={e => setNewPlaylist({...newPlaylist, creator: e.target.value})}
                    placeholder="Tu nombre o ministerio"
                    className={`w-full px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">Link Spotify</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      <input 
                        type="text"
                        value={newPlaylist.spotifyLink}
                        onChange={e => setNewPlaylist({...newPlaylist, spotifyLink: e.target.value})}
                        placeholder="https://..."
                        className={`w-full pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">Link YT Music</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                      <input 
                        type="text"
                        value={newPlaylist.ytMusicLink}
                        onChange={e => setNewPlaylist({...newPlaylist, ytMusicLink: e.target.value})}
                        placeholder="https://..."
                        className={`w-full pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-xs ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSavePlaylist}
                className="w-full bg-[#1A3A63] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#B91C1C] transition-all shadow-xl active:scale-95"
              >
                <Save className="w-5 h-5" />
                Guardar Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      <section className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-900'} rounded-[48px] p-10 text-white overflow-hidden relative shadow-2xl mt-12`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="bg-[#B91C1C] text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] mb-6 inline-block">Destacado</span>
            <h3 className="text-3xl sm:text-4xl font-black mb-3 uppercase tracking-tight leading-tight">Podcast: Jóvenes con Cristo</h3>
            <p className="text-slate-400 text-base font-medium leading-relaxed">
              Descubre nuevos episodios cada viernes sobre desafíos modernos y fe inquebrantable.
            </p>
          </div>
          <div className="flex gap-4">
             <button className="bg-white text-slate-900 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">
               Spotify
             </button>
             <button className="bg-red-600 text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">
               YouTube
             </button>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 p-8 opacity-5 pointer-events-none transform rotate-12">
          <Music className="w-64 h-64" />
        </div>
      </section>
    </div>
  );
};

export default PlaylistsView;
