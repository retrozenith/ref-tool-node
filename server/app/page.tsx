"use client";
import React, { useState } from 'react';
import { FileText, Calendar, Clock, Users, Trophy, MapPin, User, Download, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [form, setForm] = useState({
    referee_name_1: "",
    referee_name_2: "",
    match_date: "",
    starting_hour: "",
    team_1: "",
    team_2: "",
    competition: "",
    assistant_referee_1: "",
    assistant_referee_2: "",
    fourth_official: "",
    age_category: "",
    stadium_name: "",
    stadium_locality: "",
  });

  // Field visibility and required logic
  const age = form.age_category;
  const isU9 = age === "U9";
  const isU11 = age === "U11";
  const isU13 = age === "U13";
  const isU15 = age === "U15";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        const blob = await response.blob();
        
        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = "referee_report.pdf"; // fallback
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, ''); // Remove quotes
          }
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const err = await response.json();
        setError(err.detail || "Error generating report");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-lg shadow-sm mb-4">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Generator Raport de Arbitraj
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Sistem profesional pentru generarea rapoartelor de arbitraj în format PDF
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            
            {/* Basic Information Section */}
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Informații de bază</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referee Name 1 */}
                <div className="space-y-2">
                  <label htmlFor="referee_name_1" className="block text-sm font-medium text-gray-700">
                    Nume Arbitru Principal *
                  </label>
                  <input
                    id="referee_name_1"
                    name="referee_name_1"
                    type="text"
                    value={form.referee_name_1}
                    onChange={handleChange}
                    required
                    placeholder="Introduceți numele arbitrului principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Referee Name 2 - U11/U13 only */}
                {(isU11 || isU13) && (
                  <div className="space-y-2">
                    <label htmlFor="referee_name_2" className="block text-sm font-medium text-gray-700">
                      Nume Arbitru Secundar *
                    </label>
                    <input
                      id="referee_name_2"
                      name="referee_name_2"
                      type="text"
                      value={form.referee_name_2}
                      onChange={handleChange}
                      required
                      placeholder="Introduceți numele arbitrului secundar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                    />
                  </div>
                )}

                {/* Age Category */}
                <div className="space-y-2">
                  <label htmlFor="age_category" className="block text-sm font-medium text-gray-700">
                    Categorie de Vârstă *
                  </label>
                  <select
                    id="age_category"
                    name="age_category"
                    value={form.age_category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 bg-white"
                  >
                    <option value="">Selectați categoria de vârstă</option>
                    <option value="U9">U9 - Sub 9 ani</option>
                    <option value="U11">U11 - Sub 11 ani</option>
                    <option value="U13">U13 - Sub 13 ani</option>
                    <option value="U15">U15+ - Sub 15 ani și peste</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Match Information Section */}
            <div className="p-6 bg-gray-50 space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded">
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Informații meci</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Match Date */}
                <div className="space-y-2">
                  <label htmlFor="match_date" className="block text-sm font-medium text-gray-700">
                    Data Meciului *
                  </label>
                  <input
                    id="match_date"
                    name="match_date"
                    type="date"
                    value={form.match_date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900"
                  />
                </div>

                {/* Starting Hour */}
                <div className="space-y-2">
                  <label htmlFor="starting_hour" className="block text-sm font-medium text-gray-700">
                    Ora de Începere *
                  </label>
                  <input
                    id="starting_hour"
                    name="starting_hour"
                    type="time"
                    value={form.starting_hour}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900"
                  />
                </div>

                {/* Team 1 */}
                <div className="space-y-2">
                  <label htmlFor="team_1" className="block text-sm font-medium text-gray-700">
                    Echipa Gazdă *
                  </label>
                  <input
                    id="team_1"
                    name="team_1"
                    type="text"
                    value={form.team_1}
                    onChange={handleChange}
                    required
                    placeholder="Introduceți numele echipei gazdă"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Team 2 */}
                <div className="space-y-2">
                  <label htmlFor="team_2" className="block text-sm font-medium text-gray-700">
                    Echipa Oaspete *
                  </label>
                  <input
                    id="team_2"
                    name="team_2"
                    type="text"
                    value={form.team_2}
                    onChange={handleChange}
                    required
                    placeholder="Introduceți numele echipei oaspete"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* U15+ Additional Information */}
            {isU15 && (
              <div className="p-6 bg-slate-50 space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded">
                    <Trophy className="w-4 h-4 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Informații suplimentare (U15+)</h2>
                </div>

                <div className="space-y-6">
                  {/* Competition */}
                  <div className="space-y-2">
                    <label htmlFor="competition" className="block text-sm font-medium text-gray-700">
                      Competiție
                    </label>
                    <input
                      id="competition"
                      name="competition"
                      type="text"
                      value={form.competition}
                      onChange={handleChange}
                      placeholder="Introduceți numele competiției"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Assistant Referees */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="assistant_referee_1" className="block text-sm font-medium text-gray-700">
                        Arbitru Asistent 1
                      </label>
                      <input
                        id="assistant_referee_1"
                        name="assistant_referee_1"
                        type="text"
                        value={form.assistant_referee_1}
                        onChange={handleChange}
                        placeholder="Numele arbitrului asistent 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="assistant_referee_2" className="block text-sm font-medium text-gray-700">
                        Arbitru Asistent 2
                      </label>
                      <input
                        id="assistant_referee_2"
                        name="assistant_referee_2"
                        type="text"
                        value={form.assistant_referee_2}
                        onChange={handleChange}
                        placeholder="Numele arbitrului asistent 2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Fourth Official */}
                  <div className="space-y-2">
                    <label htmlFor="fourth_official" className="block text-sm font-medium text-gray-700">
                      Al 4-lea Oficial
                    </label>
                    <input
                      id="fourth_official"
                      name="fourth_official"
                      type="text"
                      value={form.fourth_official}
                      onChange={handleChange}
                      placeholder="Numele celui de-al 4-lea oficial"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Stadium Information */}
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <h3 className="flex items-center text-base font-medium text-gray-900 mb-4">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                      Informații stadion
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="stadium_name" className="text-sm font-medium text-gray-700">
                          Nume Stadion
                        </label>
                        <input
                          id="stadium_name"
                          name="stadium_name"
                          type="text"
                          value={form.stadium_name}
                          onChange={handleChange}
                          placeholder="Numele stadionului"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stadium_locality" className="text-sm font-medium text-gray-700">
                          Localitatea Stadionului
                        </label>
                        <input
                          id="stadium_locality"
                          name="stadium_locality"
                          type="text"
                          value={form.stadium_locality}
                          onChange={handleChange}
                          placeholder="Localitatea stadionului"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Eroare</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-slate-500 focus:outline-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Se generează raportul...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-3" />
                      Generează Raport PDF
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Documentul va fi generat și descărcat automat în format PDF
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Acest instrument a fost realizat de Cristea Florian Victor pentru fiecare arbitru AJF Ilfov. Verificați mereu corectitudinea rapoartelor generate de acest program web.
          </p>
        </div>
      </div>
    </div>
  );
}