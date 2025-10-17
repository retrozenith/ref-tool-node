"use client";
import React, { useState, useRef, useEffect } from 'react';
import { filterTeams } from '@/lib/teams-data';

interface TeamAutocompleteProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  label: string;
}

export function TeamAutocomplete({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  label,
}: TeamAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const teams = filterTeams(value);
      setFilteredTeams(teams.slice(0, 10)); // Limit to 10 suggestions
    } else {
      setFilteredTeams([]);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectTeam = (team: string) => {
    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: {
        name,
        value: team,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredTeams.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredTeams.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredTeams.length) {
          handleSelectTeam(filteredTeams[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (value && filteredTeams.length > 0) {
      setIsOpen(true);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="space-y-2 relative">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background text-foreground placeholder-muted-foreground"
        />
        
        {isOpen && filteredTeams.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredTeams.map((team, index) => (
              <button
                key={team}
                type="button"
                onClick={() => handleSelectTeam(team)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  index === highlightedIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        )}
      </div>
      {value && filteredTeams.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nicio echipă găsită. Puteți introduce un nume personalizat.
        </p>
      )}
    </div>
  );
}
