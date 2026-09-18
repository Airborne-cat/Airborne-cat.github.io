---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 1
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 6
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 2
---

<div class="post">
  <div class="header-bar">
    <h1>{{ site.blog_name }}</h1>
    <h2>{{ site.blog_description }}</h2>
  </div>

  {% assign postlist = paginator.posts | default: site.posts %}

  <div class="row row-cols-1 row-cols-md-2 g-4 mt-3">
    {% for post in postlist %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      <div class="col mb-4">
        <a href="{{ post.url | relative_url }}" class="text-decoration-none">
          <div class="card hoverable h-100">
            {% if post.thumbnail %}
              <img class="card-img-top" src="{{ post.thumbnail | relative_url }}" alt="{{ post.title }} thumbnail">
            {% endif %}
            <div class="card-body">
              <h3 class="card-title">{{ post.title }}</h3>
              {% if post.description %}
                <p class="card-text">{{ post.description }}</p>
              {% else %}
                <p class="card-text">{{ post.excerpt | strip_html | truncate: 140 }}</p>
              {% endif %}
              <p class="post-meta mb-0">{{ post.date | date: '%Y.%m.%d' }} · {{ read_time }} min read</p>
            </div>
          </div>
        </a>
      </div>
    {% endfor %}
  </div>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}
</div>
