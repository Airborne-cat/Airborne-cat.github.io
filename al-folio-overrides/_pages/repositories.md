---
layout: page
permalink: /repositories/
title: repositories
description: Airborne-cat의 공개 GitHub 저장소입니다.
nav: true
nav_order: 4
---

<div class="repo-grid">
  {% for repo in site.data.repositories.github_repos %}
    {% assign repo_name = repo | split: '/' | last %}
    <a class="repo-link-card" href="https://github.com/{{ repo }}" target="_blank" rel="noopener noreferrer">
      <div class="repo-card-head">
        <i class="fa-brands fa-github"></i>
        <span class="repo-card-name">{{ repo_name }}</span>
      </div>
      <div class="repo-card-path">{{ repo }}</div>
      <div class="repo-card-cta">GitHub에서 보기 →</div>
    </a>
  {% endfor %}
</div>

<style>
.repo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.repo-link-card {
  display: block;
  padding: 1.15rem 1.2rem;
  border: 1px solid var(--global-divider-color);
  border-radius: 0.75rem;
  color: var(--global-text-color);
  text-decoration: none !important;
  background: var(--global-bg-color);
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.repo-link-card:hover {
  transform: translateY(-2px);
  border-color: var(--global-theme-color);
  box-shadow: 0 0.5rem 1.25rem rgba(0, 0, 0, 0.08);
}

.repo-card-head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 1.05rem;
  font-weight: 600;
}

.repo-card-path {
  margin-top: 0.55rem;
  font-size: 0.9rem;
  color: var(--global-text-color-light);
  overflow-wrap: anywhere;
}

.repo-card-cta {
  margin-top: 1rem;
  color: var(--global-theme-color);
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 767px) {
  .repo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
