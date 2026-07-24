---
title: "Topcoat"
description: "Новый fullstack web framework на rust"
date: 2026-07-24
tags: [ "code", "rust", "web" ]
---

## Очень любопытно

Мне очень нравится писать REST API на `rust` с использованием `axum`, мне очень нравится писать фронтенд с
использованием `HTMX`.

И тут натыкаюсь на такой эксперимент, причем от создателей `tokio` и `axum`, который использует концепцию `HTMX`, а
точнее `hypermedia`, отрисовка компонентов на сервере и отдача именно `html` на фронтенд.

[topcoat](https://github.com/tokio-rs/topcoat)

## Пока что эксперимент

Да, сейчас проект на ранней экспериментальной стадии и будет еще много `breaking changes`, но мне кажется - это шаг в
нужную сторону.

Вот пример реактивности на клиенте:

```rust
view! {
    signal open = false;
    
    // Runs entirely in the browser; no server round-trip.
    <button @click=$(|_e| open.set(!open.get()))>"What is Topcoat?"</button>
    <p :hidden=$(!open.get())>"A full-stack Rust framework."</p>
}
```

Или с использованием серверных данных:

```rust
#[component]
async fn search() -> Result {
    view! {
        signal query = String::new();

        <input @input=$(|e: Event| query.set(e.target.value))>

        // Updates as the user types.
        search_results(query: $(query.get()))
    }
}

#[shard]
async fn search_results(cx: &Cx, query: String) -> Result {
    view! {
        <ul>
            // Your own server-side code, like a database query:
            for product in search_products(cx, &query).await? {
                <li>(product.name)</li>
            }
        </ul>
    }
}
```

## Routing

```rust
use topcoat::{
    Result,
    context::CxBuilder,
    router::{Body, Json, Next, Response, Router, Slot, layer, layout, page, route},
    view::view,
};

#[derive(serde::Deserialize, serde::Serialize)]
struct NewUser {
    name: String,
}

#[layout("/")]
async fn root_layout(slot: Slot<'_>) -> Result {
    view! {
        <!DOCTYPE html>
        <html>
            <body>
                <nav>
                    <a href="/">"Home"</a>
                    <a href="/users">"Users"</a>
                </nav>
                (slot.await?)
            </body>
        </html>
    }
}

#[layer("/api")]
async fn api_log(cx: &mut CxBuilder, body: Body, next: Next<'_>) -> Result<Response> {
    let response = next.run(cx, body).await?;
    println!("API response: {}", response.status());
    Ok(response)
}

#[page("/")]
async fn home() -> Result {
    view! { <h1>"Welcome"</h1> }
}

#[page("/users")]
async fn users_list() -> Result {
    view! { <h1>"All users"</h1> }
}

#[page("/users/{id}")]
async fn user_profile() -> Result {
    view! { <h1>"User profile"</h1> }
}

#[route(GET "/api/health")]
async fn health() -> Result<&'static str> {
    Ok("ok")
}

// Reads a JSON request body and echoes it back as a JSON response.
#[route(POST "/api/users")]
async fn create_user(Json(user): Json<NewUser>) -> Result<Json<NewUser>> {
    Ok(Json(user))
}
```

Ручная регистрация:

```rust
pub fn router() -> Router {
    Router::builder()
        .layout(root_layout)
        .layer(api_log)
        .page(home)
        .page(users_list)
        .page(user_profile)
        .route(health)
        .route(create_user)
        .build()
}
```

Или автоматическая:

```rust
use topcoat::router::{Router, RouterBuilderDiscoverExt};

// The page, layout, layer, and route definitions are identical. Only the
// router function changes.
pub fn router() -> Router {
    Router::builder().discover().build()
}
```

## Module-based routing

Вот это вообще интересно.

```rust
// src/app.rs
pub fn router() -> topcoat::router::Router {
    topcoat::router::module_router!().build()
}
```

| Module                 | 	Route            |
|------------------------|-------------------|
| app                    | /                 |
| app::about             | /about            |
| app::blog_posts        | /blog-posts       |
| app::settings          | /settings         |
| app::settings::profile | /settings/profile |

```rust
// src/app.rs: layout at "/" wraps all pages
#[layout]
async fn root_layout(slot: Slot<'_>) -> Result {
    view! {
        <html><body>(slot.await?)</body></html>
    }
}

#[page]
async fn home() -> Result {
    view! { <h1>"Home"</h1> }
}
```

```rust
// src/app/about.rs: page at "/about"
#[page]
async fn about() -> Result {
    view! { <h1>"About"</h1> }
}
```

```rust
// src/app/api/health.rs: GET /api/health
#[route(GET)]
async fn health() -> Result<&'static str> {
    Ok("ok")
}
```

```
app.rs                 # layout at /
app/
  _marketing.rs        # layout wrapping marketing pages (no URL segment)
  _marketing/
    pricing.rs         # /pricing
    features.rs        # /features
  _docs.rs             # layout wrapping docs pages (no URL segment)
  _docs/
    getting_started.rs # /getting-started
```

```
app.rs
app/
  _components.rs       # exports shared components, no route
  _components/
    header.rs
    footer.rs
  about.rs             # /about: can use app::_components::header
  contact.rs           # /contact
```

## Интеграции

Уже есть интеграции со сторонними инструментами:

- `Tailwind CSS`
- `htmx`
- `Alpine AJAX` - в принципе тот же `htmx`

## Итог

Идея - супер. Лишь бы не забросили.
Я знаю, на чем буду писать следующий проект 😊.