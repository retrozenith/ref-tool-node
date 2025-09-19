"use client";
import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export function GitHubLink() {
  return (
    <div className="text-center mt-8 pt-6 border-t border-border">
      <a
        href="https://github.com/retrozenith/ref-tool-node"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
      >
        <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        <span className="text-sm font-medium">Vezi codul sursă</span>
        <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
      </a>
      <p className="text-xs text-muted-foreground mt-2">
        Open source
      </p>
    </div>
  );
}