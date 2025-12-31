'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Bookmark, BookmarkCheck, ExternalLink,
  Scale, GraduationCap, Briefcase, Zap, AlertTriangle,
  Info, Loader2, RefreshCw, Download, Bell,
  ChevronLeft, ChevronRight, Rss
} from 'lucide-react';
import {
  VeilleItem, VeilleSource, VeilleFilters, VeilleStats, VeilleTheme, VeilleSeverity
} from './types';
import * as veilleService from './services/veilleService';
import { getCurrentUser } from './services/auth';

// Constantes
const ITEMS_PER_PAGE = 20;

const THEMES: { id: VeilleTheme; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'legal', label: 'Légale & Réglementaire', icon: <Scale size={18} />, color: 'bg-blue-600' },
  { id: 'pedagogique', label: 'Pédagogique', icon: <GraduationCap size={18} />, color: 'bg-purple-600' },
  { id: 'competences', label: 'Compétences & Métiers', icon: <Briefcase size={18} />, color: 'bg-emerald-600' },
  { id: 'reglementaire', label: 'Réglementaire', icon: <Rss size={18} />, color: 'bg-amber-600' },
];

// Composant Badge de sévérité
const SeverityBadge: React.FC<{ severity?: VeilleSeverity }> = ({ severity = 'info' }) => {
  const config: Record<VeilleSeverity, { bg: string; icon: React.ReactNode }> = {
    critique: { bg: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle size={12} /> },
    alerte: { bg: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Zap size={12} /> },
    info: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Info size={12} /> }
  };
  const c = config[severity] || config.info;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${c.bg}`}>
      {c.icon} {severity}
    </span>
  );
};

// Composant Stats Card
const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className={`${color} rounded-2xl p-4 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider opacity-80">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <div className="opacity-50">{icon}</div>
    </div>
  </div>
);

export const VeillePage: React.FC = () => {
  // État
  const [items, setItems] = useState<VeilleItem[]>([]);
  const [sources, setSources] = useState<VeilleSource[]>([]);
  const [stats, setStats] = useState<VeilleStats | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<VeilleTheme | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Mémoïser l'utilisateur pour éviter les re-renders
  const [user] = useState(() => getCurrentUser());

  // Chargement initial des données (sources, stats, savedIds)
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted) return;
      setLoading(true);

      try {
        const [sourcesData, statsData] = await Promise.all([
          veilleService.getSources(),
          user ? veilleService.getStats(user.id) : Promise.resolve(null)
        ]);

        if (!mounted) return;
        setSources(sourcesData);
        setStats(statsData);

        if (user) {
          const saved = await veilleService.getSavedItemIds(user.id);
          if (mounted) setSavedIds(saved);
        }

        if (mounted) setDataLoaded(true);
      } catch (err) {
        console.error('Erreur chargement veille:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInitialData();
    return () => { mounted = false; };
  }, [user]);

  // Chargement des items (séparé pour éviter la boucle)
  useEffect(() => {
    if (!dataLoaded) return;

    let mounted = true;

    const loadItems = async () => {
      if (!mounted) return;

      try {
        const filters: VeilleFilters = {};
        if (selectedTheme) filters.theme = selectedTheme;
        if (selectedSource) filters.source_id = selectedSource;

        const { items: data, total: count } = await veilleService.getItems(
          filters,
          ITEMS_PER_PAGE,
          page * ITEMS_PER_PAGE
        );

        if (!mounted) return;

        // Enrichir avec les infos de sauvegarde
        const enriched = data.map(item => ({
          ...item,
          is_saved: savedIds.includes(item.id)
        }));

        setItems(enriched);
        setTotal(count);
      } catch (err) {
        console.error('Erreur chargement items:', err);
      }
    };

    loadItems();
    return () => { mounted = false; };
  }, [dataLoaded, selectedTheme, selectedSource, page]); // Note: savedIds retiré pour éviter la boucle

  // Mettre à jour is_saved quand savedIds change (sans recharger les items)
  useEffect(() => {
    setItems(prev => prev.map(item => ({
      ...item,
      is_saved: savedIds.includes(item.id)
    })));
  }, [savedIds]);

  // Actions
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Réinitialiser - forcer un rechargement en changeant la page
      setPage(0);
      setDataLoaded(false);
      setTimeout(() => setDataLoaded(true), 0);
      return;
    }
    setIsSearching(true);
    try {
      const results = await veilleService.searchItems(searchQuery, ITEMS_PER_PAGE);
      setItems(results.map(item => ({ ...item, is_saved: savedIds.includes(item.id) })));
      setTotal(results.length);
    } catch (err) {
      console.error('Erreur recherche:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSave = async (itemId: string) => {
    if (!user) return;
    try {
      if (savedIds.includes(itemId)) {
        await veilleService.unsaveItem(user.id, itemId);
        setSavedIds(prev => prev.filter(id => id !== itemId));
      } else {
        await veilleService.saveItem(user.id, itemId);
        setSavedIds(prev => [...prev, itemId]);
      }
      // Mise à jour locale gérée par le useEffect sur savedIds
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    }
  };

  const handleExport = () => {
    const csv = veilleService.exportItemsToCSV(items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `veille-qualiopi-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleRefresh = () => {
    // Forcer le rechargement complet
    setDataLoaded(false);
    setLoading(true);

    // Recharger tout après un court délai
    setTimeout(async () => {
      try {
        const [sourcesData, statsData] = await Promise.all([
          veilleService.getSources(),
          user ? veilleService.getStats(user.id) : Promise.resolve(null)
        ]);
        setSources(sourcesData);
        setStats(statsData);

        if (user) {
          const saved = await veilleService.getSavedItemIds(user.id);
          setSavedIds(saved);
        }

        setDataLoaded(true);
      } catch (err) {
        console.error('Erreur refresh veille:', err);
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  // Filtrage des items sauvegardés
  const displayedItems = showSaved ? items.filter(i => savedIds.includes(i.id)) : items;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-orange-500 mb-4" size={48} />
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Chargement de la veille...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded">
              Veille Formation
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Votre <span className="text-orange-500">Veille</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">
            Indicateurs 23, 24, 25, 26 • Actualités Qualiopi en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-all" title="Actualiser">
            <RefreshCw size={18} />
          </button>
          <button onClick={handleExport} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-all" title="Exporter CSV">
            <Download size={18} />
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Articles cette semaine" value={stats.items_this_week} icon={<Rss size={24} />} color="bg-blue-600" />
          <StatCard label="Alertes non lues" value={stats.unread_alerts} icon={<Bell size={24} />} color="bg-orange-500" />
          <StatCard label="Sauvegardés" value={stats.saved_count} icon={<Bookmark size={24} />} color="bg-purple-600" />
          <StatCard label="Sources actives" value={stats.sources_active} icon={<Zap size={24} />} color="bg-emerald-600" />
        </div>
      )}

      {/* Theme Selector */}
      <div className="flex flex-wrap gap-3">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => { setSelectedTheme(selectedTheme === theme.id ? null : theme.id); setPage(0); }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              selectedTheme === theme.id
                ? `${theme.color} text-white shadow-lg scale-105`
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {theme.icon} {theme.label}
          </button>
        ))}
        {/* Source filter dropdown */}
        {sources.length > 0 && (
          <select
            value={selectedSource || ''}
            onChange={(e) => { setSelectedSource(e.target.value || null); setPage(0); }}
            className="px-4 py-3 rounded-2xl font-bold text-sm bg-white text-slate-600 border border-slate-200 focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Toutes les sources</option>
            {sources.filter(s => s.active).map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Recherche (ex: 'Qualiopi 2025', 'Réforme apprentissage', 'RNCP')"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-0 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Toggle Saved / All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSaved(false)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${!showSaved ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Fil d'actualité ({total})
          </button>
          <button
            onClick={() => setShowSaved(true)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${showSaved ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <BookmarkCheck size={16} /> Ma Sélection ({savedIds.length})
          </button>
        </div>
        {/* Pagination */}
        {totalPages > 1 && !showSaved && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-slate-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center">
            {showSaved ? (
              <>
                <BookmarkCheck className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 font-medium">Aucun article sauvegardé</p>
                <p className="text-slate-400 text-sm mt-1">Cliquez sur l'icône marque-page pour sauvegarder des articles</p>
              </>
            ) : (
              <>
                <Rss className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 font-medium">Aucun article disponible</p>
                <p className="text-slate-400 text-sm mt-1">Les sources seront bientôt synchronisées</p>
              </>
            )}
          </div>
        ) : (
          displayedItems.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <SeverityBadge severity={item.severity} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {item.source_name || 'Source inconnue'} • {item.published_at ? new Date(item.published_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                  {item.summary && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-3">{item.summary}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleSave(item.id)}
                    className={`p-3 rounded-xl transition-all ${savedIds.includes(item.id) ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    title={savedIds.includes(item.id) ? 'Retirer de la sélection' : 'Sauvegarder'}
                  >
                    {savedIds.includes(item.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                      title="Ouvrir l'article"
                    >
                      <ExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
