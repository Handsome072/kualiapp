'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell, Plus, Trash2, X, AlertCircle,
  CheckCircle, Loader2, Rss, Settings
} from 'lucide-react';
import { VeilleRule, VeilleKeyword, VeilleRuleExpression, VeilleSensitivity } from '../../types';
import * as veilleService from '../../services/veilleService';
import { getCurrentUser } from '../../services/auth';

interface VeilleSettingsProps {
  onClose?: () => void;
}

export const VeilleSettings: React.FC<VeilleSettingsProps> = ({ onClose }) => {
  const [rules, setRules] = useState<VeilleRule[]>([]);
  const [keywords, setKeywords] = useState<VeilleKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulaire nouvelle règle
  const [showNewRule, setShowNewRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTerms, setNewRuleTerms] = useState('');
  const [newRuleOperator, setNewRuleOperator] = useState<'AND' | 'OR'>('OR');
  const [newRuleEmail, setNewRuleEmail] = useState('');

  // Formulaire nouveau mot-clé
  const [showNewKeyword, setShowNewKeyword] = useState(false);
  const [newKeywordLabel, setNewKeywordLabel] = useState('');
  const [newKeywordSensitivity, setNewKeywordSensitivity] = useState<VeilleSensitivity>('normal');

  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [rulesData, keywordsData] = await Promise.all([
        veilleService.getRules(user.id),
        veilleService.getKeywords(user.id)
      ]);
      setRules(rulesData);
      setKeywords(keywordsData);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!user || !newRuleName.trim() || !newRuleTerms.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const expression: VeilleRuleExpression = {
        operator: newRuleOperator,
        terms: newRuleTerms.split(',').map(t => t.trim()).filter(Boolean)
      };
      await veilleService.createRule(user.id, newRuleName, expression, newRuleEmail || undefined);
      setSuccess('Règle créée avec succès');
      setShowNewRule(false);
      setNewRuleName('');
      setNewRuleTerms('');
      setNewRuleEmail('');
      loadData();
    } catch (err) {
      setError('Erreur lors de la création de la règle');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Supprimer cette règle ?')) return;
    try {
      await veilleService.deleteRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
      setSuccess('Règle supprimée');
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleToggleRule = async (rule: VeilleRule) => {
    try {
      await veilleService.updateRule(rule.id, { active: !rule.active });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleCreateKeyword = async () => {
    if (!user || !newKeywordLabel.trim()) return;
    setSaving(true);
    try {
      await veilleService.createKeyword(user.id, newKeywordLabel, newKeywordSensitivity);
      setSuccess('Mot-clé ajouté');
      setShowNewKeyword(false);
      setNewKeywordLabel('');
      loadData();
    } catch (err) {
      setError('Erreur lors de l\'ajout du mot-clé');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      await veilleService.deleteKeyword(id);
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto text-orange-500" size={32} />
        <p className="text-slate-500 mt-2">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings size={24} /> Paramètres de Veille
          </h2>
          <p className="text-slate-500 text-sm">Configurez vos alertes et mots-clés</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle size={20} /> {success}
        </div>
      )}

      {/* Section Règles d'alertes */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Bell size={18} /> Règles d'alertes
          </h3>
          <button
            onClick={() => setShowNewRule(!showNewRule)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
          >
            <Plus size={16} /> Nouvelle règle
          </button>
        </div>

        {/* Formulaire nouvelle règle */}
        {showNewRule && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl space-y-3">
            <input
              type="text"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              placeholder="Nom de la règle"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
            <input
              type="text"
              value={newRuleTerms}
              onChange={(e) => setNewRuleTerms(e.target.value)}
              placeholder="Mots-clés (séparés par virgule)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
            <div className="flex gap-3">
              <select
                value={newRuleOperator}
                onChange={(e) => setNewRuleOperator(e.target.value as 'AND' | 'OR')}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                <option value="OR">OU (un des termes)</option>
                <option value="AND">ET (tous les termes)</option>
              </select>
              <input
                type="email"
                value={newRuleEmail}
                onChange={(e) => setNewRuleEmail(e.target.value)}
                placeholder="Email pour alertes (optionnel)"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewRule(false)} className="px-4 py-2 text-slate-600 text-sm font-bold">
                Annuler
              </button>
              <button
                onClick={handleCreateRule}
                disabled={saving || !newRuleName.trim() || !newRuleTerms.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Créer'}
              </button>
            </div>
          </div>
        )}

        {/* Liste des règles */}
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Aucune règle configurée</p>
          ) : (
            rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`w-10 h-6 rounded-full transition-colors ${rule.active ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{rule.name}</p>
                    <p className="text-xs text-slate-500">
                      {rule.expression_json.operator}: {rule.expression_json.terms.join(', ')}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section Mots-clés */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Rss size={18} /> Mots-clés suivis
          </h3>
          <button
            onClick={() => setShowNewKeyword(!showNewKeyword)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>

        {/* Formulaire nouveau mot-clé */}
        {showNewKeyword && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl flex gap-3">
            <input
              type="text"
              value={newKeywordLabel}
              onChange={(e) => setNewKeywordLabel(e.target.value)}
              placeholder="Mot-clé"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
            <select
              value={newKeywordSensitivity}
              onChange={(e) => setNewKeywordSensitivity(e.target.value as VeilleSensitivity)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="low">Faible</option>
              <option value="normal">Normal</option>
              <option value="high">Élevée</option>
              <option value="critical">Critique</option>
            </select>
            <button
              onClick={handleCreateKeyword}
              disabled={saving || !newKeywordLabel.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        )}

        {/* Liste des mots-clés */}
        <div className="flex flex-wrap gap-2">
          {keywords.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center w-full">Aucun mot-clé configuré</p>
          ) : (
            keywords.map(keyword => (
              <span
                key={keyword.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                  keyword.sensitivity === 'critical' ? 'bg-red-100 text-red-700' :
                  keyword.sensitivity === 'high' ? 'bg-orange-100 text-orange-700' :
                  keyword.sensitivity === 'normal' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}
              >
                {keyword.label}
                <button onClick={() => handleDeleteKeyword(keyword.id)} className="hover:text-red-600">
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

