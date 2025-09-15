"use client";

import { useState } from "react";

export default function Home() {
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

  // Always visible fields: referee_name_1, match_date, starting_hour, team_1, team_2, age_category
  // U11/U13: show referee_name_2 (required)
  // U15: show competition, assistant_referee_1, assistant_referee_2, fourth_official, stadium fields (all optional)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Generator Raport de Arbitraj</h1>
            <p className="text-gray-600">Completați formularul pentru a genera raportul de arbitraj în format PDF</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Always visible fields */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Informații de bază</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="referee_name_1">
                    Nume Arbitru 1 *
                  </label>
                  <input
                    id="referee_name_1"
                    name="referee_name_1"
                    value={form.referee_name_1}
                    onChange={handleChange}
                    required
                    placeholder="Introduceți numele arbitrului"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                {/* U11/U13 only: Nume Arbitru 2 */}
                {(isU11 || isU13) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="referee_name_2">
                      Nume Arbitru 2 *
                    </label>
                    <input
                      id="referee_name_2"
                      name="referee_name_2"
                      value={form.referee_name_2}
                      onChange={handleChange}
                      required
                      placeholder="Introduceți numele arbitrului"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="match_date">
                    Data Meciului *
                  </label>
                  <input
                    id="match_date"
                    name="match_date"
                    type="date"
                    value={form.match_date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="starting_hour">
                    Ora de Începere *
                  </label>
                  <input
                    id="starting_hour"
                    name="starting_hour"
                    value={form.starting_hour}
                    onChange={handleChange}
                    required
                    placeholder="HH:MM"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="team_1">
                    Echipa Gazdă *
                  </label>
                  <input
                    id="team_1"
                    name="team_1"
                    value={form.team_1}
                    onChange={handleChange}
                    required
                    placeholder="Introduceți numele primei echipe"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="team_2">
                    Echipa Oaspete *
                  </label>
                  <input
                    id="team_2"
                    name="team_2"
                    value={form.team_2}
                    onChange={handleChange}
                    required
                    placeholder="Introduceți numele celei de-a doua echipe"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="age_category">
                  Categorie de Vârstă *
                </label>
                <select
                  id="age_category"
                  name="age_category"
                  value={form.age_category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Selectați categoria</option>
                  <option value="U9">U9</option>
                  <option value="U11">U11</option>
                  <option value="U13">U13</option>
                  <option value="U15">U15+</option>
                </select>
              </div>
            </div>
            
            {/* U15+ only: show all extra fields, all optional */}
            {isU15 && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Informații suplimentare (U15+)</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="competition">
                      Competiție
                    </label>
                    <input
                      id="competition"
                      name="competition"
                      value={form.competition}
                      onChange={handleChange}
                      placeholder="Introduceți numele competiției"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="assistant_referee_1">
                        Arbitru Asistent 1
                      </label>
                      <input
                        id="assistant_referee_1"
                        name="assistant_referee_1"
                        value={form.assistant_referee_1}
                        onChange={handleChange}
                        placeholder="Introduceți numele arbitrului asistent 1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="assistant_referee_2">
                        Arbitru Asistent 2
                      </label>
                      <input
                        id="assistant_referee_2"
                        name="assistant_referee_2"
                        value={form.assistant_referee_2}
                        onChange={handleChange}
                        placeholder="Introduceți numele arbitrului asistent 2"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fourth_official">
                      Al 4-lea Oficial
                    </label>
                    <input
                      id="fourth_official"
                      name="fourth_official"
                      value={form.fourth_official}
                      onChange={handleChange}
                      placeholder="Introduceți numele celui de-al 4-lea oficial"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Informații stadion</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="stadium_name">
                          Nume Stadion
                        </label>
                        <input
                          id="stadium_name"
                          name="stadium_name"
                          value={form.stadium_name}
                          onChange={handleChange}
                          placeholder="Introduceți numele stadionului"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="stadium_locality">
                          Localitatea Stadionului
                        </label>
                        <input
                          id="stadium_locality"
                          name="stadium_locality"
                          value={form.stadium_locality}
                          onChange={handleChange}
                          placeholder="Introduceți localitatea stadionului"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="text-red-800">
                    <strong>Eroare:</strong> {error}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Se generează...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Generează PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
